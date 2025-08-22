import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  VITE_NANOSYSTEM_API_URL: z.string().url().optional(),
  VITE_CALCULATION_API_URL: z.string().url().optional(),
  VITE_JOB_API_URL: z.string().url().optional(),
  VITE_JOB_AUTH_TOKEN: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
const env = envSchema.parse(import.meta.env);

// API configuration
const createApiConfig = (baseURL: string, timeout: number) => ({
  baseURL,
  timeout,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Environment configuration
export const config = {
  api: {
    nanosystem: createApiConfig(
      env.VITE_NANOSYSTEM_API_URL || 'http://localhost:5062/api',
      10000,
    ),
    calculation: createApiConfig(
      env.VITE_CALCULATION_API_URL || 'http://localhost:5067/api',
      10000,
    ),
    job: {
      ...createApiConfig(
        env.VITE_JOB_API_URL || 'http://localhost:8080',
        5000,
      ),
      authToken: env.VITE_JOB_AUTH_TOKEN,
    },
  },
  app: {
    version: '1.0.0',
    name: 'SaxsSpot',
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },
} as const;

export type Config = typeof config; 