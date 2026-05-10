const KEY_PREFIX = "bibliotheca:progress:";

export function loadProgress(gutenbergId: number): number {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${gutenbergId}`);
    if (!raw) return 0;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveProgress(gutenbergId: number, spread: number): void {
  try {
    if (spread <= 0) {
      localStorage.removeItem(`${KEY_PREFIX}${gutenbergId}`);
    } else {
      localStorage.setItem(`${KEY_PREFIX}${gutenbergId}`, String(spread));
    }
  } catch {
    // ignore quota / disabled storage
  }
}
