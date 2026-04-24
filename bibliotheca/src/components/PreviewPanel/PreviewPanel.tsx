import { AnimatePresence, motion } from "framer-motion";
import type { Book } from "../../types";

interface PreviewPanelProps {
  book: Book | null;
  onOpen: (book: Book) => void;
}

function Stars({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let fill = 0;
    if (rating >= i) fill = 1;
    else if (rating > i - 1) fill = rating - (i - 1);
    stars.push(
      <span key={i} className="relative inline-block w-4 h-4 mr-0.5">
        <span className="absolute inset-0 text-[#3a332a]">★</span>
        <span
          className="absolute inset-0 text-[#C9A96E] overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          ★
        </span>
      </span>
    );
  }
  return <div className="flex items-center">{stars}</div>;
}

export function PreviewPanel({ book, onOpen }: PreviewPanelProps) {
  return (
    <div
      className="absolute top-0 right-0 w-[45%] h-[55%] pointer-events-none md:block hidden"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {book && (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full p-8 pointer-events-auto backdrop-blur-md bg-black/40 border border-white/10 rounded-bl-3xl flex flex-col gap-4"
            style={{
              boxShadow: `inset 1px 1px 0 rgba(255,255,255,0.04), 0 20px 60px -20px ${book.color}80`,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] rounded-full border"
                style={{
                  borderColor: book.color,
                  color: "#E8E0D0",
                  backgroundColor: `${book.color}30`,
                }}
              >
                {book.category}
              </span>
              <div className="flex items-center gap-2">
                <Stars rating={book.rating} />
                <span className="text-xs text-[#C9A96E]">
                  {book.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <h2 className="font-display text-[32px] leading-tight text-[#E8E0D0]">
              {book.title}
            </h2>
            <p className="text-[#C9A96E] text-sm uppercase tracking-[0.2em]">
              {book.author} · {book.year}
            </p>

            <p className="text-sm text-[#cdc5b5] leading-relaxed line-clamp-3">
              {book.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {book.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full bg-white/5 text-[#cdc5b5] border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-end justify-between">
              <span className="text-xs text-[#9a9286]">
                {book.pages} pages
              </span>
              <button
                type="button"
                aria-label={`Open ${book.title}`}
                onClick={() => onOpen(book)}
                className="group relative px-5 py-2.5 rounded-full border border-[#C9A96E]/60 text-[#C9A96E] text-xs uppercase tracking-[0.25em] transition-all hover:bg-[#C9A96E] hover:text-[#0A0A0F] hover:shadow-[0_0_24px_rgba(201,169,110,0.5)]"
              >
                Open Book
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
