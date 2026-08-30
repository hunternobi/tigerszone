"use client";

import { useState } from "react";
import { ImageDown } from "lucide-react";
import { getTeamName } from "@/lib/teams";
import { formatPostDate } from "@/utils/format";
import type { SpieltagsMvpData } from "@/lib/leaderboard";

interface SpieltagsMvpStoryExportProps {
  mvp: SpieltagsMvpData;
}

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT = "Poppins, Arial, sans-serif";

const AMBER_BORDER = "rgba(252,211,77,0.45)";
// Matches the real site's amber-100/90 heading color (Bonustipps, Hauptrundensieger).
const AMBER_GOLD = "rgba(254,243,199,0.9)";

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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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
  game: { homeTeamId: string; awayTeamId: string; homeScore: number; awayScore: number },
  teamFont: string,
  teamLineHeight: number,
  columnWidth: number
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
  scoreFont: string
) {
  const blockCenterY = blockTopY + block.blockHeight / 2;

  ctx.font = scoreFont;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(block.scoreText, centerX, blockCenterY);

  const homeRightEdge = centerX - centerZoneHalfWidth;
  const awayLeftEdge = centerX + centerZoneHalfWidth;

  ctx.font = teamFont;
  ctx.fillStyle = "#ffffff";

  ctx.textAlign = "right";
  const homeStartY =
    blockCenterY - (block.homeLines.length * teamLineHeight) / 2 + teamLineHeight / 2;
  block.homeLines.forEach((line, i) => {
    ctx.fillText(line, homeRightEdge, homeStartY + i * teamLineHeight);
  });

  ctx.textAlign = "left";
  const awayStartY =
    blockCenterY - (block.awayLines.length * teamLineHeight) / 2 + teamLineHeight / 2;
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
  maxWidth: number
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
    const rowWidth = row.reduce((sum, item, i) => sum + item.width + (i > 0 ? gapX : 0), 0);
    let x = centerX - rowWidth / 2;
    for (const item of row) {
      roundRectPath(ctx, x, y, item.width, pillHeight, pillHeight / 2);
      ctx.fillStyle = "rgba(245,158,11,0.35)";
      ctx.fill();
      ctx.strokeStyle = "rgba(252,211,77,0.6)";
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

async function renderStoryCanvas(mvp: SpieltagsMvpData): Promise<HTMLCanvasElement> {
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
  ctx.fillText("SPIELTAGS-MVP", WIDTH / 2, headingY);

  const cardY = headingY + 200;

  if (mvp.date) {
    const dateY = (headingY + cardY) / 2 + 10;
    ctx.font = `500 34px ${FONT}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(formatPostDate(mvp.date), WIDTH / 2, dateY);
  }

  const cardPaddingX = 90;
  const cardWidth = WIDTH - cardPaddingX * 2;
  const cardInnerPaddingX = 36;
  const centerZoneHalfWidth = 95;
  const columnWidth = cardWidth / 2 - cardInnerPaddingX - centerZoneHalfWidth;
  const teamFont = `700 34px ${FONT}`;
  const scoreFont = `800 54px ${FONT}`;
  const teamLineHeight = 42;
  const gameGap = 36;
  const cardTopPadding = 50;
  const cardBottomPadding = 50;

  const blocks = mvp.games.map((game) =>
    computeGameBlock(ctx, game, teamFont, teamLineHeight, columnWidth)
  );
  const blocksHeight =
    blocks.reduce((sum, block) => sum + block.blockHeight, 0) +
    gameGap * Math.max(0, blocks.length - 1);
  const cardHeight = cardTopPadding + blocksHeight + cardBottomPadding;
  fillAmberCard(ctx, cardPaddingX, cardY, cardWidth, cardHeight, 32);

  let blockY = cardY + cardTopPadding;
  for (const block of blocks) {
    drawGameBlock(ctx, block, WIDTH / 2, blockY, centerZoneHalfWidth, teamFont, teamLineHeight, scoreFont);
    blockY += block.blockHeight + gameGap;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let y = cardY + cardHeight + 90;

  ctx.font = `700 36px ${FONT}`;
  ctx.fillStyle = AMBER_GOLD;
  ctx.fillText(
    mvp.entries.length === 0 ? "Diesmal war niemand exakt richtig" : "Richtig getippt haben:",
    WIDTH / 2,
    y
  );
  y += 70;

  if (mvp.entries.length > 0) {
    ctx.font = `600 30px ${FONT}`;
    wrapPills(
      ctx,
      mvp.entries.map((entry) => entry.name),
      WIDTH / 2,
      y,
      cardWidth
    );
  }

  ctx.font = `500 28px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "center";
  ctx.fillText("tigerszone.de · Fotos: RS-Sportfoto.de", WIDTH / 2, HEIGHT - 70);

  return canvas;
}

export default function SpieltagsMvpStoryExport({ mvp }: SpieltagsMvpStoryExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    setIsExporting(true);
    try {
      const canvas = await renderStoryCanvas(mvp);
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Export fehlgeschlagen.");

      const url = URL.createObjectURL(blob);
      const dateLabel = mvp.date ? formatPostDate(mvp.date).replace(/\./g, "-") : "mvp";
      const a = document.createElement("a");
      a.href = url;
      a.download = `spieltags-mvp-${dateLabel}.png`;
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
