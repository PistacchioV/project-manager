"""
Project Manager - Inbox de projetos com resumo de e-mails por logica pura.

Rotas de pagina:
    GET  /                          -> redireciona para /dashboard
    GET  /dashboard                 -> painel principal

API (JSON):
    GET  /api/settings                         conexao com o Outlook (segredos mascarados)
    PUT  /api/settings                         salva e-mail do Outlook + credenciais
    POST /api/settings/test                    testa a conexao (com o que esta no formulario)
    GET  /api/projects                         lista projetos
    POST /api/projects                         cria projeto {name, description, outlook_folder_or_tag}
    GET  /api/projects/<id>/dashboard?days=30  KPIs, series, remetentes, alertas, palavras-chave
    GET  /api/projects/<id>/emails             e-mails processados (resumo + original)
    POST /api/projects/<id>/sync               busca no Outlook e processa os novos
    POST /api/projects/<id>/emails             processa um e-mail colado manualmente
    POST /api/analyze                          so analisa (nao grava) - util para testar regras
    GET  /health

Rodar:  python app.py      (ou iniciar.bat no Windows)
"""

from __future__ import annotations

import logging
import os

from datetime import date, datetime

from flask import Flask, abort, jsonify, redirect, render_template, request, send_from_directory, url_for
from flask.json.provider import DefaultJSONProvider

from config import Config
from models import Database
from services.email_parser import analyze_email
from services.outlook_client import EMAIL_RE, MailNotConfigured, MailSettings, RawEmail, get_mail_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("project-manager")

# nunca voltam para o navegador; a tela so sabe se estao preenchidos
SECRET_KEYS = ("o365_client_secret", "imap_oauth_token", "imap_password")


class IsoJSONProvider(DefaultJSONProvider):
    """Datas em ISO 8601 (o padrao do Flask e RFC 822, ruim para o JS)."""

    ensure_ascii = False
    sort_keys = False

    @staticmethod
    def default(o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        return DefaultJSONProvider.default(o)


def create_app(cfg: type[Config] = Config) -> Flask:
    Flask.json_provider_class = IsoJSONProvider
    app = Flask(__name__)
    app.config.from_object(cfg)
    app.config["TEMPLATES_AUTO_RELOAD"] = True  # editar o HTML nao exige reiniciar

    db = Database(cfg.DATABASE_PATH)
    app.extensions["db"] = db

    def mail_settings() -> dict:
        return db.get_settings(cfg.MAIL_DEFAULTS)

    def public_settings() -> dict:
        """Configuracao para a tela: segredos viram apenas '<chave>_set'."""
        raw = mail_settings()
        out = {k: v for k, v in raw.items() if k not in SECRET_KEYS}
        out.update({f"{k}_set": bool(raw.get(k)) for k in SECRET_KEYS})
        out["missing"] = MailSettings.from_dict(raw).missing()
        out["configured"] = not out["missing"]
        return out

    def merged_settings(form: dict) -> dict:
        """Salvo + formulario. Segredo em branco no formulario = manter o salvo."""
        merged = mail_settings()
        for k in cfg.MAIL_DEFAULTS:
            if k not in form:
                continue
            value = form[k]
            if isinstance(value, bool):
                value = "1" if value else "0"
            value = "" if value is None else str(value).strip()
            if k in SECRET_KEYS and not value:
                continue
            merged[k] = value
        return merged

    def project_or_404(project_id: int) -> dict:
        project = db.get_project(project_id)
        if not project:
            abort(404, description="Projeto nao encontrado.")
        return project

    # ------------------------------------------------------------------ paginas
    @app.get("/")
    def index():
        return redirect(url_for("dashboard"))

    @app.get("/dashboard")
    def dashboard():
        return render_template("dashboard.html")

    @app.get("/favicon.ico")
    def favicon():
        return send_from_directory(os.path.join(app.root_path, "static", "img"), "favicon.ico",
                                   mimetype="image/vnd.microsoft.icon")

    @app.get("/health")
    def health():
        return {"status": "ok", "outlook_configured": public_settings()["configured"]}

    # --------------------------------------------------------------- settings
    @app.get("/api/settings")
    def api_get_settings():
        return jsonify(public_settings())

    @app.put("/api/settings")
    def api_save_settings():
        form = request.get_json(silent=True) or {}
        merged = merged_settings(form)
        if not EMAIL_RE.match(merged.get("mailbox", "")):
            return jsonify(error="Informe um e-mail do Outlook válido."), 400
        if merged.get("backend") not in ("o365", "imap"):
            return jsonify(error="Método de conexão inválido."), 400
        for k in ("fetch_limit", "imap_port"):
            if not str(merged.get(k, "")).isdigit():
                return jsonify(error=f"Valor numérico inválido em {k}."), 400
        db.save_settings(merged)
        return jsonify(public_settings())

    @app.post("/api/settings/test")
    def api_test_settings():
        settings = MailSettings.from_dict(merged_settings(request.get_json(silent=True) or {}))
        try:
            message = get_mail_client(settings).test()
        except MailNotConfigured as exc:
            return jsonify(ok=False, error=str(exc)), 400
        except Exception as exc:  # noqa: BLE001 - erro de rede/credencial volta para a tela
            log.exception("Teste de conexao com o Outlook falhou")
            return jsonify(ok=False, error=f"Não conectou: {exc}"), 502
        return jsonify(ok=True, message=message)

    # --------------------------------------------------------------------- API
    @app.get("/api/projects")
    def api_projects():
        return jsonify(db.list_projects())

    @app.post("/api/projects")
    def api_create_project():
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        tag = (data.get("outlook_folder_or_tag") or "").strip()
        if not name or not tag:
            return jsonify(error="Informe nome e tag/pasta do Outlook."), 400
        pid = db.create_project(name, (data.get("description") or "").strip(), tag)
        return jsonify(db.get_project(pid)), 201

    @app.get("/api/projects/<int:project_id>/dashboard")
    def api_dashboard(project_id: int):
        project = project_or_404(project_id)
        days = max(7, min(int(request.args.get("days", 30)), 365))
        payload = db.dashboard(project_id, days=days)
        payload["project"] = project
        return jsonify(payload)

    @app.get("/api/projects/<int:project_id>/emails")
    def api_emails(project_id: int):
        project_or_404(project_id)
        return jsonify(db.list_emails(project_id))

    @app.post("/api/projects/<int:project_id>/sync")
    def api_sync(project_id: int):
        project = project_or_404(project_id)
        try:
            client = get_mail_client(MailSettings.from_dict(mail_settings()))
            raw_emails = client.fetch(project["outlook_folder_or_tag"])
        except MailNotConfigured as exc:
            return jsonify(error=str(exc), needs_settings=True), 400
        except Exception as exc:  # noqa: BLE001 - erro de rede/credencial volta para a tela
            log.exception("Falha ao ler a caixa de correio")
            return jsonify(error=f"Falha ao ler a caixa de correio: {exc}"), 502
        new = sum(1 for raw in raw_emails if db.ingest(project_id, raw) is not None)
        return jsonify(fetched=len(raw_emails), new=new)

    @app.post("/api/projects/<int:project_id>/emails")
    def api_ingest_manual(project_id: int):
        project_or_404(project_id)
        data = request.get_json(silent=True) or {}
        if not (data.get("body") or "").strip():
            return jsonify(error="Cole o corpo do e-mail."), 400
        raw = RawEmail(
            message_id=None,
            subject=data.get("subject") or "(sem assunto)",
            sender=data.get("sender") or "",
            date=data.get("date"),
            body=data["body"],
            importance=data.get("importance", "normal"),
        )
        email_id = db.ingest(project_id, raw)
        return jsonify(id=email_id), 201

    @app.post("/api/analyze")
    def api_analyze():
        data = request.get_json(silent=True) or {}
        result = analyze_email(data.get("subject", ""), data.get("body", ""),
                               data.get("sender", ""), data.get("date"), data.get("importance"))
        return jsonify(result.to_dict())

    @app.errorhandler(404)
    def not_found(err):
        if request.path.startswith("/api/"):
            return jsonify(error=getattr(err, "description", "Nao encontrado")), 404
        return err

    return app


app = create_app()

if __name__ == "__main__":
    host = os.getenv("PM_HOST", Config.HOST)
    port = int(os.getenv("PM_PORTA", Config.PORT))
    app.run(host=host, port=port, debug=Config.DEBUG)
