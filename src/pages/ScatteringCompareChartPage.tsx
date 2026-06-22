import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
    plotScatteringCompare,
    plotScatteringComparePng,
    type PlotScatteringCompareRequest,
} from '../features/calculation/api/calculationApi';
import { SCATTERING } from '@/lib/scatteringLabels';

export const ScatteringCompareChartPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const isMobileDevice =
        typeof navigator !== 'undefined' &&
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    const legacyIdsQueryRaw = searchParams.get('legacyIds');
    const nanoIdsQueryRaw = searchParams.get('nanoIds');
    const legacyIds = legacyIdsQueryRaw
        ? legacyIdsQueryRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    const nanoIds = nanoIdsQueryRaw
        ? nanoIdsQueryRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const averageLegacy = searchParams.get('averageLegacy') !== '0';
    const averageNano = searchParams.get('averageNano') !== '0';

    const downloadRequested = searchParams.get('download') === '1';
    const isDownloadMode = downloadRequested || isMobileDevice;

    const seriesId = searchParams.get('seriesId');
    const safePart = (v: string) => v.replace(/[^0-9a-zA-Z]+/g, '_');
    const filename = `scattering_compare${seriesId ? `_${safePart(seriesId)}` : ''}.png`;

    const request = useMemo<PlotScatteringCompareRequest>(() => {
        if (legacyIds.length > 0 || nanoIds.length > 0) {
            return {
                LegacyCalculationIds: legacyIds,
                NanoScatteringIds: nanoIds,
                ChartTitle: SCATTERING.compare,
                XAxis: 'Q',
                YAxis: 'I',
                AverageLegacy: averageLegacy,
                AverageNano: averageNano,
                ScaleMethodsX: 'Log',
                ScaleMethodsY: 'Log',
            };
        }

        return (
            location.state?.request || {
                LegacyCalculationIds: [],
                NanoScatteringIds: [],
                ChartTitle: SCATTERING.compare,
                XAxis: 'Q',
                YAxis: 'I',
                AverageLegacy: true,
                AverageNano: true,
                ScaleMethodsX: 'Log',
                ScaleMethodsY: 'Log',
            }
        );
    }, [legacyIdsQueryRaw, nanoIdsQueryRaw, legacyIds.join(','), nanoIds.join(','), averageLegacy, averageNano, location.state]);

    const [chart, setChart] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (request.LegacyCalculationIds.length === 0 && request.NanoScatteringIds.length === 0) return;

        const fetchChart = async () => {
            setIsLoading(true);
            try {
                if (isDownloadMode) {
                    const base64 = await plotScatteringComparePng(request);
                    const href = `data:image/png;base64,${base64}`;
                    const a = document.createElement('a');
                    a.href = href;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    if (window.history.length > 1) {
                        navigate(-1);
                    }
                    return;
                }

                const result = await plotScatteringCompare(request);
                const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
  <title>Scattering Compare Chart</title>
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
                console.error('Error fetching compare chart:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChart();
    }, [request, isDownloadMode, filename, navigate]);

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{SCATTERING.compare}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {SCATTERING.modelShort}: {request.LegacyCalculationIds.length}
                        {request.AverageLegacy ? ' (averaged)' : ''}
                        {' · '}
                        {SCATTERING.theoryShort}: {request.NanoScatteringIds.length}
                        {request.AverageNano ? ' (averaged)' : ''}
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
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            <p className="mt-4 text-gray-600">Loading chart...</p>
                        </div>
                    </div>
                ) : chart ? (
                    <iframe
                        srcDoc={chart}
                        className="w-full h-full border-0"
                        title="Scattering Compare Chart"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <p>Select {SCATTERING.modelShort.toLowerCase()} and {SCATTERING.theoryShort.toLowerCase()} calculations to compare</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
