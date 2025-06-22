// src/features/nanosystems/api/nanosystemApi.ts
import axios from "axios";
import type { NanosystemSeriesDto } from "./nanosystemTypes";
import { NanosystemSeriesDtoSchema } from "./nanosystemTypes";

import { z } from "zod";

export type PaginatedResponse<T> = {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
};

export const fetchNanosystemSeries = async (
  gridifyQuery?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<NanosystemSeriesDto>> => {
  const response = await axios.get<PaginatedResponse<NanosystemSeriesDto>>(
    "/nanosystem/get-nanosystem-series-list",
    {
      params: { 
        filter: gridifyQuery,
        page: page,
        pageSize: pageSize,
      },    
      paramsSerializer: (params) => {
        return new URLSearchParams(params).toString();
      }
    }
  );
  return {
    ...response.data,
    data: z.array(NanosystemSeriesDtoSchema).parse(response.data.data),
    pageSize: response.data.pageSize,
    page: response.data.page
  };
};
