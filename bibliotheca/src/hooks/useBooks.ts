import { useEffect, useState } from "react";
import type { Book } from "../types";
import { books as seed } from "../data/books";
import { hydrateBooks } from "../data/hydrateBooks";

export function useBooks(): { books: Book[]; loading: boolean } {
  const [books, setBooks] = useState<Book[]>(seed);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    hydrateBooks(seed, controller.signal)
      .then((hydrated) => {
        setBooks(hydrated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return { books, loading };
}
