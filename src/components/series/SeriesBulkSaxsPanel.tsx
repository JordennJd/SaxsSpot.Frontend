import { useState, useCallback } from 'react';
import { BeakerIcon } from '@heroicons/react/24/outline';
import { ScatteringCalculationModal } from '../series/ScatteringCalculationModal';
import { fetchNanosystemList, runScatteringCalculation, type RunScatteringCalculationRequest } from '@/features/nanosystems/api/nanosystemApi';
import { useToastContext } from '@/contexts/ToastContext';

const defaultSaxsParams: Omit<RunScatteringCalculationRequest, 'nanosystemId'> = {
  qSpaceParameters: { spaceMethod: 0, scaleMethod: 1, spaceParameter: 20, start: 0.02, end: 0.4 },
  excess: 0,
};

interface SeriesBulkSaxsPanelProps {
  seriesId: string;
  systemCount?: number;
}

export const SeriesBulkSaxsPanel = ({ seriesId, systemCount }: SeriesBulkSaxsPanelProps) => {
  const { showSuccess, showError } = useToastContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [params, setParams] = useState<RunScatteringCalculationRequest>({
    nanosystemId: '',
    ...defaultSaxsParams,
  });

  const handleParamChange = useCallback((path: string, value: unknown) => {
    setParams((prev) => {
      const keys = path.split('.');
      const next = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const handleRunBulk = useCallback(async () => {
    setIsRunning(true);
    setProgress({ done: 0, total: 0 });
    try {
      const allSystems: { id: string; particleKind: string; excess: number }[] = [];
      let page = 1;
      const pageSize = 100;
      while (true) {
        const res = await fetchNanosystemList(`seriesId=${seriesId}`, page, pageSize);
        allSystems.push(...res.result.data.map((s) => ({ id: s.id, particleKind: s.particleKind, excess: s.excess })));
        if (allSystems.length >= res.result.count) break;
        page += 1;
      }

      if (allSystems.length === 0) {
        showError('SAXS batch', 'No nanosystems in this series.');
        return;
      }

      setProgress({ done: 0, total: allSystems.length });
      let queued = 0;
      let failed = 0;

      for (const system of allSystems) {
        try {
          await runScatteringCalculation({
            nanosystemId: system.id,
            qSpaceParameters: params.qSpaceParameters,
            excess: system.particleKind === 'Sphere' ? (params.excess ?? system.excess) : undefined,
          });
          queued += 1;
        } catch {
          failed += 1;
        }
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : null));
      }

      setIsModalOpen(false);
      if (failed === 0) {
        showSuccess('SAXS batch', `Queued SAXS for ${queued} system${queued === 1 ? '' : 's'}.`);
      } else {
        showError('SAXS batch', `Queued ${queued}, failed ${failed} of ${allSystems.length}.`);
      }
    } catch (error) {
      console.error(error);
      showError('SAXS batch', 'Failed to start batch SAXS calculation.');
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  }, [seriesId, params, showSuccess, showError]);

  return (
    <>
      <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BeakerIcon className="h-5 w-5 text-orange-600" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">SAXS for entire series</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Run the same Q-grid SAXS calculation on every nanosystem in this series
              {systemCount != null ? ` (${systemCount} systems)` : ''}.
            </p>
            {progress && (
              <p className="mt-2 text-xs font-medium text-orange-700 dark:text-orange-300">
                Processing {progress.done} / {progress.total}…
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors"
          >
            {isRunning ? 'Running…' : 'Run SAXS for all'}
          </button>
        </div>
      </div>

      <ScatteringCalculationModal
        isOpen={isModalOpen}
        onClose={() => !isRunning && setIsModalOpen(false)}
        params={params}
        onParamChange={handleParamChange}
        onRun={handleRunBulk}
        isRunning={isRunning}
        showExcess
        title="Batch SAXS — all systems"
        description="These Q parameters will be applied to every nanosystem in the series. Sphere systems use the excess value below when set."
      />
    </>
  );
};
