import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Book } from "../../types";
import { generateCoverTexture } from "../../utils/generateCover";

interface GridViewProps {
  books: Book[];
  onOpen: (book: Book) => void;
}

export function GridView({ books, onOpen }: GridViewProps) {
  return (
    <div className="absolute inset-0 z-10 overflow-y-auto pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
        {books.map((book, idx) => (
          <GridCard
            key={book.id}
            book={book}
            index={idx}
            onOpen={() => onOpen(book)}
          />
        ))}
      </div>
    </div>
  );
}

function GridCard({
  book,
  index,
  onOpen,
}: {
  book: Book;
  index: number;
  onOpen: () => void;
}) {
  const proceduralUrl = useMemo(
    () => generateCoverTexture(book).toDataURL("image/png"),
    [book]
  );
  const [src, setSrc] = useState(
    book.coverId != null
      ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
      : proceduralUrl
  );

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index, 20) * 0.025,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex flex-col gap-3 text-left"
    >
      <div
        className="relative aspect-[2/3] rounded-sm overflow-hidden shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:-translate-y-1"
        style={{ backgroundColor: book.color }}
      >
        <img
          src={src}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setSrc(proceduralUrl)}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(180deg, transparent 50%, ${book.color}55 100%)`,
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span
          className="text-[9px] uppercase tracking-[0.3em]"
          style={{ color: book.color }}
        >
          {book.category}
        </span>
        <h3 className="font-display text-[16px] leading-tight text-[#E8E0D0] line-clamp-2">
          {book.title}
        </h3>
        <span className="text-[10px] uppercase tracking-[0.24em] text-[#9a9286] truncate">
          {book.author}
        </span>
      </div>
    </motion.button>
  );
}
