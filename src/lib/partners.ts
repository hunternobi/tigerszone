export interface PartnerImage {
  src: string;
  alt: string;
}

export interface Partner {
  id: string;
  name: string;
  /** Short label for the switch in the partner card. */
  shortName: string;
  /** Website; the landing page tile and the partner card link here. */
  href: string;
  instagramUrl?: string;
  logoSrc: string;
  logoWidth: number;
  logoHeight: number;
  /** Short introduction shown in the community area. */
  intro: string;
  address: string;
  /** Photos under public/images/<partner>/; the gallery only shows when there are any. */
  images: PartnerImage[];
}

export const PARTNERS: Partner[] = [
  {
    id: "marien-apotheke",
    name: "Marien Apotheke Bodenmais",
    shortName: "Marien",
    href: "https://www.apotheke-bodenmais.de/",
    instagramUrl: "https://www.instagram.com/marienapothekebodenmais/",
    logoSrc: "/images/partners/marien-apotheke.png",
    logoWidth: 460,
    logoHeight: 498,
    intro:
      "Die Marien Apotheke Bodenmais ist eure Apotheke vor Ort im Bayerischen Wald – mit persönlicher " +
      "Beratung, eigenen Produkten und Online-Shop. E-Rezepte könnt ihr direkt einlösen, und im " +
      "Notdienstfall ist die Apotheke ebenfalls für euch da.",
    address: "Bahnhofstraße 63, 94249 Bodenmais",
    images: [],
  },
  {
    id: "erl-braeu",
    name: "Erl Bräu",
    shortName: "Erl Bräu",
    href: "https://www.erl-braeu.de/",
    logoSrc: "/images/partners/erl-braeu.png",
    logoWidth: 460,
    logoHeight: 519,
    intro:
      "Die ERLiche Familienbrauerei aus Geiselhöring in Niederbayern – unabhängig, seit 1871 und in " +
      "sechster Generation in Familienhand. Gebraut wird nach dem Reinheitsgebot mit Hallertauer Hopfen, " +
      "regionalem Malz und Wasser aus dem eigenen Tiefbrunnen.",
    address: "Straubinger Straße 10, Geiselhöring",
    images: [],
  },
  {
    id: "sigl-immobilien",
    name: "Sigl Immobilien",
    shortName: "Sigl",
    href: "https://www.sigl-immobiliengruppe.de/",
    logoSrc: "/images/partners/sigl-immobilien.png",
    logoWidth: 640,
    logoHeight: 341,
    intro:
      "Junges, innovatives Immobilienunternehmen aus dem Raum Straubing-Bogen: Generalunternehmen, " +
      "Projektentwicklung, Immobilienverwaltung, Sanierung und Neubau, Vermietung und Verkauf sowie " +
      "Garten- und Landschaftsbau.",
    address: "Boschstraße 8, 94365 Parkstetten",
    images: [],
  },
];
