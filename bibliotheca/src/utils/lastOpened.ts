const KEY = "bibliotheca:lastOpened";

type LastOpenedMap = Record<number, number>;

export function loadLastOpened(): LastOpenedMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: LastOpenedMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      const id = Number(k);
      const t = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(id) && Number.isFinite(t)) out[id] = t;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveLastOpened(map: LastOpenedMap): void {
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
