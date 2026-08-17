import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { auth } from "@/auth";
import { getMyGroupInvites } from "@/app/gruppen/actions";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  weight: "700",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – Das Tippspiel für Eishockeyfans`,
    template: `%s – ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Straubing Tigers",
    "Tippspiel",
    "DEL",
    "Eishockey",
    "Straubing",
    "Fanplattform",
    "Eisstadion am Pulverturm",
  ],
  authors: [{ name: SITE_NAME }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Das Tippspiel für Eishockeyfans`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/images/hero-stadium-og.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Das Tippspiel für Eishockeyfans`,
    description: SITE_DESCRIPTION,
    images: ["/images/hero-stadium-og.jpg"],
  },
  icons: {
    icon: "/images/TigersZone_Logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f3d",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const invites = session?.user ? await getMyGroupInvites(session.user.id) : [];

  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-tigers-primary">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsOrganization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/images/TigersZone_Logo.png`,
              description: SITE_DESCRIPTION,
              sport: "Ice Hockey",
            }),
          }}
        />
        <SessionProvider>
          <Header invites={invites} />
          <main className="flex-1 pt-[72px]">{children}</main>
          <Footer />
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
