import { useRef, useState } from 'react';
import type { Mesh } from 'three';
import type { SphereParticle } from '../nanosystems/api/nanosystemTypes';

interface SphereMeshProps {
  particle: SphereParticle;
  onSelect?: (id: string) => void;
}

export function SphereMesh({ particle, onSelect }: SphereMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={[particle.x, particle.y, particle.z]}
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect?.(particle.id)}
      scale={1}
    >
      <sphereGeometry args={[particle.radius]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
