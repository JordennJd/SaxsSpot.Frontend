import { useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { type NanosystemDto, type RadialAnalysisDto } from '../../features/nanosystems/api/nanosystemTypes';
import type { CalculationDto } from '../../features/calculation/api/calculationTypes';
import { GenerationMetricsChart } from '../../features/nanosystems/components/GenerationMetricsChart';
import {
  XMarkIcon,
  CalculatorIcon,
  CubeIcon,
  UserIcon,
  HashtagIcon,
  ClockIcon,
  ScaleIcon,
  ArrowsRightLeftIcon,
  BeakerIcon,
  ChartBarIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

interface DetailItemProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NanosystemDetailsModalProps {
  nanosystem: NanosystemDto | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onCalculate: () => void;
  onAnalyse: () => void;
  calculations: CalculationDto[];
  isCalculationsLoading: boolean;
  isCalculationsError?: boolean;
  onCalculationClick: (calculation: CalculationDto) => void;
  radialAnalyses: RadialAnalysisDto[];
  isRadialAnalysesLoading: boolean;
  isRadialAnalysesError?: boolean;
  onRadialAnalysisClick: (analysis: RadialAnalysisDto) => void;
  onViewChartSelected?: (analysisIds: string[]) => void;
  onViewCalculationChartSelected?: (calculationIds: string[]) => void;
  onViewCalculationChartAverageSelected?: (calculationIds: string[]) => void;
}

const DetailItem = ({ label, value, icon: Icon }: DetailItemProps) => (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        <Icon className="h-4 w-4" />
        <h4 className="text-xs font-medium uppercase tracking-wide">{label}</h4>
      </div>
      <p className="mt-1 font-medium text-gray-900 break-words pl-6">
        {value}
      </p>
    </div>
);

export const NanosystemDetailsModal = ({
                                         nanosystem,
                                         isOpen,
                                         onClose,
                                         onDownload,
                                         onCalculate,
                                         onAnalyse,
                                         calculations,
                                         isCalculationsLoading,
                                         isCalculationsError,
                                         onCalculationClick,
                                         radialAnalyses,
                                         isRadialAnalysesLoading,
                                         isRadialAnalysesError,
                                         onRadialAnalysisClick,
                                         onViewChartSelected,
                                         onViewCalculationChartSelected,
                                         onViewCalculationChartAverageSelected,
                                       }: NanosystemDetailsModalProps) => {
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<Set<string>>(new Set());
  const [selectedCalculationIds, setSelectedCalculationIds] = useState<Set<string>>(new Set());

  const toggleAnalysisSelection = useCallback((e: React.MouseEvent, analysisId: string) => {
    e.stopPropagation();
    setSelectedAnalysisIds((prev) => {
      const next = new Set(prev);
      if (next.has(analysisId)) next.delete(analysisId);
      else next.add(analysisId);
      return next;
    });
  }, []);

  const toggleCalculationSelection = useCallback((e: React.MouseEvent, calculationId: string) => {
    e.stopPropagation();
    setSelectedCalculationIds((prev) => {
      const next = new Set(prev);
      if (next.has(calculationId)) next.delete(calculationId);
      else next.add(calculationId);
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    setSelectedAnalysisIds(new Set());
    setSelectedCalculationIds(new Set());
    onClose();
  }, [onClose]);

  const handleViewChartSelected = useCallback(() => {
    const ids = Array.from(selectedAnalysisIds);
    if (ids.length > 0 && onViewChartSelected) onViewChartSelected(ids);
  }, [selectedAnalysisIds, onViewChartSelected]);

  const handleViewCalculationChartSelected = useCallback(() => {
    const ids = Array.from(selectedCalculationIds);
    if (ids.length > 0 && onViewCalculationChartSelected) onViewCalculationChartSelected(ids);
  }, [selectedCalculationIds, onViewCalculationChartSelected]);

  const handleViewCalculationChartAverageSelected = useCallback(() => {
    const ids = Array.from(selectedCalculationIds);
    if (ids.length >= 2 && onViewCalculationChartAverageSelected) onViewCalculationChartAverageSelected(ids);
  }, [selectedCalculationIds, onViewCalculationChartAverageSelected]);

  if (!nanosystem) return null;

  // Группируем данные для лучшей организации
  const basicInfo = [
    { label: 'Particle Kind', value: nanosystem.particleKind, icon: CubeIcon },
    { label: 'Series ID', value: nanosystem.seriesId, icon: HashtagIcon },
    { label: 'Object ID', value: nanosystem.objectId, icon: HashtagIcon },
    { label: 'User ID', value: nanosystem.userId.toString(), icon: UserIcon },
  ];

  const sizeInfo = [
    { label: 'Particle Count', value: nanosystem.particleCount.toLocaleString(), icon: HashtagIcon },
    { label: 'Global Size', value: `${nanosystem.globalSize} nm`, icon: ScaleIcon },
    { label: 'Max Particle Size', value: `${nanosystem.maxParticleSize} nm`, icon: ArrowsRightLeftIcon },
    { label: 'Min Particle Size', value: `${nanosystem.minParticleSize} nm`, icon: ArrowsRightLeftIcon },
  ];

  const generationInfo = [
    { label: 'Generation Zone Volume', value: nanosystem.generationZoneVolume.toString(), icon: CubeIcon },
    { label: 'Generation Zone Form', value: nanosystem.generationZoneForm, icon: CubeIcon },
    { label: 'Numerical Concentration', value: nanosystem.numericalConcentration.toString(), icon: BeakerIcon },
  ];

  const parametersInfo = [
    { label: 'Excess', value: nanosystem.excess.toString(), icon: ScaleIcon },
    { label: 'K Parameter', value: nanosystem.k.toString(), icon: ScaleIcon },
    { label: 'Theta', value: nanosystem.theta.toString(), icon: ScaleIcon },
  ];

  const timeInfo = [
    { label: 'Generation Start', value: nanosystem.generationStart, icon: ClockIcon },
    { label: 'Generation End', value: nanosystem.generationEnd, icon: ClockIcon },
    { label: 'Input Date', value: nanosystem.inputDate, icon: ClockIcon },
  ];

  return (
      <Dialog open={isOpen} onClose={handleClose} style={{ zIndex: 99999 }}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 99998 }} aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <Dialog.Panel className="w-full max-w-4xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 rounded-t-xl flex justify-between items-start">
              <div>
                <Dialog.Title className="text-2xl font-bold text-white flex items-center gap-2">
                  <CubeIcon className="h-6 w-6" />
                  Nanosystem Details
                </Dialog.Title>
                <p className="text-blue-100 mt-1 flex items-center gap-1">
                  <HashtagIcon className="h-4 w-4" />
                  ID: {nanosystem.id}
                </p>
              </div>
              <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {basicInfo.map((item, index) => (
                      <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                  ))}
                </div>
              </div>

              {/* Size Information Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Size Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sizeInfo.map((item, index) => (
                      <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                  ))}
                </div>
              </div>

              {/* Generation Information Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  Generation Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generationInfo.map((item, index) => (
                      <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                  ))}
                </div>
              </div>

              {/* Parameters Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {parametersInfo.map((item, index) => (
                      <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                  ))}
                </div>
              </div>

              {/* Time Information Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {timeInfo.map((item, index) => (
                      <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                  ))}
                </div>
              </div>

              {/* Calculations Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                  <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                  Calculations
                </h3>
                {isCalculationsLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        Loading calculations...
                      </div>
                    </div>
                ) : isCalculationsError ? (
                    <div className="text-center py-4 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                      <CalculatorIcon className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2">Service unavailable</p>
                    </div>
                ) : calculations?.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                      <CalculatorIcon className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2">No calculations found</p>
                    </div>
                ) : (
                    <div className="h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <ul className="space-y-2">
                        {calculations?.map((calc) => (
                            <li
                                key={calc.id}
                                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-3"
                                onClick={() => onCalculationClick(calc)}
                            >
                              <input
                                  type="checkbox"
                                  checked={selectedCalculationIds.has(calc.id)}
                                  onChange={() => {}}
                                  onClick={(e) => toggleCalculationSelection(e, calc.id)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  aria-label={`Select calculation ${calc.id}`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <ClockIcon className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-700">{calc.inputDate}</span>
                                    </div>
                                    <p className="text-xs font-mono text-blue-600 mb-1 truncate">{calc.id}</p>
                                    <p className="text-xs text-gray-500">
                                      Q: {calc.qVectorFrom}-{calc.qVectorTo}
                                    </p>
                                  </div>
                                  <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-indigo-100 text-indigo-800 shrink-0">
                                    Calculation
                                  </span>
                                </div>
                              </div>
                            </li>
                        ))}
                      </ul>
                    </div>
                )}
              </div>

              {/* Generation Metrics Chart Section */}
              {nanosystem && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    Generation Metrics
                  </h3>
                  <GenerationMetricsChart nanosystemId={nanosystem.id} />
                </div>
              )}

              {/* Radial Analyses Section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  Radial Analyses
                </h3>
                {isRadialAnalysesLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                        Loading radial analyses...
                      </div>
                    </div>
                ) : isRadialAnalysesError ? (
                    <div className="text-center py-4 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                      <ChartBarIcon className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2">Service unavailable</p>
                    </div>
                ) : radialAnalyses?.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                      <ChartBarIcon className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2">No radial analyses found</p>
                    </div>
                ) : (
                    <div className="h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <ul className="space-y-2">
                        {radialAnalyses?.map((analysis) => (
                            <li
                                key={analysis.id}
                                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex items-start gap-3"
                                onClick={() => onRadialAnalysisClick(analysis)}
                            >
                              <input
                                  type="checkbox"
                                  checked={selectedAnalysisIds.has(analysis.id)}
                                  onChange={() => {}}
                                  onClick={(e) => toggleAnalysisSelection(e, analysis.id)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                  aria-label={`Select analysis ${analysis.id}`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <ClockIcon className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-700">{analysis.startDate}</span>
                                    </div>
                                    <p className="text-xs font-mono text-purple-600 mb-1 truncate">{analysis.id}</p>
                                    <p className="text-xs text-gray-500">
                                      Points: {analysis.pointCount}, Layers: {analysis.layerCount}
                                    </p>
                                  </div>
                                  <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-purple-100 text-purple-800 shrink-0">
                                    Analysis
                                  </span>
                                </div>
                              </div>
                            </li>
                        ))}
                      </ul>
                    </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3 rounded-b-xl">
              <div className="flex flex-wrap gap-3">
                <button
                    onClick={onDownload}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <CubeIcon className="h-5 w-5" />
                  Download
                </button>
                {onViewChartSelected && (
                    <button
                        onClick={handleViewChartSelected}
                        disabled={selectedAnalysisIds.size === 0}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Squares2X2Icon className="h-5 w-5" />
                      View analyse chart ({selectedAnalysisIds.size})
                    </button>
                )}
                {onViewCalculationChartSelected && (
                    <button
                        onClick={handleViewCalculationChartSelected}
                        disabled={selectedCalculationIds.size === 0}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      View calculation chart ({selectedCalculationIds.size})
                    </button>
                )}
                {onViewCalculationChartAverageSelected && (
                    <button
                        onClick={handleViewCalculationChartAverageSelected}
                        disabled={selectedCalculationIds.size < 2}
                        title="Average intensity when Q grid matches (same number of points)"
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                      View average chart ({selectedCalculationIds.size})
                    </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                    onClick={onCalculate}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <CalculatorIcon className="h-5 w-5" />
                  Calculate
                </button>
                <button
                    onClick={onAnalyse}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  Analyse
                </button>
                <button
                    onClick={handleClose}
                    className="px-5 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
  );
};