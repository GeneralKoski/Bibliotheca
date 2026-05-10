const WPM_KEY = "bibliotheca:wpm";
const DEFAULT_WPM = 250;
const MIN_WPM = 80;
const MAX_WPM = 800;

export function loadWpm(): number {
  try {
    const raw = localStorage.getItem(WPM_KEY);
    if (!raw) return DEFAULT_WPM;
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return DEFAULT_WPM;
    return Math.max(MIN_WPM, Math.min(MAX_WPM, parsed));
  } catch {
    return DEFAULT_WPM;
  }
}

export function saveWpm(wpm: number): void {
  try {
    const clamped = Math.max(MIN_WPM, Math.min(MAX_WPM, wpm));
    localStorage.setItem(WPM_KEY, String(clamped));
  } catch {
    // ignore
  }
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function remainingWords(pages: string[], fromPageIndex: number): number {
  let total = 0;
  for (let i = fromPageIndex; i < pages.length; i++) {
    total += countWords(pages[i]);
  }
  return total;
}

export function formatRemaining(minutes: number): string {
  if (minutes < 1) return "< 1 min left";
  if (minutes < 60) return `${Math.round(minutes)} min left`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes - h * 60);
  return m === 0 ? `${h}h left` : `${h}h ${m}m left`;
}

export const WPM_BOUNDS = { min: MIN_WPM, max: MAX_WPM, default: DEFAULT_WPM };
