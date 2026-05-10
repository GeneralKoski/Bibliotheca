import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { BookNote } from "../../../utils/notes";

interface NotesPanelProps {
  open: boolean;
  notes: BookNote[];
  currentSpread: number;
  totalPages: number;
  onClose: () => void;
  onJump: (spread: number) => void;
  onAdd: (text: string, quote?: string) => void;
  onRemove: (id: string) => void;
  onExport: () => void;
}

function pageRange(spread: number, totalPages: number): string {
  const left = spread * 2 + 1;
  const right = Math.min(left + 1, totalPages);
  return right > left ? `${left}–${right}` : String(left);
}

export function NotesPanel({
  open,
  notes,
  currentSpread,
  totalPages,
  onClose,
  onJump,
  onAdd,
  onRemove,
  onExport,
}: NotesPanelProps) {
  const [text, setText] = useState("");
  const [quote, setQuote] = useState("");

  const sorted = [...notes].sort((a, b) => a.pageIndex - b.pageIndex);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="absolute top-0 right-0 bottom-0 z-30 w-[360px] max-w-[90vw] bg-[#0e0d14]/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
          aria-label="Notes"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#cdc5b5]">
              Notes
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onExport}
                disabled={notes.length === 0}
                className="px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.28em] text-[#C9A96E] hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                Export .md
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close notes"
                className="w-8 h-8 rounded-full text-[#9a9286] hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              onAdd(text.trim(), quote.trim() || undefined);
              setText("");
              setQuote("");
            }}
            className="px-5 py-4 border-b border-white/5 flex flex-col gap-3"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#5a5347]">
              New on page {pageRange(currentSpread, totalPages)}
            </span>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="optional quote"
              rows={2}
              className="bg-transparent text-[#cdc5b5] italic text-[12px] py-2 px-1 outline-none border-b border-[#3a332a] focus:border-[#9a9286] transition-colors placeholder:text-[#5a5347] resize-none"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="your note"
              rows={3}
              className="bg-transparent text-[#E8E0D0] text-[12px] py-2 px-1 outline-none border-b border-[#3a332a] focus:border-[#C9A96E] transition-colors placeholder:text-[#5a5347] resize-none"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="self-start px-4 py-1.5 rounded-full bg-[#C9A96E] text-[#0A0A0F] text-[9px] uppercase tracking-[0.28em] font-medium hover:shadow-[0_0_20px_rgba(201,169,110,0.5)] disabled:opacity-40 disabled:hover:shadow-none transition-all"
            >
              + Note
            </button>
          </form>

          <div className="flex-1 overflow-y-auto">
            {sorted.length === 0 ? (
              <div className="px-5 py-8 text-center text-[10px] uppercase tracking-[0.28em] text-[#5a5347]">
                no notes yet
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {sorted.map((n) => (
                  <li key={n.id} className="group px-5 py-4 hover:bg-white/[0.03]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <button
                        type="button"
                        onClick={() => onJump(Math.floor(n.pageIndex / 2))}
                        className="text-[#C9A96E] font-display text-[13px] tabular-nums"
                      >
                        page {n.pageIndex + 1}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(n.id)}
                        aria-label="Delete note"
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full text-[#9a9286] hover:text-white hover:bg-white/10 transition-all"
                      >
                        ×
                      </button>
                    </div>
                    {n.quote && (
                      <blockquote className="text-[12px] italic text-[#cdc5b5] border-l-2 border-[#C9A96E]/40 pl-3 mb-2 whitespace-pre-line">
                        {n.quote}
                      </blockquote>
                    )}
                    <p className="text-[12px] text-[#E8E0D0] leading-relaxed whitespace-pre-line">
                      {n.text}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
