import Image from "next/image";
import { ImageIcon, MapPin } from "lucide-react";
import GlassButtonExact from "@/components/GlassButtonExact";

// Inhalte der Partner-Kachel: hier Text, Adresse und Bilder pflegen.
// Bilder liegen unter public/images/shootout/, z. B. { src: "/images/shootout/bar.jpg", alt: "Blick in die Bar" }.
// Solange `images` leer ist, werden vier Musterbilder als Platzhalter angezeigt.
const SHOOTOUT = {
  name: "Shootout Eventlocation",
  instagramUrl: "https://www.instagram.com/shootout_straubing/",
  intro:
    "Mustertext – wird vom Shootout selbst ersetzt: Willkommen im Shootout! Hier stellt ihr euch " +
    "kurz vor: Was ist das Shootout, was erwartet die Gäste (z. B. Bar, Events, Feiern, Watch " +
    "Partys bei Tigers-Spielen) und wann habt ihr geöffnet? Zwei bis vier Sätze reichen völlig – " +
    "wir freuen uns auf euch!",
  address: "Bernauergasse 18, 94315 Straubing",
  images: [] as { src: string; alt: string }[],
};

const PLACEHOLDER_COUNT = 4;

export default function ShootoutCard() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOOTOUT.address)}`;

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

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm text-white underline-offset-2 hover:underline"
      >
        <MapPin size={14} className="shrink-0" />
        {SHOOTOUT.address}
      </a>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SHOOTOUT.images.length > 0
          ? SHOOTOUT.images.map((image) => (
              <div key={image.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))
          : Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
              <div
                key={index}
                className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/30 bg-white/5 text-white/70"
              >
                <ImageIcon size={22} />
                <span className="text-xs font-semibold">Musterbild {index + 1}</span>
              </div>
            ))}
      </div>

      <div className="mt-5">
        <GlassButtonExact href={SHOOTOUT.instagramUrl} size="0.85rem">
          Shootout auf Instagram
        </GlassButtonExact>
      </div>
    </section>
  );
}
