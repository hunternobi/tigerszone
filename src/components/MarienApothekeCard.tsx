import Image from "next/image";
import { MapPin } from "lucide-react";
import PartnerGallery, { type GalleryImage } from "@/components/PartnerGallery";
import PillButton from "@/components/PillButton";

// Text, Adresse und Bilder der Partner-Karte pflegen. Bilder liegen unter public/images/marien-apotheke/,
// z. B. { src: "/images/marien-apotheke/laden.jpg", alt: "Blick in die Apotheke" }. Solange `images` leer
// ist, wird keine Galerie angezeigt.
const MARIEN_APOTHEKE: {
  name: string;
  instagramUrl: string;
  intro: string;
  address: string;
  images: GalleryImage[];
} = {
  name: "Marien Apotheke Bodenmais",
  instagramUrl: "https://www.instagram.com/marienapothekebodenmais/",
  intro:
    "Die Marien Apotheke Bodenmais ist eure Apotheke vor Ort im Bayerischen Wald – mit persönlicher " +
    "Beratung, eigenen Produkten und Online-Shop. E-Rezepte könnt ihr direkt einlösen, und im " +
    "Notdienstfall ist die Apotheke ebenfalls für euch da.",
  address: "Bahnhofstraße 63, 94249 Bodenmais",
  images: [],
};

export default function MarienApothekeCard() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MARIEN_APOTHEKE.address)}`;

  return (
    <section
      id="marien-apotheke"
      data-liquid-glass="card"
      className="glass-panel mt-8 scroll-mt-24 p-5 sm:p-6"
    >
      <div className="flex items-center gap-4">
        <Image
          src="/images/partners/marien-apotheke.png"
          alt=""
          width={460}
          height={498}
          className="h-16 w-auto shrink-0 sm:h-20"
        />
        <div className="min-w-0">
          <span className="font-ui inline-block rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.12em] text-white uppercase">
            Partner
          </span>
          <h2 className="font-ui mt-1 text-[1.25rem] leading-tight font-semibold tracking-tight text-white sm:text-2xl">
            {MARIEN_APOTHEKE.name}
          </h2>
        </div>
      </div>

      <p className="mt-4 text-[0.9375rem] leading-snug text-white/90 sm:text-base">
        {MARIEN_APOTHEKE.intro}
      </p>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 text-[0.9375rem] text-white underline-offset-2 hover:underline"
      >
        <MapPin size={15} className="shrink-0" />
        {MARIEN_APOTHEKE.address}
      </a>

      {MARIEN_APOTHEKE.images.length > 0 && (
        <div className="mt-4">
          <PartnerGallery images={MARIEN_APOTHEKE.images} />
        </div>
      )}

      <div className="mt-4">
        <PillButton href={MARIEN_APOTHEKE.instagramUrl} external>
          Marien Apotheke auf Instagram
        </PillButton>
      </div>
    </section>
  );
}
