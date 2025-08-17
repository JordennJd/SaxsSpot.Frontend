import axios, { type AxiosInstance } from 'axios';
import { config } from './config';

// Base request interceptor for logging
const addRequestInterceptor = (client: AxiosInstance, clientName: string) => {
  client.interceptors.request.use(
    (config) => {
      console.log(`[${clientName}] Request:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
      });
      return config;
    },
    (error) => {
      console.error(`[${clientName}] Request Error:`, error);
      return Promise.reject(error);
    }
  );
};

// Base response interceptor for error handling
const addResponseInterceptor = (client: AxiosInstance, clientName: string) => {
  client.interceptors.response.use(
    (response) => {
      console.log(`[${clientName}] Response:`, {
        status: response.status,
        url: response.config.url,
      });
      return response;
    },
    (error) => {
      console.error(`[${clientName}] Response Error:`, {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
      });
      return Promise.reject(error);
    }
  );
};

// Nanosystem API Client
export const nanosystemApiClient = axios.create({
  baseURL: config.api.nanosystem.baseURL,
  timeout: config.api.nanosystem.timeout,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

addRequestInterceptor(nanosystemApiClient, 'Nanosystem API');
addResponseInterceptor(nanosystemApiClient, 'Nanosystem API');

// Calculation API Client
export const calculationApiClient = axios.create({
  baseURL: config.api.calculation.baseURL,
  timeout: config.api.calculation.timeout,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

addRequestInterceptor(calculationApiClient, 'Calculation API');
addResponseInterceptor(calculationApiClient, 'Calculation API');

// Job API Client
export const jobApiClient = axios.create({
  baseURL: config.api.job.baseURL,
  timeout: config.api.job.timeout,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.api.job.authToken}`,
  },
});

addRequestInterceptor(jobApiClient, 'Job API');
addResponseInterceptor(jobApiClient, 'Job API');