"use client";

import { useState } from "react";
import { ImageDown } from "lucide-react";
import { getDelClubName } from "@/lib/delClubs";

interface SaisonprognoseStoryExportProps {
  order: string[];
  playerName: string;
  disabled?: boolean;
}

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT = "Poppins, Arial, sans-serif";

const CARD_BORDER = "rgba(255,255,255,0.35)";

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

function fillCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  roundRectPath(ctx, x, y, width, height, radius);
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, "rgba(255,255,255,0.18)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.08)");
  gradient.addColorStop(1, "rgba(255,255,255,0.02)");
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = CARD_BORDER;
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

async function renderStoryCanvas(order: string[], playerName: string): Promise<HTMLCanvasElement> {
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
  ctx.fillStyle = "#ffffff";
  ctx.fillText("SAISONPROGNOSE", WIDTH / 2, headingY);

  const subheadingY = headingY + 90;
  ctx.font = `600 40px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Spieler: ${playerName}`, WIDTH / 2, subheadingY);

  const cardPaddingX = 90;
  const cardWidth = WIDTH - cardPaddingX * 2;
  const rowPaddingX = 40;
  const posColumnWidth = 84;
  const rowHeight = 78;
  const cardTopPadding = 40;
  const cardBottomPadding = 40;
  const cardHeight = cardTopPadding + rowHeight * order.length + cardBottomPadding;
  const cardY = subheadingY + 80;

  fillCard(ctx, cardPaddingX, cardY, cardWidth, cardHeight, 32);

  const nameFont = `600 34px ${FONT}`;
  const posFont = `800 30px ${FONT}`;
  for (let i = 0; i < order.length; i++) {
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
    ctx.font = posFont;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${i + 1}.`, cardPaddingX + rowPaddingX, rowCenterY);

    ctx.font = nameFont;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(getDelClubName(order[i]), cardPaddingX + rowPaddingX + posColumnWidth, rowCenterY);
  }

  ctx.font = `500 28px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "center";
  ctx.fillText("tigerszone.de · Fotos: RS-Sportfoto.de", WIDTH / 2, HEIGHT - 70);

  return canvas;
}

export default function SaisonprognoseStoryExport({
  order,
  playerName,
  disabled = false,
}: SaisonprognoseStoryExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    setIsExporting(true);
    try {
      const canvas = await renderStoryCanvas(order, playerName);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Export fehlgeschlagen.");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "saisonprognose.png";
      a.click();
      URL.revokeObjectURL(url);
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
        disabled={isExporting || disabled}
        className="glass-pill glass-interactive flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        <ImageDown size={14} />
        {isExporting ? "Wird erstellt…" : "Als Story exportieren"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
