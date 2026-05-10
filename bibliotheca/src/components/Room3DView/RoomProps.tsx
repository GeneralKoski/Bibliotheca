import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, type Points } from "three";

export function DustParticles({ count = 220 }: { count?: number }) {
  const ref = useRef<Points>(null);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 5 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    g.setAttribute("position", new BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position as BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += 0.0008 + (i % 7) * 0.00005;
      if (arr[i + 1] > 5.5) arr[i + 1] = 0.4;
      arr[i] += Math.sin(t * 0.4 + i) * 0.0006;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#f7c98a"
        size={0.025}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function FloorLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh castShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.08, 24]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Pole */}
      <mesh castShadow position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 2.0, 12]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Shade */}
      <mesh castShadow position={[0, 2.15, 0]}>
        <coneGeometry args={[0.32, 0.4, 18, 1, true]} />
        <meshStandardMaterial
          color="#d9a866"
          emissive="#d9a866"
          emissiveIntensity={0.6}
          roughness={0.4}
          side={2}
        />
      </mesh>
      {/* Bulb light */}
      <pointLight
        position={[0, 2.0, 0]}
        intensity={1.5}
        color="#f3c98a"
        distance={9}
        decay={1.6}
        castShadow
      />
    </group>
  );
}

export function ReadingTable({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Top */}
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.7]} />
        <meshStandardMaterial color="#3a2316" roughness={0.55} />
      </mesh>
      {/* Legs */}
      {[
        [-0.5, 0.35, -0.3],
        [0.5, 0.35, -0.3],
        [-0.5, 0.35, 0.3],
        [0.5, 0.35, 0.3],
      ].map((p, i) => (
        <mesh key={i} castShadow position={p as [number, number, number]}>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshStandardMaterial color="#2a1810" roughness={0.6} />
        </mesh>
      ))}
      {/* Stack of books on table */}
      <mesh castShadow position={[-0.3, 0.78, 0.05]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.06, 0.22]} />
        <meshStandardMaterial color="#7a2818" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.32, 0.835, 0.04]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.28, 0.05, 0.2]} />
        <meshStandardMaterial color="#2a4a3a" roughness={0.7} />
      </mesh>
      {/* Candle */}
      <mesh castShadow position={[0.35, 0.78, -0.1]}>
        <cylinderGeometry args={[0.05, 0.06, 0.08, 12]} />
        <meshStandardMaterial color="#8a6a3a" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0.35, 0.85, -0.1]}>
        <cylinderGeometry args={[0.018, 0.018, 0.07, 8]} />
        <meshStandardMaterial color="#f3e8c8" roughness={0.85} />
      </mesh>
      <pointLight
        position={[0.35, 0.95, -0.1]}
        intensity={0.4}
        color="#ffb060"
        distance={3}
        decay={2}
      />
    </group>
  );
}

export function Painting({
  position,
  rotation,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[1.1, 1.4, 0.06]} />
        <meshStandardMaterial color="#3a2818" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[0.95, 1.25]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}
