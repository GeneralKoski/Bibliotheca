import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBooks } from "./hooks/useBooks";
import { BookCarousel } from "./components/BookCarousel/BookCarousel";
import { PreviewPanel } from "./components/PreviewPanel/PreviewPanel";
import { BookModal } from "./components/BookModal/BookModal";
import { FlippingBookLoader } from "./components/FlippingBookLoader";
import type { Book } from "./types";

interface CategoryEntry {
  name: string;
  count: number;
}

function CategorySelect({
  categories,
  value,
  onChange,
  totalCount,
}: {
  categories: CategoryEntry[];
  value: string | null;
  onChange: (v: string | null) => void;
  totalCount: number;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative pointer-events-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#cdc5b5] py-2 px-1 border-b border-[#3a332a] hover:border-[#9a9286] focus-visible:border-[#C9A96E] outline-none transition-colors min-w-[180px]"
      >
        <span className="flex-1 text-left truncate">
          {value ?? "All categories"}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[8px] text-[#9a9286]"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            data-scroll-allow
            className="absolute top-full mt-3 left-0 max-h-[55vh] overflow-y-auto bg-[#0A0A0F]/95 backdrop-blur-xl border border-[#3a332a] rounded-lg py-2 min-w-[260px] z-50 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
          >
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-white/[0.04] transition-colors flex items-center justify-between ${
                value === null ? "text-[#C9A96E]" : "text-[#cdc5b5]"
              }`}
            >
              <span>All categories</span>
              <span className="text-[#5a5347] text-[9px] tabular-nums">
                {totalCount}
              </span>
            </button>
            <div className="my-1 mx-3 h-px bg-[#3a332a]" />
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  onChange(cat.name);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-white/[0.04] transition-colors flex items-center justify-between ${
                  value === cat.name ? "text-[#C9A96E]" : "text-[#cdc5b5]"
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[#5a5347] text-[9px] tabular-nums">
                  {cat.count}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchFilter({
  searchQuery,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  totalCount,
}: {
  searchQuery: string;
  onSearchChange: (s: string) => void;
  categories: CategoryEntry[];
  activeCategory: string | null;
  onCategoryChange: (v: string | null) => void;
  totalCount: number;
}) {
  return (
    <div className="hidden md:flex absolute top-20 left-1/2 -translate-x-1/2 z-20 items-center gap-6 pointer-events-none">
      <div className="relative pointer-events-auto">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="search the collection"
          className="bg-transparent text-[#cdc5b5] text-[10px] uppercase tracking-[0.32em] w-[280px] py-2 pl-1 pr-7 outline-none border-b border-[#3a332a] focus:border-[#9a9286] transition-colors placeholder:text-[#5a5347]"
        />
        <span
          aria-hidden
          className="absolute right-1 top-1/2 -translate-y-1/2 text-[#5a5347] text-[13px] pointer-events-none"
        >
          ⌕
        </span>
      </div>
      <span aria-hidden className="h-3 w-px bg-[#3a332a]" />
      <CategorySelect
        categories={categories}
        value={activeCategory}
        onChange={onCategoryChange}
        totalCount={totalCount}
      />
    </div>
  );
}

function EmptyState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
    >
      <div className="text-center pointer-events-auto">
        <p className="font-display italic text-[36px] text-[#cdc5b5] mb-3">
          no volumes found
        </p>
        <p className="text-[10px] uppercase tracking-[0.34em] text-[#5a5347] mb-7">
          this corner of the library is empty
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] uppercase tracking-[0.34em] text-[#C9A96E] hover:text-[#E8E0D0] transition-colors flex items-center gap-2 mx-auto"
        >
          <span>clear filters</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </motion.div>
  );
}

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
      <div className="hidden lg:flex absolute top-7 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex-col items-center gap-1.5">
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
      </div>

      <div className="absolute top-6 md:top-32 right-6 md:right-10 z-10 pointer-events-none flex flex-col items-end gap-1.5">
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo<CategoryEntry[]>(() => {
    const counts = new Map<string, number>();
    for (const b of books) {
      counts.set(b.category, (counts.get(b.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [books]);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (activeCategory) {
      result = result.filter((b) => b.category === activeCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [books, activeCategory, searchQuery]);

  const selectedBook = useMemo(
    () => filteredBooks.find((book) => book.id === selectedBookId) ?? null,
    [filteredBooks, selectedBookId]
  );
  const openBook = useMemo(
    () => books.find((book) => book.id === openBookId) ?? null,
    [books, openBookId]
  );
  const focusedIndex = useMemo(() => {
    if (selectedBookId == null) return 0;
    const i = filteredBooks.findIndex((book) => book.id === selectedBookId);
    return i === -1 ? 0 : i;
  }, [filteredBooks, selectedBookId]);

  useEffect(() => {
    if (selectedBookId == null) return;
    if (!filteredBooks.some((b) => b.id === selectedBookId)) {
      setSelectedBookId(filteredBooks[0]?.id ?? null);
    }
  }, [filteredBooks, selectedBookId]);

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
  const isEmpty = filteredBooks.length === 0;

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
        books={filteredBooks}
        onFocus={(book) => setSelectedBookId(book?.id ?? null)}
        onOpen={(book) => setOpenBookId(book.id)}
      />
      <TopBar
        total={filteredBooks.length}
        focusedIndex={focusedIndex}
        focusedBook={selectedBook}
      />
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        totalCount={books.length}
      />
      {!isEmpty && (
        <PreviewPanel
          book={selectedBook}
          onOpen={(book) => setOpenBookId(book.id)}
        />
      )}
      {isEmpty && (
        <EmptyState
          onClear={() => {
            setSearchQuery("");
            setActiveCategory(null);
          }}
        />
      )}
      {openBook && (
        <BookModal book={openBook} onClose={() => setOpenBookId(null)} />
      )}
    </div>
  );
}

export default App;
