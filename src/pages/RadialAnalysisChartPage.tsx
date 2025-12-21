import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlotAnalyse } from '../features/calculation/api/calculationApi';
import type { PlotAnalyseRequest } from '../features/calculation/api/calculationTypes';

export const RadialAnalysisChartPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [chart, setChart] = useState<string>('');
    const [request, setRequest] = useState<PlotAnalyseRequest>(
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
    const [activeTab, setActiveTab] = useState('chart');

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
            <title>Radial Analysis Chart</title>
            <script src="https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/mpld3@0.5.10/dist/mpld3.min.js"></script>
            <style>
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                background: #f8fafc;
              }
              #chart-container {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background: white;
                padding: 20px;
                box-sizing: border-box;
              }
              .mpld3-figure {
                margin: 0 auto;
                display: block;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                padding: 16px;
              }
            </style>
          </head>
          <body>
            <div id="chart-container">${result}</div>
            <script>
              // Добавляем обработчик для ресайза
              let resizeTimer;
              window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                  if(window.mpld3) {
                    const figures = document.querySelectorAll('.mpld3-figure');
                    figures.forEach(fig => {
                      const id = fig.id;
                      const spec = JSON.parse(fig.dataset.mpld3 || '{}');
                      window.mpld3.draw_figure(id, spec);
                    });
                  }
                }, 250);
              });
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

        if (activeTab === 'chart') {
            fetchChart();
        }
    }, [request, activeTab]);

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Radial Analysis Chart</h1>
                    <p className="text-sm text-gray-500 mt-1">Analysis ID: {id}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Back
                </button>
            </div>

            <div className="flex-1 relative">
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

