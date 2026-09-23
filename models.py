"""
Camada de dados em DuckDB.

Tabelas (nomes do enunciado):
    AppSetting (key, value)   -- conexao com o Outlook definida na tela
    Project  (id, name, description, outlook_folder_or_tag, source_type, created_at)
             source_type 'category' -> outlook_folder_or_tag = categoria do Outlook
             source_type 'person'   -> outlook_folder_or_tag = e-mail da pessoa
    EmailLog (id, project_id, message_id, subject, sender, sender_email,
              date_received, raw_body, clean_body, clean_summary,
              urgency_score, urgency_level, analysis_json, processed_at)

DuckDB roda dentro do processo: um objeto de conexao compartilhado e um
cursor por operacao (cada cursor e uma conexao propria, segura entre threads
do waitress). Um lock serializa as escritas.
"""

from __future__ import annotations

import json
import threading
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

import duckdb

from services.email_parser import EmailAnalysis, analyze_email
from services.outlook_client import RawEmail

URGENCY_ORDER = {"critica": 3, "alta": 2, "media": 1, "baixa": 0}

SCHEMA = """
CREATE SEQUENCE IF NOT EXISTS seq_project START 1;
CREATE SEQUENCE IF NOT EXISTS seq_emaillog START 1;

CREATE TABLE IF NOT EXISTS Project (
    id                    INTEGER PRIMARY KEY DEFAULT nextval('seq_project'),
    name                  VARCHAR NOT NULL,
    description           VARCHAR,
    outlook_folder_or_tag VARCHAR NOT NULL,   -- categoria do Outlook ou e-mail da pessoa
    source_type           VARCHAR DEFAULT 'category',   -- category | person
    created_at            TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS EmailLog (
    id            INTEGER PRIMARY KEY DEFAULT nextval('seq_emaillog'),
    project_id    INTEGER NOT NULL REFERENCES Project(id),
    message_id    VARCHAR,                    -- id do Outlook; evita reprocessar no MESMO projeto
    subject       VARCHAR,
    sender        VARCHAR,                    -- nome de exibicao
    sender_email  VARCHAR,
    date_received TIMESTAMP,                  -- UTC
    raw_body      VARCHAR,                    -- corpo original (HTML ou texto)
    clean_body    VARCHAR,                    -- sem historico/assinatura
    clean_summary VARCHAR,                    -- resumo extrativo
    urgency_score INTEGER DEFAULT 0,
    urgency_level VARCHAR DEFAULT 'baixa',    -- baixa | media | alta | critica
    analysis_json VARCHAR,                    -- palavras-chave, acoes, detalhamento da nota
    processed_at  TIMESTAMP DEFAULT current_timestamp,
    -- o mesmo e-mail pode estar em varios projetos (categoria + pessoa)
    UNIQUE (project_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_email_project_date ON EmailLog(project_id, date_received);

CREATE TABLE IF NOT EXISTS AppSetting (
    key   VARCHAR PRIMARY KEY,
    value VARCHAR
);
"""


class Database:
    def __init__(self, path: str):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        self._conn = duckdb.connect(path)
        self._write_lock = threading.Lock()
        self._conn.execute(SCHEMA)
        self._migrate()

    def _migrate(self) -> None:
        """Atualiza bancos criados por versoes anteriores (idempotente)."""
        c = self._conn
        c.execute("ALTER TABLE Project ADD COLUMN IF NOT EXISTS source_type VARCHAR DEFAULT 'category'")
        c.execute("UPDATE Project SET source_type = 'category' WHERE source_type IS NULL")
        # v1 tinha UNIQUE(message_id) global: um e-mail so entrava no 1o projeto.
        # DuckDB nao remove constraint com ALTER, entao a tabela e recriada.
        old_unique = c.execute("""
            SELECT count(*) FROM duckdb_constraints()
            WHERE table_name = 'EmailLog' AND constraint_type = 'UNIQUE'
              AND constraint_column_names = ['message_id']
        """).fetchone()[0]
        if not old_unique:
            return
        c.execute("BEGIN TRANSACTION")
        try:
            c.execute("CREATE TABLE EmailLog_v2 AS SELECT * FROM EmailLog")
            c.execute("DROP INDEX IF EXISTS idx_email_project_date")
            c.execute("DROP TABLE EmailLog")
            c.execute(SCHEMA)  # recria EmailLog com UNIQUE(project_id, message_id)
            c.execute("INSERT INTO EmailLog SELECT * FROM EmailLog_v2")
            c.execute("DROP TABLE EmailLog_v2")
            c.execute("COMMIT")
        except Exception:
            c.execute("ROLLBACK")
            raise

    @contextmanager
    def cursor(self, write: bool = False):
        cur = self._conn.cursor()
        try:
            if write:
                with self._write_lock:
                    yield cur
            else:
                yield cur
        finally:
            cur.close()

    @staticmethod
    def _rows(cur) -> list[dict]:
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]

    # --------------------------------------------------------------- AppSetting
    def get_settings(self, defaults: dict) -> dict:
        """Valores salvos na tela; o que nunca foi salvo cai no default (.env)."""
        with self.cursor() as cur:
            cur.execute("SELECT key, value FROM AppSetting")
            saved = dict(cur.fetchall())
        return {k: saved.get(k, v) for k, v in defaults.items()}

    def save_settings(self, values: dict) -> None:
        with self.cursor(write=True) as cur:
            for k, v in values.items():
                cur.execute("INSERT OR REPLACE INTO AppSetting (key, value) VALUES (?, ?)", [k, str(v)])

    # ------------------------------------------------------------------ Project
    def list_projects(self) -> list[dict]:
        with self.cursor() as cur:
            cur.execute("""
                SELECT p.id, p.name, p.description, p.outlook_folder_or_tag, p.source_type,
                       count(e.id) AS email_count,
                       count(e.id) FILTER (WHERE e.urgency_level IN ('alta','critica')) AS urgent_count,
                       max(e.date_received) AS last_email
                FROM Project p LEFT JOIN EmailLog e ON e.project_id = p.id
                GROUP BY ALL ORDER BY p.id
            """)
            return self._rows(cur)

    def get_project(self, project_id: int) -> dict | None:
        with self.cursor() as cur:
            cur.execute("SELECT * FROM Project WHERE id = ?", [project_id])
            rows = self._rows(cur)
            return rows[0] if rows else None

    def create_project(self, name: str, description: str, folder_or_tag: str,
                       source_type: str = "category") -> int:
        with self.cursor(write=True) as cur:
            cur.execute(
                "INSERT INTO Project (name, description, outlook_folder_or_tag, source_type) "
                "VALUES (?, ?, ?, ?) RETURNING id",
                [name, description, folder_or_tag, source_type],
            )
            return cur.fetchone()[0]

    def list_people(self, limit: int = 50) -> list[dict]:
        """Remetentes ja vistos (sugestoes do projeto "pessoa"), mais ativos primeiro."""
        with self.cursor() as cur:
            cur.execute("""
                SELECT any_value(sender) AS name, sender_email AS email, count(*) AS count
                FROM EmailLog WHERE sender_email <> ''
                GROUP BY sender_email ORDER BY count DESC, name LIMIT ?
            """, [limit])
            return self._rows(cur)

    # ----------------------------------------------------------------- EmailLog
    def ingest(self, project_id: int, raw: RawEmail) -> int | None:
        """Analisa um e-mail cru pelo motor de regras e grava. None = ja processado."""
        analysis = analyze_email(raw.subject, raw.body, raw.sender, raw.date, raw.importance)
        return self.insert_email(project_id, raw.message_id, raw.subject, raw.body, analysis)

    def insert_email(self, project_id: int, message_id: str | None, subject: str,
                     raw_body: str, analysis: EmailAnalysis) -> int | None:
        """Grava o e-mail analisado. Retorna None se ja existia NESTE projeto."""
        payload = {
            "keywords": [{"word": w, "count": c} for w, c in analysis.keywords],
            "action_items": [a.__dict__ for a in analysis.action_items],
            "urgency_breakdown": analysis.urgency_breakdown,
        }
        with self.cursor(write=True) as cur:
            if message_id:
                cur.execute("SELECT id, sender, sender_email FROM EmailLog WHERE project_id = ? AND message_id = ?",
                            [project_id, message_id])
                row = cur.fetchone()
                if row:
                    # ja processado; so conserta remetente gravado como "Desconhecido"
                    # por versoes antigas (nome "Sobrenome, Nome" quebrava a leitura)
                    if (row[1] == "Desconhecido" or not row[2]) and analysis.sender_email:
                        cur.execute("UPDATE EmailLog SET sender = ?, sender_email = ? WHERE id = ?",
                                    [analysis.sender_name, analysis.sender_email, row[0]])
                    return None
            cur.execute("""
                INSERT INTO EmailLog (project_id, message_id, subject, sender, sender_email,
                    date_received, raw_body, clean_body, clean_summary,
                    urgency_score, urgency_level, analysis_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
            """, [
                project_id, message_id, subject, analysis.sender_name, analysis.sender_email,
                analysis.date_received, raw_body, analysis.clean_text, analysis.summary,
                analysis.urgency_score, analysis.urgency_level,
                json.dumps(payload, ensure_ascii=False),
            ])
            return cur.fetchone()[0]

    def list_emails(self, project_id: int, limit: int = 500) -> list[dict]:
        with self.cursor() as cur:
            cur.execute("""
                SELECT id, subject, sender, sender_email, date_received, clean_summary,
                       clean_body, raw_body, urgency_score, urgency_level, analysis_json
                FROM EmailLog WHERE project_id = ?
                ORDER BY date_received DESC LIMIT ?
            """, [project_id, limit])
            rows = self._rows(cur)
        for r in rows:
            r["date_received"] = r["date_received"].isoformat() if r["date_received"] else None
            analysis = json.loads(r.pop("analysis_json") or "{}")
            r["keywords"] = analysis.get("keywords", [])
            r["action_items"] = analysis.get("action_items", [])
            r["urgency_breakdown"] = analysis.get("urgency_breakdown", {})
        return rows

    # ---------------------------------------------------------------- Dashboard
    def dashboard(self, project_id: int, days: int = 30) -> dict:
        """Agregados do dashboard. O formato e o mesmo do MOCK_DATA em dashboard.js."""
        # datas gravadas em UTC ingenuo; "agora" tambem em UTC
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        since = now - timedelta(days=days)
        with self.cursor() as cur:
            cur.execute("""
                SELECT count(*) AS total,
                       count(*) FILTER (WHERE date_received >= ?) AS last_7d,
                       count(*) FILTER (WHERE urgency_level = 'critica') AS critical,
                       count(*) FILTER (WHERE urgency_level = 'alta') AS high,
                       count(DISTINCT sender_email) AS senders,
                       coalesce(round(avg(urgency_score), 1), 0) AS avg_score
                FROM EmailLog WHERE project_id = ?
            """, [now - timedelta(days=7), project_id])
            kpis = self._rows(cur)[0]

            # serie diaria completa (dias sem e-mail aparecem com 0)
            cur.execute("""
                WITH dias AS (
                    SELECT unnest(generate_series(?::DATE, ?::DATE, INTERVAL 1 DAY))::DATE AS dia
                )
                SELECT d.dia, count(e.id) AS total,
                       count(e.id) FILTER (WHERE e.urgency_level IN ('alta','critica')) AS urgent
                FROM dias d LEFT JOIN EmailLog e
                  ON e.project_id = ? AND e.date_received::DATE = d.dia
                GROUP BY d.dia ORDER BY d.dia
            """, [since.date(), now.date(), project_id])
            daily = self._rows(cur)

            cur.execute("""
                SELECT date_trunc('week', date_received)::DATE AS semana, count(*) AS total,
                       count(*) FILTER (WHERE urgency_level IN ('alta','critica')) AS urgent
                FROM EmailLog WHERE project_id = ? AND date_received >= ?
                GROUP BY semana ORDER BY semana
            """, [project_id, since - timedelta(days=since.weekday())])
            weekly = self._rows(cur)

            cur.execute("""
                SELECT any_value(sender) AS sender, sender_email AS email, count(*) AS count,
                       count(*) FILTER (WHERE urgency_level IN ('alta','critica')) AS urgent
                FROM EmailLog WHERE project_id = ?
                GROUP BY sender_email ORDER BY count DESC, sender LIMIT 8
            """, [project_id])
            top_senders = self._rows(cur)

            cur.execute("""
                SELECT id, subject, sender, date_received, urgency_score, urgency_level, analysis_json
                FROM EmailLog WHERE project_id = ? AND urgency_level IN ('alta','critica')
                ORDER BY date_received DESC LIMIT 12
            """, [project_id])
            alert_rows = self._rows(cur)

            cur.execute("SELECT analysis_json FROM EmailLog WHERE project_id = ? AND date_received >= ?",
                        [project_id, since])
            kw_rows = cur.fetchall()

        alerts = []
        for r in alert_rows:
            analysis = json.loads(r["analysis_json"] or "{}")
            top = (analysis.get("action_items") or [{}])[0]
            alerts.append({
                "email_id": r["id"],
                "subject": r["subject"],
                "sender": r["sender"],
                "date": r["date_received"].isoformat(),
                "level": r["urgency_level"],
                "score": r["urgency_score"],
                "sentence": top.get("sentence", ""),
                "triggers": top.get("triggers", []),
                "dates": top.get("dates", []),
            })
        alerts.sort(key=lambda a: (URGENCY_ORDER[a["level"]], a["date"]), reverse=True)

        kw_total: dict[str, int] = {}
        for (raw,) in kw_rows:
            for kw in json.loads(raw or "{}").get("keywords", []):
                kw_total[kw["word"]] = kw_total.get(kw["word"], 0) + kw["count"]
        keywords = sorted(kw_total.items(), key=lambda kv: (-kv[1], kv[0]))[:15]

        return {
            "kpis": kpis,
            "volume": {
                "daily": {
                    "labels": [d["dia"].isoformat() for d in daily],
                    "total": [d["total"] for d in daily],
                    "urgent": [d["urgent"] for d in daily],
                },
                "weekly": {
                    "labels": [w["semana"].isoformat() for w in weekly],
                    "total": [w["total"] for w in weekly],
                    "urgent": [w["urgent"] for w in weekly],
                },
            },
            "top_senders": top_senders,
            "alerts": alerts,
            "keywords": [{"word": w, "count": c} for w, c in keywords],
        }
