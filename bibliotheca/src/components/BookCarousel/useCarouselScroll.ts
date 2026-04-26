import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export interface CarouselScroll {
  target: React.MutableRefObject<number>;
  current: React.MutableRefObject<number>;
  dragging: React.MutableRefObject<boolean>;
}

const DRAG_THRESHOLD_PX = 5;

export function useCarouselScroll(itemCount: number): CarouselScroll {
  const target = useRef(0);
  const current = useRef(0);
  const touchStart = useRef<number | null>(null);
  const mouseDrag = useRef<{
    startX: number;
    startY: number;
    lastY: number;
    startTarget: number;
    moved: boolean;
  } | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const maxIndex = Math.max(0, itemCount - 1);

    const clamp = (value: number) => Math.max(0, Math.min(maxIndex, value));

    const isInsideModal = (target: EventTarget | null) =>
      target instanceof Element && target.closest('[role="dialog"]') !== null;

    const onWheel = (event: WheelEvent) => {
      if (isInsideModal(event.target)) return;
      event.preventDefault();
      target.current = clamp(target.current + event.deltaY * 0.004);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (isInsideModal(event.target)) {
        touchStart.current = null;
        return;
      }
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

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (isInsideModal(event.target)) return;
      mouseDrag.current = {
        startX: event.clientX,
        startY: event.clientY,
        lastY: event.clientY,
        startTarget: target.current,
        moved: false,
      };
    };

    const onMouseMove = (event: MouseEvent) => {
      const drag = mouseDrag.current;
      if (!drag) return;
      const dxTotal = event.clientX - drag.startX;
      const dyTotal = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dxTotal, dyTotal) > DRAG_THRESHOLD_PX) {
        drag.moved = true;
        dragging.current = true;
        document.body.style.cursor = "grabbing";
      }
      if (drag.moved) {
        target.current = clamp(drag.startTarget - dyTotal * 0.01);
        drag.lastY = event.clientY;
      }
    };

    const onMouseUp = () => {
      const drag = mouseDrag.current;
      if (!drag) return;
      mouseDrag.current = null;
      if (drag.moved) {
        document.body.style.cursor = "";
        // keep the drag flag briefly so r3f's click (pointerup) is ignored
        setTimeout(() => {
          dragging.current = false;
        }, 60);
      }
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
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [itemCount]);

  useFrame(() => {
    current.current += (target.current - current.current) * 0.08;
  });

  return { target, current, dragging };
}
