import { useState, useCallback } from 'react';
import { RadialAnalysisModal } from './RadialAnalysisModal';
import {
  fetchNanosystemList,
  runRadialAnalysis,
  type RunRadialAnalysisRequest,
} from '@/features/nanosystems/api/nanosystemApi';
import { useToastContext } from '@/contexts/ToastContext';

const defaultRadialParams: Omit<RunRadialAnalysisRequest, 'nanosystemId'> = {
  pointCount: 10000,
  layerCount: 10,
};

interface SeriesBulkRadialPanelProps {
  seriesId: string;
  systemCount?: number;
  variant?: 'inline';
}

export const SeriesBulkRadialPanel = ({
  seriesId,
  systemCount,
  variant = 'inline',
}: SeriesBulkRadialPanelProps) => {
  const { showSuccess, showError } = useToastContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [params, setParams] = useState<RunRadialAnalysisRequest>({
    nanosystemId: '',
    ...defaultRadialParams,
  });

  const handleParamChange = useCallback((path: string, value: unknown) => {
    setParams((prev) => ({ ...prev, [path]: value }));
  }, []);

  const handleRunBulk = useCallback(async () => {
    setIsRunning(true);
    setProgress({ done: 0, total: 0 });
    try {
      const allSystems: { id: string }[] = [];
      let page = 1;
      const pageSize = 100;
      while (true) {
        const res = await fetchNanosystemList(`seriesId=${seriesId}`, page, pageSize);
        allSystems.push(...res.result.data.map((s) => ({ id: s.id })));
        if (allSystems.length >= res.result.count) break;
        page += 1;
      }

      if (allSystems.length === 0) {
        showError('Radial', 'No nanosystems in this series.');
        return;
      }

      setProgress({ done: 0, total: allSystems.length });
      let queued = 0;
      let failed = 0;

      for (const system of allSystems) {
        try {
          await runRadialAnalysis({
            nanosystemId: system.id,
            pointCount: params.pointCount,
            layerCount: params.layerCount,
          });
          queued += 1;
        } catch {
          failed += 1;
        }
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : null));
      }

      setIsModalOpen(false);
      if (failed === 0) {
        showSuccess('Radial', `Started radial analysis for ${queued} system${queued === 1 ? '' : 's'}.`);
      } else {
        showError('Radial', `Started ${queued}, failed ${failed} of ${allSystems.length}.`);
      }
    } catch (error) {
      console.error(error);
      showError('Radial', 'Failed to start series radial analysis.');
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  }, [seriesId, params, showSuccess, showError]);

  const countLabel = systemCount != null ? ` (${systemCount} systems)` : '';

  const modal = (
    <RadialAnalysisModal
      isOpen={isModalOpen}
      onClose={() => !isRunning && setIsModalOpen(false)}
      analysisParams={params}
      onParamChange={handleParamChange}
      onAnalyse={handleRunBulk}
      isAnalysing={isRunning}
      title="Radial analysis for entire series"
      description={`The same parameters will be applied to every nanosystem in this series${countLabel}.${progress ? ` Queuing ${progress.done} / ${progress.total}…` : ''}`}
      runLabel="Start radial analysis for all"
    />
  );

  if (variant === 'inline') {
    return (
      <>
        <button
          type="button"
          disabled={isRunning || systemCount === 0}
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 dark:text-purple-300 dark:bg-purple-950/40"
        >
          {isRunning ? 'Starting…' : 'Radial analysis (all)'}
        </button>
        {modal}
      </>
    );
  }

  return null;
};
