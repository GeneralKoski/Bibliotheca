import { useState } from "react";
import { motion } from "framer-motion";
import type { Book } from "./types";
import { useBooks } from "./hooks/useBooks";
import { BookCarousel } from "./components/BookCarousel/BookCarousel";
import { PreviewPanel } from "./components/PreviewPanel/PreviewPanel";
import { BookModal } from "./components/BookModal/BookModal";

const LOADING_PAGE_COUNT = 7;
const LOADING_PAGE_DURATION = 0.9;
const LOADING_PAGE_STAGGER = 0.18;

function LoadingScreen() {
  const cycle =
    LOADING_PAGE_DURATION + (LOADING_PAGE_COUNT - 1) * LOADING_PAGE_STAGGER;

  return (
    <div className="h-screen w-screen bg-[#0A0A0F] text-[#E8E0D0] flex flex-col items-center justify-center gap-10 overflow-hidden">
      <div style={{ perspective: "1800px" }}>
        <motion.div
          initial={{ y: 80, opacity: 0, rotateX: 18 }}
          animate={{ y: 0, opacity: 1, rotateX: 8 }}
          transition={{ duration: 1.1, ease: [0.22, 0.9, 0.25, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          <div
            className="relative flex"
            style={{
              width: 360,
              height: 240,
              transformStyle: "preserve-3d",
              filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.55))",
            }}
          >
            {/* Left half — fully-read stack */}
            <div className="relative w-1/2 h-full">
              <div
                className="absolute inset-0 rounded-l-sm"
                style={{
                  background:
                    "linear-gradient(90deg, #e5dbc3 0%, #f4ecd8 40%, #f9f2de 100%)",
                  boxShadow:
                    "inset -2px 0 4px rgba(0,0,0,0.08), inset 6px 0 10px rgba(0,0,0,0.12)",
                }}
              />
              <div
                aria-hidden
                className="absolute top-2 bottom-2 left-0 w-[3px] rounded-l-sm"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, #d9ccae 0 2px, #c6b791 2px 3px)",
                }}
              />
            </div>

            {/* Right half — source of flipping pages */}
            <div
              className="relative w-1/2 h-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute inset-0 rounded-r-sm"
                style={{
                  background:
                    "linear-gradient(-90deg, #e5dbc3 0%, #f4ecd8 40%, #f9f2de 100%)",
                  boxShadow:
                    "inset 2px 0 4px rgba(0,0,0,0.08), inset -6px 0 10px rgba(0,0,0,0.12)",
                }}
              />
              <div
                aria-hidden
                className="absolute top-2 bottom-2 right-0 w-[3px] rounded-r-sm"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, #d9ccae 0 2px, #c6b791 2px 3px)",
                }}
              />

              {/* Flipping pages: last-to-first, each rotates from +0 to -180 */}
              {Array.from({ length: LOADING_PAGE_COUNT }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-r-sm"
                  style={{
                    transformOrigin: "left center",
                    transformStyle: "preserve-3d",
                    backgroundImage:
                      "linear-gradient(90deg, rgba(0,0,0,0.08) 0%, transparent 6%, transparent 94%, rgba(0,0,0,0.05) 100%), linear-gradient(180deg, #fbf5e2 0%, #f6eecd 100%)",
                    boxShadow:
                      "0 1px 0 rgba(0,0,0,0.05), 0 8px 14px -10px rgba(0,0,0,0.3)",
                    borderLeft: "1px solid rgba(120,90,40,0.12)",
                    backfaceVisibility: "hidden",
                  }}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: [-0.01, -180] }}
                  transition={{
                    duration: LOADING_PAGE_DURATION,
                    delay: i * LOADING_PAGE_STAGGER,
                    repeat: Infinity,
                    repeatDelay: cycle - LOADING_PAGE_DURATION,
                    ease: [0.45, 0.05, 0.55, 0.95],
                  }}
                />
              ))}

              {/* Spine shadow / gutter */}
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 w-3 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 100%)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

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
  const { books, loading } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [openBook, setOpenBook] = useState<Book | null>(null);

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
        onFocus={setSelectedBook}
        onOpen={setOpenBook}
      />
      <PreviewPanel book={selectedBook} onOpen={setOpenBook} />
      {openBook && (
        <BookModal book={openBook} onClose={() => setOpenBook(null)} />
      )}
    </div>
  );
}

export default App;
