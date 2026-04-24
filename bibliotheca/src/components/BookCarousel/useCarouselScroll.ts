import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export interface CarouselScroll {
  target: React.MutableRefObject<number>;
  current: React.MutableRefObject<number>;
}

export function useCarouselScroll(itemCount: number): CarouselScroll {
  const target = useRef(0);
  const current = useRef(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const maxIndex = Math.max(0, itemCount - 1);

    const clamp = (value: number) => Math.max(0, Math.min(maxIndex, value));

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      target.current = clamp(target.current + event.deltaY * 0.004);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStart.current = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStart.current == null) return;
      const dy = touchStart.current - event.touches[0].clientY;
      touchStart.current = event.touches[0].clientY;
      target.current = clamp(target.current + dy * 0.01);
    };

    const onTouchEnd = () => {
      touchStart.current = null;
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        target.current = clamp(target.current + 1);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        target.current = clamp(target.current - 1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [itemCount]);

  useFrame(() => {
    current.current += (target.current - current.current) * 0.08;
  });

  return { target, current };
}
