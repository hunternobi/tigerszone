"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import PartnerGallery from "@/components/PartnerGallery";
import PillButton from "@/components/PillButton";
import { PARTNERS } from "@/lib/partners";

/** The partners in one card: pick one with the switch, read a short introduction (same layout as the goalie card). */
export default function PartnerShowcase() {
  const [selected, setSelected] = useState(PARTNERS[0].id);
  const partner = PARTNERS.find((p) => p.id === selected) ?? PARTNERS[0];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partner.address)}`;

  return (
    <section
      id="partner"
      data-liquid-glass="card"
      className="glass-panel mt-8 scroll-mt-24 p-4 sm:p-6"
    >
      <p className="font-ui text-[0.625rem] font-semibold tracking-[0.14em] text-white/60 uppercase">
        Unsere Partner
      </p>

      <div
        className="mt-3 flex rounded-full border border-white/15 bg-white/10 p-1"
        role="tablist"
      >
        {PARTNERS.map((p) => {
          const active = p.id === partner.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(p.id)}
              className={`font-ui min-w-0 flex-1 truncate rounded-full px-2 py-1.5 text-[0.8125rem] font-semibold transition ${
                active
                  ? "bg-white text-tigers-primary shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-white/80"
              }`}
            >
              {p.shortName}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <span className="flex size-[72px] shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-2.5 sm:size-20">
          <Image
            src={partner.logoSrc}
            alt=""
            width={partner.logoWidth}
            height={partner.logoHeight}
            className="h-full w-full object-contain"
          />
        </span>
        <h3 className="font-ui min-w-0 text-[1.25rem] leading-tight font-semibold tracking-tight text-white sm:text-2xl">
          {partner.name}
        </h3>
      </div>

      <p className="mt-4 text-[0.9375rem] leading-snug text-white/90 sm:text-base">
        {partner.intro}
      </p>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 text-[0.9375rem] text-white underline-offset-2 hover:underline"
      >
        <MapPin size={15} className="shrink-0" />
        {partner.address}
      </a>

      {partner.images.length > 0 && (
        <div className="mt-4">
          <PartnerGallery key={partner.id} images={partner.images} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2.5">
        <PillButton href={partner.href} external>
          Website besuchen
        </PillButton>
        {partner.instagramUrl && (
          <PillButton href={partner.instagramUrl} external>
            Instagram
          </PillButton>
        )}
      </div>
    </section>
  );
}
