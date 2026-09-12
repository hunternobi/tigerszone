"use client";

import { useState } from "react";
import { ImageDown } from "lucide-react";
import { shareOrDownloadImage } from "@/lib/shareOrDownloadImage";

export interface TopDreiEntry {
  name: string;
  points: number;
}

interface TopDreiStoryExportProps {
  entries: TopDreiEntry[];
}

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT = "Poppins, Arial, sans-serif";

const AMBER_BORDER = "rgba(252,211,77,0.45)";
// Matches the real site's amber-100/90 heading color (Bonustipps, Hauptrundensieger).
const AMBER_GOLD = "rgba(254,243,199,0.9)";

const MEDALS = ["🥇", "🥈", "🥉"];

let poppinsLoaded: Promise<void> | null = null;

function ensurePoppinsLoaded(): Promise<void> {
  if (!poppinsLoaded) {
    const weights = [500, 600, 700, 800];
    poppinsLoaded = Promise.all(
      weights.map(async (weight) => {
        const font = new FontFace("Poppins", `url(/fonts/poppins-${weight}.woff2)`, {
          weight: String(weight),
        });
        await font.load();
        document.fonts.add(font);
      })
    ).then(() => undefined);
  }
  return poppinsLoaded;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Bild konnte nicht geladen werden: ${src}`));
    img.src = src;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function fillAmberCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  roundRectPath(ctx, x, y, width, height, radius);
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, "rgba(245,158,11,0.24)");
  gradient.addColorStop(0.5, "rgba(251,191,36,0.09)");
  gradient.addColorStop(1, "rgba(251,191,36,0.02)");
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = AMBER_BORDER;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const imgRatio = img.width / img.height;
  const boxRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  if (imgRatio > boxRatio) {
    drawHeight = height;
    drawWidth = height * imgRatio;
  } else {
    drawWidth = width;
    drawHeight = width / imgRatio;
  }
  const dx = x + (width - drawWidth) / 2;
  const dy = y + (height - drawHeight) / 2;
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
}

async function renderStoryCanvas(entries: TopDreiEntry[]): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas wird nicht unterstützt.");

  const [bgImage, logoImage] = await Promise.all([
    loadImage("/images/jubel.jpg"),
    loadImage("/images/TigersZone_Logo.png"),
    ensurePoppinsLoaded(),
  ]);

  drawCoverImage(ctx, bgImage, 0, 0, WIDTH, HEIGHT);

  const overlay = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  overlay.addColorStop(0, "rgba(10,15,61,0.55)");
  overlay.addColorStop(0.4, "rgba(10,15,61,0.78)");
  overlay.addColorStop(1, "rgba(10,15,61,0.95)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const logoSize = 140;
  const logoX = WIDTH / 2;
  const logoY = 170;
  ctx.save();
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(logoImage, logoX - logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const headingY = logoY + 210;
  ctx.font = `800 74px ${FONT}`;
  ctx.fillStyle = AMBER_GOLD;
  ctx.fillText("GESAMTRANGLISTE", WIDTH / 2, headingY);

  const cardPaddingX = 90;
  const cardWidth = WIDTH - cardPaddingX * 2;
  const rowPaddingX = 44;
  const medalColumnWidth = 120;
  const rowHeight = 170;
  const cardTopPadding = 60;
  const cardBottomPadding = 60;
  const cardHeight = cardTopPadding + rowHeight * entries.length + cardBottomPadding;
  const cardY = headingY + 200;

  fillAmberCard(ctx, cardPaddingX, cardY, cardWidth, cardHeight, 32);

  const nameFont = `700 44px ${FONT}`;
  const pointsFont = `800 40px ${FONT}`;
  const medalFont = `70px ${FONT}`;

  entries.forEach((entry, i) => {
    const rowTopY = cardY + cardTopPadding + i * rowHeight;
    const rowCenterY = rowTopY + rowHeight / 2;

    if (i > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardPaddingX + rowPaddingX, rowTopY);
      ctx.lineTo(cardPaddingX + cardWidth - rowPaddingX, rowTopY);
      ctx.stroke();
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = medalFont;
    ctx.fillText(MEDALS[i] ?? `${i + 1}.`, cardPaddingX + rowPaddingX, rowCenterY);

    ctx.font = nameFont;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(entry.name, cardPaddingX + rowPaddingX + medalColumnWidth, rowCenterY);

    ctx.textAlign = "right";
    ctx.font = pointsFont;
    ctx.fillStyle = AMBER_GOLD;
    ctx.fillText(`${entry.points} Pkt.`, cardPaddingX + cardWidth - rowPaddingX, rowCenterY);
  });

  let y = cardY + cardHeight + 90;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 40px ${FONT}`;
  ctx.fillStyle = AMBER_GOLD;
  ctx.fillText("Herzlichen Glückwunsch an die Gewinner!", WIDTH / 2, y);
  y += 56;
  ctx.font = `600 34px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Die vollständige Liste gibt's auf:", WIDTH / 2, y);

  ctx.font = `500 28px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText("tigerszone.de · Fotos: RS-Sportfoto.de", WIDTH / 2, HEIGHT - 70);

  return canvas;
}

export default function TopDreiStoryExport({ entries }: TopDreiStoryExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    setIsExporting(true);
    try {
      const canvas = await renderStoryCanvas(entries);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Export fehlgeschlagen.");

      await shareOrDownloadImage(blob, "gesamtrangliste-top3.png", "Gesamtrangliste Top 3");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export fehlgeschlagen.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="glass-pill glass-interactive flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        <ImageDown size={14} />
        {isExporting ? "Wird erstellt…" : "Als Story exportieren"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
