import { getImageProps } from "next/image";
import type { CSSProperties, ReactNode } from "react";

interface FadingBackgroundProps {
  src: string;
  mobileSrc?: string;
  alt?: string;
  opacity?: number;
  blurPx?: number;
  overlayClassName?: string;
  scaleClassName?: string;
  children: ReactNode;
}

/** From this width on the wide photo is shown (Tailwind's sm). */
const WIDE_QUERY = "(min-width: 640px)";
const NARROW_QUERY = "(max-width: 639.98px)";

// The photos lie dimmed behind the page, so a lower quality than the default 75 is not visible.
const photoProps = (src: string, alt: string) =>
  getImageProps({
    src,
    alt,
    fill: true,
    sizes: "100vw",
    quality: 60,
    loading: "eager",
    fetchPriority: "high",
  }).props;

export default function FadingBackground({
  src,
  mobileSrc,
  alt = "",
  opacity = 1,
  blurPx = 0,
  overlayClassName,
  scaleClassName = "scale-100",
  children,
}: FadingBackgroundProps) {
  const wide = photoProps(src, alt);
  const narrow = mobileSrc ? photoProps(mobileSrc, alt) : null;

  // The photo is fixed to the screen and as high as the screen with the browser toolbars collapsed (100lvh). With
  // inset-0 it was resized every time Safari's toolbars slid in or out while scrolling, and the browser had to
  // scale and redraw the whole picture again, which showed as stutter.
  return (
    <div className="relative -mt-[4.5rem] overflow-hidden">
      {/* One <picture> instead of two images, so a phone only downloads the phone photo (two <Image>s were
          both preloaded, the hidden one included). The preloads carry the same media queries. */}
      <link
        rel="preload"
        as="image"
        imageSrcSet={wide.srcSet}
        imageSizes="100vw"
        media={narrow ? WIDE_QUERY : undefined}
        fetchPriority="high"
      />
      {narrow && (
        <link
          rel="preload"
          as="image"
          imageSrcSet={narrow.srcSet}
          imageSizes="100vw"
          media={NARROW_QUERY}
          fetchPriority="high"
        />
      )}

      <div
        data-page-background
        style={
          {
            opacity,
            "--page-bg-blur": blurPx ? `${blurPx}px` : undefined,
          } as CSSProperties
        }
        className={`page-bg pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh] ${scaleClassName}`}
      >
        <picture>
          {narrow && (
            <source media={WIDE_QUERY} srcSet={wide.srcSet} sizes="100vw" />
          )}
          {/* The props come from next/image (getImageProps), so this is still an optimised image. */}
          <img
            {...(narrow ?? wide)}
            alt={alt}
            className="object-cover object-center"
          />
        </picture>
      </div>

      {overlayClassName && (
        <div
          style={{ opacity }}
          className={`pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh] ${overlayClassName}`}
        />
      )}

      <div className="relative z-10 pt-[4.5rem]">{children}</div>
    </div>
  );
}
