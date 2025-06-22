// src/components/LoadingSkeleton.tsx
export const LoadingSkeleton = ({ rows }: { rows: number }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: 6 }).map((_, j) => (
          <td key={j} className="px-6 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </td>
        ))}
      </tr>
    ))}
  </>
);