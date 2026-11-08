import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { PRIZES } from "@/lib/prizes";

export const metadata: Metadata = {
  title: "Teilnahmebedingungen",
  description: `Teilnahmebedingungen für das Tippspiel und die Preise von ${SITE_NAME}.`,
  alternates: { canonical: "/teilnahmebedingungen" },
};

const list = "list-decimal space-y-2 pl-5 text-sm text-white";
const heading = "font-ui text-lg font-semibold tracking-tight text-white";
const link = "text-tigers-secondary hover:underline";

// ENTWURF: Die Textstellen in eckigen Klammern müssen vor der Veröffentlichung ausgefüllt und der Text
// rechtlich geprüft werden.
export default function TeilnahmebedingungenPage() {
  return (
    <section className="mx-auto max-w-3xl px-7 py-10 sm:px-6 sm:py-16">
      <h1 className="font-ui text-[2.15rem] leading-[1.06] font-semibold tracking-tight text-white sm:text-5xl">
        Teilnahmebedingungen
      </h1>
      <p className="mt-3 text-sm text-white/70">
        für das Tippspiel und die Preise der Hauptrunde
      </p>

      <div className="glass-panel mt-8 space-y-8 p-6 sm:p-8">
        <div>
          <h2 className={heading}>§ 1 Veranstalter</h2>
          <ol className={list}>
            <li>
              Veranstalter des Tippspiels ist die TigersZone GbR, Puchhausener
              Straße 6, 94339 Leiblfing (siehe Impressum).
            </li>
            <li>
              Die Preise werden von [Sponsoren / Unterstützer, bitte eintragen]
              zur Verfügung gestellt. Die Sponsoren sind nicht Veranstalter des
              Tippspiels.
            </li>
            <li>
              Das Tippspiel steht in keiner Verbindung zu den Straubing Tigers,
              zur Deutschen Eishockey Liga oder zu Instagram und wird von diesen
              weder gesponsert noch unterstützt.
            </li>
          </ol>
        </div>

        <div>
          <h2 className={heading}>§ 2 Teilnahme</h2>
          <ol className={list}>
            <li>
              Teilnehmen kann jede Person, die ein Benutzerkonto bei {SITE_NAME}{" "}
              besitzt und die Allgemeinen Geschäftsbedingungen akzeptiert hat. Die
              Teilnahme ist kostenlos, es ist kein Einsatz erforderlich und keine
              Ware oder Dienstleistung muss gekauft werden.
            </li>
            <li>
              Jede Person darf nur mit einem Benutzerkonto teilnehmen. Mehrfach-
              oder Scheinkonten sind unzulässig.
            </li>
            <li>
              Von der Teilnahme an der Preisvergabe ausgeschlossen sind die
              Betreiber von {SITE_NAME} sowie [weitere Personengruppen, z. B.
              Mitarbeiter und Angehörige der Sponsoren, bitte prüfen].
            </li>
          </ol>
        </div>

        <div>
          <h2 className={heading}>§ 3 Ablauf und Wertung</h2>
          <ol className={list}>
            <li>
              Gewertet werden die Tipps zu den Spielen der Hauptrunde der Saison
              2026/27 nach den auf der Plattform veröffentlichten Spielregeln.
              Spiele der Vorbereitung zählen nicht.
            </li>
            <li>
              Die Preise gehen an die drei Teilnehmer mit den meisten Punkten in
              der Gesamtrangliste am Ende der Hauptrunde. Maßgeblich ist der
              Stand der Rangliste nach Eintragung des letzten Hauptrundenspiels
              [genauen Stichtag bitte festlegen].
            </li>
            <li>
              Bei Punktgleichheit entscheidet [Regel bitte festlegen, z. B. die
              Zahl der exakten Ergebnistipps, sonst das Los].
            </li>
            <li>
              Der Betreiber darf Wertungen korrigieren, wenn technische Fehler
              oder nachträglich geänderte offizielle Ergebnisse dies erfordern
              (siehe § 10 der AGB).
            </li>
          </ol>
        </div>

        <div>
          <h2 className={heading}>§ 4 Preise</h2>
          <ol className={list}>
            {PRIZES.map((prize) => (
              <li key={prize.place}>
                {prize.place}. Preis: {prize.title}. {prize.detail}
              </li>
            ))}
            <li>
              Die Preise werden nicht in bar ausgezahlt und können nicht
              umgetauscht oder auf andere Personen übertragen werden. Eine
              Barauszahlung des Gegenwerts ist ausgeschlossen.
            </li>
            <li>
              Der 3. Preis enthält Alkohol und wird nur an Personen ab 18 Jahren
              ausgegeben. [Regelung für minderjährige Gewinner bitte festlegen,
              z. B. alkoholfreier Ersatzpreis.]
            </li>
            <li>
              Der Veranstalter darf einen Preis durch einen gleichwertigen
              ersetzen, wenn der Preis ohne sein Verschulden nicht verfügbar ist.
            </li>
          </ol>
        </div>

        <div>
          <h2 className={heading}>§ 5 Benachrichtigung und Übergabe</h2>
          <ol className={list}>
            <li>
              Die Gewinner werden nach Ende der Hauptrunde über die bei der
              Registrierung angegebene E-Mail-Adresse und/oder über die
              Plattform benachrichtigt.
            </li>
            <li>
              Meldet sich ein Gewinner nicht innerhalb von [Frist, z. B. 14
              Tagen] nach der Benachrichtigung, verfällt der Anspruch auf den
              Preis. Der Preis geht dann an den nächstplatzierten Teilnehmer.
            </li>
            <li>
              Die Übergabe des 1. und 2. Preises erfolgt [Art der Übergabe, z. B.
              Versand oder persönliche Übergabe, bitte festlegen]. Der 3. Preis
              wird im Brauereiverkauf in Geiselhöring abgeholt; Anfahrt und
              Kosten der Abholung trägt der Gewinner.
            </li>
            <li>
              Für die Übergabe werden Name und Anschrift bzw. Kontaktdaten des
              Gewinners benötigt. Sie werden nur dafür verwendet und nach der
              Übergabe nach den gesetzlichen Vorgaben gelöscht.
            </li>
          </ol>
        </div>

        <div>
          <h2 className={heading}>§ 6 Veröffentlichung der Gewinner</h2>
          <p className="text-sm text-white">
            Der Veranstalter darf den Benutzernamen der Gewinner auf der
            Plattform und auf seinen Social-Media-Kanälen (z. B. Instagram)
            bekanntgeben. Weitere Angaben werden nur mit Einwilligung des
            Gewinners veröffentlicht. Die Einwilligung kann jederzeit mit Wirkung
            für die Zukunft widerrufen werden. Näheres zur Verarbeitung von
            Daten steht in der{" "}
            <a href="/datenschutz" className={link}>
              Datenschutzerklärung
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className={heading}>§ 7 Ausschluss und Beendigung</h2>
          <ol className={list}>
            <li>
              Der Veranstalter darf Teilnehmer ausschließen, die gegen diese
              Bedingungen oder die AGB verstoßen, insbesondere bei Manipulation,
              Mehrfachkonten oder falschen Angaben. Bereits vergebene Preise
              können in diesem Fall zurückgefordert werden.
            </li>
            <li>
              Der Veranstalter darf das Tippspiel oder die Preisvergabe ohne
              Angabe von Gründen ändern, verkürzen oder abbrechen, wenn aus
              technischen oder rechtlichen Gründen eine ordnungsgemäße
              Durchführung nicht möglich ist, etwa bei Absage oder Abbruch der
              Saison.
            </li>
          </ol>
        </div>

        <div>
          <h2 className={heading}>§ 8 Haftung und Schlussbestimmungen</h2>
          <ol className={list}>
            <li>
              Für die Haftung des Veranstalters gilt § 14 der AGB. Für Mängel an
              den von Sponsoren gestellten Preisen übernimmt der Veranstalter,
              soweit gesetzlich zulässig, keine Haftung.
            </li>
            <li>Der Rechtsweg ist ausgeschlossen.</li>
            <li>
              Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne
              Bestimmungen unwirksam sein, bleiben die übrigen davon unberührt.
            </li>
            <li>
              Fragen zum Tippspiel beantwortet der Veranstalter unter{" "}
              <a href="mailto:Tigerszoneofficial@gmail.com" className={link}>
                Tigerszoneofficial@gmail.com
              </a>
              .
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
