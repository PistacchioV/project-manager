/* Gerado por scripts/export_mock_data.py - NAO editar a mao.
   Mesmo formato de /api/projects, /api/projects/<id>/dashboard e /emails. */
window.MOCK_DATA = {
 "projects": [
  {
   "id": 1,
   "name": "Migração ERP",
   "description": "Migração do ERP legado para a nova plataforma em nuvem.",
   "outlook_folder_or_tag": "Projeto ERP",
   "source_type": "category",
   "email_count": 90,
   "urgent_count": 29,
   "last_email": "2026-09-23T12:30:44.940761"
  },
  {
   "id": 2,
   "name": "Portal do Cliente",
   "description": "Novo portal de autoatendimento e relatórios.",
   "outlook_folder_or_tag": "Portal do Cliente",
   "source_type": "category",
   "email_count": 35,
   "urgent_count": 12,
   "last_email": "2026-09-21T05:25:45.037322"
  }
 ],
 "dashboard": {
  "kpis": {
   "total": 90,
   "last_7d": 27,
   "critical": 21,
   "high": 8,
   "senders": 7,
   "avg_score": 6.8
  },
  "volume": {
   "daily": {
    "labels": [
     "2026-08-24",
     "2026-08-25",
     "2026-08-26",
     "2026-08-27",
     "2026-08-28",
     "2026-08-29",
     "2026-08-30",
     "2026-08-31",
     "2026-09-01",
     "2026-09-02",
     "2026-09-03",
     "2026-09-04",
     "2026-09-05",
     "2026-09-06",
     "2026-09-07",
     "2026-09-08",
     "2026-09-09",
     "2026-09-10",
     "2026-09-11",
     "2026-09-12",
     "2026-09-13",
     "2026-09-14",
     "2026-09-15",
     "2026-09-16",
     "2026-09-17",
     "2026-09-18",
     "2026-09-19",
     "2026-09-20",
     "2026-09-21",
     "2026-09-22",
     "2026-09-23"
    ],
    "total": [
     0,
     0,
     1,
     0,
     3,
     1,
     1,
     1,
     1,
     2,
     3,
     3,
     0,
     1,
     2,
     1,
     3,
     0,
     4,
     2,
     3,
     2,
     3,
     2,
     4,
     10,
     1,
     1,
     4,
     5,
     2
    ],
    "urgent": [
     0,
     0,
     1,
     0,
     1,
     0,
     0,
     0,
     0,
     1,
     1,
     0,
     0,
     1,
     1,
     1,
     1,
     0,
     0,
     1,
     2,
     1,
     0,
     0,
     1,
     3,
     1,
     0,
     2,
     2,
     0
    ]
   },
   "weekly": {
    "labels": [
     "2026-08-24",
     "2026-08-31",
     "2026-09-07",
     "2026-09-14",
     "2026-09-21"
    ],
    "total": [
     6,
     11,
     15,
     23,
     11
    ],
    "urgent": [
     2,
     3,
     6,
     6,
     4
    ]
   }
  },
  "top_senders": [
   {
    "sender": "Ana Souza",
    "email": "ana.souza@acme.com.br",
    "count": 28,
    "urgent": 12
   },
   {
    "sender": "Carlos Mendes",
    "email": "carlos.mendes@acme.com.br",
    "count": 19,
    "urgent": 5
   },
   {
    "sender": "Beatriz Lima",
    "email": "beatriz.lima@cliente.com",
    "count": 17,
    "urgent": 7
   },
   {
    "sender": "Rafael Costa",
    "email": "rafael.costa@acme.com.br",
    "count": 10,
    "urgent": 1
   },
   {
    "sender": "Mariana Duarte",
    "email": "mariana.duarte@acme.com.br",
    "count": 7,
    "urgent": 2
   },
   {
    "sender": "Juliana Rocha",
    "email": "juliana.rocha@fornecedor.io",
    "count": 5,
    "urgent": 1
   },
   {
    "sender": "Pedro Almeida",
    "email": "pedro.almeida@cliente.com",
    "count": 4,
    "urgent": 1
   }
  ],
  "alerts": [
   {
    "email_id": 17,
    "subject": "RE: URGENTE: deploy bloqueado no ambiente de homologação",
    "sender": "Ana Souza",
    "date": "2026-09-22T11:59:44.940761",
    "level": "critica",
    "score": 28,
    "sentence": "Sem isso o prazo de entrega do dia 24/09 fica comprometido.",
    "triggers": [
     "prazo",
     "entregar"
    ],
    "dates": [
     "dia 24/09"
    ]
   },
   {
    "email_id": 35,
    "subject": "Risco: atraso na entrega do fornecedor",
    "sender": "Ana Souza",
    "date": "2026-09-21T13:02:44.940761",
    "level": "critica",
    "score": 16,
    "sentence": "Isso é um risco para o go-live previsto para 30/09.",
    "triggers": [
     "entregar",
     "risco"
    ],
    "dates": [
     "30/09"
    ]
   },
   {
    "email_id": 68,
    "subject": "URGENTE: deploy bloqueado no ambiente de homologação",
    "sender": "Ana Souza",
    "date": "2026-09-21T12:31:44.940761",
    "level": "critica",
    "score": 28,
    "sentence": "Sem isso o prazo de entrega do dia 30/09 fica comprometido.",
    "triggers": [
     "prazo",
     "entregar"
    ],
    "dates": [
     "dia 30/09"
    ]
   },
   {
    "email_id": 65,
    "subject": "Risco: atraso na entrega do fornecedor",
    "sender": "Ana Souza",
    "date": "2026-09-18T12:09:44.940761",
    "level": "critica",
    "score": 16,
    "sentence": "Isso é um risco para o go-live previsto para 22/09.",
    "triggers": [
     "entregar",
     "risco"
    ],
    "dates": [
     "22/09"
    ]
   },
   {
    "email_id": 36,
    "subject": "RE: Risco: atraso na entrega do fornecedor",
    "sender": "Juliana Rocha",
    "date": "2026-09-18T10:31:44.940761",
    "level": "critica",
    "score": 16,
    "sentence": "Isso é um risco para o go-live previsto para 21/09.",
    "triggers": [
     "entregar",
     "risco"
    ],
    "dates": [
     "21/09"
    ]
   },
   {
    "email_id": 6,
    "subject": "Risco: atraso na entrega do fornecedor",
    "sender": "Carlos Mendes",
    "date": "2026-09-18T08:43:44.940761",
    "level": "critica",
    "score": 16,
    "sentence": "Isso é um risco para o go-live previsto para 30/09.",
    "triggers": [
     "entregar",
     "risco"
    ],
    "dates": [
     "30/09"
    ]
   },
   {
    "email_id": 40,
    "subject": "Risco: atraso na entrega do fornecedor",
    "sender": "Beatriz Lima",
    "date": "2026-09-14T07:12:44.940761",
    "level": "critica",
    "score": 16,
    "sentence": "Isso é um risco para o go-live previsto para 20/09.",
    "triggers": [
     "entregar",
     "risco"
    ],
    "dates": [
     "20/09"
    ]
   },
   {
    "email_id": 53,
    "subject": "RES: Risco: atraso na entrega do fornecedor",
    "sender": "Carlos Mendes",
    "date": "2026-09-13T08:08:44.940761",
    "level": "critica",
    "score": 16,
    "sentence": "Isso é um risco para o go-live previsto para 19/09.",
    "triggers": [
     "entregar",
     "risco"
    ],
    "dates": [
     "19/09"
    ]
   },
   {
    "email_id": 75,
    "subject": "RE: Risco: atraso na entrega do fornecedor",
    "sender": "Beatriz Lima",
    "date": "2026-09-13T04:54:44.940761",
    "level": "critica",
    "score": 16,
    "sentence": "Isso é um risco para o go-live previsto para 20/09.",
    "triggers": [
     "entregar",
     "risco"
    ],
    "dates": [
     "20/09"
    ]
   },
   {
    "email_id": 30,
    "subject": "Aprovação do orçamento de cloud",
    "sender": "Beatriz Lima",
    "date": "2026-09-22T07:03:44.940761",
    "level": "alta",
    "score": 9,
    "sentence": "Sem aprovação até 28/09 o provisionamento dos ambientes atrasa.",
    "triggers": [
     "prazo",
     "revisar"
    ],
    "dates": [
     "28/09"
    ]
   },
   {
    "email_id": 54,
    "subject": "Aprovação do orçamento de cloud",
    "sender": "Ana Souza",
    "date": "2026-09-19T12:07:44.940761",
    "level": "alta",
    "score": 9,
    "sentence": "Sem aprovação até 21/09 o provisionamento dos ambientes atrasa.",
    "triggers": [
     "prazo",
     "revisar"
    ],
    "dates": [
     "21/09"
    ]
   },
   {
    "email_id": 70,
    "subject": "Aprovação do orçamento de cloud",
    "sender": "Carlos Mendes",
    "date": "2026-09-17T04:29:44.940761",
    "level": "alta",
    "score": 9,
    "sentence": "Sem aprovação até 23/09 o provisionamento dos ambientes atrasa.",
    "triggers": [
     "prazo",
     "revisar"
    ],
    "dates": [
     "23/09"
    ]
   }
  ],
  "keywords": [
   {
    "word": "entrega",
    "count": 34
   },
   {
    "word": "time",
    "count": 24
   },
   {
    "word": "reuniao",
    "count": 22
   },
   {
    "word": "aprovacao",
    "count": 18
   },
   {
    "word": "concluida",
    "count": 18
   },
   {
    "word": "layout",
    "count": 18
   },
   {
    "word": "relatorios",
    "count": 18
   },
   {
    "word": "sprint",
    "count": 18
   },
   {
    "word": "atraso",
    "count": 16
   },
   {
    "word": "fornecedor",
    "count": 16
   },
   {
    "word": "risco",
    "count": 16
   },
   {
    "word": "ambiente",
    "count": 14
   },
   {
    "word": "bloqueado",
    "count": 14
   },
   {
    "word": "deploy",
    "count": 14
   },
   {
    "word": "erp",
    "count": 14
   }
  ],
  "project": {
   "id": 1,
   "name": "Migração ERP",
   "description": "Migração do ERP legado para a nova plataforma em nuvem.",
   "outlook_folder_or_tag": "Projeto ERP",
   "source_type": "category",
   "created_at": "2026-09-23T10:56:44.940383"
  }
 },
 "emails": [
  {
   "id": 25,
   "subject": "RE: Entrega da sprint 7 concluída",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-23T12:30:44.940761",
   "clean_summary": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel. Parabéns a todos!",
   "clean_body": "Time,\n\nA entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.\n\nParabéns a todos!",
   "raw_body": "<p>Time,</p><p>A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.</p><p>Parabéns a todos!</p><p>Ana Souza</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "sprint",
     "count": 2
    },
    {
     "word": "concluida",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "sucesso",
     "count": 1
    },
    {
     "word": "telas",
     "count": 1
    },
    {
     "word": "cadastro",
     "count": 1
    },
    {
     "word": "filtros",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.",
     "triggers": [
      "entregar"
     ],
     "dates": [],
     "names": [
      "Excel"
     ],
     "score": 3,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "entregar": 2,
    "assunto": 2,
    "exclamacoes": 1,
    "resolucao": -6
   }
  },
  {
   "id": 2,
   "subject": "RES: Revisar documento de requisitos v3",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-23T10:11:44.940761",
   "clean_summary": "Enviei a versão 3 do documento de requisitos. Peço que revisem as seções de relatórios fiscais e aprovem até 05/10.",
   "clean_body": "Bom dia,\n\nEnviei a versão 3 do documento de requisitos. Peço que revisem as seções de relatórios fiscais e aprovem até 05/10.",
   "raw_body": "<p>Bom dia,</p><p>Enviei a versão 3 do documento de requisitos. Peço que revisem as seções de relatórios fiscais e aprovem até 05/10.</p><p>Att,</p><p>Ana Souza</p><div id='divRplyFwdMsg'><b>De:</b> Pedro Almeida<br><b>Enviado:</b> segunda<br>versão anterior urgente</div>",
   "urgency_score": 4,
   "urgency_level": "media",
   "keywords": [
    {
     "word": "documento",
     "count": 2
    },
    {
     "word": "requisitos",
     "count": 2
    },
    {
     "word": "revisar",
     "count": 1
    },
    {
     "word": "enviei",
     "count": 1
    },
    {
     "word": "versao",
     "count": 1
    },
    {
     "word": "peco",
     "count": 1
    },
    {
     "word": "revisem",
     "count": 1
    },
    {
     "word": "secoes",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Peço que revisem as seções de relatórios fiscais e aprovem até 05/10.",
     "triggers": [
      "revisar"
     ],
     "dates": [
      "05/10"
     ],
     "names": [],
     "score": 4,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "revisar": 2,
    "assunto": 2
   }
  },
  {
   "id": 17,
   "subject": "RE: URGENTE: deploy bloqueado no ambiente de homologação",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-22T11:59:44.940761",
   "clean_summary": "O deploy do módulo financeiro está bloqueado por falta de acesso ao banco de homologação. Precisamos que o Mariana Duarte libere as permissões até quinta-feira. Sem isso o prazo de entrega do dia 24/09 fica comprometido.",
   "clean_body": "Olá time,\n\nO deploy do módulo financeiro está bloqueado por falta de acesso ao banco de homologação. Precisamos que o Mariana Duarte libere as permissões até quinta-feira.\n\nSem isso o prazo de entrega do dia 24/09 fica comprometido.",
   "raw_body": "<p>Olá time,</p><p>O deploy do módulo financeiro está <b>bloqueado</b> por falta de acesso ao banco de homologação. Precisamos que o Mariana Duarte libere as permissões até quinta-feira.</p><p>Sem isso o prazo de entrega do dia 24/09 fica comprometido.</p><p>Atenciosamente,</p><p>Ana Souza<br>Gerente de Projetos</p>",
   "urgency_score": 28,
   "urgency_level": "critica",
   "keywords": [
    {
     "word": "deploy",
     "count": 2
    },
    {
     "word": "bloqueado",
     "count": 2
    },
    {
     "word": "homologacao",
     "count": 2
    },
    {
     "word": "urgente",
     "count": 1
    },
    {
     "word": "ambiente",
     "count": 1
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "modulo",
     "count": 1
    },
    {
     "word": "financeiro",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Sem isso o prazo de entrega do dia 24/09 fica comprometido.",
     "triggers": [
      "prazo",
      "entregar"
     ],
     "dates": [
      "dia 24/09"
     ],
     "names": [],
     "score": 7,
     "followed_by_context": true
    },
    {
     "sentence": "O deploy do módulo financeiro está bloqueado por falta de acesso ao banco de homologação.",
     "triggers": [
      "bloqueado",
      "entregar",
      "revisar"
     ],
     "dates": [],
     "names": [],
     "score": 8,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "bloqueado": 4,
    "prazo": 3,
    "entregar": 4,
    "revisar": 2,
    "assunto": 12,
    "importancia_alta": 3
   }
  },
  {
   "id": 69,
   "subject": "RES: Reunião de alinhamento - cronograma",
   "sender": "Juliana Rocha",
   "sender_email": "juliana.rocha@fornecedor.io",
   "date_received": "2026-09-22T10:49:44.940761",
   "clean_summary": "Oi Beatriz Lima,. Vamos marcar uma reunião terça-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.",
   "clean_body": "Oi Beatriz Lima,\n\nVamos marcar uma reunião terça-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.",
   "raw_body": "<p>Oi Beatriz Lima,</p><p>Vamos marcar uma reunião terça-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.</p><p>Obrigado,</p><p>Juliana Rocha</p>",
   "urgency_score": 4,
   "urgency_level": "media",
   "keywords": [
    {
     "word": "reuniao",
     "count": 2
    },
    {
     "word": "cronograma",
     "count": 2
    },
    {
     "word": "alinhamento",
     "count": 1
    },
    {
     "word": "beatriz",
     "count": 1
    },
    {
     "word": "lima",
     "count": 1
    },
    {
     "word": "marcar",
     "count": 1
    },
    {
     "word": "terca-feira",
     "count": 1
    },
    {
     "word": "14h",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Vamos marcar uma reunião terça-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.",
     "triggers": [
      "revisar",
      "reuniao"
     ],
     "dates": [
      "terça-feira",
      "14h"
     ],
     "names": [],
     "score": 5,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "revisar": 2,
    "reuniao": 1,
    "assunto": 1
   }
  },
  {
   "id": 71,
   "subject": "Teste de integração com o ERP",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-22T10:45:44.940761",
   "clean_summary": "Os testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.",
   "clean_body": "Bom dia,\n\nOs testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.",
   "raw_body": "<p>Bom dia,</p><p>Os testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.</p><p>Abraço,</p><p>Ana Souza</p>",
   "urgency_score": 2,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "integracao",
     "count": 2
    },
    {
     "word": "erp",
     "count": 2
    },
    {
     "word": "teste",
     "count": 1
    },
    {
     "word": "testes",
     "count": 1
    },
    {
     "word": "rodaram",
     "count": 1
    },
    {
     "word": "erros",
     "count": 1
    },
    {
     "word": "ambiente",
     "count": 1
    },
    {
     "word": "documentar",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Os testes de integração com o ERP rodaram sem erros no ambiente de QA.",
     "triggers": [
      "risco"
     ],
     "dates": [],
     "names": [],
     "score": 2,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "risco": 2
   }
  },
  {
   "id": 5,
   "subject": "Dúvida sobre o layout dos relatórios",
   "sender": "Beatriz Lima",
   "sender_email": "beatriz.lima@cliente.com",
   "date_received": "2026-09-22T10:07:44.940761",
   "clean_summary": "O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "clean_body": "Olá,\n\nO cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "raw_body": "<p>Olá,</p><p>O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?</p><p>Obrigada,</p><p>Beatriz Lima</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "layout",
     "count": 2
    },
    {
     "word": "relatorios",
     "count": 2
    },
    {
     "word": "duvida",
     "count": 1
    },
    {
     "word": "cliente",
     "count": 1
    },
    {
     "word": "perguntou",
     "count": 1
    },
    {
     "word": "gerenciais",
     "count": 1
    },
    {
     "word": "seguir",
     "count": 1
    },
    {
     "word": "padrao",
     "count": 1
    }
   ],
   "action_items": [],
   "urgency_breakdown": {}
  },
  {
   "id": 30,
   "subject": "Aprovação do orçamento de cloud",
   "sender": "Beatriz Lima",
   "sender_email": "beatriz.lima@cliente.com",
   "date_received": "2026-09-22T07:03:44.940761",
   "clean_summary": "Precisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 28/09 o provisionamento dos ambientes atrasa.",
   "clean_body": "Oi,\n\nPrecisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 28/09 o provisionamento dos ambientes atrasa.",
   "raw_body": "<p>Oi,</p><p>Precisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 28/09 o provisionamento dos ambientes atrasa.</p><p>Obrigado,</p><p>Beatriz Lima</p>",
   "urgency_score": 9,
   "urgency_level": "alta",
   "keywords": [
    {
     "word": "aprovacao",
     "count": 3
    },
    {
     "word": "orcamento",
     "count": 2
    },
    {
     "word": "cloud",
     "count": 2
    },
    {
     "word": "precisamos",
     "count": 1
    },
    {
     "word": "proximo",
     "count": 1
    },
    {
     "word": "trimestre",
     "count": 1
    },
    {
     "word": "provisionamento",
     "count": 1
    },
    {
     "word": "ambientes",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Sem aprovação até 28/09 o provisionamento dos ambientes atrasa.",
     "triggers": [
      "prazo",
      "revisar"
     ],
     "dates": [
      "28/09"
     ],
     "names": [],
     "score": 7,
     "followed_by_context": true
    },
    {
     "sentence": "Precisamos da aprovação do orçamento de cloud para o próximo trimestre.",
     "triggers": [
      "revisar"
     ],
     "dates": [],
     "names": [],
     "score": 2,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "revisar": 4,
    "assunto": 2
   }
  },
  {
   "id": 35,
   "subject": "Risco: atraso na entrega do fornecedor",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-21T13:02:44.940761",
   "clean_summary": "O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 30/09. Sugiro escalar com o Mariana Duarte ainda hoje.",
   "clean_body": "Time,\n\nO fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 30/09.\n\nSugiro escalar com o Mariana Duarte ainda hoje.",
   "raw_body": "<p>Time,</p><p>O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 30/09.</p><p>Sugiro escalar com o Mariana Duarte ainda hoje.</p><p>Abs,</p><p>Ana Souza</p>",
   "urgency_score": 16,
   "urgency_level": "critica",
   "keywords": [
    {
     "word": "risco",
     "count": 2
    },
    {
     "word": "atraso",
     "count": 2
    },
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "fornecedor",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "informou",
     "count": 1
    },
    {
     "word": "certificados",
     "count": 1
    },
    {
     "word": "ssl",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Isso é um risco para o go-live previsto para 30/09.",
     "triggers": [
      "entregar",
      "risco"
     ],
     "dates": [
      "30/09"
     ],
     "names": [],
     "score": 6,
     "followed_by_context": true
    },
    {
     "sentence": "O fornecedor informou atraso na entrega dos certificados SSL.",
     "triggers": [
      "prazo",
      "entregar"
     ],
     "dates": [],
     "names": [],
     "score": 5,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "entregar": 4,
    "risco": 2,
    "assunto": 7
   }
  },
  {
   "id": 68,
   "subject": "URGENTE: deploy bloqueado no ambiente de homologação",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-21T12:31:44.940761",
   "clean_summary": "O deploy do módulo financeiro está bloqueado por falta de acesso ao banco de homologação. Precisamos que o Juliana Rocha libere as permissões até terça-feira. Sem isso o prazo de entrega do dia 30/09 fica comprometido.",
   "clean_body": "Olá time,\n\nO deploy do módulo financeiro está bloqueado por falta de acesso ao banco de homologação. Precisamos que o Juliana Rocha libere as permissões até terça-feira.\n\nSem isso o prazo de entrega do dia 30/09 fica comprometido.",
   "raw_body": "<p>Olá time,</p><p>O deploy do módulo financeiro está <b>bloqueado</b> por falta de acesso ao banco de homologação. Precisamos que o Juliana Rocha libere as permissões até terça-feira.</p><p>Sem isso o prazo de entrega do dia 30/09 fica comprometido.</p><p>Atenciosamente,</p><p>Ana Souza<br>Gerente de Projetos</p>",
   "urgency_score": 28,
   "urgency_level": "critica",
   "keywords": [
    {
     "word": "deploy",
     "count": 2
    },
    {
     "word": "bloqueado",
     "count": 2
    },
    {
     "word": "homologacao",
     "count": 2
    },
    {
     "word": "urgente",
     "count": 1
    },
    {
     "word": "ambiente",
     "count": 1
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "modulo",
     "count": 1
    },
    {
     "word": "financeiro",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Sem isso o prazo de entrega do dia 30/09 fica comprometido.",
     "triggers": [
      "prazo",
      "entregar"
     ],
     "dates": [
      "dia 30/09"
     ],
     "names": [],
     "score": 7,
     "followed_by_context": true
    },
    {
     "sentence": "O deploy do módulo financeiro está bloqueado por falta de acesso ao banco de homologação.",
     "triggers": [
      "bloqueado",
      "entregar",
      "revisar"
     ],
     "dates": [],
     "names": [],
     "score": 8,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "bloqueado": 4,
    "prazo": 3,
    "entregar": 4,
    "revisar": 2,
    "assunto": 12,
    "importancia_alta": 3
   }
  },
  {
   "id": 16,
   "subject": "Ata da reunião de kickoff",
   "sender": "Pedro Almeida",
   "sender_email": "pedro.almeida@cliente.com",
   "date_received": "2026-09-21T10:52:44.940761",
   "clean_summary": "Segue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints. Qualquer ajuste, me avisem.",
   "clean_body": "Prezados,\n\nSegue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints.\n\nQualquer ajuste, me avisem.",
   "raw_body": "<p>Prezados,</p><p>Segue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints.</p><p>Qualquer ajuste, me avisem.</p><p>Cordialmente,</p><p>Pedro Almeida</p><p>Esta mensagem pode conter informação confidencial.</p>",
   "urgency_score": 2,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "ata",
     "count": 2
    },
    {
     "word": "reuniao",
     "count": 2
    },
    {
     "word": "kickoff",
     "count": 2
    },
    {
     "word": "principais",
     "count": 1
    },
    {
     "word": "pontos",
     "count": 1
    },
    {
     "word": "escopo",
     "count": 1
    },
    {
     "word": "papeis",
     "count": 1
    },
    {
     "word": "responsabilidades",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Segue a ata da reunião de kickoff.",
     "triggers": [
      "reuniao"
     ],
     "dates": [],
     "names": [],
     "score": 1,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "reuniao": 1,
    "assunto": 1
   }
  },
  {
   "id": 38,
   "subject": "Dúvida sobre o layout dos relatórios",
   "sender": "Carlos Mendes",
   "sender_email": "carlos.mendes@acme.com.br",
   "date_received": "2026-09-21T04:44:44.940761",
   "clean_summary": "O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "clean_body": "Olá,\n\nO cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "raw_body": "<p>Olá,</p><p>O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?</p><p>Obrigada,</p><p>Carlos Mendes</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "layout",
     "count": 2
    },
    {
     "word": "relatorios",
     "count": 2
    },
    {
     "word": "duvida",
     "count": 1
    },
    {
     "word": "cliente",
     "count": 1
    },
    {
     "word": "perguntou",
     "count": 1
    },
    {
     "word": "gerenciais",
     "count": 1
    },
    {
     "word": "seguir",
     "count": 1
    },
    {
     "word": "padrao",
     "count": 1
    }
   ],
   "action_items": [],
   "urgency_breakdown": {}
  },
  {
   "id": 24,
   "subject": "Ata da reunião de kickoff",
   "sender": "Beatriz Lima",
   "sender_email": "beatriz.lima@cliente.com",
   "date_received": "2026-09-20T05:51:44.940761",
   "clean_summary": "Segue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints. Qualquer ajuste, me avisem.",
   "clean_body": "Prezados,\n\nSegue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints.\n\nQualquer ajuste, me avisem.",
   "raw_body": "<p>Prezados,</p><p>Segue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints.</p><p>Qualquer ajuste, me avisem.</p><p>Cordialmente,</p><p>Beatriz Lima</p><p>Esta mensagem pode conter informação confidencial.</p>",
   "urgency_score": 2,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "ata",
     "count": 2
    },
    {
     "word": "reuniao",
     "count": 2
    },
    {
     "word": "kickoff",
     "count": 2
    },
    {
     "word": "principais",
     "count": 1
    },
    {
     "word": "pontos",
     "count": 1
    },
    {
     "word": "escopo",
     "count": 1
    },
    {
     "word": "papeis",
     "count": 1
    },
    {
     "word": "responsabilidades",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Segue a ata da reunião de kickoff.",
     "triggers": [
      "reuniao"
     ],
     "dates": [],
     "names": [],
     "score": 1,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "reuniao": 1,
    "assunto": 1
   }
  },
  {
   "id": 54,
   "subject": "Aprovação do orçamento de cloud",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-19T12:07:44.940761",
   "clean_summary": "Precisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 21/09 o provisionamento dos ambientes atrasa.",
   "clean_body": "Oi,\n\nPrecisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 21/09 o provisionamento dos ambientes atrasa.",
   "raw_body": "<p>Oi,</p><p>Precisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 21/09 o provisionamento dos ambientes atrasa.</p><p>Obrigado,</p><p>Ana Souza</p>",
   "urgency_score": 9,
   "urgency_level": "alta",
   "keywords": [
    {
     "word": "aprovacao",
     "count": 3
    },
    {
     "word": "orcamento",
     "count": 2
    },
    {
     "word": "cloud",
     "count": 2
    },
    {
     "word": "precisamos",
     "count": 1
    },
    {
     "word": "proximo",
     "count": 1
    },
    {
     "word": "trimestre",
     "count": 1
    },
    {
     "word": "provisionamento",
     "count": 1
    },
    {
     "word": "ambientes",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Sem aprovação até 21/09 o provisionamento dos ambientes atrasa.",
     "triggers": [
      "prazo",
      "revisar"
     ],
     "dates": [
      "21/09"
     ],
     "names": [],
     "score": 7,
     "followed_by_context": true
    },
    {
     "sentence": "Precisamos da aprovação do orçamento de cloud para o próximo trimestre.",
     "triggers": [
      "revisar"
     ],
     "dates": [],
     "names": [],
     "score": 2,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "revisar": 4,
    "assunto": 2
   }
  },
  {
   "id": 84,
   "subject": "RES: Dúvida sobre o layout dos relatórios",
   "sender": "Pedro Almeida",
   "sender_email": "pedro.almeida@cliente.com",
   "date_received": "2026-09-18T13:38:44.940761",
   "clean_summary": "O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "clean_body": "Olá,\n\nO cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "raw_body": "<p>Olá,</p><p>O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?</p><p>Obrigada,</p><p>Pedro Almeida</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "layout",
     "count": 2
    },
    {
     "word": "relatorios",
     "count": 2
    },
    {
     "word": "duvida",
     "count": 1
    },
    {
     "word": "cliente",
     "count": 1
    },
    {
     "word": "perguntou",
     "count": 1
    },
    {
     "word": "gerenciais",
     "count": 1
    },
    {
     "word": "seguir",
     "count": 1
    },
    {
     "word": "padrao",
     "count": 1
    }
   ],
   "action_items": [],
   "urgency_breakdown": {}
  },
  {
   "id": 65,
   "subject": "Risco: atraso na entrega do fornecedor",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-18T12:09:44.940761",
   "clean_summary": "O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 22/09. Sugiro escalar com o Mariana Duarte ainda hoje.",
   "clean_body": "Time,\n\nO fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 22/09.\n\nSugiro escalar com o Mariana Duarte ainda hoje.",
   "raw_body": "<p>Time,</p><p>O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 22/09.</p><p>Sugiro escalar com o Mariana Duarte ainda hoje.</p><p>Abs,</p><p>Ana Souza</p>",
   "urgency_score": 16,
   "urgency_level": "critica",
   "keywords": [
    {
     "word": "risco",
     "count": 2
    },
    {
     "word": "atraso",
     "count": 2
    },
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "fornecedor",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "informou",
     "count": 1
    },
    {
     "word": "certificados",
     "count": 1
    },
    {
     "word": "ssl",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Isso é um risco para o go-live previsto para 22/09.",
     "triggers": [
      "entregar",
      "risco"
     ],
     "dates": [
      "22/09"
     ],
     "names": [],
     "score": 6,
     "followed_by_context": true
    },
    {
     "sentence": "O fornecedor informou atraso na entrega dos certificados SSL.",
     "triggers": [
      "prazo",
      "entregar"
     ],
     "dates": [],
     "names": [],
     "score": 5,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "entregar": 4,
    "risco": 2,
    "assunto": 7
   }
  },
  {
   "id": 23,
   "subject": "Teste de integração com o ERP",
   "sender": "Rafael Costa",
   "sender_email": "rafael.costa@acme.com.br",
   "date_received": "2026-09-18T10:53:44.940761",
   "clean_summary": "Os testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.",
   "clean_body": "Bom dia,\n\nOs testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.",
   "raw_body": "<p>Bom dia,</p><p>Os testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.</p><p>Abraço,</p><p>Rafael Costa</p>",
   "urgency_score": 2,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "integracao",
     "count": 2
    },
    {
     "word": "erp",
     "count": 2
    },
    {
     "word": "teste",
     "count": 1
    },
    {
     "word": "testes",
     "count": 1
    },
    {
     "word": "rodaram",
     "count": 1
    },
    {
     "word": "erros",
     "count": 1
    },
    {
     "word": "ambiente",
     "count": 1
    },
    {
     "word": "documentar",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Os testes de integração com o ERP rodaram sem erros no ambiente de QA.",
     "triggers": [
      "risco"
     ],
     "dates": [],
     "names": [],
     "score": 2,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "risco": 2
   }
  },
  {
   "id": 1,
   "subject": "Teste de integração com o ERP",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-18T10:48:44.940761",
   "clean_summary": "Os testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.",
   "clean_body": "Bom dia,\n\nOs testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.",
   "raw_body": "<p>Bom dia,</p><p>Os testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.</p><p>Abraço,</p><p>Ana Souza</p>",
   "urgency_score": 2,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "integracao",
     "count": 2
    },
    {
     "word": "erp",
     "count": 2
    },
    {
     "word": "teste",
     "count": 1
    },
    {
     "word": "testes",
     "count": 1
    },
    {
     "word": "rodaram",
     "count": 1
    },
    {
     "word": "erros",
     "count": 1
    },
    {
     "word": "ambiente",
     "count": 1
    },
    {
     "word": "documentar",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Os testes de integração com o ERP rodaram sem erros no ambiente de QA.",
     "triggers": [
      "risco"
     ],
     "dates": [],
     "names": [],
     "score": 2,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "risco": 2
   }
  },
  {
   "id": 36,
   "subject": "RE: Risco: atraso na entrega do fornecedor",
   "sender": "Juliana Rocha",
   "sender_email": "juliana.rocha@fornecedor.io",
   "date_received": "2026-09-18T10:31:44.940761",
   "clean_summary": "O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 21/09. Sugiro escalar com o Carlos Mendes ainda hoje.",
   "clean_body": "Time,\n\nO fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 21/09.\n\nSugiro escalar com o Carlos Mendes ainda hoje.",
   "raw_body": "<p>Time,</p><p>O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 21/09.</p><p>Sugiro escalar com o Carlos Mendes ainda hoje.</p><p>Abs,</p><p>Juliana Rocha</p>",
   "urgency_score": 16,
   "urgency_level": "critica",
   "keywords": [
    {
     "word": "risco",
     "count": 2
    },
    {
     "word": "atraso",
     "count": 2
    },
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "fornecedor",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "informou",
     "count": 1
    },
    {
     "word": "certificados",
     "count": 1
    },
    {
     "word": "ssl",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Isso é um risco para o go-live previsto para 21/09.",
     "triggers": [
      "entregar",
      "risco"
     ],
     "dates": [
      "21/09"
     ],
     "names": [],
     "score": 6,
     "followed_by_context": true
    },
    {
     "sentence": "O fornecedor informou atraso na entrega dos certificados SSL.",
     "triggers": [
      "prazo",
      "entregar"
     ],
     "dates": [],
     "names": [],
     "score": 5,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "entregar": 4,
    "risco": 2,
    "assunto": 7
   }
  },
  {
   "id": 3,
   "subject": "Reunião de alinhamento - cronograma",
   "sender": "Rafael Costa",
   "sender_email": "rafael.costa@acme.com.br",
   "date_received": "2026-09-18T10:08:44.940761",
   "clean_summary": "Oi Beatriz Lima,. Vamos marcar uma reunião quarta-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.",
   "clean_body": "Oi Beatriz Lima,\n\nVamos marcar uma reunião quarta-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.",
   "raw_body": "<p>Oi Beatriz Lima,</p><p>Vamos marcar uma reunião quarta-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.</p><p>Obrigado,</p><p>Rafael Costa</p>",
   "urgency_score": 4,
   "urgency_level": "media",
   "keywords": [
    {
     "word": "reuniao",
     "count": 2
    },
    {
     "word": "cronograma",
     "count": 2
    },
    {
     "word": "alinhamento",
     "count": 1
    },
    {
     "word": "beatriz",
     "count": 1
    },
    {
     "word": "lima",
     "count": 1
    },
    {
     "word": "marcar",
     "count": 1
    },
    {
     "word": "quarta-feira",
     "count": 1
    },
    {
     "word": "14h",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Vamos marcar uma reunião quarta-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.",
     "triggers": [
      "revisar",
      "reuniao"
     ],
     "dates": [
      "quarta-feira",
      "14h"
     ],
     "names": [],
     "score": 5,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "revisar": 2,
    "reuniao": 1,
    "assunto": 1
   }
  },
  {
   "id": 57,
   "subject": "Entrega da sprint 7 concluída",
   "sender": "Rafael Costa",
   "sender_email": "rafael.costa@acme.com.br",
   "date_received": "2026-09-18T09:02:44.940761",
   "clean_summary": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel. Parabéns a todos!",
   "clean_body": "Time,\n\nA entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.\n\nParabéns a todos!",
   "raw_body": "<p>Time,</p><p>A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.</p><p>Parabéns a todos!</p><p>Rafael Costa</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "sprint",
     "count": 2
    },
    {
     "word": "concluida",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "sucesso",
     "count": 1
    },
    {
     "word": "telas",
     "count": 1
    },
    {
     "word": "cadastro",
     "count": 1
    },
    {
     "word": "filtros",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.",
     "triggers": [
      "entregar"
     ],
     "dates": [],
     "names": [
      "Excel"
     ],
     "score": 3,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "entregar": 2,
    "assunto": 2,
    "exclamacoes": 1,
    "resolucao": -6
   }
  },
  {
   "id": 6,
   "subject": "Risco: atraso na entrega do fornecedor",
   "sender": "Carlos Mendes",
   "sender_email": "carlos.mendes@acme.com.br",
   "date_received": "2026-09-18T08:43:44.940761",
   "clean_summary": "O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 30/09. Sugiro escalar com o Rafael Costa ainda hoje.",
   "clean_body": "Time,\n\nO fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 30/09.\n\nSugiro escalar com o Rafael Costa ainda hoje.",
   "raw_body": "<p>Time,</p><p>O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 30/09.</p><p>Sugiro escalar com o Rafael Costa ainda hoje.</p><p>Abs,</p><p>Carlos Mendes</p>",
   "urgency_score": 16,
   "urgency_level": "critica",
   "keywords": [
    {
     "word": "risco",
     "count": 2
    },
    {
     "word": "atraso",
     "count": 2
    },
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "fornecedor",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "informou",
     "count": 1
    },
    {
     "word": "certificados",
     "count": 1
    },
    {
     "word": "ssl",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Isso é um risco para o go-live previsto para 30/09.",
     "triggers": [
      "entregar",
      "risco"
     ],
     "dates": [
      "30/09"
     ],
     "names": [],
     "score": 6,
     "followed_by_context": true
    },
    {
     "sentence": "O fornecedor informou atraso na entrega dos certificados SSL.",
     "triggers": [
      "prazo",
      "entregar"
     ],
     "dates": [],
     "names": [],
     "score": 5,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "entregar": 4,
    "risco": 2,
    "assunto": 7
   }
  },
  {
   "id": 45,
   "subject": "Status semanal do projeto",
   "sender": "Rafael Costa",
   "sender_email": "rafael.costa@acme.com.br",
   "date_received": "2026-09-18T05:27:44.940761",
   "clean_summary": "Segue o status da semana: concluímos a migração dos cadastros de clientes e a integração com o gateway de pagamentos avançou 70%. Próximos passos: testes de carga e documentação da API.",
   "clean_body": "Pessoal,\n\nSegue o status da semana: concluímos a migração dos cadastros de clientes e a integração com o gateway de pagamentos avançou 70%.\n\nPróximos passos: testes de carga e documentação da API.",
   "raw_body": "<p>Pessoal,</p><p>Segue o status da semana: concluímos a migração dos cadastros de clientes e a integração com o gateway de pagamentos avançou 70%.</p><p>Próximos passos: testes de carga e documentação da API.</p><p>Abraços,</p><p>Rafael Costa</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "status",
     "count": 2
    },
    {
     "word": "semanal",
     "count": 1
    },
    {
     "word": "projeto",
     "count": 1
    },
    {
     "word": "semana",
     "count": 1
    },
    {
     "word": "concluimos",
     "count": 1
    },
    {
     "word": "migracao",
     "count": 1
    },
    {
     "word": "cadastros",
     "count": 1
    },
    {
     "word": "clientes",
     "count": 1
    }
   ],
   "action_items": [],
   "urgency_breakdown": {
    "resolucao": -2
   }
  },
  {
   "id": 15,
   "subject": "Reunião de alinhamento - cronograma",
   "sender": "Beatriz Lima",
   "sender_email": "beatriz.lima@cliente.com",
   "date_received": "2026-09-18T05:01:44.940761",
   "clean_summary": "Oi Pedro Almeida,. Vamos marcar uma reunião quarta-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.",
   "clean_body": "Oi Pedro Almeida,\n\nVamos marcar uma reunião quarta-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.",
   "raw_body": "<p>Oi Pedro Almeida,</p><p>Vamos marcar uma reunião quarta-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.</p><p>Obrigado,</p><p>Beatriz Lima</p>",
   "urgency_score": 4,
   "urgency_level": "media",
   "keywords": [
    {
     "word": "reuniao",
     "count": 2
    },
    {
     "word": "cronograma",
     "count": 2
    },
    {
     "word": "alinhamento",
     "count": 1
    },
    {
     "word": "pedro",
     "count": 1
    },
    {
     "word": "almeida",
     "count": 1
    },
    {
     "word": "marcar",
     "count": 1
    },
    {
     "word": "quarta-feira",
     "count": 1
    },
    {
     "word": "14h",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Vamos marcar uma reunião quarta-feira às 14h para revisar o cronograma da fase 2 e o orçamento de infraestrutura.",
     "triggers": [
      "revisar",
      "reuniao"
     ],
     "dates": [
      "quarta-feira",
      "14h"
     ],
     "names": [],
     "score": 5,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "revisar": 2,
    "reuniao": 1,
    "assunto": 1
   }
  },
  {
   "id": 72,
   "subject": "Ata da reunião de kickoff",
   "sender": "Carlos Mendes",
   "sender_email": "carlos.mendes@acme.com.br",
   "date_received": "2026-09-17T09:12:44.940761",
   "clean_summary": "Segue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints. Qualquer ajuste, me avisem.",
   "clean_body": "Prezados,\n\nSegue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints.\n\nQualquer ajuste, me avisem.",
   "raw_body": "<p>Prezados,</p><p>Segue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints.</p><p>Qualquer ajuste, me avisem.</p><p>Cordialmente,</p><p>Carlos Mendes</p><p>Esta mensagem pode conter informação confidencial.</p>",
   "urgency_score": 2,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "ata",
     "count": 2
    },
    {
     "word": "reuniao",
     "count": 2
    },
    {
     "word": "kickoff",
     "count": 2
    },
    {
     "word": "principais",
     "count": 1
    },
    {
     "word": "pontos",
     "count": 1
    },
    {
     "word": "escopo",
     "count": 1
    },
    {
     "word": "papeis",
     "count": 1
    },
    {
     "word": "responsabilidades",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Segue a ata da reunião de kickoff.",
     "triggers": [
      "reuniao"
     ],
     "dates": [],
     "names": [],
     "score": 1,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "reuniao": 1,
    "assunto": 1
   }
  },
  {
   "id": 78,
   "subject": "Dúvida sobre o layout dos relatórios",
   "sender": "Carlos Mendes",
   "sender_email": "carlos.mendes@acme.com.br",
   "date_received": "2026-09-17T07:04:44.940761",
   "clean_summary": "O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "clean_body": "Olá,\n\nO cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "raw_body": "<p>Olá,</p><p>O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?</p><p>Obrigada,</p><p>Carlos Mendes</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "layout",
     "count": 2
    },
    {
     "word": "relatorios",
     "count": 2
    },
    {
     "word": "duvida",
     "count": 1
    },
    {
     "word": "cliente",
     "count": 1
    },
    {
     "word": "perguntou",
     "count": 1
    },
    {
     "word": "gerenciais",
     "count": 1
    },
    {
     "word": "seguir",
     "count": 1
    },
    {
     "word": "padrao",
     "count": 1
    }
   ],
   "action_items": [],
   "urgency_breakdown": {}
  },
  {
   "id": 28,
   "subject": "RE: Ata da reunião de kickoff",
   "sender": "Juliana Rocha",
   "sender_email": "juliana.rocha@fornecedor.io",
   "date_received": "2026-09-17T05:56:44.940761",
   "clean_summary": "Segue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints. Qualquer ajuste, me avisem.",
   "clean_body": "Prezados,\n\nSegue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints.\n\nQualquer ajuste, me avisem.",
   "raw_body": "<p>Prezados,</p><p>Segue a ata da reunião de kickoff. Os principais pontos foram escopo, papéis e responsabilidades e o calendário de sprints.</p><p>Qualquer ajuste, me avisem.</p><p>Cordialmente,</p><p>Juliana Rocha</p><p>Esta mensagem pode conter informação confidencial.</p>",
   "urgency_score": 2,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "ata",
     "count": 2
    },
    {
     "word": "reuniao",
     "count": 2
    },
    {
     "word": "kickoff",
     "count": 2
    },
    {
     "word": "principais",
     "count": 1
    },
    {
     "word": "pontos",
     "count": 1
    },
    {
     "word": "escopo",
     "count": 1
    },
    {
     "word": "papeis",
     "count": 1
    },
    {
     "word": "responsabilidades",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Segue a ata da reunião de kickoff.",
     "triggers": [
      "reuniao"
     ],
     "dates": [],
     "names": [],
     "score": 1,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "reuniao": 1,
    "assunto": 1
   }
  },
  {
   "id": 70,
   "subject": "Aprovação do orçamento de cloud",
   "sender": "Carlos Mendes",
   "sender_email": "carlos.mendes@acme.com.br",
   "date_received": "2026-09-17T04:29:44.940761",
   "clean_summary": "Precisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 23/09 o provisionamento dos ambientes atrasa.",
   "clean_body": "Oi,\n\nPrecisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 23/09 o provisionamento dos ambientes atrasa.",
   "raw_body": "<p>Oi,</p><p>Precisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 23/09 o provisionamento dos ambientes atrasa.</p><p>Obrigado,</p><p>Carlos Mendes</p>",
   "urgency_score": 9,
   "urgency_level": "alta",
   "keywords": [
    {
     "word": "aprovacao",
     "count": 3
    },
    {
     "word": "orcamento",
     "count": 2
    },
    {
     "word": "cloud",
     "count": 2
    },
    {
     "word": "precisamos",
     "count": 1
    },
    {
     "word": "proximo",
     "count": 1
    },
    {
     "word": "trimestre",
     "count": 1
    },
    {
     "word": "provisionamento",
     "count": 1
    },
    {
     "word": "ambientes",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Sem aprovação até 23/09 o provisionamento dos ambientes atrasa.",
     "triggers": [
      "prazo",
      "revisar"
     ],
     "dates": [
      "23/09"
     ],
     "names": [],
     "score": 7,
     "followed_by_context": true
    },
    {
     "sentence": "Precisamos da aprovação do orçamento de cloud para o próximo trimestre.",
     "triggers": [
      "revisar"
     ],
     "dates": [],
     "names": [],
     "score": 2,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "revisar": 4,
    "assunto": 2
   }
  },
  {
   "id": 88,
   "subject": "RE: Status semanal do projeto",
   "sender": "Carlos Mendes",
   "sender_email": "carlos.mendes@acme.com.br",
   "date_received": "2026-09-16T07:15:44.940761",
   "clean_summary": "Segue o status da semana: concluímos a migração dos cadastros de clientes e a integração com o gateway de pagamentos avançou 70%. Próximos passos: testes de carga e documentação da API.",
   "clean_body": "Pessoal,\n\nSegue o status da semana: concluímos a migração dos cadastros de clientes e a integração com o gateway de pagamentos avançou 70%.\n\nPróximos passos: testes de carga e documentação da API.",
   "raw_body": "<p>Pessoal,</p><p>Segue o status da semana: concluímos a migração dos cadastros de clientes e a integração com o gateway de pagamentos avançou 70%.</p><p>Próximos passos: testes de carga e documentação da API.</p><p>Abraços,</p><p>Carlos Mendes</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "status",
     "count": 2
    },
    {
     "word": "semanal",
     "count": 1
    },
    {
     "word": "projeto",
     "count": 1
    },
    {
     "word": "semana",
     "count": 1
    },
    {
     "word": "concluimos",
     "count": 1
    },
    {
     "word": "migracao",
     "count": 1
    },
    {
     "word": "cadastros",
     "count": 1
    },
    {
     "word": "clientes",
     "count": 1
    }
   ],
   "action_items": [],
   "urgency_breakdown": {
    "resolucao": -2
   }
  },
  {
   "id": 61,
   "subject": "Entrega da sprint 7 concluída",
   "sender": "Beatriz Lima",
   "sender_email": "beatriz.lima@cliente.com",
   "date_received": "2026-09-16T06:02:44.940761",
   "clean_summary": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel. Parabéns a todos!",
   "clean_body": "Time,\n\nA entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.\n\nParabéns a todos!",
   "raw_body": "<p>Time,</p><p>A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.</p><p>Parabéns a todos!</p><p>Beatriz Lima</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "sprint",
     "count": 2
    },
    {
     "word": "concluida",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "sucesso",
     "count": 1
    },
    {
     "word": "telas",
     "count": 1
    },
    {
     "word": "cadastro",
     "count": 1
    },
    {
     "word": "filtros",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.",
     "triggers": [
      "entregar"
     ],
     "dates": [],
     "names": [
      "Excel"
     ],
     "score": 3,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "entregar": 2,
    "assunto": 2,
    "exclamacoes": 1,
    "resolucao": -6
   }
  },
  {
   "id": 85,
   "subject": "Dúvida sobre o layout dos relatórios",
   "sender": "Carlos Mendes",
   "sender_email": "carlos.mendes@acme.com.br",
   "date_received": "2026-09-15T08:01:44.940761",
   "clean_summary": "O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "clean_body": "Olá,\n\nO cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "raw_body": "<p>Olá,</p><p>O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?</p><p>Obrigada,</p><p>Carlos Mendes</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "layout",
     "count": 2
    },
    {
     "word": "relatorios",
     "count": 2
    },
    {
     "word": "duvida",
     "count": 1
    },
    {
     "word": "cliente",
     "count": 1
    },
    {
     "word": "perguntou",
     "count": 1
    },
    {
     "word": "gerenciais",
     "count": 1
    },
    {
     "word": "seguir",
     "count": 1
    },
    {
     "word": "padrao",
     "count": 1
    }
   ],
   "action_items": [],
   "urgency_breakdown": {}
  },
  {
   "id": 58,
   "subject": "Dúvida sobre o layout dos relatórios",
   "sender": "Beatriz Lima",
   "sender_email": "beatriz.lima@cliente.com",
   "date_received": "2026-09-15T05:15:44.940761",
   "clean_summary": "O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "clean_body": "Olá,\n\nO cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?",
   "raw_body": "<p>Olá,</p><p>O cliente perguntou se o layout dos relatórios gerenciais pode seguir o padrão do sistema antigo. Alguém tem o arquivo de referência?</p><p>Obrigada,</p><p>Beatriz Lima</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "layout",
     "count": 2
    },
    {
     "word": "relatorios",
     "count": 2
    },
    {
     "word": "duvida",
     "count": 1
    },
    {
     "word": "cliente",
     "count": 1
    },
    {
     "word": "perguntou",
     "count": 1
    },
    {
     "word": "gerenciais",
     "count": 1
    },
    {
     "word": "seguir",
     "count": 1
    },
    {
     "word": "padrao",
     "count": 1
    }
   ],
   "action_items": [],
   "urgency_breakdown": {}
  },
  {
   "id": 83,
   "subject": "Revisar documento de requisitos v3",
   "sender": "Carlos Mendes",
   "sender_email": "carlos.mendes@acme.com.br",
   "date_received": "2026-09-15T04:24:44.940761",
   "clean_summary": "Enviei a versão 3 do documento de requisitos. Peço que revisem as seções de relatórios fiscais e aprovem até 19/09.",
   "clean_body": "Bom dia,\n\nEnviei a versão 3 do documento de requisitos. Peço que revisem as seções de relatórios fiscais e aprovem até 19/09.",
   "raw_body": "<p>Bom dia,</p><p>Enviei a versão 3 do documento de requisitos. Peço que revisem as seções de relatórios fiscais e aprovem até 19/09.</p><p>Att,</p><p>Carlos Mendes</p><div id='divRplyFwdMsg'><b>De:</b> Beatriz Lima<br><b>Enviado:</b> segunda<br>versão anterior urgente</div>",
   "urgency_score": 4,
   "urgency_level": "media",
   "keywords": [
    {
     "word": "documento",
     "count": 2
    },
    {
     "word": "requisitos",
     "count": 2
    },
    {
     "word": "revisar",
     "count": 1
    },
    {
     "word": "enviei",
     "count": 1
    },
    {
     "word": "versao",
     "count": 1
    },
    {
     "word": "peco",
     "count": 1
    },
    {
     "word": "revisem",
     "count": 1
    },
    {
     "word": "secoes",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Peço que revisem as seções de relatórios fiscais e aprovem até 19/09.",
     "triggers": [
      "revisar"
     ],
     "dates": [
      "19/09"
     ],
     "names": [],
     "score": 4,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "revisar": 2,
    "assunto": 2
   }
  },
  {
   "id": 40,
   "subject": "Risco: atraso na entrega do fornecedor",
   "sender": "Beatriz Lima",
   "sender_email": "beatriz.lima@cliente.com",
   "date_received": "2026-09-14T07:12:44.940761",
   "clean_summary": "O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 20/09. Sugiro escalar com o Mariana Duarte ainda hoje.",
   "clean_body": "Time,\n\nO fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 20/09.\n\nSugiro escalar com o Mariana Duarte ainda hoje.",
   "raw_body": "<p>Time,</p><p>O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 20/09.</p><p>Sugiro escalar com o Mariana Duarte ainda hoje.</p><p>Abs,</p><p>Beatriz Lima</p>",
   "urgency_score": 16,
   "urgency_level": "critica",
   "keywords": [
    {
     "word": "risco",
     "count": 2
    },
    {
     "word": "atraso",
     "count": 2
    },
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "fornecedor",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "informou",
     "count": 1
    },
    {
     "word": "certificados",
     "count": 1
    },
    {
     "word": "ssl",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Isso é um risco para o go-live previsto para 20/09.",
     "triggers": [
      "entregar",
      "risco"
     ],
     "dates": [
      "20/09"
     ],
     "names": [],
     "score": 6,
     "followed_by_context": true
    },
    {
     "sentence": "O fornecedor informou atraso na entrega dos certificados SSL.",
     "triggers": [
      "prazo",
      "entregar"
     ],
     "dates": [],
     "names": [],
     "score": 5,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "entregar": 4,
    "risco": 2,
    "assunto": 7
   }
  },
  {
   "id": 73,
   "subject": "Teste de integração com o ERP",
   "sender": "Juliana Rocha",
   "sender_email": "juliana.rocha@fornecedor.io",
   "date_received": "2026-09-14T05:42:44.940761",
   "clean_summary": "Os testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.",
   "clean_body": "Bom dia,\n\nOs testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.",
   "raw_body": "<p>Bom dia,</p><p>Os testes de integração com o ERP rodaram sem erros no ambiente de QA. Vou documentar os resultados na wiki do projeto.</p><p>Abraço,</p><p>Juliana Rocha</p>",
   "urgency_score": 2,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "integracao",
     "count": 2
    },
    {
     "word": "erp",
     "count": 2
    },
    {
     "word": "teste",
     "count": 1
    },
    {
     "word": "testes",
     "count": 1
    },
    {
     "word": "rodaram",
     "count": 1
    },
    {
     "word": "erros",
     "count": 1
    },
    {
     "word": "ambiente",
     "count": 1
    },
    {
     "word": "documentar",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Os testes de integração com o ERP rodaram sem erros no ambiente de QA.",
     "triggers": [
      "risco"
     ],
     "dates": [],
     "names": [],
     "score": 2,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "risco": 2
   }
  },
  {
   "id": 53,
   "subject": "RES: Risco: atraso na entrega do fornecedor",
   "sender": "Carlos Mendes",
   "sender_email": "carlos.mendes@acme.com.br",
   "date_received": "2026-09-13T08:08:44.940761",
   "clean_summary": "O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 19/09. Sugiro escalar com o Beatriz Lima ainda hoje.",
   "clean_body": "Time,\n\nO fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 19/09.\n\nSugiro escalar com o Beatriz Lima ainda hoje.",
   "raw_body": "<p>Time,</p><p>O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 19/09.</p><p>Sugiro escalar com o Beatriz Lima ainda hoje.</p><p>Abs,</p><p>Carlos Mendes</p>",
   "urgency_score": 16,
   "urgency_level": "critica",
   "keywords": [
    {
     "word": "risco",
     "count": 2
    },
    {
     "word": "atraso",
     "count": 2
    },
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "fornecedor",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "informou",
     "count": 1
    },
    {
     "word": "certificados",
     "count": 1
    },
    {
     "word": "ssl",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Isso é um risco para o go-live previsto para 19/09.",
     "triggers": [
      "entregar",
      "risco"
     ],
     "dates": [
      "19/09"
     ],
     "names": [],
     "score": 6,
     "followed_by_context": true
    },
    {
     "sentence": "O fornecedor informou atraso na entrega dos certificados SSL.",
     "triggers": [
      "prazo",
      "entregar"
     ],
     "dates": [],
     "names": [],
     "score": 5,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "entregar": 4,
    "risco": 2,
    "assunto": 7
   }
  },
  {
   "id": 75,
   "subject": "RE: Risco: atraso na entrega do fornecedor",
   "sender": "Beatriz Lima",
   "sender_email": "beatriz.lima@cliente.com",
   "date_received": "2026-09-13T04:54:44.940761",
   "clean_summary": "O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 20/09. Sugiro escalar com o Juliana Rocha ainda hoje.",
   "clean_body": "Time,\n\nO fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 20/09.\n\nSugiro escalar com o Juliana Rocha ainda hoje.",
   "raw_body": "<p>Time,</p><p>O fornecedor informou atraso na entrega dos certificados SSL. Isso é um risco para o go-live previsto para 20/09.</p><p>Sugiro escalar com o Juliana Rocha ainda hoje.</p><p>Abs,</p><p>Beatriz Lima</p>",
   "urgency_score": 16,
   "urgency_level": "critica",
   "keywords": [
    {
     "word": "risco",
     "count": 2
    },
    {
     "word": "atraso",
     "count": 2
    },
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "fornecedor",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "informou",
     "count": 1
    },
    {
     "word": "certificados",
     "count": 1
    },
    {
     "word": "ssl",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Isso é um risco para o go-live previsto para 20/09.",
     "triggers": [
      "entregar",
      "risco"
     ],
     "dates": [
      "20/09"
     ],
     "names": [],
     "score": 6,
     "followed_by_context": true
    },
    {
     "sentence": "O fornecedor informou atraso na entrega dos certificados SSL.",
     "triggers": [
      "prazo",
      "entregar"
     ],
     "dates": [],
     "names": [],
     "score": 5,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "entregar": 4,
    "risco": 2,
    "assunto": 7
   }
  },
  {
   "id": 44,
   "subject": "RES: Entrega da sprint 7 concluída",
   "sender": "Juliana Rocha",
   "sender_email": "juliana.rocha@fornecedor.io",
   "date_received": "2026-09-13T04:44:44.940761",
   "clean_summary": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel. Parabéns a todos!",
   "clean_body": "Time,\n\nA entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.\n\nParabéns a todos!",
   "raw_body": "<p>Time,</p><p>A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.</p><p>Parabéns a todos!</p><p>Juliana Rocha</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "sprint",
     "count": 2
    },
    {
     "word": "concluida",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "sucesso",
     "count": 1
    },
    {
     "word": "telas",
     "count": 1
    },
    {
     "word": "cadastro",
     "count": 1
    },
    {
     "word": "filtros",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.",
     "triggers": [
      "entregar"
     ],
     "dates": [],
     "names": [
      "Excel"
     ],
     "score": 3,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "entregar": 2,
    "assunto": 2,
    "exclamacoes": 1,
    "resolucao": -6
   }
  },
  {
   "id": 55,
   "subject": "RE: Entrega da sprint 7 concluída",
   "sender": "Ana Souza",
   "sender_email": "ana.souza@acme.com.br",
   "date_received": "2026-09-12T12:20:44.940761",
   "clean_summary": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel. Parabéns a todos!",
   "clean_body": "Time,\n\nA entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.\n\nParabéns a todos!",
   "raw_body": "<p>Time,</p><p>A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.</p><p>Parabéns a todos!</p><p>Ana Souza</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "sprint",
     "count": 2
    },
    {
     "word": "concluida",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "sucesso",
     "count": 1
    },
    {
     "word": "telas",
     "count": 1
    },
    {
     "word": "cadastro",
     "count": 1
    },
    {
     "word": "filtros",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.",
     "triggers": [
      "entregar"
     ],
     "dates": [],
     "names": [
      "Excel"
     ],
     "score": 3,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "entregar": 2,
    "assunto": 2,
    "exclamacoes": 1,
    "resolucao": -6
   }
  },
  {
   "id": 63,
   "subject": "RE: Aprovação do orçamento de cloud",
   "sender": "Rafael Costa",
   "sender_email": "rafael.costa@acme.com.br",
   "date_received": "2026-09-12T06:28:44.940761",
   "clean_summary": "Precisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 15/09 o provisionamento dos ambientes atrasa.",
   "clean_body": "Oi,\n\nPrecisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 15/09 o provisionamento dos ambientes atrasa.",
   "raw_body": "<p>Oi,</p><p>Precisamos da aprovação do orçamento de cloud para o próximo trimestre. Sem aprovação até 15/09 o provisionamento dos ambientes atrasa.</p><p>Obrigado,</p><p>Rafael Costa</p>",
   "urgency_score": 9,
   "urgency_level": "alta",
   "keywords": [
    {
     "word": "aprovacao",
     "count": 3
    },
    {
     "word": "orcamento",
     "count": 2
    },
    {
     "word": "cloud",
     "count": 2
    },
    {
     "word": "precisamos",
     "count": 1
    },
    {
     "word": "proximo",
     "count": 1
    },
    {
     "word": "trimestre",
     "count": 1
    },
    {
     "word": "provisionamento",
     "count": 1
    },
    {
     "word": "ambientes",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "Sem aprovação até 15/09 o provisionamento dos ambientes atrasa.",
     "triggers": [
      "prazo",
      "revisar"
     ],
     "dates": [
      "15/09"
     ],
     "names": [],
     "score": 7,
     "followed_by_context": true
    },
    {
     "sentence": "Precisamos da aprovação do orçamento de cloud para o próximo trimestre.",
     "triggers": [
      "revisar"
     ],
     "dates": [],
     "names": [],
     "score": 2,
     "followed_by_context": false
    }
   ],
   "urgency_breakdown": {
    "prazo": 3,
    "revisar": 4,
    "assunto": 2
   }
  },
  {
   "id": 80,
   "subject": "RE: Entrega da sprint 7 concluída",
   "sender": "Rafael Costa",
   "sender_email": "rafael.costa@acme.com.br",
   "date_received": "2026-09-11T13:43:44.940761",
   "clean_summary": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel. Parabéns a todos!",
   "clean_body": "Time,\n\nA entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.\n\nParabéns a todos!",
   "raw_body": "<p>Time,</p><p>A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.</p><p>Parabéns a todos!</p><p>Rafael Costa</p>",
   "urgency_score": 0,
   "urgency_level": "baixa",
   "keywords": [
    {
     "word": "entrega",
     "count": 2
    },
    {
     "word": "sprint",
     "count": 2
    },
    {
     "word": "concluida",
     "count": 2
    },
    {
     "word": "time",
     "count": 1
    },
    {
     "word": "sucesso",
     "count": 1
    },
    {
     "word": "telas",
     "count": 1
    },
    {
     "word": "cadastro",
     "count": 1
    },
    {
     "word": "filtros",
     "count": 1
    }
   ],
   "action_items": [
    {
     "sentence": "A entrega da sprint 7 foi concluída com sucesso: telas de cadastro, filtros avançados e exportação para Excel.",
     "triggers": [
      "entregar"
     ],
     "dates": [],
     "names": [
      "Excel"
     ],
     "score": 3,
     "followed_by_context": true
    }
   ],
   "urgency_breakdown": {
    "entregar": 2,
    "assunto": 2,
    "exclamacoes": 1,
    "resolucao": -6
   }
  }
 ]
};
