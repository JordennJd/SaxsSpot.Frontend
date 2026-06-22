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
  type ScatteringCalculationApiResponse,
  ScatteringCalculationApiResponseSchema,
  type ApiResponseGenerationMetrics,
  ApiResponseGenerationMetricsSchema,
  type GenerationMetrics,
  type ParallelepipedParticle,
  type SphereParticle,
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

export interface SpaceParametersRequest {
  spaceMethod: number;
  scaleMethod: number;
  spaceParameter: number;
  start: number;
  end: number;
}

export interface RunScatteringCalculationRequest {
  nanosystemId: string;
  qSpaceParameters: SpaceParametersRequest;
  excess?: number;
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

export const runScatteringCalculation = async (
  request: RunScatteringCalculationRequest,
): Promise<string> => {
  try {
    const response = await nanosystemApiClient.post<{ result: string }>(
      '/scattering-calculation/run-scattering-calculation',
      request,
    );

    if (response.data && typeof response.data === 'object' && 'result' in response.data) {
      return String(response.data.result);
    }

    return String(response.data);
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export const fetchScatteringCalculationList = async (
  nanosystemId: string,
  page: number = 1,
  pageSize: number = 10,
  filter?: string,
  sortBy?: string,
): Promise<ScatteringCalculationApiResponse> => {
  try {
    const params: Record<string, string | number> = { page, pageSize };

    if (filter) {
      params.filter = filter;
    } else {
      params.filter = `nanosystemId=${nanosystemId}`;
    }

    if (sortBy) {
      params.sortBy = sortBy;
    }

    const response = await nanosystemApiClient.get<unknown>(
      '/scattering-calculation/get-scattering-calculation-list',
      {
        params,
        paramsSerializer: (p) => new URLSearchParams(p as Record<string, string>).toString(),
      },
    );

    return ScatteringCalculationApiResponseSchema.parse(response.data);
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export interface PlotScatteringChartRequest {
  ScatteringCalculationIds: string[];
  ChartTitle: string;
  XAxis: string;
  YAxis: string;
  ScaleMethodsX: string | number;
  ScaleMethodsY: string | number;
}

const appendPlotScatteringParams = (params: URLSearchParams, request: PlotScatteringChartRequest) => {
  request.ScatteringCalculationIds.forEach((id) => params.append('ScatteringCalculationIds', id));
  params.set('ChartTitle', request.ChartTitle);
  params.set('XAxis', request.XAxis);
  params.set('YAxis', request.YAxis);
  params.set('ScaleMethodsX', String(request.ScaleMethodsX));
  params.set('ScaleMethodsY', String(request.ScaleMethodsY));
};

export const plotScatteringChart = async (request: PlotScatteringChartRequest): Promise<string> => {
  const params = new URLSearchParams();
  appendPlotScatteringParams(params, request);

  const response = await nanosystemApiClient.get<{ result: string }>('/scattering-calculation/plot', {
    params,
    paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
  });

  return response.data.result;
};

export const plotScatteringChartAverage = async (request: PlotScatteringChartRequest): Promise<string> => {
  const params = new URLSearchParams();
  appendPlotScatteringParams(params, request);

  const response = await nanosystemApiClient.get<{ result: string }>('/scattering-calculation/plot-average', {
    params,
    paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
  });

  return response.data.result;
};

export const plotScatteringChartPng = async (request: PlotScatteringChartRequest): Promise<string> => {
  const params = new URLSearchParams();
  appendPlotScatteringParams(params, request);

  const response = await nanosystemApiClient.get<{ result: string }>('/scattering-calculation/plot-png', {
    params,
    paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
  });

  return response.data.result;
};

export const plotScatteringChartAveragePng = async (request: PlotScatteringChartRequest): Promise<string> => {
  const params = new URLSearchParams();
  appendPlotScatteringParams(params, request);

  const response = await nanosystemApiClient.get<{ result: string }>('/scattering-calculation/plot-average-png', {
    params,
    paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
  });

  return response.data.result;
};

export const downloadScatteringCalculation = async (id: string): Promise<void> => {
  try {
    const response = await nanosystemApiClient.get('/scattering-calculation/download-scattering-calculation', {
      responseType: 'blob',
      params: { id },
      timeout: 0,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `scattering-calculation-${id}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
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
      // Disable timeout for large file downloads
      timeout: 0,
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

export interface IndexRange {
  fromIndex: number;
  toIndex: number;
}

export interface GetGenerationMetricsQuery {
  nanosystemId: string;
  particleIndexRanges?: IndexRange[];
}

export const fetchGenerationMetrics = async (
  query: GetGenerationMetricsQuery,
): Promise<GenerationMetrics[]> => {
  try {
    const response = await nanosystemApiClient.post<ApiResponseGenerationMetrics>(
      '/nanosystem/get-generation-metrics',
      {
        nanosystemId: query.nanosystemId,
        particleIndexRanges: query.particleIndexRanges,
      },
    );

    // Validate response data with Zod
    const validatedData = ApiResponseGenerationMetricsSchema.parse(response.data);

    if (!validatedData.isSuccess || !validatedData.result) {
      return [];
    }

    return validatedData.result;
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export interface DeleteNanosystemRequest {
  nanosystemId: string;
  password: string;
}

export const deleteNanosystem = async (
  request: DeleteNanosystemRequest,
): Promise<void> => {
  try {
    await nanosystemApiClient.delete('/nanosystem/delete-nanosystem', {
      data: {
        nanosystemId: request.nanosystemId,
        password: request.password,
      },
    });
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export interface DeleteSeriesRequest {
  seriesId: string;
}

export const deleteSeries = async (
  request: DeleteSeriesRequest,
): Promise<void> => {
  try {
    await nanosystemApiClient.delete('/nanosystem/delete-series', {
      data: {
        seriesId: request.seriesId,
      },
    });
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

export interface UpdateSeriesCommentRequest {
  seriesId: string;
  comment: string | null;
}

export const updateSeriesComment = async (request: UpdateSeriesCommentRequest): Promise<void> => {
  try {
    await nanosystemApiClient.patch('/nanosystem/update-series-comment', {
      seriesId: request.seriesId,
      comment: request.comment,
    });
  } catch (error) {
    const appError = handleError(error as Error);
    throw appError;
  }
};

/**
 * Fetch particle coordinates for 3D visualization.
 * Backend endpoint: GET /api/nanosystem/get-particles?nanosystemId=...&skip=0&take=10000&particleKind=0
 * - particleKind: 0 = Sphere, 1 = Parallelepiped
 * - skip: number of particles to skip (pagination)
 * - take: max number of particles to return
 * Returns array of ParallelepipedParticle[] or SphereParticle[] depending on particleKind.
 */
export const getNanosystemParticles = async (
  nanosystemId: string,
  skip: number = 0,
  take: number = 10000,
  particleKind: 0 | 1 = 0,
): Promise<ParallelepipedParticle[] | SphereParticle[]> => {
  const response = await nanosystemApiClient.get<ParallelepipedParticle[] | SphereParticle[]>(
    '/nanosystem/get-particles',
    {
      params: { nanosystemId, skip, take, particleKind },
      paramsSerializer: (params: Record<string, unknown>) =>
        new URLSearchParams(params as Record<string, string>).toString(),
      timeout: 0,
    },
  );
  return response.data;
};