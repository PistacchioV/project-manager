"""
Gera static/js/mock-data.js a partir do PROPRIO backend.

Sobe o app com um banco TEMPORARIO, popula com scripts/demo_data.py, chama as
mesmas rotas que o dashboard usa e grava as respostas em window.MOCK_DATA.
Assim o mock tem sempre o formato identico ao da API. O banco real nao e tocado.

    python scripts/export_mock_data.py
"""

import json
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

with tempfile.TemporaryDirectory() as tmp:
    os.environ["PM_DATABASE"] = str(Path(tmp) / "mock.duckdb")

    from app import create_app  # noqa: E402  (depois das variaveis de ambiente)
    from config import Config  # noqa: E402
    from scripts.demo_data import seed_demo  # noqa: E402

    Config.DATABASE_PATH = os.environ["PM_DATABASE"]
    flask_app = create_app(Config)
    seed_demo(flask_app.extensions["db"])
    client = flask_app.test_client()

    projects = client.get("/api/projects").get_json()
    dashboard = client.get(f"/api/projects/{projects[0]['id']}/dashboard?days=30").get_json()
    emails = client.get(f"/api/projects/{projects[0]['id']}/emails").get_json()[:40]

data = {"projects": projects, "dashboard": dashboard, "emails": emails}
out = ROOT / "static" / "js" / "mock-data.js"
out.write_text(
    "/* Gerado por scripts/export_mock_data.py - NAO editar a mao.\n"
    "   Mesmo formato de /api/projects, /api/projects/<id>/dashboard e /emails. */\n"
    "window.MOCK_DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8",
)
print(f"{out.relative_to(ROOT)}: {len(emails)} e-mails, {len(dashboard['alerts'])} alertas")
