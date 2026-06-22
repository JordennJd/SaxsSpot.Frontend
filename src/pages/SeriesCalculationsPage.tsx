import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useSeriesData, useNanosystemsData } from '@/hooks/useSeriesDetail';
import { useSeriesTheoryGroups } from '@/hooks/useSeriesTheoryGroups';
import { fetchSeriesCalculationGroups } from '@/features/calculation/api/calculationApi';
import type { SeriesCalculationGroupDto } from '@/features/calculation/api/calculationTypes';
import { fetchScatteringCalculationList } from '@/features/nanosystems/api/nanosystemApi';
import type { ScatteringCalculationDto } from '@/features/nanosystems/api/nanosystemTypes';
import { ApiError } from '@/lib/axios';
import { useToastContext } from '@/contexts/ToastContext';
import { getNanosystemWorkspaceUrl } from '@/lib/navigation';
import { SeriesGroupComparePanel } from '@/components/series/SeriesGroupComparePanel';
import { SCATTERING } from '@/lib/scatteringLabels';
import { mergeModelGroupsByQRange } from '@/lib/theoryScatteringGroups';

type PickerMode = 'compare' | 'systems';

export const SeriesCalculationsPage = () => {
  const { guid: seriesId = '' } = useParams<{ guid: string }>();
  const navigate = useNavigate();
  const { showError } = useToastContext();
  const { data: series, isLoading: isSeriesLoading } = useSeriesData(seriesId);
  const { data: nanosystems, isLoading: isNanosystemsLoading } = useNanosystemsData(seriesId, 1, 200);
  const { groups: theoryGroups, isLoading: theoryLoading } = useSeriesTheoryGroups(seriesId);

  const [mode, setMode] = useState<PickerMode>('compare');
  const [rawModelGroups, setRawModelGroups] = useState<SeriesCalculationGroupDto[]>([]);
  const [modelLoading, setModelLoading] = useState(true);
  const [expandedSystemId, setExpandedSystemId] = useState<string | null>(null);
  const [systemTheory, setSystemTheory] = useState<Record<string, ScatteringCalculationDto[]>>({});
  const [selectedTheoryIds, setSelectedTheoryIds] = useState<Set<string>>(new Set());
  const [loadingTheoryFor, setLoadingTheoryFor] = useState<string | null>(null);

  const modelGroups = useMemo(() => mergeModelGroupsByQRange(rawModelGroups), [rawModelGroups]);

  useEffect(() => {
    if (!seriesId) return;
    setModelLoading(true);
    fetchSeriesCalculationGroups(seriesId)
      .then((res) => setRawModelGroups(res.result ?? []))
      .catch((error) => {
        setRawModelGroups([]);
        if (!(error instanceof ApiError && (error.status === 404 || error.status === 400))) {
          showError('Groups', 'Could not load calculation groups.');
        }
      })
      .finally(() => setModelLoading(false));
  }, [seriesId, showError]);

  const systems = nanosystems?.result.data ?? [];

  const loadSystemTheory = useCallback(async (nanosystemId: string) => {
    if (systemTheory[nanosystemId]) return;
    setLoadingTheoryFor(nanosystemId);
    try {
      const res = await fetchScatteringCalculationList(nanosystemId, 1, 50);
      setSystemTheory((prev) => ({ ...prev, [nanosystemId]: res.result.data }));
    } catch {
      setSystemTheory((prev) => ({ ...prev, [nanosystemId]: [] }));
    } finally {
      setLoadingTheoryFor(null);
    }
  }, [systemTheory]);

  const toggleSystemExpand = useCallback(
    (id: string) => {
      setExpandedSystemId((prev) => (prev === id ? null : id));
      void loadSystemTheory(id);
    },
    [loadSystemTheory],
  );

  const toggleTheorySelection = useCallback((id: string) => {
    setSelectedTheoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleViewSelectedTheoryChart = useCallback(() => {
    const ids = Array.from(selectedTheoryIds);
    if (ids.length === 0) return;
    const params = new URLSearchParams();
    params.set('scatteringIds', ids.join(','));
    if (ids.length > 1) params.set('isAverage', '1');
    navigate(`/scattering-calculations/${ids[0]}/chart?${params.toString()}`, {
      state: { scatteringIds: ids, isAverage: ids.length > 1 },
    });
  }, [navigate, selectedTheoryIds]);

  if (isSeriesLoading) {
    return <div className="py-16 text-center text-gray-500">Loading…</div>;
  }

  if (!series) {
    return <div className="py-16 text-center text-gray-500">Series not found</div>;
  }

  return (
    <div className="space-y-5 pb-10">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-800">Series</Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link to={`/series/${seriesId}`} className="hover:text-gray-800 truncate max-w-[200px]">
          {series.comment?.trim() || seriesId.slice(0, 8)}
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Charts</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Charts by Q range</h1>
          <p className="mt-0.5 text-sm text-gray-500">Groups use Q from–to only.</p>
        </div>
        <Link
          to={`/series/${seriesId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {(['compare', 'systems'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {m === 'compare' ? SCATTERING.compare : 'By system'}
              </button>
            ))}
          </div>
          {mode === 'systems' && selectedTheoryIds.size > 0 && (
            <button
              type="button"
              onClick={handleViewSelectedTheoryChart}
              className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            >
              Chart ({selectedTheoryIds.size})
            </button>
          )}
        </div>

        <div className="p-4">
          {mode === 'compare' && (
            <SeriesGroupComparePanel
              seriesId={seriesId}
              modelGroups={modelGroups}
              theoryGroups={theoryGroups}
              modelLoading={modelLoading}
              theoryLoading={theoryLoading}
            />
          )}

          {mode === 'systems' && (
            <div className="space-y-2">
              {isNanosystemsLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : systems.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">No systems.</p>
              ) : (
                systems.map((system) => {
                  const expanded = expandedSystemId === system.id;
                  const theoryList = systemTheory[system.id];
                  return (
                    <div key={system.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/40">
                        <button
                          type="button"
                          onClick={() => toggleSystemExpand(system.id)}
                          className="flex-1 text-left font-mono text-xs text-gray-800 dark:text-gray-200 truncate"
                        >
                          {system.id.slice(0, 14)}…
                        </button>
                        <Link
                          to={getNanosystemWorkspaceUrl(seriesId, system.id, 'saxs')}
                          className="text-xs text-indigo-600 hover:underline shrink-0"
                        >
                          Open
                        </Link>
                      </div>
                      {expanded && (
                        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                          {loadingTheoryFor === system.id ? (
                            <p className="text-xs text-gray-500">Loading…</p>
                          ) : !theoryList?.length ? (
                            <p className="text-xs text-gray-500">{SCATTERING.noTheoryCalcs}</p>
                          ) : (
                            theoryList.map((calc) => (
                              <label key={calc.id} className="flex items-center gap-2 py-1 text-xs cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedTheoryIds.has(calc.id)}
                                  onChange={() => toggleTheorySelection(calc.id)}
                                />
                                <span className="font-mono truncate flex-1">{calc.id.slice(0, 12)}…</span>
                                <span className="text-gray-500">Q {calc.qVectorFrom}–{calc.qVectorTo}</span>
                              </label>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
