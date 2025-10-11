// src/features/nanosystems/api/nanosystemApi.ts
import {
  type ApiResponseMassGenerateNanoSystemOptions,
  ApiResponseMassGenerateNanoSystemOptionsSchema,
  type GetNanosystemGenerationOptionsQuery,
  type MassGenerateNanoSystemOptions,
  type NanosystemSeriesListApiResponse,
  NanosystemSeriesListApiResponseSchema, ApiResponseListNanosystemDtoSchema, type ApiResponseListNanosystemDto,
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