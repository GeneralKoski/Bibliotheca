import { forwardRef, memo, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CanvasTexture,
  Group,
  LinearFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";
import type { Book } from "../../types";
import {
  generateBackCoverTexture,
  generateCoverTexture,
  generatePagesTexture,
  generateSpineTexture,
} from "../../utils/generateCover";

interface Book3DProps {
  book: Book;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  onSelect: (book: Book) => void;
}

// Pages edge texture is identical for every book — build it once.
let sharedPagesTexture: CanvasTexture | null = null;
function getSharedPagesTexture(): CanvasTexture {
  if (sharedPagesTexture) return sharedPagesTexture;
  const t = new CanvasTexture(generatePagesTexture());
  t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearFilter;
  sharedPagesTexture = t;
  return t;
}

function useBookTextures(book: Book) {
  return useMemo(() => {
    const front = new CanvasTexture(generateCoverTexture(book));
    front.colorSpace = SRGBColorSpace;
    front.anisotropy = 8;
    front.needsUpdate = true;
    const back = new CanvasTexture(generateBackCoverTexture(book));
    back.colorSpace = SRGBColorSpace;
    const spine = new CanvasTexture(generateSpineTexture(book));
    spine.colorSpace = SRGBColorSpace;
    const pages = getSharedPagesTexture();
    return { front, back, spine, pages };
    // book.color / title / author / year drive the generated textures
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id, book.color, book.title, book.author, book.year]);
}

export const Book3D = memo(
  forwardRef<Group, Book3DProps>(function Book3D(
    { book, position, rotation, scale, onSelect },
    ref
  ) {
    const textures = useBookTextures(book);
    const [frontTexture, setFrontTexture] = useState<Texture>(textures.front);
    const hoverRef = useRef<Group>(null);
    const hovered = useRef(false);

    useEffect(() => {
      setFrontTexture(textures.front);
      if (book.coverId == null) return;
      const loader = new TextureLoader();
      loader.setCrossOrigin("anonymous");
      let cancelled = false;
      loader.load(
        `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`,
        (texture) => {
          if (cancelled) {
            texture.dispose();
            return;
          }
          texture.colorSpace = SRGBColorSpace;
          texture.anisotropy = 8;
          setFrontTexture(texture);
        },
        undefined,
        () => {
          // keep procedural
        }
      );
      return () => {
        cancelled = true;
      };
    }, [book.coverId, textures.front]);

    useEffect(() => {
      return () => {
        textures.front.dispose();
        textures.back.dispose();
        textures.spine.dispose();
        // textures.pages is shared across all Book3D instances — don't dispose it here
      };
    }, [textures]);

    useFrame(() => {
      if (!hoverRef.current) return;
      const target = hovered.current ? Math.PI / 12 : 0;
      hoverRef.current.rotation.y +=
        (target - hoverRef.current.rotation.y) * 0.12;
    });

    return (
      <group
        ref={ref}
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          hovered.current = false;
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(book);
        }}
      >
        <group ref={hoverRef}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 2.2, 0.18]} />
            {/* Material order: +X, -X, +Y, -Y, +Z, -Z */}
            <meshStandardMaterial
              attach="material-0"
              map={textures.pages}
              roughness={0.85}
            />
            <meshStandardMaterial
              attach="material-1"
              map={textures.spine}
              roughness={0.6}
            />
            <meshStandardMaterial
              attach="material-2"
              map={textures.pages}
              roughness={0.85}
            />
            <meshStandardMaterial
              attach="material-3"
              map={textures.pages}
              roughness={0.85}
            />
            <meshStandardMaterial
              attach="material-4"
              map={frontTexture}
              roughness={0.5}
              metalness={0.05}
            />
            <meshStandardMaterial
              attach="material-5"
              map={textures.back}
              roughness={0.65}
            />
          </mesh>
        </group>
      </group>
    );
  })
);
