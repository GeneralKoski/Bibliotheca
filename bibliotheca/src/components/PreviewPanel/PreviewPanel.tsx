import { AnimatePresence, motion } from "framer-motion";
import type { Book } from "../../types";

interface PreviewPanelProps {
  book: Book | null;
  onOpen: (book: Book) => void;
}

function Stars({ rating, color }: { rating: number; color: string }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let fill = 0;
    if (rating >= i) fill = 1;
    else if (rating > i - 1) fill = rating - (i - 1);
    stars.push(
      <span
        key={i}
        className="relative inline-block w-[14px] h-[14px] mr-0.5 leading-none text-[14px]"
      >
        <span className="absolute inset-0 flex items-center justify-center text-[#3a332a]">
          ★
        </span>
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          <span
            className="absolute inset-0 w-[14px] flex items-center justify-center"
            style={{ color }}
          >
            ★
          </span>
        </span>
      </span>
    );
  }
  return <div className="flex items-center">{stars}</div>;
}

export function PreviewPanel({ book, onOpen }: PreviewPanelProps) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 max-h-[58%] md:inset-auto md:top-6 md:left-6 md:bottom-auto md:max-h-[calc(100vh-3rem)] md:w-[400px] pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {book && (
          <motion.aside
            key={book.id}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full p-7 md:p-7 pointer-events-auto backdrop-blur-2xl rounded-t-3xl md:rounded-2xl flex flex-col gap-5 overflow-y-auto"
            style={{
              background: `linear-gradient(160deg, ${book.color}1f 0%, rgba(10,10,15,0.78) 42%, rgba(10,10,15,0.86) 100%)`,
              border: `1px solid ${book.color}33`,
              boxShadow: `0 30px 80px -28px ${book.color}66, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <span
              aria-hidden
              className="absolute left-0 top-10 bottom-10 w-[2px] rounded-full opacity-80"
              style={{
                background: `linear-gradient(180deg, transparent, ${book.color}, transparent)`,
              }}
            />

            <div className="flex items-center justify-between">
              <span
                className="px-3 py-1 text-[10px] uppercase tracking-[0.22em] rounded-full"
                style={{
                  color: book.color,
                  backgroundColor: `${book.color}1a`,
                  border: `1px solid ${book.color}40`,
                }}
              >
                {book.category}
              </span>
              <div className="flex items-center gap-2">
                <Stars rating={book.rating} color={book.color} />
                <span className="text-[11px] text-[#cdc5b5]">
                  {book.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div>
              <h2 className="font-display text-[28px] md:text-[32px] leading-[1.08] text-[#F2EBDA]">
                {book.title}
              </h2>
              <p className="mt-2 text-[#9a9286] text-[11px] uppercase tracking-[0.28em]">
                {book.author}
                <span className="text-[#5a5347] mx-2">·</span>
                {book.year}
              </p>
            </div>

            <p className="text-[13px] text-[#cdc5b5] leading-relaxed line-clamp-3">
              {book.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {book.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] rounded-full bg-white/[0.03] text-[#8e877b] border border-white/[0.06]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#5a5347]">
                {book.pages} pages
              </span>
              <button
                type="button"
                aria-label={`Open ${book.title}`}
                onClick={() => onOpen(book)}
                className="group relative px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.25em] transition-colors duration-300"
                style={{
                  color: book.color,
                  border: `1px solid ${book.color}80`,
                }}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#0A0A0F]">
                  Open Book
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: book.color,
                    boxShadow: `0 0 28px ${book.color}80`,
                  }}
                />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
