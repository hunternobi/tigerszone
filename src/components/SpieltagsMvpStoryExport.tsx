"use client";

import { useState } from "react";
import { ImageDown } from "lucide-react";
import { getTeamName } from "@/lib/teams";
import { formatPostDate } from "@/utils/format";
import { shareOrDownloadImage } from "@/lib/shareOrDownloadImage";
import type { SpieltagsMvpData } from "@/lib/leaderboard";

interface SpieltagsMvpStoryExportProps {
  mvp: SpieltagsMvpData;
}

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT = "Poppins, Arial, sans-serif";

// Warm accent for the date eyebrow (matches the amber-100 headings of the site).
const AMBER_GOLD = "rgba(254,243,199,0.92)";

let poppinsLoaded: Promise<void> | null = null;

function ensurePoppinsLoaded(): Promise<void> {
  if (!poppinsLoaded) {
    const weights = [500, 600, 700, 800];
    poppinsLoaded = Promise.all(
      weights.map(async (weight) => {
        const font = new FontFace(
          "Poppins",
          `url(/fonts/poppins-${weight}.woff2)`,
          { weight: String(weight) },
        );
        await font.load();
        document.fonts.add(font);
      }),
    ).then(() => undefined);
  }
  return poppinsLoaded;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`Bild konnte nicht geladen werden: ${src}`));
    img.src = src;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  x: number,
  y: number,
  width: number,
  height: number,
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

// Space the library adds around each glass element for its drop shadow (its SHADOW_PAD).
const LIB_SHADOW_PAD = 20;

interface LibraryGlass {
  canvas: HTMLCanvasElement;
}

/**
 * The real liquid glass: the ybouane/liquidglass library itself renders the card (refraction, blur, chromatic
 * aberration, lit edge, shadow) on a hidden stage that holds the same photo and veil, exactly as it does on
 * the site. Speed does not matter for a still image, so the stage is given time to settle and then the
 * library's canvas is copied. Returns null if anything fails (the caller then draws a frosted fallback).
 */
async function renderLibraryGlass(
  card: { x: number; y: number; width: number; height: number; radius: number },
  veil: string[][],
): Promise<LibraryGlass | null> {
  // 1x1 px window: the stage inside keeps its real size and position for the library's measurements.
  const holder = document.createElement("div");
  holder.style.cssText =
    "position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;";
  const stage = document.createElement("div");
  stage.style.cssText = `position:absolute;left:0;top:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#0a0f3d;`;

  const photo = document.createElement("img");
  photo.src = "/images/jubel.jpg";
  photo.style.cssText =
    "position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;";
  const scrim = document.createElement("div");
  scrim.style.cssText = `position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(to bottom, ${veil
    .map(([stop, color]) => `${color} ${stop}`)
    .join(", ")});`;
  const glass = document.createElement("div");
  glass.style.cssText = `position:absolute;left:${card.x}px;top:${card.y}px;width:${card.width}px;height:${card.height}px;`;
  glass.dataset.config = JSON.stringify({
    floating: true,
    cornerRadius: card.radius,
    blurAmount: 0.4,
    refraction: 0.85,
    chromAberration: 0.05,
  });

  stage.append(photo, scrim, glass);
  holder.append(stage);
  document.body.append(holder);

  let instance: { destroy(): void } | null = null;
  try {
    await photo.decode();
    const { LiquidGlass } = await import("@/vendor/liquidglass");
    instance = await LiquidGlass.init({ root: stage, glassElements: [glass] });

    // Let the render loop draw and settle (the library paints on animation frames), then wait until the card
    // really has pixels.
    const glassCanvas = glass.querySelector("canvas");
    if (!glassCanvas) return null;
    await new Promise((resolve) => setTimeout(resolve, 1600));
    const probe = glassCanvas.getContext("2d");
    for (let attempt = 0; attempt < 20; attempt++) {
      const cx = Math.floor(glassCanvas.width / 2);
      const cy = Math.floor(glassCanvas.height / 2);
      const alpha = probe ? probe.getImageData(cx, cy, 1, 1).data[3] : 255;
      if (alpha > 0) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    const copy = document.createElement("canvas");
    copy.width = glassCanvas.width;
    copy.height = glassCanvas.height;
    copy.getContext("2d")?.drawImage(glassCanvas, 0, 0);
    return { canvas: copy };
  } catch (error) {
    console.warn(
      "Story: liquid glass library failed, using the fallback.",
      error,
    );
    return null;
  } finally {
    instance?.destroy();
    holder.remove();
  }
}

/** Fallback without WebGL: frosted panel with the blurred photo, a light tint, a lit rim and a soft shadow. */
function fillFrostedCard(
  ctx: CanvasRenderingContext2D,
  photo: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 70;
  ctx.shadowOffsetY = 28;
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = "rgba(10,15,61,0.5)";
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.clip();
  if ("filter" in ctx) {
    ctx.filter = "blur(28px) saturate(1.4)";
    ctx.drawImage(photo, -60, -60, WIDTH + 120, HEIGHT + 120);
    ctx.filter = "none";
  }
  const tint = ctx.createLinearGradient(x, y, x + width, y + height);
  tint.addColorStop(0, "rgba(255,255,255,0.20)");
  tint.addColorStop(0.5, "rgba(255,255,255,0.08)");
  tint.addColorStop(1, "rgba(255,255,255,0.12)");
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, width, height);
  ctx.restore();

  const rim = ctx.createLinearGradient(x, y, x + width, y + height);
  rim.addColorStop(0, "rgba(255,255,255,0.75)");
  rim.addColorStop(0.3, "rgba(255,255,255,0.14)");
  rim.addColorStop(0.7, "rgba(255,255,255,0.1)");
  rim.addColorStop(1, "rgba(190,215,255,0.55)");
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.strokeStyle = rim;
  ctx.lineWidth = 3;
  ctx.stroke();
}

interface PillItem {
  name: string;
  width: number;
}

function wrapPills(
  ctx: CanvasRenderingContext2D,
  names: string[],
  centerX: number,
  startY: number,
  maxWidth: number,
  scale = 1,
): number {
  const paddingX = 32 * scale;
  const pillHeight = 64 * scale;
  const gapX = 18 * scale;
  const gapY = 18 * scale;

  const items: PillItem[] = names.map((name) => ({
    name,
    width: ctx.measureText(name).width + paddingX * 2,
  }));

  const rows: PillItem[][] = [];
  let currentRow: PillItem[] = [];
  let currentWidth = 0;
  for (const item of items) {
    const extra = currentRow.length > 0 ? gapX + item.width : item.width;
    if (currentWidth + extra > maxWidth && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [item];
      currentWidth = item.width;
    } else {
      currentRow.push(item);
      currentWidth += extra;
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  let y = startY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const row of rows) {
    const rowWidth = row.reduce(
      (sum, item, i) => sum + item.width + (i > 0 ? gapX : 0),
      0,
    );
    let x = centerX - rowWidth / 2;
    for (const item of row) {
      roundRectPath(ctx, x, y, item.width, pillHeight, pillHeight / 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2.5 * scale;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(item.name, x + item.width / 2, y + pillHeight / 2 + 2);
      x += item.width + gapX;
    }
    y += pillHeight + gapY;
  }
  return y;
}

// One game as on the tip page of a phone: home above away, the result as one box per team on the right.
const ROW_HEIGHT = 96;
const BOX_SIZE = 84;

function drawGame(
  ctx: CanvasRenderingContext2D,
  game: {
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
  },
  cardX: number,
  cardWidth: number,
  topY: number,
) {
  const nameX = cardX + 56;
  const boxX = cardX + cardWidth - 48 - BOX_SIZE;
  const maxNameWidth = boxX - 28 - nameX;
  const rows = [
    { id: game.homeTeamId, score: game.homeScore },
    { id: game.awayTeamId, score: game.awayScore },
  ];

  rows.forEach((row, index) => {
    const centerY = topY + index * ROW_HEIGHT + ROW_HEIGHT / 2;
    const isTigers = row.id === "straubing-tigers";

    // The name shrinks a little instead of wrapping, so the two lines of a game always stay two lines.
    let size = 40;
    const name = getTeamName(row.id);
    ctx.font = `${isTigers ? 800 : 600} ${size}px ${FONT}`;
    while (ctx.measureText(name).width > maxNameWidth && size > 26) {
      size -= 2;
      ctx.font = `${isTigers ? 800 : 600} ${size}px ${FONT}`;
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, nameX, centerY + 2);

    roundRectPath(ctx, boxX, centerY - BOX_SIZE / 2, BOX_SIZE, BOX_SIZE, 26);
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.42)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = `800 52px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(row.score), boxX + BOX_SIZE / 2, centerY + 3);
  });
}

async function renderStoryCanvas(
  mvp: SpieltagsMvpData,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas wird nicht unterstützt.");

  const [bgImage, logoImage, siglLogo] = await Promise.all([
    loadImage("/images/jubel.jpg"),
    loadImage("/images/TigersZone_Logo.png"),
    loadImage("/images/partners/sigl-immobilien.png"),
    ensurePoppinsLoaded(),
  ]);

  // Photo with a dark navy veil (a little lighter in the middle, darker where text sits). This is also what
  // the glass card refracts, so it is kept as its own canvas, free of text.
  const backdrop = document.createElement("canvas");
  backdrop.width = WIDTH;
  backdrop.height = HEIGHT;
  const backdropCtx = backdrop.getContext("2d");
  if (!backdropCtx) throw new Error("Canvas wird nicht unterstützt.");
  drawCoverImage(backdropCtx, bgImage, 0, 0, WIDTH, HEIGHT);
  const veil: string[][] = [
    ["0%", "rgba(10,15,61,0.62)"],
    ["35%", "rgba(10,15,61,0.5)"],
    ["70%", "rgba(10,15,61,0.72)"],
    ["100%", "rgba(10,15,61,0.95)"],
  ];
  const overlay = backdropCtx.createLinearGradient(0, 0, 0, HEIGHT);
  for (const [stop, color] of veil)
    overlay.addColorStop(parseFloat(stop) / 100, color);
  backdropCtx.fillStyle = overlay;
  backdropCtx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(backdrop, 0, 0);

  // Logo with a soft glow ring
  const logoSize = 128;
  const logoX = WIDTH / 2;
  const logoY = 150;
  ctx.save();
  ctx.shadowColor = "rgba(122,155,224,0.7)";
  ctx.shadowBlur = 50;
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#0a0f3d";
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    logoImage,
    logoX - logoSize / 2,
    logoY - logoSize / 2,
    logoSize,
    logoSize,
  );
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Eyebrow (date) and large title, like an iOS large title
  const spaced = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  const eyebrowY = logoY + 140;
  ctx.font = `700 30px ${FONT}`;
  ctx.fillStyle = AMBER_GOLD;
  if ("letterSpacing" in spaced) spaced.letterSpacing = "6px";
  ctx.fillText(
    mvp.date ? formatPostDate(mvp.date).toUpperCase() : "SPIELTAG",
    WIDTH / 2,
    eyebrowY,
  );
  if ("letterSpacing" in spaced) spaced.letterSpacing = "0px";

  const headingY = eyebrowY + 84;
  ctx.font = `800 100px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Spieltags-MVP", WIDTH / 2, headingY);

  // Everything from the card down is drawn twice: once on a scratch canvas to measure how much room is
  // left, then for real, nudged down so a short list does not leave a hole above the sponsor line.
  const cardX = 60;
  const cardWidth = WIDTH - cardX * 2;
  const gameGap = 52;
  const cardPaddingY = 52;
  const gamesHeight =
    mvp.games.length * ROW_HEIGHT * 2 +
    gameGap * Math.max(0, mvp.games.length - 1);
  const cardHeight = cardPaddingY * 2 + gamesHeight;

  const cardRadius = 70;
  const drawBody = (
    target: CanvasRenderingContext2D,
    offset: number,
    glass: LibraryGlass | null | "dry",
    pillScale: number,
  ): number => {
    const cardY = headingY + 90 + offset;
    if (glass !== "dry") {
      if (glass) {
        target.drawImage(
          glass.canvas,
          cardX - LIB_SHADOW_PAD,
          cardY - LIB_SHADOW_PAD,
          cardWidth + LIB_SHADOW_PAD * 2,
          cardHeight + LIB_SHADOW_PAD * 2,
        );
      } else {
        fillFrostedCard(
          target,
          backdrop,
          cardX,
          cardY,
          cardWidth,
          cardHeight,
          cardRadius,
        );
      }
    }

    let gameY = cardY + cardPaddingY;
    mvp.games.forEach((game, index) => {
      drawGame(target, game, cardX, cardWidth, gameY);
      gameY += ROW_HEIGHT * 2;
      if (index < mvp.games.length - 1) {
        const lineY = gameY + gameGap / 2;
        target.strokeStyle = "rgba(255,255,255,0.2)";
        target.lineWidth = 2;
        target.beginPath();
        target.moveTo(cardX + 56, lineY);
        target.lineTo(cardX + cardWidth - 56, lineY);
        target.stroke();
        gameY += gameGap;
      }
    });

    target.textAlign = "center";
    target.textBaseline = "middle";
    let y = cardY + cardHeight + 96;
    target.font = `700 40px ${FONT}`;
    target.fillStyle = "#ffffff";
    target.fillText(
      mvp.entries.length === 0
        ? "Diesmal war niemand exakt richtig"
        : "Exakt richtig getippt",
      WIDTH / 2,
      y,
    );
    y += 66;

    let bottom = y;
    if (mvp.entries.length > 0) {
      target.font = `600 ${30 * pillScale}px ${FONT}`;
      bottom = wrapPills(
        target,
        mvp.entries.map((entry) => entry.name),
        WIDTH / 2,
        y,
        cardWidth,
        pillScale,
      );
    }
    return bottom;
  };

  const scratch = document.createElement("canvas");
  scratch.width = WIDTH;
  scratch.height = HEIGHT;
  const scratchCtx = scratch.getContext("2d");
  const footerY = HEIGHT - 64;
  // Many right tippers: the pills shrink step by step until the list fits above the smallest sponsor block.
  const smallestSponsorTop = footerY - 52 - 56 - 58;
  let pillScale = 1;
  let measuredBottom = HEIGHT;
  for (const candidate of [1, 0.9, 0.8, 0.7, 0.6]) {
    pillScale = candidate;
    measuredBottom = scratchCtx
      ? drawBody(scratchCtx, 0, "dry", candidate)
      : HEIGHT;
    if (measuredBottom <= smallestSponsorTop - 20) break;
  }
  const sponsorZoneTop = footerY - 52 - 96 - 58;
  const bodyOffset = Math.max(
    0,
    Math.min(150, (sponsorZoneTop - 20 - measuredBottom) * 0.45),
  );
  const glass = await renderLibraryGlass(
    {
      x: cardX,
      y: headingY + 90 + bodyOffset,
      width: cardWidth,
      height: cardHeight,
      radius: cardRadius,
    },
    veil,
  );
  const contentBottom = drawBody(ctx, bodyOffset, glass, pillScale);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // "Präsentiert von" + Sigl Immobilien, centred above the footer line. The logo is white and sits on the
  // darkest part of the veil. With many names the free space shrinks and the logo with it.
  const siglBottom = footerY - 52;
  const siglMaxHeight = 96;
  const siglMinHeight = 56;
  const labelSpace = 58;
  const siglHeight = Math.max(
    siglMinHeight,
    Math.min(siglMaxHeight, siglBottom - (contentBottom + 20) - labelSpace),
  );
  const siglWidth = Math.min(
    cardWidth * 0.4,
    siglHeight * (siglLogo.naturalWidth / siglLogo.naturalHeight),
  );
  const siglDrawHeight =
    siglWidth * (siglLogo.naturalHeight / siglLogo.naturalWidth);
  const siglTop = siglBottom - siglDrawHeight;
  ctx.font = `500 26px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillText("Präsentiert von", WIDTH / 2, siglTop - 30);
  ctx.drawImage(
    siglLogo,
    WIDTH / 2 - siglWidth / 2,
    siglTop,
    siglWidth,
    siglDrawHeight,
  );

  ctx.font = `500 26px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("tigerszone.de · Fotos: RS-Sportfoto.de", WIDTH / 2, footerY);

  return canvas;
}

export default function SpieltagsMvpStoryExport({
  mvp,
}: SpieltagsMvpStoryExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    setIsExporting(true);
    try {
      const canvas = await renderStoryCanvas(mvp);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Export fehlgeschlagen.");

      const dateLabel = mvp.date
        ? formatPostDate(mvp.date).replace(/\./g, "-")
        : "mvp";
      await shareOrDownloadImage(
        blob,
        `spieltags-mvp-${dateLabel}.png`,
        "Spieltags-MVP",
      );
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
