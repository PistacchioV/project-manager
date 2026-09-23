"""
Leitura da caixa de correio do Outlook.

Tres backends com a mesma interface ``fetch(folder_or_tag) -> list[RawEmail]``:

* ``O365MailClient``  - Microsoft Graph via biblioteca ``O365`` (recomendado).
  Usa credenciais de aplicativo (client credentials) registradas no Entra ID
  com a permissao de aplicativo ``Mail.Read`` (ou ``Mail.ReadWrite`` se for
  marcar como lido).
* ``IMAPMailClient``  - IMAP em outlook.office365.com:993. A Microsoft
  desativou autenticacao basica no Exchange Online; use ``IMAP_OAUTH_TOKEN``
  (XOAUTH2). Senha so funciona em servidores que ainda aceitam LOGIN.
* ``DemoMailClient``  - gera e-mails ficticios; permite testar sem credenciais.

Regra de busca (enunciado): e-mails NAO LIDOS ou com a tag do projeto no
assunto. Se ``outlook_folder_or_tag`` tem colchetes (``[PROJ-01]``) ele e uma
tag procurada no assunto da Caixa de Entrada; senao e o nome de uma pasta, da
qual vem os nao lidos.
"""

from __future__ import annotations

import email
import imaplib
import logging
import re
from dataclasses import dataclass
from email.header import decode_header, make_header
from email.message import Message

from config import Config

log = logging.getLogger(__name__)


@dataclass
class RawEmail:
    message_id: str
    subject: str
    sender: str          # "Nome <email>"
    date: object         # datetime ou string RFC 2822
    body: str            # HTML ou texto plano
    importance: str = "normal"


def is_tag(folder_or_tag: str) -> bool:
    return bool(re.fullmatch(r"\s*\[.+\]\s*", folder_or_tag or ""))


# ---------------------------------------------------------------------------
# Microsoft Graph (O365)
# ---------------------------------------------------------------------------


class O365MailClient:
    def __init__(self, cfg: type[Config] = Config):
        from O365 import Account  # import tardio: so exige a lib se o backend for usado

        if not (cfg.O365_CLIENT_ID and cfg.O365_CLIENT_SECRET and cfg.O365_TENANT_ID and cfg.O365_MAILBOX):
            raise RuntimeError("Configure O365_CLIENT_ID, O365_CLIENT_SECRET, O365_TENANT_ID e O365_MAILBOX.")
        self.cfg = cfg
        self.account = Account(
            (cfg.O365_CLIENT_ID, cfg.O365_CLIENT_SECRET),
            auth_flow_type="credentials",
            tenant_id=cfg.O365_TENANT_ID,
        )
        if not self.account.is_authenticated and not self.account.authenticate():
            raise RuntimeError("Falha ao autenticar no Microsoft Graph.")
        self.mailbox = self.account.mailbox(resource=cfg.O365_MAILBOX)

    def fetch(self, folder_or_tag: str) -> list[RawEmail]:
        if is_tag(folder_or_tag):
            folder = self.mailbox.inbox_folder()
            tag = folder_or_tag.strip()
            # nao lidos que tragam a tag OU qualquer um com a tag (lido ou nao)
            query = (self.mailbox.new_query()
                     .on_attribute("subject").contains(tag)
                     .chain("or").on_attribute("isRead").equals(False))
        else:
            folder = self.mailbox.get_folder(folder_name=folder_or_tag)
            if folder is None:
                raise RuntimeError(f"Pasta '{folder_or_tag}' nao encontrada na caixa {self.cfg.O365_MAILBOX}.")
            query = self.mailbox.new_query().on_attribute("isRead").equals(False)

        out = []
        for msg in folder.get_messages(limit=self.cfg.MAIL_FETCH_LIMIT, query=query, download_attachments=False):
            subject = msg.subject or ""
            # com tag: nao lidos sem a tag pertencem a outro projeto
            if is_tag(folder_or_tag) and folder_or_tag.strip().lower() not in subject.lower():
                continue
            sender = msg.sender
            out.append(RawEmail(
                message_id=msg.internet_message_id or msg.object_id,
                subject=subject,
                sender=f"{sender.name} <{sender.address}>" if sender else "",
                date=msg.received,
                body=msg.body or "",
                importance=str(getattr(msg.importance, "value", msg.importance) or "normal"),
            ))
            if self.cfg.MAIL_MARK_AS_READ:
                msg.mark_as_read()
        return out


# ---------------------------------------------------------------------------
# IMAP (Office 365)
# ---------------------------------------------------------------------------


def _decode(value: str | None) -> str:
    return str(make_header(decode_header(value))) if value else ""


def _message_body(msg: Message) -> str:
    """Prefere text/html (mais fiel ao Outlook); cai para text/plain."""
    html_part = plain_part = None
    for part in msg.walk() if msg.is_multipart() else [msg]:
        if part.get_content_maintype() == "multipart" or part.get("Content-Disposition", "").startswith("attachment"):
            continue
        ctype = part.get_content_type()
        if ctype == "text/html" and html_part is None:
            html_part = part
        elif ctype == "text/plain" and plain_part is None:
            plain_part = part
    part = html_part or plain_part
    if part is None:
        return ""
    payload = part.get_payload(decode=True) or b""
    return payload.decode(part.get_content_charset() or "utf-8", errors="replace")


class IMAPMailClient:
    def __init__(self, cfg: type[Config] = Config):
        if not cfg.IMAP_USER or not (cfg.IMAP_PASSWORD or cfg.IMAP_OAUTH_TOKEN):
            raise RuntimeError("Configure IMAP_USER e IMAP_OAUTH_TOKEN (ou IMAP_PASSWORD).")
        self.cfg = cfg

    def _connect(self) -> imaplib.IMAP4_SSL:
        conn = imaplib.IMAP4_SSL(self.cfg.IMAP_HOST, self.cfg.IMAP_PORT)
        if self.cfg.IMAP_OAUTH_TOKEN:
            auth = f"user={self.cfg.IMAP_USER}\x01auth=Bearer {self.cfg.IMAP_OAUTH_TOKEN}\x01\x01"
            conn.authenticate("XOAUTH2", lambda _: auth.encode())
        else:
            conn.login(self.cfg.IMAP_USER, self.cfg.IMAP_PASSWORD)
        return conn

    def fetch(self, folder_or_tag: str) -> list[RawEmail]:
        conn = self._connect()
        try:
            if is_tag(folder_or_tag):
                conn.select("INBOX", readonly=not self.cfg.MAIL_MARK_AS_READ)
                tag = folder_or_tag.strip().replace('"', "")
                # IMAP SEARCH: SUBJECT faz busca por substring
                status, data = conn.search(None, f'(SUBJECT "{tag}")')
            else:
                conn.select(f'"{folder_or_tag}"', readonly=not self.cfg.MAIL_MARK_AS_READ)
                status, data = conn.search(None, "UNSEEN")
            if status != "OK":
                return []
            ids = data[0].split()[-self.cfg.MAIL_FETCH_LIMIT:]
            out = []
            for num in ids:
                # BODY.PEEK nao altera a flag \Seen
                fetch_cmd = "(RFC822)" if self.cfg.MAIL_MARK_AS_READ else "(BODY.PEEK[])"
                status, parts = conn.fetch(num, fetch_cmd)
                if status != "OK" or not parts or not isinstance(parts[0], tuple):
                    continue
                msg = email.message_from_bytes(parts[0][1])
                out.append(RawEmail(
                    message_id=(msg.get("Message-ID") or f"imap-{num.decode()}").strip(),
                    subject=_decode(msg.get("Subject")),
                    sender=_decode(msg.get("From")),
                    date=msg.get("Date"),
                    body=_message_body(msg),
                    importance="high" if (msg.get("Importance", "").lower() == "high"
                                          or msg.get("X-Priority", "").startswith("1")) else "normal",
                ))
            return out
        finally:
            try:
                conn.logout()
            except Exception:  # noqa: BLE001 - desconexao best-effort
                pass


# ---------------------------------------------------------------------------
# Demo
# ---------------------------------------------------------------------------


class DemoMailClient:
    """Devolve alguns e-mails ficticios novos a cada sincronizacao."""

    def fetch(self, folder_or_tag: str) -> list[RawEmail]:
        from services.seed import generate_emails

        return generate_emails(folder_or_tag, count=4, days_back=0)


def get_mail_client(cfg: type[Config] = Config):
    backend = cfg.MAIL_BACKEND
    if backend == "o365":
        return O365MailClient(cfg)
    if backend == "imap":
        return IMAPMailClient(cfg)
    return DemoMailClient()
