import { AnimatePresence, motion } from "framer-motion";

interface ColophonProps {
  open: boolean;
  onClose: () => void;
}

export function Colophon({ open, onClose }: ColophonProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
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
          aria-label="About Bibliotheca"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="relative w-[92%] max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-[#15141c] to-[#0e0d14] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] p-10"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/10 bg-black/40 text-[#E8E0D0] hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              ×
            </button>

            <h1 className="font-display text-4xl mb-1">Bibliotheca</h1>
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#C9A96E] mb-8">
              An editorial 3D library
            </p>

            <p className="text-[14px] leading-relaxed text-[#cdc5b5] mb-6">
              A horizontally-scrolling shelf paired with a 3D page-flip reader.
              Books are streamed from Project Gutenberg, covers from OpenLibrary,
              and everything you mark — bookmarks, notes, ratings, reading
              progress — stays in your browser.
            </p>

            <Section title="Stack">
              React 19 · TypeScript · Vite · React Three Fiber · Three.js ·
              Framer Motion · Tailwind CSS
            </Section>

            <Section title="Sources">
              <a
                href="https://www.gutenberg.org/"
                target="_blank"
                rel="noreferrer"
                className="text-[#C9A96E] hover:underline"
              >
                Project Gutenberg
              </a>{" "}
              for full text ·{" "}
              <a
                href="https://openlibrary.org/"
                target="_blank"
                rel="noreferrer"
                className="text-[#C9A96E] hover:underline"
              >
                OpenLibrary
              </a>{" "}
              for cover images
            </Section>

            <Section title="Type">
              Playfair Display · Inter — both via Google Fonts
            </Section>

            <Section title="Storage">
              Reader settings, bookmarks, notes, ratings and library status are
              stored in <code className="text-[#C9A96E]">localStorage</code>.
              Downloaded book texts are cached in{" "}
              <code className="text-[#C9A96E]">IndexedDB</code> for offline reuse.
            </Section>

            <p className="mt-8 text-[10px] uppercase tracking-[0.32em] text-[#5a5347]">
              Code: MIT · Books: public domain · Covers: per OpenLibrary terms
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-[9px] uppercase tracking-[0.32em] text-[#5a5347] mb-2">
        {title}
      </h2>
      <p className="text-[13px] leading-relaxed text-[#E8E0D0]">{children}</p>
    </div>
  );
}
