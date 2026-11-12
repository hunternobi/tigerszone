import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Teilnahmebedingungen",
  description: `Teilnahmebedingungen für das Tippspiel und die Preise der Hauptrunde 2026/27 von ${SITE_NAME}.`,
  alternates: { canonical: "/teilnahmebedingungen" },
};

const link = "text-tigers-secondary hover:underline";

interface Section {
  title: string;
  /** Numbered (1), (2), ... in this order. */
  paragraphs: ReactNode[];
}

const SECTIONS: Section[] = [
  {
    title: "§ 1 Veranstalter",
    paragraphs: [
      <>
        Veranstalter des Tippspiels ist die TigersZone GbR, Puchhausener Straße
        6, 94339 Leiblfing, vertreten durch die Gesellschafter Tobias Ernst und
        Florian Rehmet (siehe{" "}
        <Link href="/impressum" className={link}>
          Impressum
        </Link>{" "}
        auf tigerszone.de).
      </>,
      "Der 1. Preis wird von der TigersZone GbR selbst gekauft. Der 2. Preis wird von The Squad Drops, der 3. Preis von Erl Bräu, Geiselhöring, zur Verfügung gestellt. Die Sponsoren sind nicht Veranstalter des Tippspiels.",
      "Das Tippspiel steht in keiner Verbindung zu den Straubing Tigers, zur Deutschen Eishockey Liga oder zu Instagram und wird von diesen weder gesponsert noch unterstützt.",
      <>
        Ergänzend gelten die{" "}
        <Link href="/agb" className={link}>
          Allgemeinen Geschäftsbedingungen (AGB)
        </Link>{" "}
        der Plattform. Bei Widersprüchen gehen für das Tippspiel und die
        Preisvergabe diese Teilnahmebedingungen vor.
      </>,
    ],
  },
  {
    title: "§ 2 Teilnahme",
    paragraphs: [
      "Teilnehmen kann jede Person ab Vollendung des 12. Lebensjahres, die ein Benutzerkonto bei TigersZone besitzt und die AGB akzeptiert hat (§ 4 der AGB). Die Teilnahme ist kostenlos. Es ist kein Einsatz erforderlich und es muss keine Ware oder Dienstleistung gekauft werden.",
      "Bei minderjährigen Gewinnern kann der Veranstalter vor der Preisübergabe die Zustimmung der Erziehungsberechtigten verlangen.",
      "Jede Person darf nur mit einem Benutzerkonto teilnehmen (§ 5 der AGB). Mehrfach- oder Scheinkonten sind unzulässig.",
      "Von der Preisvergabe ausgeschlossen sind die Gesellschafter der TigersZone GbR sowie Personen, die an der Organisation des Tippspiels beteiligt sind.",
    ],
  },
  {
    title: "§ 3 Ablauf und Wertung",
    paragraphs: [
      "Gewertet werden die Tipps im öffentlichen Tippspiel zu den Spielen der Hauptrunde der Saison 2026/27 nach den auf tigerszone.de veröffentlichten Spielregeln. Spiele der Vorbereitung und der Playoffs zählen nicht. Ranglisten privater Tippgruppen sind nicht Teil der Preisvergabe.",
      "Die Preise gehen an die drei Teilnehmer mit den meisten Punkten in der Gesamtrangliste am Ende der Hauptrunde. Maßgeblich ist der Stand der Rangliste nach Eintragung der Ergebnisse des 52. Spieltags der PENNY DEL 2026/27, einschließlich etwaiger Nachholspiele der Hauptrunde.",
      "Bei Punktgleichheit auf einem Preisrang entscheidet das Los.",
      "Der Veranstalter darf Wertungen korrigieren, wenn technische Fehler oder nachträglich geänderte offizielle Ergebnisse dies erfordern (siehe § 10 der AGB).",
    ],
  },
  {
    title: "§ 4 Preise",
    paragraphs: [
      "1. Preis: Ein von Marcel Brandt unterschriebenes Fantrikot. Der Gewinner wählt zwischen Heim-, Auswärts- und Alternativtrikot sowie die Größe.",
      "2. Preis: Ein Gutschein von The Squad Drops im Wert von 150 € für Ware nach Wahl im Shop von The Squad Drops.",
      "3. Preis: 2 Kästen Getränke nach eigener Wahl aus dem Sortiment von Erl Bräu, einzulösen im Brauereiverkauf in Geiselhöring. Das Pfand für Kästen und Flaschen übernimmt der Veranstalter.",
      "Der 3. Preis kann von allen Gewinnern unabhängig vom Alter gewonnen werden. Alkoholhaltige Getränke werden nur nach den Vorgaben des Jugendschutzgesetzes ausgegeben: Gewinner unter 16 Jahren wählen ausschließlich alkoholfreie Getränke, Gewinner ab 16 Jahren zusätzlich Bier und Biermischgetränke, Spirituosen erst ab 18 Jahren. Bei der Abholung kann ein Altersnachweis verlangt werden.",
      "Die Preise werden nicht in bar ausgezahlt, können nicht umgetauscht und nicht auf andere Personen übertragen werden.",
      "Der Veranstalter darf einen Preis durch einen gleichwertigen ersetzen, wenn der Preis ohne sein Verschulden nicht verfügbar ist.",
    ],
  },
  {
    title: "§ 5 Benachrichtigung und Übergabe",
    paragraphs: [
      "Die Gewinner werden nach Ende der Hauptrunde über die bei der Registrierung angegebene E-Mail-Adresse und/oder über die Plattform benachrichtigt.",
      "Meldet sich ein Gewinner nicht innerhalb von 14 Tagen nach der Benachrichtigung, verfällt der Anspruch auf den Preis. Der Preis geht dann an den nächstplatzierten Teilnehmer der Rangliste, der noch keinen Preis erhalten hat.",
      "Der 1. Preis wird persönlich übergeben. Ort und Termin werden individuell mit dem Gewinner abgestimmt. Der Gutschein für den 2. Preis wird per E-Mail zugestellt.",
      "Der 3. Preis wird ausschließlich vor Ort im Brauereiverkauf von Erl Bräu in Geiselhöring abgeholt; ein Versand ist nicht möglich. Der Abholtermin wird individuell mit dem Gewinner abgestimmt. Anfahrt, Transport und die Kosten der Anfahrt trägt der Gewinner.",
      "Für die Übergabe werden Name und Kontaktdaten des Gewinners benötigt. Für die Abholung des 3. Preises wird der Name des Gewinners an Erl Bräu weitergegeben. Die Daten werden nur für die Preisübergabe verwendet und danach nach den gesetzlichen Vorgaben gelöscht.",
    ],
  },
  {
    title: "§ 6 Veröffentlichung der Gewinner",
    paragraphs: [
      "Der Veranstalter darf die Benutzernamen der Gewinner auf der Plattform und auf seinen Social-Media-Kanälen (z. B. Instagram) bekanntgeben.",
      "Weitere Angaben oder Fotos, etwa von der Preisübergabe, werden nur mit Einwilligung des Gewinners veröffentlicht, bei Minderjährigen zusätzlich mit Einwilligung der Erziehungsberechtigten. Die Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden.",
      <>
        Näheres zur Verarbeitung personenbezogener Daten steht in der{" "}
        <Link href="/datenschutz" className={link}>
          Datenschutzerklärung
        </Link>
        .
      </>,
    ],
  },
  {
    title: "§ 7 Ausschluss und Beendigung",
    paragraphs: [
      "Der Veranstalter darf Teilnehmer ausschließen, die gegen diese Bedingungen oder die AGB verstoßen, insbesondere bei Manipulation, Mehrfachkonten oder falschen Angaben (§§ 11 und 15 der AGB). Bereits vergebene Preise können in diesem Fall zurückgefordert werden.",
      "Der Veranstalter darf das Tippspiel oder die Preisvergabe ändern, verkürzen oder abbrechen, wenn aus technischen oder rechtlichen Gründen eine ordnungsgemäße Durchführung nicht möglich ist, etwa bei Absage oder Abbruch der Saison.",
    ],
  },
  {
    title: "§ 8 Haftung und Schlussbestimmungen",
    paragraphs: [
      "Für die Haftung des Veranstalters gilt § 14 der AGB. Für Mängel an den von Sponsoren gestellten Preisen übernimmt der Veranstalter, soweit gesetzlich zulässig, keine Haftung.",
      "Es gilt das Recht der Bundesrepublik Deutschland nach Maßgabe von § 18 der AGB. Sollten einzelne Bestimmungen unwirksam sein, bleiben die übrigen davon unberührt.",
      <>
        Fragen zum Tippspiel beantwortet der Veranstalter unter{" "}
        <a href="mailto:tigerszoneofficial@gmail.com" className={link}>
          tigerszoneofficial@gmail.com
        </a>
        .
      </>,
    ],
  },
];

export default function TeilnahmebedingungenPage() {
  return (
    <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
      <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
        Teilnahmebedingungen
      </h1>
      <p className="mt-3 text-sm text-white/70">
        für das {SITE_NAME}-Tippspiel – Hauptrunde 2026/27
      </p>

      <div className="glass-panel mt-8 space-y-8 p-6 sm:p-8">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="font-ui text-lg font-semibold tracking-tight text-white">
              {section.title}
            </h2>
            <ol className="mt-2 space-y-2 text-sm text-white">
              {section.paragraphs.map((paragraph, index) => (
                <li key={index} className="flex gap-2">
                  <span className="shrink-0">({index + 1})</span>
                  <span>{paragraph}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}

        <p className="text-sm text-white/70">Stand: 12.11.2026</p>
      </div>
    </section>
  );
}
