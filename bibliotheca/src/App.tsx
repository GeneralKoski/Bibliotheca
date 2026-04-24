import { useState } from "react";
import type { Book } from "./types";
import { useBooks } from "./hooks/useBooks";
import { BookCarousel } from "./components/BookCarousel/BookCarousel";
import { PreviewPanel } from "./components/PreviewPanel/PreviewPanel";
import { BookModal } from "./components/BookModal/BookModal";

function App() {
  const { books, loading } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [openBook, setOpenBook] = useState<Book | null>(null);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0A0A0F] text-[#E8E0D0] flex flex-col items-center justify-center gap-4">
        <h1 className="font-display text-5xl tracking-wide">Bibliotheca</h1>
        <p className="text-[#C9A96E] text-sm uppercase tracking-[0.3em] animate-pulse">
          Curating the shelves…
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0A0F] text-[#E8E0D0] relative">
      <BookCarousel
        books={books}
        onFocus={setSelectedBook}
        onOpen={setOpenBook}
      />
      <PreviewPanel book={selectedBook} onOpen={setOpenBook} />
      {openBook && (
        <BookModal
          book={openBook}
          onClose={() => setOpenBook(null)}
        />
      )}
    </div>
  );
}

export default App;
