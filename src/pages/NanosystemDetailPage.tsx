import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { NanosystemDetailsView, NanosystemActionButtons, type NanosystemTabId } from '../components/series/NanosystemDetailsView';
import { NanosystemWorkspaceModals } from '../components/series/NanosystemWorkspaceModals';
import { useNanosystemData, useSeriesData } from '../hooks/useSeriesDetail';
import { useNanosystemWorkspace } from '../hooks/useNanosystemWorkspace';
import { formatDateTime, formatGenerationDuration } from '@/lib/utils';

const parseTab = (value: string | null): NanosystemTabId | undefined => {
  if (value === 'overview' || value === 'legacy' || value === 'radial' || value === 'saxs') {
    return value;
  }
  return undefined;
};

export const NanosystemDetailPage = () => {
  const { seriesId = '', nanosystemId = '' } = useParams<{ seriesId: string; nanosystemId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: series, isLoading: isSeriesLoading } = useSeriesData(seriesId);
  const { data: nanosystem, isLoading: isNanosystemLoading, isError } = useNanosystemData(nanosystemId);
  const workspace = useNanosystemWorkspace(nanosystem, seriesId);

  const initialTab = useMemo(() => parseTab(searchParams.get('tab')), [searchParams]);

  const handleTabChange = (tab: NanosystemTabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  if (isSeriesLoading || isNanosystemLoading) {
    return <div className="text-center py-16 text-gray-600">Loading nanosystem…</div>;
  }

  if (isError || !nanosystem) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-gray-600">Nanosystem not found.</p>
        <Link to={`/series/${seriesId}`} className="text-indigo-600 hover:underline inline-flex items-center gap-1">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to series
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-800 transition-colors">
          Series
        </Link>
        <ChevronRightIcon className="h-4 w-4 shrink-0" />
        <Link to={`/series/${seriesId}`} className="hover:text-gray-800 transition-colors truncate max-w-[200px]">
          {series?.comment?.trim() || seriesId.slice(0, 8)}
        </Link>
        <ChevronRightIcon className="h-4 w-4 shrink-0" />
        <span className="text-gray-900 font-medium font-mono truncate max-w-[280px]">{nanosystem.id.slice(0, 8)}…</span>
      </nav>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nanosystem</h1>
              <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-300 break-all">{nanosystem.id}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                  {nanosystem.particleKind}
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {nanosystem.particleCount.toLocaleString()} particles
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {nanosystem.globalSize} nm
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  Gen: {formatGenerationDuration(nanosystem.generationStart, nanosystem.generationEnd)}
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {formatDateTime(nanosystem.inputDate)}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <NanosystemActionButtons
                onDownload={workspace.viewProps.onDownload}
                onView3D={workspace.viewProps.onView3D}
                onCalculate={workspace.viewProps.onCalculate}
                onAnalyse={workspace.viewProps.onAnalyse}
                onScatteringCalculate={workspace.viewProps.onScatteringCalculate}
              />
            </div>
          </div>
        </div>

        <NanosystemDetailsView
          nanosystem={nanosystem}
          layout="page"
          initialTab={initialTab}
          onTabChange={handleTabChange}
          showFooterActions={false}
          {...workspace.viewProps}
        />
      </div>

      <NanosystemWorkspaceModals workspace={workspace} />
    </div>
  );
};
