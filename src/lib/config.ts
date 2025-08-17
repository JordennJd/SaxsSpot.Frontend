// Environment configuration
export const config = {
  api: {
    nanosystem: {
      baseURL: import.meta.env.VITE_NANOSYSTEM_API_URL || 'http://localhost:5062/api',
      timeout: 10000,
    },
    calculation: {
      baseURL: import.meta.env.VITE_CALCULATION_API_URL || 'http://localhost:5067/api', 
      timeout: 10000,
    },
    job: {
      baseURL: import.meta.env.VITE_JOB_API_URL || 'http://localhost:8080',
      timeout: 5000,
      // NOTE: Replace this token with proper authentication
      authToken: import.meta.env.VITE_JOB_AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
    },
  },
  app: {
    version: '1.0.0',
    name: 'SaxsSpot',
  },
} as const; 