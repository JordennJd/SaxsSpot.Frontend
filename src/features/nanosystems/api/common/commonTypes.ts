import { z } from 'zod';

export const errorResponseSchema = z.object({
    title: z.string(),
    status: z.number(),
    detail: z.string(),
    errors: z.object({
    }),
  });

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
    z.object({
        data: z.array(schema),
        count: z.number().int().nonnegative(),
        page: z.number().int().positive(),
        pageSize: z.number().int().positive(),
    });

// Тип для использования с TypeScript
export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<z.ZodType<T>>>>;