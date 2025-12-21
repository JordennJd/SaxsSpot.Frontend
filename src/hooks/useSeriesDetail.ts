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
  try {
    const response = await fetchNanosystemList(gridifyQuery, page, pageSize);
    if (response.result.data.length === 0) {
      throw new Error('Nanosystem List query error');
    }
    return response;
  } catch (e) {
    console.log(e);
    throw new Error('Nanosystem List query error');
  }
};

// Custom Hooks
export const useSeriesData = (seriesId: string) => {
  return useQuery({
    queryKey: ['series', seriesId],
    queryFn: () => fetchSeries(seriesId),
  });
};

export const useNanosystemsData = (seriesId: string, page: number, pageSize: number) => {
  return useQuery<ApiResponseListNanosystemDto>({
    queryKey: ['nanosystems', seriesId, page, pageSize],
    queryFn: () => fetchNanosystems(`seriesId=${seriesId}`, page, pageSize),
    placeholderData: (previousData) => previousData,
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