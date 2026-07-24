import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Meme der Woche und Watch Party Finder für Straubing Tigers Fans.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Community</h1>
      <p className="mt-3 text-white/70">
        Meme der Woche und Watch Party Finder folgen hier (siehe Spezifikation 4.4 &amp; 4.5).
      </p>
    </section>
  );
}
