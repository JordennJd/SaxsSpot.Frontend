import {JobCard} from "../features/jobs/components/JobCard.tsx";
import {type Job, JobStatus} from "../features/jobs/api/jobTypes.ts";
import {fetchJobs} from "../features/jobs/api/jobApi.ts";
import {useEffect, useState} from "react";

const JobManagementDashboard = () => {
    const [allJobs, setAllJobs] = useState<{
        waiting: Job[];
        running: Job[];
        completed: Job[];
        failed: Job[];
    }>({
        waiting: [],
        running: [],
        completed: [],
        failed: []
    });

    const [visibleCount, setVisibleCount] = useState<{
        waiting: number;
        running: number;
        completed: number;
        failed: number;
    }>({
        waiting: 10,
        running: 10,
        completed: 10,
        failed: 10
    });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Функция для сортировки по дате (новые сверху)
    const sortByDate = (jobs: Job[]) => {
        return [...jobs].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });
    };

    useEffect(() => {
        (async () => {
            try {
                const jobs = await fetchJobs({dateFrom: new Date(Date.now()), dateTo: new Date(Date.now())});
                if (jobs) {
                    const sortedJobs = sortByDate(jobs);
                    setAllJobs({
                        waiting: sortedJobs.filter(job => job.status === JobStatus.Enum.StatusCreated),
                        running: sortedJobs.filter(job => job.status === JobStatus.Enum.StatusRunning),
                        completed: sortedJobs.filter(job => job.status === JobStatus.Enum.StatusCompleted),
                        failed: sortedJobs.filter(job => job.status === JobStatus.Enum.StatusFailed)
                    });
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const loadMore = (category: keyof typeof visibleCount) => {
        setVisibleCount(prev => ({
            ...prev,
            [category]: prev[category] + 10
        }));
    };

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center">
                <div className="text-red-500 dark:text-red-400">Error: {error}</div>
                <button
                    onClick={() => setError(null)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Job Management Dashboard
                </h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Total Jobs: {allJobs.waiting.length + allJobs.running.length + allJobs.completed.length + allJobs.failed.length}
                    </span>
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* Job Status Board */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                        {/* Column Configurations */}
                        {[
                            {
                                title: "Waiting Jobs",
                                jobs: allJobs.waiting,
                                count: allJobs.waiting.length,
                                emptyText: "No waiting jobs",
                                badgeColor: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
                                category: "waiting" as const
                            },
                            {
                                title: "Running Jobs",
                                jobs: allJobs.running,
                                count: allJobs.running.length,
                                emptyText: "No running jobs",
                                badgeColor: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
                                category: "running" as const
                            },
                            {
                                title: "Completed Jobs",
                                jobs: allJobs.completed,
                                count: allJobs.completed.length,
                                emptyText: "No completed jobs",
                                badgeColor: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
                                category: "completed" as const
                            },
                            {
                                title: "Failed Jobs",
                                jobs: allJobs.failed,
                                count: allJobs.failed.length,
                                emptyText: "No failed jobs",
                                badgeColor: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
                                category: "failed" as const
                            }
                        ].map((column) => (
                            <div
                                key={column.title}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                {/* Column Header */}
                                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                        {column.title}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${column.badgeColor}`}>
                                        {column.count}
                                    </span>
                                </div>

                                {/* Job Cards List */}
                                <div className="p-3 space-y-3">
                                    {column.jobs.length > 0 ? (
                                        <>
                                            {column.jobs.slice(0, visibleCount[column.category]).map(job => (
                                                <JobCard
                                                    key={job.jobId}
                                                    job={job}
                                                />
                                            ))}
                                            {column.jobs.length > visibleCount[column.category] && (
                                                <button
                                                    onClick={() => loadMore(column.category)}
                                                    className="w-full mt-2 px-3 py-1 text-sm text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors"
                                                >
                                                    Show more ({column.jobs.length - visibleCount[column.category]} remaining)
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                                            {column.emptyText}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default JobManagementDashboard;