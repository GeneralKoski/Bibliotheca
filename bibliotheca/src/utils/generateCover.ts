import type { Book } from "../types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lightenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const k = percent / 100;
  return rgbToHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k);
}

export function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const k = 1 - percent / 100;
  return rgbToHex(r * k, g * k, b * k);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function generateCoverTexture(book: Book): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const gradient = ctx.createLinearGradient(0, 0, 512, 768);
  gradient.addColorStop(0, lightenColor(book.color, 30));
  gradient.addColorStop(1, darkenColor(book.color, 20));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 768);

  ctx.strokeStyle = "rgba(232, 224, 208, 0.45)";
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, 512 - 56, 768 - 56);
  ctx.strokeStyle = "rgba(201, 169, 110, 0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(44, 44, 512 - 88, 768 - 88);

  ctx.save();
  ctx.strokeStyle = "rgba(201, 169, 110, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(72, 180);
  ctx.lineTo(512 - 72, 180);
  ctx.moveTo(72, 610);
  ctx.lineTo(512 - 72, 610);
  ctx.stroke();

  const ornament = (cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  };
  ornament(256, 140, 18);
  ornament(256, 650, 18);
  ctx.restore();

  ctx.fillStyle = "#E8E0D0";
  ctx.textAlign = "center";
  ctx.font = 'bold 48px "Playfair Display", serif';

  const titleLines = wrapText(ctx, book.title, 512 - 120);
  const startY = 380 - ((titleLines.length - 1) * 56) / 2;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, 256, startY + i * 56);
  });

  ctx.fillStyle = "#C9A96E";
  ctx.font = '500 26px "Inter", sans-serif';
  ctx.fillText(book.author.toUpperCase(), 256, startY + titleLines.length * 56 + 42);

  ctx.fillStyle = "rgba(232, 224, 208, 0.55)";
  ctx.font = 'italic 18px "Inter", sans-serif';
  ctx.fillText(String(book.year), 256, 720);

  return canvas;
}
