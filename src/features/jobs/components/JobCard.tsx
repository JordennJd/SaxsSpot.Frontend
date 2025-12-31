import {type Job, JobStatus} from '../api/jobTypes.ts';
import {useState} from 'react';
import {cancelOperation} from '@/features/nanosystems/api/nanosystemApi';
import {useToast} from '@/hooks/useToast';

interface InputJobCard {
    job: Job;
    onCancel?: () => void;
}

const SUPPORTED_OPERATION_TYPES = ['manual-series-run', 'RunRadialAnalysis'];

export const JobCard = ({ job, onCancel }: InputJobCard) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    const {showToast} = useToast();

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

    const canCancel = (job.status === JobStatus.Enum.StatusRunning || 
                      job.status === JobStatus.Enum.StatusPending) &&
                      SUPPORTED_OPERATION_TYPES.includes(job.jobType);

    const handleCancel = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!canCancel) return;
        
        setIsCancelling(true);
        try {
            await cancelOperation({
                operationId: job.jobId,
                operationType: job.jobType,
            });
            showToast('success', { title: 'Operation cancelled successfully' });
            onCancel?.();
        } catch (error) {
            showToast('error', {
                title: 'Failed to cancel operation',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div
            className={`bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 mb-3 
        transition-all duration-200 hover:shadow-md cursor-pointer ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
            onClick={toggleExpand}
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-2">
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-medium text-gray-800 dark:text-white break-words">{job.jobType}</h4>
                    {job.message && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-words line-clamp-2">
                            {job.message}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {canCancel && (
                        <button
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="px-3 py-1.5 sm:px-3 sm:py-1 text-xs sm:text-xs font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed rounded-md transition-colors touch-manipulation min-h-[32px] sm:min-h-0"
                            title="Cancel operation"
                        >
                            <span className="hidden sm:inline">{isCancelling ? 'Cancelling...' : 'Cancel'}</span>
                            <span className="sm:hidden">{isCancelling ? '...' : '✕'}</span>
                        </button>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColors[job.status]}`}>
                        {statusLabels[job.status]}
                    </span>
                </div>
            </div>

            <div className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p className="break-words">
                    <span className="font-medium">Created:</span>{' '}
                    <span className="text-gray-500 dark:text-gray-400">
                        <span className="hidden sm:inline">{new Date(job.createdAt).toLocaleString()}</span>
                        <span className="sm:hidden">
                            {new Date(job.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </span>
                </p>
                {job.status === JobStatus.Enum.StatusRunning && job.startedAt && (
                    <p className="break-words">
                        <span className="font-medium">Started:</span>{' '}
                        <span className="text-gray-500 dark:text-gray-400">
                            <span className="hidden sm:inline">{new Date(job.startedAt).toLocaleString()}</span>
                            <span className="sm:hidden">
                                {new Date(job.startedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </span>
                    </p>
                )}
                {job.status === JobStatus.Enum.StatusCompleted && job.finishedAt && (
                    <p className="break-words">
                        <span className="font-medium">Finished:</span>{' '}
                        <span className="text-gray-500 dark:text-gray-400">
                            <span className="hidden sm:inline">{new Date(job.finishedAt).toLocaleString()}</span>
                            <span className="sm:hidden">
                                {new Date(job.finishedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </span>
                    </p>
                )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 animate-fadeIn">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <p className="font-medium mb-1">Details:</p>
                        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                            {job.message || 'No additional details available'}
                        </p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 break-all">
                        <span className="font-medium">Job ID:</span> {job.jobId}
                    </div>
                </div>
            )}
        </div>
    );
};