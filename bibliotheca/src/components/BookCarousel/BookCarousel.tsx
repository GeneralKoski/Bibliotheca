import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";
import type { Book } from "../../types";
import { Book3D } from "./Book3D";
import { useCarouselScroll } from "./useCarouselScroll";

const BOOK_SPACING = 2.5;
const FOCUS_SCALE = 1.2;
const FOCUS_Z = 0.6;

interface BookCarouselProps {
  books: Book[];
  onFocus: (book: Book | null) => void;
  onOpen: (book: Book) => void;
}

function useDiagonalAngle() {
  const [angle, setAngle] = useState(() =>
    typeof window !== "undefined"
      ? Math.atan2(window.innerHeight, window.innerWidth)
      : Math.PI / 6
  );
  useEffect(() => {
    const onResize = () =>
      setAngle(Math.atan2(window.innerHeight, window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return angle;
}

function CarouselScene({ books, onFocus, onOpen }: BookCarouselProps) {
  const { current: scroll } = useCarouselScroll(books.length);
  const angle = useDiagonalAngle();
  const { viewport } = useThree();
  const groupRefs = useRef<Array<Group | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const lastFocusRef = useRef<number>(-1);

  const diagLen = useMemo(() => {
    return Math.min(viewport.width, viewport.height) * 0.9;
  }, [viewport.width, viewport.height]);

  const dir = useMemo(
    () => ({ x: Math.cos(-angle), y: Math.sin(-angle) }),
    [angle]
  );

  useFrame(() => {
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < books.length; i++) {
      const d = Math.abs(i - scroll.current);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    }
    if (closest !== lastFocusRef.current) {
      lastFocusRef.current = closest;
      setFocusedIndex(closest);
    }

    // Per-book spring-ish scale/z toward target
    for (let i = 0; i < books.length; i++) {
      const group = groupRefs.current[i];
      if (!group) continue;
      const isFocused = i === closest;
      const targetScale = isFocused ? FOCUS_SCALE : 1;
      const targetZ = isFocused ? FOCUS_Z : 0;
      group.scale.x += (targetScale - group.scale.x) * 0.12;
      group.scale.y += (targetScale - group.scale.y) * 0.12;
      group.scale.z += (targetScale - group.scale.z) * 0.12;

      const offset = (i - scroll.current) * BOOK_SPACING;
      const x = dir.x * offset;
      const y = dir.y * offset;
      group.position.x = x;
      group.position.y = y;
      group.position.z += (targetZ - group.position.z) * 0.12;
      group.rotation.z = -angle;
    }
  });

  useEffect(() => {
    onFocus(books[focusedIndex] ?? null);
  }, [focusedIndex, books, onFocus]);

  // Use diagLen to subtly fade books farther from the center (optional future polish)
  void diagLen;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 5, 3]} intensity={0.8} color="#C9A96E" />
      {books.map((book, i) => (
        <Book3D
          key={book.id}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          book={book}
          position={[0, 0, 0]}
          rotation={[0, 0, -angle]}
          scale={1}
          onSelect={onOpen}
        />
      ))}
    </>
  );
}

export function BookCarousel(props: BookCarouselProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      shadows
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ position: "fixed", inset: 0 }}
    >
      <CarouselScene {...props} />
    </Canvas>
  );
}
