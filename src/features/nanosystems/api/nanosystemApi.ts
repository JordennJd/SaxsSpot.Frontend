// src/features/nanosystems/api/nanosystemApi.ts
import {
  type ApiResponseMassGenerateNanoSystemOptions,
  ApiResponseMassGenerateNanoSystemOptionsSchema,
  type GetNanosystemGenerationOptionsQuery,
  type MassGenerateNanoSystemOptions,
  type NanosystemSeriesListApiResponse,
  NanosystemSeriesListApiResponseSchema, ApiResponseListNanosystemDtoSchema, type ApiResponseListNanosystemDto,
  type RadialAnalysisApiResponse,
  RadialAnalysisApiResponseSchema,
} from './nanosystemTypes';

import { nanosystemApiClient } from '../../../lib/axios';
import type { PaginatedResponse } from './common/commonTypes';
import { handleError } from '../../../lib/errorHandler';

export type { PaginatedResponse };

export const fetchSeriesNanosystems = async (
  gridifyQuery?: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<NanosystemSeriesListApiResponse> => {
  try {
    const response = await nanosystemApiClient.get<NanosystemSeriesListApiResponse>(
      '/nanosystem/get-nanosystem-series-list',
      {
        params: { 
          filter: gridifyQuery,
          page,
          pageSize,
        },    
        paramsSerializer: (params) => {
          return new URLSearchParams(params).toString();
        },
      },
    );
    
    // Validate response data with Zod
    const validatedData = NanosystemSeriesListApiResponseSchema.parse(response.data);
    
    return validatedData;
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export const fetchNanosystemMassGenerationParameters = async (
  query: GetNanosystemGenerationOptionsQuery,
): Promise<ApiResponseMassGenerateNanoSystemOptions> => {
  try {
    const response = await nanosystemApiClient.get<ApiResponseMassGenerateNanoSystemOptions>(
      '/nanosystem/get-nanosystem-mass-generation-parameters',
      {
        params: { ...query },    
        paramsSerializer: (params) => {
          return new URLSearchParams(params).toString();
        },
      },
    );
    
    // Validate response data with Zod
    const validatedOptions = ApiResponseMassGenerateNanoSystemOptionsSchema.parse(response.data);
    
    return {
      isSuccess: validatedOptions.isSuccess,
      result: {
        options: validatedOptions.result.options,
        nanoSystemsKind: response.data.result.nanoSystemsKind,
      },
      errors: validatedOptions.errors,
    };
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export const fetchNanosystemList = async (
  gridifyQuery?: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<ApiResponseListNanosystemDto> => {
  try {
    const response = await nanosystemApiClient.get<ApiResponseListNanosystemDto>(
      '/nanosystem/get-nanosystem-list',
      {
        params: { 
          filter: gridifyQuery,
          page,
          pageSize,
        },    
        paramsSerializer: (params) => {
          return new URLSearchParams(params).toString();
        },
      },
    );
    
    const validatedData = ApiResponseListNanosystemDtoSchema.parse(response.data);
    
    return validatedData;
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export const runMassGeneration = async (
  options: MassGenerateNanoSystemOptions,
): Promise<string> => {
  try {
    const response = await nanosystemApiClient.post<string>(
      '/nanosystem/run-mass-generation', 
      options,
    );

    return response.data;
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export interface RunRadialAnalysisRequest {
  nanosystemId: string;
  pointCount: number;
  layerCount: number;
}

export const runRadialAnalysis = async (
  request: RunRadialAnalysisRequest,
): Promise<string> => {
  try {
    const response = await nanosystemApiClient.post<string>(
      '/radial-analysis/run-radial-analysis',
      request,
    );

    return response.data;
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export const fetchRadialAnalysisList = async (
  nanosystemId: string,
  page: number = 1,
  pageSize: number = 10,
  filter?: string,
  sortBy?: string,
): Promise<RadialAnalysisApiResponse> => {
  try {
    const params: Record<string, string | number> = {
      page,
      pageSize,
    };
    
    // Формируем filter: если передан filter, используем его, иначе добавляем nanosystemId
    if (filter) {
      params.filter = filter;
    } else {
      // Если filter не передан, добавляем nanosystemId в filter
      params.filter = `nanosystemId=${nanosystemId}`;
    }
    
    if (sortBy) {
      params.sortBy = sortBy;
    }

    const response = await nanosystemApiClient.get<RadialAnalysisApiResponse>(
      '/radial-analysis/get-radial-analysis-list',
      {
        params,
        paramsSerializer: (params) => {
          return new URLSearchParams(params as Record<string, string>).toString();
        },
      },
    );

    // Validate response data with Zod
    const validatedData = RadialAnalysisApiResponseSchema.parse(response.data);

    return validatedData;
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export const downloadRadialAnalysis = async (id: string): Promise<void> => {
  try {
    const response = await nanosystemApiClient.get('/radial-analysis/download-radial-analysis', {
      responseType: 'blob',
      params: { id },
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `radial-analysis-${id}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export interface CancelOperationRequest {
  operationId: string;
  operationType?: string;
}

export const cancelOperation = async (
  request: CancelOperationRequest,
): Promise<void> => {
  try {
    await nanosystemApiClient.post('/nanosystem/cancel-operation', request);
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};