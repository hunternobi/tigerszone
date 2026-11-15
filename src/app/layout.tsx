import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsStories from "@/components/NewsStories";
import ScrollAnimationPause from "@/components/ScrollAnimationPause";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { auth } from "@/auth";
import { getMyGroupInvites } from "@/app/gruppen/actions";
import { getMyNotifications } from "@/app/notifications/actions";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    images: [
      {
        url: "/images/hero-stadium-og.jpg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Das Tippspiel für Eishockeyfans`,
    description: SITE_DESCRIPTION,
    images: ["/images/hero-stadium-og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f3d",
  viewportFit: "cover",
};

/** The header with the signed-in user's invitations and notifications (two database round trips). */
async function HeaderWithInbox({ userId }: { userId: string }) {
  const [invites, notifications] = await Promise.all([
    getMyGroupInvites(userId),
    getMyNotifications(userId),
  ]);
  return <Header invites={invites} notifications={notifications} />;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading the session only decodes the cookie; nothing here waits for the database.
  const session = await auth();

  return (
    <html
      lang="de"
      className={`${geistSans.variable} scroll-smooth antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-tigers-primary">
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
        <SessionProvider session={session}>
          {/* The page no longer waits for the inbox: the header shows at once with an empty bell and the
              invitations and notifications stream in when their queries are done. */}
          {session?.user ? (
            <Suspense fallback={<Header invites={[]} notifications={[]} />}>
              <HeaderWithInbox userId={session.user.id} />
            </Suspense>
          ) : (
            <Header invites={[]} notifications={[]} />
          )}
          <main className="flex-1 pt-[4.5rem]">{children}</main>
          <Footer />
          <NewsStories />
          <ScrollAnimationPause />
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
