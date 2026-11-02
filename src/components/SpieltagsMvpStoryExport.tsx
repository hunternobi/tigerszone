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
          {
            weight: String(weight),
          },
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

/**
 * Frosted glass panel like the site's cards: the blurred photo inside, a light tint, a lit rim (bright arc top
 * left, cool one bottom right) and a soft drop shadow. Browsers without canvas filters just skip the blur.
 */
function fillGlassCard(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
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
    drawCoverImage(ctx, photo, -60, -60, WIDTH + 120, HEIGHT + 120);
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

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

interface GameBlock {
  homeLines: string[];
  awayLines: string[];
  scoreText: string;
  blockHeight: number;
}

function computeGameBlock(
  ctx: CanvasRenderingContext2D,
  game: {
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
  },
  teamFont: string,
  teamLineHeight: number,
  columnWidth: number,
): GameBlock {
  ctx.font = teamFont;
  const homeLines = wrapText(ctx, getTeamName(game.homeTeamId), columnWidth);
  const awayLines = wrapText(ctx, getTeamName(game.awayTeamId), columnWidth);
  const numLines = Math.max(homeLines.length, awayLines.length, 1);
  return {
    homeLines,
    awayLines,
    scoreText: `${game.homeScore}:${game.awayScore}`,
    blockHeight: numLines * teamLineHeight,
  };
}

// Score stays perfectly centered; team names are right/left-aligned toward it
// and wrap onto extra lines instead of overflowing, mirroring the Tippabgabe layout.
function drawGameBlock(
  ctx: CanvasRenderingContext2D,
  block: GameBlock,
  centerX: number,
  blockTopY: number,
  centerZoneHalfWidth: number,
  teamFont: string,
  teamLineHeight: number,
  scoreFont: string,
) {
  const blockCenterY = blockTopY + block.blockHeight / 2;

  const capsuleWidth = centerZoneHalfWidth * 2 - 36;
  const capsuleHeight = 92;
  roundRectPath(
    ctx,
    centerX - capsuleWidth / 2,
    blockCenterY - capsuleHeight / 2,
    capsuleWidth,
    capsuleHeight,
    capsuleHeight / 2,
  );
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.font = scoreFont;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(block.scoreText, centerX, blockCenterY + 3);

  const homeRightEdge = centerX - centerZoneHalfWidth;
  const awayLeftEdge = centerX + centerZoneHalfWidth;

  ctx.font = teamFont;
  ctx.fillStyle = "#ffffff";

  ctx.textAlign = "right";
  const homeStartY =
    blockCenterY -
    (block.homeLines.length * teamLineHeight) / 2 +
    teamLineHeight / 2;
  block.homeLines.forEach((line, i) => {
    ctx.fillText(line, homeRightEdge, homeStartY + i * teamLineHeight);
  });

  ctx.textAlign = "left";
  const awayStartY =
    blockCenterY -
    (block.awayLines.length * teamLineHeight) / 2 +
    teamLineHeight / 2;
  block.awayLines.forEach((line, i) => {
    ctx.fillText(line, awayLeftEdge, awayStartY + i * teamLineHeight);
  });
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
): number {
  const paddingX = 32;
  const pillHeight = 64;
  const gapX = 18;
  const gapY = 18;

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
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(item.name, x + item.width / 2, y + pillHeight / 2 + 2);
      x += item.width + gapX;
    }
    y += pillHeight + gapY;
  }
  return y;
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

  drawCoverImage(ctx, bgImage, 0, 0, WIDTH, HEIGHT);

  // Dark navy veil, a little lighter in the middle so the photo still shows, darker where text sits.
  const overlay = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  overlay.addColorStop(0, "rgba(10,15,61,0.62)");
  overlay.addColorStop(0.35, "rgba(10,15,61,0.5)");
  overlay.addColorStop(0.7, "rgba(10,15,61,0.72)");
  overlay.addColorStop(1, "rgba(10,15,61,0.95)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

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
  const drawBody = (ctx: CanvasRenderingContext2D, offset: number): number => {
    const cardY = headingY + 90 + offset;

    const cardPaddingX = 70;
    const cardWidth = WIDTH - cardPaddingX * 2;
    const cardInnerPaddingX = 40;
    const centerZoneHalfWidth = 120;
    const columnWidth = cardWidth / 2 - cardInnerPaddingX - centerZoneHalfWidth;
    const teamFont = `700 34px ${FONT}`;
    const scoreFont = `800 54px ${FONT}`;
    const teamLineHeight = 42;
    const gameGap = 56;
    const cardTopPadding = 56;
    const cardBottomPadding = 56;
    const minRowHeight = 92;

    const blocks = mvp.games.map((game) =>
      computeGameBlock(
        ctx,
        game,
        teamFont,
        teamLineHeight,
        Math.max(columnWidth, 120),
      ),
    );
    const blocksHeight =
      blocks.reduce(
        (sum, block) => sum + Math.max(block.blockHeight, minRowHeight),
        0,
      ) +
      gameGap * Math.max(0, blocks.length - 1);
    const cardHeight = cardTopPadding + blocksHeight + cardBottomPadding;
    fillGlassCard(ctx, bgImage, cardPaddingX, cardY, cardWidth, cardHeight, 56);

    let blockY = cardY + cardTopPadding;
    blocks.forEach((block, index) => {
      const rowHeight = Math.max(block.blockHeight, minRowHeight);
      drawGameBlock(
        ctx,
        { ...block, blockHeight: rowHeight },
        WIDTH / 2,
        blockY,
        centerZoneHalfWidth,
        teamFont,
        teamLineHeight,
        scoreFont,
      );
      blockY += rowHeight;
      if (index < blocks.length - 1) {
        const lineY = blockY + gameGap / 2;
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cardPaddingX + cardInnerPaddingX, lineY);
        ctx.lineTo(cardPaddingX + cardWidth - cardInnerPaddingX, lineY);
        ctx.stroke();
        blockY += gameGap;
      }
    });
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let y = cardY + cardHeight + 96;

    ctx.font = `700 40px ${FONT}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      mvp.entries.length === 0
        ? "Diesmal war niemand exakt richtig"
        : "Exakt richtig getippt",
      WIDTH / 2,
      y,
    );
    y += 66;

    let contentBottom = y;
    if (mvp.entries.length > 0) {
      ctx.font = `600 30px ${FONT}`;
      contentBottom = wrapPills(
        ctx,
        mvp.entries.map((entry) => entry.name),
        WIDTH / 2,
        y,
        cardWidth,
      );
    }
    return contentBottom;
  };
  const scratch = document.createElement("canvas");
  scratch.width = WIDTH;
  scratch.height = HEIGHT;
  const scratchCtx = scratch.getContext("2d");
  const measuredBottom = scratchCtx ? drawBody(scratchCtx, 0) : HEIGHT;
  const sponsorZoneTop = HEIGHT - 64 - 52 - 96 - 58;
  const bodyOffset = Math.max(
    0,
    Math.min(150, (sponsorZoneTop - 20 - measuredBottom) * 0.45),
  );
  const contentBottom = drawBody(ctx, bodyOffset);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const footerY = HEIGHT - 64;

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
    (WIDTH - 140) * 0.4,
    siglHeight * (siglLogo.naturalWidth / siglLogo.naturalHeight),
  );
  const siglDrawHeight =
    siglWidth * (siglLogo.naturalHeight / siglLogo.naturalWidth);
  const siglTop = siglBottom - siglDrawHeight;
  ctx.font = `500 26px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.textAlign = "center";
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
