import Image from "next/image";
import Reveal from "@/components/Reveal";

interface Partner {
  name: string;
  href: string;
  logoSrc: string;
  logoWidth: number;
  logoHeight: number;
}

const PARTNERS: Partner[] = [
  {
    name: "Marien Apotheke Bodenmais",
    href: "https://www.apotheke-bodenmais.de/",
    logoSrc: "/images/partners/marien-apotheke.png",
    logoWidth: 352,
    logoHeight: 380,
  },
  {
    name: "Shootout Eventlocation",
    href: "https://www.instagram.com/shootout_straubing/",
    logoSrc: "/images/partners/shootout-eventlocation.png",
    logoWidth: 640,
    logoHeight: 430,
  },
];

export default function PartnerBar() {
  return (
    <Reveal>
      <div className="mx-auto mt-8 max-w-2xl sm:mt-10">
        <h2 className="text-center text-xl font-bold text-white sm:text-2xl">Unsere Partner</h2>
        <p className="mt-1.5 text-center text-xs text-white sm:mt-2 sm:text-sm">
          Gemeinsam mit starken Partnern machen wir TigersZone möglich
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
          {PARTNERS.map((partner) => (
            <a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={partner.name}
              className="flex h-28 items-center justify-center rounded-2xl bg-white p-4 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:h-36 sm:p-5"
            >
              <Image
                src={partner.logoSrc}
                alt={partner.name}
                width={partner.logoWidth}
                height={partner.logoHeight}
                className="h-full w-full object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
