"""Testes do motor de regras (python -m unittest discover -s tests)."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from services.email_parser import (  # noqa: E402
    analyze_email,
    clean_body,
    extract_keywords,
    extract_project_tag,
    find_action_sentences,
    parse_sender,
    score_urgency,
    split_sentences,
)

OUTLOOK_REPLY = """
<html><head><style>p{color:red}</style></head><body>
<p>Olá pessoal,</p>
<p>O deploy do módulo financeiro está <b>bloqueado</b>. Precisamos revisar as permissões com o Carlos Mendes até sexta-feira.</p>
<p>URGENTE: o prazo de entrega para o cliente é 15/10.</p>
<p>Atenciosamente,</p>
<p>Ana Souza<br>Gerente de Projetos</p>
<div id="divRplyFwdMsg"><b>De:</b> Carlos<br><b>Enviado:</b> ontem<br>texto antigo sobre reunião</div>
</body></html>
"""


class CleaningTests(unittest.TestCase):
    def test_html_signature_and_history_removed(self):
        text = clean_body(OUTLOOK_REPLY)
        self.assertIn("bloqueado", text)
        self.assertNotIn("Atenciosamente", text)
        self.assertNotIn("Gerente de Projetos", text)
        self.assertNotIn("texto antigo", text)
        self.assertNotIn("color:red", text)

    def test_gmail_style_quote_removed(self):
        body = "Pode revisar hoje?\n\nEm seg., 21 de set. de 2026 às 10:00, Ana <ana@x.com> escreveu:\n> versão antiga"
        self.assertEqual(clean_body(body), "Pode revisar hoje?")

    def test_english_original_message_removed(self):
        body = "Blocked on QA.\n\n-----Original Message-----\nFrom: Bob\nSent: Monday\nold stuff"
        self.assertEqual(clean_body(body), "Blocked on QA.")

    def test_thanks_on_first_line_is_content(self):
        self.assertTrue(clean_body("Obrigado!\nSegue o arquivo revisado.").startswith("Obrigado!"))

    def test_disclaimer_removed(self):
        body = "Segue o status.\nEsta mensagem pode conter informação confidencial e é destinada apenas ao destinatário."
        self.assertEqual(clean_body(body), "Segue o status.")


class ExtractionTests(unittest.TestCase):
    def test_keywords_skip_stopwords_and_accents_fold(self):
        kws = dict(extract_keywords("A reunião de migração. Reuniao sobre a migração do ERP e the migration."))
        self.assertEqual(kws["reuniao"], 2)
        self.assertEqual(kws["migracao"], 2)
        self.assertNotIn("sobre", kws)
        self.assertNotIn("the", kws)

    def test_action_sentence_followed_by_date_and_name(self):
        sentences = split_sentences("Precisamos revisar o contrato com o Carlos Mendes até sexta-feira. O tempo está bom.")
        items = find_action_sentences(sentences)
        self.assertEqual(len(items), 1)
        self.assertIn("revisar", items[0].triggers)
        self.assertIn("sexta-feira", items[0].dates)
        self.assertIn("Carlos Mendes", items[0].names)
        self.assertTrue(items[0].followed_by_context)

    def test_dates_formats(self):
        items = find_action_sentences(["Prazo: entregar dia 24/09 às 14h30, ou amanhã no máximo."])
        self.assertEqual(items[0].dates, ["dia 24/09", "14h30", "amanhã"])

    def test_parse_sender(self):
        self.assertEqual(parse_sender("Ana Souza <Ana@X.com>"), ("Ana Souza", "ana@x.com"))
        self.assertEqual(parse_sender("joao.silva@x.com"), ("Joao Silva", "joao.silva@x.com"))

    def test_parse_sender_corporate_formats(self):
        # nome "Sobrenome, Nome" do Outlook corporativo: a virgula quebrava o parseaddr
        self.assertEqual(parse_sender("Souza, Ana <ana.souza@jpmorgan.com>"), ("Souza, Ana", "ana.souza@jpmorgan.com"))
        self.assertEqual(parse_sender('"Souza, Ana" <ana.souza@jpmorgan.com>'), ("Souza, Ana", "ana.souza@jpmorgan.com"))
        self.assertEqual(parse_sender("Souza, Ana (CIB, BRA) <ana@x.com>"), ("Souza, Ana (CIB, BRA)", "ana@x.com"))
        self.assertEqual(parse_sender('"Conceição, João" <joao@x.com>'), ("Conceição, João", "joao@x.com"))
        # so o nome (sem e-mail) continua sendo nome, nao "Desconhecido"
        self.assertEqual(parse_sender("Souza, Ana"), ("Souza, Ana", ""))
        # endereco X500 do Exchange nao e e-mail
        self.assertEqual(parse_sender("Ana Souza </O=EXCHANGELABS/OU=X/CN=ANA>"), ("Ana Souza", ""))
        self.assertEqual(parse_sender(""), ("Desconhecido", ""))

    def test_project_tag(self):
        self.assertEqual(extract_project_tag("RE: [PROJ-01] Status"), "PROJ-01")
        self.assertIsNone(extract_project_tag("Status sem tag"))


class UrgencyTests(unittest.TestCase):
    def test_levels(self):
        self.assertEqual(score_urgency("Ata da reunião", "Segue a ata.")[1], "baixa")
        self.assertEqual(score_urgency("URGENTE", "Deploy bloqueado, prazo estourado!")[1], "critica")

    def test_resolution_lowers_score(self):
        busy = score_urgency("Entrega", "A entrega da sprint está pendente.")[0]
        done = score_urgency("Entrega", "A entrega da sprint foi concluída com sucesso.")[0]
        self.assertLess(done, busy)

    def test_full_analysis(self):
        a = analyze_email("RE: [PROJ-01] Deploy bloqueado", OUTLOOK_REPLY,
                          "Ana Souza <ana.souza@acme.com>", "Tue, 22 Sep 2026 10:00:00 -0300")
        self.assertEqual(a.sender_name, "Ana Souza")
        self.assertEqual(a.date_received.isoformat(), "2026-09-22T13:00:00")  # UTC
        self.assertEqual(a.urgency_level, "critica")
        self.assertTrue(a.summary)
        self.assertNotIn("proj-01", dict(a.keywords))
        self.assertTrue(any(i.followed_by_context for i in a.action_items))


if __name__ == "__main__":
    unittest.main()
