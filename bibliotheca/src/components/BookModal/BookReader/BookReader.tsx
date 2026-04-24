import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  BackSide,
  BufferAttribute,
  CanvasTexture,
  FrontSide,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  type Group,
} from "three";
import type { Book } from "../../../types";
import { buildPageCanvas, PageMesh } from "./PageMesh";
import { useGutenbergText } from "./useGutenbergText";
import { type FlipDirection, usePageFlip } from "./usePageFlip";

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

const PAGE_W = 3;
const PAGE_H = 4;
const PAGE_SEGMENTS = 10;

function makeFlipGeometry(): PlaneGeometry {
  const geom = new PlaneGeometry(PAGE_W, PAGE_H, PAGE_SEGMENTS, 1);
  geom.translate(PAGE_W / 2, 0, 0); // left edge at x=0
  return geom;
}

function makePageTexture(canvas: HTMLCanvasElement, mirror: boolean) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  if (mirror) {
    texture.wrapS = RepeatWrapping;
    texture.repeat.x = -1;
    texture.offset.x = 1;
  }
  texture.needsUpdate = true;
  return texture;
}

interface FlipPageProps {
  frontText: string;
  backText: string;
  frontPageNumber: number;
  backPageNumber: number;
  totalPages: number;
  bookTitle: string;
  direction: FlipDirection;
  progressRef: React.MutableRefObject<number>;
  pivotX: 0;
}

function FlipPage({
  frontText,
  backText,
  frontPageNumber,
  backPageNumber,
  totalPages,
  bookTitle,
  direction,
  progressRef,
}: FlipPageProps) {
  const groupRef = useRef<Group>(null);

  const { frontGeom, backGeom, frontTex, backTex, initialPositions } = useMemo(() => {
    const frontGeom = makeFlipGeometry();
    const backGeom = makeFlipGeometry();
    const frontTex = makePageTexture(
      buildPageCanvas({
        text: frontText,
        pageNumber: frontPageNumber,
        totalPages,
        bookTitle,
      }),
      false
    );
    const backTex = makePageTexture(
      buildPageCanvas({
        text: backText,
        pageNumber: backPageNumber,
        totalPages,
        bookTitle,
      }),
      true
    );
    const posAttr = frontGeom.attributes.position as BufferAttribute;
    const initialPositions = new Float32Array(posAttr.array);
    return { frontGeom, backGeom, frontTex, backTex, initialPositions };
  }, [frontText, backText, frontPageNumber, backPageNumber, totalPages, bookTitle]);

  useEffect(() => {
    return () => {
      frontGeom.dispose();
      backGeom.dispose();
      frontTex.dispose();
      backTex.dispose();
    };
  }, [frontGeom, backGeom, frontTex, backTex]);

  useFrame(() => {
    if (!groupRef.current || !direction) return;
    const p = progressRef.current;
    const rot =
      direction === "forward" ? -p * Math.PI : -Math.PI + p * Math.PI;
    groupRef.current.rotation.y = rot;

    const curveAmount = Math.sin(p * Math.PI) * 0.35;
    const frontPos = frontGeom.attributes.position as BufferAttribute;
    const backPos = backGeom.attributes.position as BufferAttribute;
    for (let i = 0; i < frontPos.count; i++) {
      const ix = i * 3;
      const x = initialPositions[ix];
      const y = initialPositions[ix + 1];
      const z = Math.sin((x / PAGE_W) * Math.PI) * curveAmount;
      frontPos.array[ix] = x;
      frontPos.array[ix + 1] = y;
      frontPos.array[ix + 2] = z;
      backPos.array[ix] = x;
      backPos.array[ix + 1] = y;
      backPos.array[ix + 2] = z;
    }
    frontPos.needsUpdate = true;
    backPos.needsUpdate = true;
    frontGeom.computeVertexNormals();
    backGeom.computeVertexNormals();
  });

  // Shadow multiplier via material color darkening
  const shadowRef = useRef(1);
  useFrame(() => {
    if (!direction) return;
    const p = progressRef.current;
    // peaks toward mid-flip
    shadowRef.current = 1 - Math.sin(p * Math.PI) * 0.6;
  });

  if (!direction) return null;

  return (
    <group ref={groupRef}>
      <mesh geometry={frontGeom}>
        <meshStandardMaterial
          map={frontTex}
          side={FrontSide}
          roughness={0.9}
          color={`rgb(${Math.round(255 * shadowRef.current)}, ${Math.round(
            255 * shadowRef.current
          )}, ${Math.round(255 * shadowRef.current)})`}
        />
      </mesh>
      <mesh geometry={backGeom}>
        <meshStandardMaterial
          map={backTex}
          side={BackSide}
          roughness={0.9}
          color={`rgb(${Math.round(255 * shadowRef.current)}, ${Math.round(
            255 * shadowRef.current
          )}, ${Math.round(255 * shadowRef.current)})`}
        />
      </mesh>
    </group>
  );
}

interface SceneProps {
  pages: string[];
  bookTitle: string;
  currentSpread: number;
  direction: FlipDirection;
  progressRef: React.MutableRefObject<number>;
}

function ReaderScene({
  pages,
  bookTitle,
  currentSpread,
  direction,
  progressRef,
}: SceneProps) {
  const totalPages = pages.length;
  const leftIdx = currentSpread * 2;
  const rightIdx = leftIdx + 1;

  const leftText = pages[leftIdx] ?? "";
  const rightText = pages[rightIdx] ?? "";

  // For forward flip: new right page should be visible during flip (peeking out)
  // For backward flip: new left page should be visible
  const peekLeftText = direction === "backward" ? pages[leftIdx - 2] ?? "" : leftText;
  const peekLeftNum = direction === "backward" ? leftIdx - 1 : leftIdx + 1;
  const peekRightText =
    direction === "forward" ? pages[rightIdx + 2] ?? "" : rightText;
  const peekRightNum = direction === "forward" ? rightIdx + 3 : rightIdx + 1;

  const flipFrontText =
    direction === "forward" ? rightText : leftText;
  const flipFrontNum =
    direction === "forward" ? rightIdx + 1 : leftIdx + 1;
  const flipBackText =
    direction === "forward"
      ? pages[rightIdx + 1] ?? ""
      : pages[leftIdx - 1] ?? "";
  const flipBackNum =
    direction === "forward" ? rightIdx + 2 : leftIdx;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[-3, 5, 3]}
        intensity={1.0}
        castShadow
      />
      <pointLight position={[0, 3, 4]} intensity={1.2} color="#FFF8E7" />

      {/* Spine */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[0.1, PAGE_H, 0.3]} />
        <meshStandardMaterial color="#2a1810" roughness={0.8} />
      </mesh>

      {/* Left static page */}
      <PageMesh
        text={direction === "forward" ? leftText : peekLeftText}
        pageNumber={direction === "forward" ? leftIdx + 1 : peekLeftNum}
        totalPages={totalPages}
        bookTitle={bookTitle}
        position={[-PAGE_W / 2, 0, 0]}
      />

      {/* Right static page */}
      <PageMesh
        text={direction === "forward" ? peekRightText : rightText}
        pageNumber={direction === "forward" ? peekRightNum : rightIdx + 1}
        totalPages={totalPages}
        bookTitle={bookTitle}
        position={[PAGE_W / 2, 0, 0]}
      />

      {/* Flipping page */}
      <group position={[0, 0, 0.02]}>
        <FlipPage
          frontText={flipFrontText}
          backText={flipBackText}
          frontPageNumber={flipFrontNum}
          backPageNumber={flipBackNum}
          totalPages={totalPages}
          bookTitle={bookTitle}
          direction={direction}
          progressRef={progressRef}
          pivotX={0}
        />
      </group>
    </>
  );
}

export function BookReader({ book, onClose }: BookReaderProps) {
  const { pages, loading, error } = useGutenbergText(book.gutenbergId);

  // Use a placeholder page while loading / on error so the scene still renders
  const displayPages = useMemo(() => {
    if (loading) {
      return [
        `Loading ${book.title} from Project Gutenberg…\n\nPlease wait while we fetch the text.`,
        "If this takes more than a few seconds, the fallback proxy is being used.",
      ];
    }
    if (error || pages.length === 0) {
      return [
        `${book.title}\n\n${book.longDescription}`,
        `The full text of this book could not be loaded.\n\nYou can read it at:\nhttps://www.gutenberg.org/ebooks/${book.gutenbergId}`,
      ];
    }
    return pages;
  }, [pages, loading, error, book]);

  const {
    currentSpread,
    totalSpreads,
    direction,
    progressRef,
    flipForward,
    flipBackward,
  } = usePageFlip(displayPages.length);

  const leftPageNum = currentSpread * 2 + 1;
  const rightPageNum = Math.min(leftPageNum + 1, displayPages.length);

  const pointerDown = useRef<{ x: number; side: "left" | "right" } | null>(
    null
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const side = localX < rect.width / 2 ? "left" : "right";
      pointerDown.current = { x: e.clientX, side };
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerDown.current) return;
      const dx = e.clientX - pointerDown.current.x;
      const { side } = pointerDown.current;
      pointerDown.current = null;
      if (side === "right" && dx < -20) flipForward();
      else if (side === "left" && dx > 20) flipBackward();
      else if (Math.abs(dx) < 6) {
        // tap
        if (side === "right") flipForward();
        else flipBackward();
      }
    },
    [flipForward, flipBackward]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") flipForward();
      else if (event.key === "ArrowLeft") flipBackward();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipForward, flipBackward]);

  return (
    <motion.div
      key="reader"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-[#1a1610] flex items-center justify-center"
      role="document"
      aria-label={`Reader for ${book.title}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close reader"
        className="absolute top-6 right-6 z-20 w-11 h-11 rounded-full border border-white/10 bg-black/50 text-[#E8E0D0] hover:bg-white/10 transition-colors flex items-center justify-center"
      >
        ×
      </button>

      <button
        type="button"
        onClick={flipBackward}
        aria-label="Previous page"
        disabled={currentSpread === 0}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/10 bg-black/40 text-[#E8E0D0] hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-black/40 transition-all flex items-center justify-center text-xl"
      >
        ←
      </button>
      <button
        type="button"
        onClick={flipForward}
        aria-label="Next page"
        disabled={currentSpread >= totalSpreads - 1}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/10 bg-black/40 text-[#E8E0D0] hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-black/40 transition-all flex items-center justify-center text-xl"
      >
        →
      </button>

      <div
        className="absolute inset-0"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6.5], fov: 45 }}
          style={{ width: "100%", height: "100%" }}
          shadows
        >
          <ReaderScene
            pages={displayPages}
            bookTitle={book.title}
            currentSpread={currentSpread}
            direction={direction}
            progressRef={progressRef}
          />
        </Canvas>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#C9A96E] bg-black/50 border border-white/10 rounded-full px-4 py-2 backdrop-blur">
        <span>{book.title}</span>
        <span className="text-[#E8E0D0]/40">·</span>
        <span>
          {leftPageNum}
          {rightPageNum !== leftPageNum ? `–${rightPageNum}` : ""} /{" "}
          {displayPages.length}
        </span>
      </div>

      {loading && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-[10px] uppercase tracking-[0.3em] text-[#C9A96E] animate-pulse">
          Loading from Project Gutenberg…
        </div>
      )}
    </motion.div>
  );
}
