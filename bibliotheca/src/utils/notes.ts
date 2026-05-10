const KEY_PREFIX = "bibliotheca:notes:";

export interface BookNote {
  id: string;
  pageIndex: number;
  text: string;
  quote?: string;
  createdAt: number;
}

function key(gutenbergId: number) {
  return `${KEY_PREFIX}${gutenbergId}`;
}

export function loadNotes(gutenbergId: number): BookNote[] {
  try {
    const raw = localStorage.getItem(key(gutenbergId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is BookNote =>
        n &&
        typeof n.id === "string" &&
        typeof n.pageIndex === "number" &&
        typeof n.text === "string" &&
        typeof n.createdAt === "number"
    );
  } catch {
    return [];
  }
}

export function saveNotes(gutenbergId: number, notes: BookNote[]): void {
  try {
    if (notes.length === 0) {
      localStorage.removeItem(key(gutenbergId));
    } else {
      localStorage.setItem(key(gutenbergId), JSON.stringify(notes));
    }
  } catch {
    // ignore
  }
}

export function makeNoteId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

