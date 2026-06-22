import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { type NanosystemDto, type RadialAnalysisDto, type ScatteringCalculationDto } from '../../features/nanosystems/api/nanosystemTypes';
import type { CalculationDto } from '../../features/calculation/api/calculationTypes';
import { GenerationMetricsChart } from '../../features/nanosystems/components/GenerationMetricsChart';
import {
  CalculatorIcon,
  CubeIcon,
  UserIcon,
  HashtagIcon,
  ClockIcon,
  ScaleIcon,
  ArrowsRightLeftIcon,
  BeakerIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDateTime, formatGenerationDuration } from '@/lib/utils';
import { SCATTERING } from '@/lib/scatteringLabels';

export type NanosystemTabId = 'overview' | 'legacy' | 'radial' | 'saxs';

interface DetailItemProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NanosystemActionButtonsProps {
  onDownload: () => void;
  onView3D?: () => void;
  onCalculate: () => void;
  onAnalyse: () => void;
  onScatteringCalculate: () => void;
  onClose?: () => void;
}

export interface NanosystemDetailsViewProps {
  nanosystem: NanosystemDto | null;
  onDownload: () => void;
  onCalculate: () => void;
  onAnalyse: () => void;
  onScatteringCalculate: () => void;
  calculations: CalculationDto[];
  isCalculationsLoading: boolean;
  isCalculationsError?: boolean;
  onCalculationClick: (calculation: CalculationDto) => void;
  radialAnalyses: RadialAnalysisDto[];
  isRadialAnalysesLoading: boolean;
  isRadialAnalysesError?: boolean;
  onRadialAnalysisClick: (analysis: RadialAnalysisDto) => void;
  scatteringCalculations: ScatteringCalculationDto[];
  isScatteringCalculationsLoading: boolean;
  isScatteringCalculationsError?: boolean;
  onScatteringCalculationClick: (calculation: ScatteringCalculationDto) => void;
  onViewChartSelected?: (analysisIds: string[]) => void;
  onViewCalculationChartSelected?: (calculationIds: string[]) => void;
  onViewCalculationChartAverageSelected?: (calculationIds: string[]) => void;
  onViewScatteringChartSelected?: (scatteringIds: string[]) => void;
  onViewScatteringChartAverageSelected?: (scatteringIds: string[]) => void;
  onCompareScatteringChartSelected?: (legacyIds: string[], nanoIds: string[]) => void;
  onView3D?: () => void;
  layout?: 'modal' | 'page';
  compactChrome?: boolean;
  showTabBar?: boolean;
  forceTab?: NanosystemTabId;
  pickerMode?: boolean;
  initialTab?: NanosystemTabId;
  onTabChange?: (tab: NanosystemTabId) => void;
  showFooterActions?: boolean;
  headerExtra?: ReactNode;
  onClose?: () => void;
}

const DetailItem = ({ label, value, icon: Icon }: DetailItemProps) => (
  <div className="bg-white p-2.5 rounded-lg border border-gray-200">
    <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
      <Icon className="h-3.5 w-3.5" />
      <h4 className="text-[11px] font-medium uppercase tracking-wide">{label}</h4>
    </div>
    <p className="font-medium text-gray-900 text-sm break-words pl-5">{value}</p>
  </div>
);

const TabButton = ({
  active,
  label,
  count,
  onClick,
  accentClass,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  accentClass: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      active
        ? `${accentClass} border-current text-gray-900`
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {label}
    {count != null && (
      <span className={`px-1.5 py-0.5 rounded-full text-xs ${active ? 'bg-white/80' : 'bg-gray-100'}`}>
        {count}
      </span>
    )}
  </button>
);

const EmptyState = ({ icon: Icon, message }: { icon: React.ComponentType<{ className?: string }>; message: string }) => (
  <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
    <Icon className="h-10 w-10 mx-auto text-gray-300" />
    <p className="mt-3 text-sm">{message}</p>
  </div>
);

const LoadingState = ({ label, accentClass }: { label: string; accentClass: string }) => (
  <div className="text-center py-10">
    <div className={`inline-flex items-center px-4 py-2 text-sm text-gray-600`}>
      <div className={`animate-spin mr-2 h-4 w-4 border-2 ${accentClass} border-t-transparent rounded-full`} />
      {label}
    </div>
  </div>
);

const ChartToolbar = ({ children }: { children: ReactNode }) => (
  <div className="sticky bottom-0 z-10 mt-4 p-3 rounded-xl bg-slate-900/95 text-white shadow-lg flex flex-wrap gap-2">
    {children}
  </div>
);

const ToolbarButton = ({
  onClick,
  disabled,
  title,
  children,
  variant = 'default',
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: ReactNode;
  variant?: 'default' | 'primary' | 'compare';
}) => {
  const classes = {
    default: 'bg-white/10 hover:bg-white/20',
    primary: 'bg-indigo-500 hover:bg-indigo-400',
    compare: 'bg-violet-500 hover:bg-violet-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${classes[variant]}`}
    >
      {children}
    </button>
  );
};

export const NanosystemActionButtons = ({
  onDownload,
  onView3D,
  onCalculate,
  onAnalyse,
  onScatteringCalculate,
  onClose,
}: NanosystemActionButtonsProps) => (
  <div className="px-6 py-4 bg-white border-t border-gray-200 shrink-0">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onDownload}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
        >
          <CubeIcon className="h-4 w-4" />
          Download
        </button>
        {onView3D && (
          <button
            onClick={onView3D}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
          >
            <CubeTransparentIcon className="h-4 w-4" />
            3D
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onCalculate}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
        >
          <CalculatorIcon className="h-4 w-4" />
          Calculate
        </button>
        <button
          onClick={onAnalyse}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
        >
          <ChartBarIcon className="h-4 w-4" />
          Analyse
        </button>
        <button
          onClick={onScatteringCalculate}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
        >
          <BeakerIcon className="h-4 w-4" />
          {SCATTERING.theoryShort}
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  </div>
);

export const NanosystemDetailsView = ({
  nanosystem,
  onDownload,
  onCalculate,
  onAnalyse,
  onScatteringCalculate,
  calculations,
  isCalculationsLoading,
  isCalculationsError,
  onCalculationClick,
  radialAnalyses,
  isRadialAnalysesLoading,
  isRadialAnalysesError,
  onRadialAnalysisClick,
  scatteringCalculations,
  isScatteringCalculationsLoading,
  isScatteringCalculationsError,
  onScatteringCalculationClick,
  onViewChartSelected,
  onViewCalculationChartSelected,
  onViewCalculationChartAverageSelected,
  onViewScatteringChartSelected,
  onViewScatteringChartAverageSelected,
  onCompareScatteringChartSelected,
  onView3D,
  layout = 'modal',
  compactChrome = false,
  showTabBar = true,
  forceTab,
  pickerMode = false,
  initialTab,
  onTabChange,
  showFooterActions = true,
  headerExtra,
  onClose,
}: NanosystemDetailsViewProps) => {
  const [activeTab, setActiveTab] = useState<NanosystemTabId>(forceTab ?? initialTab ?? 'overview');
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<Set<string>>(new Set());
  const [selectedCalculationIds, setSelectedCalculationIds] = useState<Set<string>>(new Set());
  const [selectedScatteringCalculationIds, setSelectedScatteringCalculationIds] = useState<Set<string>>(new Set());

  const listMaxClass = layout === 'page' ? 'max-h-none min-h-[480px]' : 'max-h-[420px]';

  useEffect(() => {
    setActiveTab(forceTab ?? initialTab ?? 'overview');
  }, [nanosystem?.id, initialTab, forceTab]);

  const displayedTab = forceTab ?? activeTab;

  const handleTabChange = useCallback(
    (tab: NanosystemTabId) => {
      setActiveTab(tab);
      onTabChange?.(tab);
    },
    [onTabChange],
  );

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

  const toggleScatteringCalculationSelection = useCallback((e: React.MouseEvent, scatteringId: string) => {
    e.stopPropagation();
    setSelectedScatteringCalculationIds((prev) => {
      const next = new Set(prev);
      if (next.has(scatteringId)) next.delete(scatteringId);
      else next.add(scatteringId);
      return next;
    });
  }, []);

  const resetSelections = useCallback(() => {
    setSelectedAnalysisIds(new Set());
    setSelectedCalculationIds(new Set());
    setSelectedScatteringCalculationIds(new Set());
  }, []);

  const handleClose = useCallback(() => {
    resetSelections();
    onClose?.();
  }, [onClose, resetSelections]);

  const handleCompareScatteringChartSelected = useCallback(() => {
    const legacyIds = Array.from(selectedCalculationIds);
    const nanoIds = Array.from(selectedScatteringCalculationIds);
    if (legacyIds.length >= 1 && nanoIds.length >= 1 && onCompareScatteringChartSelected) {
      onCompareScatteringChartSelected(legacyIds, nanoIds);
    }
  }, [selectedCalculationIds, selectedScatteringCalculationIds, onCompareScatteringChartSelected]);

  if (!nanosystem) return null;

  const intersectionPlacementText =
    nanosystem.particleKind === 'Parallelepiped'
      ? nanosystem.disableIntersectionOptimizations
        ? 'SAT-only'
        : 'Optimized'
      : 'N/A (spheres)';

  const overviewItems = [
    { label: 'Kind', value: nanosystem.particleKind, icon: CubeIcon },
    { label: 'Placement', value: intersectionPlacementText, icon: CubeTransparentIcon },
    { label: 'Particles', value: nanosystem.particleCount.toLocaleString(), icon: HashtagIcon },
    { label: 'Global size', value: `${nanosystem.globalSize} nm`, icon: ScaleIcon },
    { label: 'Size range', value: `${nanosystem.minParticleSize}–${nanosystem.maxParticleSize} nm`, icon: ArrowsRightLeftIcon },
    { label: 'Concentration', value: nanosystem.numericalConcentration.toString(), icon: BeakerIcon },
    { label: 'Zone', value: `${nanosystem.generationZoneForm}, vol ${nanosystem.generationZoneVolume}`, icon: CubeIcon },
    { label: 'Excess / K / θ', value: `${nanosystem.excess} / ${nanosystem.k} / ${nanosystem.theta}`, icon: ScaleIcon },
    { label: 'Generated', value: formatGenerationDuration(nanosystem.generationStart, nanosystem.generationEnd), icon: ClockIcon },
    { label: 'Input date', value: formatDateTime(nanosystem.inputDate), icon: ClockIcon },
    { label: 'Series', value: nanosystem.seriesId, icon: HashtagIcon },
    { label: 'User', value: nanosystem.userId.toString(), icon: UserIcon },
  ];

  const canCompare =
    selectedCalculationIds.size >= 1 &&
    selectedScatteringCalculationIds.size >= 1 &&
    !!onCompareScatteringChartSelected;

  const renderLegacyTab = () => {
    if (isCalculationsLoading) return <LoadingState label="Loading calculations…" accentClass="border-indigo-500" />;
    if (isCalculationsError) return <EmptyState icon={CalculatorIcon} message="Calculations service unavailable" />;
    if (calculations.length === 0) return <EmptyState icon={CalculatorIcon} message={`No ${SCATTERING.model.toLowerCase()} yet. Run Calculate to add one.`} />;

    return (
      <>
        <p className="text-xs text-gray-500 mb-3">Select items to build charts. Checkboxes do not open details.</p>
        <ul className={`space-y-2 ${listMaxClass} overflow-y-auto pr-1`}>
          {calculations.map((calc) => (
            <li
              key={calc.id}
              className="p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex items-start gap-3"
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
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{formatDateTime(calc.inputDate)}</p>
                    <p className="text-xs font-mono text-indigo-600 truncate mt-0.5">{calc.id}</p>
                    <p className="text-xs text-gray-500 mt-1">Q: {calc.qVectorFrom}–{calc.qVectorTo}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 shrink-0">{SCATTERING.modelShort}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {(selectedCalculationIds.size > 0 || canCompare) && (
          <ChartToolbar>
            {onViewCalculationChartSelected && (
              <ToolbarButton
                onClick={() => onViewCalculationChartSelected(Array.from(selectedCalculationIds))}
                disabled={selectedCalculationIds.size === 0}
              >
                Chart ({selectedCalculationIds.size})
              </ToolbarButton>
            )}
            {onViewCalculationChartAverageSelected && (
              <ToolbarButton
                onClick={() => onViewCalculationChartAverageSelected(Array.from(selectedCalculationIds))}
                disabled={selectedCalculationIds.size < 2}
                title="Average when Q grid matches"
              >
                Average ({selectedCalculationIds.size})
              </ToolbarButton>
            )}
            {canCompare && (
              <ToolbarButton onClick={handleCompareScatteringChartSelected} variant="compare">
                {SCATTERING.compare} ({selectedCalculationIds.size} + {selectedScatteringCalculationIds.size})
              </ToolbarButton>
            )}
          </ChartToolbar>
        )}
      </>
    );
  };

  const renderRadialTab = () => {
    if (isRadialAnalysesLoading) return <LoadingState label="Loading radial analyses…" accentClass="border-purple-500" />;
    if (isRadialAnalysesError) return <EmptyState icon={ChartBarIcon} message="Radial analysis service unavailable" />;
    if (radialAnalyses.length === 0) return <EmptyState icon={ChartBarIcon} message="No radial analyses yet. Run Analyse to add one." />;

    return (
      <>
        <ul className={`space-y-2 ${listMaxClass} overflow-y-auto pr-1`}>
          {radialAnalyses.map((analysis) => (
            <li
              key={analysis.id}
              className="p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer flex items-start gap-3"
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
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{formatDateTime(analysis.startDate)}</p>
                    <p className="text-xs font-mono text-purple-600 truncate mt-0.5">{analysis.id}</p>
                    <p className="text-xs text-gray-500 mt-1">Points: {analysis.pointCount}, layers: {analysis.layerCount}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 shrink-0">Radial</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {selectedAnalysisIds.size > 0 && onViewChartSelected && (
          <ChartToolbar>
            <ToolbarButton onClick={() => onViewChartSelected(Array.from(selectedAnalysisIds))} variant="primary">
              Analyse chart ({selectedAnalysisIds.size})
            </ToolbarButton>
          </ChartToolbar>
        )}
      </>
    );
  };

  const renderSaxsTab = () => {
    if (isScatteringCalculationsLoading) return <LoadingState label={`Loading ${SCATTERING.theory.toLowerCase()}…`} accentClass="border-orange-500" />;
    if (isScatteringCalculationsError) return <EmptyState icon={BeakerIcon} message={`${SCATTERING.theory} service unavailable`} />;
    if (scatteringCalculations.length === 0) {
      return (
        <EmptyState
          icon={BeakerIcon}
          message={`No ${SCATTERING.theory.toLowerCase()} for this system yet. Use the ${SCATTERING.theoryShort} button below to run one.`}
        />
      );
    }

    return (
      <>
        <ul className={`space-y-2 ${listMaxClass} overflow-y-auto pr-1`}>
          {scatteringCalculations.map((calculation) => (
            <li
              key={calculation.id}
              className="p-3 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer flex items-start gap-3"
              onClick={() => onScatteringCalculationClick(calculation)}
            >
              <input
                type="checkbox"
                checked={selectedScatteringCalculationIds.has(calculation.id)}
                onChange={() => {}}
                onClick={(e) => toggleScatteringCalculationSelection(e, calculation.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                aria-label={`Select ${SCATTERING.theoryShort} calculation ${calculation.id}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{formatDateTime(calculation.startDate)}</p>
                    <p className="text-xs font-mono text-orange-600 truncate mt-0.5">{calculation.id}</p>
                    <p className="text-xs text-gray-500 mt-1">Q: {calculation.qVectorFrom}–{calculation.qVectorTo}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 shrink-0">
                    {calculation.calculationKind === 1 ? 'Sphere' : 'Strict'}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {(selectedScatteringCalculationIds.size > 0 || canCompare) && (
          <ChartToolbar>
            {onViewScatteringChartSelected && (
              <ToolbarButton
                onClick={() => onViewScatteringChartSelected(Array.from(selectedScatteringCalculationIds))}
                disabled={selectedScatteringCalculationIds.size === 0}
              >
                {SCATTERING.theory} chart ({selectedScatteringCalculationIds.size})
              </ToolbarButton>
            )}
            {onViewScatteringChartAverageSelected && (
              <ToolbarButton
                onClick={() => onViewScatteringChartAverageSelected(Array.from(selectedScatteringCalculationIds))}
                disabled={selectedScatteringCalculationIds.size < 2}
              >
                {SCATTERING.theoryShort} average ({selectedScatteringCalculationIds.size})
              </ToolbarButton>
            )}
            {canCompare && (
              <ToolbarButton onClick={handleCompareScatteringChartSelected} variant="compare">
                {SCATTERING.compare}
              </ToolbarButton>
            )}
          </ChartToolbar>
        )}
      </>
    );
  };

  return (
    <div
      className={`flex flex-col overflow-hidden ${
        layout === 'modal' ? 'max-h-[92vh]' : 'min-h-0 flex-1'
      }`}
    >
      {!compactChrome && (
      <div className="bg-gradient-to-r from-slate-800 to-indigo-900 px-6 py-4 flex justify-between items-start shrink-0">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CubeIcon className="h-6 w-6 shrink-0" />
            Nanosystem
          </h2>
          <p className="text-indigo-200 mt-1 text-sm truncate font-mono">{nanosystem.id}</p>
        </div>
        {headerExtra && <div className="shrink-0 ml-4">{headerExtra}</div>}
      </div>
      )}

      {showTabBar && (
      <div
        className={`border-b border-gray-200 bg-gray-50 px-4 overflow-x-auto shrink-0 ${
          layout === 'page' ? 'sticky top-0 z-10' : ''
        }`}
      >
        <div className="flex min-w-max">
          <TabButton
            active={displayedTab === 'overview'}
            label="Overview"
            onClick={() => handleTabChange('overview')}
            accentClass="text-slate-700"
          />
          <TabButton
            active={displayedTab === 'legacy'}
            label={SCATTERING.model}
            count={calculations.length}
            onClick={() => handleTabChange('legacy')}
            accentClass="text-indigo-600"
          />
          <TabButton
            active={displayedTab === 'radial'}
            label="Radial"
            count={radialAnalyses.length}
            onClick={() => handleTabChange('radial')}
            accentClass="text-purple-600"
          />
          <TabButton
            active={displayedTab === 'saxs'}
            label={SCATTERING.theory}
            count={scatteringCalculations.length}
            onClick={() => handleTabChange('saxs')}
            accentClass="text-orange-600"
          />
        </div>
      </div>
      )}

      <div className="p-6 overflow-y-auto flex-1 bg-gray-50/80">
        {pickerMode ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-indigo-700 mb-3">{SCATTERING.model}</h3>
              {renderLegacyTab()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-orange-700 mb-3">{SCATTERING.theory}</h3>
              {renderSaxsTab()}
            </div>
          </div>
        ) : (
          <>
        {displayedTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {overviewItems.map((item, index) => (
                <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
              ))}
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4 text-green-600" />
                Generation metrics
              </h3>
              <GenerationMetricsChart nanosystemId={nanosystem.id} />
            </div>
          </div>
        )}
        {displayedTab === 'legacy' && renderLegacyTab()}
        {displayedTab === 'radial' && renderRadialTab()}
        {displayedTab === 'saxs' && renderSaxsTab()}
          </>
        )}
      </div>

      {showFooterActions && (
        <NanosystemActionButtons
          onDownload={onDownload}
          onView3D={onView3D}
          onCalculate={onCalculate}
          onAnalyse={onAnalyse}
          onScatteringCalculate={onScatteringCalculate}
          onClose={onClose ? handleClose : undefined}
        />
      )}
    </div>
  );
};
