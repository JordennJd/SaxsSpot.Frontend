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
import { SeriesBulkSaxsPanel } from '@/components/series/SeriesBulkSaxsPanel';
import { SeriesGroupComparePanel } from '@/components/series/SeriesGroupComparePanel';
import { SCATTERING, formatQRange } from '@/lib/scatteringLabels';

type PickerMode = 'compare' | 'model' | 'theory' | 'systems';

const MODE_LABELS: Record<PickerMode, string> = {
  compare: SCATTERING.compare,
  model: SCATTERING.model,
  theory: SCATTERING.theory,
  systems: 'By system',
};

export const SeriesCalculationsPage = () => {
  const { guid: seriesId = '' } = useParams<{ guid: string }>();
  const navigate = useNavigate();
  const { showError } = useToastContext();
  const { data: series, isLoading: isSeriesLoading } = useSeriesData(seriesId);
  const { data: nanosystems, isLoading: isNanosystemsLoading } = useNanosystemsData(seriesId, 1, 200);
  const { groups: theoryGroups, isLoading: theoryLoading } = useSeriesTheoryGroups(seriesId);

  const [mode, setMode] = useState<PickerMode>('compare');
  const [modelGroups, setModelGroups] = useState<SeriesCalculationGroupDto[]>([]);
  const [selectedModelGroupId, setSelectedModelGroupId] = useState<string | null>(null);
  const [selectedTheoryGroupId, setSelectedTheoryGroupId] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [expandedSystemId, setExpandedSystemId] = useState<string | null>(null);
  const [systemTheory, setSystemTheory] = useState<Record<string, ScatteringCalculationDto[]>>({});
  const [selectedTheoryIds, setSelectedTheoryIds] = useState<Set<string>>(new Set());
  const [loadingTheoryFor, setLoadingTheoryFor] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) return;
    setModelLoading(true);
    fetchSeriesCalculationGroups(seriesId)
      .then((res) => {
        const list = res.result ?? [];
        setModelGroups(list);
        setSelectedModelGroupId(list[0]?.groupId ?? null);
      })
      .catch((error) => {
        setModelGroups([]);
        if (!(error instanceof ApiError && (error.status === 404 || error.status === 400))) {
          showError('Groups', 'Could not load calculation groups.');
        }
      })
      .finally(() => setModelLoading(false));
  }, [seriesId, showError]);

  useEffect(() => {
    if (theoryGroups.length > 0 && !selectedTheoryGroupId) {
      setSelectedTheoryGroupId(theoryGroups[0].groupId);
    }
  }, [theoryGroups, selectedTheoryGroupId]);

  const selectedModelGroup = modelGroups.find((g) => g.groupId === selectedModelGroupId);
  const selectedTheoryGroup = theoryGroups.find((g) => g.groupId === selectedTheoryGroupId);
  const systems = nanosystems?.result.data ?? [];
  const systemCount = nanosystems?.result.count ?? 0;

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

  const handleViewModelGroupChart = useCallback(() => {
    if (!selectedModelGroup || selectedModelGroup.calculationIds.length === 0) return;
    const params = new URLSearchParams();
    params.set('calcIds', selectedModelGroup.calculationIds.join(','));
    params.set('isAverage', '1');
    params.set('seriesId', seriesId);
    params.set('qFrom', String(selectedModelGroup.parameters.qVectorFrom));
    params.set('qTo', String(selectedModelGroup.parameters.qVectorTo));
    navigate(`/calculations/${selectedModelGroup.calculationIds[0]}/chart?${params.toString()}`, {
      state: {
        request: {
          CalculatesId: selectedModelGroup.calculationIds,
          ChartTitle: `${SCATTERING.model} (group average)`,
          XAxis: 'Q',
          YAxis: 'I',
          ScaleMethodsX: 'Log',
          ScaleMethodsY: 'Log',
        },
        isAverage: true,
      },
    });
  }, [navigate, selectedModelGroup, seriesId]);

  const handleViewTheoryGroupChart = useCallback(() => {
    if (!selectedTheoryGroup || selectedTheoryGroup.scatteringIds.length === 0) return;
    const ids = selectedTheoryGroup.scatteringIds;
    const params = new URLSearchParams();
    params.set('scatteringIds', ids.join(','));
    params.set('isAverage', '1');
    params.set('seriesId', seriesId);
    navigate(`/scattering-calculations/${ids[0]}/chart?${params.toString()}`, {
      state: { scatteringIds: ids, isAverage: true },
    });
  }, [navigate, selectedTheoryGroup, seriesId]);

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

  const modeTabs = useMemo(
    () => (
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {(['compare', 'model', 'theory', 'systems'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>
    ),
    [mode],
  );

  if (isSeriesLoading) {
    return <div className="py-16 text-center text-gray-500">Loading…</div>;
  }

  if (!series) {
    return <div className="py-16 text-center text-gray-500">Series not found</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-800">Series</Link>
        <ChevronRightIcon className="h-4 w-4" />
        <Link to={`/series/${seriesId}`} className="hover:text-gray-800 truncate max-w-[200px]">
          {series.comment?.trim() || seriesId.slice(0, 8)}
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Chart picker</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chart picker</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Compare {SCATTERING.modelShort.toLowerCase()} and {SCATTERING.theoryShort.toLowerCase()} by Q groups, or pick individual runs.
          </p>
        </div>
        <Link
          to={`/series/${seriesId}`}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to series
        </Link>
      </div>

      <SeriesBulkSaxsPanel seriesId={seriesId} systemCount={systemCount} variant="compact" />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {modeTabs}
          {mode === 'systems' && selectedTheoryIds.size > 0 && (
            <button
              type="button"
              onClick={handleViewSelectedTheoryChart}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            >
              {SCATTERING.theory} chart ({selectedTheoryIds.size})
            </button>
          )}
          {mode === 'model' && selectedModelGroup && selectedModelGroup.calculationIds.length > 0 && (
            <button
              type="button"
              onClick={handleViewModelGroupChart}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              {SCATTERING.modelAverage} ({selectedModelGroup.systemsCount})
            </button>
          )}
          {mode === 'theory' && selectedTheoryGroup && selectedTheoryGroup.scatteringIds.length > 0 && (
            <button
              type="button"
              onClick={handleViewTheoryGroupChart}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            >
              {SCATTERING.theoryAverage} ({selectedTheoryGroup.systemsCount})
            </button>
          )}
        </div>

        <div className="p-6">
          {mode === 'compare' && (
            <SeriesGroupComparePanel
              seriesId={seriesId}
              modelGroups={modelGroups}
              theoryGroups={theoryGroups}
              modelLoading={modelLoading}
              theoryLoading={theoryLoading}
            />
          )}

          {mode === 'model' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {SCATTERING.model} grouped by identical Q / φ / θ parameters. Select a group to average intensity across all matching systems.
              </p>
              {modelLoading ? (
                <p className="text-sm text-gray-500">Loading groups…</p>
              ) : modelGroups.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-xl">
                  {SCATTERING.noModelCalcs}
                </p>
              ) : (
                <ul className="space-y-2">
                  {modelGroups.map((group) => (
                    <li key={group.groupId}>
                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                          selectedModelGroupId === group.groupId
                            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="model-group"
                          checked={selectedModelGroupId === group.groupId}
                          onChange={() => setSelectedModelGroupId(group.groupId)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatQRange(group.parameters.qVectorFrom, group.parameters.qVectorTo)}
                            </span>
                            <span className="text-xs text-gray-500 shrink-0">{group.systemsCount} systems · {group.calculationIds.length} calcs</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            φ: {group.parameters.phiVectorFrom ?? '—'} – {group.parameters.phiVectorTo ?? '—'}
                            {' · '}
                            θ: {group.parameters.thetaVectorFrom ?? '—'} – {group.parameters.thetaVectorTo ?? '—'}
                          </p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {mode === 'theory' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {SCATTERING.theory} grouped by identical Q parameters (one latest run per system). Select a group to average.
              </p>
              {theoryLoading ? (
                <p className="text-sm text-gray-500">Loading groups…</p>
              ) : theoryGroups.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-xl">
                  {SCATTERING.noTheoryCalcs}
                </p>
              ) : (
                <ul className="space-y-2">
                  {theoryGroups.map((group) => (
                    <li key={group.groupId}>
                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                          selectedTheoryGroupId === group.groupId
                            ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="theory-group"
                          checked={selectedTheoryGroupId === group.groupId}
                          onChange={() => setSelectedTheoryGroupId(group.groupId)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatQRange(group.qVectorFrom, group.qVectorTo)}
                            </span>
                            <span className="text-xs text-gray-500 shrink-0">{group.systemsCount} systems</span>
                          </div>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {mode === 'systems' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Expand a system to see its {SCATTERING.theoryShort.toLowerCase()} calculations. Check several runs to build a combined chart.
              </p>
              {isNanosystemsLoading ? (
                <p className="text-sm text-gray-500">Loading systems…</p>
              ) : systems.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-xl">No nanosystems in this series.</p>
              ) : (
                <ul className="space-y-2">
                  {systems.map((system) => {
                    const expanded = expandedSystemId === system.id;
                    const theoryList = systemTheory[system.id];
                    return (
                      <li key={system.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
                          <button
                            type="button"
                            onClick={() => toggleSystemExpand(system.id)}
                            className="flex-1 flex items-center justify-between text-left min-w-0"
                          >
                            <span className="font-mono text-sm text-gray-800 dark:text-gray-200 truncate">{system.id.slice(0, 12)}…</span>
                            <span className="text-xs text-gray-500 shrink-0 ml-2">
                              {system.particleCount.toLocaleString()} particles · {system.globalSize} nm
                            </span>
                          </button>
                          <Link
                            to={getNanosystemWorkspaceUrl(seriesId, system.id, 'calculations')}
                            className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-md hover:bg-indigo-50"
                          >
                            Open workspace
                          </Link>
                        </div>
                        {expanded && (
                          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                            {loadingTheoryFor === system.id ? (
                              <p className="text-xs text-gray-500">Loading {SCATTERING.theoryShort.toLowerCase()}…</p>
                            ) : !theoryList || theoryList.length === 0 ? (
                              <p className="text-xs text-gray-500">{SCATTERING.noTheoryCalcs}</p>
                            ) : (
                              <ul className="space-y-1.5">
                                {theoryList.map((calc) => (
                                  <li key={calc.id}>
                                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={selectedTheoryIds.has(calc.id)}
                                        onChange={() => toggleTheorySelection(calc.id)}
                                      />
                                      <span className="text-xs font-mono text-orange-700 dark:text-orange-300 truncate flex-1">{calc.id.slice(0, 16)}…</span>
                                      <span className="text-xs text-gray-500">Q {calc.qVectorFrom}–{calc.qVectorTo}</span>
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
