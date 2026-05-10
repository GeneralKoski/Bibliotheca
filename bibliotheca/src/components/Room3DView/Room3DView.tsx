import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ACESFilmicToneMapping } from "three";
import type { Book } from "../../types";
import { Room } from "./Room";
import {
  DustParticles,
  FloorLamp,
  Painting,
  ReadingTable,
} from "./RoomProps";
import { ShelfRow } from "./ShelfRow";

interface Room3DViewProps {
  books: Book[];
  onOpen: (book: Book) => void;
}

const ROOM_SIZE = 12;
const ROOM_HEIGHT = 5;
const SHELF_DEPTH = 0.4;
const SHELF_HEIGHTS = [1.0, 2.05, 3.1, 4.05];
const BOOKS_PER_SHELF = 22;

export function Room3DView({ books, onOpen }: Room3DViewProps) {
  const [hovered, setHovered] = useState<Book | null>(null);

  const shelves = useMemo(() => {
    if (books.length === 0) return [];
    const totalShelves = Math.ceil(books.length / BOOKS_PER_SHELF);
    const out: Book[][] = [];
    for (let s = 0; s < totalShelves; s++) {
      out.push(books.slice(s * BOOKS_PER_SHELF, (s + 1) * BOOKS_PER_SHELF));
    }
    return out;
  }, [books]);

  return (
    <div className="absolute inset-0 z-10">
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 2.2, 5.5], fov: 60 }}
        gl={{ toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#0d0805"]} />
        <fog attach="fog" args={["#1a0d05", 12, 28]} />

        <ambientLight intensity={0.18} color="#3a2a18" />
        <hemisphereLight
          intensity={0.25}
          color="#d9a866"
          groundColor="#1a0d05"
        />
        <directionalLight
          position={[-4, 5, 3]}
          intensity={0.4}
          color="#a8b8d0"
        />
        <pointLight
          position={[0, ROOM_HEIGHT - 0.6, 1.5]}
          intensity={2.4}
          color="#f3a85c"
          distance={10}
          decay={1.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight
          position={[ROOM_SIZE / 2 - 1.5, 1.6, ROOM_SIZE / 2 - 1.5]}
          intensity={1.0}
          color="#d97a3a"
          distance={6}
          decay={2}
        />
        {/* Wash on the back wall so shelves read clearly */}
        <pointLight
          position={[0, ROOM_HEIGHT - 0.4, -ROOM_SIZE / 2 + 1.8]}
          intensity={1.6}
          color="#f3c98a"
          distance={9}
          decay={1.6}
        />
        <pointLight
          position={[-ROOM_SIZE / 2 + 1.5, ROOM_HEIGHT - 0.6, -1.5]}
          intensity={0.8}
          color="#f3a85c"
          distance={6}
          decay={1.8}
        />
        <pointLight
          position={[ROOM_SIZE / 2 - 1.5, ROOM_HEIGHT - 0.6, -1.5]}
          intensity={0.8}
          color="#f3a85c"
          distance={6}
          decay={1.8}
        />

        <Room size={ROOM_SIZE} height={ROOM_HEIGHT} />
        <DustParticles count={240} />

        <FloorLamp position={[ROOM_SIZE / 2 - 1.0, 0, ROOM_SIZE / 2 - 1.0]} />
        <ReadingTable position={[0, 0, 1.2]} />
        <Painting
          position={[0, 4.0, -ROOM_SIZE / 2 + 0.06]}
          rotation={[0, 0, 0]}
          color="#3a2818"
        />

        {shelves.slice(0, SHELF_HEIGHTS.length).map((row, idx) => (
          <ShelfRow
            key={`back-${idx}`}
            books={row}
            position={[0, SHELF_HEIGHTS[idx] ?? 1.0, -ROOM_SIZE / 2 + SHELF_DEPTH]}
            rotation={[0, 0, 0]}
            width={ROOM_SIZE - 1.2}
            depth={SHELF_DEPTH}
            onSelect={onOpen}
            onHover={setHovered}
          />
        ))}

        {shelves
          .slice(SHELF_HEIGHTS.length, SHELF_HEIGHTS.length * 2)
          .map((row, idx) => (
            <ShelfRow
              key={`left-${idx}`}
              books={row}
              position={[
                -ROOM_SIZE / 2 + SHELF_DEPTH,
                SHELF_HEIGHTS[idx] ?? 1.0,
                0,
              ]}
              rotation={[0, Math.PI / 2, 0]}
              width={ROOM_SIZE - 1.2}
              depth={SHELF_DEPTH}
              onSelect={onOpen}
              onHover={setHovered}
            />
          ))}

        {shelves
          .slice(SHELF_HEIGHTS.length * 2, SHELF_HEIGHTS.length * 3)
          .map((row, idx) => (
            <ShelfRow
              key={`right-${idx}`}
              books={row}
              position={[
                ROOM_SIZE / 2 - SHELF_DEPTH,
                SHELF_HEIGHTS[idx] ?? 1.0,
                0,
              ]}
              rotation={[0, -Math.PI / 2, 0]}
              width={ROOM_SIZE - 1.2}
              depth={SHELF_DEPTH}
              onSelect={onOpen}
              onHover={setHovered}
            />
          ))}

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2.5}
          maxDistance={9}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 2.0, 0]}
          rotateSpeed={0.5}
          zoomSpeed={0.5}
        />
      </Canvas>

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-1 px-5 py-3 rounded-full bg-[#0A0A0F]/85 backdrop-blur border"
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
