// src/features/nanosystems/api/nanosystemTypes.ts
import { z } from 'zod';
import {ApiResponseListSchema, ApiResponseSchema} from '@/features/common/commonTypes.ts';

export const ParticleKindMap = {
  0: 'Sphere',
  1: 'Parallelepiped',
} as const;

export type ParticleKindNumber = keyof typeof ParticleKindMap;
export type ParticleKindString = typeof ParticleKindMap[ParticleKindNumber];
export type ParticleKind = ParticleKindString;

export const ParticleKindSchema = z.union([
  z.nativeEnum(ParticleKindMap), // Для строковых значений
  z.number().transform(val => {  // Для числовых значений
    if (val in ParticleKindMap) {
      return ParticleKindMap[val as ParticleKindNumber];
    }
    throw new Error(`Invalid ParticleKind value: ${val}`);
  }),
]).refine(val => Object.values(ParticleKindMap).includes(val as ParticleKindString), {
  message: 'Invalid particle kind',
});
export const NanosystemSeriesDtoSchema = z.object({
  id: z.string().uuid(),
  particleKind: ParticleKindSchema,
  particleCountFrom: z.number(),
  particleCountTo: z.number(),
  globalSizeFrom: z.number(),
  globalSizeTo: z.number(),
  numericalConcentrationFrom: z.number(),
  numericalConcentrationTo: z.number(),
  excessFrom: z.number().nullable(),
  excessTo: z.number().nullable(),
  maxParticleSizeFrom: z.number(),
  maxParticleSizeTo: z.number(),
  minParticleSizeFrom: z.number(),
  minParticleSizeTo: z.number(),
  kFrom: z.number(),
  kTo: z.number(),
  thetaFrom: z.number(),
  thetaTo: z.number(),
});

export type NanosystemSeriesDto = z.infer<typeof NanosystemSeriesDtoSchema>;

export const CommonParticleGenerationParametersSchema = z.object({
  count: z.number(),
  numericalConcentration: z.number().nullable(),
  globalSize: z.number().nullable(),
  minSize: z.number(),
  maxSize: z.number(),
  theta: z.number(),
  k: z.number(),
  excess: z.number(),
  epsilon: z.number().nullable(),
});

export const MassGenerateNanoSystemOptionsSchema = z.object({
  options: z.array(CommonParticleGenerationParametersSchema),
  nanoSystemsKind: ParticleKindSchema,
});
export type CommonParticleGenerationParameters = z.infer<typeof CommonParticleGenerationParametersSchema>;
export const ApiResponseMassGenerateNanoSystemOptionsSchema = ApiResponseSchema(MassGenerateNanoSystemOptionsSchema);
export type ApiResponseMassGenerateNanoSystemOptions = z.infer<typeof ApiResponseMassGenerateNanoSystemOptionsSchema>;
export type MassGenerateNanoSystemOptions = z.infer<typeof MassGenerateNanoSystemOptionsSchema>;

export const GetNanosystemGenerationOptionsQuerySchema = z.object({
  count: z.number().int().positive(),
  particleKind: z.enum(['0', '1']).transform(Number),
  epsilonFrom: z.number().nullable(),
  epsilonTo: z.number().nullable(),
  particleCountFrom: z.number().int(),
  particleCountTo: z.number().int(),
  globalSizeFrom: z.number().nullable(),
  globalSizeTo: z.number().nullable(),
  numericalConcentrationFrom: z.number().nullable(),
  numericalConcentrationTo: z.number().nullable(),
  excessFrom: z.number().nullable(),
  excessTo: z.number().nullable(),
  maxParticleSizeFrom: z.number(),
  maxParticleSizeTo: z.number(),
  minParticleSizeFrom: z.number(),
  minParticleSizeTo: z.number(),
  kFrom: z.number(),
  kTo: z.number(),
  thetaFrom: z.number(),
  thetaTo: z.number(),
});

export type GetNanosystemGenerationOptionsQuery = z.infer<typeof GetNanosystemGenerationOptionsQuerySchema>;

// Или более компактный вариант:
export const GenerationZoneFormSchema = z.number().transform(val => {
  const mapping = {
    0: 'Cube',
    1: 'Sphere',
  };
  const result = mapping[val as keyof typeof mapping];
  if (!result) throw new Error(`Invalid GenerationZoneForm value: ${val}`);
  return result;
});
export const NanosystemDtoSchema = z.object({
  id: z.string().uuid(),
  particleKind: ParticleKindSchema,
  seriesId: z.string().uuid(),
  objectId: z.string().uuid(),
  userId: z.number(),
  particleCount: z.number(),
  globalSize: z.number(),
  generationZoneVolume: z.number(),
  generationZoneForm: GenerationZoneFormSchema,
  numericalConcentration: z.number(),
  maxParticleSize: z.number(),
  minParticleSize: z.number(),
  excess: z.number(),
  k: z.number(),
  theta: z.number(),
  generationStart: z.string(), // или z.date() если парсится в Date
  generationEnd: z.string(),   // или z.date() если парсится в Date
  inputDate: z.string(),       // или z.date() если парсится в Date
});

// Тип TypeScript на основе схемы
export type NanosystemDto = z.infer<typeof NanosystemDtoSchema>;
export const ApiResponseListNanosystemDtoSchema = ApiResponseListSchema(NanosystemDtoSchema);
export const NanosystemSeriesListApiResponseSchema = ApiResponseListSchema(NanosystemSeriesDtoSchema);
export type NanosystemSeriesListApiResponse = z.infer<typeof NanosystemSeriesListApiResponseSchema>;
export type ApiResponseListNanosystemDto = z.infer<typeof ApiResponseListNanosystemDtoSchema>;