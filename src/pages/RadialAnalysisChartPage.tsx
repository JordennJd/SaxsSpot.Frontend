import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlotAnalyse, PlotAnalyseAverage } from '../features/calculation/api/calculationApi';
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

    useEffect(() => {
        if (request.RadialAnalysisIds.length === 0) return;

        const fetchChart = async () => {
            setIsLoading(true);
            try {
                const result = isAverage
                    ? await PlotAnalyseAverage(request)
                    : await PlotAnalyse(request);
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
      padding: 0 0 56px 0;
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
    #chart-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: #fff;
      border-top: 1px solid #e2e8f0;
      padding: 0 16px;
      z-index: 1000;
    }
    #btn-download-png {
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35);
    }
    #btn-download-png:hover { opacity: 0.95; }
    #btn-download-png:active { transform: scale(0.97); }
  </style>
</head>
<body>
  <div id="chart-container">${result}</div>
  <div id="chart-actions">
    <button type="button" id="btn-download-png">Скачать PNG</button>
  </div>
  <script>
(function() {
  function bindDownload() {
    var gd = document.querySelector('.plotly-graph-div');
    if (!gd || !window.Plotly) return false;
    var btn = document.getElementById('btn-download-png');
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', function() {
        try {
          Plotly.downloadImage(gd, {
            format: 'png',
            width: gd.offsetWidth,
            height: gd.offsetHeight,
            filename: 'radial-analysis'
          });
        } catch (e) { console.error(e); }
      });
    }
    return true;
  }
  function run() {
    if (bindDownload()) return;
    setTimeout(run, 80);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(run, 200); });
  } else {
    setTimeout(run, 200);
  }
})();
  </script>
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
    }, [request, isAverage]);

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

