import type { Job } from '@/features/jobs/api/jobTypes';

const normalizeId = (id: string) => id.trim().toLowerCase();

/** Extract nanosystem id from job context JSON (field names vary by job type). */
export function extractNanosystemIdFromJobContext(context: string | null): string | null {
  if (!context) return null;

  try {
    const ctx = JSON.parse(context) as Record<string, unknown>;
    const direct =
      ctx.NanosystemId ??
      ctx.nanosystemId ??
      ctx.SystemId ??
      ctx.systemId;
    if (direct != null && String(direct).length > 0) {
      return String(direct);
    }

    const operationId = ctx.OperationId ?? ctx.operationId;
    if (operationId != null && String(operationId).length > 0) {
      return String(operationId);
    }
  } catch {
    // ignore malformed JSON
  }

  return null;
}

/** Whether a tracker job belongs to the given nanosystem. */
export function jobBelongsToNanosystem(job: Job, nanosystemId: string): boolean {
  const target = normalizeId(nanosystemId);

  if (job.jobType === 'nanosystem-generation' && normalizeId(job.jobId) === target) {
    return true;
  }

  const fromContext = extractNanosystemIdFromJobContext(job.context);
  if (fromContext && normalizeId(fromContext) === target) {
    return true;
  }

  return job.context != null && job.context.toLowerCase().includes(target);
}

export function filterJobsForNanosystem(jobs: Job[], nanosystemId: string): Job[] {
  return jobs.filter((job) => jobBelongsToNanosystem(job, nanosystemId));
}
