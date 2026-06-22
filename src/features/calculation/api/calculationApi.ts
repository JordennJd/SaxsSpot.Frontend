import {calculationApiClient} from '../../../lib/axios.ts';
import {
    type CalculationApiResponse,
    CalculationApiResponseSchema, type PlotChartRequest, type RunCalculationRequest, type PlotAnalyseRequest,
    type SeriesCalculationGroupsApiResponse,
    SeriesCalculationGroupsApiResponseSchema,
} from './calculationTypes.ts';
import type {ApiResponse} from '../../common/commonTypes.ts';
import { handleError } from '../../../lib/errorHandler';

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

export const fetchSeriesCalculationGroups = async (
    seriesId: string,
): Promise<SeriesCalculationGroupsApiResponse> => {
    const response = await calculationApiClient
        .get<unknown>(
            '/calculation/series-groups',
            {
                params: { seriesId },
                paramsSerializer: (params) => new URLSearchParams(params as Record<string, string>).toString(),
            },
        );

    return SeriesCalculationGroupsApiResponseSchema.parse(response.data);
};

export const PlotChart = async (request: PlotChartRequest): Promise<string> => {
    const params = new URLSearchParams();
    request.CalculatesId.forEach((calculationId) => params.append('CalculatesId', calculationId));
    params.set('ChartTitle', request.ChartTitle);
    params.set('XAxis', request.XAxis);
    params.set('YAxis', request.YAxis);
    params.set('ScaleMethodsX', String(request.ScaleMethodsX));
    params.set('ScaleMethodsY', String(request.ScaleMethodsY));

    const response = await calculationApiClient
        .get<ApiResponse<string>>(
            '/calculation/plot',
            {
                params,
                paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
            },
        );

    return response.data.result;
};

export const PlotChartAverage = async (request: PlotChartRequest): Promise<string> => {
    const params = new URLSearchParams();
    request.CalculatesId.forEach((calculationId) => params.append('CalculatesId', calculationId));
    params.set('ChartTitle', request.ChartTitle);
    params.set('XAxis', request.XAxis);
    params.set('YAxis', request.YAxis);
    params.set('ScaleMethodsX', String(request.ScaleMethodsX));
    params.set('ScaleMethodsY', String(request.ScaleMethodsY));

    const response = await calculationApiClient
        .get<ApiResponse<string>>(
            '/calculation/plot-chart-average',
            {
                params,
                paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
            },
        );

    return response.data.result;
};

export const PlotChartPng = async (request: PlotChartRequest): Promise<string> => {
    const params = new URLSearchParams();
    request.CalculatesId.forEach((calculationId) => params.append('CalculatesId', calculationId));
    params.set('ChartTitle', request.ChartTitle);
    params.set('XAxis', request.XAxis);
    params.set('YAxis', request.YAxis);
    params.set('ScaleMethodsX', String(request.ScaleMethodsX));
    params.set('ScaleMethodsY', String(request.ScaleMethodsY));

    const response = await calculationApiClient.get<{ result: string }>('/calculation/plot-png', {
        params,
        paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
    });

    return response.data.result;
};

export const PlotChartAveragePng = async (request: PlotChartRequest): Promise<string> => {
    const params = new URLSearchParams();
    request.CalculatesId.forEach((calculationId) => params.append('CalculatesId', calculationId));
    params.set('ChartTitle', request.ChartTitle);
    params.set('XAxis', request.XAxis);
    params.set('YAxis', request.YAxis);
    params.set('ScaleMethodsX', String(request.ScaleMethodsX));
    params.set('ScaleMethodsY', String(request.ScaleMethodsY));

    const response = await calculationApiClient.get<{ result: string }>('/calculation/plot-chart-average-png', {
        params,
        paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
    });

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
            { params, paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : '') },
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
            { params, paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : '') },
        );

    return response.data.result;
};

export const PlotAnalysePng = async (request: PlotAnalyseRequest): Promise<string> => {
    const params = new URLSearchParams();
    request.RadialAnalysisIds.forEach((id) => params.append('RadialAnalysisIds', id));
    params.set('ChartTitle', request.ChartTitle);
    params.set('XAxis', request.XAxis);
    params.set('YAxis', request.YAxis);
    params.set('ScaleMethodsX', String(request.ScaleMethodsX));
    params.set('ScaleMethodsY', String(request.ScaleMethodsY));

    const response = await calculationApiClient.get<{ result: string }>('/calculation/plot-analyse-png', {
        params,
        paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
    });

    return response.data.result;
};

export const PlotAnalyseAveragePng = async (request: PlotAnalyseRequest): Promise<string> => {
    const params = new URLSearchParams();
    request.RadialAnalysisIds.forEach((id) => params.append('RadialAnalysisIds', id));
    params.set('ChartTitle', request.ChartTitle);
    params.set('XAxis', request.XAxis);
    params.set('YAxis', request.YAxis);
    params.set('ScaleMethodsX', String(request.ScaleMethodsX));
    params.set('ScaleMethodsY', String(request.ScaleMethodsY));

    const response = await calculationApiClient.get<{ result: string }>('/calculation/plot-analyse-average-png', {
        params,
        paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
    });

    return response.data.result;
};

export interface PlotScatteringCompareRequest {
    ChartTitle: string;
    XAxis: string;
    YAxis: string;
    LegacyCalculationIds: string[];
    NanoScatteringIds: string[];
    AverageLegacy: boolean;
    AverageNano: boolean;
    ScaleMethodsX: string | number;
    ScaleMethodsY: string | number;
}

const appendPlotScatteringCompareParams = (params: URLSearchParams, request: PlotScatteringCompareRequest) => {
    request.LegacyCalculationIds.forEach((id) => params.append('LegacyCalculationIds', id));
    request.NanoScatteringIds.forEach((id) => params.append('NanoScatteringIds', id));
    params.set('ChartTitle', request.ChartTitle);
    params.set('XAxis', request.XAxis);
    params.set('YAxis', request.YAxis);
    params.set('AverageLegacy', String(request.AverageLegacy));
    params.set('AverageNano', String(request.AverageNano));
    params.set('ScaleMethodsX', String(request.ScaleMethodsX));
    params.set('ScaleMethodsY', String(request.ScaleMethodsY));
};

export const plotScatteringCompare = async (request: PlotScatteringCompareRequest): Promise<string> => {
    const params = new URLSearchParams();
    appendPlotScatteringCompareParams(params, request);

    const response = await calculationApiClient.get<{ result: string }>('/calculation/plot-scattering-compare', {
        params,
        paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
    });

    return response.data.result;
};

export const plotScatteringComparePng = async (request: PlotScatteringCompareRequest): Promise<string> => {
    const params = new URLSearchParams();
    appendPlotScatteringCompareParams(params, request);

    const response = await calculationApiClient.get<{ result: string }>('/calculation/plot-scattering-compare-png', {
        params,
        paramsSerializer: (p) => (p instanceof URLSearchParams ? p.toString() : ''),
    });

    return response.data.result;
};

export const downloadCalculation = async (id: string): Promise<void> => {
    try {
        const response = await calculationApiClient.get('/calculation/download-calculation', {
            responseType: 'blob',
            params: { id },
            timeout: 0,
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `calculation-${id}.txt`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw handleError(error as Error);
    }
};