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
  slotsPerShelf: number;
  onSelect: (book: Book) => void;
  onHover: (book: Book | null) => void;
}

const BOOK_BASE_HEIGHT = 0.95;
const BOOK_DEPTH = 0.55;
const SHELF_THICKNESS = 0.08;

export function ShelfRow({
  books,
  position,
  rotation,
  width,
  depth,
  slotsPerShelf,
  onSelect,
  onHover,
}: ShelfRowProps) {
  const slotWidth = width / slotsPerShelf;

  return (
    <group position={position} rotation={rotation}>
      {/* Shelf board with rounded look via two boxes */}
      <mesh
        receiveShadow
        castShadow
        position={[0, -BOOK_BASE_HEIGHT / 2 - 0.04, 0]}
      >
        <boxGeometry args={[width + 0.4, SHELF_THICKNESS, depth + 0.1]} />
        <meshStandardMaterial color="#3a2316" roughness={0.65} />
      </mesh>
      {/* Lip */}
      <mesh
        position={[0, -BOOK_BASE_HEIGHT / 2 - 0.005, depth / 2 + 0.02]}
      >
        <boxGeometry args={[width + 0.4, 0.03, 0.04]} />
        <meshStandardMaterial color="#2a1810" roughness={0.6} />
      </mesh>
      {/* Back panel */}
      <mesh position={[0, 0, -depth / 2 - 0.01]} receiveShadow>
        <planeGeometry args={[width + 0.4, BOOK_BASE_HEIGHT + 0.2]} />
        <meshStandardMaterial color="#0e0805" roughness={0.95} />
      </mesh>

      {books.map((book, i) => (
        <ShelvedBook
          key={book.id}
          book={book}
          index={i}
          position={[
            -width / 2 + slotWidth * (i + 0.5),
            0,
            BOOK_DEPTH / 2 - depth / 2 + 0.02,
          ]}
          slotWidth={slotWidth * 0.96}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

interface ShelvedBookProps {
  book: Book;
  index: number;
  position: [number, number, number];
  slotWidth: number;
  onSelect: (book: Book) => void;
  onHover: (book: Book | null) => void;
}

function ShelvedBook({
  book,
  index,
  position,
  slotWidth,
  onSelect,
  onHover,
}: ShelvedBookProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const { spine, front, height } = useMemo(() => {
    const sp = new CanvasTexture(generateSpineTexture(book));
    sp.colorSpace = SRGBColorSpace;
    sp.anisotropy = 8;
    const fr = new CanvasTexture(generateCoverTexture(book));
    fr.colorSpace = SRGBColorSpace;
    fr.anisotropy = 8;
    const seed = book.id * 9301 + 49297;
    const rand = (n: number) => ((seed * (n + 1)) % 1000) / 1000;
    // Subtle height variation only — 92% to 102% of base
    const heightFactor = 0.92 + rand(1) * 0.1;
    return {
      spine: sp,
      front: fr,
      height: BOOK_BASE_HEIGHT * heightFactor,
    };
  }, [book]);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetZ = hovered ? 0.18 : 0;
    const targetY = hovered ? 0.06 : 0;
    groupRef.current.position.z +=
      (position[2] + targetZ - groupRef.current.position.z) * 0.18;
    groupRef.current.position.y +=
      (position[1] - (BOOK_BASE_HEIGHT - height) / 2 + targetY -
        groupRef.current.position.y) *
      0.18;
  });


  return (
    <group
      ref={groupRef}
      position={[
        position[0],
        position[1] - (BOOK_BASE_HEIGHT - height) / 2,
        position[2],
      ]}
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
        <boxGeometry args={[slotWidth, height, BOOK_DEPTH]} />
        <meshStandardMaterial
          attach="material-0"
          color={book.color}
          roughness={0.8}
        />
        <meshStandardMaterial
          attach="material-1"
          map={spine}
          roughness={0.55}
        />
        <meshStandardMaterial
          attach="material-2"
          color="#e6dcc4"
          roughness={0.9}
        />
        <meshStandardMaterial
          attach="material-3"
          color="#e6dcc4"
          roughness={0.9}
        />
        <meshStandardMaterial
          attach="material-4"
          map={front}
          roughness={0.5}
        />
        <meshStandardMaterial
          attach="material-5"
          color={book.color}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}
