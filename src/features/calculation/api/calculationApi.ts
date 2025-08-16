import {calculationApiClient} from "../../../lib/axios.ts";
import {
    type CalculationApiResponse,
    CalculationApiResponseSchema, type RunCalculationRequest,
} from "./calculationTypes.ts";

export const fetchCalculationsByNanosystem = async (
    nanosystemId: string,
    page: number = 1,
    pageSize: number = 10
): Promise<CalculationApiResponse> => {
    const response = await calculationApiClient
        .get<unknown>( // Используем unknown вместо ApiResponse<CalculationDto>
            "/calculation/list-by-nanosystem",
            {
                params: {
                    nanosystemId: nanosystemId,
                    page: page,
                    pageSize: pageSize,
                },
                paramsSerializer: (params) => {
                    return new URLSearchParams(params).toString();
                }
            }
        );

    // Валидируем ответ с помощью схемы
    const parsedResponse = CalculationApiResponseSchema.parse(response.data);
    console.log(parsedResponse)
    return parsedResponse;
};

export const RunCalculation = async (
    options: RunCalculationRequest
): Promise<string> => {
    const response = await calculationApiClient.post<string>(
        "/calculation/run-calculation", options
    );

    return response.data;
};