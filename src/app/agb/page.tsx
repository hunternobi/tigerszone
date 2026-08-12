import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "AGB",
  description: `Allgemeine Geschäftsbedingungen von ${SITE_NAME}.`,
  alternates: { canonical: "/agb" },
};

const list = "list-decimal space-y-2 pl-5 text-sm text-white";
const sublist = "mt-2 list-disc space-y-1 pl-5";

export default function AgbPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Allgemeine Geschäftsbedingungen (AGB)</h1>

      <div className="glass-panel mt-8 space-y-8 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-white">§ 1 Geltungsbereich</h2>
          <ol className={list}>
            <li>
              Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB&quot;) regeln die Nutzung
              der unter „{SITE_NAME}&quot; betriebenen Online-Plattform (nachfolgend
              „Plattform&quot;) sowie die Inanspruchnahme der darüber angebotenen Leistungen
              zwischen den Betreibern der Plattform und den registrierten Nutzern.
            </li>
            <li>
              Betreiber der Plattform sind:
              <div className="mt-2 space-y-3">
                <p>
                  Tobias Ernst
                  <br />
                  94339 Leiblfing
                  <br />
                  E-Mail:{" "}
                  <a
                    href="mailto:Tigerszoneofficial@gmail.com"
                    className="text-tigers-secondary hover:underline"
                  >
                    Tigerszoneofficial@gmail.com
                  </a>
                </p>
                <p>
                  Florian Rehmet
                  <br />
                  84034 Landshut
                  <br />
                  E-Mail:{" "}
                  <a
                    href="mailto:Tigerszoneofficial@gmail.com"
                    className="text-tigers-secondary hover:underline"
                  >
                    Tigerszoneofficial@gmail.com
                  </a>
                </p>
              </div>
              <p className="mt-2">
                Die gesetzlich erforderlichen Anbieterinformationen sind dem Impressum der
                Plattform zu entnehmen.
              </p>
            </li>
            <li>
              Abweichende Allgemeine Geschäftsbedingungen des Nutzers finden keine Anwendung, es
              sei denn, ihrer Geltung wurde ausdrücklich zugestimmt.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 2 Leistungsumfang</h2>
          <ol className={list}>
            <li>
              Die Plattform ermöglicht registrierten Nutzern die Teilnahme an digitalen
              Tippspielen rund um Sportveranstaltungen.
            </li>
            <li>
              Nutzer können an öffentlichen Tippspielen teilnehmen sowie privaten Tippgruppen
              beitreten oder diese verwalten.
            </li>
            <li>Die Teilnahme an öffentlichen Tippspielen ist kostenlos.</li>
            <li>
              Für die Erstellung privater Tippgruppen kann eine einmalige Gebühr erhoben werden.
              Die Höhe der jeweiligen Gebühr wird dem Nutzer vor Abgabe der Bestellung deutlich
              angezeigt.
            </li>
            <li>
              Für die Erstellung einer privaten Tippgruppe bestehen keine Abonnements und keine
              automatisch wiederkehrenden Zahlungsverpflichtungen.
            </li>
            <li>
              Der Betreiber ist berechtigt, die Plattform und ihre Funktionen
              weiterzuentwickeln, zu ändern, zu ergänzen oder einzustellen, soweit dies unter
              Berücksichtigung der berechtigten Interessen der Nutzer zulässig ist und
              gesetzliche Ansprüche der Nutzer nicht beeinträchtigt werden.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 3 Kein Glücksspiel</h2>
          <ol className={list}>
            <li>
              Die Plattform dient ausschließlich der Unterhaltung sowie dem sportlichen
              Vergleich von Tipps.
            </li>
            <li>
              Die Plattform veranstaltet keine Sportwetten und kein Glücksspiel und vermittelt
              keine Wetten.
            </li>
            <li>Es werden keine Wetteinsätze entgegengenommen.</li>
            <li>Die Teilnahme an den Tippspielen erfolgt nicht gegen einen Wetteinsatz.</li>
            <li>
              Eventuelle Preise oder Auszeichnungen werden ausschließlich nach den jeweils
              geltenden Teilnahmebedingungen vergeben.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 4 Registrierung und Minderjährige</h2>
          <ol className={list}>
            <li>
              Für die Nutzung der Plattform ist grundsätzlich die Erstellung eines
              Benutzerkontos erforderlich.
            </li>
            <li>
              Die Registrierung und Nutzung der kostenlosen Funktionen ist Personen ab
              Vollendung des 12. Lebensjahres gestattet.
            </li>
            <li>
              Minderjährige dürfen die kostenlosen Funktionen der Plattform nutzen, soweit dem
              keine gesetzlichen Vorschriften entgegenstehen.
            </li>
            <li>
              Die Erstellung einer kostenpflichtigen privaten Tippgruppe ist grundsätzlich
              volljährigen Nutzern vorbehalten.
            </li>
            <li>
              Minderjährige dürfen eine kostenpflichtige private Tippgruppe nur mit vorheriger
              Zustimmung ihrer gesetzlichen Vertreter erstellen. Soweit gesetzlich erforderlich,
              wird die Zustimmung im Rahmen des Bestellprozesses entsprechend eingeholt.
            </li>
            <li>
              Der Beitritt zu einer bestehenden Tippgruppe ist ab Vollendung des 12. Lebensjahres
              zulässig, soweit die jeweilige Tippgruppe keine weitergehenden
              Teilnahmevoraussetzungen vorsieht.
            </li>
            <li>
              Der Nutzer verpflichtet sich, bei der Registrierung und Nutzung der Plattform
              wahrheitsgemäße und vollständige Angaben zu machen.
            </li>
            <li>
              Änderungen der für das Benutzerkonto relevanten Angaben sind vom Nutzer
              unverzüglich zu aktualisieren.
            </li>
            <li>
              Der Betreiber ist berechtigt, Registrierungen abzulehnen oder Benutzerkonten
              vorübergehend oder dauerhaft zu sperren, sofern hierfür ein sachlicher bzw.
              berechtigter Grund besteht, insbesondere bei Verstößen gegen diese AGB oder
              gesetzliche Vorschriften.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 5 Benutzerkonto</h2>
          <ol className={list}>
            <li>
              Das Benutzerkonto ist personenbezogen und darf grundsätzlich nur von dem Nutzer
              verwendet werden, für den es eingerichtet wurde.
            </li>
            <li>
              Zugangsdaten sind vom Nutzer vertraulich zu behandeln und dürfen nicht an Dritte
              weitergegeben werden.
            </li>
            <li>Jeder Nutzer darf grundsätzlich nur ein Benutzerkonto führen.</li>
            <li>
              Der Nutzer hat den Betreiber unverzüglich zu informieren, wenn ihm eine unbefugte
              Nutzung seines Benutzerkontos bekannt wird oder konkrete Anhaltspunkte hierfür
              bestehen.
            </li>
            <li>
              Der Nutzer ist für Aktivitäten über sein Benutzerkonto verantwortlich, soweit er
              diese zu vertreten hat.
            </li>
            <li>
              Der Betreiber ist berechtigt, Mehrfachkonten zu sperren oder zu löschen,
              insbesondere wenn diese zur Umgehung von Teilnahmebeschränkungen oder zur Erlangung
              unberechtigter Vorteile genutzt werden.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 6 Vertragsschluss</h2>
          <ol className={list}>
            <li>Die Registrierung eines Benutzerkontos ist unentgeltlich.</li>
            <li>
              Ein kostenpflichtiger Vertrag kommt ausschließlich durch die Bestellung einer
              kostenpflichtigen Leistung, insbesondere der Erstellung einer privaten
              Tippgruppe, zustande.
            </li>
            <li>
              Die Darstellung kostenpflichtiger Leistungen auf der Plattform stellt noch kein
              verbindliches Angebot des Betreibers dar.
            </li>
            <li>
              Der Nutzer gibt durch Abschluss des vorgesehenen Bestellvorgangs ein verbindliches
              Angebot zum Abschluss eines Vertrages über die ausgewählte kostenpflichtige
              Leistung ab.
            </li>
            <li>
              Der Vertrag kommt zustande, sobald der Betreiber die Bestellung ausdrücklich
              bestätigt oder die bestellte Leistung freischaltet, sofern im Bestellprozess
              nichts Abweichendes angegeben wird.
            </li>
            <li>
              Vor Abgabe der Bestellung werden dem Nutzer die wesentlichen
              Vertragsinformationen, insbesondere die konkrete Leistung, der Preis und die
              Zahlungsbedingungen, angezeigt.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 7 Preise und Zahlungsbedingungen</h2>
          <ol className={list}>
            <li>Es gelten die zum Zeitpunkt der Bestellung auf der Plattform angegebenen Preise.</li>
            <li>
              Die jeweils verfügbaren Zahlungsarten werden dem Nutzer im Bestellprozess
              angezeigt.
            </li>
            <li>
              Sämtliche Preise werden einschließlich der gesetzlichen Umsatzsteuer angegeben,
              soweit Umsatzsteuer anfällt.
            </li>
            <li>Der Zahlungsanspruch entsteht mit Abschluss des kostenpflichtigen Vertrages.</li>
            <li>
              Die Zahlung ist entsprechend der im Bestellprozess angegebenen Zahlungsart und den
              dort genannten Bedingungen zu leisten.
            </li>
            <li>
              Es bestehen keine wiederkehrenden Zahlungsverpflichtungen, sofern im Einzelfall
              nicht ausdrücklich etwas anderes vereinbart und dem Nutzer vor Vertragsschluss
              angezeigt wird.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 8 Kostenpflichtige digitale Leistungen</h2>
          <ol className={list}>
            <li>
              Kostenpflichtige digitale Leistungen werden nach erfolgreichem Abschluss des
              Bestellvorgangs und, soweit erforderlich, nach erfolgreicher Zahlungsbestätigung
              freigeschaltet.
            </li>
            <li>
              Der Betreiber stellt die vereinbarte digitale Leistung entsprechend der zum
              Zeitpunkt des Vertragsschlusses geltenden Leistungsbeschreibung bereit.
            </li>
            <li>
              Gesetzliche Rechte des Nutzers, insbesondere gesetzliche Gewährleistungsrechte bei
              digitalen Produkten und digitalen Dienstleistungen, bleiben unberührt.
            </li>
            <li>
              Der Betreiber ist berechtigt, technische Änderungen an der Plattform vorzunehmen,
              soweit diese erforderlich sind, um die Sicherheit, Funktionsfähigkeit oder
              Weiterentwicklung der Plattform zu gewährleisten und hierdurch die vertraglich
              geschuldete Leistung nicht unzulässig beeinträchtigt wird.
            </li>
            <li>
              Gesetzliche Rechte des Nutzers bei Änderungen oder Beeinträchtigungen der
              digitalen Leistung bleiben unberührt.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 9 Verfügbarkeit</h2>
          <ol className={list}>
            <li>
              Der Betreiber bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit der
              Plattform.
            </li>
            <li>
              Ein Anspruch auf eine jederzeitige und vollständig störungsfreie Verfügbarkeit
              besteht nicht, soweit eine solche nicht gesetzlich geschuldet ist.
            </li>
            <li>
              Vorübergehende Einschränkungen können insbesondere durch Wartungsarbeiten,
              Updates, Sicherheitsmaßnahmen, technische Störungen, Ausfälle von Drittanbietern
              oder Ereignisse außerhalb des Einflussbereichs des Betreibers entstehen.
            </li>
            <li>
              Der Betreiber wird sich bemühen, planbare Wartungsarbeiten möglichst
              nutzerfreundlich durchzuführen und erhebliche Einschränkungen nach Möglichkeit
              rechtzeitig anzukündigen.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 10 Durchführung der Tippspiele</h2>
          <ol className={list}>
            <li>
              Für die Durchführung der jeweiligen Tippspiele gelten die auf der Plattform
              veröffentlichten Spiel- und Teilnahmebedingungen.
            </li>
            <li>
              Grundlage der Wertung sind grundsätzlich die offiziell festgestellten Ergebnisse
              der jeweiligen Sportveranstaltung.
            </li>
            <li>
              Werden offizielle Ergebnisse nachträglich geändert, kann der Betreiber die Wertung
              entsprechend anpassen, sofern dies technisch und organisatorisch möglich und nach
              den jeweiligen Spielregeln vorgesehen ist.
            </li>
            <li>
              Bei technischen Fehlern, offensichtlich fehlerhaften Wertungen oder sonstigen
              Störungen ist der Betreiber berechtigt, die Wertung nach den jeweils geltenden
              Spielregeln zu korrigieren.
            </li>
            <li>
              Soweit eine Situation durch die Spielregeln nicht eindeutig geregelt ist,
              entscheidet der Betreiber unter angemessener Berücksichtigung der Interessen der
              betroffenen Nutzer und der Funktionsweise des jeweiligen Tippspiels.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 11 Verhaltenspflichten</h2>
          <ol className={list}>
            <li>
              Der Nutzer verpflichtet sich, die Plattform ausschließlich im Rahmen der geltenden
              Gesetze, dieser AGB und der jeweiligen Spiel- und Teilnahmebedingungen zu nutzen.
            </li>
            <li>
              Insbesondere ist es dem Nutzer untersagt,
              <ul className={sublist}>
                <li>
                  beleidigende, diskriminierende, volksverhetzende oder sonst rechtswidrige
                  Inhalte zu veröffentlichen,
                </li>
                <li>
                  Inhalte zu veröffentlichen, durch die Rechte Dritter, insbesondere Urheber-,
                  Marken-, Persönlichkeits- oder Datenschutzrechte verletzt werden,
                </li>
                <li>Schadsoftware, schädliche Skripte oder sonstige schädliche Inhalte einzusetzen,</li>
                <li>
                  automatisierte Verfahren einzusetzen, die den bestimmungsgemäßen Betrieb der
                  Plattform beeinträchtigen,
                </li>
                <li>Ranglisten, Ergebnisse oder sonstige Spielmechanismen zu manipulieren,</li>
                <li>
                  Mehrfachkonten zur Erlangung unberechtigter Vorteile anzulegen oder zu
                  verwenden,
                </li>
                <li>Sicherheitsmechanismen oder Zugriffsbeschränkungen der Plattform zu umgehen,</li>
                <li>Schwachstellen der Plattform auszunutzen oder deren Ausnutzung zu ermöglichen.</li>
              </ul>
            </li>
            <li>
              Bei Verstößen gegen diese AGB oder gesetzliche Vorschriften kann der Betreiber
              abhängig von Art und Schwere des Verstoßes insbesondere eine Verwarnung
              aussprechen, Inhalte entfernen, das Benutzerkonto vorübergehend sperren oder das
              Benutzerkonto dauerhaft schließen.
            </li>
            <li>Gesetzliche Ansprüche und Rechte des Nutzers bleiben unberührt.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 12 Nutzungsrechte und Inhalte</h2>
          <ol className={list}>
            <li>
              Sämtliche vom Betreiber bereitgestellten Inhalte der Plattform, insbesondere
              Texte, Grafiken, Logos, Designs, Software und sonstige Inhalte, unterliegen dem
              jeweils anwendbaren Urheber-, Marken- oder sonstigen Schutzrecht.
            </li>
            <li>
              Eine Vervielfältigung, Verbreitung, öffentliche Zugänglichmachung oder sonstige
              Nutzung der geschützten Inhalte außerhalb der bestimmungsgemäßen Nutzung der
              Plattform bedarf der vorherigen Zustimmung des jeweiligen Rechteinhabers, soweit
              eine solche Zustimmung gesetzlich erforderlich ist.
            </li>
            <li>
              Der Nutzer erhält für die Dauer der bestimmungsgemäßen Nutzung der Plattform ein
              einfaches, nicht übertragbares und nicht unterlizenzierbares Nutzungsrecht an den
              vom Betreiber bereitgestellten Inhalten, soweit dies für die Nutzung der Plattform
              erforderlich ist.
            </li>
            <li>
              Soweit Nutzer eigene Inhalte auf der Plattform veröffentlichen, räumt der Nutzer
              dem Betreiber die für den Betrieb der Plattform erforderlichen Nutzungsrechte ein.
              Die Einräumung erfolgt nur in dem Umfang, der für die Bereitstellung, Darstellung,
              Speicherung und technische Verarbeitung der jeweiligen Inhalte erforderlich ist.
            </li>
            <li>
              Der Nutzer versichert, dass er über die erforderlichen Rechte an von ihm
              eingestellten Inhalten verfügt und durch deren Veröffentlichung keine Rechte
              Dritter verletzt.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 13 Widerrufsrecht</h2>
          <ol className={list}>
            <li>
              Verbrauchern steht bei Vorliegen der gesetzlichen Voraussetzungen ein
              Widerrufsrecht zu. Einzelheiten ergeben sich aus der gesonderten
              Widerrufsbelehrung.
            </li>
            <li>
              Bei Verträgen über digitale Leistungen können gesetzliche Besonderheiten
              hinsichtlich des Widerrufsrechts gelten.
            </li>
            <li>
              Soweit der Nutzer ausdrücklich verlangt, dass die Ausführung einer digitalen
              Leistung vor Ablauf der Widerrufsfrist beginnt, und die gesetzlichen
              Voraussetzungen für einen vorzeitigen Beginn der Leistungserbringung sowie einen
              möglichen Verlust des Widerrufsrechts erfüllt sind, werden die hierfür
              erforderlichen Erklärungen und Bestätigungen im Bestellprozess gesondert
              eingeholt.
            </li>
            <li>Die gesetzlichen Voraussetzungen für das Erlöschen des Widerrufsrechts bleiben unberührt.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 14 Haftung</h2>
          <ol className={list}>
            <li>
              Der Betreiber haftet unbeschränkt für Schäden, die auf einer vorsätzlichen oder
              grob fahrlässigen Pflichtverletzung des Betreibers, seiner gesetzlichen
              Vertreter oder Erfüllungsgehilfen beruhen.
            </li>
            <li>
              Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht haftet der
              Betreiber nur für den vorhersehbaren und vertragstypischen Schaden.
            </li>
            <li>
              Wesentliche Vertragspflichten sind solche Pflichten, deren Erfüllung die
              ordnungsgemäße Durchführung des Vertrages überhaupt erst ermöglicht und auf deren
              Einhaltung der Nutzer regelmäßig vertrauen darf.
            </li>
            <li>
              Die Haftung für Schäden aus der Verletzung des Lebens, des Körpers oder der
              Gesundheit bleibt unberührt.
            </li>
            <li>
              Die Haftung nach zwingenden gesetzlichen Vorschriften, insbesondere nach dem
              Produkthaftungsgesetz, bleibt unberührt.
            </li>
            <li>
              Für Störungen, die ausschließlich auf Umständen außerhalb des Einflussbereichs
              des Betreibers beruhen, insbesondere auf Ausfällen von Telekommunikationsnetzen
              oder Drittanbietern, haftet der Betreiber nur, soweit gesetzlich eine
              weitergehende Haftung besteht.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 15 Sperrung und Kündigung</h2>
          <ol className={list}>
            <li>
              Der Nutzer kann sein Benutzerkonto jederzeit löschen bzw. die Nutzung der
              kostenlosen Plattformfunktionen beenden, soweit dem keine noch bestehenden
              gesetzlichen oder vertraglichen Pflichten entgegenstehen.
            </li>
            <li>
              Der Betreiber kann das Benutzerkonto aus wichtigem Grund sperren oder den
              Nutzungsvertrag kündigen.
            </li>
            <li>
              Ein wichtiger Grund liegt insbesondere vor bei:
              <ul className={sublist}>
                <li>erheblichen oder wiederholten Verstößen gegen diese AGB,</li>
                <li>Manipulationsversuchen,</li>
                <li>missbräuchlicher Nutzung der Plattform,</li>
                <li>strafbaren Handlungen im Zusammenhang mit der Nutzung der Plattform,</li>
                <li>Umgehung technischer oder organisatorischer Sicherheitsmaßnahmen.</li>
              </ul>
            </li>
            <li>
              Soweit eine vorherige Abmahnung oder Fristsetzung gesetzlich erforderlich oder
              nach den Umständen angemessen ist, wird diese vor einer Sperrung oder Kündigung
              ausgesprochen.
            </li>
            <li>Gesetzliche Rechte des Nutzers bleiben unberührt.</li>
            <li>
              Die Löschung oder Sperrung eines Benutzerkontos lässt bereits entstandene
              gesetzliche Ansprüche grundsätzlich unberührt.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 16 Datenschutz</h2>
          <ol className={list}>
            <li>
              Die Verarbeitung personenbezogener Daten erfolgt nach Maßgabe der jeweils
              geltenden gesetzlichen Datenschutzbestimmungen.
            </li>
            <li>
              Einzelheiten zur Verarbeitung personenbezogener Daten, zu den Zwecken der
              Verarbeitung, zu Rechtsgrundlagen, Speicherdauern und Betroffenenrechten ergeben
              sich aus der gesonderten Datenschutzerklärung.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 17 Änderungen dieser AGB</h2>
          <ol className={list}>
            <li>
              Änderungen dieser AGB für bestehende Vertragsverhältnisse sind nur zulässig,
              soweit hierfür ein sachlicher Grund besteht und die Änderung für den Nutzer unter
              Berücksichtigung seiner Interessen zumutbar ist oder eine gesetzliche Grundlage
              hierfür besteht.
            </li>
            <li>
              Änderungen, die für den Nutzer wesentlich sind, werden dem Nutzer rechtzeitig vor
              ihrem Inkrafttreten in geeigneter Form mitgeteilt.
            </li>
            <li>
              Soweit für eine Änderung die Zustimmung des Nutzers erforderlich ist, wird diese
              nach Maßgabe der gesetzlichen Vorschriften eingeholt.
            </li>
            <li>
              Änderungen der AGB gelten für zukünftige Vertragsverhältnisse ab ihrer
              Veröffentlichung bzw. dem im jeweiligen Bestellprozess angegebenen Zeitpunkt.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">§ 18 Schlussbestimmungen</h2>
          <ol className={list}>
            <li>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
              UN-Kaufrechts, soweit dem keine zwingenden gesetzlichen
              Verbraucherschutzvorschriften entgegenstehen.
            </li>
            <li>
              Gegenüber Verbrauchern gilt die Rechtswahl nach Absatz 1 nur insoweit, als dadurch
              nicht der Schutz entzogen wird, der durch zwingende Bestimmungen des Staates
              gewährt wird, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat.
            </li>
            <li>
              Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder
              werden, bleiben die übrigen Bestimmungen hiervon unberührt. An die Stelle der
              unwirksamen Bestimmung treten die gesetzlichen Vorschriften.
            </li>
            <li>Für Verbraucher gelten die gesetzlichen Gerichtsstandsregelungen.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
