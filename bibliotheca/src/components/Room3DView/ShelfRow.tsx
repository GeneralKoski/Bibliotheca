import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, type Group, SRGBColorSpace } from "three";
import type { Book } from "../../types";
import {
  generateCoverTexture,
  generateSpineTexture,
} from "../../utils/generateCover";

interface ShelfRowProps {
  books: Book[];
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  depth: number;
  onSelect: (book: Book) => void;
  onHover: (book: Book | null) => void;
}

const BOOK_HEIGHT = 0.95;
const BOOK_DEPTH = 0.6;
const SHELF_THICKNESS = 0.06;

export function ShelfRow({
  books,
  position,
  rotation,
  width,
  depth,
  onSelect,
  onHover,
}: ShelfRowProps) {
  const slotWidth = width / Math.max(books.length, 1);

  return (
    <group position={position} rotation={rotation}>
      {/* Shelf board */}
      <mesh receiveShadow castShadow position={[0, -BOOK_HEIGHT / 2 - 0.02, 0]}>
        <boxGeometry args={[width + 0.2, SHELF_THICKNESS, depth + 0.05]} />
        <meshStandardMaterial color="#2a1d10" roughness={0.85} />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 0, -depth / 2 + 0.02]}>
        <planeGeometry args={[width + 0.2, BOOK_HEIGHT + 0.1]} />
        <meshStandardMaterial color="#0e0a06" roughness={0.95} />
      </mesh>

      {books.map((book, i) => (
        <ShelvedBook
          key={book.id}
          book={book}
          position={[
            -width / 2 + slotWidth * (i + 0.5),
            0,
            BOOK_DEPTH / 2 - depth / 2 - 0.02,
          ]}
          slotWidth={Math.min(slotWidth * 0.85, 0.18)}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

interface ShelvedBookProps {
  book: Book;
  position: [number, number, number];
  slotWidth: number;
  onSelect: (book: Book) => void;
  onHover: (book: Book | null) => void;
}

function ShelvedBook({
  book,
  position,
  slotWidth,
  onSelect,
  onHover,
}: ShelvedBookProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const { spine, front } = useMemo(() => {
    const sp = new CanvasTexture(generateSpineTexture(book));
    sp.colorSpace = SRGBColorSpace;
    const fr = new CanvasTexture(generateCoverTexture(book));
    fr.colorSpace = SRGBColorSpace;
    return { spine: sp, front: fr };
  }, [book]);

  // Per-book height variation for organic look
  const heightJitter = useMemo(
    () => 0.85 + ((book.id * 37) % 15) / 100,
    [book.id]
  );
  const h = BOOK_HEIGHT * heightJitter;

  useFrame(() => {
    if (!groupRef.current) return;
    const targetZ = hovered ? 0.18 : 0;
    const targetY = hovered ? 0.05 : 0;
    groupRef.current.position.z +=
      (position[2] + targetZ - groupRef.current.position.z) * 0.18;
    groupRef.current.position.y +=
      (position[1] + targetY - groupRef.current.position.y) * 0.18;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(book);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(book);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[slotWidth, h, BOOK_DEPTH]} />
        <meshStandardMaterial
          attach="material-0"
          color={book.color}
          roughness={0.7}
        />
        <meshStandardMaterial
          attach="material-1"
          map={spine}
          roughness={0.6}
        />
        <meshStandardMaterial
          attach="material-2"
          color="#f3ecd9"
          roughness={0.85}
        />
        <meshStandardMaterial
          attach="material-3"
          color="#f3ecd9"
          roughness={0.85}
        />
        <meshStandardMaterial
          attach="material-4"
          map={front}
          roughness={0.5}
        />
        <meshStandardMaterial
          attach="material-5"
          color={book.color}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}
