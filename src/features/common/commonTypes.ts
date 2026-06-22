import { z } from 'zod';

export const ApiResponseListSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        result: z.object({
            count: z.number(),
            data: z.array(dataSchema),
        }).nullable().transform((value) => value ?? { count: 0, data: [] }),
        isSuccess: z.boolean(),
        errors: z.array(z.unknown()).optional().default([]),
    });

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        result: dataSchema,
        isSuccess: z.boolean(),
        errors: z.array(z.unknown()).optional().default([]),
    });


export type ApiListResponse<T> = z.infer<ReturnType<typeof ApiResponseListSchema<z.ZodType<T>>>>;
export type ApiResponse<T> = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodType<T>>>>;

