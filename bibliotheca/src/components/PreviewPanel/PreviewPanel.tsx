import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { Book } from "../../types";

interface PreviewPanelProps {
  book: Book | null;
  onOpen: (book: Book) => void;
}

const containerVariants: Variants = {
  hidden: {
    transition: { staggerChildren: 0.025, staggerDirection: -1 },
  },
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function Stars({ rating, color }: { rating: number; color: string }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let fill = 0;
    if (rating >= i) fill = 1;
    else if (rating > i - 1) fill = rating - (i - 1);
    stars.push(
      <span
        key={i}
        className="relative inline-block w-[11px] h-[11px] mr-[2px] leading-none text-[11px]"
      >
        <span className="absolute inset-0 flex items-center justify-center text-[#2a2521]">
          ★
        </span>
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${fill * 100}%` }}
        >
          <span
            className="absolute inset-0 w-[11px] flex items-center justify-center"
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
      className="absolute inset-x-0 bottom-0 px-6 pb-7 max-h-[58%] md:inset-auto md:top-28 md:left-10 md:bottom-auto md:max-h-[calc(58vh-7rem)] md:overflow-hidden md:w-[440px] md:px-0 md:pb-0 pointer-events-none"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="hidden md:block absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 95% 90% at 28% 38%, rgba(8,8,12,0.82), rgba(8,8,12,0.5) 35%, transparent 72%)`,
        }}
      />
      <AnimatePresence mode="wait">
        {book && (
          <motion.aside
            key={book.id}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
            className="relative z-10 w-full pointer-events-auto flex flex-col gap-5"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              <span
                aria-hidden
                className="block h-[1px] w-8"
                style={{ background: book.color }}
              />
              <span className="text-[9px] uppercase tracking-[0.42em] text-[#7a7164]">
                From the collection
              </span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="font-display text-[40px] md:text-[48px] leading-[0.98] text-[#F2EBDA] -ml-[2px] line-clamp-2"
              style={{
                textShadow: `0 0 60px ${book.color}33`,
              }}
            >
              {book.title}
            </motion.h2>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.32em]"
            >
              <span className="text-[#E8E0D0]">{book.author}</span>
              <span className="text-[#3a332a]">·</span>
              <span style={{ color: book.color }}>{book.year}</span>
              <span className="text-[#3a332a]">·</span>
              <span className="text-[#9a9286]">{book.category}</span>
            </motion.div>

            <motion.span
              variants={itemVariants}
              aria-hidden
              className="block h-[1px] w-24"
              style={{
                background: `linear-gradient(90deg, ${book.color}, transparent)`,
              }}
            />

            <motion.p
              variants={itemVariants}
              className="font-display italic text-[15px] text-[#cdc5b5] leading-[1.6] line-clamp-3 max-w-[42ch] relative pl-5"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 font-display not-italic text-[44px] leading-none"
                style={{ color: `${book.color}66`, fontFamily: "Playfair Display, serif" }}
              >
                "
              </span>
              {book.description}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#7a7164]"
            >
              <Stars rating={book.rating} color={book.color} />
              <span style={{ color: book.color }}>
                {book.rating.toFixed(1)}
              </span>
              <span className="text-[#3a332a]">·</span>
              <span>{book.pages} pages</span>
              <span className="text-[#3a332a]">·</span>
              <span className="truncate">
                {book.tags.slice(0, 2).join(" / ")}
              </span>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="button"
              aria-label={`Open ${book.title}`}
              onClick={() => onOpen(book)}
              className="group self-start mt-2 flex items-center gap-3 text-[11px] uppercase tracking-[0.34em] py-1"
              style={{ color: book.color }}
            >
              <span className="relative inline-block">
                Open volume
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-500 group-hover:scale-x-[1.4]"
                  style={{ background: book.color }}
                />
              </span>
              <motion.span
                aria-hidden
                animate={{ x: [0, 5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
                className="text-[14px]"
              >
                →
              </motion.span>
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
