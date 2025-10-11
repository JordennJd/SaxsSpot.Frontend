import { useQuery } from '@tanstack/react-query';
import { fetchSeriesNanosystems } from '../api/nanosystemApi';
import {type NanosystemSeriesListApiResponse} from '../api/nanosystemTypes';

export const useNanosystemSeries = (
  gridifyQuery?: string,
  page: number = 1,
  pageSize: number = 10,
) => {
  return useQuery<NanosystemSeriesListApiResponse>({
    queryKey: ['nanosystem-series-list', gridifyQuery, page, pageSize],
    queryFn: () => fetchSeriesNanosystems(gridifyQuery, page, pageSize),
    placeholderData: (previousData: NanosystemSeriesListApiResponse | undefined) => previousData,
  });
};