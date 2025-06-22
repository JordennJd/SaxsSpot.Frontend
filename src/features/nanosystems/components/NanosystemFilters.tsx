// src/features/nanosystems/components/NanosystemFilters.tsx
import React, { useState } from "react";

interface NanosystemFiltersProps {
  onFilterChange: (gridifyQuery: string) => void;
}

export const NanosystemFilters = ({ onFilterChange }: NanosystemFiltersProps) => {
  const [gridifyQuery, setGridifyQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(gridifyQuery);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={gridifyQuery}
          onChange={(e) => setGridifyQuery(e.target.value)}
          placeholder="Enter Gridify query (e.g., 'particleKind:Protein')"
          className="flex-1 p-2 border rounded-md"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Apply Filter
        </button>
      </div>
    </form>
  );
};