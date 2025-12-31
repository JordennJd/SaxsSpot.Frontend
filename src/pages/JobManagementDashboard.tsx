import { useJobManagement } from '../features/jobs/hooks/useJobManagement';
import { JobSection } from '../features/jobs/components/JobSection';
import { LoadingSpinner, ErrorState } from '@/components/ui';

const JobManagementDashboard = () => {
    const { jobs, visibleCounts, isLoading, error, loadMore, retry, refresh } = useJobManagement();

    if (error) {
        return (
            <ErrorState
                title="Failed to load jobs"
                message={error}
                onRetry={retry}
                fullScreen
            />
        );
    }

    if (isLoading) {
        return (
            <LoadingSpinner
                size="lg"
                text="Loading jobs..."
                fullScreen
            />
        );
    }

    const totalJobs = jobs.waiting.length + jobs.running.length + jobs.completed.length + jobs.failed.length;

    return (
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                            Job Management Dashboard
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                            Monitor and manage calculation jobs
                        </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            Total: {totalJobs}
                        </span>
                    </div>
                </div>
            </div>

            {/* Job Status Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
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
        </div>
    );
};

export default JobManagementDashboard;