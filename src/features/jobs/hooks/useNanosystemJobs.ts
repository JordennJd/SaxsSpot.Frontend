import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchJobs } from '../api/jobApi';
import { type Job, JobStatus } from '../api/jobTypes';
import { filterJobsForNanosystem } from '@/lib/jobNanosystemFilter';
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

export function useNanosystemJobs(nanosystemId: string | undefined, enabled = true) {
  const { data: rawJobs, loading: isLoading, error, execute: fetchJobsData } = useAsyncState<Job[]>([]);

  const [visibleCounts, setVisibleCounts] = useState<VisibleCounts>({
    waiting: 5,
    running: 5,
    completed: 5,
    failed: 5,
  });

  const sortByDate = useCallback((jobs: Job[]): Job[] => {
    return [...jobs].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, []);

  const jobs = useMemo((): JobCategories => {
    if (!rawJobs || !nanosystemId) {
      return { waiting: [], running: [], completed: [], failed: [] };
    }

    const filtered = sortByDate(filterJobsForNanosystem(rawJobs, nanosystemId));

    return {
      waiting: filtered.filter((job) => job.status === JobStatus.Enum.StatusCreated),
      running: filtered.filter((job) => job.status === JobStatus.Enum.StatusRunning),
      completed: filtered.filter((job) => job.status === JobStatus.Enum.StatusCompleted),
      failed: filtered.filter((job) => job.status === JobStatus.Enum.StatusFailed),
    };
  }, [rawJobs, nanosystemId, sortByDate]);

  const totalCount = jobs.waiting.length + jobs.running.length + jobs.completed.length + jobs.failed.length;

  const loadMore = useCallback((category: keyof VisibleCounts) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [category]: prev[category] + 5,
    }));
  }, []);

  const refresh = useCallback(async () => {
    const currentDate = new Date();
    await fetchJobsData(() =>
      fetchJobs({
        dateFrom: currentDate,
        dateTo: currentDate,
      }),
    );
  }, [fetchJobsData]);

  useEffect(() => {
    if (!enabled || !nanosystemId) return;

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [enabled, nanosystemId, refresh]);

  return {
    jobs,
    visibleCounts,
    totalCount,
    isLoading,
    error,
    loadMore,
    refresh,
  };
}
