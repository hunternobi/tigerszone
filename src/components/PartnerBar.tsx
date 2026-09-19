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
    name: "Shootout Eventlocation",
    href: "/community#shootout",
    internal: true,
    logoSrc: "/images/partners/shootout-eventlocation.png",
    logoWidth: 640,
    logoHeight: 430,
  },
];

const TILE_CLASS =
  "glass-panel glass-interactive flex h-32 items-center justify-center p-3 sm:h-40 sm:p-4";

export default function PartnerBar() {
  return (
    <Reveal>
      <div className="mx-auto mt-28 max-w-2xl sm:mt-40">
        <h2 className="text-center text-3xl font-bold text-white">Unsere Partner</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-white">
          Gemeinsam mit starken Partnern machen wir TigersZone möglich
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
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
