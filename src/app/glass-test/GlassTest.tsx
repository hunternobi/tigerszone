"use client";

import { LiquidGlass } from "simple-liquid-glass";

const CARD_STYLE = { width: "100%" } as const;

/**
 * Internal test page (not linked): real refraction of the fixed page photo with simple-liquid-glass, the
 * library that renders through WebGL on iPhone. Scroll it on a phone and judge the smoothness.
 */
export default function GlassTest() {
  return (
    <div className="relative min-h-[260vh] bg-[#0a0f3d]">
      <div
        id="glass-test-bg"
        aria-hidden
        className="fixed inset-0 overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-stadium-mobile.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative z-10 mx-auto max-w-md space-y-6 px-6 pt-24 pb-40">
        <h1 className="font-ui text-4xl font-semibold text-white">
          Glass-Test
        </h1>
        <p className="text-white/90">
          Fester Foto-Hintergrund. Beim Scrollen die Karten beobachten: ruckelt
          etwas, wirkt die Kante verzögert?
        </p>

        {[
          "Nächstes Spiel",
          "Head2Head",
          "Tabelle",
          "Form",
          "Torhüter",
          "Topscorer",
        ].map((title, index) => (
          <LiquidGlass
            key={title}
            renderer="webgl"
            backdropSelector="#glass-test-bg"
            radius={28}
            lens="rim"
            scale={60}
            frost={0.12}
            glassColor="rgba(255,255,255,0.06)"
            borderColor="rgba(255,255,255,0.55)"
            saturation={130}
            style={{ ...CARD_STYLE, minHeight: index % 2 ? 240 : 150 }}
          >
            <div className="p-5 text-white">
              <p className="font-ui text-xl font-semibold">{title}</p>
              <p className="mt-1 text-white/80">
                Straubing Tigers · 3:2 · Platz 4
              </p>
            </div>
          </LiquidGlass>
        ))}
      </div>
    </div>
  );
}
