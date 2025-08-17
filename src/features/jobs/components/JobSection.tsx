import { type Job } from '../api/jobTypes';
import { JobCard } from './JobCard';
import { EmptyState } from '@/components/ui';

interface JobSectionProps {
  title: string;
  jobs: Job[];
  visibleCount: number;
  color: 'blue' | 'yellow' | 'green' | 'red';
  onLoadMore: () => void;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    button: 'bg-yellow-600 hover:bg-yellow-700',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    button: 'bg-green-600 hover:bg-green-700',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    button: 'bg-red-600 hover:bg-red-700',
  },
};

export const JobSection = ({ 
  title, 
  jobs, 
  visibleCount, 
  color, 
  onLoadMore 
}: JobSectionProps) => {
  const styles = colorStyles[color];
  const visibleJobs = jobs.slice(0, visibleCount);
  const hasMore = jobs.length > visibleCount;

  if (jobs.length === 0) {
    return (
      <div className={`rounded-xl border ${styles.border} ${styles.bg} p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${styles.text}`}>
          {title} ({jobs.length})
        </h3>
        <EmptyState
          title={`No ${title.toLowerCase()} jobs`}
          description={`There are no ${title.toLowerCase()} jobs at the moment.`}
          icon="document"
        />
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${styles.text}`}>
        {title} ({jobs.length})
      </h3>
      
      <div className="space-y-3">
        {visibleJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={onLoadMore}
            className={`px-4 py-2 ${styles.button} text-white rounded-md transition-colors`}
          >
            Load More ({jobs.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}; 