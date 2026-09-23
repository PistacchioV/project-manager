"""
Configuracao lida de variaveis de ambiente (opcionalmente de um arquivo .env).

A conexao com o Outlook e configurada pela tela (icone de engrenagem) e fica
gravada no banco. As variaveis O365_* / IMAP_* abaixo sao apenas valores
iniciais: servem para quem prefere deixar as credenciais do app no .env.
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

    # --- valores iniciais da conexao com o Outlook (a tela de configuracoes sobrepoe) ---
    MAIL_DEFAULTS = {
        "mailbox": os.getenv("O365_MAILBOX", ""),
        "backend": os.getenv("PM_MAIL_BACKEND", "o365").lower(),   # o365 | imap
        "fetch_limit": os.getenv("PM_MAIL_FETCH_LIMIT", "50"),
        "mark_as_read": "1" if _bool("PM_MAIL_MARK_AS_READ", False) else "0",
        # Microsoft Graph (biblioteca O365) - app registrado no Entra ID / Azure AD
        "o365_tenant_id": os.getenv("O365_TENANT_ID", ""),
        "o365_client_id": os.getenv("O365_CLIENT_ID", ""),
        "o365_client_secret": os.getenv("O365_CLIENT_SECRET", ""),
        # IMAP (Office 365: outlook.office365.com:993). Token OAuth2 (XOAUTH2) ou senha.
        "imap_host": os.getenv("IMAP_HOST", "outlook.office365.com"),
        "imap_port": os.getenv("IMAP_PORT", "993"),
        "imap_oauth_token": os.getenv("IMAP_OAUTH_TOKEN", ""),
        "imap_password": os.getenv("IMAP_PASSWORD", ""),
    }
