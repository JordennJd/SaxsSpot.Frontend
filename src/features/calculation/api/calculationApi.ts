import {calculationApiClient} from '../../../lib/axios.ts';
import {
    type CalculationApiResponse,
    CalculationApiResponseSchema, type PlotChartRequest, type RunCalculationRequest, type PlotAnalyseRequest,
} from './calculationTypes.ts';
import type {ApiResponse} from '../../common/commonTypes.ts';

export const fetchCalculationsByNanosystem = async (
    nanosystemId: string,
    page: number = 1,
    pageSize: number = 10,
): Promise<CalculationApiResponse> => {
    const response = await calculationApiClient
        .get<unknown>( // Используем unknown вместо ApiResponse<CalculationDto>
            '/calculation/list-by-nanosystem',
            {
                params: {
                    nanosystemId: nanosystemId,
                    page: page,
                    pageSize: pageSize,
                },
                paramsSerializer: (params) => {
                    return new URLSearchParams(params).toString();
                },
            },
        );

    // Валидируем ответ с помощью схемы
    const parsedResponse = CalculationApiResponseSchema.parse(response.data);
    console.log(parsedResponse);
    return parsedResponse;
};

export const RunCalculation = async (
    options: RunCalculationRequest,
): Promise<string> => {
    const response = await calculationApiClient.post<string>(
        '/calculation/run-calculation', options,
    );

    return response.data;
};

export const RunSeriesCalculation = async (
    options: RunCalculationRequest,
): Promise<string> => {
    const response = await calculationApiClient.post<string>(
        '/calculation/run-series-calculation', options,
    );

    return response.data;
};

export const PlotChart = async (request: PlotChartRequest): Promise<string> => {
    const response = await calculationApiClient
        .get<ApiResponse<string>>(
            '/calculation/plot',
            {
                params: {...request},
                paramsSerializer: (params) => {
                    return new URLSearchParams(params).toString();
                },
            },
        );

    console.log(response);
    return response.data.result;
};

export const PlotAnalyse = async (request: PlotAnalyseRequest): Promise<string> => {
    const params = new URLSearchParams();
    request.RadialAnalysisIds.forEach((id) => params.append('RadialAnalysisIds', id));
    params.set('ChartTitle', request.ChartTitle);
    params.set('XAxis', request.XAxis);
    params.set('YAxis', request.YAxis);
    params.set('ScaleMethodsX', String(request.ScaleMethodsX));
    params.set('ScaleMethodsY', String(request.ScaleMethodsY));

    const response = await calculationApiClient
        .get<ApiResponse<string>>(
            '/calculation/plot-analyse',
            { params },
        );

    return response.data.result;
};

export const PlotAnalyseAverage = async (request: PlotAnalyseRequest): Promise<string> => {
    const params = new URLSearchParams();
    request.RadialAnalysisIds.forEach((id) => params.append('RadialAnalysisIds', id));
    params.set('ChartTitle', request.ChartTitle);
    params.set('XAxis', request.XAxis);
    params.set('YAxis', request.YAxis);
    params.set('ScaleMethodsX', String(request.ScaleMethodsX));
    params.set('ScaleMethodsY', String(request.ScaleMethodsY));

    const response = await calculationApiClient
        .get<ApiResponse<string>>(
            '/calculation/plot-analyse-average',
            { params },
        );

    return response.data.result;
};