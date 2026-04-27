import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "../types";
import { books as seed } from "../data/books";
import { hydrateBook } from "../data/hydrateBooks";

export function useBooks(): {
  books: Book[];
  loading: boolean;
  hydrateBookById: (bookId: number) => void;
} {
  const [books, setBooks] = useState<Book[]>(seed);
  const booksRef = useRef(books);
  const hydratedIdsRef = useRef(new Set<number>());
  const inFlightRef = useRef(new Map<number, AbortController>());

  useEffect(() => {
    booksRef.current = books;
  }, [books]);

  const hydrateBookById = useCallback((bookId: number) => {
    if (hydratedIdsRef.current.has(bookId) || inFlightRef.current.has(bookId)) {
      return;
    }

    const book = booksRef.current.find((entry) => entry.id === bookId);
    if (!book) return;

    const controller = new AbortController();
    inFlightRef.current.set(bookId, controller);

    hydrateBook(book, controller.signal)
      .then((hydrated) => {
        hydratedIdsRef.current.add(bookId);
        setBooks((current) =>
          current.map((entry) => (entry.id === bookId ? hydrated : entry))
        );
      })
      .finally(() => {
        inFlightRef.current.delete(bookId);
      });
  }, []);

  useEffect(() => {
    const inFlight = inFlightRef.current;

    return () => {
      for (const controller of inFlight.values()) {
        controller.abort();
      }
      inFlight.clear();
    };
  }, []);

  return { books, loading: false, hydrateBookById };
}
