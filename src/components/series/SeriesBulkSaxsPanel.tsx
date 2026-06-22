import { useState, useCallback } from 'react';
import { BeakerIcon } from '@heroicons/react/24/outline';
import { ScatteringCalculationModal } from './ScatteringCalculationModal';
import { fetchNanosystemList, runScatteringCalculation, type RunScatteringCalculationRequest } from '@/features/nanosystems/api/nanosystemApi';
import { useToastContext } from '@/contexts/ToastContext';
import { SCATTERING } from '@/lib/scatteringLabels';

const defaultSaxsParams: Omit<RunScatteringCalculationRequest, 'nanosystemId'> = {
  qSpaceParameters: { spaceMethod: 0, scaleMethod: 1, spaceParameter: 20, start: 0.02, end: 0.4 },
  excess: 0,
};

interface SeriesBulkSaxsPanelProps {
  seriesId: string;
  systemCount?: number;
  variant?: 'hero' | 'compact';
}

export const SeriesBulkSaxsPanel = ({ seriesId, systemCount, variant = 'hero' }: SeriesBulkSaxsPanelProps) => {
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
        showError(SCATTERING.theoryShort, 'No nanosystems in this series.');
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
        showSuccess(SCATTERING.theoryShort, `Started ${SCATTERING.theory.toLowerCase()} for ${queued} system${queued === 1 ? '' : 's'}.`);
      } else {
        showError(SCATTERING.theoryShort, `Started ${queued}, failed ${failed} of ${allSystems.length}.`);
      }
    } catch (error) {
      console.error(error);
      showError(SCATTERING.theoryShort, `Failed to start series ${SCATTERING.theory.toLowerCase()}.`);
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  }, [seriesId, params, showSuccess, showError]);

  const countLabel = systemCount != null ? ` (${systemCount} systems)` : '';

  if (variant === 'compact') {
    return (
      <>
        <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{SCATTERING.theory} for entire series</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {SCATTERING.runTheorySeries} for this series. The process will calculate by all nanosystems in the series{countLabel}.
              </p>
              {progress && (
                <p className="mt-2 text-xs font-medium text-orange-700 dark:text-orange-300">
                  Queuing {progress.done} / {progress.total}…
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {isRunning ? 'Running…' : SCATTERING.runTheorySeries}
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
          title={`${SCATTERING.theory} for entire series`}
          description={`The same Q parameters will be applied to every nanosystem in this series${countLabel}.`}
          runLabel={SCATTERING.runTheorySeries}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {SCATTERING.runTheory}?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {SCATTERING.runTheorySeries} for this series. The process will calculate by all nanosystems in the series
              {countLabel}.
            </p>
            {progress && (
              <p className="mt-3 text-sm font-medium text-orange-700 dark:text-orange-300">
                Queuing calculations: {progress.done} / {progress.total}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              disabled={isRunning || systemCount === 0}
              onClick={() => setIsModalOpen(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl shadow-lg hover:from-orange-600 hover:to-amber-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 font-semibold text-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                  <BeakerIcon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold">{isRunning ? 'Starting…' : SCATTERING.runTheory}</div>
                  <div className="text-xs opacity-90 font-normal">All systems in series</div>
                </div>
              </div>
            </button>
          </div>
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
        title={`${SCATTERING.theory} for entire series`}
        description={`Configure Q-space parameters. They will be applied to every nanosystem in this series${countLabel}.`}
        runLabel={SCATTERING.runTheorySeries}
      />
    </>
  );
};
