import { useRef, useState } from 'react';
import type { Mesh } from 'three';
import type { ParallelepipedParticle } from '../nanosystems/api/nanosystemTypes';

interface ParallelepipedMeshProps {
  particle: ParallelepipedParticle;
  onSelect?: (id: string) => void;
}

export function ParallelepipedMesh({ particle, onSelect }: ParallelepipedMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={[particle.x, particle.y, particle.z]}
      ref={meshRef}
      rotation={[particle.fi, particle.theta, particle.zenit]}
      onClick={() => onSelect?.(particle.id)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={1}
    >
      <boxGeometry args={[particle.a, particle.a, particle.a * particle.e]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
