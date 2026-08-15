import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: `Datenschutzerklärung von ${SITE_NAME}.`,
  alternates: { canonical: "/datenschutz" },
};

const link = "text-tigers-secondary hover:underline";
const list = "mt-2 list-disc space-y-1 pl-5 text-sm text-white";

export default function DatenschutzPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Datenschutzerklärung</h1>
      <p className="mt-2 text-sm text-white/60">Stand: August 2026</p>

      <div className="glass-panel mt-8 space-y-8 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-white">1. Verantwortliche</h2>
          <p className="mt-2 text-sm text-white">
            Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:
          </p>
          <p className="mt-2 text-sm font-semibold text-white">{SITE_NAME}</p>
          <div className="mt-2 space-y-3 text-sm text-white">
            <p>
              Tobias Ernst
              <br />
              94339 Leiblfing
              <br />
              Deutschland
            </p>
            <p>und</p>
            <p>
              Florian Rehmet
              <br />
              84034 Landshut
              <br />
              Deutschland
            </p>
          </div>
          <p className="mt-2 text-sm text-white">
            E-Mail:{" "}
            <a href="mailto:Tigerszoneofficial@gmail.com" className={link}>
              Tigerszoneofficial@gmail.com
            </a>
          </p>
          <p className="mt-2 text-sm text-white">
            Weitere Angaben zum Betreiber finden sich im Impressum.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">2. Allgemeine Hinweise zur Datenverarbeitung</h2>
          <p className="mt-2 text-sm text-white">
            Der Schutz deiner personenbezogenen Daten ist uns wichtig. Wir verarbeiten
            personenbezogene Daten ausschließlich im Rahmen der geltenden datenschutzrechtlichen
            Vorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO) und des
            Telekommunikation-Digitale-Dienste-Datenschutz-Gesetzes (TDDDG).
          </p>
          <p className="mt-2 text-sm text-white">
            Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder
            identifizierbare natürliche Person beziehen.
          </p>
          <p className="mt-2 text-sm text-white">
            Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung und zum
            Betrieb von {SITE_NAME}, zur Durchführung der angebotenen Funktionen, zur
            Kommunikation mit Nutzern oder zur Erfüllung gesetzlicher Verpflichtungen erforderlich
            ist.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">3. Aufruf der Website und Server-Logdaten</h2>
          <p className="mt-2 text-sm text-white">
            Beim Aufruf unserer Website werden durch den technischen Betrieb der Website
            automatisch bestimmte Informationen verarbeitet.
          </p>
          <p className="mt-2 text-sm text-white">Hierzu können insbesondere gehören:</p>
          <ul className={list}>
            <li>IP-Adresse des zugreifenden Geräts,</li>
            <li>Datum und Uhrzeit des Zugriffs,</li>
            <li>aufgerufene Seiten und Dateien,</li>
            <li>Informationen über den verwendeten Browser,</li>
            <li>Betriebssystem und Gerätetyp,</li>
            <li>Referrer-URL,</li>
            <li>technische Informationen über die Anfrage,</li>
            <li>Informationen über Fehler und die technische Funktionsfähigkeit der Website.</li>
          </ul>
          <p className="mt-2 text-sm text-white">
            Die Verarbeitung erfolgt zur technischen Bereitstellung der Website, zur
            Gewährleistung der Sicherheit und Stabilität sowie zur Erkennung und Abwehr von
            Angriffen und Missbrauch.
          </p>
          <p className="mt-2 text-sm text-white">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in
            einem sicheren und technisch zuverlässigen Betrieb der Website.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Website wird über <strong>Vercel</strong> betrieben. Im Rahmen des Hostings
            verarbeitet Vercel technische Informationen, die bei der Nutzung der Website anfallen
            können.
          </p>
          <p className="mt-2 text-sm text-white">
            Weitere Informationen zur Datenverarbeitung durch Vercel findest du in der
            Datenschutzerklärung von Vercel:{" "}
            <a
              href="https://vercel.com/legal/privacy-notice"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              Vercel Privacy Notice
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">4. Hosting durch Vercel</h2>
          <p className="mt-2 text-sm text-white">
            Unsere Website wird derzeit über <strong>Vercel</strong> bereitgestellt.
          </p>
          <p className="mt-2 text-sm text-white">
            Vercel ist ein Anbieter für Hosting und die Bereitstellung von Webanwendungen. Im
            Rahmen des technischen Betriebs können unter anderem IP-Adressen, technische
            Informationen des verwendeten Endgeräts, Browserinformationen, Zeitstempel,
            angeforderte Ressourcen sowie technische Log- und Diagnosedaten verarbeitet werden.
          </p>
          <p className="mt-2 text-sm text-white">
            Soweit Vercel personenbezogene Daten in unserem Auftrag verarbeitet, erfolgt dies auf
            Grundlage einer Vereinbarung zur Auftragsverarbeitung gemäß Art. 28 DSGVO.
          </p>
          <p className="mt-2 text-sm text-white">
            Vercel verarbeitet personenbezogene Daten je nach Dienst und Verarbeitungsvorgang auch
            außerhalb des Europäischen Wirtschaftsraums. Für entsprechende Übermittlungen bestehen
            nach Angaben von Vercel geeignete datenschutzrechtliche Garantien.
          </p>
          <p className="mt-2 text-sm text-white">
            Weitere Informationen:{" "}
            <a
              href="https://vercel.com/legal/privacy-notice"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              Vercel Privacy Notice
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">5. Domain und DNS</h2>
          <p className="mt-2 text-sm text-white">
            Die Domain <strong>tigerszone.de</strong> wird über <strong>IONOS SE</strong>{" "}
            verwaltet.
          </p>
          <p className="mt-2 text-sm text-white">
            Im Rahmen der Domainverwaltung können insbesondere die für die Registrierung und
            Verwaltung der Domain erforderlichen Kontaktdaten sowie technische Daten verarbeitet
            werden.
          </p>
          <p className="mt-2 text-sm text-white">
            Soweit personenbezogene Daten durch IONOS in unserem Auftrag verarbeitet werden,
            erfolgt dies auf Grundlage einer Vereinbarung zur Auftragsverarbeitung gemäß Art. 28
            DSGVO.
          </p>
          <p className="mt-2 text-sm text-white">
            Weitere Informationen zum Datenschutz bei IONOS:{" "}
            <a
              href="https://www.ionos.de/hilfe/datenschutz/"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              IONOS Datenschutz
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">6. Benutzerkonto und Registrierung</h2>
          <p className="mt-2 text-sm text-white">
            Für bestimmte Funktionen von {SITE_NAME} ist die Erstellung eines Benutzerkontos
            erforderlich.
          </p>
          <p className="mt-2 text-sm text-white">
            Bei der Registrierung werden insbesondere folgende Daten verarbeitet:
          </p>
          <ul className={list}>
            <li>E-Mail-Adresse,</li>
            <li>Anzeigename,</li>
            <li>Passwort bzw. der daraus erzeugte Passwort-Hash,</li>
            <li>Datum der Erstellung des Benutzerkontos,</li>
            <li>Status der E-Mail-Verifizierung,</li>
            <li>gegebenenfalls technische Verifizierungsdaten.</li>
          </ul>
          <p className="mt-2 text-sm text-white">
            Passwörter werden nicht im Klartext gespeichert. Zur Speicherung wird ein
            kryptografischer Passwort-Hash verwendet.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Verarbeitung erfolgt zur Einrichtung und Verwaltung des Benutzerkontos sowie zur
            Bereitstellung der vom Nutzer gewünschten Funktionen.
          </p>
          <p className="mt-2 text-sm text-white">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung zur
            Durchführung des Nutzungsverhältnisses erforderlich ist.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">7. Authentifizierung und Sitzungen</h2>
          <p className="mt-2 text-sm text-white">
            Für die Anmeldung und Authentifizierung verwenden wir <strong>Auth.js (NextAuth.js)</strong>{" "}
            mit einem Credentials-Provider.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Anmeldung erfolgt über E-Mail-Adresse und Passwort. Es werden keine
            Social-Login-Dienste wie Google, Facebook oder vergleichbare OAuth-Anbieter eingesetzt.
          </p>
          <p className="mt-2 text-sm text-white">
            Zur Aufrechterhaltung der Anmeldung werden <strong>JWT-basierte Sessions</strong>{" "}
            verwendet.
          </p>
          <p className="mt-2 text-sm text-white">
            Dabei werden technisch erforderliche Informationen verarbeitet, um den angemeldeten
            Nutzer zu erkennen und den Zugriff auf geschützte Funktionen zu ermöglichen.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">
            8. Cookies und vergleichbare Technologien
          </h2>
          <p className="mt-2 text-sm text-white">
            {SITE_NAME} verwendet ausschließlich technisch notwendige Cookies bzw. vergleichbare
            technische Speichermechanismen, soweit diese für den Betrieb und die grundlegenden
            Funktionen der Website erforderlich sind.
          </p>
          <p className="mt-2 text-sm text-white">
            Derzeit können insbesondere folgende Cookies verwendet werden:
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm text-white">
              <thead>
                <tr className="border-b border-white/15 text-xs tracking-wide text-white/60 uppercase">
                  <th className="pb-2 pr-4 font-semibold">Cookie</th>
                  <th className="pb-2 pr-4 font-semibold">Zweck</th>
                  <th className="pb-2 font-semibold">Laufzeit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs">authjs.session-token</td>
                  <td className="py-3 pr-4">Aufrechterhaltung des Login-Status</td>
                  <td className="py-3">Sitzung / bis Logout</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs">authjs.csrf-token</td>
                  <td className="py-3 pr-4">Schutz vor Cross-Site-Request-Forgery-Angriffen</td>
                  <td className="py-3">Sitzung</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs">activeGroupId</td>
                  <td className="py-3 pr-4">Speicherung der aktuell ausgewählten Tippgruppe</td>
                  <td className="py-3">30 Tage</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-white">
            Diese Cookies werden nicht zu Werbe- oder Marketingzwecken eingesetzt.
          </p>
          <p className="mt-2 text-sm text-white">
            Für technisch notwendige Cookies ist grundsätzlich keine Einwilligung erforderlich,
            sofern die Speicherung bzw. der Zugriff auf Informationen auf dem Endgerät für die
            Bereitstellung des vom Nutzer ausdrücklich gewünschten Dienstes unbedingt erforderlich
            ist (§ 25 Abs. 2 TDDDG).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">9. Vercel Analytics</h2>
          <p className="mt-2 text-sm text-white">
            Wir verwenden <strong>Vercel Analytics</strong> zur statistischen Auswertung der
            Nutzung unserer Website.
          </p>
          <p className="mt-2 text-sm text-white">
            Vercel Analytics verwendet keine Cookies zur klassischen Wiedererkennung von Nutzern.
          </p>
          <p className="mt-2 text-sm text-white">
            Im Rahmen der Nutzung können jedoch technische Informationen verarbeitet werden.
            Hierzu können insbesondere Informationen über aufgerufene Seiten, Zeitpunkte,
            Browser- und Geräteeigenschaften sowie IP-Adresse und daraus abgeleitete
            Standortinformationen gehören.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Verarbeitung dient der statistischen Auswertung und Verbesserung unseres
            Online-Angebots.
          </p>
          <p className="mt-2 text-sm text-white">
            Soweit die Verarbeitung personenbezogener Daten erforderlich ist, erfolgt sie auf
            Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der
            Analyse und Verbesserung unseres Online-Angebots.
          </p>
          <p className="mt-2 text-sm text-white">
            Weitere Informationen:{" "}
            <a
              href="https://vercel.com/legal/privacy-notice"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              Vercel Privacy Notice
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">10. MongoDB Atlas</h2>
          <p className="mt-2 text-sm text-white">
            Für die Speicherung der für den Betrieb von {SITE_NAME} erforderlichen Daten verwenden
            wir <strong>MongoDB Atlas</strong>, einen Datenbankdienst der MongoDB, Inc.
          </p>
          <p className="mt-2 text-sm text-white">
            Dabei können insbesondere folgende Daten gespeichert werden:
          </p>
          <ul className={list}>
            <li>E-Mail-Adresse,</li>
            <li>Anzeigename,</li>
            <li>Passwort-Hash,</li>
            <li>Benutzerrolle,</li>
            <li>Erstellungsdatum des Benutzerkontos,</li>
            <li>Status der E-Mail-Verifizierung,</li>
            <li>Verifizierungs- und Zurücksetzungs-Tokens einschließlich ihrer Ablaufzeit,</li>
            <li>für den Betrieb der Tippspiel- und Community-Funktionen erforderliche Daten.</li>
          </ul>
          <p className="mt-2 text-sm text-white">
            Die Datenbank wird ausschließlich zur technischen Bereitstellung und Verwaltung der
            Plattform verwendet.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, soweit sie zur
            Durchführung des Nutzungsverhältnisses erforderlich ist, sowie gegebenenfalls Art. 6
            Abs. 1 lit. f DSGVO zur Sicherstellung eines sicheren und zuverlässigen technischen
            Betriebs.
          </p>
          <p className="mt-2 text-sm text-white">
            Weitere Informationen zum Datenschutz bei MongoDB:{" "}
            <a
              href="https://www.mongodb.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              MongoDB Privacy Policy
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">11. E-Mail-Versand über Resend</h2>
          <p className="mt-2 text-sm text-white">
            Für den Versand von E-Mails im Zusammenhang mit Benutzerkonten und technischen
            Funktionen von {SITE_NAME} verwenden wir <strong>Resend</strong>.
          </p>
          <p className="mt-2 text-sm text-white">
            Dabei können insbesondere folgende Daten verarbeitet werden:
          </p>
          <ul className={list}>
            <li>E-Mail-Adresse des Empfängers,</li>
            <li>Anzeigename, soweit dieser in der E-Mail verwendet wird,</li>
            <li>Inhalt der versendeten E-Mail,</li>
            <li>technische Versandinformationen.</li>
          </ul>
          <p className="mt-2 text-sm text-white">
            Resend wird insbesondere für transaktionale E-Mails verwendet, beispielsweise für
            E-Mails zur Verifizierung eines Benutzerkontos oder zum Zurücksetzen eines Passworts.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Verarbeitung erfolgt zur Durchführung des Nutzungsverhältnisses und damit auf
            Grundlage von Art. 6 Abs. 1 lit. b DSGVO.
          </p>
          <p className="mt-2 text-sm text-white">
            Resend wird von der <strong>Plus Five Five, Inc.</strong> betrieben und ist ein
            Anbieter mit Sitz in den Vereinigten Staaten.
          </p>
          <p className="mt-2 text-sm text-white">
            Nach Angaben von Resend werden Kundendaten in den Vereinigten Staaten gespeichert. Für
            die Übermittlung personenbezogener Daten aus dem Europäischen Wirtschaftsraum in die
            Vereinigten Staaten verwendet Resend geeignete datenschutzrechtliche Mechanismen,
            insbesondere Standardvertragsklauseln und – soweit anwendbar – das EU-U.S. Data
            Privacy Framework.
          </p>
          <p className="mt-2 text-sm text-white">
            Weitere Informationen:{" "}
            <a
              href="https://resend.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              Resend Privacy Policy
            </a>{" "}
            ·{" "}
            <a
              href="https://resend.com/legal/dpa"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              Resend Data Processing Agreement
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">12. Selbst gehostete Google Fonts</h2>
          <p className="mt-2 text-sm text-white">
            Auf unserer Website werden Schriftarten von Google Fonts verwendet.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Schriftarten werden über die Funktion <code>next/font/google</code> bereits
            während des Build-Prozesses abgerufen und anschließend von unserer eigenen Website
            ausgeliefert.
          </p>
          <p className="mt-2 text-sm text-white">
            Beim Aufruf unserer Website wird daher keine direkte Verbindung zu den Servern von
            Google hergestellt, um die verwendeten Schriftarten zu laden.
          </p>
          <p className="mt-2 text-sm text-white">
            Es findet durch die Einbindung der Schriftarten auf unserer Website daher keine
            Übermittlung der IP-Adresse oder anderer personenbezogener Daten des Besuchers an
            Google zum Zweck des Abrufs der Schriftarten statt.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">13. Instagram-Einbettungen</h2>
          <p className="mt-2 text-sm text-white">
            Auf einzelnen Seiten können Inhalte von <strong>Instagram</strong> eingebettet sein.
          </p>
          <p className="mt-2 text-sm text-white">
            Für die Darstellung dieser eingebetteten Inhalte wird das Script{" "}
            <code>https://www.instagram.com/embed.js</code> von Instagram geladen.
          </p>
          <p className="mt-2 text-sm text-white">
            Beim Aufruf einer Seite mit einer solchen Einbettung wird daher eine Verbindung zu
            Servern von Instagram bzw. Meta hergestellt. Dabei können insbesondere die
            IP-Adresse, Informationen über den verwendeten Browser und das Endgerät sowie
            Informationen über den Aufruf der jeweiligen Seite an Instagram bzw. Meta übermittelt
            werden.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Datenverarbeitung erfolgt durch Meta Platforms Ireland Limited bzw. weitere mit
            der Bereitstellung des Dienstes beauftragte Unternehmen.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Einbindung dient dazu, Instagram-Inhalte innerhalb von {SITE_NAME} darzustellen.
          </p>
          <p className="mt-2 text-sm text-white">
            Soweit die Verarbeitung personenbezogener Daten für die Bereitstellung der
            eingebetteten Inhalte erforderlich ist, erfolgt sie auf Grundlage von Art. 6 Abs. 1
            lit. f DSGVO. Unser berechtigtes Interesse besteht darin, öffentlich bereitgestellte
            Instagram-Inhalte innerhalb unseres Fanangebots darzustellen.
          </p>
          <p className="mt-2 text-sm text-white">
            Weitere Informationen zum Datenschutz bei Meta:{" "}
            <a
              href="https://www.facebook.com/privacy/policy/"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              Meta Privacy Policy
            </a>
          </p>
          <p className="mt-2 text-sm text-white">
            <strong>Hinweis:</strong> Da beim Laden des Instagram-Scripts eine Verbindung zu
            Instagram hergestellt wird, kann diese Einbindung technisch nicht mit einer
            vollständig externen Ressourcenfreiheit gleichgesetzt werden.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">14. Bilder und sonstige Inhalte</h2>
          <p className="mt-2 text-sm text-white">
            Die auf {SITE_NAME} verwendeten Bilder werden grundsätzlich von unserem eigenen
            Webserver bzw. über die von uns eingesetzte Hosting-Infrastruktur ausgeliefert.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Bilder werden lokal auf der Website gespeichert und über die Website
            bereitgestellt. Es wird kein externer Bilderdienst wie Cloudinary oder ein
            vergleichbarer externer Bild-Hosting-Dienst eingesetzt.
          </p>
          <p className="mt-2 text-sm text-white">
            Beim Abruf der Bilder können – wie bei jedem Abruf einer Ressource unserer Website –
            technische Verbindungsdaten verarbeitet werden.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">15. Community-Funktionen und Nutzerinhalte</h2>
          <p className="mt-2 text-sm text-white">
            {SITE_NAME} bietet Community- und Tippspielfunktionen, über die Nutzer bestimmte
            Inhalte und Informationen innerhalb der Plattform bereitstellen können.
          </p>
          <p className="mt-2 text-sm text-white">
            Dabei können insbesondere folgende Informationen verarbeitet und anderen Nutzern
            angezeigt werden:
          </p>
          <ul className={list}>
            <li>Anzeigename,</li>
            <li>Tipps,</li>
            <li>Platzierungen und Ranglisten,</li>
            <li>Beiträge und sonstige vom Nutzer eingestellte Inhalte,</li>
            <li>Informationen über die Teilnahme an Tippgruppen.</li>
          </ul>
          <p className="mt-2 text-sm text-white">
            Die Verarbeitung erfolgt zur Bereitstellung der jeweiligen Community- und
            Tippspielfunktionen und damit grundsätzlich auf Grundlage von Art. 6 Abs. 1 lit. b
            DSGVO.
          </p>
          <p className="mt-2 text-sm text-white">
            Nutzer sollten beachten, dass Informationen, die in öffentlich zugänglichen Bereichen
            veröffentlicht werden, von anderen Nutzern eingesehen werden können.
          </p>
          <p className="mt-2 text-sm text-white">
            Es sollte daher vermieden werden, personenbezogene oder vertrauliche Informationen in
            öffentlich sichtbaren Bereichen zu veröffentlichen.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">16. Kontaktaufnahme per E-Mail</h2>
          <p className="mt-2 text-sm text-white">
            Wenn du uns per E-Mail kontaktierst, werden die von dir mitgeteilten
            personenbezogenen Daten verarbeitet.
          </p>
          <p className="mt-2 text-sm text-white">
            Dies können insbesondere deine E-Mail-Adresse, dein Name sowie die von dir im Rahmen
            der Nachricht mitgeteilten Informationen sein.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Verarbeitung erfolgt zur Bearbeitung und Beantwortung deiner Anfrage.
          </p>
          <p className="mt-2 text-sm text-white">
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Soweit deine Anfrage auf den Abschluss
            oder die Durchführung eines Vertrages abzielt, ist Art. 6 Abs. 1 lit. b DSGVO die
            entsprechende Rechtsgrundlage.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet wurde und keine
            gesetzlichen Aufbewahrungspflichten oder sonstigen berechtigten Gründe für eine
            weitere Speicherung bestehen.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">17. Zahlungsabwicklung</h2>
          <p className="mt-2 text-sm text-white">
            Derzeit bietet {SITE_NAME} keine kostenpflichtigen Leistungen an.
          </p>
          <p className="mt-2 text-sm text-white">
            Sollten künftig kostenpflichtige Leistungen angeboten werden, werden die hierfür
            eingesetzten Zahlungsdienstleister und die damit verbundenen Datenverarbeitungen vor
            Einführung der entsprechenden Funktion in dieser Datenschutzerklärung ergänzt.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">18. Rechtsgrundlagen der Verarbeitung</h2>
          <p className="mt-2 text-sm text-white">
            Soweit in dieser Datenschutzerklärung keine speziellere Rechtsgrundlage genannt wird,
            erfolgt die Verarbeitung personenbezogener Daten auf Grundlage von:
          </p>
          <ul className={list}>
            <li>
              <strong>Art. 6 Abs. 1 lit. a DSGVO</strong>, wenn eine Einwilligung erteilt wurde;
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. b DSGVO</strong>, wenn die Verarbeitung zur Durchführung
              eines Vertrages oder vorvertraglicher Maßnahmen erforderlich ist;
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. c DSGVO</strong>, wenn eine gesetzliche Verpflichtung
              besteht;
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. f DSGVO</strong>, wenn die Verarbeitung zur Wahrung
              unserer berechtigten Interessen erforderlich ist und keine überwiegenden Interessen
              oder Grundrechte der betroffenen Person entgegenstehen.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">19. Speicherdauer</h2>
          <p className="mt-2 text-sm text-white">
            Wir speichern personenbezogene Daten grundsätzlich nur so lange, wie dies für den
            jeweiligen Zweck erforderlich ist.
          </p>
          <p className="mt-2 text-sm text-white">
            Benutzerkontodaten werden grundsätzlich so lange gespeichert, wie das Benutzerkonto
            besteht, soweit keine gesetzlichen Aufbewahrungspflichten oder andere zulässige
            Gründe eine längere Speicherung erfordern.
          </p>
          <p className="mt-2 text-sm text-white">
            Verifizierungs- und Passwort-Reset-Tokens werden nur für den jeweils vorgesehenen
            Zweck und grundsätzlich nur bis zum Ablauf ihrer Gültigkeit gespeichert.
          </p>
          <p className="mt-2 text-sm text-white">
            Darüber hinaus können gesetzliche Aufbewahrungspflichten bestehen. In diesen Fällen
            werden die betreffenden Daten für die Dauer der gesetzlichen Aufbewahrungsfrist
            gespeichert und anschließend gelöscht, sofern kein anderer zulässiger Grund für eine
            weitere Speicherung besteht.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">20. Empfänger personenbezogener Daten</h2>
          <p className="mt-2 text-sm text-white">
            Personenbezogene Daten können im Rahmen des Betriebs von {SITE_NAME} an folgende
            Kategorien von Empfängern bzw. Dienstleistern übermittelt werden:
          </p>
          <ul className={list}>
            <li>Hosting- und Infrastrukturprovider,</li>
            <li>Domain- und DNS-Dienstleister,</li>
            <li>Datenbankanbieter,</li>
            <li>Anbieter für den Versand transaktionaler E-Mails,</li>
            <li>Anbieter eingebetteter Inhalte, insbesondere Instagram/Meta,</li>
            <li>
              gegebenenfalls weitere technische Dienstleister, soweit deren Einbindung für den
              Betrieb der Plattform erforderlich ist.
            </li>
          </ul>
          <p className="mt-2 text-sm text-white">
            Mit Auftragsverarbeitern werden, soweit erforderlich, Vereinbarungen gemäß Art. 28
            DSGVO geschlossen.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">21. Übermittlung in Drittländer</h2>
          <p className="mt-2 text-sm text-white">
            Soweit personenbezogene Daten an Dienstleister außerhalb des Europäischen
            Wirtschaftsraums übermittelt werden oder dort verarbeitet werden, erfolgt dies unter
            Beachtung der Voraussetzungen der Art. 44 ff. DSGVO.
          </p>
          <p className="mt-2 text-sm text-white">
            Dies betrifft insbesondere Dienste von Vercel, Resend, MongoDB bzw. Meta/Instagram,
            soweit im konkreten Fall eine Verarbeitung außerhalb des Europäischen
            Wirtschaftsraums stattfindet.
          </p>
          <p className="mt-2 text-sm text-white">
            Für entsprechende Übermittlungen werden die jeweils gesetzlich vorgesehenen
            geeigneten Garantien verwendet, soweit erforderlich.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">22. Rechte der betroffenen Personen</h2>
          <p className="mt-2 text-sm text-white">
            Betroffene Personen haben nach Maßgabe der gesetzlichen Voraussetzungen insbesondere
            folgende Rechte:
          </p>
          <ul className={list}>
            <li>Recht auf Auskunft gemäß Art. 15 DSGVO,</li>
            <li>Recht auf Berichtigung gemäß Art. 16 DSGVO,</li>
            <li>Recht auf Löschung gemäß Art. 17 DSGVO,</li>
            <li>Recht auf Einschränkung der Verarbeitung gemäß Art. 18 DSGVO,</li>
            <li>Recht auf Datenübertragbarkeit gemäß Art. 20 DSGVO,</li>
            <li>Recht auf Widerspruch gemäß Art. 21 DSGVO,</li>
            <li>Recht auf Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft.</li>
          </ul>
          <p className="mt-2 text-sm text-white">
            Zur Ausübung deiner Rechte kannst du dich an die oben genannte Kontaktadresse wenden.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">23. Widerspruch gegen die Verarbeitung</h2>
          <p className="mt-2 text-sm text-white">
            Soweit wir personenbezogene Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
            verarbeiten, kann die betroffene Person aus Gründen, die sich aus ihrer besonderen
            Situation ergeben, Widerspruch gegen diese Verarbeitung einlegen.
          </p>
          <p className="mt-2 text-sm text-white">
            Werden personenbezogene Daten zum Zwecke der Direktwerbung verarbeitet, besteht ein
            Recht auf Widerspruch gegen diese Verarbeitung jederzeit.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">
            24. Beschwerderecht bei einer Aufsichtsbehörde
          </h2>
          <p className="mt-2 text-sm text-white">
            Betroffene Personen haben das Recht, sich bei einer Datenschutzaufsichtsbehörde über
            die Verarbeitung ihrer personenbezogenen Daten zu beschweren.
          </p>
          <p className="mt-2 text-sm text-white">
            Zuständig für den Betreiber mit Sitz in Bayern ist insbesondere:
          </p>
          <p className="mt-2 text-sm text-white">
            <strong>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</strong>
            <br />
            Promenade 27
            <br />
            91522 Ansbach
            <br />
            Deutschland
          </p>
          <p className="mt-2 text-sm text-white">
            Weitere Informationen sind auf der Website der Behörde verfügbar.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">25. Datensicherheit</h2>
          <p className="mt-2 text-sm text-white">
            Wir treffen angemessene technische und organisatorische Maßnahmen, um
            personenbezogene Daten vor Verlust, Zerstörung, Manipulation, unberechtigtem Zugriff
            und sonstiger unrechtmäßiger Verarbeitung zu schützen.
          </p>
          <p className="mt-2 text-sm text-white">
            Die Sicherheitsmaßnahmen werden entsprechend der technischen Entwicklung und den
            bestehenden Risiken regelmäßig überprüft und angepasst.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">26. Keine automatisierte Entscheidungsfindung</h2>
          <p className="mt-2 text-sm text-white">
            Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne des Art.
            22 DSGVO findet im Rahmen der Nutzung von {SITE_NAME} nicht statt.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">27. Änderungen dieser Datenschutzerklärung</h2>
          <p className="mt-2 text-sm text-white">
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn dies aufgrund
            technischer Änderungen, neuer Funktionen der Plattform, Änderungen der eingesetzten
            Dienstleister oder aufgrund gesetzlicher oder rechtlicher Änderungen erforderlich ist.
          </p>
          <p className="mt-2 text-sm text-white">
            Es gilt die jeweils auf dieser Website veröffentlichte Fassung.
          </p>
        </div>
      </div>
    </section>
  );
}
