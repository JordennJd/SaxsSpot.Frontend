import { Link } from 'react-router-dom';
import { ChartBarSquareIcon } from '@heroicons/react/24/outline';
import { getSeriesCalculationsUrl } from '@/lib/navigation';
import { SCATTERING } from '@/lib/scatteringLabels';
import { SeriesBulkSaxsPanel } from './SeriesBulkSaxsPanel';
import { SeriesBulkRadialPanel } from './SeriesBulkRadialPanel';

interface SeriesActionsBarProps {
  seriesId: string;
  systemCount?: number;
  onRunModel: () => void;
  onViewRadialAverageChart?: () => void;
  isRadialAverageChartLoading?: boolean;
}

export const SeriesActionsBar = ({
  seriesId,
  systemCount,
  onRunModel,
  onViewRadialAverageChart,
  isRadialAverageChartLoading = false,
}: SeriesActionsBarProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
    <div className="flex flex-wrap items-center gap-2">
      <Link
        to={getSeriesCalculationsUrl(seriesId)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
      >
        <ChartBarSquareIcon className="h-4 w-4" />
        Charts
      </Link>
      <SeriesBulkRadialPanel seriesId={seriesId} systemCount={systemCount} variant="inline" />
      <SeriesBulkSaxsPanel seriesId={seriesId} systemCount={systemCount} variant="inline" />
      <button
        type="button"
        onClick={onRunModel}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60"
      >
        {SCATTERING.runModel}
      </button>
      {onViewRadialAverageChart && (
        <button
          type="button"
          disabled={isRadialAverageChartLoading || systemCount === 0}
          onClick={onViewRadialAverageChart}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 disabled:opacity-50 dark:text-pink-300 dark:bg-pink-950/40"
        >
          {isRadialAverageChartLoading ? 'Loading…' : 'Radial average chart'}
        </button>
      )}
    </div>
    {systemCount != null && (
      <span className="text-xs text-gray-500">{systemCount} systems</span>
    )}
  </div>
);
