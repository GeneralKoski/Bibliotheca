import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

interface SearchPanelProps {
  open: boolean;
  pages: string[];
  totalPages: number;
  onClose: () => void;
  onJump: (spread: number) => void;
}

interface Match {
  pageIndex: number;
  excerpt: string;
}

const EXCERPT_RADIUS = 36;

function buildMatches(pages: string[], query: string): Match[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: Match[] = [];
  for (let i = 0; i < pages.length; i++) {
    const text = pages[i];
    const lower = text.toLowerCase();
    let from = 0;
    while (true) {
      const idx = lower.indexOf(q, from);
      if (idx === -1) break;
      const start = Math.max(0, idx - EXCERPT_RADIUS);
      const end = Math.min(text.length, idx + q.length + EXCERPT_RADIUS);
      const prefix = start > 0 ? "…" : "";
      const suffix = end < text.length ? "…" : "";
      out.push({
        pageIndex: i,
        excerpt: prefix + text.slice(start, end).replace(/\s+/g, " ") + suffix,
      });
      from = idx + q.length;
      if (out.length >= 200) return out;
    }
  }
  return out;
}

export function SearchPanel({
  open,
  pages,
  totalPages,
  onClose,
  onJump,
}: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => buildMatches(pages, query), [pages, query]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-[min(560px,90vw)] bg-[#0e0d14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] overflow-hidden"
          role="dialog"
          aria-label="Search in book"
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <span aria-hidden className="text-[#9a9286]">⌕</span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  onClose();
                }
              }}
              placeholder="search in book"
              className="flex-1 bg-transparent text-[#E8E0D0] text-[13px] outline-none placeholder:text-[#5a5347]"
            />
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#9a9286] tabular-nums">
              {query.trim().length < 2
                ? ""
                : matches.length === 0
                ? "no matches"
                : `${matches.length}`}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="w-8 h-8 rounded-full text-[#9a9286] hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {matches.length === 0 ? (
              query.trim().length < 2 ? (
                <p className="px-5 py-6 text-[10px] uppercase tracking-[0.28em] text-[#5a5347]">
                  type at least 2 characters
                </p>
              ) : null
            ) : (
              <ul className="divide-y divide-white/5">
                {matches.map((m, idx) => {
                  const spread = Math.floor(m.pageIndex / 2);
                  const pageLabel = m.pageIndex + 1;
                  return (
                    <li key={`${m.pageIndex}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => {
                          onJump(spread);
                        }}
                        className="w-full text-left px-5 py-3 hover:bg-white/[0.04] transition-colors flex flex-col gap-1"
                      >
                        <span className="text-[9px] uppercase tracking-[0.32em] text-[#C9A96E]">
                          page {pageLabel}
                          <span className="text-[#5a5347]"> / {totalPages}</span>
                        </span>
                        <span className="text-[12px] text-[#cdc5b5] leading-relaxed">
                          {highlight(m.excerpt, query)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function highlight(text: string, query: string) {
  const q = query.trim();
  if (q.length < 2) return text;
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const out: React.ReactNode[] = [];
  let from = 0;
  let key = 0;
  while (true) {
    const idx = lower.indexOf(ql, from);
    if (idx === -1) {
      out.push(text.slice(from));
      break;
    }
    if (idx > from) out.push(text.slice(from, idx));
    out.push(
      <mark
        key={key++}
        className="bg-[#C9A96E]/30 text-[#E8E0D0] rounded px-0.5"
      >
        {text.slice(idx, idx + q.length)}
      </mark>
    );
    from = idx + q.length;
  }
  return out;
}
