import { JobSection } from '@/features/jobs/components/JobSection';
import { useNanosystemJobs } from '@/features/jobs/hooks/useNanosystemJobs';
import { LoadingSpinner, ErrorState } from '@/components/ui';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface NanosystemJobsTabProps {
  nanosystemId: string;
  active?: boolean;
}

export const NanosystemJobsTab = ({ nanosystemId, active = true }: NanosystemJobsTabProps) => {
  const { jobs, visibleCounts, totalCount, isLoading, error, loadMore, refresh } = useNanosystemJobs(
    nanosystemId,
    active,
  );

  if (error) {
    return (
      <ErrorState
        title="Failed to load jobs"
        message={error}
        onRetry={refresh}
      />
    );
  }

  if (isLoading && totalCount === 0) {
    return <LoadingSpinner size="md" text="Loading jobs…" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">
          Tasks for this nanosystem only · {totalCount} total
        </p>
        <button
          type="button"
          onClick={() => refresh()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-sm">No jobs for this system yet.</p>
          <p className="text-xs mt-1 text-gray-400">Generation, scattering, and analysis tasks appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <JobSection
            title="Waiting"
            jobs={jobs.waiting}
            visibleCount={visibleCounts.waiting}
            color="yellow"
            onLoadMore={() => loadMore('waiting')}
            onCancel={refresh}
          />
          <JobSection
            title="Running"
            jobs={jobs.running}
            visibleCount={visibleCounts.running}
            color="blue"
            onLoadMore={() => loadMore('running')}
            onCancel={refresh}
          />
          <JobSection
            title="Completed"
            jobs={jobs.completed}
            visibleCount={visibleCounts.completed}
            color="green"
            onLoadMore={() => loadMore('completed')}
            onCancel={refresh}
          />
          <JobSection
            title="Failed"
            jobs={jobs.failed}
            visibleCount={visibleCounts.failed}
            color="red"
            onLoadMore={() => loadMore('failed')}
            onCancel={refresh}
          />
        </div>
      )}
    </div>
  );
};
