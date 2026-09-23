"""
Motor de resumos por logica pura (sem IA).

Tudo aqui e processamento de texto tradicional: parsing de HTML com a
biblioteca padrao, expressoes regulares, contagem de palavras e uma tabela
de pontuacao de gatilhos. Nenhum modelo de linguagem, API externa ou
biblioteca de NLP e usado.

Fluxo de ``analyze_email``:

    corpo bruto (HTML ou texto)
        -> html_to_text            (tags viram quebras de linha)
        -> strip_reply_history     (corta "Em ... escreveu:", "From: ... Sent:")
        -> strip_signature         (corta "Atenciosamente", "-- ", disclaimers)
        -> split_sentences
        -> extract_keywords        (frequencia sem stopwords PT/EN)
        -> find_action_sentences   (gatilhos + datas/nomes)
        -> score_urgency           (soma ponderada dos gatilhos)
        -> build_summary           (sentencas extrativas mais pontuadas)
"""

from __future__ import annotations

import html
import re
import unicodedata
from collections import Counter
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from email.utils import parseaddr, parsedate_to_datetime
from html.parser import HTMLParser
from typing import Iterable

# ---------------------------------------------------------------------------
# Utilitarios de normalizacao
# ---------------------------------------------------------------------------


def fold(text: str) -> str:
    """Minusculas e sem acentos: 'Reunião' -> 'reuniao'. Base de toda comparacao."""
    decomposed = unicodedata.normalize("NFKD", text.lower())
    return "".join(c for c in decomposed if not unicodedata.combining(c))


# ---------------------------------------------------------------------------
# 1. HTML -> texto
# ---------------------------------------------------------------------------

_BLOCK_TAGS = {
    "p", "div", "br", "li", "tr", "table", "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote", "hr", "section", "article", "header", "footer", "ul", "ol",
}
_SKIP_TAGS = {"style", "script", "head", "title", "meta"}


class _TextExtractor(HTMLParser):
    """HTMLParser da stdlib que converte tags de bloco em quebras de linha."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self._skip_depth = 0
        self._quote_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in _SKIP_TAGS:
            self._skip_depth += 1
        # Outlook/Gmail envolvem o historico em <blockquote> ou div#divRplyFwdMsg
        attrs_d = dict(attrs)
        if tag == "blockquote" or attrs_d.get("id") in ("divRplyFwdMsg", "appendonsend"):
            self._quote_depth += 1
            self.parts.append("\n⁣QUOTE⁣\n")  # marcador invisivel
        if tag in _BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in _SKIP_TAGS and self._skip_depth:
            self._skip_depth -= 1
        if tag in _BLOCK_TAGS:
            self.parts.append("\n")

    def handle_startendtag(self, tag, attrs):
        if tag in ("br", "hr"):
            self.parts.append("\n")

    def handle_data(self, data):
        if not self._skip_depth:
            self.parts.append(data)


_HTML_HINT = re.compile(r"<\s*(html|body|div|p|br|table|span)\b", re.I)
QUOTE_MARK = "⁣QUOTE⁣"


def looks_like_html(body: str) -> bool:
    return bool(_HTML_HINT.search(body or ""))


def html_to_text(body: str) -> str:
    """Converte HTML em texto plano preservando quebras de paragrafo."""
    if not body:
        return ""
    if not looks_like_html(body):
        return html.unescape(body)
    parser = _TextExtractor()
    parser.feed(body)
    parser.close()
    return "".join(parser.parts)


def normalize_whitespace(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = "\n".join(line.strip() for line in text.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", text).strip()


# ---------------------------------------------------------------------------
# 2. Remocao de historico de respostas
# ---------------------------------------------------------------------------

# Cada padrao marca o INICIO do historico; tudo a partir dele e descartado.
_REPLY_HEADERS = [
    QUOTE_MARK,
    r"^-{2,}\s*(original message|mensagem original|forwarded message|mensagem encaminhada)\s*-{2,}",
    r"^_{10,}\s*$",                                                  # linha do Outlook
    r"^(em|on)\s.{5,200}?\s(escreveu|wrote)\s*:\s*$",                # Gmail PT/EN
    r"^(de|from)\s*:\s*.+\n\s*(enviado|enviada|sent|date|data)\s*:",  # cabecalho Outlook
    r"^(de|from)\s*:\s*.+\n\s*(para|to)\s*:",
]
_REPLY_RE = [re.compile(p, re.I | re.M) for p in _REPLY_HEADERS]


def strip_reply_history(text: str) -> str:
    """Corta o texto no primeiro cabecalho de resposta/encaminhamento."""
    cut = len(text)
    for rx in _REPLY_RE:
        m = rx.search(text)
        # m.start() > 0 evita apagar e-mails que so contem um encaminhamento
        if m and 0 < m.start() < cut:
            cut = m.start()
    text = text[:cut]
    # linhas citadas no estilo "> texto"
    return "\n".join(l for l in text.split("\n") if not l.lstrip().startswith(">"))


# ---------------------------------------------------------------------------
# 3. Remocao de assinatura e disclaimers
# ---------------------------------------------------------------------------

_SIGNOFFS = [
    r"--\s*",
    r"atenciosamente[,.!]?",
    r"att\.?,?",
    r"abs\.?,?",
    r"abra[cç]os?[,.!]?",
    r"cordialmente[,.!]?",
    r"obrigad[oa][,.!]?",
    r"grat[oa][,.!]?",
    r"sauda[cç][oõ]es[,.!]?",
    r"(best|kind|warm)?\s*regards[,.!]?",
    r"thanks?( you)?[,.!]?",
    r"cheers[,.!]?",
    r"sincerely[,.!]?",
    r"enviado do meu .*",
    r"sent from my .*",
    r"get outlook for .*",
    r"obter o outlook para .*",
]
_SIGNOFF_RE = re.compile(r"^\s*(" + "|".join(_SIGNOFFS) + r")\s*$", re.I)

_DISCLAIMER_RE = re.compile(
    r"(esta mensagem.{0,80}(confidencial|destinat[aá]rio)"
    r"|this (e-?mail|message).{0,80}(confidential|intended)"
    r"|aviso legal|disclaimer\s*:"
    r"|antes de imprimir.{0,40}meio ambiente"
    r"|please consider the environment)",
    re.I,
)


def strip_signature(text: str, sender_name: str | None = None) -> str:
    """Remove despedida + assinatura, avisos legais e o nome do remetente no rodape."""
    lines = text.split("\n")
    for i, line in enumerate(lines):
        # i >= 1: um "Obrigado!" na primeira linha e conteudo, nao assinatura
        if i >= 1 and _SIGNOFF_RE.match(line):
            lines = lines[:i]
            break
    # assinatura sem despedida: ultimas linhas que comecam com o nome do remetente
    if sender_name:
        name = fold(sender_name).strip()
        while len(lines) > 1 and (not lines[-1].strip() or (name and fold(lines[-1]).strip().startswith(name))):
            lines.pop()
    kept = "\n".join(lines)
    m = _DISCLAIMER_RE.search(kept)
    if m:
        kept = kept[: m.start()]
    return kept


def clean_body(body: str, sender_name: str | None = None) -> str:
    """Pipeline completo de limpeza: HTML -> texto -> sem historico -> sem assinatura."""
    text = html_to_text(body)
    text = normalize_whitespace(text)
    text = strip_reply_history(text)
    text = strip_signature(text, sender_name)
    return normalize_whitespace(text)


# ---------------------------------------------------------------------------
# 4. Palavras-chave (frequencia sem stopwords)
# ---------------------------------------------------------------------------

STOPWORDS_PT = set(fold(w) for w in """
a ao aos aquela aquelas aquele aqueles aquilo as ate com como da das de dela
delas dele deles depois do dos e ela elas ele eles em entre era eram essa essas
esse esses esta estao estas este estes estou eu foi foram ha isso isto ja la lhe
lhes mais mas me mesmo meu meus minha minhas muito na nas nem no nos nossa
nossas nosso nossos num numa o os ou para pela pelas pelo pelos por qual quando
que quem se sem ser seu seus so sua suas tambem te tem temos tenho ter teu tua
um uma umas uns voce voces vos sao sera serao seria esta estava estamos
pode podem poderia fazer feito faz favor ola oi bom dia boa tarde noite pessoal
prezado prezada prezados caro cara segue seguem conforme sobre abaixo acima
aqui ainda assim bem cada coisa onde porque pois entao tudo todos todas toda
todo vai vou vamos fica ficou outro outra outros outras apenas agora hoje
alguma algum alguns algumas nao sim qualquer tal tanto ter tive teve tivemos
obrigado obrigada att atenciosamente abs abraco abracos email e-mail mail
""".split())

STOPWORDS_EN = set("""
a about above after again against all am an and any are as at be because been
before being below between both but by can could did do does doing down during
each few for from further had has have having he her here hers herself him
himself his how i if in into is it its itself just me more most my myself no nor
not now of off on once only or other our ours ourselves out over own same she
should so some such than that the their theirs them themselves then there these
they this those through to too under until up very was we were what when where
which while who whom why will with would you your yours yourself yourselves
hi hello dear team please thanks thank regards best let know also get got
like need needs one two may might must shall us via per re fw fwd cc
""".split())

STOPWORDS = STOPWORDS_PT | STOPWORDS_EN

_WORD_RE = re.compile(r"[a-zà-ÿ0-9][a-zà-ÿ0-9_-]*[a-zà-ÿ0-9]", re.I)


def tokenize(text: str) -> list[str]:
    """Palavras dobradas (sem acento/minusculas) com 3+ letras, sem numeros puros."""
    tokens = []
    for raw in _WORD_RE.findall(text):
        w = fold(raw)
        if len(w) < 3 or w.isdigit() or w in STOPWORDS:
            continue
        if re.fullmatch(r"[\d/:.-]+", w):  # datas/horas
            continue
        tokens.append(w)
    return tokens


def extract_keywords(text: str, top_n: int = 8) -> list[tuple[str, int]]:
    """As ``top_n`` palavras mais frequentes. Empate: ordem de primeira aparicao."""
    counts = Counter(tokenize(text))
    return counts.most_common(top_n)


# ---------------------------------------------------------------------------
# 5. Gatilhos de acao, datas e nomes
# ---------------------------------------------------------------------------

# categoria -> (peso, radicais ja sem acento). Radicais casam no inicio da palavra.
ACTION_TRIGGERS: dict[str, tuple[int, tuple[str, ...]]] = {
    "urgente":   (4, ("urgent", "urgencia", "asap", "imediat", "critic", "emergenc", "prioridade maxima")),
    "bloqueado": (4, ("bloquead", "bloqueio", "blocked", "blocker", "impediment", "travad", "parad", "stuck")),
    "prazo":     (3, ("prazo", "deadline", "vencimento", "vence", "atras", "overdue", "late", "due")),
    "entregar":  (2, ("entreg", "deliver", "go-live", "golive", "release", "deploy", "publicar")),
    "revisar":   (2, ("revis", "review", "aprova", "approv", "validar", "valida", "homolog", "sign-off", "signoff")),
    "reuniao":   (1, ("reuniao", "reunioes", "meeting", "call", "alinhamento", "agenda", "convite")),
    "risco":     (2, ("risco", "risk", "escalat", "escalon", "problema", "issue", "falha", "erro", "incidente")),
}

_TRIGGER_RE = {
    cat: re.compile(r"\b(" + "|".join(re.escape(s) for s in stems) + r")[a-z-]*", re.I)
    for cat, (_, stems) in ACTION_TRIGGERS.items()
}

_WEEKDAYS = r"(segunda|terca|quarta|quinta|sexta)(-feira)?|sabado|domingo|monday|tuesday|wednesday|thursday|friday|saturday|sunday"
_MONTHS = (r"janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro"
           r"|january|february|march|april|june|july|august|september|october|november|december"
           r"|jan|fev|feb|mar|abr|apr|mai|jun|jul|ago|aug|set|sep|out|oct|nov|dez|dec")
DATE_RE = re.compile(
    r"\b("
    r"\d{1,2}/\d{1,2}(/\d{2,4})?"                     # 15/10 ou 15/10/2026
    r"|\d{4}-\d{2}-\d{2}"                             # 2026-10-15
    r"|\d{1,2}\s+de\s+(" + _MONTHS + r")"             # 15 de outubro
    r"|(" + _MONTHS + r")\s+\d{1,2}(st|nd|rd|th)?"    # October 15th
    r"|dia\s+\d{1,2}(/\d{1,2}(/\d{2,4})?)?"             # dia 15, dia 15/10
    r"|(" + _WEEKDAYS + r")"                          # sexta-feira
    r"|hoje|amanha|depois de amanha|today|tomorrow|tonight"
    r"|fim do dia|final do dia|eod|cob|fim da semana|end of (the )?(day|week)"
    r"|proxima semana|semana que vem|next week"
    r"|\d{1,2}h(\d{2})?|\d{1,2}:\d{2}"                # 14h, 14h30, 10:30
    r")\b",
    re.I,
)

# Nome: @mencao, ou 2-3 palavras capitalizadas seguidas, ou Capitalizada apos preposicao.
_CAP = r"[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+"
NAME_RE = re.compile(
    r"@[\w.]+"
    r"|\b" + _CAP + r"(?:\s+(?:da|de|do|dos|das)?\s*" + _CAP + r"){1,2}\b"
    r"|\b(?:com|para|pelo|pela|with|from|by)\s(?P<after>" + _CAP + r")\b"
)
_NOT_NAMES = {fold(w) for w in (
    "Segunda Terça Quarta Quinta Sexta Sábado Domingo Monday Tuesday Wednesday Thursday "
    "Friday Saturday Sunday Janeiro Fevereiro Março Abril Maio Junho Julho Agosto Setembro "
    "Outubro Novembro Dezembro Olá Bom Boa Prezado Prezados Pessoal Time Equipe Hi Hello Dear Team"
).split()}


def find_names(sentence: str) -> list[str]:
    names = []
    for m in NAME_RE.finditer(sentence):
        cand = (m.group("after") or m.group(0)).strip()
        first = fold(cand.lstrip("@").split()[0])
        if first in _NOT_NAMES:
            continue
        names.append(cand)
    return names


def find_triggers(sentence: str) -> list[tuple[str, int]]:
    """Lista de (categoria, posicao) dos gatilhos encontrados na sentenca."""
    folded = fold(sentence)
    hits = []
    for cat, rx in _TRIGGER_RE.items():
        m = rx.search(folded)
        if m:
            hits.append((cat, m.start()))
    return hits


_SENT_SPLIT = re.compile(r"(?<=[.!?;])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9@\-•*])|\n+")


def split_sentences(text: str) -> list[str]:
    sentences = []
    for s in _SENT_SPLIT.split(text):
        s = s.strip(" -•*\t")
        if len(s) >= 12 and re.search(r"[a-zA-Z]", s):
            sentences.append(s)
    return sentences


@dataclass
class ActionItem:
    sentence: str
    triggers: list[str]
    dates: list[str]
    names: list[str]
    score: int
    # True quando uma data/nome aparece DEPOIS do gatilho ("entregar ate sexta")
    followed_by_context: bool


def find_action_sentences(sentences: Iterable[str], limit: int = 6) -> list[ActionItem]:
    """Captura sentencas com gatilhos de acao e pontua as seguidas de datas/nomes."""
    items: list[ActionItem] = []
    for s in sentences:
        hits = find_triggers(s)
        if not hits:
            continue
        folded = fold(s)
        first_trigger_pos = min(pos for _, pos in hits)
        date_matches = list(DATE_RE.finditer(folded))
        names = find_names(s)
        # posicao dos nomes medida no texto dobrado (mesmo comprimento que o original)
        name_after = any(folded.find(fold(n)) > first_trigger_pos for n in names)
        date_after = any(m.start() > first_trigger_pos for m in date_matches)

        score = sum(ACTION_TRIGGERS[cat][0] for cat, _ in hits)
        score += 2 if date_matches else 0
        score += 1 if names else 0
        items.append(ActionItem(
            sentence=s,
            triggers=[cat for cat, _ in hits],
            dates=[s[m.start():m.end()] for m in date_matches],
            names=names,
            score=score,
            followed_by_context=date_after or name_after,
        ))
    # prioriza as que tem contexto; mantem as melhores
    items.sort(key=lambda it: (it.followed_by_context, it.score), reverse=True)
    return items[:limit]


# ---------------------------------------------------------------------------
# 6. Pontuacao de urgencia
# ---------------------------------------------------------------------------

URGENCY_LEVELS = [  # (score minimo, nivel)
    (12, "critica"),
    (7, "alta"),
    (3, "media"),
    (0, "baixa"),
]
_MAX_HITS_PER_CATEGORY = 3  # evita que um e-mail repetitivo exploda a nota
_RESOLUTION_RE = re.compile(
    r"\b(conclui|concluid|finalizad|resolvid|solucionad|sucesso|normalizad|liberad"
    r"|resolved|completed|done|fixed|success)[a-z]*", re.I)


def score_urgency(subject: str, text: str, importance: str | None = None) -> tuple[int, str, dict]:
    """Soma ponderada dos gatilhos no corpo + bonus de assunto/importancia/pontuacao."""
    folded = fold(text)
    breakdown: dict[str, int] = {}
    score = 0
    for cat, rx in _TRIGGER_RE.items():
        n = min(len(rx.findall(folded)), _MAX_HITS_PER_CATEGORY)
        if n:
            pts = n * ACTION_TRIGGERS[cat][0]
            breakdown[cat] = pts
            score += pts

    subj_hits = find_triggers(subject or "")
    if subj_hits:  # gatilho no assunto soma de novo o peso da categoria
        pts = sum(ACTION_TRIGGERS[c][0] for c, _ in subj_hits)
        breakdown["assunto"] = pts
        score += pts
    if subject and re.search(r"[A-Z]{5,}", subject) and subject.upper() == subject:
        breakdown["assunto_caixa_alta"] = 2
        score += 2
    if (importance or "").lower() == "high":
        breakdown["importancia_alta"] = 3
        score += 3
    bangs = min(text.count("!"), 3)
    if bangs:
        breakdown["exclamacoes"] = bangs
        score += bangs

    # sinais de resolucao ("concluido", "resolvido") reduzem a nota
    resolved = min(len(_RESOLUTION_RE.findall(fold(f"{subject}\n{text}"))), 3)
    if resolved:
        breakdown["resolucao"] = -2 * resolved
        score = max(0, score - 2 * resolved)

    level = next(lvl for minimum, lvl in URGENCY_LEVELS if score >= minimum)
    return score, level, breakdown


# ---------------------------------------------------------------------------
# 7. Resumo extrativo
# ---------------------------------------------------------------------------


def build_summary(sentences: list[str], keywords: list[tuple[str, int]], max_sentences: int = 3) -> str:
    """Escolhe as sentencas com mais peso de palavras-chave + gatilhos, na ordem original."""
    if not sentences:
        return ""
    kw_weight = dict(keywords)
    scored = []
    for idx, s in enumerate(sentences):
        toks = tokenize(s)
        if not toks:
            continue
        kw = sum(kw_weight.get(t, 0) for t in toks) / (len(toks) ** 0.5)
        trig = sum(ACTION_TRIGGERS[c][0] for c, _ in find_triggers(s))
        position = 1.0 if idx == 0 else 0.0  # a abertura costuma dizer o assunto
        scored.append((kw + trig + position, idx, s))
    best = sorted(scored, reverse=True)[:max_sentences]
    best.sort(key=lambda t: t[1])
    summary = " ".join(s if s[-1] in ".!?" else s + "." for _, _, s in best)
    return summary[:600]


# ---------------------------------------------------------------------------
# 8. Remetente e data
# ---------------------------------------------------------------------------


def parse_sender(raw_sender: str) -> tuple[str, str]:
    """'Ana Souza <ana@x.com>' -> ('Ana Souza', 'ana@x.com'). Sem nome, deriva do e-mail."""
    name, addr = parseaddr(raw_sender or "")
    addr = addr.lower()
    if not name and addr:
        local = addr.split("@")[0]
        name = " ".join(p.capitalize() for p in re.split(r"[._-]+", local) if p)
    return name or "Desconhecido", addr


def parse_date(raw_date) -> datetime:
    """Aceita datetime, RFC 2822 ('Tue, 22 Sep 2026 10:00:00 -0300') ou ISO 8601."""
    if isinstance(raw_date, datetime):
        dt = raw_date
    elif raw_date:
        try:
            dt = parsedate_to_datetime(str(raw_date))
        except (TypeError, ValueError):
            try:
                dt = datetime.fromisoformat(str(raw_date).replace("Z", "+00:00"))
            except ValueError:
                dt = datetime.now(timezone.utc)
    else:
        dt = datetime.now(timezone.utc)
    if dt.tzinfo is not None:  # grava sempre em UTC ingenuo
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


# ---------------------------------------------------------------------------
# API publica
# ---------------------------------------------------------------------------


@dataclass
class EmailAnalysis:
    sender_name: str
    sender_email: str
    date_received: datetime
    clean_text: str
    summary: str
    keywords: list[tuple[str, int]]
    action_items: list[ActionItem] = field(default_factory=list)
    urgency_score: int = 0
    urgency_level: str = "baixa"
    urgency_breakdown: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["date_received"] = self.date_received.isoformat()
        d["keywords"] = [{"word": w, "count": c} for w, c in self.keywords]
        return d


def analyze_email(subject: str, body: str, sender: str = "", date=None,
                  importance: str | None = None) -> EmailAnalysis:
    """Ponto de entrada: recebe o e-mail cru e devolve o resumo estruturado."""
    sender_name, sender_email = parse_sender(sender)
    text = clean_body(body, sender_name)
    sentences = split_sentences(text)
    # assunto entra na contagem de palavras-chave: costuma nomear o tema
    subject_words = _SUBJECT_NOISE_RE.sub(" ", subject or "")
    keywords = extract_keywords(f"{subject_words}\n{text}")
    actions = find_action_sentences(sentences)
    score, level, breakdown = score_urgency(subject, text, importance)
    summary = build_summary(sentences, keywords) or (text[:280] if text else subject)
    return EmailAnalysis(
        sender_name=sender_name,
        sender_email=sender_email,
        date_received=parse_date(date),
        clean_text=text,
        summary=summary,
        keywords=keywords,
        action_items=actions,
        urgency_score=score,
        urgency_level=level,
        urgency_breakdown=breakdown,
    )


_TAG_RE = re.compile(r"\[([A-Z][A-Z0-9]*-\d+)\]")
# tag do projeto e prefixos RE:/FW:/ENC: nao sao palavras-chave
_SUBJECT_NOISE_RE = re.compile(r"\[[^\]]*\]|\b(re|fw|fwd|enc|res)\s*:", re.I)


def extract_project_tag(subject: str) -> str | None:
    """'RE: [PROJ-01] Status' -> 'PROJ-01'."""
    m = _TAG_RE.search(subject or "")
    return m.group(1) if m else None
