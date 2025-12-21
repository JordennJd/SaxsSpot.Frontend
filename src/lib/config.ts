import { z } from 'zod';

// Helper function to get environment variable with priority
// Always prioritizes environment variables from docker-compose over defaults
// Direct access to import.meta.env ensures environment variables have the highest priority
const getEnvVar = (key: string, defaultValue: string): string => {
  // Access import.meta.env with type assertion to handle dynamic keys
  const env = import.meta.env as Record<string, string | undefined>;
  const value = env[key];
  // Explicitly check for undefined/null to ensure env vars take priority
  // If value is set (even if empty string), it means it was explicitly provided
  // Only use default if value is truly undefined
  if (value !== undefined && value !== null) {
    return String(value);
  }
  return defaultValue;
};

// Environment variables schema for validation
const envSchema = z.object({
  VITE_NANOSYSTEM_API_URL: z.string().url().optional(),
  VITE_CALCULATION_API_URL: z.string().url().optional(),
  VITE_JOB_API_URL: z.string().url().optional(),
  VITE_JOB_AUTH_TOKEN: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables (for type safety)
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
// Using getEnvVar ensures environment variables from docker-compose always have priority
export const config = {
  api: {
    nanosystem: createApiConfig(
      getEnvVar('VITE_NANOSYSTEM_API_URL', 'http://localhost:5062/api'),
      10000,
    ),
    calculation: createApiConfig(
      getEnvVar('VITE_CALCULATION_API_URL', 'http://localhost:5067/api'),
      10000,
    ),
    job: {
      ...createApiConfig(
        getEnvVar('VITE_JOB_API_URL', 'http://localhost:8080'),
        5000,
      ),
      authToken: (() => {
        const token = getEnvVar('VITE_JOB_AUTH_TOKEN', '');
        return token || undefined;
      })(),
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