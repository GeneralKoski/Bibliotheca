import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { IntroScene } from "./IntroScene";
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
  tiltRef: React.MutableRefObject<number>;
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
  tiltRef,
}: FlipPageProps) {
  const groupRef = useRef<Group>(null);
  const tiltSmoothRef = useRef(0);

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

    // Smooth tilt tracking so the page reacts to cursor Y without jitter
    const tiltTarget = tiltRef.current * (direction === "forward" ? 1 : -1);
    tiltSmoothRef.current += (tiltTarget - tiltSmoothRef.current) * 0.18;
    const liftEnvelope = Math.sin(p * Math.PI);
    groupRef.current.rotation.z = tiltSmoothRef.current * 0.28 * liftEnvelope;

    // Curl + overall lift peak at mid-flip
    const curveAmount = liftEnvelope * 0.55;
    const globalLift = liftEnvelope * 0.08;
    const frontPos = frontGeom.attributes.position as BufferAttribute;
    const backPos = backGeom.attributes.position as BufferAttribute;
    for (let i = 0; i < frontPos.count; i++) {
      const ix = i * 3;
      const x = initialPositions[ix];
      const y = initialPositions[ix + 1];
      const nx = x / PAGE_W; // 0 at spine, 1 at free edge
      // asymmetric curl, peak biased toward the free edge
      const profile = Math.sin(Math.pow(nx, 0.85) * Math.PI);
      // skew curl vertically based on where the finger grabs the page
      const yNorm = y / (PAGE_H / 2);
      const verticalSkew = 1 + tiltSmoothRef.current * yNorm * 0.25;
      const z = profile * curveAmount * verticalSkew + globalLift * nx;
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
    shadowRef.current = 1 - Math.sin(p * Math.PI) * 0.4;
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
  tiltRef: React.MutableRefObject<number>;
}

function ReaderScene({
  pages,
  bookTitle,
  currentSpread,
  direction,
  progressRef,
  tiltRef,
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

  // The flipping leaf is the one currently at the hinge of the turn.
  // Forward  (rotY 0 → -π): front face visible at p=0 on the right, back at p=1 on the left.
  // Backward (rotY -π → 0): back face visible at p=0 on the left, front at p=1 on the right.
  const flipFrontText =
    direction === "forward" ? rightText : pages[leftIdx - 1] ?? "";
  const flipFrontNum =
    direction === "forward" ? rightIdx + 1 : leftIdx;
  const flipBackText =
    direction === "forward" ? pages[rightIdx + 1] ?? "" : leftText;
  const flipBackNum =
    direction === "forward" ? rightIdx + 2 : leftIdx + 1;

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
          tiltRef={tiltRef}
          pivotX={0}
        />
      </group>
    </>
  );
}

const INTRO_LOREM_A =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
const INTRO_LOREM_B =
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.\n\nTotam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

export function BookReader({ book, onClose }: BookReaderProps) {
  const { pages, loading, error } = useGutenbergText(book.gutenbergId);
  const [introAnimationDone, setIntroAnimationDone] = useState(false);
  const [editingPage, setEditingPage] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");
  const introDone = introAnimationDone && !loading;

  // Use a placeholder page on error so the scene still renders
  const displayPages = useMemo(() => {
    if (error || pages.length === 0) {
      return [
        `${book.title}\n\n${book.longDescription}`,
        `The full text of this book could not be loaded.\n\nYou can read it at:\nhttps://www.gutenberg.org/ebooks/${book.gutenbergId}`,
      ];
    }
    return pages;
  }, [pages, error, book]);

  const introLeftText = !loading && pages[0] ? pages[0] : INTRO_LOREM_A;
  const introRightText = !loading && pages[1] ? pages[1] : INTRO_LOREM_B;

  const {
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
  } = usePageFlip(displayPages.length);

  const leftPageNum = currentSpread * 2 + 1;
  const rightPageNum = Math.min(leftPageNum + 1, displayPages.length);

  const drag = useRef<{
    pointerId: number;
    startX: number;
    lastX: number;
    lastT: number;
    velocity: number;
    fullFlipPx: number;
    rectHeight: number;
    rectTop: number;
    dir: "forward" | "backward";
    moved: boolean;
    active: boolean;
  } | null>(null);
  const tiltRef = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const dir: "forward" | "backward" =
        localX < rect.width / 2 ? "backward" : "forward";
      const started = startDrag(dir);
      if (!started) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const fullFlipPx = Math.max(
        160,
        Math.min(rect.width, rect.height) * 0.45
      );
      drag.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        lastX: e.clientX,
        lastT: performance.now(),
        velocity: 0,
        fullFlipPx,
        rectHeight: rect.height,
        rectTop: rect.top,
        dir,
        moved: false,
        active: true,
      };
      tiltRef.current =
        1 - (2 * (e.clientY - rect.top)) / rect.height; // +1 top, -1 bottom
    },
    [startDrag]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d || !d.active || e.pointerId !== d.pointerId) return;
      const dx = e.clientX - d.startX;
      if (!d.moved && Math.abs(dx) > 4) d.moved = true;
      const now = performance.now();
      const dt = Math.max(1, now - d.lastT);
      d.velocity = (e.clientX - d.lastX) / dt; // px per ms, signed
      d.lastX = e.clientX;
      d.lastT = now;
      const signed = d.dir === "forward" ? -dx : dx;
      updateDrag(signed / d.fullFlipPx);
      tiltRef.current =
        1 - (2 * (e.clientY - d.rectTop)) / d.rectHeight;
    },
    [updateDrag]
  );

  const finishDrag = useCallback(
    (commit?: boolean) => {
      const d = drag.current;
      if (!d || !d.active) return;
      d.active = false;
      drag.current = null;
      if (!d.moved) {
        // treat as a tap — commit the full flip
        endDrag(true);
        return;
      }
      const progress = progressRef.current;
      // velocity sign that corresponds to commit:
      //   forward drag commits when cursor is moving left (velocity < 0)
      //   backward drag commits when cursor is moving right (velocity > 0)
      const commitVelocity =
        d.dir === "forward" ? -d.velocity : d.velocity;
      const shouldCommit =
        commit ?? (progress > 0.5 || commitVelocity > 0.6);
      endDrag(shouldCommit);
    },
    [endDrag, progressRef]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // already released
      }
      finishDrag();
    },
    [finishDrag]
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      finishDrag(false);
    },
    [finishDrag]
  );

  useEffect(() => {
    if (!introDone) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") flipForward();
      else if (event.key === "ArrowLeft") flipBackward();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipForward, flipBackward, introDone]);

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

      {introDone && (
        <>
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
        </>
      )}

      <div
        className="absolute inset-0"
        style={{
          cursor: introDone ? (direction ? "grabbing" : "grab") : "default",
          touchAction: "none",
          pointerEvents: introDone ? "auto" : "none",
        }}
        onPointerDown={introDone ? handlePointerDown : undefined}
        onPointerMove={introDone ? handlePointerMove : undefined}
        onPointerUp={introDone ? handlePointerUp : undefined}
        onPointerCancel={introDone ? handlePointerCancel : undefined}
      >
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6.5], fov: 45 }}
          style={{ width: "100%", height: "100%" }}
          shadows
        >
          {introDone ? (
            <ReaderScene
              pages={displayPages}
              bookTitle={book.title}
              currentSpread={currentSpread}
              direction={direction}
              progressRef={progressRef}
              tiltRef={tiltRef}
            />
          ) : (
            <IntroScene
              book={book}
              ready={!loading}
              leftPageText={introLeftText}
              rightPageText={introRightText}
              leftPageNumber={1}
              rightPageNumber={2}
              totalPages={
                !loading && pages.length > 0 ? pages.length : 320
              }
              onDone={() => setIntroAnimationDone(true)}
            />
          )}
        </Canvas>
      </div>

      {introDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#C9A96E] bg-black/50 border border-white/10 rounded-full px-4 py-2 backdrop-blur"
        >
          <span>{book.title}</span>
          <span className="text-[#E8E0D0]/40">·</span>
          {editingPage ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const p = parseInt(pageInputValue, 10);
                if (!isNaN(p) && p >= 1 && p <= displayPages.length) {
                  goTo(Math.floor((p - 1) / 2));
                }
                setEditingPage(false);
              }}
              className="inline-block"
            >
              <input
                autoFocus
                type="number"
                min={1}
                max={displayPages.length}
                value={pageInputValue}
                onChange={(e) => setPageInputValue(e.target.value)}
                onBlur={() => setEditingPage(false)}
                className="w-16 bg-transparent border-b border-[#C9A96E] text-center outline-none text-[#C9A96E] p-0 m-0"
              />
            </form>
          ) : (
            <span
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => {
                setPageInputValue(String(leftPageNum));
                setEditingPage(true);
              }}
              title="Go to page"
            >
              {leftPageNum}
              {rightPageNum !== leftPageNum && rightPageNum <= displayPages.length ? `–${rightPageNum}` : ""}
            </span>
          )}
          <span> / {displayPages.length}</span>
        </motion.div>
      )}

    </motion.div>
  );
}
