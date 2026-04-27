import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
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

const PAGE_W = 3;
const PAGE_H = 4;
const PAGE_SEGMENTS = 10;

const FLIP_COUNT = 6;
const CYCLE_MS = 600;
const FLIP_MS = 600;
const STAGGER_MS = 100;
const FADE_MS = 120;

const MIN_FLIP_MS = 600;

function computeExitAt(stopAt: number, offsetMs: number): number {
  const rel = stopAt - offsetMs;
  if (rel <= 0) return stopAt;
  return offsetMs + Math.ceil(rel / CYCLE_MS) * CYCLE_MS;
}

const LOREM_BASE = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.\n\nEaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.\n\nNeque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.\n\nSed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.\n\nQuis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.\n\nVel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.\n\nQuos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa.\n\nQui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
  "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit.\n\nQuo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.\n\nTemporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.",
  "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.\n\nIn hac sententia Democritus multa multis modis disputavit, quae a natura perfecta essent secundum naturam ordinata.\n\nHaec igitur idea principium est virtutis atque beatae vitae.",
];

function makeFlipGeometry(): PlaneGeometry {
  const geom = new PlaneGeometry(PAGE_W, PAGE_H, PAGE_SEGMENTS, 1);
  geom.translate(PAGE_W / 2, 0, 0);
  return geom;
}

function makePageTexture(
  canvas: HTMLCanvasElement,
  mirror: boolean,
): CanvasTexture {
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  if (mirror) {
    t.wrapS = RepeatWrapping;
    t.repeat.x = -1;
    t.offset.x = 1;
  }
  t.needsUpdate = true;
  return t;
}

interface IntroFlipPageLoopProps {
  startRef: React.MutableRefObject<number>;
  stopAtMsRef: React.MutableRefObject<number | null>;
  offsetMs: number;
  frontText: string;
  backText: string;
  frontPageNumber: number;
  backPageNumber: number;
  totalPages: number;
  bookTitle: string;
  zOffset: number;
}

function IntroFlipPageLoop({
  startRef,
  stopAtMsRef,
  offsetMs,
  frontText,
  backText,
  frontPageNumber,
  backPageNumber,
  totalPages,
  bookTitle,
  zOffset,
}: IntroFlipPageLoopProps) {
  const groupRef = useRef<Group>(null);
  const frontMatRef = useRef<import("three").MeshStandardMaterial | null>(null);
  const backMatRef = useRef<import("three").MeshStandardMaterial | null>(null);

  const { frontGeom, backGeom, frontTex, backTex, initialPositions } = useMemo(
    () => {
      const fg = makeFlipGeometry();
      const bg = makeFlipGeometry();
      const ft = makePageTexture(
        buildPageCanvas({
          text: frontText,
          pageNumber: frontPageNumber,
          totalPages,
          bookTitle,
        }),
        false,
      );
      const bt = makePageTexture(
        buildPageCanvas({
          text: backText,
          pageNumber: backPageNumber,
          totalPages,
          bookTitle,
        }),
        true,
      );
      const pa = fg.attributes.position as BufferAttribute;
      const ip = new Float32Array(pa.array);
      return {
        frontGeom: fg,
        backGeom: bg,
        frontTex: ft,
        backTex: bt,
        initialPositions: ip,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    return () => {
      frontGeom.dispose();
      backGeom.dispose();
      frontTex.dispose();
      backTex.dispose();
    };
  }, [frontGeom, backGeom, frontTex, backTex]);

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsedMs = performance.now() - startRef.current;
    const stopAt = stopAtMsRef.current;

    // After stop signal: page exits at the next natural cycle boundary, where
    // its opacity is already 0 due to the per-cycle fade. No global fade.
    if (stopAt !== null) {
      const exitAt = computeExitAt(stopAt, offsetMs);
      if (elapsedMs >= exitAt) {
        if (frontMatRef.current) frontMatRef.current.opacity = 0;
        if (backMatRef.current) backMatRef.current.opacity = 0;
        return;
      }
    }

    const rel = elapsedMs - offsetMs;
    if (rel < 0) {
      if (frontMatRef.current) frontMatRef.current.opacity = 0;
      if (backMatRef.current) backMatRef.current.opacity = 0;
      return;
    }

    const cyclePos = rel % CYCLE_MS;
    const p = Math.min(1, cyclePos / FLIP_MS);

    groupRef.current.rotation.y = -p * Math.PI;

    const liftEnvelope = Math.sin(p * Math.PI);
    const curveAmount = liftEnvelope * 0.55;
    const globalLift = liftEnvelope * 0.09;
    const frontPos = frontGeom.attributes.position as BufferAttribute;
    const backPos = backGeom.attributes.position as BufferAttribute;
    for (let i = 0; i < frontPos.count; i++) {
      const ix = i * 3;
      const x = initialPositions[ix];
      const y = initialPositions[ix + 1];
      const nx = x / PAGE_W;
      const profile = Math.sin(Math.pow(nx, 0.85) * Math.PI);
      const z = profile * curveAmount + globalLift * nx;
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

    let opacity: number;
    if (cyclePos < FADE_MS) opacity = cyclePos / FADE_MS;
    else if (cyclePos > FLIP_MS - FADE_MS)
      opacity = Math.max(0, (FLIP_MS - cyclePos) / FADE_MS);
    else opacity = 1;

    if (frontMatRef.current) frontMatRef.current.opacity = opacity;
    if (backMatRef.current) backMatRef.current.opacity = opacity;
  });

  return (
    <group ref={groupRef} position={[0, 0, zOffset]}>
      <mesh geometry={frontGeom}>
        <meshStandardMaterial
          ref={frontMatRef}
          map={frontTex}
          side={FrontSide}
          roughness={0.9}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh geometry={backGeom}>
        <meshStandardMaterial
          ref={backMatRef}
          map={backTex}
          side={BackSide}
          roughness={0.9}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}

interface IntroSceneProps {
  book: Book;
  ready: boolean;
  leftPageText: string;
  rightPageText: string;
  leftPageNumber: number;
  rightPageNumber: number;
  totalPages: number;
  onDone: () => void;
}

export function IntroScene({
  book,
  ready,
  leftPageText,
  rightPageText,
  leftPageNumber,
  rightPageNumber,
  totalPages,
  onDone,
}: IntroSceneProps) {
  const startRef = useRef(performance.now());
  const stopAtMsRef = useRef<number | null>(null);
  const doneAtMsRef = useRef<number | null>(null);
  const doneFiredRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!ready || stopAtMsRef.current !== null) return;
    const elapsed = performance.now() - startRef.current;
    const stopAt = Math.max(elapsed, MIN_FLIP_MS);
    stopAtMsRef.current = stopAt;
    let maxExit = stopAt;
    for (let i = 0; i < FLIP_COUNT; i++) {
      const exit = computeExitAt(stopAt, i * STAGGER_MS);
      if (exit > maxExit) maxExit = exit;
    }
    doneAtMsRef.current = maxExit;
  }, [ready]);

  useFrame(() => {
    const doneAt = doneAtMsRef.current;
    if (doneAt === null || doneFiredRef.current) return;
    const elapsedMs = performance.now() - startRef.current;
    if (elapsedMs >= doneAt) {
      doneFiredRef.current = true;
      onDoneRef.current();
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-3, 5, 3]} intensity={1.0} castShadow />
      <pointLight position={[0, 3, 4]} intensity={1.2} color="#FFF8E7" />

      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[0.1, PAGE_H, 0.3]} />
        <meshStandardMaterial color="#2a1810" roughness={0.8} />
      </mesh>

      <PageMesh
        text={leftPageText}
        pageNumber={leftPageNumber}
        totalPages={totalPages}
        bookTitle={book.title}
        position={[-PAGE_W / 2, 0, 0]}
      />
      <PageMesh
        text={rightPageText}
        pageNumber={rightPageNumber}
        totalPages={totalPages}
        bookTitle={book.title}
        position={[PAGE_W / 2, 0, 0]}
      />

      {Array.from({ length: FLIP_COUNT }).map((_, i) => (
        <IntroFlipPageLoop
          key={i}
          startRef={startRef}
          stopAtMsRef={stopAtMsRef}
          offsetMs={i * STAGGER_MS}
          frontText={LOREM_BASE[(i * 2) % LOREM_BASE.length]}
          backText={LOREM_BASE[(i * 2 + 1) % LOREM_BASE.length]}
          frontPageNumber={120 - i * 2}
          backPageNumber={120 - i * 2 - 1}
          totalPages={totalPages}
          bookTitle={book.title}
          zOffset={0.018 + (FLIP_COUNT - i) * 0.003}
        />
      ))}
    </>
  );
}
