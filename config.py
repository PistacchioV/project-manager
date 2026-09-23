"""
Configuracao lida de variaveis de ambiente (opcionalmente de um arquivo .env).

A caixa do Outlook e informada pela tela (icone de engrenagem) e fica gravada
no banco. PM_MAILBOX no .env e apenas o valor inicial.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

try:  # python-dotenv e opcional
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR / ".env")
except ImportError:
    pass


def _bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "sim", "on")


class Config:
    # --- servidor ---
    HOST = os.getenv("PM_HOST", "127.0.0.1")
    PORT = int(os.getenv("PM_PORTA", "5080"))
    DEBUG = _bool("PM_DEBUG", False)

    # --- banco (DuckDB, arquivo unico) ---
    DATABASE_PATH = os.getenv("PM_DATABASE", str(BASE_DIR / "data" / "project_manager.duckdb"))

    # --- conexao com o Outlook (a tela de configuracoes sobrepoe) ---
    # Mesmo modelo do OTC Tracker: le pelo Outlook aberto no Windows (COM/MAPI),
    # entao so o e-mail da caixa e necessario; nenhuma senha ou token.
    MAIL_DEFAULTS = {
        "mailbox": os.getenv("PM_MAILBOX", ""),
        "fetch_limit": os.getenv("PM_MAIL_FETCH_LIMIT", "50"),
        "mark_as_read": "1" if _bool("PM_MAIL_MARK_AS_READ", False) else "0",
    }
