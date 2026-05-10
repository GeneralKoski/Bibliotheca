import { AnimatePresence, motion } from "framer-motion";
import {
  FONTS,
  type FontId,
  SIZES,
  type SizeId,
  THEMES,
  type ThemeId,
} from "./readerStyle";

interface ReaderSettingsProps {
  open: boolean;
  themeId: ThemeId;
  fontId: FontId;
  sizeId: SizeId;
  onClose: () => void;
  onThemeChange: (id: ThemeId) => void;
  onFontChange: (id: FontId) => void;
  onSizeChange: (id: SizeId) => void;
}

export function ReaderSettings({
  open,
  themeId,
  fontId,
  sizeId,
  onClose,
  onThemeChange,
  onFontChange,
  onSizeChange,
}: ReaderSettingsProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-20 right-6 z-30 w-[280px] bg-[#0e0d14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] overflow-hidden"
          role="dialog"
          aria-label="Reader settings"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#cdc5b5]">
              Reading
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="w-7 h-7 rounded-full text-[#9a9286] hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="px-5 py-4 space-y-5">
            <Group label="Theme">
              <div className="grid grid-cols-2 gap-2">
                {Object.values(THEMES).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onThemeChange(t.id)}
                    aria-pressed={themeId === t.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                      themeId === t.id
                        ? "border-[#C9A96E] bg-white/[0.03]"
                        : "border-white/10 hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="w-4 h-4 rounded-sm border border-white/10"
                      style={{
                        background: `linear-gradient(180deg, ${t.bgTop}, ${t.bgBottom})`,
                      }}
                    />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#E8E0D0]">
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </Group>

            <Group label="Font">
              <div className="grid grid-cols-2 gap-2">
                {Object.values(FONTS).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onFontChange(f.id)}
                    aria-pressed={fontId === f.id}
                    className={`px-3 py-2 rounded-md border text-[12px] transition-colors ${
                      fontId === f.id
                        ? "border-[#C9A96E] bg-white/[0.03] text-white"
                        : "border-white/10 text-[#cdc5b5] hover:bg-white/[0.03]"
                    }`}
                    style={{ fontFamily: f.family }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </Group>

            <Group label="Size">
              <div className="grid grid-cols-3 gap-2">
                {Object.values(SIZES).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSizeChange(s.id)}
                    aria-pressed={sizeId === s.id}
                    className={`px-3 py-2 rounded-md border text-[12px] transition-colors ${
                      sizeId === s.id
                        ? "border-[#C9A96E] bg-white/[0.03] text-white"
                        : "border-white/10 text-[#cdc5b5] hover:bg-white/[0.03]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Group>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="block text-[9px] uppercase tracking-[0.32em] text-[#5a5347]">
        {label}
      </span>
      {children}
    </div>
  );
}
