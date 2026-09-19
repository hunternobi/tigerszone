import Image from "next/image";
import { MapPin } from "lucide-react";
import GlassButtonExact from "@/components/GlassButtonExact";

// Inhalte der Partner-Kachel: hier Text, Adresse und Bilder pflegen.
// Bilder liegen unter public/images/shootout/, z. B. { src: "/images/shootout/bar.jpg", alt: "Blick in die Bar" }.
const SHOOTOUT = {
  name: "Shootout Eventlocation",
  instagramUrl: "https://www.instagram.com/shootout_straubing/",
  intro: "Hier stellt sich unser Partner Shootout Eventlocation bald selbst vor.",
  address: null as string | null,
  images: [] as { src: string; alt: string }[],
};

export default function ShootoutCard() {
  return (
    <section id="shootout" className="glass-panel mt-8 scroll-mt-24 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <Image
          src="/images/partners/shootout-eventlocation.png"
          alt=""
          width={640}
          height={430}
          className="h-16 w-auto shrink-0 sm:h-20"
        />
        <div>
          <span className="inline-block rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
            Partner
          </span>
          <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">{SHOOTOUT.name}</h2>
        </div>
      </div>

      <p className="mt-4 text-sm text-white sm:text-base">{SHOOTOUT.intro}</p>

      {SHOOTOUT.address && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-white">
          <MapPin size={14} className="shrink-0" />
          {SHOOTOUT.address}
        </p>
      )}

      {SHOOTOUT.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SHOOTOUT.images.map((image) => (
            <div key={image.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <GlassButtonExact href={SHOOTOUT.instagramUrl} size="0.85rem">
          Shootout auf Instagram
        </GlassButtonExact>
      </div>
    </section>
  );
}
