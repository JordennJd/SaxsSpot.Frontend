// src/features/nanosystems/api/nanosystemApi.ts
import type { GetNanosystemGenerationOptionsQuery, MassGenerateNanoSystemOptions, NanosystemDto, NanosystemSeriesDto } from "./nanosystemTypes";
import { CommonParticleGenerationParametersSchema, NanosystemDtoSchema, NanosystemSeriesDtoSchema } from "./nanosystemTypes";

import { z } from "zod";
import {nanosystemApiClient} from "../../../lib/axios.ts";
import type {PaginatedResponse} from "./common/commonTypes.ts";

export const fetchSeriesNanosystems = async (
  gridifyQuery?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<NanosystemSeriesDto>> => {
  const response = await nanosystemApiClient.get<PaginatedResponse<NanosystemSeriesDto>>(
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

export const fetchNanosystemMassGenerationParameters = async (query: GetNanosystemGenerationOptionsQuery): Promise<MassGenerateNanoSystemOptions> => {
  const response = await nanosystemApiClient.get<MassGenerateNanoSystemOptions>(
    "/nanosystem/get-nanosystem-mass-generation-parameters",
    {
      params: {...query},    
      paramsSerializer: (params) => {
        return new URLSearchParams(params).toString();
      }
    }
  );
  console.log(response.data.options);
  return {
    nanoSystemsKind: response.data.nanoSystemsKind,
    options: z.array(CommonParticleGenerationParametersSchema).parse(response.data.options)
  };
};

export const fetchNanosystemList = async (
  gridifyQuery?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<NanosystemDto>> => {
  const response = await nanosystemApiClient.get<PaginatedResponse<NanosystemDto>>(
    "/nanosystem/get-nanosystem-list",
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
    data: z.array(NanosystemDtoSchema).parse(response.data.data),
    pageSize: response.data.pageSize,
    page: response.data.page
  };
};

export const RunMassGeneration = async (
    options: MassGenerateNanoSystemOptions
): Promise<string> => {
    const response = await nanosystemApiClient.post<string>(
        "/nanosystem/run-mass-generation", options
    );

    return response.data;
};