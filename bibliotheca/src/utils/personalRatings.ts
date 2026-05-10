const KEY = "bibliotheca:ratings";

type RatingMap = Record<number, number>;

export function loadRatings(): RatingMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: RatingMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      const id = Number(k);
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(id) && Number.isFinite(n) && n >= 0 && n <= 5) {
        out[id] = n;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveRatings(map: RatingMap): void {
  try {
    if (Object.keys(map).length === 0) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, JSON.stringify(map));
    }
  } catch {
    // ignore
  }
}
