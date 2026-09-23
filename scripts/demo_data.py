"""
Dados ficticios usados SOMENTE por scripts/export_mock_data.py para gerar
static/js/mock-data.js (dashboard aberto com ?mock=1). O aplicativo nunca
cria projetos ou e-mails de exemplo.

Os e-mails gerados passam pelo MESMO motor de analise dos e-mails reais.
"""

from __future__ import annotations

import random
import uuid
from datetime import datetime, timedelta, timezone

from services.outlook_client import RawEmail

STAKEHOLDERS = [
    ("Ana Souza", "ana.souza@acme.com.br"),
    ("Carlos Mendes", "carlos.mendes@acme.com.br"),
    ("Beatriz Lima", "beatriz.lima@cliente.com"),
    ("Rafael Costa", "rafael.costa@acme.com.br"),
    ("Juliana Rocha", "juliana.rocha@fornecedor.io"),
    ("Pedro Almeida", "pedro.almeida@cliente.com"),
    ("Mariana Duarte", "mariana.duarte@acme.com.br"),
]
SENDER_WEIGHTS = [9, 7, 6, 4, 3, 2, 2]

# (assunto, corpo HTML). {tag}, {nome}, {data}, {dia} sao preenchidos.
TEMPLATES = [
    ("URGENTE: deploy bloqueado no ambiente de homologação",
     "<p>Olá time,</p><p>O deploy do módulo financeiro está <b>bloqueado</b> por falta de acesso ao banco de "
     "homologação. Precisamos que o {nome} libere as permissões até {dia}.</p><p>Sem isso o prazo de entrega "
     "do dia {data} fica comprometido.</p><p>Atenciosamente,</p><p>{remetente}<br>Gerente de Projetos</p>"),
    ("Status semanal do projeto",
     "<p>Pessoal,</p><p>Segue o status da semana: concluímos a migração dos cadastros de clientes e a "
     "integração com o gateway de pagamentos avançou 70%.</p><p>Próximos passos: testes de carga e "
     "documentação da API.</p><p>Abraços,</p><p>{remetente}</p>"),
    ("Reunião de alinhamento - cronograma",
     "<p>Oi {nome},</p><p>Vamos marcar uma reunião {dia} às 14h para revisar o cronograma da fase 2 e o "
     "orçamento de infraestrutura.</p><p>Obrigado,</p><p>{remetente}</p>"),
    ("Revisar documento de requisitos v3",
     "<p>Bom dia,</p><p>Enviei a versão 3 do documento de requisitos. Peço que revisem as seções de "
     "relatórios fiscais e aprovem até {data}.</p><p>Att,</p><p>{remetente}</p>"
     "<div id='divRplyFwdMsg'><b>De:</b> {nome}<br><b>Enviado:</b> segunda<br>versão anterior urgente</div>"),
    ("Risco: atraso na entrega do fornecedor",
     "<p>Time,</p><p>O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o "
     "go-live previsto para {data}.</p><p>Sugiro escalar com o {nome} ainda hoje.</p><p>Abs,</p><p>{remetente}</p>"),
    ("Dúvida sobre o layout dos relatórios",
     "<p>Olá,</p><p>O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do "
     "sistema antigo. Alguém tem o arquivo de referência?</p><p>Obrigada,</p><p>{remetente}</p>"),
    ("Incidente em produção - falha na conciliação",
     "<p>Pessoal,</p><p>Tivemos uma falha crítica na rotina de conciliação bancária esta madrugada. O "
     "processo está parado e precisamos de correção imediata.</p><p>{nome}, consegue verificar os logs "
     "agora?</p><p>Prazo: {dia} até 12h.</p><p>Atenciosamente,</p><p>{remetente}</p>"),
    ("Ata da reunião de kickoff",
     "<p>Prezados,</p><p>Segue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e "
     "responsabilidades e o calendário de sprints.</p><p>Qualquer ajuste, me avisem.</p><p>Cordialmente,</p>"
     "<p>{remetente}</p><p>Esta mensagem pode conter informação confidencial.</p>"),
    ("Aprovação do orçamento de cloud",
     "<p>Oi,</p><p>Precisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação "
     "até {data} o provisionamento dos ambientes atrasa.</p><p>Obrigado,</p><p>{remetente}</p>"),
    ("Entrega da sprint 7 concluída",
     "<p>Time,</p><p>A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e "
     "exportação para Excel.</p><p>Parabéns a todos!</p><p>{remetente}</p>"),
    ("Teste de integração com o ERP",
     "<p>Bom dia,</p><p>Os testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou "
     "documentar os resultados na wiki do projeto.</p><p>Abraço,</p><p>{remetente}</p>"),
]
WEEKDAYS = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira"]


def generate_emails(category: str, count: int, days_back: int = 30, seed: int | None = None) -> list[RawEmail]:
    """E-mails ficticios de uma categoria do Outlook (a categoria nao vai no assunto)."""
    rnd = random.Random(seed)
    now = datetime.now(timezone.utc)
    emails = []
    for _ in range(count):
        subject, body = rnd.choice(TEMPLATES)
        name, addr = rnd.choices(STAKEHOLDERS, weights=SENDER_WEIGHTS)[0]
        other = rnd.choice([s for s in STAKEHOLDERS if s[0] != name])[0]
        # dias uteis recebem mais e-mail; recentes um pouco mais
        offset = min(int(rnd.expovariate(1 / max(days_back / 2.5, 0.01))), days_back) if days_back else 0
        when = now - timedelta(days=offset, hours=rnd.randint(0, 9), minutes=rnd.randint(0, 59))
        if when.weekday() >= 5 and rnd.random() < 0.7:
            when -= timedelta(days=when.weekday() - 4)
        due = when + timedelta(days=rnd.randint(2, 12))
        prefix = rnd.choice(["", "", "RE: ", "RES: "])
        emails.append(RawEmail(
            message_id=f"<demo-{uuid.UUID(int=rnd.getrandbits(128))}@pm.local>",
            subject=f"{prefix}{subject}",
            sender=f"{name} <{addr}>",
            date=when,
            body=body.format(nome=other, remetente=name, data=due.strftime("%d/%m"),
                             dia=rnd.choice(WEEKDAYS)),
            importance="high" if "URGENTE" in subject or "Incidente" in subject else "normal",
        ))
    return emails


DEMO_PROJECTS = [
    ("Migração ERP", "Migração do ERP legado para a nova plataforma em nuvem.", "Projeto ERP", 90),
    ("Portal do Cliente", "Novo portal de autoatendimento e relatórios.", "Portal do Cliente", 35),
]


def seed_demo(db) -> None:
    """Cria os projetos de exemplo num banco (temporario) e processa os e-mails."""
    for i, (name, desc, category, n) in enumerate(DEMO_PROJECTS):
        pid = db.create_project(name, desc, category)
        for raw in generate_emails(category, count=n, days_back=45, seed=42 + i):
            db.ingest(pid, raw)
