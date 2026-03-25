import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlotAnalyse, PlotAnalyseAverage, PlotAnalyseAveragePng, PlotAnalysePng } from '../features/calculation/api/calculationApi';
import type { PlotAnalyseRequest } from '../features/calculation/api/calculationTypes';

export const RadialAnalysisChartPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const isAverage = (location.state as { isAverage?: boolean } | null)?.isAverage ?? false;
    const [chart, setChart] = useState<string>('');
    const [request] = useState<PlotAnalyseRequest>(
        location.state?.request || {
            RadialAnalysisIds: id ? [id] : [],
            ChartTitle: 'Radial Analysis',
            XAxis: 'r, nm',
            YAxis: 'Numerical concentration',
            ScaleMethodsX: 0, // Linear
            ScaleMethodsY: 0, // Linear
        },
    );
    const [isLoading, setIsLoading] = useState(false);

    const isMobileDevice =
        typeof navigator !== 'undefined' &&
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    useEffect(() => {
        if (request.RadialAnalysisIds.length === 0) return;

        const fetchChart = async () => {
            setIsLoading(true);
            try {
                if (isMobileDevice) {
                    const base64 = isAverage
                        ? await PlotAnalyseAveragePng(request)
                        : await PlotAnalysePng(request);

                    const href = `data:image/png;base64,${base64}`;
                    const a = document.createElement('a');
                    a.href = href;
                    a.download = isAverage ? 'radial-average.png' : 'radial.png';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    if (window.history.length > 1) {
                        navigate(-1);
                    }
                    return;
                }

                const result = isAverage ? await PlotAnalyseAverage(request) : await PlotAnalyse(request);
                const fullHtml = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
  <title>График радиального анализа</title>
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
    }, [request, isAverage, isMobileDevice]);

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isAverage ? 'Series average (first analyses)' : 'Radial Analysis Chart'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isAverage
                            ? `Average of ${request.RadialAnalysisIds.length} first analyses`
                            : request.RadialAnalysisIds.length === 1
                                ? `Analysis ID: ${request.RadialAnalysisIds[0]}`
                                : `${request.RadialAnalysisIds.length} analyses`}
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
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            <p className="mt-4 text-gray-600">Loading chart...</p>
                        </div>
                    </div>
                ) : chart ? (
                    <iframe
                        srcDoc={chart}
                        className="w-full h-full border-0"
                        title="Radial Analysis Chart"
                    />
                ) : request.RadialAnalysisIds.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <p>Select at least one radial analysis to display the chart</p>
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

