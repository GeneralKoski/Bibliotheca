import type { Book } from "../types";

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
  subject?: string[];
}

interface OpenLibraryResponse {
  docs?: OpenLibraryDoc[];
}

const OPEN_LIBRARY_ENABLED = import.meta.env.VITE_ENABLE_OPENLIBRARY === "true";

export async function hydrateBook(
  book: Book,
  signal: AbortSignal
): Promise<Book> {
  if (!OPEN_LIBRARY_ENABLED) {
    return book;
  }

  const url = `/api/openlibrary/search?q=${encodeURIComponent(
    `${book.title} ${book.author}`
  )}`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return book;
    const data: OpenLibraryResponse = await res.json();
    const doc = data.docs?.[0];
    if (!doc) return book;

    return {
      ...book,
      title: doc.title ?? book.title,
      author: doc.author_name?.[0] ?? book.author,
      year: doc.first_publish_year ?? book.year,
      pages: doc.number_of_pages_median ?? book.pages,
      tags: doc.subject?.slice(0, 4) ?? book.tags,
      coverId: doc.cover_i ?? null,
    };
  } catch {
    return book;
  }
}
