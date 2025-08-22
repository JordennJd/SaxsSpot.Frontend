import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchJobs } from '../api/jobApi';
import { type Job, JobStatus } from '../api/jobTypes';
import { useAsyncState } from '@/hooks';

interface JobCategories {
  waiting: Job[];
  running: Job[];
  completed: Job[];
  failed: Job[];
}

interface VisibleCounts {
  waiting: number;
  running: number;
  completed: number;
  failed: number;
}

export interface UseJobManagementReturn {
  jobs: JobCategories;
  visibleCounts: VisibleCounts;
  isLoading: boolean;
  error: string | null;
  loadMore: (category: keyof VisibleCounts) => void;
  refresh: () => Promise<void>;
  retry: () => void;
}

export function useJobManagement(): UseJobManagementReturn {
  const { data: rawJobs, loading: isLoading, error, execute: fetchJobsData } = useAsyncState<Job[]>([]);
  
  const [visibleCounts, setVisibleCounts] = useState<VisibleCounts>({
    waiting: 10,
    running: 10,
    completed: 10,
    failed: 10,
  });

  // Sort jobs by date (newest first)
  const sortByDate = useCallback((jobs: Job[]): Job[] => {
    return [...jobs].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, []);

  // Categorize jobs by status
  const jobs = useMemo((): JobCategories => {
    if (!rawJobs) {
      return { waiting: [], running: [], completed: [], failed: [] };
    }

    const sortedJobs = sortByDate(rawJobs);
    
    return {
      waiting: sortedJobs.filter(job => job.status === JobStatus.Enum.StatusCreated),
      running: sortedJobs.filter(job => job.status === JobStatus.Enum.StatusRunning),
      completed: sortedJobs.filter(job => job.status === JobStatus.Enum.StatusCompleted),
      failed: sortedJobs.filter(job => job.status === JobStatus.Enum.StatusFailed),
    };
  }, [rawJobs, sortByDate]);

  // Load more items for a specific category
  const loadMore = useCallback((category: keyof VisibleCounts) => {
    setVisibleCounts(prev => ({
      ...prev,
      [category]: prev[category] + 10,
    }));
  }, []);

  // Refresh job data
  const refresh = useCallback(async () => {
    const currentDate = new Date();
    await fetchJobsData(() => fetchJobs({
      dateFrom: currentDate,
      dateTo: currentDate,
    }));
  }, [fetchJobsData]);

  // Retry on error
  const retry = useCallback(() => {
    refresh();
  }, [refresh]);

  // Initial data fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    jobs,
    visibleCounts,
    isLoading,
    error,
    loadMore,
    refresh,
    retry,
  };
} 