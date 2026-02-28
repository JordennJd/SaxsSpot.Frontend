import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import type { ParallelepipedParticle, SphereParticle } from '../nanosystems/api/nanosystemTypes';
import { getNanosystemParticles } from '../nanosystems/api/nanosystemApi';
import { ParallelepipedMesh } from './ParallelepipedMesh';
import { SphereMesh } from './SphereMesh';
import './NanosystemViewer3D.css';

interface NanosystemViewer3DProps {
  /** Pre-loaded parallelepiped particles */
  parallelepipeds?: ParallelepipedParticle[];
  /** Pre-loaded sphere particles */
  spheres?: SphereParticle[];
  /** If set, load particles from API (overrides props when loaded) */
  nanosystemId?: string;
  /** 0 = Sphere, 1 = Parallelepiped. Used when loading by nanosystemId */
  particleKind?: 0 | 1;
  skip?: number;
  take?: number;
  /** Called when a particle is selected */
  onParticleSelect?: (id: string) => void;
  className?: string;
}

export function NanosystemViewer3D({
  parallelepipeds: initialParallelepipeds = [],
  spheres: initialSpheres = [],
  nanosystemId,
  particleKind = 0,
  skip = 0,
  take = 10000,
  onParticleSelect,
  className = '',
}: NanosystemViewer3DProps) {
  const [parallelepipeds, setParallelepipeds] = useState<ParallelepipedParticle[]>(initialParallelepipeds);
  const [spheres, setSpheres] = useState<SphereParticle[]>(initialSpheres);
  const [loading, setLoading] = useState(!!nanosystemId);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!nanosystemId) {
      setParallelepipeds(initialParallelepipeds);
      setSpheres(initialSpheres);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getNanosystemParticles(nanosystemId, skip, take, particleKind)
      .then((data) => {
        if (cancelled) return;
        const arr = Array.isArray(data) ? data : [];
        if (particleKind === 1) {
          setParallelepipeds(arr as ParallelepipedParticle[]);
          setSpheres([]);
        } else {
          setSpheres(arr as SphereParticle[]);
          setParallelepipeds([]);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load particles');
        setParallelepipeds([]);
        setSpheres([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nanosystemId, skip, take, particleKind]);

  const hasParticles = parallelepipeds.length > 0 || spheres.length > 0;
  const totalCount = parallelepipeds.length + spheres.length;

  return (
    <div className={`nanosystem-viewer-root ${className}`}>
      <div className="nanosystem-viewer-canvas-wrap">
        {loading && (
          <div className="nanosystem-viewer-loading">
            Loading particles…
          </div>
        )}
        {error && !loading && (
          <div className="nanosystem-viewer-error">
            {error}
          </div>
        )}
        {!loading && !error && !hasParticles && (
          <div className="nanosystem-viewer-empty">
            No particle data to display
          </div>
        )}
        {!loading && !error && hasParticles && (
          <Canvas
            camera={{ position: [5, 5, 5], fov: 50 }}
            style={{ width: '100%', height: '100%', display: 'block' }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={Math.PI / 2} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              decay={0}
              intensity={Math.PI}
            />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            {parallelepipeds.map((p) => (
              <ParallelepipedMesh
                key={p.id}
                particle={p}
                onSelect={onParticleSelect}
              />
            ))}
            {spheres.map((p) => (
              <SphereMesh
                key={p.id}
                particle={p}
                onSelect={onParticleSelect}
              />
            ))}
            <axesHelper args={[5]} />
            <OrbitControls />
            <Text position={[5, 0, 0]} color="black" fontSize={0.4}>
              X
            </Text>
            <Text position={[0, 5, 0]} color="black" fontSize={0.4}>
              Y
            </Text>
            <Text position={[0, 0, 5]} rotation={[0, Math.PI / 2, 0]} color="black" fontSize={0.4}>
              Z
            </Text>
          </Canvas>
        )}
      </div>
      {hasParticles && (
        <div className="nanosystem-viewer-toolbar">
          <span>
            Parallelepipeds: {parallelepipeds.length} · Spheres: {spheres.length}
          </span>
          <span>Total: {totalCount}</span>
        </div>
      )}
    </div>
  );
}
