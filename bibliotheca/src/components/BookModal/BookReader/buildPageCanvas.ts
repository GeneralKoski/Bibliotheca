interface PageTextureOptions {
  text: string;
  pageNumber: number;
  totalPages: number;
  bookTitle: string;
}

export function buildPageCanvas({
  text,
  pageNumber,
  totalPages,
  bookTitle,
}: PageTextureOptions): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const bg = ctx.createLinearGradient(0, 0, 0, 768);
  bg.addColorStop(0, "#F7F1E4");
  bg.addColorStop(1, "#EFE7D4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 768);

  ctx.strokeStyle = "rgba(74, 55, 40, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, 512 - 72, 768 - 72);

  ctx.fillStyle = "#7a6a52";
  ctx.font = '400 14px "Inter", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(bookTitle, 48, 56);
  ctx.textAlign = "right";
  ctx.fillText(`${pageNumber} / ${totalPages}`, 512 - 48, 56);

  ctx.fillStyle = "#1a1a1a";
  ctx.font = '400 18px "Inter", sans-serif';
  ctx.textAlign = "left";
  const lineHeight = 26;
  const marginX = 56;
  const marginTop = 96;
  const maxWidth = 512 - marginX * 2;
  let y = marginTop;

  const paragraphs = text.split(/\n\n+/);
  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let line = "    ";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, marginX, y);
        y += lineHeight;
        if (y > 768 - 48) return canvas;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, marginX, y);
      y += lineHeight;
    }
    y += lineHeight * 0.4;
    if (y > 768 - 48) return canvas;
  }

  return canvas;
}
