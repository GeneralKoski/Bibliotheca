import { useCallback, useEffect, useRef, useState } from "react";

export type FlipDirection = "forward" | "backward" | null;

const FLIP_DURATION = 600;

function easeCubic(t: number): number {
  // approximation of cubic-bezier(0.25, 0.1, 0.25, 1) (ease-out-ish)
  return 1 - Math.pow(1 - t, 3);
}

export interface PageFlip {
  currentSpread: number;
  totalSpreads: number;
  direction: FlipDirection;
  progressRef: React.MutableRefObject<number>;
  flipForward: () => void;
  flipBackward: () => void;
  goTo: (spread: number) => void;
}

export function usePageFlip(totalPages: number): PageFlip {
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));
  const [currentSpread, setCurrentSpread] = useState(0);
  const [direction, setDirection] = useState<FlipDirection>(null);
  const progressRef = useRef(0);
  const animStartRef = useRef<number | null>(null);
  const pendingDirRef = useRef<FlipDirection>(null);

  const startFlip = useCallback(
    (dir: "forward" | "backward") => {
      if (direction) return;
      if (dir === "forward" && currentSpread >= totalSpreads - 1) return;
      if (dir === "backward" && currentSpread <= 0) return;
      animStartRef.current = null;
      pendingDirRef.current = dir;
      progressRef.current = 0;
      setDirection(dir);
    },
    [currentSpread, direction, totalSpreads]
  );

  const flipForward = useCallback(() => startFlip("forward"), [startFlip]);
  const flipBackward = useCallback(() => startFlip("backward"), [startFlip]);

  const goTo = useCallback(
    (spread: number) => {
      const clamped = Math.max(0, Math.min(totalSpreads - 1, spread));
      setCurrentSpread(clamped);
      progressRef.current = 0;
      setDirection(null);
      animStartRef.current = null;
    },
    [totalSpreads]
  );

  useEffect(() => {
    if (!direction) return;
    let raf = 0;
    const tick = (now: number) => {
      if (animStartRef.current == null) animStartRef.current = now;
      const elapsed = now - animStartRef.current;
      const t = Math.min(1, elapsed / FLIP_DURATION);
      progressRef.current = easeCubic(t);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        const dir = pendingDirRef.current;
        pendingDirRef.current = null;
        animStartRef.current = null;
        progressRef.current = 0;
        setCurrentSpread((s) => (dir === "forward" ? s + 1 : s - 1));
        setDirection(null);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction]);

  return {
    currentSpread,
    totalSpreads,
    direction,
    progressRef,
    flipForward,
    flipBackward,
    goTo,
  };
}
