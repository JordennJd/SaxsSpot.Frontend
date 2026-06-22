import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useSeriesData, useNanosystemsData } from '@/hooks/useSeriesDetail';
import { fetchSeriesCalculationGroups } from '@/features/calculation/api/calculationApi';
import type { SeriesCalculationGroupDto } from '@/features/calculation/api/calculationTypes';
import { fetchScatteringCalculationList } from '@/features/nanosystems/api/nanosystemApi';
import type { ScatteringCalculationDto } from '@/features/nanosystems/api/nanosystemTypes';
import { ApiError } from '@/lib/axios';
import { useToastContext } from '@/contexts/ToastContext';
import { getNanosystemWorkspaceUrl } from '@/lib/navigation';
import { SeriesBulkSaxsPanel } from '@/components/series/SeriesBulkSaxsPanel';

type ExplorerMode = 'groups' | 'systems';

export const SeriesCalculationsPage = () => {
  const { guid: seriesId = '' } = useParams<{ guid: string }>();
  const navigate = useNavigate();
  const { showError } = useToastContext();
  const { data: series, isLoading: isSeriesLoading } = useSeriesData(seriesId);
  const { data: nanosystems, isLoading: isNanosystemsLoading } = useNanosystemsData(seriesId, 1, 200);

  const [mode, setMode] = useState<ExplorerMode>('groups');
  const [groups, setGroups] = useState<SeriesCalculationGroupDto[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [expandedSystemId, setExpandedSystemId] = useState<string | null>(null);
  const [systemSaxs, setSystemSaxs] = useState<Record<string, ScatteringCalculationDto[]>>({});
  const [selectedSaxsIds, setSelectedSaxsIds] = useState<Set<string>>(new Set());
  const [loadingSaxsFor, setLoadingSaxsFor] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) return;
    setGroupsLoading(true);
    fetchSeriesCalculationGroups(seriesId)
      .then((res) => {
        const list = res.result ?? [];
        setGroups(list);
        setSelectedGroupId(list[0]?.groupId ?? null);
      })
      .catch((error) => {
        setGroups([]);
        if (!(error instanceof ApiError && (error.status === 404 || error.status === 400))) {
          showError('Groups', 'Could not load calculation groups.');
        }
      })
      .finally(() => setGroupsLoading(false));
  }, [seriesId, showError]);

  const selectedGroup = groups.find((g) => g.groupId === selectedGroupId);
  const systems = nanosystems?.result.data ?? [];
  const systemCount = nanosystems?.result.count ?? 0;

  const loadSystemSaxs = useCallback(async (nanosystemId: string) => {
    if (systemSaxs[nanosystemId]) return;
    setLoadingSaxsFor(nanosystemId);
    try {
      const res = await fetchScatteringCalculationList(nanosystemId, 1, 50);
      setSystemSaxs((prev) => ({ ...prev, [nanosystemId]: res.result.data }));
    } catch {
      setSystemSaxs((prev) => ({ ...prev, [nanosystemId]: [] }));
    } finally {
      setLoadingSaxsFor(null);
    }
  }, [systemSaxs]);

  const toggleSystemExpand = useCallback(
    (id: string) => {
      setExpandedSystemId((prev) => (prev === id ? null : id));
      void loadSystemSaxs(id);
    },
    [loadSystemSaxs],
  );

  const toggleSaxsSelection = useCallback((id: string) => {
    setSelectedSaxsIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleViewGroupChart = useCallback(() => {
    if (!selectedGroup || selectedGroup.calculationIds.length === 0) return;
    const params = new URLSearchParams();
    params.set('calcIds', selectedGroup.calculationIds.join(','));
    params.set('isAverage', '1');
    params.set('seriesId', seriesId);
    params.set('qFrom', String(selectedGroup.parameters.qVectorFrom));
    params.set('qTo', String(selectedGroup.parameters.qVectorTo));
    navigate(`/calculations/${selectedGroup.calculationIds[0]}/chart?${params.toString()}`, {
      state: {
        request: {
          CalculatesId: selectedGroup.calculationIds,
          ChartTitle: 'Scattering (group average)',
          XAxis: 'Q',
          YAxis: 'I',
          ScaleMethodsX: 'Log',
          ScaleMethodsY: 'Log',
        },
        isAverage: true,
      },
    });
  }, [navigate, selectedGroup, seriesId]);

  const handleViewSelectedSaxsChart = useCallback(() => {
    const ids = Array.from(selectedSaxsIds);
    if (ids.length === 0) return;
    const params = new URLSearchParams();
    params.set('scatteringIds', ids.join(','));
    if (ids.length > 1) params.set('isAverage', '1');
    navigate(`/scattering-calculations/${ids[0]}/chart?${params.toString()}`, {
      state: { scatteringIds: ids, isAverage: ids.length > 1 },
    });
  }, [navigate, selectedSaxsIds]);

  const modeTabs = useMemo(
    () => (
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {(['groups', 'systems'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {m === 'groups' ? 'By parameter group' : 'By system'}
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
        <span className="text-gray-900 font-medium">Calculations & charts</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calculations explorer</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Compare legacy scattering by shared parameters, or pick SAXS runs across systems.
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

      <SeriesBulkSaxsPanel seriesId={seriesId} systemCount={systemCount} />

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {modeTabs}
          {mode === 'systems' && selectedSaxsIds.size > 0 && (
            <button
              type="button"
              onClick={handleViewSelectedSaxsChart}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            >
              SAXS chart ({selectedSaxsIds.size})
            </button>
          )}
          {mode === 'groups' && selectedGroup && selectedGroup.calculationIds.length > 0 && (
            <button
              type="button"
              onClick={handleViewGroupChart}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              View group average ({selectedGroup.systemsCount} systems)
            </button>
          )}
        </div>

        <div className="p-6">
          {mode === 'groups' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Legacy scattering calculations grouped by identical Q / φ / θ parameters. Select a group to average intensity across all matching systems.
              </p>
              {groupsLoading ? (
                <p className="text-sm text-gray-500">Loading groups…</p>
              ) : groups.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-xl">
                  No grouped legacy calculations yet. Run legacy calculation on systems in this series first.
                </p>
              ) : (
                <ul className="space-y-2">
                  {groups.map((group) => (
                    <li key={group.groupId}>
                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                          selectedGroupId === group.groupId
                            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="calc-group"
                          checked={selectedGroupId === group.groupId}
                          onChange={() => setSelectedGroupId(group.groupId)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Q: {group.parameters.qVectorFrom} – {group.parameters.qVectorTo}
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

          {mode === 'systems' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Expand a system to see its SAXS calculations. Check several runs (even from different systems) to build a combined chart.
              </p>
              {isNanosystemsLoading ? (
                <p className="text-sm text-gray-500">Loading systems…</p>
              ) : systems.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center border border-dashed rounded-xl">No nanosystems in this series.</p>
              ) : (
                <ul className="space-y-2">
                  {systems.map((system) => {
                    const expanded = expandedSystemId === system.id;
                    const saxsList = systemSaxs[system.id];
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
                            {loadingSaxsFor === system.id ? (
                              <p className="text-xs text-gray-500">Loading SAXS…</p>
                            ) : !saxsList || saxsList.length === 0 ? (
                              <p className="text-xs text-gray-500">No SAXS calculations. Open workspace and run SAXS.</p>
                            ) : (
                              <ul className="space-y-1.5">
                                {saxsList.map((calc) => (
                                  <li key={calc.id}>
                                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={selectedSaxsIds.has(calc.id)}
                                        onChange={() => toggleSaxsSelection(calc.id)}
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
