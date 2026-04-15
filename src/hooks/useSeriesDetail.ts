import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  type ApiResponseListNanosystemDto,
  type NanosystemSeriesDto,
  type RadialAnalysisDto,
} from '../features/nanosystems/api/nanosystemTypes';
import { fetchNanosystemList, fetchSeriesNanosystems, fetchRadialAnalysisList } from '../features/nanosystems/api/nanosystemApi';
import { fetchCalculationsByNanosystem } from '../features/calculation/api/calculationApi';
import type { CalculationDto } from '../features/calculation/api/calculationTypes';

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

  for (const item of all) {
    const start = new Date(item.generationStart);
    const end = new Date(item.generationEnd);

    if (!Number.isNaN(start.getTime()) && (minStart === null || start < minStart)) {
      minStart = start;
    }

    if (!Number.isNaN(end.getTime()) && (maxEnd === null || end > maxEnd)) {
      maxEnd = end;
    }
  }

  return {
    firstGenerationStart: minStart?.toISOString() ?? null,
    lastGenerationEnd: maxEnd?.toISOString() ?? null,
    nanosystemCount: all.length,
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