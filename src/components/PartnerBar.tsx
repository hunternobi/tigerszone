import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

interface Partner {
  name: string;
  href: string;
  /** Internal links stay in the same tab; external ones open a new tab. */
  internal?: boolean;
  logoSrc: string;
  logoWidth: number;
  logoHeight: number;
}

const PARTNERS: Partner[] = [
  {
    name: "Marien Apotheke Bodenmais",
    href: "https://www.apotheke-bodenmais.de/",
    logoSrc: "/images/partners/marien-apotheke.png",
    logoWidth: 460,
    logoHeight: 498,
  },
  {
    name: "Erl Bräu",
    href: "https://www.erl-braeu.de/",
    logoSrc: "/images/partners/erl-braeu.png",
    logoWidth: 460,
    logoHeight: 519,
  },
  {
    name: "Sigl Immobilien",
    href: "https://www.sigl-immobiliengruppe.de/",
    logoSrc: "/images/partners/sigl-immobilien.png",
    logoWidth: 640,
    logoHeight: 341,
  },
];

const TILE_CLASS =
  "glass-panel glass-interactive flex h-24 min-w-0 items-center justify-center p-2.5 sm:h-40 sm:w-48 sm:p-4";

export default function PartnerBar() {
  return (
    <Reveal>
      <div className="mx-auto mt-6 max-w-2xl sm:mt-12">
        <h2 className="font-ui text-center text-[1.4rem] font-semibold tracking-tight text-white sm:text-3xl">
          Unsere Partner
        </h2>
        <p className="mx-auto mt-1.5 max-w-xl text-center text-sm text-white/65 sm:mt-3 sm:text-base">
          Gemeinsam mit starken Partnern machen wir TigersZone möglich
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
          {PARTNERS.map((partner) => {
            const logo = (
              <Image
                src={partner.logoSrc}
                alt={partner.name}
                width={partner.logoWidth}
                height={partner.logoHeight}
                className="h-full w-full object-contain"
              />
            );

            return partner.internal ? (
              <Link
                key={partner.name}
                href={partner.href}
                aria-label={partner.name}
                data-liquid-glass="tile"
                className={TILE_CLASS}
              >
                {logo}
              </Link>
            ) : (
              <a
                key={partner.name}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={partner.name}
                data-liquid-glass="tile"
                className={TILE_CLASS}
              >
                {logo}
              </a>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
