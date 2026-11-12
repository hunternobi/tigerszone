import Image from "next/image";
import Reveal from "@/components/Reveal";
import { PARTNERS } from "@/lib/partners";

const TILE_CLASS =
  "glass-panel glass-interactive flex h-28 min-w-0 items-center justify-center p-2.5 sm:h-40 sm:w-48 sm:p-4";

export default function PartnerBar() {
  return (
    <Reveal>
      <div className="mx-auto mt-6 max-w-2xl sm:mt-12">
        <h2 className="font-ui text-center text-[1.6rem] font-semibold tracking-tight text-white sm:text-3xl">
          Unsere Partner
        </h2>

        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
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

            return (
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
