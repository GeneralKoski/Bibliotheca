import type { Book } from "../../types";

interface BookCarouselProps {
  books: Book[];
  onFocus: (book: Book | null) => void;
  onOpen: (book: Book) => void;
}

export function BookCarousel(_props: BookCarouselProps) {
  return null;
}
