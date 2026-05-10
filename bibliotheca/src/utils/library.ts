const STATUS_KEY = "bibliotheca:library:status";

export type BookStatus = "read" | "reading" | "wishlist";

export const STATUS_LABELS: Record<BookStatus, string> = {
  read: "Read",
  reading: "Reading",
  wishlist: "Wishlist",
};

export const STATUS_ORDER: BookStatus[] = ["reading", "wishlist", "read"];

type StatusMap = Record<number, BookStatus>;

export function loadStatusMap(): StatusMap {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: StatusMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      const id = Number(k);
      if (
        Number.isFinite(id) &&
        (v === "read" || v === "reading" || v === "wishlist")
      ) {
        out[id] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveStatusMap(map: StatusMap): void {
  try {
    if (Object.keys(map).length === 0) {
      localStorage.removeItem(STATUS_KEY);
    } else {
      localStorage.setItem(STATUS_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore
  }
}
