import { AnimatePresence, motion } from "framer-motion";
import type { Chapter } from "./extractChapters";

interface ChaptersPanelProps {
  open: boolean;
  chapters: Chapter[];
  currentSpread: number;
  totalPages: number;
  onClose: () => void;
  onJump: (spread: number) => void;
}

export function ChaptersPanel({
  open,
  chapters,
  currentSpread,
  totalPages,
  onClose,
  onJump,
}: ChaptersPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="absolute top-0 left-0 bottom-0 z-30 w-[320px] max-w-[85vw] bg-[#0e0d14]/95 backdrop-blur-xl border-r border-white/10 flex flex-col"
          aria-label="Table of contents"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#cdc5b5]">
              Contents
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close contents"
              className="w-8 h-8 rounded-full text-[#9a9286] hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chapters.length === 0 ? (
              <div className="px-5 py-8 text-center text-[10px] uppercase tracking-[0.28em] text-[#5a5347]">
                no chapters detected
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {chapters.map((c) => {
                  const active = c.spread === currentSpread;
                  return (
                    <li key={`${c.pageIndex}-${c.title}`}>
                      <button
                        type="button"
                        onClick={() => onJump(c.spread)}
                        className={`w-full text-left px-5 py-3 hover:bg-white/[0.04] transition-colors flex items-baseline gap-3 ${
                          active ? "bg-white/[0.06]" : ""
                        }`}
                      >
                        <span className="text-[#C9A96E] font-display text-[13px] tabular-nums shrink-0">
                          {c.pageIndex + 1}
                          <span className="text-[#5a5347]"> / {totalPages}</span>
                        </span>
                        <span
                          className={`text-[12px] leading-snug truncate ${
                            active ? "text-white" : "text-[#cdc5b5]"
                          }`}
                        >
                          {c.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
