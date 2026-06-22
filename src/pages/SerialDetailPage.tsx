import {useEffect, useState, useCallback, useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useQueryClient} from '@tanstack/react-query';
import {useToastContext} from '../contexts/ToastContext';

import {type ApiResponseListNanosystemDto, type NanosystemDto} from '../features/nanosystems/api/nanosystemTypes';
import type {
  PlotAnalyseRequest,
  PlotChartRequest,
  RunCalculationRequest,
  SeriesCalculationGroupDto,
} from '../features/calculation/api/calculationTypes.ts';
import {fetchSeriesCalculationGroups, RunSeriesCalculation} from '../features/calculation/api/calculationApi.ts';
import {fetchNanosystemList, fetchRadialAnalysisList, updateSeriesComment} from '../features/nanosystems/api/nanosystemApi.ts';
import { ApiError } from '../lib/axios';
import { CalculationModal, NanosystemDetailsModal, NanosystemsTable, SeriesHeader } from '../components/series';
import { NanosystemWorkspaceModals } from '../components/series/NanosystemWorkspaceModals';
import {
  useNanosystemsData,
  useSeriesData,
  useSeriesGenerationWindow,
} from '../hooks/useSeriesDetail';
import { useNanosystemWorkspace } from '../hooks/useNanosystemWorkspace';
import { formatElapsedDurationMs } from '../lib/utils';

const MAX_SERIES_COMMENT_LENGTH = 8000;

export const SeriesDetailPage = () => {
  const { guid: seriesId = '' } = useParams<{ guid: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastContext();
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const [selectedNanosystem, setSelectedNanosystem] = useState<NanosystemDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeriesCalculateModalOpen, setIsSeriesCalculateModalOpen] = useState(false);
  const [isSeriesAverageChartLoading, setIsSeriesAverageChartLoading] = useState(false);
  const [isSeriesScatteringGroupsLoading, setIsSeriesScatteringGroupsLoading] = useState(false);
  const [seriesScatteringGroups, setSeriesScatteringGroups] = useState<SeriesCalculationGroupDto[]>([]);
  const [selectedSeriesScatteringGroupId, setSelectedSeriesScatteringGroupId] = useState<string | null>(null);
  const [seriesTab, setSeriesTab] = useState<'main' | 'comment'>('main');
  const [commentDraft, setCommentDraft] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

  // Calculation parameters
  const [calculationParams, setCalculationParams] = useState<RunCalculationRequest>({
    qVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.01,
      start: 0.02,
      end: 0.4,
    },
    phiVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.1,
      start: 0,
      end: 6.28,
    },
    thetaVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.1,
      start: -1,
      end: 1,
    },
    systemId: '',
    requestId: '',
    particleKind: 0,
  });

  // Data fetching
  const { data: series, isLoading: isSeriesLoading } = useSeriesData(seriesId);
  const { data: generationWindow } = useSeriesGenerationWindow(seriesId);

  useEffect(() => {
    if (series) setCommentDraft(series.comment ?? '');
  }, [series?.id, series?.comment]);
  const { data: nanosystems, isLoading: isNanosystemsLoading } = useNanosystemsData(
    seriesId,
    page,
    pageSize,
  );
  const workspace = useNanosystemWorkspace(selectedNanosystem, seriesId);

  const seriesGenerationDuration = useMemo(
    () =>
      generationWindow?.totalGenerationDurationMs != null
        ? formatElapsedDurationMs(generationWindow.totalGenerationDurationMs)
        : '—',
    [generationWindow?.totalGenerationDurationMs],
  );

  useEffect(() => {
    const loadSeriesGroups = async () => {
      if (!seriesId) return;
      setIsSeriesScatteringGroupsLoading(true);
      try {
        const res = await fetchSeriesCalculationGroups(seriesId);
        const groups = res.result ?? [];
        setSeriesScatteringGroups(groups);
        setSelectedSeriesScatteringGroupId(groups[0]?.groupId ?? null);
      } catch (error) {
        console.error('Error loading series calculation groups:', error);
        setSeriesScatteringGroups([]);
        setSelectedSeriesScatteringGroupId(null);
        if (!(error instanceof ApiError && (error.status === 404 || error.status === 400))) {
          showError('Series groups', 'Failed to load scattering calculation groups for this series.');
        }
      } finally {
        setIsSeriesScatteringGroupsLoading(false);
      }
    };

    loadSeriesGroups();
  }, [seriesId, showError]);

  const selectedSeriesScatteringGroup = seriesScatteringGroups.find(
    (g) => g.groupId === selectedSeriesScatteringGroupId,
  );

  const handleSaveComment = useCallback(async () => {
    if (!seriesId) return;
    setIsSavingComment(true);
    try {
      const trimmed = commentDraft.trim();
      await updateSeriesComment({
        seriesId,
        comment: trimmed.length > 0 ? trimmed : null,
      });
      await queryClient.invalidateQueries({ queryKey: ['series', seriesId] });
      await queryClient.invalidateQueries({ queryKey: ['nanosystem-series-list'] });
      showSuccess('Comment', 'Saved.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save comment.';
      showError('Comment', message);
    } finally {
      setIsSavingComment(false);
    }
  }, [seriesId, commentDraft, queryClient, showSuccess, showError]);

  const openNanosystemDetails = (system: NanosystemDto) => {
    setSelectedNanosystem(system);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNanosystem(null);
  };

  const openSeriesCalculateModal = () => {
    setCalculationParams((prev: RunCalculationRequest) => ({
      ...prev,
      systemId: seriesId,
    }));
    setIsSeriesCalculateModalOpen(true);
  };

  const closeSeriesCalculateModal = () => {
    setIsSeriesCalculateModalOpen(false);
  };

  const handleSeriesCalculate = async () => {
    try {
      await RunSeriesCalculation(calculationParams);
      closeSeriesCalculateModal();
      showSuccess('Calculation Started', 'Your calculation has been queued and will begin processing shortly.');
    } catch (error) {
      console.error('Error starting calculation:', error);
      showError('Calculation Failed', 'Unable to start calculation. Please try again.');
    }
  };

  const handleParamChange = (path: string, value: unknown) => {
    setCalculationParams((prev: RunCalculationRequest) => {
      const keys = path.split('.');
      const newParams = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newParams;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newParams;
    });
  };

  const handleViewSeriesScatteringAverageChartSelected = useCallback(() => {
    if (!selectedSeriesScatteringGroup) return;
    if (selectedSeriesScatteringGroup.calculationIds.length === 0) return;
    const request: PlotChartRequest = {
      CalculatesId: selectedSeriesScatteringGroup.calculationIds,
      ChartTitle: 'Scattering (average)',
      XAxis: 'Q',
      YAxis: 'I',
      ScaleMethodsX: 'Log',
      ScaleMethodsY: 'Log',
    };
    const params = new URLSearchParams();
    params.set('calcIds', selectedSeriesScatteringGroup.calculationIds.join(','));
    params.set('isAverage', '1');
    params.set('seriesId', seriesId);
    params.set('qFrom', String(selectedSeriesScatteringGroup.parameters.qVectorFrom));
    params.set('qTo', String(selectedSeriesScatteringGroup.parameters.qVectorTo));
    navigate(`/calculations/${selectedSeriesScatteringGroup.calculationIds[0]}/chart?${params.toString()}`, {
      state: { request, isAverage: true },
    });
  }, [navigate, selectedSeriesScatteringGroup, seriesId]);

  const handleViewSeriesAverageChart = useCallback(async () => {
    setIsSeriesAverageChartLoading(true);
    try {
      const res = await fetchNanosystemList(`seriesId=${seriesId}`, 1, 500);
      const nanosystems = res.result.data;
      if (nanosystems.length === 0) {
        showError('No systems', 'This series has no nanosystems.');
        return;
      }
      const firstAnalysisIds = await Promise.all(
        nanosystems.map((ns) =>
          fetchRadialAnalysisList(ns.id, 1, 1, undefined, 'startDate').then(
            (r) => r.result.data[0]?.id,
          ),
        ),
      );
      const ids = firstAnalysisIds.filter((id): id is string => id != null);
      if (ids.length === 0) {
        showError('No analyses', 'No radial analyses found for systems in this series. Run radial analysis for at least one system.');
        return;
      }
      const request: PlotAnalyseRequest = {
        RadialAnalysisIds: ids,
        ChartTitle: 'Series average (first analyses)',
        XAxis: 'r, nm',
        YAxis: 'Numerical concentration',
        ScaleMethodsX: 0,
        ScaleMethodsY: 0,
      };
      const params = new URLSearchParams();
      params.set('analysisIds', ids.join(','));
      params.set('isAverage', '1');
      params.set('seriesId', seriesId);
      navigate(`/radial-analyses/${ids[0]}/chart?${params.toString()}`, { state: { request, isAverage: true } });
    } catch (error) {
      console.error('Error loading series average chart:', error);
      showError('Chart error', 'Failed to load first analyses for the series.');
    } finally {
      setIsSeriesAverageChartLoading(false);
    }
  }, [seriesId, navigate, showError]);

  // Loading and error states
  if (isSeriesLoading) {
    return <div className="text-center py-8">Loading series data...</div>;
  }

  if (!series) {
    return <div className="text-center py-8">Series not found</div>;
  }

  return (
    <div className="space-y-6">
      <SeriesHeader series={series} generationDuration={seriesGenerationDuration} />

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1" aria-label="Series sections">
          <button
            type="button"
            onClick={() => setSeriesTab('main')}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
              seriesTab === 'main'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Series
          </button>
          <button
            type="button"
            onClick={() => setSeriesTab('comment')}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
              seriesTab === 'comment'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Comment
          </button>
        </nav>
      </div>

      {seriesTab === 'comment' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <label htmlFor="series-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Comment text
          </label>
          <textarea
            id="series-comment"
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value.slice(0, MAX_SERIES_COMMENT_LENGTH))}
            rows={14}
            maxLength={MAX_SERIES_COMMENT_LENGTH}
            placeholder="Add a note for this series..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[200px]"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {commentDraft.length} / {MAX_SERIES_COMMENT_LENGTH}
            </span>
            <button
              type="button"
              onClick={handleSaveComment}
              disabled={isSavingComment}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {isSavingComment ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : null}

      {seriesTab === 'main' ? (
        <>
      {/* Calculation Action Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Calculate?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Start SAXS calculation for this series. The process will calculate by all nanosystems in the series.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 font-semibold text-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden"
              onClick={openSeriesCalculateModal}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon with animation */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold">Start Calculation</div>
                  <div className="text-xs opacity-90 font-normal">Launch SAXS calculate</div>
                </div>
              </div>
              
              {/* Loading indicator (hidden by default) */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Series average chart: one graph = average of first analysis per system */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chart: average of first analyses
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Build one chart with the average value across the first radial analysis of each system in this series.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              disabled={isSeriesAverageChartLoading}
              onClick={handleViewSeriesAverageChart}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-800 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 font-semibold text-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="text-left">
                  <div className="font-bold">
                    {isSeriesAverageChartLoading ? 'Loading…' : 'View series average chart'}
                  </div>
                  <div className="text-xs opacity-90 font-normal">First analysis per system, averaged</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Series scattering average: average by equal input parameters */}
      <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chart: average intensity by input parameters
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Choose one parameter set; we average scattering intensity across systems that match it.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              disabled={isSeriesScatteringGroupsLoading || !selectedSeriesScatteringGroup || selectedSeriesScatteringGroup.calculationIds.length === 0}
              onClick={handleViewSeriesScatteringAverageChartSelected}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-700 text-white rounded-xl shadow-lg hover:from-indigo-700 hover:to-cyan-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 font-semibold text-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="text-left">
                  <div className="font-bold">
                    {isSeriesScatteringGroupsLoading ? 'Loading…' : 'View averaged intensity'}
                  </div>
                  <div className="text-xs opacity-90 font-normal">
                    {selectedSeriesScatteringGroup
                      ? `Systems: ${selectedSeriesScatteringGroup.systemsCount}`
                      : 'Select a group'}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {isSeriesScatteringGroupsLoading ? (
          <div className="mt-4 text-center text-gray-600 dark:text-gray-300">
            Loading calculation groups...
          </div>
        ) : seriesScatteringGroups.length > 0 ? (
          <div className="mt-5 space-y-2">
            {seriesScatteringGroups.map((group) => (
              <label
                key={group.groupId}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSeriesScatteringGroupId === group.groupId
                    ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-300 dark:bg-indigo-900/20'
                    : 'border-gray-200 hover:border-indigo-300 dark:border-gray-800 dark:hover:border-indigo-300/60'
                }`}
              >
                <input
                  type="radio"
                  name="series-scattering-group"
                  checked={selectedSeriesScatteringGroupId === group.groupId}
                  onChange={() => setSelectedSeriesScatteringGroupId(group.groupId)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        Q: {group.parameters.qVectorFrom}-{group.parameters.qVectorTo}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Phi:{' '}
                        {group.parameters.phiVectorFrom == null || (group.parameters.phiVectorFrom === -1 && group.parameters.phiVectorTo === -1)
                          ? '—'
                          : `${group.parameters.phiVectorFrom}-${group.parameters.phiVectorTo}`}
                        {' | '}
                        Theta:{' '}
                        {group.parameters.thetaVectorFrom == null || (group.parameters.thetaVectorFrom === -1 && group.parameters.thetaVectorTo === -1)
                          ? '—'
                          : `${group.parameters.thetaVectorFrom}-${group.parameters.thetaVectorTo}`}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {group.systemsCount} systems
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-center text-gray-600 dark:text-gray-300">
            No grouped calculations found yet for this series.
          </div>
        )}
      </div>

      <NanosystemsTable
        nanosystems={nanosystems as ApiResponseListNanosystemDto}
        isLoading={isNanosystemsLoading}
        onNanosystemClick={openNanosystemDetails}
        onOpenNanosystemPage={(system) => navigate(`/series/${seriesId}/nanosystems/${system.id}`)}
        seriesId={seriesId}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
        </>
      ) : null}

      <NanosystemDetailsModal
        nanosystem={selectedNanosystem}
        isOpen={isModalOpen}
        onClose={closeModal}
        seriesId={seriesId}
        {...workspace.viewProps}
      />

      <NanosystemWorkspaceModals workspace={workspace} />

      <CalculationModal
        isOpen={isSeriesCalculateModalOpen}
        onClose={closeSeriesCalculateModal}
        calculationParams={{ ...calculationParams, systemId: seriesId }}
        onParamChange={handleParamChange}
        onCalculate={handleSeriesCalculate}
        isSeries={true}
      />
    </div>
  );
};