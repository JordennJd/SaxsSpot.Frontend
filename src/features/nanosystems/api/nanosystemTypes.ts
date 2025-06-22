// src/features/nanosystems/api/nanosystemTypes.ts
import { z } from "zod";

export const ParticleKindMap = {
  0: "Sphere",
  1: "Parallelepiped",
} as const;
export type ParticleKindNumber = keyof typeof ParticleKindMap;
export type ParticleKindString = typeof ParticleKindMap[ParticleKindNumber];
export const ParticleKindSchema = z.union([
  z.nativeEnum(ParticleKindMap), // Для строковых значений
  z.number().transform(val => {  // Для числовых значений
    if (val in ParticleKindMap) {
      return ParticleKindMap[val as ParticleKindNumber];
    }
    throw new Error(`Invalid ParticleKind value: ${val}`);
  })
]).refine(val => Object.values(ParticleKindMap).includes(val as any), {
  message: "Invalid particle kind"
});

export type ParticleKind = z.infer<typeof ParticleKindSchema>;
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
  Count: z.number(),
  NumericalConcentration: z.number().optional(),
  GlobalSize: z.number().optional(),
  MinSize: z.number(),
  MaxSize: z.number(),
  Theta: z.number(),
  K: z.number(),
  Excess: z.number(),
  Epsilon: z.number().optional()
});

// Схема для MassGenerateNanoSystemOptions (без валидации)
export const MassGenerateNanoSystemOptionsSchema = z.object({
  Options: z.array(CommonParticleGenerationParametersSchema),
  NanoSystemsKind: ParticleKindSchema
});
export type CommonParticleGenerationParameters = z.infer<typeof CommonParticleGenerationParametersSchema>;
export type MassGenerateNanoSystemOptions = z.infer<typeof MassGenerateNanoSystemOptionsSchema>;