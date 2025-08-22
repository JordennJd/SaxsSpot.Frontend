// src/components/LoadingSkeleton.tsx
export const LoadingSkeleton = ({ rows }: { rows: number }) => (
  <div className="p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    ))}
  </div>
);