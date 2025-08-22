import { useQuery } from '@tanstack/react-query';
import { type NanosystemDto, type NanosystemSeriesDto } from '../features/nanosystems/api/nanosystemTypes';
import { fetchNanosystemList, fetchSeriesNanosystems } from '../features/nanosystems/api/nanosystemApi';
import { fetchCalculationsByNanosystem } from '../features/calculation/api/calculationApi';
import type { CalculationDto } from '../features/calculation/api/calculationTypes';
import type { PaginatedResponse } from '../features/nanosystems/api/common/commonTypes';

// API Functions
const fetchSeries = async (seriesId: string): Promise<NanosystemSeriesDto> => {
  const response = await fetchSeriesNanosystems("id=" + seriesId, 1, 1);
  if (response.data.length === 0) {
    throw new Error("Series not found");
  }
  return response.data[0];
};

const fetchNanosystems = async (
  gridifyQuery?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<NanosystemDto>> => {
  try {
    const response = await fetchNanosystemList(gridifyQuery, page, pageSize);
    if (response.data.length === 0) {
      throw new Error("Nanosystem List query error");
    }
    return response;
  } catch (e) {
    console.log(e);
    throw new Error("Nanosystem List query error");
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
  return useQuery<PaginatedResponse<NanosystemDto>>({
    queryKey: ['nanosystems', seriesId, page, pageSize],
    queryFn: () => fetchNanosystems(`seriesId=${seriesId}`, page, pageSize),
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
};

export const useCalculationsData = (nanosystemId: string | undefined, calculationPage: number, pageSize: number) => {
  const fetchCalculations = async (nanosystemId: string): Promise<CalculationDto[]> => {
    try {
      const response = await fetchCalculationsByNanosystem(nanosystemId, calculationPage, pageSize);
      return response.result.data;
    } catch (error) {
      console.error('Error fetching calculations:', error);
      throw new Error('Failed to fetch calculations');
    }
  };

  return useQuery<CalculationDto[]>({
    queryKey: ['calculations', nanosystemId],
    queryFn: () => nanosystemId ? fetchCalculations(nanosystemId) : [],
    enabled: !!nanosystemId,
  });
}; 