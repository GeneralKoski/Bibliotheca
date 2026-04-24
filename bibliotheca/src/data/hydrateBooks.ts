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

const SEARCH_URL = "https://openlibrary.org/search.json";
const FIELDS =
  "key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject";

async function hydrateOne(
  book: Book,
  signal: AbortSignal
): Promise<Book> {
  const url = `${SEARCH_URL}?q=${encodeURIComponent(
    `${book.title} ${book.author}`
  )}&fields=${FIELDS}&limit=1`;

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

export async function hydrateBooks(
  seed: Book[],
  signal: AbortSignal
): Promise<Book[]> {
  return Promise.all(seed.map((book) => hydrateOne(book, signal)));
}
