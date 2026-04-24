import { forwardRef } from "react";
import type { Group } from "three";
import type { Book } from "../../types";

interface Book3DProps {
  book: Book;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  onSelect: (book: Book) => void;
}

export const Book3D = forwardRef<Group, Book3DProps>(function Book3D(
  { book, position, rotation, scale, onSelect },
  ref
) {
  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(book);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 2.2, 0.35]} />
        <meshStandardMaterial color={book.color} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
});
