import React, { useCallback, useState } from 'react';
import { AddNanosystemButton } from '../../../components/ui/nanosystems/AddNanosystemButton';
import {
  buildSeriesListGridifyFilter,
  type SeriesFilterForm,
} from '../utils/gridifyQueryBuilder';

interface NanosystemFiltersProps {
  onFilterChange: (gridifyQuery: string) => void;
}

const defaultForm: SeriesFilterForm = {
  commentContains: '',
  particleKind: '',
  particleCountMin: '',
  particleCountMax: '',
  kMin: '',
  kMax: '',
  thetaMin: '',
  thetaMax: '',
  globalSizeMin: '',
  globalSizeMax: '',
  concentrationMin: '',
  concentrationMax: '',
  createdFrom: '',
  createdTo: '',
};

export const NanosystemFilters = ({ onFilterChange }: NanosystemFiltersProps) => {
  const [f, setF] = useState<SeriesFilterForm>(defaultForm);

  const apply = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onFilterChange(buildSeriesListGridifyFilter(f));
    },
    [f, onFilterChange],
  );

  const reset = useCallback(() => {
    setF(defaultForm);
    onFilterChange('');
  }, [onFilterChange]);

  const num = (
    label: string,
    key: keyof Pick<
      SeriesFilterForm,
      | 'particleCountMin'
      | 'particleCountMax'
      | 'kMin'
      | 'kMax'
      | 'thetaMin'
      | 'thetaMax'
      | 'globalSizeMin'
      | 'globalSizeMax'
      | 'concentrationMin'
      | 'concentrationMax'
    >,
  ) => (
    <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300 min-w-0">
      <span>{label}</span>
      <input
        type="number"
        step="any"
        value={f[key]}
        onChange={(e) => setF((prev) => ({ ...prev, [key]: e.target.value }))}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
      />
    </label>
  );

  return (
    <form onSubmit={apply} className="mb-6 space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Series filters</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reset}
              className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply
            </button>
            <AddNanosystemButton />
          </div>
        </div>

        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
          <span>Comment contains</span>
          <input
            type="text"
            value={f.commentContains}
            onChange={(e) => setF((prev) => ({ ...prev, commentContains: e.target.value }))}
            placeholder="e.g. sample, repeat..."
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </label>

        <div>
          <span className="text-xs text-gray-600 dark:text-gray-300 block mb-1">Particle type</span>
          <div className="flex flex-wrap gap-3 text-sm text-gray-800 dark:text-gray-200">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="pk"
                checked={f.particleKind === ''}
                onChange={() => setF((prev) => ({ ...prev, particleKind: '' }))}
              />
              All
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="pk"
                checked={f.particleKind === '0'}
                onChange={() => setF((prev) => ({ ...prev, particleKind: '0' }))}
              />
              Sphere
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="pk"
                checked={f.particleKind === '1'}
                onChange={() => setF((prev) => ({ ...prev, particleKind: '1' }))}
              />
              Parallelepiped
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {num('Particles (min range)', 'particleCountMin')}
          {num('Particles (max range)', 'particleCountMax')}
          {num('k (min)', 'kMin')}
          {num('k (max)', 'kMax')}
          {num('theta (min)', 'thetaMin')}
          {num('theta (max)', 'thetaMax')}
          {num('Size, nm (min)', 'globalSizeMin')}
          {num('Size, nm (max)', 'globalSizeMax')}
          {num('Concentration (min)', 'concentrationMin')}
          {num('Concentration (max)', 'concentrationMax')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
            <span>Series created from</span>
            <input
              type="date"
              value={f.createdFrom}
              onChange={(e) => setF((prev) => ({ ...prev, createdFrom: e.target.value }))}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
            <span>Series created to</span>
            <input
              type="date"
              value={f.createdTo}
              onChange={(e) => setF((prev) => ({ ...prev, createdTo: e.target.value }))}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
            />
          </label>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Range filters use overlap logic for series intervals. Dates are based on series creation time (UTC).
        </p>
      </div>
    </form>
  );
};
