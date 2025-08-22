import {type Job, JobStatus} from '../api/jobTypes.ts';
import {useState} from 'react';

interface InputJobCard {
    job: Job
}

export const JobCard = ({ job }: InputJobCard) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const statusColors: Record<JobStatus, string> = {
        StatusCreated: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        StatusPending: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        StatusRunning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        StatusCompleted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        StatusFailed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    } as const;

    const statusLabels: Record<JobStatus, string> = {
        StatusCreated: 'Waiting',
        StatusPending: 'Pending',
        StatusRunning: 'Running',
        StatusCompleted: 'Completed',
        StatusFailed: 'Failed',
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div
            className={`bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-3 
        transition-all duration-200 hover:shadow-md cursor-pointer ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
            onClick={toggleExpand}
        >
            <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                    <h4 className="font-medium text-gray-800 dark:text-white truncate">{job.jobType}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.message}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColors[job.status]}`}>
          {statusLabels[job.status]}
        </span>
            </div>

            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p className="truncate">
                    <span className="font-medium">Created:</span> {new Date(job.createdAt).toLocaleString()}
                </p>
                {job.status === JobStatus.Enum.StatusRunning && job.startedAt && (
                    <p className="truncate">
                        <span className="font-medium">Started:</span> {new Date(job.startedAt).toLocaleString()}
                    </p>
                )}
                {job.status === JobStatus.Enum.StatusCompleted && job.finishedAt && (
                    <p className="truncate">
                        <span className="font-medium">Finished:</span> {new Date(job.finishedAt).toLocaleString()}
                    </p>
                )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 animate-fadeIn">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium mb-1">Details:</p>
                        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                            {job.message || 'No additional details available'}
                        </p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Job ID: {job.jobId}
                    </div>
                </div>
            )}
        </div>
    );
};