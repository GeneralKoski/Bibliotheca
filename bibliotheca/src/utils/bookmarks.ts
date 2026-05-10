const KEY_PREFIX = "bibliotheca:bookmarks:";

export interface Bookmark {
  id: string;
  spread: number;
  label?: string;
  createdAt: number;
}

function key(gutenbergId: number) {
  return `${KEY_PREFIX}${gutenbergId}`;
}

export function loadBookmarks(gutenbergId: number): Bookmark[] {
  try {
    const raw = localStorage.getItem(key(gutenbergId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Bookmark =>
        b &&
        typeof b.id === "string" &&
        typeof b.spread === "number" &&
        typeof b.createdAt === "number"
    );
  } catch {
    return [];
  }
}

export function saveBookmarks(gutenbergId: number, bookmarks: Bookmark[]): void {
  try {
    if (bookmarks.length === 0) {
      localStorage.removeItem(key(gutenbergId));
    } else {
      localStorage.setItem(key(gutenbergId), JSON.stringify(bookmarks));
    }
  } catch {
    // ignore
  }
}

export function makeBookmarkId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
