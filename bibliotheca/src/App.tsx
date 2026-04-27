import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBooks } from "./hooks/useBooks";
import { BookCarousel } from "./components/BookCarousel/BookCarousel";
import { PreviewPanel } from "./components/PreviewPanel/PreviewPanel";
import { BookModal } from "./components/BookModal/BookModal";
import { FlippingBookLoader } from "./components/FlippingBookLoader";
import type { Book } from "./types";

function TopBar({
  total,
  focusedIndex,
  focusedBook,
}: {
  total: number;
  focusedIndex: number;
  focusedBook: Book | null;
}) {
  const tint = focusedBook?.color ?? "#C9A96E";
  const display = total === 0 ? 0 : focusedIndex + 1;
  const totalPad = String(total).padStart(2, "0");
  const displayPad = String(display).padStart(2, "0");

  return (
    <>
      <div className="hidden lg:flex absolute top-7 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex-col items-center gap-2">
        <span className="font-display text-[15px] tracking-[0.55em] text-[#E8E0D0]">
          BIBLIOTHECA
        </span>
        <motion.span
          aria-hidden
          className="block h-[1px] w-14"
          animate={{
            background: `linear-gradient(90deg, transparent, ${tint}, transparent)`,
          }}
          transition={{ duration: 0.5 }}
        />
        <span className="font-display italic text-[10px] tracking-[0.18em] text-[#5a5347]">
          a curated reading sanctuary
        </span>
      </div>

      <div className="absolute top-6 md:top-28 right-6 md:right-10 z-10 pointer-events-none flex flex-col items-end gap-1.5">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#5a5347]">
          Volume
        </span>
        <div className="flex items-baseline gap-2 font-display tabular-nums">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={displayPad}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="text-[36px] leading-none"
              style={{ color: tint }}
            >
              {displayPad}
            </motion.span>
          </AnimatePresence>
          <span className="text-[#3a332a] text-[22px] leading-none">/</span>
          <span className="text-[22px] leading-none text-[#9a9286]">
            {totalPad}
          </span>
        </div>
        <span className="hidden md:inline-block mt-1 text-[9px] uppercase tracking-[0.32em] text-[#5a5347]">
          scroll · drag · ← →
        </span>
      </div>
    </>
  );
}

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
  const focusedIndex = useMemo(() => {
    if (selectedBookId == null) return 0;
    const i = books.findIndex((book) => book.id === selectedBookId);
    return i === -1 ? 0 : i;
  }, [books, selectedBookId]);

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
      <TopBar
        total={books.length}
        focusedIndex={focusedIndex}
        focusedBook={selectedBook}
      />
      <PreviewPanel book={selectedBook} onOpen={(book) => setOpenBookId(book.id)} />
      {openBook && (
        <BookModal book={openBook} onClose={() => setOpenBookId(null)} />
      )}
    </div>
  );
}

export default App;
