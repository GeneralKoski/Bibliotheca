import { useCallback, useEffect, useRef, useState } from "react";

export type FlipDirection = "forward" | "backward" | null;

const FLIP_DURATION = 600;
const SETTLE_MAX_DURATION = 500;
const SETTLE_MIN_DURATION = 120;

function easeCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function canFlip(
  dir: "forward" | "backward",
  spread: number,
  totalSpreads: number
): boolean {
  return dir === "forward" ? spread < totalSpreads - 1 : spread > 0;
}

export interface PageFlip {
  currentSpread: number;
  totalSpreads: number;
  direction: FlipDirection;
  progressRef: React.MutableRefObject<number>;
  flipForward: () => void;
  flipBackward: () => void;
  goTo: (spread: number) => void;
  startDrag: (dir: "forward" | "backward") => boolean;
  updateDrag: (progress: number) => void;
  endDrag: (commit: boolean) => void;
  cancelDrag: () => void;
}

export function usePageFlip(totalPages: number): PageFlip {
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));
  const [currentSpread, setCurrentSpread] = useState(0);
  const [direction, setDirection] = useState<FlipDirection>(null);
  const directionRef = useRef<FlipDirection>(null);
  const progressRef = useRef(0);
  const pendingDirRef = useRef<FlipDirection>(null);
  const dragActiveRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const cancelRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const setDir = (d: FlipDirection) => {
    directionRef.current = d;
    setDirection(d);
  };

  const flipForward = useCallback(() => {
    if (directionRef.current) return;
    if (!canFlip("forward", currentSpread, totalSpreads)) return;
    pendingDirRef.current = "forward";
    progressRef.current = 0;
    setDir("forward");
  }, [currentSpread, totalSpreads]);

  const flipBackward = useCallback(() => {
    if (directionRef.current) return;
    if (!canFlip("backward", currentSpread, totalSpreads)) return;
    pendingDirRef.current = "backward";
    progressRef.current = 0;
    setDir("backward");
  }, [currentSpread, totalSpreads]);

  const goTo = useCallback(
    (spread: number) => {
      const clamped = Math.max(0, Math.min(totalSpreads - 1, spread));
      cancelRaf();
      dragActiveRef.current = false;
      pendingDirRef.current = null;
      progressRef.current = 0;
      setCurrentSpread(clamped);
      setDir(null);
    },
    [totalSpreads]
  );

  // Auto-play animation for button / keyboard flips.
  // Skipped while a drag is active — the drag drives progress manually.
  useEffect(() => {
    if (!direction || dragActiveRef.current) return;
    const from = progressRef.current;
    const duration = FLIP_DURATION * Math.max(0.3, 1 - from);
    const startT = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startT) / duration);
      progressRef.current = from + (1 - from) * easeCubic(t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        const dir = pendingDirRef.current;
        pendingDirRef.current = null;
        progressRef.current = 0;
        setCurrentSpread((s) =>
          dir === "forward" ? s + 1 : dir === "backward" ? s - 1 : s
        );
        setDir(null);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [direction]);

  const startDrag = useCallback(
    (dir: "forward" | "backward") => {
      if (directionRef.current) return false;
      if (!canFlip(dir, currentSpread, totalSpreads)) return false;
      cancelRaf();
      dragActiveRef.current = true;
      pendingDirRef.current = dir;
      progressRef.current = 0;
      setDir(dir);
      return true;
    },
    [currentSpread, totalSpreads]
  );

  const updateDrag = useCallback((progress: number) => {
    if (!dragActiveRef.current) return;
    progressRef.current = Math.max(0, Math.min(1, progress));
  }, []);

  const endDrag = useCallback((commit: boolean) => {
    if (!dragActiveRef.current) return;
    dragActiveRef.current = false;
    const dir = pendingDirRef.current;
    const from = progressRef.current;
    const to = commit ? 1 : 0;
    const dist = Math.abs(to - from);
    const duration = Math.max(
      SETTLE_MIN_DURATION,
      Math.min(SETTLE_MAX_DURATION, dist * 550)
    );
    const startT = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startT) / duration);
      const eased = easeCubic(t);
      progressRef.current = from + (to - from) * eased;
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        pendingDirRef.current = null;
        progressRef.current = 0;
        if (commit) {
          setCurrentSpread((s) =>
            dir === "forward" ? s + 1 : dir === "backward" ? s - 1 : s
          );
        }
        setDir(null);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const cancelDrag = useCallback(() => {
    if (!dragActiveRef.current) return;
    endDrag(false);
  }, [endDrag]);

  return {
    currentSpread,
    totalSpreads,
    direction,
    progressRef,
    flipForward,
    flipBackward,
    goTo,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  };
}
