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
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
            <title>Radial Analysis Chart</title>
            <style>
              * { box-sizing: border-box; }
              html, body {
                margin: 0;
                padding: 0;
                padding-bottom: 52px;
                width: 100%;
                height: 100%;
                overflow: auto;
                -webkit-overflow-scrolling: touch;
                background: #f8fafc;
              }
              #chart-container {
                width: 100%;
                min-height: 100%;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                background: white;
                padding: 12px;
              }
              #chart-container .plotly-graph-div {
                max-width: 100% !important;
              }
              #chart-actions {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 52px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #fff;
                border-top: 1px solid #e5e7eb;
                padding: 8px 16px;
                z-index: 1000;
              }
              #btn-download-png {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                font-size: 16px;
                font-weight: 500;
                color: #fff;
                background: #7c3aed;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              }
              #btn-download-png:hover { background: #6d28d9; }
              #btn-download-png:active { transform: scale(0.98); }
            </style>
          </head>
          <body>
            <div id="chart-container">${result}</div>
            <div id="chart-actions">
              <button type="button" id="btn-download-png">Скачать PNG</button>
            </div>
            <script>
              (function() {
                function runWhenPlotlyReady() {
                  var gd = document.querySelector('.plotly-graph-div');
                  if (!gd || !window.Plotly) return false;
                  var container = document.getElementById('chart-container');
                  var w = container.clientWidth;
                  var h = Math.max(300, window.innerHeight - 70);
                  try { Plotly.relayout(gd, { width: w, height: h }); } catch (e) {}
                  var btn = document.getElementById('btn-download-png');
                  if (btn && !btn._bound) {
                    btn._bound = true;
                    btn.addEventListener('click', function() {
                      try {
                        Plotly.downloadImage(gd, { format: 'png', width: gd.offsetWidth, height: gd.offsetHeight, filename: 'radial-analysis' });
                      } catch (err) { console.error(err); }
                    });
                  }
                  return true;
                }
                function tryRun() {
                  if (runWhenPlotlyReady()) return;
                  setTimeout(tryRun, 100);
                }
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() { setTimeout(tryRun, 150); });
                } else {
                  setTimeout(tryRun, 150);
                }
                window.addEventListener('resize', function() {
                  var gd = document.querySelector('.plotly-graph-div');
                  if (gd && window.Plotly) {
                    var container = document.getElementById('chart-container');
                    Plotly.relayout(gd, { width: container.clientWidth, height: Math.max(300, window.innerHeight - 70) });
                  }
                });
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

