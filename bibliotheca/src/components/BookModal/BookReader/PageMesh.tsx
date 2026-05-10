import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { buildPageCanvas } from "./buildPageCanvas";
import { useReaderStyle } from "./readerStyle";

interface PageMeshProps {
  text: string;
  pageNumber: number;
  totalPages: number;
  bookTitle: string;
  position: [number, number, number];
}

export function PageMesh({
  text,
  pageNumber,
  totalPages,
  bookTitle,
  position,
}: PageMeshProps) {
  const style = useReaderStyle();
  const texture = useMemo(() => {
    const t = new CanvasTexture(
      buildPageCanvas({ text, pageNumber, totalPages, bookTitle, style })
    );
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [text, pageNumber, totalPages, bookTitle, style]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  return (
    <mesh position={position}>
      <planeGeometry args={[3, 4, 1, 1]} />
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  );
}
