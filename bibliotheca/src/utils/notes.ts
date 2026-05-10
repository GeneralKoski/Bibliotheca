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

export function notesToMarkdown(
  bookTitle: string,
  bookAuthor: string,
  notes: BookNote[]
): string {
  const lines: string[] = [];
  lines.push(`# Notes — ${bookTitle}`);
  lines.push(`*${bookAuthor}*`);
  lines.push("");
  if (notes.length === 0) {
    lines.push("_No notes yet._");
    return lines.join("\n");
  }
  const sorted = [...notes].sort((a, b) => a.pageIndex - b.pageIndex);
  for (const n of sorted) {
    lines.push(`## Page ${n.pageIndex + 1}`);
    lines.push("");
    if (n.quote) {
      const quoted = n.quote
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n");
      lines.push(quoted);
      lines.push("");
    }
    lines.push(n.text);
    lines.push("");
    lines.push(`*${new Date(n.createdAt).toLocaleString()}*`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  return lines.join("\n");
}

export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
