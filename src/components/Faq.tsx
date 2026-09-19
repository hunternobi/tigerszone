"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "benutzername",
    question: '„Name" – ist das mein Klarname oder mein Nutzername?',
    answer:
      "Das ist dein Benutzername (nicht dein Klarname). Du kannst ihn in deinem Profil jederzeit ändern, allerdings höchstens einmal pro Woche.",
  },
  {
    id: "anonym",
    question: 'Kann ich anonym bleiben (z. B. als „Anonym123")?',
    answer:
      "Nein, aktuell ist keine Anonymisierung geplant – dein Benutzername ist für andere Mitglieder sichtbar.",
  },
  {
    id: "passwort-vergessen",
    question: "Ich habe mein Passwort vergessen, was mache ich jetzt?",
    answer:
      'Klicke auf der Login-Seite auf „Passwort vergessen?" und gib deine E-Mail-Adresse ein. Du bekommst dann einen Link zum Zurücksetzen zugeschickt.',
  },
  {
    id: "tipp-aendern",
    question: "Kann ich meinen Tipp nachträglich ändern?",
    answer: "Ja, dein Tipp kann bis zum Eröffnungsbully beliebig oft geändert werden.",
  },
  {
    id: "mehrere-gruppen",
    question: "Kann ich mehreren Gruppen beitreten?",
    answer:
      'Ja, das ist möglich. Im Reiter „Gruppen" siehst du die Gesamtstände all deiner Gruppen, im Reiter „Tippspiel" die Top 5 der gerade ausgewählten Gruppe.',
  },
  {
    id: "gruppen-rechte",
    question: "Welche Rechte haben Head Coach und Assistant Coach in einer Gruppe?",
    answer:
      "Jede Gruppe hat einen Head Coach (den Ersteller) und kann einen Assistant Coach haben. Beide können Mitglieder aus der Gruppe entfernen und den Gruppennamen ändern.",
  },
  {
    id: "fremde-tipps",
    question: "Warum sehe ich auf fremden Profilen nicht alle abgegebenen Tipps?",
    answer:
      "Der Tipp eines anderen Mitglieds für ein Spiel wird auf seinem Profil erst nach dem Eröffnungsbully dieses Spiels angezeigt. So kann niemand seinen eigenen Tipp nachträglich an einen bereits sichtbaren Tipp anpassen. Auf deinem eigenen Profil siehst du deine Tipps natürlich sofort.",
  },
  {
    id: "bonustipps",
    question: "Was sind Bonustipps?",
    answer:
      "Vor Beginn der Hauptrunde kannst du im Tippspiel zusätzlich vier Bonustipps abgeben: Hauptrundensieger, Platzierung der Tigers, Topscorer der Tigers und meiste Tore bei den Tigers. Jeder richtige Bonustipp bringt dir 10 Extrapunkte, ausgewertet am Ende der Hauptrunde. Zu Beginn der Playoffs gibt es eine weitere Runde Bonustipps.",
  },
  {
    id: "kontakt",
    question: "Weitere Fragen oder Anregungen?",
    answer: (
      <>
        Schreib uns auf Instagram{" "}
        <a
          href="https://www.instagram.com/tigerszoneofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="text-tigers-secondary hover:underline"
        >
          @tigerszoneofficial
        </a>{" "}
        oder per Mail an{" "}
        <a
          href="mailto:tigerszoneofficial@gmail.com"
          className="text-tigers-secondary hover:underline"
        >
          tigerszoneofficial@gmail.com
        </a>
        .
      </>
    ),
  },
];

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function checkHash() {
      if (window.location.hash === `#${item.id}`) {
        setOpen(true);
        requestAnimationFrame(() => {
          document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [item.id]);

  return (
    <div id={item.id} className="glass-panel-sm scroll-mt-24 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
        aria-expanded={open}
      >
        <span className="font-semibold text-white">{item.question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-white transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-white sm:px-5 sm:pb-5">{item.answer}</div>
      )}
    </div>
  );
}

export default function Faq() {
  return (
    <div id="faq" className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-white sm:text-3xl">Häufige Fragen</h2>
      <div className="mt-6 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <FaqRow key={item.question} item={item} />
        ))}
      </div>
    </div>
  );
}
