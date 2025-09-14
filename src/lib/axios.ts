import axios, { type AxiosInstance, type AxiosError, type AxiosResponse } from 'axios';
import { config } from './config';

// Custom error class for API errors
export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public response?: any;

  constructor(message: string, status?: number, code?: string, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.response = response;
  }
}

// Base request interceptor for logging
const addRequestInterceptor = (client: AxiosInstance, clientName: string) => {
  client.interceptors.request.use(
    (axiosConfig) => {
      if (axiosConfig.method?.toLowerCase() === 'get') {
        axiosConfig.params = {
          ...axiosConfig.params,
          dt: Date.now(),
        };
      }

      if (config.app.isDevelopment) {
        console.log(`[${clientName}] Request:`, {
          method: axiosConfig.method?.toUpperCase(),
          url: axiosConfig.url,
          baseURL: axiosConfig.baseURL,
        });
      }
      return axiosConfig;
    },
    (error: AxiosError) => {
      if (config.app.isDevelopment) {
        console.error(`[${clientName}] Request Error:`, error);
      }
      return Promise.reject(new ApiError('Request failed', undefined, error.code, error.response));
    },
  );
};

// Base response interceptor for error handling
const addResponseInterceptor = (client: AxiosInstance, clientName: string) => {
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (config.app.isDevelopment) {
        console.log(`[${clientName}] Response:`, {
          status: response.status,
          url: response.config.url,
        });
      }
      return response;
    },
    (error: AxiosError) => {
      const status = error.response?.status;
      const message = (error.response?.data as any)?.message || error.message || 'Unknown error';
      
      if (config.app.isDevelopment) {
        console.error(`[${clientName}] Response Error:`, {
          status,
          message,
          url: error.config?.url,
        });
      }

      // Handle specific error cases
      if (status === 401) {
        // Handle unauthorized - could trigger auth refresh or redirect
        return Promise.reject(new ApiError('Unauthorized', status, 'UNAUTHORIZED', error.response));
      }
      
      if (status === 403) {
        return Promise.reject(new ApiError('Forbidden', status, 'FORBIDDEN', error.response));
      }
      
      if (status === 404) {
        return Promise.reject(new ApiError('Not found', status, 'NOT_FOUND', error.response));
      }
      
      if (status && status >= 500) {
        return Promise.reject(new ApiError('Server error', status, 'SERVER_ERROR', error.response));
      }

      return Promise.reject(new ApiError(message, status, error.code, error.response));
    },
  );
};


// Nanosystem API Client
export const nanosystemApiClient = axios.create({
  baseURL: config.api.nanosystem.baseURL,
  timeout: config.api.nanosystem.timeout,
  headers: {
    ...config.api.nanosystem.headers,
    'Cache-Control': 'no-cache',
  },
});

addRequestInterceptor(nanosystemApiClient, 'Nanosystem API');
addResponseInterceptor(nanosystemApiClient, 'Nanosystem API');

// Calculation API Client
export const calculationApiClient = axios.create({
  baseURL: config.api.calculation.baseURL,
  timeout: config.api.calculation.timeout,
  headers: {
    ...config.api.calculation.headers,
    'Cache-Control': 'no-cache',
  },
});

addRequestInterceptor(calculationApiClient, 'Calculation API');
addResponseInterceptor(calculationApiClient, 'Calculation API');

// Job API Client
export const jobApiClient = axios.create({
  baseURL: config.api.job.baseURL,
  timeout: config.api.job.timeout,
  headers: {
    ...config.api.job.headers,
    ...(config.api.job.authToken && {
      'Authorization': `Bearer ${config.api.job.authToken}`,
      'Cache-Control': 'no-cache',
    }),
  },
});

addRequestInterceptor(jobApiClient, 'Job API');
addResponseInterceptor(jobApiClient, 'Job API'); 