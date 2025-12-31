import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlotChart } from '../features/calculation/api/calculationApi';
import type { PlotChartRequest } from '../features/calculation/api/calculationTypes';

export const CalculationChartPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [chart, setChart] = useState<string>('');
    const [request, setRequest] = useState<PlotChartRequest>(
        location.state?.request || {
            CalculatesId: [id || ''],
            ChartTitle: 'Scattering',
            XAxis: 'Q',
            YAxis: 'I',
            ScaleMethodsX: 'Linear',
            ScaleMethodsY: 'Linear',
        },
    );
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('chart');

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
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
            <title>Chart</title>
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

        if (activeTab === 'chart') {
            fetchChart();
        }
    }, [request, activeTab]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRequest((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleScaleChange = (axis: 'X' | 'Y', method: 'Linear' | 'Log') => {
        setRequest((prev) => ({
            ...prev,
            [`ScaleMethods${axis}`]: method,
        }));
    };

    const axisOptions = [
        { value: 'Q', label: 'Q vector' },
        { value: 'I', label: 'Intensity (I)' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Calculation Visualization</h1>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Explore and analyze your calculation results</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm sm:text-base bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm touch-manipulation whitespace-nowrap flex-shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">Back to Details</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-md mb-4 sm:mb-6 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('chart')}
                                className={`flex-1 sm:flex-none py-3 sm:py-4 px-3 sm:px-6 text-center font-medium text-xs sm:text-sm border-b-2 transition-colors touch-manipulation ${
                                    activeTab === 'chart'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 active:text-gray-900'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="hidden sm:inline">Chart Visualization</span>
                                <span className="sm:hidden">Chart</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('parameters')}
                                className={`flex-1 sm:flex-none py-3 sm:py-4 px-3 sm:px-6 text-center font-medium text-xs sm:text-sm border-b-2 transition-colors touch-manipulation ${
                                    activeTab === 'parameters'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 active:text-gray-900'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 inline-block mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                                <span className="hidden sm:inline">Chart Parameters</span>
                                <span className="sm:hidden">Params</span>
                            </button>
                        </nav>
                    </div>

                    {/* Parameters Panel */}
                    {activeTab === 'parameters' && (
                        <div className="p-3 sm:p-4 md:p-6">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Customize Chart Appearance</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Chart Title</label>
                                    <input
                                        type="text"
                                        name="ChartTitle"
                                        value={request.ChartTitle}
                                        onChange={handleInputChange}
                                        className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 sm:px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="Enter chart title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">X Axis</label>
                                    <select
                                        name="XAxis"
                                        value={request.XAxis}
                                        onChange={handleInputChange}
                                        className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 sm:px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    >
                                        {axisOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Y Axis</label>
                                    <select
                                        name="YAxis"
                                        value={request.YAxis}
                                        onChange={handleInputChange}
                                        className="w-full text-sm sm:text-base rounded-lg border border-gray-300 px-3 sm:px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                    >
                                        {axisOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Scale Type</label>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <div className="flex-1">
                                            <span className="block text-xs text-gray-500 mb-1.5">X Axis</span>
                                            <div className="flex rounded-md shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleScaleChange('X', 'Linear')}
                                                    className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-l-md border touch-manipulation ${
                                                        request.ScaleMethodsX === 'Linear'
                                                            ? 'bg-blue-100 text-blue-700 border-blue-500'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                                                    }`}
                                                >
                                                    Linear
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleScaleChange('X', 'Log')}
                                                    className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-r-md border border-l-0 touch-manipulation ${
                                                        request.ScaleMethodsX === 'Log'
                                                            ? 'bg-blue-100 text-blue-700 border-blue-500'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                                                    }`}
                                                >
                                                    Log
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <span className="block text-xs text-gray-500 mb-1.5">Y Axis</span>
                                            <div className="flex rounded-md shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleScaleChange('Y', 'Linear')}
                                                    className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-l-md border touch-manipulation ${
                                                        request.ScaleMethodsY === 'Linear'
                                                            ? 'bg-blue-100 text-blue-700 border-blue-500'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                                                    }`}
                                                >
                                                    Linear
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleScaleChange('Y', 'Log')}
                                                    className={`flex-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-r-md border border-l-0 touch-manipulation ${
                                                        request.ScaleMethodsY === 'Log'
                                                            ? 'bg-blue-100 text-blue-700 border-blue-500'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                                                    }`}
                                                >
                                                    Log
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-6 md:mt-8 bg-blue-50 p-3 sm:p-4 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-2 sm:ml-3">
                                        <h3 className="text-xs sm:text-sm font-medium text-blue-800">Pro Tip</h3>
                                        <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700">
                                            <p>Use logarithmic scales when your data spans several orders of magnitude. This can help reveal patterns that might be hidden in a linear scale.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chart Visualization */}
                {activeTab === 'chart' && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4 sm:mb-6">
                        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Chart Visualization</h2>
                            <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                {request.XAxis} vs {request.YAxis} ({request.ScaleMethodsX}/{request.ScaleMethodsY})
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 sm:h-80 md:h-96 p-4">
                                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500 mb-3 sm:mb-4"></div>
                                <p className="text-sm sm:text-base text-gray-600">Generating your visualization...</p>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">This may take a moment</p>
                            </div>
                        ) : (
                            <div className="relative" style={{ minHeight: '400px', height: 'calc(100vh - 300px)' }}>
                                <iframe
                                    srcDoc={chart}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    sandbox="allow-scripts allow-same-origin"
                                    className="absolute inset-0"
                                    title="Chart visualization"
                                />
                                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white rounded-lg shadow-md px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                    </svg>
                                    <span className="hidden sm:inline">Interactive Chart</span>
                                    <span className="sm:hidden">Chart</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md overflow-hidden text-white">
                    <div className="p-4 sm:p-5 md:p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3 sm:ml-4">
                                <h3 className="text-base sm:text-lg font-medium">About This Visualization</h3>
                                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-blue-100">
                                    This interactive chart displays the results of your scattering calculation. You can customize the axes, scale type, and title to explore different aspects of your data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};