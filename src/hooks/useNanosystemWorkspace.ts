import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToastContext } from '../contexts/ToastContext';
import type { NanosystemDto, RadialAnalysisDto, ScatteringCalculationDto } from '../features/nanosystems/api/nanosystemTypes';
import type { CalculationDto, PlotAnalyseRequest, PlotChartRequest, RunCalculationRequest } from '../features/calculation/api/calculationTypes';
import { RunCalculation } from '../features/calculation/api/calculationApi';
import {
  runRadialAnalysis,
  runScatteringCalculation,
  type RunRadialAnalysisRequest,
  type RunScatteringCalculationRequest,
} from '../features/nanosystems/api/nanosystemApi';
import { SCATTERING } from '@/lib/scatteringLabels';
import {
  useCalculationsData,
  useRadialAnalysisData,
  useScatteringCalculationData,
} from './useSeriesDetail';
import { downloadNanosystem } from '../utils/seriesUtils';
import type { NanosystemDetailsViewProps } from '../components/series/NanosystemDetailsView';

const defaultCalculationParams: RunCalculationRequest = {
  qVectorSpaceParameters: { spaceMethod: 0, scaleMethod: 0, spaceParameter: 0.01, start: 0.02, end: 0.4 },
  phiVectorSpaceParameters: { spaceMethod: 0, scaleMethod: 0, spaceParameter: 0.1, start: 0, end: 6.28 },
  thetaVectorSpaceParameters: { spaceMethod: 0, scaleMethod: 0, spaceParameter: 0.1, start: -1, end: 1 },
  systemId: '',
  requestId: '',
  particleKind: 0,
};

export function useNanosystemWorkspace(nanosystem: NanosystemDto | null | undefined, seriesId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastContext();
  const pageSize = 100;
  const calculationPage = 1;

  const [selectedCalculation, setSelectedCalculation] = useState<CalculationDto | null>(null);
  const [selectedRadialAnalysis, setSelectedRadialAnalysis] = useState<RadialAnalysisDto | null>(null);
  const [selectedScatteringCalculation, setSelectedScatteringCalculation] = useState<ScatteringCalculationDto | null>(null);
  const [isCalculationModalOpen, setIsCalculationModalOpen] = useState(false);
  const [isRadialAnalysisDetailsModalOpen, setIsRadialAnalysisDetailsModalOpen] = useState(false);
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);
  const [isRadialAnalysisModalOpen, setIsRadialAnalysisModalOpen] = useState(false);
  const [isScatteringCalculationModalOpen, setIsScatteringCalculationModalOpen] = useState(false);
  const [isScatteringCalculationDetailsModalOpen, setIsScatteringCalculationDetailsModalOpen] = useState(false);
  const [isRunningScatteringCalculation, setIsRunningScatteringCalculation] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  const [calculationParams, setCalculationParams] = useState<RunCalculationRequest>(defaultCalculationParams);
  const [radialAnalysisParams, setRadialAnalysisParams] = useState<RunRadialAnalysisRequest>({
    nanosystemId: '',
    pointCount: 10000,
    layerCount: 10,
  });
  const [scatteringCalculationParams, setScatteringCalculationParams] = useState<RunScatteringCalculationRequest>({
    nanosystemId: '',
    qSpaceParameters: { spaceMethod: 0, scaleMethod: 1, spaceParameter: 20, start: 0.02, end: 0.4 },
    excess: 0,
  });

  const { data: calculations, isLoading: isCalculationsLoading, isError: isCalculationsError } = useCalculationsData(
    nanosystem?.id,
    calculationPage,
    pageSize,
  );
  const { data: radialAnalyses, isLoading: isRadialAnalysesLoading, isError: isRadialAnalysesError } = useRadialAnalysisData(
    nanosystem?.id,
    calculationPage,
    pageSize,
  );
  const { data: scatteringCalculations, isLoading: isScatteringCalculationsLoading, isError: isScatteringCalculationsError } =
    useScatteringCalculationData(nanosystem?.id, calculationPage, pageSize);

  const openCalculationDetails = useCallback((calculation: CalculationDto) => {
    setSelectedCalculation(calculation);
    setIsCalculationModalOpen(true);
  }, []);

  const openRadialAnalysisDetails = useCallback((analysis: RadialAnalysisDto) => {
    setSelectedRadialAnalysis(analysis);
    setIsRadialAnalysisDetailsModalOpen(true);
  }, []);

  const openScatteringCalculationDetails = useCallback((calculation: ScatteringCalculationDto) => {
    setSelectedScatteringCalculation(calculation);
    setIsScatteringCalculationDetailsModalOpen(true);
  }, []);

  const openCalculateModal = useCallback(() => {
    if (!nanosystem) return;
    setCalculationParams((prev) => ({ ...prev, systemId: nanosystem.id }));
    setIsCalculateModalOpen(true);
  }, [nanosystem]);

  const closeCalculateModal = useCallback(() => setIsCalculateModalOpen(false), []);

  const openRadialAnalysisModal = useCallback(() => {
    if (!nanosystem) return;
    setRadialAnalysisParams((prev) => ({ ...prev, nanosystemId: nanosystem.id }));
    setIsRadialAnalysisModalOpen(true);
  }, [nanosystem]);

  const closeRadialAnalysisModal = useCallback(() => setIsRadialAnalysisModalOpen(false), []);

  const openScatteringCalculationModal = useCallback(() => {
    if (!nanosystem) return;
    setScatteringCalculationParams((prev) => ({ ...prev, nanosystemId: nanosystem.id }));
    setIsScatteringCalculationModalOpen(true);
  }, [nanosystem]);

  const closeScatteringCalculationModal = useCallback(() => setIsScatteringCalculationModalOpen(false), []);

  const handleDownload = useCallback(async () => {
    if (!nanosystem) return;
    try {
      await downloadNanosystem(nanosystem.id);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [nanosystem]);

  const handleViewChartSelected = useCallback((analysisIds: string[]) => {
    const request: PlotAnalyseRequest = {
      RadialAnalysisIds: analysisIds,
      ChartTitle: 'Radial Analysis',
      XAxis: 'r, nm',
      YAxis: 'Numerical concentration',
      ScaleMethodsX: 0,
      ScaleMethodsY: 0,
    };
    const params = new URLSearchParams();
    params.set('analysisIds', analysisIds.join(','));
    params.set('isAverage', '0');
    params.set('seriesId', seriesId);
    navigate(`/radial-analyses/${analysisIds[0]}/chart?${params.toString()}`, { state: { request } });
  }, [navigate, seriesId]);

  const handleViewCalculationChartSelected = useCallback((calculationIds: string[]) => {
    const request: PlotChartRequest = {
      CalculatesId: calculationIds,
      ChartTitle: 'Scattering',
      XAxis: 'Q',
      YAxis: 'I',
      ScaleMethodsX: 'Log',
      ScaleMethodsY: 'Log',
    };
    const params = new URLSearchParams();
    params.set('calcIds', calculationIds.join(','));
    params.set('isAverage', '0');
    params.set('seriesId', seriesId);
    navigate(`/calculations/${calculationIds[0]}/chart?${params.toString()}`, { state: { request } });
  }, [navigate, seriesId]);

  const handleViewCalculationChartAverageSelected = useCallback((calculationIds: string[]) => {
    const request: PlotChartRequest = {
      CalculatesId: calculationIds,
      ChartTitle: 'Scattering (average)',
      XAxis: 'Q',
      YAxis: 'I',
      ScaleMethodsX: 'Log',
      ScaleMethodsY: 'Log',
    };
    const params = new URLSearchParams();
    params.set('calcIds', calculationIds.join(','));
    params.set('isAverage', '1');
    params.set('seriesId', seriesId);
    navigate(`/calculations/${calculationIds[0]}/chart?${params.toString()}`, { state: { request, isAverage: true } });
  }, [navigate, seriesId]);

  const handleViewScatteringChartSelected = useCallback((scatteringIds: string[]) => {
    const request = {
      ScatteringCalculationIds: scatteringIds,
      ChartTitle: SCATTERING.theory,
      XAxis: 'Q',
      YAxis: 'I',
      ScaleMethodsX: 'Log',
      ScaleMethodsY: 'Log',
    };
    const params = new URLSearchParams();
    params.set('scatteringIds', scatteringIds.join(','));
    params.set('isAverage', '0');
    params.set('seriesId', seriesId);
    navigate(`/scattering-calculations/${scatteringIds[0]}/chart?${params.toString()}`, { state: { request } });
  }, [navigate, seriesId]);

  const handleViewScatteringChartAverageSelected = useCallback((scatteringIds: string[]) => {
    const request = {
      ScatteringCalculationIds: scatteringIds,
      ChartTitle: `${SCATTERING.theory} (average)`,
      XAxis: 'Q',
      YAxis: 'I',
      ScaleMethodsX: 'Log',
      ScaleMethodsY: 'Log',
    };
    const params = new URLSearchParams();
    params.set('scatteringIds', scatteringIds.join(','));
    params.set('isAverage', '1');
    params.set('seriesId', seriesId);
    navigate(`/scattering-calculations/${scatteringIds[0]}/chart?${params.toString()}`, { state: { request, isAverage: true } });
  }, [navigate, seriesId]);

  const handleCompareScatteringChartSelected = useCallback((legacyIds: string[], nanoIds: string[]) => {
    const request = {
      LegacyCalculationIds: legacyIds,
      NanoScatteringIds: nanoIds,
      ChartTitle: SCATTERING.compare,
      XAxis: 'Q',
      YAxis: 'I',
      AverageLegacy: legacyIds.length >= 2,
      AverageNano: nanoIds.length >= 2,
      ScaleMethodsX: 'Log',
      ScaleMethodsY: 'Log',
    };
    const params = new URLSearchParams();
    params.set('legacyIds', legacyIds.join(','));
    params.set('nanoIds', nanoIds.join(','));
    params.set('averageLegacy', legacyIds.length >= 2 ? '1' : '0');
    params.set('averageNano', nanoIds.length >= 2 ? '1' : '0');
    params.set('seriesId', seriesId);
    navigate(`/scattering-calculations/compare/chart?${params.toString()}`, { state: { request } });
  }, [navigate, seriesId]);

  const handleScatteringCalculationParamChange = useCallback((path: string, value: unknown) => {
    setScatteringCalculationParams((prev) => {
      const next = { ...prev, qSpaceParameters: { ...prev.qSpaceParameters } };
      const parts = path.split('.');
      if (parts.length === 1) return { ...next, [parts[0]]: value };
      if (parts.length === 2 && parts[0] === 'qSpaceParameters') {
        return { ...next, qSpaceParameters: { ...next.qSpaceParameters, [parts[1]]: value } };
      }
      return next;
    });
  }, []);

  const handleScatteringCalculation = useCallback(async () => {
    try {
      setIsRunningScatteringCalculation(true);
      const operationId = await runScatteringCalculation(scatteringCalculationParams);
      closeScatteringCalculationModal();
      showSuccess(`${SCATTERING.theory} started. Operation ID: ${operationId}`);
      await queryClient.invalidateQueries({ queryKey: ['scatteringCalculations', nanosystem?.id] });
    } catch (error) {
      showError(error instanceof Error ? error.message : `Failed to start ${SCATTERING.theory.toLowerCase()}`);
    } finally {
      setIsRunningScatteringCalculation(false);
    }
  }, [scatteringCalculationParams, closeScatteringCalculationModal, showSuccess, queryClient, nanosystem?.id, showError]);

  const handleCalculate = useCallback(async () => {
    if (!nanosystem) return;
    try {
      const params = {
        ...calculationParams,
        particleKind: nanosystem.particleKind === 'Parallelepiped' ? 1 : 0,
      };
      await RunCalculation(params);
      closeCalculateModal();
      showSuccess('Calculation Started', 'Your calculation has been queued and will begin processing shortly.');
    } catch (error) {
      console.error('Error starting calculation:', error);
      showError('Calculation Failed', 'Unable to start calculation. Please try again.');
    }
  }, [nanosystem, calculationParams, closeCalculateModal, showSuccess, showError]);

  const handleParamChange = useCallback((path: string, value: unknown) => {
    setCalculationParams((prev) => {
      const keys = path.split('.');
      const newParams = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newParams;
      for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
      current[keys[keys.length - 1]] = value;
      return newParams;
    });
  }, []);

  const handleRadialAnalysisParamChange = useCallback((path: string, value: unknown) => {
    setRadialAnalysisParams((prev) => {
      const keys = path.split('.');
      const newParams = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newParams;
      for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
      current[keys[keys.length - 1]] = value;
      return newParams;
    });
  }, []);

  const handleRadialAnalysis = useCallback(async () => {
    try {
      await runRadialAnalysis(radialAnalysisParams);
      closeRadialAnalysisModal();
      showSuccess('Radial Analysis Started', 'Your radial analysis has been queued and will begin processing shortly.');
    } catch (error) {
      console.error('Error starting radial analysis:', error);
      showError('Radial Analysis Failed', 'Unable to start radial analysis. Please try again.');
    }
  }, [radialAnalysisParams, closeRadialAnalysisModal, showSuccess, showError]);

  const viewProps: Omit<NanosystemDetailsViewProps, 'nanosystem' | 'layout' | 'initialTab' | 'onTabChange' | 'showFooterActions' | 'headerExtra'> = {
    onDownload: handleDownload,
    onCalculate: openCalculateModal,
    onAnalyse: openRadialAnalysisModal,
    onScatteringCalculate: openScatteringCalculationModal,
    calculations: calculations || [],
    isCalculationsLoading,
    isCalculationsError,
    onCalculationClick: openCalculationDetails,
    radialAnalyses: radialAnalyses || [],
    isRadialAnalysesLoading,
    isRadialAnalysesError,
    onRadialAnalysisClick: openRadialAnalysisDetails,
    scatteringCalculations: scatteringCalculations || [],
    isScatteringCalculationsLoading,
    isScatteringCalculationsError,
    onScatteringCalculationClick: openScatteringCalculationDetails,
    onViewChartSelected: handleViewChartSelected,
    onViewCalculationChartSelected: handleViewCalculationChartSelected,
    onViewCalculationChartAverageSelected: handleViewCalculationChartAverageSelected,
    onViewScatteringChartSelected: handleViewScatteringChartSelected,
    onViewScatteringChartAverageSelected: handleViewScatteringChartAverageSelected,
    onCompareScatteringChartSelected: handleCompareScatteringChartSelected,
    onView3D: () => setIs3DModalOpen(true),
  };

  return {
    viewProps,
    nanosystem,
    modals: {
      selectedCalculation,
      setIsCalculationModalOpen,
      isCalculationModalOpen,
      selectedRadialAnalysis,
      isRadialAnalysisDetailsModalOpen,
      setIsRadialAnalysisDetailsModalOpen,
      selectedScatteringCalculation,
      isScatteringCalculationDetailsModalOpen,
      setIsScatteringCalculationDetailsModalOpen,
      isCalculateModalOpen,
      closeCalculateModal,
      calculationParams,
      handleParamChange,
      handleCalculate,
      isRadialAnalysisModalOpen,
      closeRadialAnalysisModal,
      radialAnalysisParams,
      handleRadialAnalysisParamChange,
      handleRadialAnalysis,
      isScatteringCalculationModalOpen,
      closeScatteringCalculationModal,
      scatteringCalculationParams,
      handleScatteringCalculationParamChange,
      handleScatteringCalculation,
      isRunningScatteringCalculation,
      is3DModalOpen,
      setIs3DModalOpen,
    },
  };
}
