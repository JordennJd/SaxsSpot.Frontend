import { z } from 'zod';

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const positiveNumberSchema = z.number().positive('Must be a positive number');

export const nonEmptyStringSchema = z.string().min(1, 'This field is required');

export const emailSchema = z.string().email('Invalid email format');

export const dateSchema = z.string().refine(val => {
  return !isNaN(Date.parse(val));
}, {
  message: "Invalid date format"
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1'),
  pageSize: z.number().int().min(1).max(100, 'Page size must be between 1 and 100'),
});

// Nanosystem validation schemas
export const nanosystemFiltersSchema = z.object({
  particleKind: z.number().optional(),
  minParticleCount: z.number().min(0).optional(),
  maxParticleCount: z.number().min(0).optional(),
  minGlobalSize: z.number().min(0).optional(),
  maxGlobalSize: z.number().min(0).optional(),
}).refine(data => {
  if (data.minParticleCount && data.maxParticleCount) {
    return data.minParticleCount <= data.maxParticleCount;
  }
  return true;
}, {
  message: "Min particle count must be less than or equal to max particle count",
  path: ["minParticleCount"]
}).refine(data => {
  if (data.minGlobalSize && data.maxGlobalSize) {
    return data.minGlobalSize <= data.maxGlobalSize;
  }
  return true;
}, {
  message: "Min global size must be less than or equal to max global size",
  path: ["minGlobalSize"]
});

// Calculation validation schemas
export const vectorSpaceParametersSchema = z.object({
  spaceMethod: z.number().int().min(0),
  scaleMethod: z.number().int().min(0),
  spaceParameter: positiveNumberSchema,
  start: z.number(),
  end: z.number(),
}).refine(data => data.start < data.end, {
  message: "Start value must be less than end value",
  path: ["start"]
});

export const calculationRequestSchema = z.object({
  systemId: uuidSchema,
  requestId: z.string(),
  qVectorSpaceParameters: vectorSpaceParametersSchema,
  phiVectorSpaceParameters: vectorSpaceParametersSchema,
  thetaVectorSpaceParameters: vectorSpaceParametersSchema,
});

// Chart request validation
export const chartRequestSchema = z.object({
  CalculatesId: z.array(uuidSchema).min(1, 'At least one calculation ID is required'),
  ChartTitle: nonEmptyStringSchema,
  XAxis: nonEmptyStringSchema,
  YAxis: nonEmptyStringSchema,
  ScaleMethodsX: z.enum(['Linear', 'Log']),
  ScaleMethodsY: z.enum(['Linear', 'Log']),
});

// Form validation helpers
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
};

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      
      return { success: false, errors };
    }
    
    return { 
      success: false, 
      errors: { general: ['An unexpected validation error occurred'] } 
    };
  }
}

// Custom validation rules
export const customValidators = {
  isValidRange: (min: number, max: number) => min <= max,
  
  isValidDate: (dateString: string) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  },
  
  isValidUUID: (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  
  isPositiveNumber: (value: number) => value > 0,
  
  isNonEmptyString: (value: string) => value.trim().length > 0,
}; 