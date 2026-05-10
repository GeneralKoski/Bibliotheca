import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Book } from "../../types";
import { Room } from "./Room";
import { ShelfRow } from "./ShelfRow";

interface Room3DViewProps {
  books: Book[];
  onOpen: (book: Book) => void;
}

const ROOM_SIZE = 16;
const ROOM_HEIGHT = 6;
const SHELF_DEPTH = 0.4;
const SHELF_HEIGHTS = [1.2, 2.4, 3.6, 4.8];
const BOOKS_PER_SHELF = 14;

export function Room3DView({ books, onOpen }: Room3DViewProps) {
  const [hovered, setHovered] = useState<Book | null>(null);

  const shelves = useMemo(() => {
    if (books.length === 0) return [];
    const totalShelves = Math.ceil(books.length / BOOKS_PER_SHELF);
    const out: { book: Book; shelfIndex: number; slotIndex: number }[][] = [];
    for (let s = 0; s < totalShelves; s++) {
      out.push(
        books
          .slice(s * BOOKS_PER_SHELF, (s + 1) * BOOKS_PER_SHELF)
          .map((book, slotIndex) => ({ book, shelfIndex: s, slotIndex }))
      );
    }
    return out;
  }, [books]);

  return (
    <div className="absolute inset-0 z-10">
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 2.4, 10], fov: 55 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#0A0A0F"]} />
        <fog attach="fog" args={["#0A0A0F", 12, 28]} />
        <ambientLight intensity={0.45} />
        <directionalLight
          position={[6, 8, 6]}
          intensity={1.0}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[0, 4.5, 0]} intensity={1.4} color="#C9A96E" />
        <pointLight position={[-5, 2, 4]} intensity={0.6} color="#7a6a52" />

        <Room size={ROOM_SIZE} height={ROOM_HEIGHT} />

        {/* Back-wall shelves */}
        {shelves.slice(0, SHELF_HEIGHTS.length).map((row, idx) => (
          <ShelfRow
            key={`back-${idx}`}
            books={row.map((r) => r.book)}
            position={[0, SHELF_HEIGHTS[idx] ?? 1.2, -ROOM_SIZE / 2 + SHELF_DEPTH]}
            rotation={[0, 0, 0]}
            width={ROOM_SIZE - 1}
            depth={SHELF_DEPTH}
            onSelect={onOpen}
            onHover={setHovered}
          />
        ))}

        {/* Left-wall shelves */}
        {shelves
          .slice(SHELF_HEIGHTS.length, SHELF_HEIGHTS.length * 2)
          .map((row, idx) => (
            <ShelfRow
              key={`left-${idx}`}
              books={row.map((r) => r.book)}
              position={[
                -ROOM_SIZE / 2 + SHELF_DEPTH,
                SHELF_HEIGHTS[idx] ?? 1.2,
                0,
              ]}
              rotation={[0, Math.PI / 2, 0]}
              width={ROOM_SIZE - 1}
              depth={SHELF_DEPTH}
              onSelect={onOpen}
              onHover={setHovered}
            />
          ))}

        {/* Right-wall shelves */}
        {shelves
          .slice(SHELF_HEIGHTS.length * 2, SHELF_HEIGHTS.length * 3)
          .map((row, idx) => (
            <ShelfRow
              key={`right-${idx}`}
              books={row.map((r) => r.book)}
              position={[
                ROOM_SIZE / 2 - SHELF_DEPTH,
                SHELF_HEIGHTS[idx] ?? 1.2,
                0,
              ]}
              rotation={[0, -Math.PI / 2, 0]}
              width={ROOM_SIZE - 1}
              depth={SHELF_DEPTH}
              onSelect={onOpen}
              onHover={setHovered}
            />
          ))}

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={3}
          maxDistance={14}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 2.4, 0]}
          rotateSpeed={0.6}
          zoomSpeed={0.6}
        />
      </Canvas>

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-1 px-5 py-3 rounded-full bg-[#0A0A0F]/85 backdrop-blur border border-[#3a332a]"
          style={{ borderColor: hovered.color }}
        >
          <span className="font-display text-[16px] text-[#E8E0D0]">
            {hovered.title}
          </span>
          <span className="text-[9px] uppercase tracking-[0.32em] text-[#9a9286]">
            {hovered.author} · {hovered.year}
          </span>
        </motion.div>
      )}

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 py-2 rounded-full border border-[#3a332a] bg-[#0A0A0F]/60 backdrop-blur text-[9px] uppercase tracking-[0.32em] text-[#9a9286]">
        drag to look · scroll to zoom · click a book to open
      </div>
    </div>
  );
}
