export interface Chapter {
  spread: number;
  pageIndex: number;
  title: string;
}

const HEADING_RE =
  /^(chapter|book|part|volume|canto)\s+([\divxlcdm]+)\.?(\s*[—:.\-]?\s*(.{0,80}))?$/i;

export function extractChapters(pages: string[]): Chapter[] {
  const out: Chapter[] = [];
  for (let i = 0; i < pages.length; i++) {
    const firstPara = pages[i].split(/\n\s*\n/)[0]?.trim() ?? "";
    if (!firstPara || firstPara.length > 120) continue;
    const match = firstPara.match(HEADING_RE);
    if (!match) continue;
    const kind = match[1][0].toUpperCase() + match[1].slice(1).toLowerCase();
    const number = match[2].toUpperCase();
    const subtitle = (match[4] ?? "").trim().replace(/[.\s]+$/, "");
    const title = subtitle
      ? `${kind} ${number} — ${subtitle}`
      : `${kind} ${number}`;
    out.push({
      spread: Math.floor(i / 2),
      pageIndex: i,
      title,
    });
  }
  // dedupe consecutive duplicates (same heading detected twice on adjacent pages)
  return out.filter(
    (c, idx, arr) => idx === 0 || c.title !== arr[idx - 1].title
  );
}
