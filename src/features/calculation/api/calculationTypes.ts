import { z } from 'zod';
import { ApiResponseListSchema } from '../../common/commonTypes.ts';

// ==================== ENUMS AND SCHEMAS ====================

export const ScaleMethodSchema = z.number().transform(val => {
    const mapping = {
        0: 'Step',
        1: 'Length',
    };
    const result = mapping[val as keyof typeof mapping];
    if (!result) throw new Error(`Invalid ScaleMethod value: ${val}`);
    return result;
});

export const SpaceMethodSchema = z.number().transform(val => {
    const mapping = {
        0: 'Linear',
        1: 'Log',
    };
    const result = mapping[val as keyof typeof mapping];
    if (!result) throw new Error(`Invalid SpaceMethod value: ${val}`);
    return result;
});

// Схема для дат в формате 2025-08-15T08:43:23.539296
const DateTimeSchema = z.string().refine(val => {
    return !isNaN(Date.parse(val)) && val.includes('T');
}, {
    message: 'Must be a valid ISO 8601 datetime string',
});

export const CalculationDtoSchema = z.object({
    id: z.string().uuid(),
    nanosystemId: z.string().uuid(),
    objectId: z.string().uuid(),
    userId: z.string().uuid(),
    qVectorFrom: z.number(),
    qVectorTo: z.number(),
    qSpaceMethod: SpaceMethodSchema,
    qScaleMethod: ScaleMethodSchema,
    qSpaceParameter: z.number(),
    phiVectorFrom: z.number().nullable(),
    phiVectorTo: z.number().nullable(),
    phiSpaceMethod: SpaceMethodSchema.nullable(),
    phiScaleMethod: ScaleMethodSchema.nullable(),
    phiSpaceParameter: z.number().nullable(),
    thetaVectorFrom: z.number().nullable(),
    thetaVectorTo: z.number().nullable(),
    thetaSpaceMethod: SpaceMethodSchema.nullable(),
    thetaScaleMethod: ScaleMethodSchema.nullable(),
    thetaSpaceParameter: z.number().nullable(),
    inputDate: DateTimeSchema,
    calculateStart: DateTimeSchema,
    calculateEnd: DateTimeSchema.nullable(),
});


export const PlotChartRequestSchema = z.object({
    ChartTitle: z.string(),
    XAxis: z.string(),
    YAxis: z.string(),
    CalculatesId: z.array(z.string().uuid()),
    ScaleMethodsX: SpaceMethodSchema,
    ScaleMethodsY: SpaceMethodSchema,
});

export const spaceParametersSchema = z.object({
    spaceMethod: z.number(),
    scaleMethod: z.number(),
    spaceParameter: z.number(),
    start: z.number(),
    end: z.number(),
});

export const RunCalculationRequestSchema = z.object({
    qVectorSpaceParameters: spaceParametersSchema,
    phiVectorSpaceParameters: spaceParametersSchema,
    thetaVectorSpaceParameters: spaceParametersSchema,
    systemId: z.string().uuid(),
    requestId: z.string(),
    particleKind: z.number(),
});

// ==================== TYPES ====================

export type ScaleMethod = z.infer<typeof ScaleMethodSchema>;
export type SpaceMethod = z.infer<typeof SpaceMethodSchema>;
export type RunCalculationRequest = z.infer<typeof RunCalculationRequestSchema>
export type CalculationDto = z.infer<typeof CalculationDtoSchema>;
export const CalculationApiResponseSchema = ApiResponseListSchema(CalculationDtoSchema);
export type CalculationApiResponse = z.infer<typeof CalculationApiResponseSchema>;
export type PlotChartRequest = z.infer<typeof PlotChartRequestSchema>;
