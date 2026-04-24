import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Book } from "../../types";
import { generateCoverTexture } from "../../utils/generateCover";
import { BookReader } from "./BookReader/BookReader";

interface BookModalProps {
  book: Book;
  onClose: () => void;
}

export function BookModal({ book, onClose }: BookModalProps) {
  const [isReading, setIsReading] = useState(false);

  const proceduralDataUrl = useMemo(() => {
    return generateCoverTexture(book).toDataURL("image/png");
  }, [book]);

  const [coverSrc, setCoverSrc] = useState<string>(
    book.coverId != null
      ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`
      : proceduralDataUrl
  );

  useEffect(() => {
    setCoverSrc(
      book.coverId != null
        ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`
        : proceduralDataUrl
    );
  }, [book.coverId, proceduralDataUrl]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isReading) setIsReading(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isReading, onClose]);

  // Focus trap: keep Tab inside the modal
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isReading) return;
    const node = contentRef.current;
    if (!node) return;
    const prevActive = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      prevActive?.focus?.();
    };
  }, [isReading]);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-xl bg-black/75"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${book.title}`}
      >
        {!isReading && (
          <motion.div
            key="content"
            ref={contentRef}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-[92%] max-w-5xl max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-[#15141c] to-[#0e0d14] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full border border-white/10 bg-black/40 text-[#E8E0D0] hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              ×
            </button>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 p-10">
              <div className="md:col-span-2 flex flex-col items-center gap-6">
                <div
                  className="w-full aspect-[2/3] rounded-md overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
                  style={{ backgroundColor: book.color }}
                >
                  <img
                    src={coverSrc}
                    alt={`Cover of ${book.title}`}
                    className="w-full h-full object-cover"
                    onError={() => setCoverSrc(proceduralDataUrl)}
                  />
                </div>
                <div className="w-full space-y-2 text-xs text-[#cdc5b5]">
                  <Row label="Pages" value={String(book.pages)} />
                  <Row label="Year" value={String(book.year)} />
                  <Row label="Language" value="English" />
                  <Row label="License" value="Public Domain" />
                  <Row label="Rating" value={`${book.rating.toFixed(1)} / 5`} />
                </div>
              </div>

              <div className="md:col-span-3 flex flex-col gap-5">
                <span
                  className="self-start px-3 py-1 text-[10px] uppercase tracking-[0.2em] rounded-full border"
                  style={{
                    borderColor: book.color,
                    color: "#E8E0D0",
                    backgroundColor: `${book.color}30`,
                  }}
                >
                  {book.category}
                </span>
                <h2 className="font-display text-4xl md:text-5xl leading-tight">
                  {book.title}
                </h2>
                <p className="text-[#C9A96E] text-sm uppercase tracking-[0.25em]">
                  {book.author}
                </p>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full bg-white/5 text-[#cdc5b5] border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-[#cdc5b5] leading-relaxed text-[15px]">
                  {book.longDescription}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-4 pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsReading(true)}
                    aria-label={`Read ${book.title}`}
                    className="px-7 py-3 rounded-full bg-[#C9A96E] text-[#0A0A0F] text-xs uppercase tracking-[0.25em] font-medium transition-all hover:shadow-[0_0_32px_rgba(201,169,110,0.6)] hover:-translate-y-0.5"
                  >
                    Sfoglia il libro →
                  </button>
                  <a
                    href={`https://www.gutenberg.org/ebooks/${book.gutenbergId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs uppercase tracking-[0.2em] text-[#9a9286] hover:text-[#C9A96E] transition-colors"
                  >
                    View on Project Gutenberg
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {isReading && (
          <BookReader book={book} onClose={() => setIsReading(false)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-1">
      <span className="uppercase tracking-[0.15em] text-[#8a8272]">{label}</span>
      <span className="text-[#E8E0D0]">{value}</span>
    </div>
  );
}
