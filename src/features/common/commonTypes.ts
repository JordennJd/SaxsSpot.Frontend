import { z } from 'zod';

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        result: z.object({
            count: z.number(),
            data: z.array(dataSchema),
        }),
        isSuccess: z.boolean(),
        errors: z.array(z.unknown()),
    });


export type ApiResponse<T> = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodType<T>>>>;
