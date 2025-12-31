import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlotAnalyse } from '../features/calculation/api/calculationApi';
import type { PlotAnalyseRequest } from '../features/calculation/api/calculationTypes';

export const RadialAnalysisChartPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [chart, setChart] = useState<string>('');
    const [request] = useState<PlotAnalyseRequest>(
        location.state?.request || {
            RadialAnalysisId: id || '',
            ChartTitle: 'Radial Analysis',
            XAxis: 'Index',
            YAxis: 'Value',
            ScaleMethodsX: 0, // Linear
            ScaleMethodsY: 0, // Linear
        },
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchChart = async () => {
            setIsLoading(true);
            try {
                const result = await PlotAnalyse(request);
                const fullHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
            <title>Radial Analysis Chart</title>
            <script src="https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/mpld3@0.5.10/dist/mpld3.min.js"></script>
            <style>
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background: #f8fafc;
                -webkit-overflow-scrolling: touch;
              }
              #chart-container {
                width: 100%;
                min-height: 100%;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                background: white;
                padding: 10px;
                box-sizing: border-box;
              }
              .mpld3-figure {
                margin: 0 auto;
                display: block;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                padding: 8px;
                max-width: 100%;
                width: 100%;
                height: auto;
              }
              .mpld3-figure svg {
                max-width: 100%;
                height: auto;
              }
              @media (max-width: 640px) {
                #chart-container {
                  padding: 5px;
                }
                .mpld3-figure {
                  padding: 4px;
                }
              }
            </style>
          </head>
          <body>
            <div id="chart-container">${result}</div>
            <script>
              // Добавляем обработчик для ресайза
              let resizeTimer;
              function redrawCharts() {
                if(window.mpld3) {
                  const figures = document.querySelectorAll('.mpld3-figure');
                  figures.forEach(fig => {
                    const id = fig.id;
                    const spec = JSON.parse(fig.dataset.mpld3 || '{}');
                    window.mpld3.draw_figure(id, spec);
                  });
                }
              }
              window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(redrawCharts, 250);
              });
              window.addEventListener('orientationchange', function() {
                setTimeout(redrawCharts, 500);
              });
              // Initial draw after a short delay to ensure DOM is ready
              setTimeout(redrawCharts, 100);
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
    }, [request]);

    return (
        <div className="min-h-screen w-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Radial Analysis Chart</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">Analysis ID: {id}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation whitespace-nowrap flex-shrink-0"
                >
                    Back
                </button>
            </div>

            <div className="flex-1 relative min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
                            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading chart...</p>
                        </div>
                    </div>
                ) : chart ? (
                    <iframe
                        srcDoc={chart}
                        className="w-full h-full border-0"
                        title="Radial Analysis Chart"
                        style={{ minHeight: '400px' }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="text-center text-sm sm:text-base text-gray-500">
                            <p>No chart data available</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

