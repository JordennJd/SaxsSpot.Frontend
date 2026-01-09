// src/features/nanosystems/api/nanosystemApi.ts
import {
  type ApiResponseMassGenerateNanoSystemOptions,
  ApiResponseMassGenerateNanoSystemOptionsSchema,
  type CommonParticleGenerationParameters,
  type GetNanosystemGenerationOptionsQuery,
  type MassGenerateNanoSystemOptions,
  type NanosystemSeriesListApiResponse,
  NanosystemSeriesListApiResponseSchema, ApiResponseListNanosystemDtoSchema, type ApiResponseListNanosystemDto,
  type RadialAnalysisApiResponse,
  RadialAnalysisApiResponseSchema,
} from './nanosystemTypes';

import { nanosystemApiClient, calculationApiClient } from '../../../lib/axios';
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
        paramsSerializer: (params: Record<string, unknown>) => {
          return new URLSearchParams(params as Record<string, string>).toString();
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
        paramsSerializer: (params: Record<string, unknown>) => {
          return new URLSearchParams(params as Record<string, string>).toString();
        },
      },
    );
    
    // Validate response data with Zod
    const validatedOptions = ApiResponseMassGenerateNanoSystemOptionsSchema.parse(response.data);
    
    // Add pointCount to each option from pointCounts array (if pointCounts is provided)
    const optionsWithPointCount = validatedOptions.result.options.map((option: CommonParticleGenerationParameters, index: number) => ({
      ...option,
      pointCount: response.data.result.pointCounts?.[index] ?? undefined,
    }));
    
    return {
      isSuccess: validatedOptions.isSuccess,
      result: {
        options: optionsWithPointCount,
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
        paramsSerializer: (params: Record<string, unknown>) => {
          return new URLSearchParams(params as Record<string, string>).toString();
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
    const response = await calculationApiClient.post<{ isSuccess: boolean; result: string; errors?: unknown[] }>(
      '/nanosystem/run-mass-generation', 
      options,
    );

    // Extract result from ResultDto structure
    if (response.data && typeof response.data === 'object' && 'result' in response.data) {
      return response.data.result;
    }
    
    // Fallback: if response is already a string (for backward compatibility)
    return typeof response.data === 'string' ? response.data : String(response.data);
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
        paramsSerializer: (params: Record<string, unknown>) => {
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
    // Throw an Error with the specific message so it can be caught and displayed
    throw new Error(appError.message);
  }
};