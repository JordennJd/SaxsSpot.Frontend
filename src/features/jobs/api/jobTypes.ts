import { z } from "zod";

// JobStatus enum
export const JobStatus = z.enum([
    'StatusCreated',
    'StatusPending',
    'StatusRunning',
    'StatusCompleted',
    'StatusFailed',
]);
export type JobStatus = z.infer<typeof JobStatus>;

// UUID schema (you might want to add more specific validation)
const uuidSchema = z.string().uuid();
const statusCodeMap: Record<number, z.infer<typeof JobStatus>> = {
    0: "StatusCreated",
    1: "StatusPending",
    2: "StatusRunning",
    3: "StatusCompleted",
    4: "StatusFailed"
};

// Job schema
export const JobSchema = z.object({
    // Входные данные (snake_case)
    id: uuidSchema,
    job_id: uuidSchema, // <- snake_case (приходит от API)
    status: z.number().transform((num) => {
        const status = statusCodeMap[num];
        if (!status) throw new Error(`Invalid status code: ${num}`);
        return status;
    }),
    progress: z.number().int().min(0).max(100),
    job_type: z.string(), // <- snake_case
    message: z.string().nullable(),
    context: z.string().nullable(),
    created_at: z.string().pipe(z.coerce.date()), // ISO строка → Date
    started_at: z.string().pipe(z.coerce.date()).nullable(),
    finished_at: z.string().pipe(z.coerce.date()).nullable(),
    user_id: uuidSchema,
})
    .transform((data) => ({
        // Преобразуем в camelCase для TypeScript
        id: data.id,
        jobId: data.job_id, // <- теперь camelCase
        status: data.status,
        progress: data.progress,
        jobType: data.job_type, // <- camelCase
        message: data.message,
        context: data.context,
        createdAt: data.created_at, // <- camelCase
        startedAt: data.started_at,
        finishedAt: data.finished_at,
        userId: data.user_id,
    }));


export type Job = z.infer<typeof JobSchema>;

export const JobGetAllJobsResponse = z.object({
    is_successful: z.boolean(),
    data: z.array(JobSchema),
    error_message: z.string(),
});

export type GetAllJobsResponse = z.infer<typeof JobGetAllJobsResponse>;

export class Jobstatus {
}