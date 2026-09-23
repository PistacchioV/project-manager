"""
Leitura da caixa de correio do Outlook.

Dois backends com a mesma interface ``fetch(folder_or_tag) -> list[RawEmail]``
e ``test() -> str``:

* ``O365MailClient``  - Microsoft Graph via biblioteca ``O365`` (recomendado).
  Usa credenciais de aplicativo (client credentials) registradas no Entra ID
  com a permissao de aplicativo ``Mail.Read`` (ou ``Mail.ReadWrite`` se for
  marcar como lido).
* ``IMAPMailClient``  - IMAP em outlook.office365.com:993. A Microsoft
  desativou autenticacao basica no Exchange Online; use o token OAuth2
  (XOAUTH2). Senha so funciona em servidores que ainda aceitam LOGIN.

A caixa (e-mail) e as credenciais vem de ``MailSettings``, preenchido pela
tela de configuracoes (icone de engrenagem) e gravado no banco.

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

log = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class MailNotConfigured(RuntimeError):
    """A conexao com o Outlook ainda nao foi configurada na tela."""


@dataclass
class RawEmail:
    message_id: str | None
    subject: str
    sender: str          # "Nome <email>"
    date: object         # datetime ou string RFC 2822
    body: str            # HTML ou texto plano
    importance: str = "normal"


@dataclass
class MailSettings:
    mailbox: str = ""
    backend: str = "o365"
    fetch_limit: int = 50
    mark_as_read: bool = False
    o365_tenant_id: str = ""
    o365_client_id: str = ""
    o365_client_secret: str = ""
    imap_host: str = "outlook.office365.com"
    imap_port: int = 993
    imap_oauth_token: str = ""
    imap_password: str = ""

    @classmethod
    def from_dict(cls, d: dict) -> "MailSettings":
        return cls(
            mailbox=(d.get("mailbox") or "").strip(),
            backend=(d.get("backend") or "o365").lower(),
            fetch_limit=int(d.get("fetch_limit") or 50),
            mark_as_read=str(d.get("mark_as_read")) in ("1", "true", "True"),
            o365_tenant_id=(d.get("o365_tenant_id") or "").strip(),
            o365_client_id=(d.get("o365_client_id") or "").strip(),
            o365_client_secret=d.get("o365_client_secret") or "",
            imap_host=(d.get("imap_host") or "outlook.office365.com").strip(),
            imap_port=int(d.get("imap_port") or 993),
            imap_oauth_token=d.get("imap_oauth_token") or "",
            imap_password=d.get("imap_password") or "",
        )

    def missing(self) -> list[str]:
        """Campos obrigatorios ainda vazios (lista vazia = pronto para conectar)."""
        faltam = []
        if not EMAIL_RE.match(self.mailbox):
            faltam.append("e-mail do Outlook")
        if self.backend == "o365":
            for campo, nome in (("o365_tenant_id", "Tenant ID"), ("o365_client_id", "Client ID"),
                                ("o365_client_secret", "Client Secret")):
                if not getattr(self, campo):
                    faltam.append(nome)
        elif not (self.imap_oauth_token or self.imap_password):
            faltam.append("token OAuth2 ou senha IMAP")
        return faltam


def is_tag(folder_or_tag: str) -> bool:
    return bool(re.fullmatch(r"\s*\[.+\]\s*", folder_or_tag or ""))


# ---------------------------------------------------------------------------
# Microsoft Graph (O365)
# ---------------------------------------------------------------------------


class O365MailClient:
    def __init__(self, s: MailSettings):
        from O365 import Account  # import tardio: so exige a lib se o backend for usado

        self.s = s
        self.account = Account(
            (s.o365_client_id, s.o365_client_secret),
            auth_flow_type="credentials",
            tenant_id=s.o365_tenant_id,
        )
        if not self.account.is_authenticated and not self.account.authenticate():
            raise RuntimeError("Falha ao autenticar no Microsoft Graph (confira Tenant ID, Client ID e Secret).")
        self.mailbox = self.account.mailbox(resource=s.mailbox)

    def test(self) -> str:
        inbox = self.mailbox.inbox_folder()
        total = sum(1 for _ in inbox.get_messages(limit=1))
        return f"Conectado a {self.s.mailbox} via Microsoft Graph ({'caixa com mensagens' if total else 'caixa vazia'})."

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
                raise RuntimeError(f"Pasta '{folder_or_tag}' nao encontrada na caixa {self.s.mailbox}.")
            query = self.mailbox.new_query().on_attribute("isRead").equals(False)

        out = []
        for msg in folder.get_messages(limit=self.s.fetch_limit, query=query, download_attachments=False):
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
            if self.s.mark_as_read:
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
    def __init__(self, s: MailSettings):
        self.s = s

    def _connect(self) -> imaplib.IMAP4_SSL:
        conn = imaplib.IMAP4_SSL(self.s.imap_host, self.s.imap_port, timeout=20)
        if self.s.imap_oauth_token:
            auth = f"user={self.s.mailbox}\x01auth=Bearer {self.s.imap_oauth_token}\x01\x01"
            conn.authenticate("XOAUTH2", lambda _: auth.encode())
        else:
            conn.login(self.s.mailbox, self.s.imap_password)
        return conn

    def test(self) -> str:
        conn = self._connect()
        try:
            status, data = conn.select("INBOX", readonly=True)
            n = data[0].decode() if status == "OK" else "?"
            return f"Conectado a {self.s.mailbox} via IMAP ({n} mensagens na Caixa de Entrada)."
        finally:
            try:
                conn.logout()
            except Exception:  # noqa: BLE001 - desconexao best-effort
                pass

    def fetch(self, folder_or_tag: str) -> list[RawEmail]:
        conn = self._connect()
        try:
            if is_tag(folder_or_tag):
                conn.select("INBOX", readonly=not self.s.mark_as_read)
                tag = folder_or_tag.strip().replace('"', "")
                # IMAP SEARCH: SUBJECT faz busca por substring
                status, data = conn.search(None, f'(SUBJECT "{tag}")')
            else:
                conn.select(f'"{folder_or_tag}"', readonly=not self.s.mark_as_read)
                status, data = conn.search(None, "UNSEEN")
            if status != "OK":
                return []
            ids = data[0].split()[-self.s.fetch_limit:]
            out = []
            for num in ids:
                # BODY.PEEK nao altera a flag \Seen
                fetch_cmd = "(RFC822)" if self.s.mark_as_read else "(BODY.PEEK[])"
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


def get_mail_client(settings: MailSettings):
    faltam = settings.missing()
    if faltam:
        raise MailNotConfigured("Configure a conexão com o Outlook (engrenagem no topo). Falta: " + ", ".join(faltam) + ".")
    if settings.backend == "imap":
        return IMAPMailClient(settings)
    return O365MailClient(settings)
