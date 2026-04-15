import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PlotChart, PlotChartAverage, PlotChartAveragePng, PlotChartPng } from '../features/calculation/api/calculationApi';
import type { PlotChartRequest } from '../features/calculation/api/calculationTypes';

export const CalculationChartPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const isMobileDevice =
        typeof navigator !== 'undefined' &&
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    const stateIsAverage = (location.state as { isAverage?: boolean } | null)?.isAverage ?? false;

    const calcIdsQueryRaw = searchParams.get('calcIds');
    const calcIdsQuery = calcIdsQueryRaw
        ? calcIdsQueryRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const hasCalcIdsQuery = calcIdsQueryRaw != null;
    const isAverageFromQueryRaw = searchParams.get('isAverage');
    const hasIsAverageQuery = isAverageFromQueryRaw != null;
    const isAverageFromQuery = isAverageFromQueryRaw === '1' || isAverageFromQueryRaw?.toLowerCase() === 'true';
    const isAverage = hasIsAverageQuery ? isAverageFromQuery : stateIsAverage;

    const downloadRequested = searchParams.get('download') === '1';
    const isDownloadMode = downloadRequested || isMobileDevice;

    const seriesId = searchParams.get('seriesId');
    const qFrom = searchParams.get('qFrom');
    const qTo = searchParams.get('qTo');

    const safePart = (v: string) => v.replace(/[^0-9a-zA-Z]+/g, '_');
    const filename = `scattering_${isAverage ? 'avg' : 'single'}${seriesId ? `_${safePart(seriesId)}` : ''}${
        qFrom && qTo ? `_q_${safePart(qFrom)}-${safePart(qTo)}` : ''
    }.png`;

    const request = useMemo<PlotChartRequest>(() => {
        if (hasCalcIdsQuery && calcIdsQuery.length > 0) {
            return {
                CalculatesId: calcIdsQuery,
                ChartTitle: isAverage ? 'Scattering (average)' : 'Scattering',
                XAxis: 'Q',
                YAxis: 'I',
                ScaleMethodsX: 'Log',
                ScaleMethodsY: 'Log',
            };
        }

        return (
            location.state?.request || {
                CalculatesId: id ? [id] : [],
                ChartTitle: 'Scattering',
                XAxis: 'Q',
                YAxis: 'I',
                ScaleMethodsX: 'Log',
                ScaleMethodsY: 'Log',
            }
        );
    }, [calcIdsQueryRaw, calcIdsQuery.join(','), hasCalcIdsQuery, id, isAverage, location.state]);

    const [chart, setChart] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (request.CalculatesId.length === 0) return;

        const fetchChart = async () => {
            setIsLoading(true);
            try {
                if (isDownloadMode) {
                    const base64 = isAverage
                        ? await PlotChartAveragePng(request)
                        : await PlotChartPng(request);

                    const href = `data:image/png;base64,${base64}`;
                    const a = document.createElement('a');
                    a.href = href;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    // Return back to the previous page after download trigger.
                    if (window.history.length > 1) {
                        navigate(-1);
                    }
                    return;
                }

                const result = isAverage ? await PlotChartAverage(request) : await PlotChart(request);
                const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
  <title>Scattering Chart</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { height: 100%; }
    body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #chart-container {
      width: 100%;
      min-height: 100%;
      padding: 16px;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    #chart-container .plotly-graph-div {
      max-width: 100%;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div id="chart-container">${result}</div>
</body>
</html>
                `;
                setChart(fullHtml);
            } catch (error) {
                console.error('Error fetching chart:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChart();
    }, [request, isAverage, isDownloadMode, filename, navigate]);

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isAverage ? 'Calculation Chart (average, log–log)' : 'Calculation Chart (log–log)'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isAverage
                            ? `Average of ${request.CalculatesId.length} calculations (same Q grid)`
                            : request.CalculatesId.length === 1
                                ? `Calculation ID: ${request.CalculatesId[0]}`
                                : `${request.CalculatesId.length} calculations`}
                    </p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Back
                </button>
            </div>

            <div className="flex-1 relative min-h-[85vh]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading chart...</p>
                        </div>
                    </div>
                ) : chart ? (
                    <iframe
                        srcDoc={chart}
                        className="w-full h-full border-0"
                        title="Calculation Chart"
                    />
                ) : request.CalculatesId.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <p>Select at least one calculation to display the chart</p>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <p>No chart data available</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
