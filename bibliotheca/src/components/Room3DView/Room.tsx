interface RoomProps {
  size: number;
  height: number;
}

export function Room({ size, height }: RoomProps) {
  const half = size / 2;

  return (
    <group>
      {/* Floor */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#1a140d" roughness={0.95} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.9} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, height / 2, -half]} receiveShadow>
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial color="#15110b" roughness={0.95} />
      </mesh>

      {/* Left wall */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-half, height / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial color="#15110b" roughness={0.95} />
      </mesh>

      {/* Right wall */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[half, height / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[size, height]} />
        <meshStandardMaterial color="#15110b" roughness={0.95} />
      </mesh>

      {/* Floor rug for warmth */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        receiveShadow
      >
        <planeGeometry args={[size * 0.6, size * 0.6]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </mesh>
    </group>
  );
}
