# Project Manager: inbox de projetos

Sistema de gerenciamento de projetos que lê a caixa do **Outlook**, filtra os e-mails de cada projeto (tag no assunto ou pasta) e gera **resumos, palavras-chave, sentenças de ação e nível de urgência só com lógica de código tradicional**: regex, parsing de HTML da biblioteca padrão, contagem de palavras e uma tabela de pesos.

> **Sem IA.** Não há LLM, OpenAI, LangChain nem biblioteca de NLP. Todo o motor está em [`services/email_parser.py`](services/email_parser.py) e pode ser auditado linha a linha.

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.9+ · Flask · Waitress |
| Banco | DuckDB (arquivo único em `data/`) |
| Frontend | HTML5 + Vanilla JS · Tailwind (runtime local do design system) · Iconify Solar · Chart.js (CDN) |
| E-mail | `O365` (Microsoft Graph) ou IMAP do Office 365, configurado pela tela (engrenagem) |

## Rodar

**Windows:** dê um duplo clique em `iniciar.bat`. Ele encontra o Python, instala o `requirements.txt`, sobe o Waitress na porta 5080 e abre `http://127.0.0.1:5080/dashboard`.

**macOS/Linux:**

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py            # http://127.0.0.1:5080/dashboard
```

O app começa **vazio**: sem projetos, sem e-mails e sem dados de exemplo. Na primeira tela:
1. Clique na **engrenagem** (canto superior direito) e informe o **e-mail do Outlook** que será lido, junto com as credenciais do app no Entra ID. Use **Testar conexão** e depois **Salvar**.
2. Crie um projeto com a tag do assunto (ex.: `[PROJ-01]`) ou o nome de uma pasta.
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
│   └── outlook_client.py       # leitores O365 (Graph) e IMAP + MailSettings
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

- **`AppSetting`**: `key, value`. Guarda a conexão com o Outlook salva pela tela.
- **`Project`**: `id, name, description, outlook_folder_or_tag, created_at`
- **`EmailLog`**: `id, project_id, message_id (único), subject, sender, sender_email, date_received (UTC), raw_body, clean_body, clean_summary, urgency_score, urgency_level, analysis_json, processed_at`

`message_id` impede reprocessar o mesmo e-mail a cada sincronização. `analysis_json` guarda palavras-chave, sentenças de ação e a composição da nota.

## Conectar o Outlook

Tudo pelo ícone de **engrenagem** no topo. A configuração fica gravada no banco local (`AppSetting`). Os segredos nunca são enviados de volta ao navegador: a tela só mostra "salvo", e deixar o campo em branco mantém o valor atual.

**Microsoft Graph (recomendado)**
1. No Microsoft Entra ID (Azure AD), registre um aplicativo e crie um client secret.
2. Dê a permissão de **aplicativo** `Mail.Read` (ou `Mail.ReadWrite`, para marcar como lido) e conceda o consentimento do administrador.
3. Na engrenagem, informe o e-mail da caixa, o Tenant ID, o Client ID e o Client Secret.

**IMAP:** o Exchange Online não aceita mais senha. Informe um token OAuth2 (XOAUTH2, escopo `IMAP.AccessAsUser.All`). O usuário do IMAP é o próprio e-mail.

Se preferir não digitar as credenciais na tela, o `.env` (veja `.env.example`) pode trazer os valores iniciais. O que for salvo pela tela tem prioridade.

**Regra de busca:** se `outlook_folder_or_tag` vier entre colchetes (`[PROJ-01]`), o sistema procura essa tag no assunto na Caixa de Entrada. Sem colchetes, o valor é tratado como nome de pasta e o sistema lê os não lidos dela. Por padrão os e-mails **não** são marcados como lidos (`PM_MAIL_MARK_AS_READ=0`).

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/dashboard` | página principal |
| GET / PUT | `/api/settings` | conexão com o Outlook (segredos mascarados na leitura) |
| POST | `/api/settings/test` | testa a conexão com os dados do formulário, sem salvar |
| GET | `/api/projects` | projetos com contagem e urgentes |
| POST | `/api/projects` | `{name, description, outlook_folder_or_tag}` |
| GET | `/api/projects/<id>/dashboard?days=30` | KPIs, volume diário/semanal, remetentes, alertas, palavras-chave |
| GET | `/api/projects/<id>/emails` | e-mails com resumo, texto limpo e original |
| POST | `/api/projects/<id>/sync` | lê o Outlook e processa os novos |
| POST | `/api/projects/<id>/emails` | processa um e-mail colado `{subject, sender, body}` |
| POST | `/api/analyze` | só analisa, sem gravar (bom para testar regras) |

Para ver o layout com dados fictícios, abra `/dashboard?mock=1`: nada é gravado e o banco não é tocado. Esse modo usa `window.MOCK_DATA`, que tem o formato idêntico ao das rotas acima. Depois de mudar a API, rode `python scripts/export_mock_data.py` para gerar o mock de novo.

## Tema

O botão no canto superior direito alterna entre claro e escuro. A escolha fica salva no navegador. Todas as cores são tokens em `static/css/app.css` (`:root[data-theme=…]`), e os gráficos são redesenhados com as cores do tema ativo.
