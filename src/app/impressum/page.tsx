import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum von ${SITE_NAME}.`,
  alternates: { canonical: "/impressum" },
};

const link = "text-tigers-secondary hover:underline";

export default function ImpressumPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Impressum</h1>

      <div className="glass-panel mt-8 space-y-8 p-6 sm:p-8">
        <div>
          <p className="text-sm font-semibold text-white">TigersZone GbR</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">Geschäftsanschrift</h2>
          <p className="mt-2 text-sm text-white">
            Puchhausener Straße 6
            <br />
            94339 Leiblfing
            <br />
            Deutschland
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">Vertreten durch die Gesellschafter</h2>
          <p className="mt-2 text-sm text-white">
            Tobias Dominik Ernst
            <br />
            Florian Christoph Rehmet
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">E-Mail</h2>
          <p className="mt-2 text-sm text-white">
            <a href="mailto:Tigerszoneofficial@gmail.com" className={link}>
              Tigerszoneofficial@gmail.com
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">
            Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV
          </h2>
          <p className="mt-2 text-sm text-white">
            Tobias Dominik Ernst und Florian Christoph Rehmet
            <br />
            Puchhausener Straße 6
            <br />
            94339 Leiblfing
            <br />
            Deutschland
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">Bildrechte</h2>
          <p className="mt-2 text-sm text-white">
            Die auf dieser Website verwendeten Fotografien stammen von RS-Sportfoto.de und werden
            mit entsprechender Nutzungserlaubnis verwendet. Die Urheberrechte an den Fotografien
            verbleiben beim jeweiligen Rechteinhaber.
          </p>
        </div>
      </div>
    </section>
  );
}
