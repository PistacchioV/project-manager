"""
Leitura da caixa de correio pelo Outlook instalado na maquina (COM/MAPI).

Mesmo modelo do OTC Tracker: o app nao guarda senha nem token. Ele pede ao
Outlook aberto no Windows a caixa pelo e-mail
(``Dispatch('Outlook.Application').GetNamespace('MAPI').Folders[email]``) e
usa o acesso que o usuario ja tem, seja a caixa propria ou uma compartilhada
adicionada ao perfil. Por isso so o e-mail e configurado na tela.

Regra de busca (lidos ou nao). O projeto aponta para uma fonte (``source_type``) e um valor
(``outlook_folder_or_tag``):

* ``category`` - e-mails marcados com essa CATEGORIA do Outlook, na Caixa
  de Entrada e em todas as subpastas (o filtro de categoria roda no MAPI).
* ``person``   - e-mails que essa PESSOA enviou, ou em que voce e ela estao
  juntos em Para/Cc. "Voce" = a caixa configurada + o usuario logado no
  Outlook. So a Caixa de Entrada, SEM subpastas, e so os ultimos
  ``lookback_days`` dias (padrao 90): remetente/destinatario sao conferidos
  item a item em Python, e varrer a arvore de pastas ficaria gigante.

Windows-only. Fora do Windows (ou sem pywin32) levanta ``OutlookUnavailable``
com o motivo, e a tela mostra a mensagem.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

log = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

OL_FOLDER_INBOX = 6            # olFolderInbox
OL_MAIL_ITEM = 43              # olMail (ignora convites, relatorios de entrega...)
OL_IMPORTANCE_HIGH = 2
# propriedade multivalor das categorias; "=" casa se QUALQUER categoria for igual
DASL_CATEGORIES = "urn:schemas-microsoft-com:office:office#Keywords"
PR_INTERNET_MESSAGE_ID = "http://schemas.microsoft.com/mapi/proptag/0x1035001F"
PR_SENDER_SMTP_ADDRESS = "http://schemas.microsoft.com/mapi/proptag/0x5D01001F"
PR_SMTP_ADDRESS = "http://schemas.microsoft.com/mapi/proptag/0x39FE001F"
DASL_DATE_RECEIVED = "urn:schemas:httpmail:datereceived"
OL_TO, OL_CC = 1, 2            # Recipient.Type (3 = Cco, que nao conta)


class MailNotConfigured(RuntimeError):
    """O e-mail da caixa ainda nao foi informado na tela."""


class OutlookUnavailable(EnvironmentError):
    """Sem Windows/pywin32/Outlook, ou a caixa nao esta no perfil do Outlook."""


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
    fetch_limit: int = 50
    mark_as_read: bool = False
    lookback_days: int = 90

    @classmethod
    def from_dict(cls, d: dict) -> "MailSettings":
        return cls(
            mailbox=(d.get("mailbox") or "").strip(),
            fetch_limit=int(d.get("fetch_limit") or 50),
            mark_as_read=str(d.get("mark_as_read")) in ("1", "true", "True"),
            lookback_days=int(d.get("lookback_days") or 90),
        )

    def missing(self) -> list[str]:
        """Campos obrigatorios ainda vazios (lista vazia = pronto para conectar)."""
        return [] if EMAIL_RE.match(self.mailbox) else ["e-mail do Outlook"]


def has_category(categories: str, wanted: str) -> bool:
    """msg.Categories vem como 'A, B' (separador de lista do Windows: ',' ou ';')."""
    alvo = wanted.strip().lower()
    return any(c.strip().lower() == alvo for c in re.split(r"[,;]", categories or ""))


def _walk(folder):
    """A pasta e todas as subpastas (categorizado pode ter sido movido por regra)."""
    yield folder
    subs = folder.Folders
    for i in range(1, subs.Count + 1):
        yield from _walk(subs.Item(i))


def _subpasta(folder, nome):
    """Subpasta pelo nome, sem diferenciar maiusculas e espacos nas pontas, ou None.

    Pelo indice nao da: a ordem das pastas no Outlook muda quando alguem cria outra.
    """
    subs = folder.Folders
    alvo = str(nome or "").strip().lower()
    for i in range(1, subs.Count + 1):
        f = subs.Item(i)
        if str(f.Name).strip().lower() == alvo:
            return f
    return None


def _local_to_utc(value) -> datetime:
    """ReceivedTime do COM vem no horario local da maquina; grava em UTC."""
    naive = datetime(value.year, value.month, value.day, value.hour, value.minute, value.second)
    return naive.astimezone(timezone.utc)  # datetime ingenuo = horario local


def _smtp_sender(msg) -> str:
    """Remetente interno do Exchange vem como endereco X500 (/O=...); resolve o SMTP.

    Tenta, em ordem: usuario do Exchange, propriedade MAPI do SMTP do remetente,
    e o proprio SenderEmailAddress so se ele for um e-mail de verdade.
    """
    try:
        if str(msg.SenderEmailType).upper() == "EX":
            user = msg.Sender.GetExchangeUser()
            if user is not None and user.PrimarySmtpAddress:
                return str(user.PrimarySmtpAddress)
    except Exception:  # noqa: BLE001 - lista de distribuicao, contato externo...
        pass
    try:
        smtp = msg.PropertyAccessor.GetProperty(PR_SENDER_SMTP_ADDRESS)
        if smtp and "@" in str(smtp):
            return str(smtp)
    except Exception:  # noqa: BLE001 - propriedade ausente em alguns itens
        pass
    addr = str(msg.SenderEmailAddress or "")
    return addr if "@" in addr else ""


def _smtp_of_entry(entry, fallback_address="", accessor=None) -> str:
    """SMTP de um AddressEntry/Recipient do Exchange (mesma ordem de _smtp_sender)."""
    try:
        user = entry.GetExchangeUser() if entry is not None else None
        if user is not None and user.PrimarySmtpAddress:
            return str(user.PrimarySmtpAddress)
    except Exception:  # noqa: BLE001
        pass
    try:
        if accessor is not None:
            smtp = accessor.GetProperty(PR_SMTP_ADDRESS)
            if smtp and "@" in str(smtp):
                return str(smtp)
    except Exception:  # noqa: BLE001
        pass
    addr = str(fallback_address or "")
    return addr if "@" in addr else ""


def _to_cc_smtp(msg) -> set[str]:
    """E-mails (minusculos) de quem esta em Para ou Cc. Cco nao conta."""
    out = set()
    rcpts = msg.Recipients
    for i in range(1, rcpts.Count + 1):
        r = rcpts.Item(i)
        try:
            if r.Type not in (OL_TO, OL_CC):
                continue
            smtp = _smtp_of_entry(r.AddressEntry, r.Address, r.PropertyAccessor)
            if smtp:
                out.add(smtp.lower())
        except Exception:  # noqa: BLE001 - destinatario ruim nao derruba a mensagem
            continue
    return out


def person_matches(sender: str, to_cc: set[str], person: str, me: set[str]) -> bool:
    """Regra do projeto "pessoa": ela enviou, OU ela e eu estamos juntos em Para/Cc."""
    person = person.strip().lower()
    if sender.strip().lower() == person:
        return True
    return person in to_cc and bool(me & to_cc)


class OutlookMailClient:
    def __init__(self, s: MailSettings):
        self.s = s

    # ------------------------------------------------------------- conexao
    def _open(self):
        """(com, inbox) da caixa configurada. Chamador faz CoUninitialize."""
        try:
            import pythoncom
            import win32com.client as w32
        except ImportError as exc:
            raise OutlookUnavailable(
                "Leitura do Outlook requer Windows com o Outlook instalado (pacote pywin32). "
                "Rode o app pelo iniciar.bat na máquina onde o Outlook está aberto.") from exc

        pythoncom.CoInitialize()  # cada thread do waitress precisa do seu apartment COM
        try:
            ns = w32.Dispatch("Outlook.Application").GetNamespace("MAPI")
        except Exception as exc:  # noqa: BLE001
            pythoncom.CoUninitialize()
            raise OutlookUnavailable(f"Não consegui abrir o Outlook: {exc}") from exc

        try:
            store = ns.Folders[self.s.mailbox]
        except Exception as exc:  # noqa: BLE001
            pythoncom.CoUninitialize()
            raise OutlookUnavailable(
                f"A caixa {self.s.mailbox} não está no Outlook desta máquina. "
                "Adicione-a ao perfil (própria ou compartilhada) e tente de novo.") from exc

        # Caixa de Entrada pelo tipo (independe do idioma); nomes como reserva
        inbox = None
        try:
            inbox = store.Store.GetDefaultFolder(OL_FOLDER_INBOX)
        except Exception:  # noqa: BLE001
            inbox = _subpasta(store, "Inbox") or _subpasta(store, "Caixa de Entrada")
        if inbox is None:
            pythoncom.CoUninitialize()
            raise OutlookUnavailable(f"Caixa de Entrada não encontrada em {self.s.mailbox}.")
        return pythoncom, inbox

    def test(self) -> str:
        com, inbox = self._open()
        try:
            return (f"Conectado a {self.s.mailbox} pelo Outlook desta máquina "
                    f"({inbox.Items.Count} mensagens na Caixa de Entrada).")
        finally:
            com.CoUninitialize()

    def categories(self) -> list[str]:
        """Categorias do perfil do Outlook (lista mestra), para sugerir no cadastro."""
        com, inbox = self._open()
        try:
            cats = inbox.Session.Categories
            return sorted((str(cats.Item(i).Name) for i in range(1, cats.Count + 1)), key=str.lower)
        finally:
            com.CoUninitialize()

    # -------------------------------------------------------------- leitura
    def _canonical_category(self, inbox, category: str) -> str:
        """Grafia exata da lista mestra ("projeto erp" -> "Projeto ERP")."""
        try:
            cats = inbox.Session.Categories
            for i in range(1, cats.Count + 1):
                if str(cats.Item(i).Name).strip().lower() == category.lower():
                    return str(cats.Item(i).Name)
        except Exception:  # noqa: BLE001 - sem lista mestra, usa o texto digitado
            pass
        return category

    def _my_addresses(self, inbox) -> set[str]:
        """'Eu' = a caixa configurada + o usuario logado no Outlook (se for outra caixa)."""
        me = {self.s.mailbox.lower()}
        try:
            cu = inbox.Session.CurrentUser
            smtp = _smtp_of_entry(cu.AddressEntry, cu.Address)
            if smtp:
                me.add(smtp.lower())
        except Exception:  # noqa: BLE001
            pass
        return me

    def fetch(self, value: str, source_type: str = "category") -> list[RawEmail]:
        """E-mails da fonte do projeto: categoria do Outlook ou pessoa (e-mail)."""
        value = (value or "").strip()
        com, inbox = self._open()
        try:
            if source_type == "person":
                person = value.lower()
                me = self._my_addresses(inbox)
                since = datetime.now(timezone.utc) - timedelta(days=self.s.lookback_days)
                # remetente/destinatario do Exchange nao filtra bem no MAPI (X500);
                # o pre-filtro e a janela de datas, e a regra roda em Python
                restriction = f"@SQL=\"{DASL_DATE_RECEIVED}\" >= '{since:%Y-%m-%d %H:%M}'"

                def keep(msg) -> bool:
                    if _smtp_sender(msg).lower() == person:
                        return True
                    return person_matches("", _to_cc_smtp(msg), person, me)

                folders = [inbox]  # so a Caixa de Entrada: sem subpastas
            else:
                category = self._canonical_category(inbox, value)
                restriction = f"@SQL=\"{DASL_CATEGORIES}\" = '{category.replace(chr(39), chr(39) * 2)}'"

                def keep(msg) -> bool:
                    return has_category(str(msg.Categories or ""), category)

                folders = _walk(inbox)  # Caixa de Entrada + subpastas

            found = []
            for folder in folders:
                items = folder.Items
                try:
                    items = items.Restrict(restriction)
                except Exception:  # noqa: BLE001 - algumas caixas recusam o filtro; varre tudo
                    log.info("Restrict recusado em %s/%s; varrendo", self.s.mailbox, folder.Name)
                items.Sort("[ReceivedTime]", True)
                n = 0
                for msg in items:
                    if n >= self.s.fetch_limit:
                        break
                    try:
                        # o teste em Python e o que decide (vale tambem sem Restrict)
                        if msg.Class != OL_MAIL_ITEM or not keep(msg):
                            continue
                        found.append(msg)
                        n += 1
                    except Exception as exc:  # noqa: BLE001 - um item ruim nao derruba a sincronizacao
                        log.warning("Mensagem ignorada: %s", exc)

            found.sort(key=lambda m: _local_to_utc(m.ReceivedTime), reverse=True)
            out: list[RawEmail] = []
            for msg in found[: self.s.fetch_limit]:
                try:
                    out.append(self._to_raw(msg, str(msg.Subject or "")))
                    if self.s.mark_as_read and msg.UnRead:
                        msg.UnRead = False
                        msg.Save()
                except Exception as exc:  # noqa: BLE001
                    log.warning("Mensagem ignorada: %s", exc)
            return out
        finally:
            com.CoUninitialize()

    @staticmethod
    def _to_raw(msg, subject: str) -> RawEmail:
        try:
            message_id = msg.PropertyAccessor.GetProperty(PR_INTERNET_MESSAGE_ID) or msg.EntryID
        except Exception:  # noqa: BLE001
            message_id = msg.EntryID
        name = str(msg.SenderName or "")
        addr = _smtp_sender(msg)
        return RawEmail(
            message_id=str(message_id),
            subject=subject,
            # aspas: nome corporativo "Souza, Ana" tem virgula
            sender=f'"{name.replace(chr(34), "")}" <{addr}>' if addr else name,
            date=_local_to_utc(msg.ReceivedTime),
            body=str(msg.HTMLBody or msg.Body or ""),
            importance="high" if msg.Importance == OL_IMPORTANCE_HIGH else "normal",
        )


def get_mail_client(settings: MailSettings) -> OutlookMailClient:
    if settings.missing():
        raise MailNotConfigured("Informe o e-mail do Outlook na engrenagem do topo.")
    return OutlookMailClient(settings)
