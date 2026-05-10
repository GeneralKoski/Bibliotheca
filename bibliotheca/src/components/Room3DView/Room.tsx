import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

interface RoomProps {
  size: number;
  height: number;
}

function makeFloorTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#2a1d12";
  ctx.fillRect(0, 0, 512, 512);
  const plankH = 64;
  for (let y = 0; y < 512; y += plankH) {
    const shade = 18 + Math.floor(Math.random() * 22);
    ctx.fillStyle = `rgb(${42 + shade}, ${28 + shade * 0.6}, ${18 + shade * 0.4})`;
    ctx.fillRect(0, y, 512, plankH);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, y, 512, 1);
    const seamX = (y * 137) % 512;
    ctx.fillRect(seamX, y, 1, plankH);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${10 + Math.random() * 25}, ${5 + Math.random() * 18}, 4, ${0.05 + Math.random() * 0.1})`;
      const gx = Math.random() * 512;
      const gw = 40 + Math.random() * 80;
      ctx.fillRect(gx, y + Math.random() * plankH, gw, 1);
    }
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function makeWallTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#382418");
  grad.addColorStop(1, "#26170d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = `rgba(${60 + Math.random() * 30}, ${38 + Math.random() * 20}, 22, ${Math.random() * 0.06})`;
    ctx.fillRect(x, y, 1, 1);
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function makeRugTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#5a2418";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "#3a1408";
  ctx.lineWidth = 12;
  ctx.strokeRect(14, 14, 256 - 28, 256 - 28);
  ctx.strokeStyle = "#8a4528";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 256 - 40, 256 - 40);
  ctx.fillStyle = "#7a3018";
  ctx.beginPath();
  ctx.ellipse(128, 128, 50, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a1408";
  ctx.beginPath();
  ctx.ellipse(128, 128, 30, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = `rgba(${120 + Math.random() * 40}, ${50 + Math.random() * 25}, 30, 0.5)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function Room({ size, height }: RoomProps) {
  const half = size / 2;
  const floorTex = useMemo(makeFloorTexture, []);
  const wallTex = useMemo(makeWallTexture, []);
  const rugTex = useMemo(makeRugTexture, []);

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={floorTex} roughness={0.85} />
      </mesh>

      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.002, 1.5]}
      >
        <planeGeometry args={[size * 0.45, size * 0.55]} />
        <meshStandardMaterial map={rugTex} roughness={0.95} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#0e0805" roughness={0.95} />
      </mesh>

      <mesh position={[0, height / 2, -half]} receiveShadow>
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} />
      </mesh>

      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-half, height / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} />
      </mesh>

      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[half, height / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} />
      </mesh>

      {/* Crown molding */}
      <mesh position={[0, height - 0.05, -half + 0.06]}>
        <boxGeometry args={[size, 0.14, 0.12]} />
        <meshStandardMaterial color="#1a0e07" roughness={0.7} />
      </mesh>
      <mesh
        position={[-half + 0.06, height - 0.05, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[size, 0.14, 0.12]} />
        <meshStandardMaterial color="#1a0e07" roughness={0.7} />
      </mesh>
      <mesh
        position={[half - 0.06, height - 0.05, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[size, 0.14, 0.12]} />
        <meshStandardMaterial color="#1a0e07" roughness={0.7} />
      </mesh>

      {/* Baseboard */}
      <mesh position={[0, 0.06, -half + 0.06]}>
        <boxGeometry args={[size, 0.16, 0.08]} />
        <meshStandardMaterial color="#0e0805" roughness={0.7} />
      </mesh>
      <mesh position={[-half + 0.06, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[size, 0.16, 0.08]} />
        <meshStandardMaterial color="#0e0805" roughness={0.7} />
      </mesh>
      <mesh position={[half - 0.06, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[size, 0.16, 0.08]} />
        <meshStandardMaterial color="#0e0805" roughness={0.7} />
      </mesh>
    </group>
  );
}
