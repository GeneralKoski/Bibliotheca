import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, BufferGeometry, Group, Points } from "three";
import type { Book } from "../../types";
import { Book3D } from "./Book3D";
import { useCarouselScroll } from "./useCarouselScroll";

const BOOK_SPACING = 2.5;
const FOCUS_SCALE = 1.2;
const FOCUS_Z = 0.6;
const CENTER_EPSILON = 0.04;

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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isDesktop;
}

function CarouselScene({ books, onFocus, onOpen }: BookCarouselProps) {
  const {
    target: scrollTargetRef,
    current: scrollCurrentRef,
    dragging: scrollDraggingRef,
  } = useCarouselScroll(books.length);
  const angle = useDiagonalAngle();
  const isDesktop = useIsDesktop();
  const { viewport } = useThree();
  const groupRefs = useRef<Array<Group | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const lastFocusRef = useRef<number>(-1);
  const pendingOpen = useRef<{ book: Book; index: number } | null>(null);

  const diagLen = useMemo(() => {
    return Math.min(viewport.width, viewport.height) * 0.9;
  }, [viewport.width, viewport.height]);

  const dir = useMemo(
    () => ({ x: Math.cos(-angle), y: Math.sin(-angle) }),
    [angle]
  );

  // Offset so the focused book clears the preview panel (top-right on desktop,
  // bottom on mobile).
  const sceneOffsetY = isDesktop ? -1.4 : 1.1;
  const sceneOffsetX = isDesktop ? -0.8 : 0;

  useFrame(() => {
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < books.length; i++) {
      const d = Math.abs(i - scrollCurrentRef.current);
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

      const offset = (i - scrollCurrentRef.current) * BOOK_SPACING;
      const x = dir.x * offset;
      const y = dir.y * offset;
      group.position.x = x;
      group.position.y = y;
      group.position.z += (targetZ - group.position.z) * 0.12;
      group.rotation.z = -angle;
    }

    // Resolve a pending open once the target book has settled near the center
    const pending = pendingOpen.current;
    if (pending) {
      const dist = Math.abs(scrollCurrentRef.current - pending.index);
      if (dist < CENTER_EPSILON) {
        pendingOpen.current = null;
        onOpen(pending.book);
      }
    }
  });

  useEffect(() => {
    onFocus(books[focusedIndex] ?? null);
  }, [focusedIndex, books, onFocus]);

  const handleSelect = (book: Book) => {
    if (scrollDraggingRef.current) return;
    const idx = books.indexOf(book);
    if (idx === -1) return;
    const alreadyCentered =
      Math.abs(scrollCurrentRef.current - idx) < CENTER_EPSILON;
    if (alreadyCentered) {
      pendingOpen.current = null;
      onOpen(book);
      return;
    }
    scrollTargetRef.current = idx;
    pendingOpen.current = { book, index: idx };
  };

  // Use diagLen to subtly fade books farther from the center (optional future polish)
  void diagLen;

  return (
    <>
      <DustParticles />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 5, 3]} intensity={0.8} color="#C9A96E" />
      <group position={[sceneOffsetX, sceneOffsetY, 0]}>
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
            onSelect={handleSelect}
          />
        ))}
      </group>
    </>
  );
}

function DustParticles() {
  const pointsRef = useRef<Points>(null);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const count = 180;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    g.setAttribute("position", new BufferAttribute(positions, 3));
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.z = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#C9A96E"
        size={0.04}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

export function BookCarousel(props: BookCarouselProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      shadows
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ position: "fixed", inset: 0, cursor: "grab" }}
    >
      <CarouselScene {...props} />
    </Canvas>
  );
}
