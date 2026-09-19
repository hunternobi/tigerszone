"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";

export interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryItem {
  src: string | null;
  alt: string;
}

interface ShootoutGalleryProps {
  images: GalleryImage[];
  /** Number of dashed sample tiles shown while `images` is empty. */
  placeholderCount?: number;
}

export default function ShootoutGallery({ images, placeholderCount = 4 }: ShootoutGalleryProps) {
  const items: GalleryItem[] =
    images.length > 0
      ? images
      : Array.from({ length: placeholderCount }, (_, index) => ({
          src: null,
          alt: `Musterbild ${index + 1}`,
        }));

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const itemCount = items.length;

  const updateArrows = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    setCanScrollLeft(strip.scrollLeft > 4);
    setCanScrollRight(strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    updateArrows();
    strip.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      strip.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, itemCount]);

  function scrollStrip(direction: number) {
    const strip = stripRef.current;
    if (!strip) return;
    const firstTile = strip.firstElementChild as HTMLElement | null;
    const amount = firstTile ? firstTile.getBoundingClientRect().width + 12 : strip.clientWidth * 0.8;
    strip.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (direction: number) =>
      setOpenIndex((current) =>
        current === null ? current : (current + direction + itemCount) % itemCount
      ),
    [itemCount]
  );

  useEffect(() => {
    if (openIndex === null) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    }

    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, close, step]);

  const active = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className="relative -mx-4 sm:-mx-6">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollStrip(-1)}
            aria-label="Vorherige Bilder"
            className="glass-pill glass-interactive absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white sm:left-3"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollStrip(1)}
            aria-label="Weitere Bilder"
            className="glass-pill glass-interactive absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white sm:right-3"
          >
            <ChevronRight size={22} />
          </button>
        )}
        <div
          ref={stripRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-pl-4 px-4 pb-2 sm:scroll-pl-6 sm:px-6"
        >
          {items.map((item, index) => (
            <button
              key={item.src ?? index}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`${item.alt} vergrößern`}
              className={`relative aspect-[4/3] w-64 shrink-0 snap-start overflow-hidden rounded-2xl transition hover:brightness-110 sm:w-72 ${
                item.src ? "" : "border border-dashed border-white/30 bg-white/5 text-white/70"
              }`}
            >
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 640px) 288px, 256px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full flex-col items-center justify-center gap-1.5">
                  <ImageIcon size={22} />
                  <span className="text-xs font-semibold">{item.alt}</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {active &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Bildansicht"
            onClick={close}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Schließen"
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X size={22} />
            </button>

            {itemCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Vorheriges Bild"
                  className="absolute left-2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Nächstes Bild"
                  className="absolute right-2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative h-[75vh] w-full max-w-5xl"
            >
              {active.src ? (
                <Image
                  src={active.src}
                  alt={active.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/30 bg-white/5 text-white/70">
                  <ImageIcon size={56} />
                  <span className="text-lg font-semibold">{active.alt}</span>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
