import { useCallback, useState } from 'react';
import {
  buildNanosystemListGridifyFilter,
  type NanosystemFilterForm,
} from '../utils/gridifyQueryBuilder';

const defaultForm: NanosystemFilterForm = {
  particleCountMin: '',
  particleCountMax: '',
  kMin: '',
  kMax: '',
  thetaMin: '',
  thetaMax: '',
  inputDateFrom: '',
  inputDateTo: '',
};

type NanosystemListFiltersProps = {
  onApply: (gridifyFragment: string) => void;
};

export const NanosystemListFilters = ({ onApply }: NanosystemListFiltersProps) => {
  const [f, setF] = useState<NanosystemFilterForm>(defaultForm);

  const apply = useCallback(() => {
    onApply(buildNanosystemListGridifyFilter(f));
  }, [f, onApply]);

  const reset = useCallback(() => {
    setF(defaultForm);
    onApply('');
  }, [onApply]);

  const num = (
    label: string,
    key: keyof Pick<
      NanosystemFilterForm,
      'particleCountMin' | 'particleCountMax' | 'kMin' | 'kMax' | 'thetaMin' | 'thetaMax'
    >,
  ) => (
    <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
      <span>{label}</span>
      <input
        type="number"
        step="any"
        value={f[key]}
        onChange={(e) => setF((prev) => ({ ...prev, [key]: e.target.value }))}
        className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
      />
    </label>
  );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Фильтр наносистем</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Сбросить
          </button>
          <button
            type="button"
            onClick={apply}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Применить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {num('Частиц ≥', 'particleCountMin')}
        {num('Частиц ≤', 'particleCountMax')}
        {num('k ≥', 'kMin')}
        {num('k ≤', 'kMax')}
        {num('θ ≥', 'thetaMin')}
        {num('θ ≤', 'thetaMax')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
          <span>Дата ввода (с)</span>
          <input
            type="date"
            value={f.inputDateFrom}
            onChange={(e) => setF((prev) => ({ ...prev, inputDateFrom: e.target.value }))}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-300">
          <span>Дата ввода (по)</span>
          <input
            type="date"
            value={f.inputDateTo}
            onChange={(e) => setF((prev) => ({ ...prev, inputDateTo: e.target.value }))}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
          />
        </label>
      </div>
    </div>
  );
};
