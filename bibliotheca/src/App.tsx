import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useBooks } from "./hooks/useBooks";
import { BookCarousel } from "./components/BookCarousel/BookCarousel";
import { PreviewPanel } from "./components/PreviewPanel/PreviewPanel";
import { BookModal } from "./components/BookModal/BookModal";
import { FlippingBookLoader } from "./components/FlippingBookLoader";

function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-[#0A0A0F] text-[#E8E0D0] flex flex-col items-center justify-center gap-10 overflow-hidden">
      <FlippingBookLoader />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="flex flex-col items-center gap-2"
      >
        <h1 className="font-display text-4xl tracking-wide">Bibliotheca</h1>
        <span className="h-[1px] w-16 bg-[#C9A96E]/40" />
      </motion.div>
    </div>
  );
}

function App() {
  const { books, loading, hydrateBookById } = useBooks();
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [openBookId, setOpenBookId] = useState<number | null>(null);

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) ?? null,
    [books, selectedBookId]
  );
  const openBook = useMemo(
    () => books.find((book) => book.id === openBookId) ?? null,
    [books, openBookId]
  );

  useEffect(() => {
    if (selectedBookId != null) {
      hydrateBookById(selectedBookId);
    }
  }, [selectedBookId, hydrateBookById]);

  useEffect(() => {
    if (openBookId != null) {
      hydrateBookById(openBookId);
    }
  }, [openBookId, hydrateBookById]);

  if (loading) {
    return <LoadingScreen />;
  }

  const tintColor = selectedBook?.color ?? "#0A0A0F";

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0A0F] text-[#E8E0D0] relative">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-[background] duration-700"
        style={{
          background: `radial-gradient(120% 80% at 30% 60%, ${tintColor}22 0%, transparent 55%)`,
        }}
      />
      <BookCarousel
        books={books}
        onFocus={(book) => setSelectedBookId(book?.id ?? null)}
        onOpen={(book) => setOpenBookId(book.id)}
      />
      <PreviewPanel book={selectedBook} onOpen={(book) => setOpenBookId(book.id)} />
      {openBook && (
        <BookModal book={openBook} onClose={() => setOpenBookId(null)} />
      )}
    </div>
  );
}

export default App;
