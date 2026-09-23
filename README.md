# Project Manager: inbox de projetos

Sistema de gerenciamento de projetos que lê a caixa do **Outlook**, separa os e-mails de cada projeto pela **categoria do Outlook** e gera **resumos, palavras-chave, sentenças de ação e nível de urgência só com lógica de código tradicional**: regex, parsing de HTML da biblioteca padrão, contagem de palavras e uma tabela de pesos.

> **Sem IA.** Não há LLM, OpenAI, LangChain nem biblioteca de NLP. Todo o motor está em [`services/email_parser.py`](services/email_parser.py) e pode ser auditado linha a linha.

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.9+ · Flask · Waitress |
| Banco | DuckDB (arquivo único em `data/`) |
| Frontend | HTML5 + Vanilla JS · Tailwind (runtime local do design system) · Iconify Solar · Chart.js (CDN) |
| E-mail | Outlook instalado no Windows via COM/MAPI (`pywin32`), como no OTC Tracker: só o e-mail da caixa |

## Rodar

**Windows:** dê um duplo clique em `iniciar.bat`. Ele encontra o Python, instala o `requirements.txt`, sobe o Waitress na porta 5080 e abre `http://127.0.0.1:5080/dashboard`.

**macOS/Linux:**

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py            # http://127.0.0.1:5080/dashboard
```

O app começa **vazio**: sem projetos, sem e-mails e sem dados de exemplo. Na primeira tela:
1. Clique na **engrenagem** (canto superior direito) e informe o **e-mail do Outlook** que será lido. Use **Testar conexão** e depois **Salvar**.
2. Crie um projeto e escolha a **categoria do Outlook** dele. A tela sugere as categorias que já existem no seu Outlook.
3. Clique em **Sincronizar Outlook**.

Testes: `python -m unittest discover -s tests`

## Estrutura

```
Project Manager/
├── app.py                      # Flask: create_app(), rotas de página e API JSON
├── config.py                   # configuração via variáveis de ambiente / .env
├── models.py                   # DuckDB: schema Project + EmailLog, consultas do dashboard
├── services/
│   ├── email_parser.py         # ★ motor de resumos por lógica pura
│   └── outlook_client.py       # leitura do Outlook local (COM/MAPI) + MailSettings
├── templates/dashboard.html    # página /dashboard
├── static/
│   ├── css/app.css             # tokens de tema claro/escuro + componentes
│   ├── js/dashboard.js         # gráficos, alertas, tabela expansível, tema
│   ├── js/mock-data.js         # dados fictícios no MESMO formato da API
│   ├── js/tailwind-config.js   # cores do Tailwind apontando para os tokens
│   ├── vendor/                 # runtime Tailwind + Iconify (cópia do design system)
│   └── img/                    # logo.svg, favicon.ico, PNGs
├── scripts/
│   ├── export_mock_data.py     # regenera mock-data.js a partir do backend (banco temporário)
│   └── demo_data.py            # e-mails fictícios usados só pelo script acima
├── tests/test_email_parser.py
├── iniciar.bat                 # instalador + servidor + navegador (Windows)
├── requirements.txt
└── .env.example
```

## Motor de regras (`services/email_parser.py`)

```
corpo bruto (HTML/texto)
  → html_to_text          HTMLParser da stdlib; <p>/<br>/<div> viram quebras; ignora <style>/<script>
  → strip_reply_history   corta em "Em … escreveu:", "-----Original Message-----",
                          "De: … Enviado:", "______", <blockquote>, div#divRplyFwdMsg
  → strip_signature       corta em "Atenciosamente", "Att", "Abs", "Regards", "-- ", "Enviado do meu…",
                          disclaimers de confidencialidade e o nome do remetente no rodapé
  → split_sentences
  → extract_keywords      Counter de tokens sem acento, sem stopwords PT/EN, 3+ letras
  → find_action_sentences gatilhos + datas (15/10, dia 24, sexta-feira, amanhã, 14h, EOD…)
                          + nomes (Nome Sobrenome, @menção, "com Carlos")
  → score_urgency         soma ponderada → baixa / média / alta / crítica
  → build_summary         3 sentenças com mais peso de palavras-chave e gatilhos, na ordem original
```

**Gatilhos e pesos** (radicais sem acento, casam no início da palavra):

| Categoria | Peso | Exemplos |
|---|---|---|
| urgente | 4 | urgente, asap, imediato, crítico, emergência |
| bloqueado | 4 | bloqueado, blocker, impedimento, travado, parado |
| prazo | 3 | prazo, deadline, vence, atraso, overdue |
| entregar | 2 | entregar, deliver, go-live, release, deploy |
| revisar | 2 | revisar, review, aprovar, validar, homologar |
| risco | 2 | risco, issue, falha, erro, incidente, escalar |
| reunião | 1 | reunião, meeting, call, alinhamento, agenda |

**Nota de urgência:** peso × ocorrências no corpo (no máximo 3 por categoria), mais o peso dos gatilhos do assunto, +2 para assunto em CAIXA ALTA, +3 para importância alta do Outlook e +1 por "!" (até 3). Sinais de resolução ("concluído", "resolvido", "sucesso") descontam 2 cada.
Faixas: **0–2 baixa · 3–6 média · 7–11 alta · 12+ crítica**. A composição de cada nota aparece na tela ao expandir o e-mail.

## Banco (DuckDB)

- **`AppSetting`**: `key, value`. Guarda o e-mail da caixa salvo pela tela.
- **`Project`**: `id, name, description, outlook_folder_or_tag, created_at`
- **`EmailLog`**: `id, project_id, message_id (único), subject, sender, sender_email, date_received (UTC), raw_body, clean_body, clean_summary, urgency_score, urgency_level, analysis_json, processed_at`

`message_id` impede reprocessar o mesmo e-mail a cada sincronização. `analysis_json` guarda palavras-chave, sentenças de ação e a composição da nota.

## Conectar o Outlook

O modelo é o mesmo do OTC Tracker: o app lê pelo **Outlook aberto no Windows** (COM/MAPI com `pywin32`), usando o acesso que você já tem. Não há senha, token nem cadastro no Azure. Basta informar o **e-mail da caixa** na engrenagem do topo.

- A caixa precisa estar no seu perfil do Outlook, seja a sua ou uma **compartilhada**, como `brazil.otc.ops@…` no OTC Tracker.
- O app precisa rodar na máquina onde o Outlook está aberto. Use o `iniciar.bat`, que instala o `pywin32`.
- Em macOS/Linux a tela abre normalmente, mas **Testar conexão** e **Sincronizar** avisam que a leitura exige Windows.
- O e-mail também pode vir do `.env` (`PM_MAILBOX`). O que for salvo pela tela tem prioridade.

**Regra de busca: categorias.** Cada projeto aponta para uma categoria do Outlook, gravada em `Project.outlook_folder_or_tag`. Na sincronização entram os e-mails, lidos ou não, que tenham essa categoria, na Caixa de Entrada e em todas as subpastas dela. Assim, um e-mail movido por regra continua sendo encontrado. Um e-mail com várias categorias entra em todos os projetos correspondentes. O nome é comparado sem diferenciar maiúsculas e minúsculas, e itens que não são e-mail (convites, relatórios de entrega) são ignorados. Por padrão os e-mails **não** são marcados como lidos (`PM_MAIL_MARK_AS_READ=0`).

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/dashboard` | página principal |
| GET / PUT | `/api/settings` | e-mail da caixa do Outlook |
| POST | `/api/settings/test` | testa a conexão com os dados do formulário, sem salvar |
| GET | `/api/projects` | projetos com contagem e urgentes |
| GET | `/api/outlook/categories` | categorias do Outlook, sugeridas no cadastro |
| POST | `/api/projects` | `{name, description, outlook_folder_or_tag}`, onde o último campo é a categoria |
| GET | `/api/projects/<id>/dashboard?days=30` | KPIs, volume diário/semanal, remetentes, alertas, palavras-chave |
| GET | `/api/projects/<id>/emails` | e-mails com resumo, texto limpo e original |
| POST | `/api/projects/<id>/sync` | lê o Outlook e processa os novos |
| POST | `/api/projects/<id>/emails` | processa um e-mail colado `{subject, sender, body}` |
| POST | `/api/analyze` | só analisa, sem gravar (bom para testar regras) |

Para ver o layout com dados fictícios, abra `/dashboard?mock=1`: nada é gravado e o banco não é tocado. Esse modo usa `window.MOCK_DATA`, que tem o formato idêntico ao das rotas acima. Depois de mudar a API, rode `python scripts/export_mock_data.py` para gerar o mock de novo.

## Tema

O botão no canto superior direito alterna entre claro e escuro. A escolha fica salva no navegador. Todas as cores são tokens em `static/css/app.css` (`:root[data-theme=…]`), e os gráficos são redesenhados com as cores do tema ativo.
