// src/features/nanosystems/api/nanosystemApi.ts
import type { GetNanosystemGenerationOptionsQuery, MassGenerateNanoSystemOptions, NanosystemDto, NanosystemSeriesDto } from './nanosystemTypes';
import { CommonParticleGenerationParametersSchema, NanosystemDtoSchema, NanosystemSeriesDtoSchema } from './nanosystemTypes';

import { z } from 'zod';
import { nanosystemApiClient } from '../../../lib/axios';
import type { PaginatedResponse } from './common/commonTypes';
import { handleError } from '../../../lib/errorHandler';

export type { PaginatedResponse };

export const fetchSeriesNanosystems = async (
  gridifyQuery?: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedResponse<NanosystemSeriesDto>> => {
  try {
    const response = await nanosystemApiClient.get<PaginatedResponse<NanosystemSeriesDto>>(
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
    const validatedData = z.array(NanosystemSeriesDtoSchema).parse(response.data.data);
    
    return {
      ...response.data,
      data: validatedData,
      pageSize: response.data.pageSize,
      page: response.data.page,
    };
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export const fetchNanosystemMassGenerationParameters = async (
  query: GetNanosystemGenerationOptionsQuery,
): Promise<MassGenerateNanoSystemOptions> => {
  try {
    const response = await nanosystemApiClient.get<MassGenerateNanoSystemOptions>(
      '/nanosystem/get-nanosystem-mass-generation-parameters',
      {
        params: { ...query },    
        paramsSerializer: (params) => {
          return new URLSearchParams(params).toString();
        },
      },
    );
    
    // Validate response data with Zod
    const validatedOptions = z.array(CommonParticleGenerationParametersSchema).parse(response.data.options);
    
    return {
      nanoSystemsKind: response.data.nanoSystemsKind,
      options: validatedOptions,
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
): Promise<PaginatedResponse<NanosystemDto>> => {
  try {
    const response = await nanosystemApiClient.get<PaginatedResponse<NanosystemDto>>(
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
    
    // Validate response data with Zod
    const validatedData = z.array(NanosystemDtoSchema).parse(response.data.data);
    
    return {
      ...response.data,
      data: validatedData,
      pageSize: response.data.pageSize,
      page: response.data.page,
    };
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