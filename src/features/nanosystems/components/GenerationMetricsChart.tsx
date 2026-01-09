import { useState, useMemo, type ChangeEvent } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchGenerationMetrics, type GetGenerationMetricsQuery, type IndexRange } from '../api/nanosystemApi';
import type { GenerationMetrics } from '../api/nanosystemTypes';
import { useToast } from '../../../hooks/useToast';

interface GenerationMetricsChartProps {
  nanosystemId: string;
}

type MetricKey = 
  | 'totalAttempts'
  | 'positiveAttempts'
  | 'insertionEfficiency'
  | 'generationTimeMs'
  | 'volume'
  | 'diameter'
  | 'particlesCheckedForIntersection'
  | 'outOfZoneAttempts'
  | 'firstNodeIntersectionEfficiency'
  | 'averageNeighborsCheckedPerAttempt'
  | 'diagonalDistanceCheckEfficiency'
  | 'sidesDistanceCheckEfficiency'
  | 'elementaryIntersectionNewTransformationEfficiency'
  | 'elementaryIntersectionOldTransformationEfficiency'
  | 'backRotateMatrixReusedEfficiency'
  | 'satCheckEfficiency'
  | 'averageParticlesCheckedPerAttempt'
  | 'outOfZoneAttemptsRatio'
  | 'inZoneAttempts';

const METRIC_OPTIONS: { key: MetricKey; label: string; color: string }[] = [
  { key: 'totalAttempts', label: 'Total Attempts', color: '#8884d8' },
  { key: 'positiveAttempts', label: 'Positive Attempts', color: '#82ca9d' },
  { key: 'insertionEfficiency', label: 'Insertion Efficiency', color: '#ffc658' },
  { key: 'generationTimeMs', label: 'Generation Time (ms)', color: '#ff7300' },
  { key: 'volume', label: 'Volume', color: '#00ff00' },
  { key: 'diameter', label: 'Diameter', color: '#0088fe' },
  { key: 'particlesCheckedForIntersection', label: 'Particles Checked For Intersection', color: '#ff00ff' },
  { key: 'outOfZoneAttempts', label: 'Out Of Zone Attempts', color: '#00ffff' },
  { key: 'firstNodeIntersectionEfficiency', label: 'First Node Intersection Efficiency', color: '#ff0080' },
  { key: 'averageNeighborsCheckedPerAttempt', label: 'Avg Neighbors Checked', color: '#8000ff' },
  { key: 'diagonalDistanceCheckEfficiency', label: 'Diagonal Distance Check Efficiency', color: '#ff8000' },
  { key: 'sidesDistanceCheckEfficiency', label: 'Sides Distance Check Efficiency', color: '#008080' },
  { key: 'elementaryIntersectionNewTransformationEfficiency', label: 'Elementary Intersection New Efficiency', color: '#808000' },
  { key: 'elementaryIntersectionOldTransformationEfficiency', label: 'Elementary Intersection Old Efficiency', color: '#800080' },
  { key: 'backRotateMatrixReusedEfficiency', label: 'Back Rotate Matrix Reused Efficiency', color: '#008000' },
  { key: 'satCheckEfficiency', label: 'SAT Check Efficiency', color: '#804000' },
  { key: 'averageParticlesCheckedPerAttempt', label: 'Avg Particles Checked Per Attempt', color: '#408080' },
  { key: 'outOfZoneAttemptsRatio', label: 'Out Of Zone Attempts Ratio', color: '#808040' },
  { key: 'inZoneAttempts', label: 'In Zone Attempts', color: '#408040' },
];

export const GenerationMetricsChart = ({ nanosystemId }: GenerationMetricsChartProps) => {
  const { showError } = useToast();
  const [metrics, setMetrics] = useState<GenerationMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(new Set(['insertionEfficiency', 'generationTimeMs']));
  const [indexRanges, setIndexRanges] = useState<IndexRange[]>([{ fromIndex: 0, toIndex: 0 }]);

  const loadMetrics = async () => {
    if (!nanosystemId) {
      showError('Error', 'Nanosystem ID is required');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty ranges and validate ranges
      const validRanges = indexRanges
        .filter((range: IndexRange) => range.fromIndex !== undefined && range.toIndex !== undefined && range.fromIndex <= range.toIndex)
        .map((range: IndexRange) => ({ fromIndex: range.fromIndex, toIndex: range.toIndex }));
      
      const query: GetGenerationMetricsQuery = {
        nanosystemId,
        particleIndexRanges: validRanges.length > 0 ? validRanges : undefined,
      };
      const data = await fetchGenerationMetrics(query);
      setMetrics(data);
    } catch (error) {
      showError('Failed to load metrics', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    return metrics.map((metric: GenerationMetrics) => {
      const dataPoint: Record<string, number | string> = {
        particleIndex: metric.particleIndex,
      };
      
      METRIC_OPTIONS.forEach((option) => {
        const value = metric[option.key];
        if (typeof value === 'number') {
          dataPoint[option.key] = value;
        }
      });
      
      return dataPoint;
    });
  }, [metrics]);

  const maxIndex = useMemo(() => {
    return metrics.length > 0 ? Math.max(...metrics.map((m: GenerationMetrics) => m.particleIndex)) : 0;
  }, [metrics]);

  const handleMetricToggle = (metricKey: MetricKey) => {
    setSelectedMetrics((prev: Set<MetricKey>) => {
      const newSet = new Set(prev);
      if (newSet.has(metricKey)) {
        newSet.delete(metricKey);
      } else {
        newSet.add(metricKey);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedMetrics(new Set(METRIC_OPTIONS.map(m => m.key)));
  };

  const handleDeselectAll = () => {
    setSelectedMetrics(new Set());
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Chart Controls</h3>
          <button
            onClick={loadMetrics}
            disabled={loading || !nanosystemId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Load Metrics
              </>
            )}
          </button>
        </div>
        
        {/* Index Range Selection - Multiple Ranges */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Index Ranges
            </label>
            <button
              onClick={() => setIndexRanges([...indexRanges, { fromIndex: 0, toIndex: 0 }])}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 border border-blue-300 rounded"
            >
              Add Range
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
            {indexRanges.map((range: IndexRange, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    From Index
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={maxIndex}
                    value={range.fromIndex}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const newRanges = [...indexRanges];
                      newRanges[index].fromIndex = Number(e.target.value) || 0;
                      setIndexRanges(newRanges);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    To Index
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={maxIndex}
                    value={range.toIndex}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const newRanges = [...indexRanges];
                      newRanges[index].toIndex = Number(e.target.value) || 0;
                      setIndexRanges(newRanges);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={maxIndex.toString()}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      const newRanges = indexRanges.filter((_: IndexRange, i: number) => i !== index);
                      if (newRanges.length === 0) {
                        newRanges.push({ fromIndex: 0, toIndex: 0 });
                      }
                      setIndexRanges(newRanges);
                    }}
                    className="w-full px-2 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 rounded"
                    disabled={indexRanges.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metric Selection */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Metrics to Display
            </label>
            <div className="space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
            {METRIC_OPTIONS.map((option) => (
              <label
                key={option.key}
                className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedMetrics.has(option.key)}
                  onChange={() => handleMetricToggle(option.key)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Generation Metrics Chart</h3>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Loading metrics...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">No metrics data available</div>
          </div>
        ) : selectedMetrics.size === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-500">Please select at least one metric to display</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={600}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="particleIndex" 
                label={{ value: 'Particle Index', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              {METRIC_OPTIONS
                .filter((option) => selectedMetrics.has(option.key))
                .map((option) => (
                  <Line
                    key={option.key}
                    type="monotone"
                    dataKey={option.key}
                    stroke={option.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={option.label}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
