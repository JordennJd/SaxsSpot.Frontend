import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  type ApiResponseListNanosystemDto,
  type NanosystemSeriesDto,
  type RadialAnalysisDto,
} from '../features/nanosystems/api/nanosystemTypes';
import { fetchNanosystemList, fetchSeriesNanosystems, fetchRadialAnalysisList, fetchScatteringCalculationList } from '../features/nanosystems/api/nanosystemApi';
import { ApiError } from '../lib/axios';
import { fetchCalculationsByNanosystem } from '../features/calculation/api/calculationApi';
import type { CalculationDto } from '../features/calculation/api/calculationTypes';
import type { ScatteringCalculationDto } from '../features/nanosystems/api/nanosystemTypes';

// API Functions
const fetchSeries = async (seriesId: string): Promise<NanosystemSeriesDto> => {
  const response = await fetchSeriesNanosystems('id=' + seriesId, 1, 1);
  if (response.result.data.length === 0) {
    throw new Error('Series not found');
  }
  return response.result.data[0];
};

const fetchNanosystems = async (
  gridifyQuery?: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<ApiResponseListNanosystemDto> => {
  return fetchNanosystemList(gridifyQuery, page, pageSize);
};

// Custom Hooks
export const useSeriesData = (seriesId: string) => {
  return useQuery({
    queryKey: ['series', seriesId],
    queryFn: () => fetchSeries(seriesId),
  });
};

export const useNanosystemsData = (
  seriesId: string,
  page: number,
  pageSize: number,
  extraGridifyFilter?: string,
) => {
  const filter =
    extraGridifyFilter && extraGridifyFilter.length > 0
      ? `seriesId=${seriesId},${extraGridifyFilter}`
      : `seriesId=${seriesId}`;

  return useQuery<ApiResponseListNanosystemDto>({
    queryKey: ['nanosystems', seriesId, page, pageSize, extraGridifyFilter ?? ''],
    queryFn: () => fetchNanosystems(filter, page, pageSize),
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
};

interface SeriesGenerationWindow {
  firstGenerationStart: string | null;
  lastGenerationEnd: string | null;
  nanosystemCount: number;
  /** Sum of (generationEnd - generationStart) for each nanosystem in the series. */
  totalGenerationDurationMs: number | null;
}

const fetchSeriesGenerationWindow = async (seriesId: string): Promise<SeriesGenerationWindow> => {
  const filter = `seriesId=${seriesId}`;
  const fetchPageSize = 200;
  const firstPage = await fetchNanosystems(filter, 1, fetchPageSize);
  const all = [...firstPage.result.data];
  const totalCount = firstPage.result.count ?? all.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / fetchPageSize));

  for (let page = 2; page <= totalPages; page += 1) {
    const pageResponse = await fetchNanosystems(filter, page, fetchPageSize);
    all.push(...pageResponse.result.data);
  }

  let minStart: Date | null = null;
  let maxEnd: Date | null = null;
  let totalGenerationDurationMs = 0;

  for (const item of all) {
    const start = new Date(item.generationStart);
    const end = new Date(item.generationEnd);

    if (!Number.isNaN(start.getTime()) && (minStart === null || start < minStart)) {
      minStart = start;
    }

    if (!Number.isNaN(end.getTime()) && (maxEnd === null || end > maxEnd)) {
      maxEnd = end;
    }

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start) {
      totalGenerationDurationMs += end.getTime() - start.getTime();
    }
  }

  return {
    firstGenerationStart: minStart?.toISOString() ?? null,
    lastGenerationEnd: maxEnd?.toISOString() ?? null,
    nanosystemCount: all.length,
    totalGenerationDurationMs: all.length === 0 ? null : totalGenerationDurationMs,
  };
};

export const useSeriesGenerationWindow = (seriesId: string) => {
  return useQuery<SeriesGenerationWindow>({
    queryKey: ['series-generation-window', seriesId],
    queryFn: () => fetchSeriesGenerationWindow(seriesId),
    enabled: !!seriesId,
    retry: 1,
  });
};

export const useCalculationsData = (nanosystemId: string | undefined, calculationPage: number, pageSize: number) => {
  const [hasError, setHasError] = React.useState(false);

  const fetchCalculations = async (nanosystemId: string): Promise<CalculationDto[]> => {
    try {
      setHasError(false);
      const response = await fetchCalculationsByNanosystem(nanosystemId, calculationPage, pageSize);
      return response.result.data;
    } catch (error) {
      console.error('Error fetching calculations:', error);
      setHasError(true);
      // Возвращаем пустой массив вместо выброса ошибки
      return [];
    }
  };

  const query = useQuery<CalculationDto[]>({
    queryKey: ['calculations', nanosystemId],
    queryFn: () => nanosystemId ? fetchCalculations(nanosystemId) : [],
    enabled: !!nanosystemId,
    retry: false,
  });

  return {
    ...query,
    isError: hasError,
  };
};

export const useRadialAnalysisData = (
  nanosystemId: string | undefined,
  page: number,
  pageSize: number,
  filter?: string,
  sortBy?: string,
) => {
  const [hasError, setHasError] = React.useState(false);

  const fetchRadialAnalyses = async (nanosystemId: string): Promise<RadialAnalysisDto[]> => {
    try {
      setHasError(false);
      const response = await fetchRadialAnalysisList(nanosystemId, page, pageSize, filter, sortBy);
      return response.result.data;
    } catch (error) {
      console.error('Error fetching radial analyses:', error);
      setHasError(true);
      // Возвращаем пустой массив вместо выброса ошибки
      return [];
    }
  };

  const query = useQuery<RadialAnalysisDto[]>({
    queryKey: ['radialAnalyses', nanosystemId, page, pageSize, filter, sortBy],
    queryFn: () => nanosystemId ? fetchRadialAnalyses(nanosystemId) : [],
    enabled: !!nanosystemId,
    retry: false,
  });

  return {
    ...query,
    isError: hasError,
  };
};

export const useNanosystemData = (nanosystemId: string | undefined) => {
  return useQuery({
    queryKey: ['nanosystem', nanosystemId],
    queryFn: async () => {
      const res = await fetchNanosystemList(`id=${nanosystemId}`, 1, 1);
      if (res.result.data.length === 0) {
        throw new Error('Nanosystem not found');
      }
      return res.result.data[0];
    },
    enabled: !!nanosystemId,
    retry: 1,
  });
};

export const useScatteringCalculationData = (
  nanosystemId: string | undefined,
  page: number,
  pageSize: number,
  filter?: string,
  sortBy?: string,
) => {
  const [hasError, setHasError] = React.useState(false);

  const fetchScatteringCalculations = async (id: string): Promise<ScatteringCalculationDto[]> => {
    try {
      setHasError(false);
      const response = await fetchScatteringCalculationList(id, page, pageSize, filter, sortBy);
      return response.result?.data ?? [];
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        return [];
      }
      console.error('Error fetching scattering calculations:', error);
      setHasError(true);
      return [];
    }
  };

  const query = useQuery<ScatteringCalculationDto[]>({
    queryKey: ['scatteringCalculations', nanosystemId, page, pageSize, filter, sortBy],
    queryFn: () => nanosystemId ? fetchScatteringCalculations(nanosystemId) : [],
    enabled: !!nanosystemId,
    retry: false,
  });

  return {
    ...query,
    isError: hasError,
  };
}; 