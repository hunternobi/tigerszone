import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cookies",
  description: `Übersicht über die Cookies, die ${SITE_NAME} verwendet.`,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Cookies</h1>
      <p className="mt-3 text-white">
        Diese Seite erklärt, welche Cookies {SITE_NAME} einsetzt und wofür.
      </p>

      <div className="glass-panel mt-8 space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-white">Was sind Cookies?</h2>
          <p className="mt-2 text-sm text-white">
            Cookies sind kleine Textdateien, die beim Besuch einer Website auf deinem Gerät
            gespeichert werden. {SITE_NAME} setzt ausschließlich technisch notwendige Cookies
            ein, die für den Betrieb der Seite erforderlich sind. Es werden keine Tracking- oder
            Marketing-Cookies verwendet, und es findet keine Weitergabe von Cookie-Daten an Dritte
            zu Werbezwecken statt.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">Notwendige Cookies</h2>
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
                  <td className="py-3 pr-4">
                    Hält deinen Login-Status aufrecht, damit du nicht bei jedem Seitenaufruf
                    erneut angemeldet werden musst.
                  </td>
                  <td className="py-3">Sitzung / bis Logout</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs">authjs.csrf-token</td>
                  <td className="py-3 pr-4">
                    Schützt Formulare (z. B. Login) vor Cross-Site-Request-Forgery-Angriffen.
                  </td>
                  <td className="py-3">Sitzung</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-xs">activeGroupId</td>
                  <td className="py-3 pr-4">
                    Merkt sich, welche deiner Tippgruppen aktuell im Tippspiel ausgewählt ist.
                  </td>
                  <td className="py-3">30 Tage</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-white">
            Diese Cookies sind für die Grundfunktionen der Seite (Login, Tippspiel) erforderlich
            und können nicht deaktiviert werden, ohne dass die Nutzung eingeschränkt wird. Da sie
            technisch notwendig sind, ist gemäß § 25 Abs. 2 TTDSG keine gesonderte Einwilligung
            erforderlich.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">Statistik</h2>
          <p className="mt-2 text-sm text-white">
            Wir nutzen Vercel Analytics zur anonymen Auswertung von Seitenaufrufen. Dabei werden
            keine Cookies gesetzt und keine personenbezogenen Kennungen gespeichert.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">Cookies verwalten</h2>
          <p className="mt-2 text-sm text-white">
            Du kannst Cookies jederzeit über die Einstellungen deines Browsers löschen oder
            blockieren. Da {SITE_NAME} nur notwendige Cookies verwendet, kann das Blockieren
            dazu führen, dass du dich nicht mehr einloggen oder tippen kannst.
          </p>
        </div>
      </div>
    </section>
  );
}
