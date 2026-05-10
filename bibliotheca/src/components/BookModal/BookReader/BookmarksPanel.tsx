import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Bookmark } from "../../../utils/bookmarks";

interface BookmarksPanelProps {
  open: boolean;
  bookmarks: Bookmark[];
  currentSpread: number;
  totalPages: number;
  onClose: () => void;
  onJump: (spread: number) => void;
  onAdd: (label?: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, label: string) => void;
}

function pageRange(spread: number, totalPages: number): string {
  const left = spread * 2 + 1;
  const right = Math.min(left + 1, totalPages);
  return right > left ? `${left}–${right}` : String(left);
}

export function BookmarksPanel({
  open,
  bookmarks,
  currentSpread,
  totalPages,
  onClose,
  onJump,
  onAdd,
  onRemove,
  onRename,
}: BookmarksPanelProps) {
  const [labelDraft, setLabelDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const sorted = [...bookmarks].sort((a, b) => a.spread - b.spread);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="absolute top-0 right-0 bottom-0 z-30 w-[320px] max-w-[85vw] bg-[#0e0d14]/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
          aria-label="Bookmarks"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#cdc5b5]">
              Bookmarks
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close bookmarks"
              className="w-8 h-8 rounded-full text-[#9a9286] hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAdd(labelDraft.trim() || undefined);
              setLabelDraft("");
            }}
            className="px-5 py-4 border-b border-white/5 flex flex-col gap-3"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#5a5347]">
              Add at page {pageRange(currentSpread, totalPages)}
            </span>
            <input
              type="text"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              placeholder="optional label"
              maxLength={60}
              className="bg-transparent text-[#E8E0D0] text-[12px] py-2 px-1 outline-none border-b border-[#3a332a] focus:border-[#C9A96E] transition-colors placeholder:text-[#5a5347]"
            />
            <button
              type="submit"
              className="self-start px-4 py-1.5 rounded-full bg-[#C9A96E] text-[#0A0A0F] text-[9px] uppercase tracking-[0.28em] font-medium hover:shadow-[0_0_20px_rgba(201,169,110,0.5)] transition-all"
            >
              + Bookmark
            </button>
          </form>

          <div className="flex-1 overflow-y-auto">
            {sorted.length === 0 ? (
              <div className="px-5 py-8 text-center text-[10px] uppercase tracking-[0.28em] text-[#5a5347]">
                no bookmarks yet
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {sorted.map((b) => {
                  const isEditing = editingId === b.id;
                  return (
                    <li key={b.id} className="group px-5 py-3 hover:bg-white/[0.03]">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onJump(b.spread)}
                          className="flex-1 text-left flex items-baseline gap-3"
                        >
                          <span className="text-[#C9A96E] font-display text-[15px] tabular-nums">
                            {pageRange(b.spread, totalPages)}
                          </span>
                          {!isEditing && (
                            <span className="text-[11px] text-[#cdc5b5] truncate">
                              {b.label || "—"}
                            </span>
                          )}
                        </button>
                        {!isEditing && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(b.id);
                                setEditDraft(b.label ?? "");
                              }}
                              aria-label="Rename bookmark"
                              className="w-7 h-7 rounded-full text-[#9a9286] hover:text-white hover:bg-white/10 transition-colors text-[11px]"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemove(b.id)}
                              aria-label="Delete bookmark"
                              className="w-7 h-7 rounded-full text-[#9a9286] hover:text-white hover:bg-white/10 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            onRename(b.id, editDraft.trim());
                            setEditingId(null);
                          }}
                          className="mt-2 flex items-center gap-2"
                        >
                          <input
                            autoFocus
                            type="text"
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            onBlur={() => setEditingId(null)}
                            maxLength={60}
                            className="flex-1 bg-transparent text-[#E8E0D0] text-[12px] py-1 outline-none border-b border-[#C9A96E]"
                          />
                        </form>
                      )}
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
