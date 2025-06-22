// src/components/ParticleKindBadge.tsx
import type { ParticleKind } from '../../../features/nanosystems/api/nanosystemTypes';

const colorMap: Record<ParticleKind, string> = {
  Sphere: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Parallelepiped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export const ParticleKindBadge = ({ kind }: { kind: ParticleKind }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[kind]}`}>
    {kind}
  </span>
);