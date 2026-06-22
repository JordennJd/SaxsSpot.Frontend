import {useEffect, useState, useCallback, useMemo} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {useQueryClient} from '@tanstack/react-query';
import {useToastContext} from '../contexts/ToastContext';

import {type ApiResponseListNanosystemDto, type NanosystemDto} from '../features/nanosystems/api/nanosystemTypes';
import type { RunCalculationRequest } from '../features/calculation/api/calculationTypes.ts';
import {RunSeriesCalculation} from '../features/calculation/api/calculationApi.ts';
import { updateSeriesComment} from '../features/nanosystems/api/nanosystemApi.ts';
import { CalculationModal, NanosystemDetailsModal, NanosystemsTable, SeriesHeader } from '../components/series';
import { SeriesActionsBar } from '../components/series/SeriesActionsBar';
import { openNanosystemInNewWindow } from '@/lib/navigation';
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
  const [seriesTab, setSeriesTab] = useState<'main' | 'comment'>('main');
  const [commentDraft, setCommentDraft] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

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

  const handleSeriesCalculate = async () => {
    try {
      await RunSeriesCalculation(calculationParams);
      setIsSeriesCalculateModalOpen(false);
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

  if (isSeriesLoading) {
    return <div className="text-center py-8">Loading series data...</div>;
  }

  if (!series) {
    return <div className="text-center py-8">Series not found</div>;
  }

  return (
    <div className="space-y-5">
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
            Systems
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
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingComment ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : null}

      {seriesTab === 'main' ? (
        <>
          <SeriesActionsBar
            seriesId={seriesId}
            systemCount={nanosystems?.result.count}
            onRunModel={openSeriesCalculateModal}
          />

          <NanosystemsTable
            nanosystems={nanosystems as ApiResponseListNanosystemDto}
            isLoading={isNanosystemsLoading}
            onNanosystemClick={openNanosystemDetails}
            onOpenNanosystemPage={(system) => navigate(`/series/${seriesId}/nanosystems/${system.id}`)}
            onOpenNanosystemNewWindow={(system) => openNanosystemInNewWindow(seriesId, system.id)}
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
        onClose={() => setIsSeriesCalculateModalOpen(false)}
        calculationParams={{ ...calculationParams, systemId: seriesId }}
        onParamChange={handleParamChange}
        onCalculate={handleSeriesCalculate}
        isSeries={true}
      />
    </div>
  );
};
