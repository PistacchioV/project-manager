"""
Camada de dados em DuckDB.

Tabelas (nomes do enunciado):
    Project  (id, name, description, outlook_folder_or_tag, created_at)
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

from services.email_parser import EmailAnalysis

URGENCY_ORDER = {"critica": 3, "alta": 2, "media": 1, "baixa": 0}

SCHEMA = """
CREATE SEQUENCE IF NOT EXISTS seq_project START 1;
CREATE SEQUENCE IF NOT EXISTS seq_emaillog START 1;

CREATE TABLE IF NOT EXISTS Project (
    id                    INTEGER PRIMARY KEY DEFAULT nextval('seq_project'),
    name                  VARCHAR NOT NULL,
    description           VARCHAR,
    outlook_folder_or_tag VARCHAR NOT NULL,   -- "[PROJ-01]" (tag no assunto) ou nome de pasta
    created_at            TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE IF NOT EXISTS EmailLog (
    id            INTEGER PRIMARY KEY DEFAULT nextval('seq_emaillog'),
    project_id    INTEGER NOT NULL REFERENCES Project(id),
    message_id    VARCHAR UNIQUE,             -- id do Outlook/IMAP; evita reprocessar
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
    processed_at  TIMESTAMP DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_email_project_date ON EmailLog(project_id, date_received);
"""


class Database:
    def __init__(self, path: str):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        self._conn = duckdb.connect(path)
        self._write_lock = threading.Lock()
        self._conn.execute(SCHEMA)

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

    # ------------------------------------------------------------------ Project
    def list_projects(self) -> list[dict]:
        with self.cursor() as cur:
            cur.execute("""
                SELECT p.id, p.name, p.description, p.outlook_folder_or_tag,
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

    def create_project(self, name: str, description: str, folder_or_tag: str) -> int:
        with self.cursor(write=True) as cur:
            cur.execute(
                "INSERT INTO Project (name, description, outlook_folder_or_tag) VALUES (?, ?, ?) RETURNING id",
                [name, description, folder_or_tag],
            )
            return cur.fetchone()[0]

    # ----------------------------------------------------------------- EmailLog
    def email_exists(self, message_id: str) -> bool:
        with self.cursor() as cur:
            cur.execute("SELECT 1 FROM EmailLog WHERE message_id = ?", [message_id])
            return cur.fetchone() is not None

    def insert_email(self, project_id: int, message_id: str | None, subject: str,
                     raw_body: str, analysis: EmailAnalysis) -> int | None:
        """Grava o e-mail analisado. Retorna None se o message_id ja existia."""
        payload = {
            "keywords": [{"word": w, "count": c} for w, c in analysis.keywords],
            "action_items": [a.__dict__ for a in analysis.action_items],
            "urgency_breakdown": analysis.urgency_breakdown,
        }
        with self.cursor(write=True) as cur:
            if message_id:
                cur.execute("SELECT 1 FROM EmailLog WHERE message_id = ?", [message_id])
                if cur.fetchone():
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
