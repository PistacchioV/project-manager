"""
Gera static/js/mock-data.js a partir do PROPRIO backend.

Sobe o app com um banco temporario em modo demo, chama as mesmas rotas que o
dashboard usa e grava as respostas em window.MOCK_DATA. Assim o mock tem
sempre o formato identico ao da API.

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
    os.environ["PM_SEED_DEMO"] = "1"
    os.environ["PM_MAIL_BACKEND"] = "demo"

    from app import create_app  # noqa: E402  (depois das variaveis de ambiente)
    from config import Config  # noqa: E402

    Config.DATABASE_PATH = os.environ["PM_DATABASE"]
    client = create_app(Config).test_client()

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
