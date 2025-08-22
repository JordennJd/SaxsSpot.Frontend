import { z } from 'zod';

export const errorResponseSchema = z.object({
    title: z.string(),
    status: z.number(),
    detail: z.string(),
    errors: z.object({
    }),
  });

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export type PaginatedResponse<T> = {
    data: T[];
    count: number;
    page: number;
    pageSize: number;
};