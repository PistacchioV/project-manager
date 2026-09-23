"""
Configuracao lida de variaveis de ambiente (opcionalmente de um arquivo .env).

Copie .env.example para .env e preencha. Sem nada configurado, o sistema sobe
em modo DEMO: banco local com dados ficticios e caixa de correio simulada.
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
    SEED_DEMO = _bool("PM_SEED_DEMO", True)  # popula dados ficticios no 1o boot

    # --- caixa de correio: "demo" | "o365" | "imap" ---
    MAIL_BACKEND = os.getenv("PM_MAIL_BACKEND", "demo").lower()
    MAIL_FETCH_LIMIT = int(os.getenv("PM_MAIL_FETCH_LIMIT", "50"))
    MAIL_MARK_AS_READ = _bool("PM_MAIL_MARK_AS_READ", False)

    # Microsoft Graph (biblioteca O365) - app registrado no Entra ID / Azure AD
    O365_CLIENT_ID = os.getenv("O365_CLIENT_ID", "")
    O365_CLIENT_SECRET = os.getenv("O365_CLIENT_SECRET", "")
    O365_TENANT_ID = os.getenv("O365_TENANT_ID", "")
    O365_MAILBOX = os.getenv("O365_MAILBOX", "")  # caixa alvo (ex.: projetos@empresa.com)

    # IMAP (Office 365: outlook.office365.com:993). Senha OU token OAuth2 (XOAUTH2).
    IMAP_HOST = os.getenv("IMAP_HOST", "outlook.office365.com")
    IMAP_PORT = int(os.getenv("IMAP_PORT", "993"))
    IMAP_USER = os.getenv("IMAP_USER", "")
    IMAP_PASSWORD = os.getenv("IMAP_PASSWORD", "")
    IMAP_OAUTH_TOKEN = os.getenv("IMAP_OAUTH_TOKEN", "")
