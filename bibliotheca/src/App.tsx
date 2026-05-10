import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBooks } from "./hooks/useBooks";
import { useLibraryStatus } from "./hooks/useLibraryStatus";
import { usePersonalRatings } from "./hooks/usePersonalRatings";
import { BookCarousel } from "./components/BookCarousel/BookCarousel";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GridView } from "./components/GridView/GridView";
import { PreviewPanel } from "./components/PreviewPanel/PreviewPanel";
import { BookModal } from "./components/BookModal/BookModal";
import { FlippingBookLoader } from "./components/FlippingBookLoader";
import type { Book } from "./types";
import { loadLastOpened, saveLastOpened } from "./utils/lastOpened";
import { type BookStatus, STATUS_LABELS, STATUS_ORDER } from "./utils/library";

type SortMode =
  | "default"
  | "year-desc"
  | "year-asc"
  | "author"
  | "rating"
  | "last-opened";

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "year-desc", label: "Year ↓" },
  { id: "year-asc", label: "Year ↑" },
  { id: "author", label: "Author A–Z" },
  { id: "rating", label: "My rating" },
  { id: "last-opened", label: "Last opened" },
];

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

function SortSelect({
  value,
  onChange,
}: {
  value: SortMode;
  onChange: (v: SortMode) => void;
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

  const current = SORT_OPTIONS.find((o) => o.id === value) ?? SORT_OPTIONS[0];

  return (
    <div ref={wrapRef} className="relative pointer-events-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#cdc5b5] py-2 px-1 border-b border-[#3a332a] hover:border-[#9a9286] focus-visible:border-[#C9A96E] outline-none transition-colors min-w-[150px]"
      >
        <span className="flex-1 text-left truncate">Sort · {current.label}</span>
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
            className="absolute top-full mt-3 left-0 bg-[#0A0A0F]/95 backdrop-blur-xl border border-[#3a332a] rounded-lg py-2 min-w-[200px] z-50 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-white/[0.04] transition-colors ${
                  value === opt.id ? "text-[#C9A96E]" : "text-[#cdc5b5]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusFilter({
  active,
  counts,
  onChange,
}: {
  active: BookStatus | null;
  counts: Record<BookStatus, number>;
  onChange: (v: BookStatus | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 pointer-events-auto">
      {STATUS_ORDER.map((s) => {
        const isActive = active === s;
        const count = counts[s] ?? 0;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(isActive ? null : s)}
            aria-pressed={isActive}
            disabled={count === 0 && !isActive}
            className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.28em] border transition-colors ${
              isActive
                ? "border-[#C9A96E] text-[#0A0A0F] bg-[#C9A96E]"
                : count === 0
                ? "border-[#3a332a]/50 text-[#5a5347]/50 cursor-not-allowed"
                : "border-[#3a332a] text-[#9a9286] hover:text-[#cdc5b5] hover:border-[#9a9286]"
            }`}
          >
            <span>{STATUS_LABELS[s]}</span>
            <span className="ml-2 tabular-nums opacity-70">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (s: string) => void;
  categories: CategoryEntry[];
  activeCategory: string | null;
  onCategoryChange: (v: string | null) => void;
  totalCount: number;
  statusFilter: BookStatus | null;
  statusCounts: Record<BookStatus, number>;
  onStatusChange: (v: BookStatus | null) => void;
  sortMode: SortMode;
  onSortChange: (v: SortMode) => void;
}

function SearchFilter(props: SearchFilterProps) {
  return (
    <div className="hidden md:flex absolute top-20 left-1/2 -translate-x-1/2 z-20 items-center gap-6 pointer-events-none">
      <div className="relative pointer-events-auto">
        <input
          type="search"
          value={props.searchQuery}
          onChange={(e) => props.onSearchChange(e.target.value)}
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
        categories={props.categories}
        value={props.activeCategory}
        onChange={props.onCategoryChange}
        totalCount={props.totalCount}
      />
      <span aria-hidden className="h-3 w-px bg-[#3a332a]" />
      <StatusFilter
        active={props.statusFilter}
        counts={props.statusCounts}
        onChange={props.onStatusChange}
      />
      <span aria-hidden className="h-3 w-px bg-[#3a332a]" />
      <SortSelect value={props.sortMode} onChange={props.onSortChange} />
    </div>
  );
}

function MobileFilters(props: SearchFilterProps) {
  const [open, setOpen] = useState(false);
  const activeCount =
    (props.searchQuery.trim() ? 1 : 0) +
    (props.activeCategory ? 1 : 0) +
    (props.statusFilter ? 1 : 0) +
    (props.sortMode !== "default" ? 1 : 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open filters"
        className="md:hidden absolute top-5 left-5 z-20 h-10 px-4 rounded-full border border-[#3a332a] bg-black/40 backdrop-blur text-[#cdc5b5] flex items-center gap-2 text-[10px] uppercase tracking-[0.28em]"
      >
        <span aria-hidden>⌕</span>
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C9A96E] text-[#0A0A0F] text-[9px] tabular-nums">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              key="sheet"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="absolute top-0 inset-x-0 bg-[#0A0A0F]/98 backdrop-blur-xl border-b border-[#3a332a] p-6 pt-7 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[20px] tracking-wide text-[#E8E0D0]">
                  Filters
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="w-9 h-9 rounded-full border border-white/10 text-[#cdc5b5] hover:bg-white/5 transition-colors"
                >
                  ×
                </button>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.32em] text-[#5a5347]">
                  Search
                </span>
                <input
                  type="search"
                  autoFocus
                  value={props.searchQuery}
                  onChange={(e) => props.onSearchChange(e.target.value)}
                  placeholder="title, author, tag…"
                  className="bg-transparent text-[#E8E0D0] text-[14px] py-2 outline-none border-b border-[#3a332a] focus:border-[#C9A96E] transition-colors placeholder:text-[#5a5347]"
                />
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.32em] text-[#5a5347]">
                  Category
                </span>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    active={props.activeCategory === null}
                    onClick={() => props.onCategoryChange(null)}
                  >
                    All ({props.totalCount})
                  </Chip>
                  {props.categories.map((c) => (
                    <Chip
                      key={c.name}
                      active={props.activeCategory === c.name}
                      onClick={() =>
                        props.onCategoryChange(
                          props.activeCategory === c.name ? null : c.name
                        )
                      }
                    >
                      {c.name} ({c.count})
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.32em] text-[#5a5347]">
                  Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {STATUS_ORDER.map((s) => (
                    <Chip
                      key={s}
                      active={props.statusFilter === s}
                      disabled={
                        (props.statusCounts[s] ?? 0) === 0 &&
                        props.statusFilter !== s
                      }
                      onClick={() =>
                        props.onStatusChange(props.statusFilter === s ? null : s)
                      }
                    >
                      {STATUS_LABELS[s]} ({props.statusCounts[s] ?? 0})
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-[0.32em] text-[#5a5347]">
                  Sort
                </span>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.id}
                      active={props.sortMode === opt.id}
                      onClick={() => props.onSortChange(opt.id)}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-2 px-5 py-3 rounded-full bg-[#C9A96E] text-[#0A0A0F] text-[10px] uppercase tracking-[0.32em] font-medium"
              >
                Show results
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.24em] border transition-colors ${
        active
          ? "border-[#C9A96E] text-[#0A0A0F] bg-[#C9A96E]"
          : disabled
          ? "border-[#3a332a]/50 text-[#5a5347]/50 cursor-not-allowed"
          : "border-[#3a332a] text-[#cdc5b5]"
      }`}
    >
      {children}
    </button>
  );
}

const ONBOARDING_KEY = "bibliotheca:onboarded";

function OnboardingHint() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARDING_KEY)) {
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, []);
  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // ignore
    }
  };
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
        >
          <button
            type="button"
            onClick={dismiss}
            className="group flex items-center gap-3 px-5 py-3 rounded-full border border-[#3a332a] bg-[#0A0A0F]/80 backdrop-blur-md text-[#cdc5b5] text-[10px] uppercase tracking-[0.32em] hover:border-[#C9A96E] hover:text-[#E8E0D0] transition-colors"
          >
            <motion.span
              aria-hidden
              animate={{ x: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-[#C9A96E]"
            >
              ←  →
            </motion.span>
            <span>scroll · drag to explore</span>
            <span aria-hidden className="text-[#5a5347] text-[14px] leading-none">
              ×
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ViewToggle({
  mode,
  onChange,
}: {
  mode: "carousel" | "grid";
  onChange: (m: "carousel" | "grid") => void;
}) {
  return (
    <div className="absolute top-5 right-5 md:top-7 md:right-auto md:left-7 z-30 flex items-center gap-1 rounded-full border border-[#3a332a] bg-black/40 backdrop-blur p-1">
      {(["carousel", "grid"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
          aria-label={`Switch to ${m} view`}
          className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.28em] transition-colors ${
            mode === m
              ? "bg-[#C9A96E] text-[#0A0A0F]"
              : "text-[#9a9286] hover:text-[#cdc5b5]"
          }`}
        >
          {m === "carousel" ? "Shelf" : "Grid"}
        </button>
      ))}
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
  const { statusMap, getStatus, setStatus } = useLibraryStatus();
  const { getRating, setRating, ratings } = usePersonalRatings();
  const [lastOpened, setLastOpened] = useState<Record<number, number>>(() =>
    loadLastOpened()
  );
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [viewMode, setViewMode] = useState<"carousel" | "grid">(() => {
    try {
      const saved = localStorage.getItem("bibliotheca:viewMode");
      if (saved === "grid" || saved === "carousel") return saved;
    } catch {
      // ignore
    }
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return "grid";
    }
    return "carousel";
  });
  useEffect(() => {
    try {
      localStorage.setItem("bibliotheca:viewMode", viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [openBookId, setOpenBookId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookStatus | null>(null);

  const statusCounts = useMemo<Record<BookStatus, number>>(() => {
    const counts: Record<BookStatus, number> = {
      read: 0,
      reading: 0,
      wishlist: 0,
    };
    for (const id of Object.keys(statusMap)) {
      const s = statusMap[Number(id)];
      if (s) counts[s] += 1;
    }
    return counts;
  }, [statusMap]);

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
    if (statusFilter) {
      result = result.filter((b) => statusMap[b.id] === statusFilter);
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
    if (sortMode !== "default") {
      const sorted = [...result];
      switch (sortMode) {
        case "year-desc":
          sorted.sort((a, b) => b.year - a.year);
          break;
        case "year-asc":
          sorted.sort((a, b) => a.year - b.year);
          break;
        case "author":
          sorted.sort((a, b) => a.author.localeCompare(b.author));
          break;
        case "rating":
          sorted.sort(
            (a, b) => (ratings[b.id] ?? 0) - (ratings[a.id] ?? 0)
          );
          break;
        case "last-opened":
          sorted.sort(
            (a, b) => (lastOpened[b.id] ?? 0) - (lastOpened[a.id] ?? 0)
          );
          break;
      }
      result = sorted;
    }
    return result;
  }, [
    books,
    activeCategory,
    statusFilter,
    statusMap,
    searchQuery,
    sortMode,
    ratings,
    lastOpened,
  ]);

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
      setLastOpened((prev) => {
        const next = { ...prev, [openBookId]: Date.now() };
        saveLastOpened(next);
        return next;
      });
    }
  }, [openBookId, hydrateBookById]);

  useEffect(() => {
    const focused = openBook ?? selectedBook;
    document.title = focused
      ? `${focused.title} — Bibliotheca`
      : "Bibliotheca";
  }, [openBook, selectedBook]);

  useEffect(() => {
    if (viewMode !== "carousel") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [role="dialog"], button')) return;
      if (selectedBookId != null && openBookId == null) {
        setOpenBookId(selectedBookId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewMode, selectedBookId, openBookId]);

  useEffect(() => {
    if (loading) return;
    const url = new URL(window.location.href);
    const param = url.searchParams.get("book");
    if (param) {
      const id = parseInt(param, 10);
      if (Number.isFinite(id) && books.some((b) => b.id === id)) {
        setOpenBookId(id);
      }
    }
    // intentionally only on first books load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const url = new URL(window.location.href);
    if (openBookId != null) {
      url.searchParams.set("book", String(openBookId));
    } else {
      url.searchParams.delete("book");
    }
    const next = url.pathname + (url.search ? url.search : "") + url.hash;
    window.history.replaceState(null, "", next);
  }, [openBookId, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  const tintColor = selectedBook?.color ?? "#0A0A0F";
  const isEmpty = filteredBooks.length === 0;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0A0F] text-[#E8E0D0] relative">
      <a
        href="#book-list"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-[#C9A96E] focus:text-[#0A0A0F] focus:text-[10px] focus:uppercase focus:tracking-[0.32em]"
      >
        Skip to book list
      </a>
      <ul id="book-list" className="sr-only" aria-label="All books">
        {filteredBooks.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => setOpenBookId(b.id)}
            >{`${b.title} by ${b.author}`}</button>
          </li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-[background] duration-700"
        style={{
          background: `radial-gradient(120% 80% at 30% 60%, ${tintColor}22 0%, transparent 55%)`,
        }}
      />
      {viewMode === "carousel" ? (
        <ErrorBoundary
          fallback={() => (
            <GridView
              books={filteredBooks}
              onOpen={(book) => setOpenBookId(book.id)}
            />
          )}
        >
          <BookCarousel
            books={filteredBooks}
            onFocus={(book) => setSelectedBookId(book?.id ?? null)}
            onOpen={(book) => setOpenBookId(book.id)}
          />
        </ErrorBoundary>
      ) : (
        <GridView
          books={filteredBooks}
          onOpen={(book) => setOpenBookId(book.id)}
        />
      )}
      {viewMode === "carousel" && (
        <TopBar
          total={filteredBooks.length}
          focusedIndex={focusedIndex}
          focusedBook={selectedBook}
        />
      )}
      <ViewToggle mode={viewMode} onChange={setViewMode} />
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        totalCount={books.length}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        onStatusChange={setStatusFilter}
        sortMode={sortMode}
        onSortChange={setSortMode}
      />
      <MobileFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        totalCount={books.length}
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        onStatusChange={setStatusFilter}
        sortMode={sortMode}
        onSortChange={setSortMode}
      />
      {!isEmpty && viewMode === "carousel" && <OnboardingHint />}
      {!isEmpty && viewMode === "carousel" && (
        <PreviewPanel
          book={selectedBook}
          status={selectedBook ? getStatus(selectedBook.id) : undefined}
          onOpen={(book) => setOpenBookId(book.id)}
          onStatusChange={(s) => {
            if (selectedBook) setStatus(selectedBook.id, s);
          }}
        />
      )}
      {isEmpty && (
        <EmptyState
          onClear={() => {
            setSearchQuery("");
            setActiveCategory(null);
            setStatusFilter(null);
          }}
        />
      )}
      {openBook && (
        <BookModal
          book={openBook}
          personalRating={getRating(openBook.id)}
          onPersonalRatingChange={(r) => setRating(openBook.id, r)}
          onClose={() => setOpenBookId(null)}
        />
      )}
    </div>
  );
}

export default App;
