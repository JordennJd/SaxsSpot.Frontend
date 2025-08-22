import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlotChart } from '../features/calculation/api/calculationApi';
import type { PlotChartRequest } from '../features/calculation/api/calculationTypes';

export const CalculationChartPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [chart, setChart] = useState<string>('');
    const [request, setRequest] = useState<PlotChartRequest>(location.state?.request || {
        CalculatesId: [id || ''],
        ChartTitle: 'Scattering',
        XAxis: 'Q',
        YAxis: 'I',
        ScaleMethodsX: 'Linear',
        ScaleMethodsY: 'Linear',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchChart = async () => {
            setIsLoading(true);
            try {
                const result = await PlotChart(request);
                const fullHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Chart</title>
                        <script src="https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js"></script>
                        <script src="https://cdn.jsdelivr.net/npm/mpld3@0.5.10/dist/mpld3.min.js"></script>
                        <style>
                            html, body {
                                margin: 0;
                                padding: 0;
                                width: 100%;
                                height: 100%;
                                overflow: hidden;
                            }
                            #chart-container {
                                width: 100%;
                                height: 100%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                background: white;
                                padding-bottom: 100px; /* Добавляем отступ снизу */
                            }
                            .mpld3-figure {
                                margin: 0 auto;
                                display: block;
                            }
                        </style>
                    </head>
                    <body>
                        <div id="chart-container">${result}</div>
                        <script>
                            // Добавляем обработчик для ресайза
                            window.addEventListener('resize', function() {
                                if(window.mpld3) {
                                    const figures = document.querySelectorAll('.mpld3-figure');
                                    figures.forEach(fig => {
                                        const id = fig.id;
                                        const spec = JSON.parse(fig.dataset.mpld3 || '{}');
                                        window.mpld3.draw_figure(id, spec);
                                    });
                                }
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

        fetchChart();
    }, [request]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRequest(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="container mx-auto p-4 flex flex-col" style={{ minHeight: '100vh' }}>
            <h1 className="text-2xl font-bold mb-4">Calculation Chart</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <h2 className="text-lg font-semibold mb-2">Chart Parameters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Chart Title</label>
                        <input
                            type="text"
                            name="ChartTitle"
                            value={request.ChartTitle}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">X Axis</label>
                        <input
                            type="text"
                            name="XAxis"
                            value={request.XAxis}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Y Axis</label>
                        <input
                            type="text"
                            name="YAxis"
                            value={request.YAxis}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">X Scale Method</label>
                        <select
                            name="ScaleMethodsX"
                            value={request.ScaleMethodsX}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="Linear">Linear</option>
                            <option value="Log">Logarithmic</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Y Scale Method</label>
                        <select
                            name="ScaleMethodsY"
                            value={request.ScaleMethodsY}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="Linear">Linear</option>
                            <option value="Log">Logarithmic</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="flex-grow flex flex-col bg-white rounded-lg shadow-md overflow-hidden mb-4">
                    <h2 className="text-lg font-semibold p-6 border-b">Chart Visualization</h2>
                    <div className="flex-grow relative" style={{ minHeight: '600px', height: 'calc(100vh)' }}>
                        <iframe
                            srcDoc={chart}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            sandbox="allow-scripts allow-same-origin"
                            className="absolute inset-0"
                            title="Chart visualization"
                        />
                    </div>
                </div>
            )}

            <div className="mt-auto mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Back to Details
                </button>
            </div>
        </div>
    );
};