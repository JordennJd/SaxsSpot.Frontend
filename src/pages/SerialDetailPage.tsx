import {useEffect, useState, useCallback} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useToastContext} from '../contexts/ToastContext';

import {type ApiResponseListNanosystemDto, type NanosystemDto, type RadialAnalysisDto} from '../features/nanosystems/api/nanosystemTypes';
import type {
  CalculationDto,
  PlotAnalyseRequest,
  PlotChartRequest,
  RunCalculationRequest,
  SeriesCalculationGroupDto,
} from '../features/calculation/api/calculationTypes.ts';
import {fetchSeriesCalculationGroups, RunCalculation, RunSeriesCalculation} from '../features/calculation/api/calculationApi.ts';
import {runRadialAnalysis, fetchNanosystemList, fetchRadialAnalysisList, type RunRadialAnalysisRequest} from '../features/nanosystems/api/nanosystemApi.ts';
import {CalculationDetailsCard} from '../features/calculation/components/CalculationCard.tsx';
import {RadialAnalysisDetailsCard} from '../features/nanosystems/components/RadialAnalysisCard.tsx';
import {CalculationModal, NanosystemDetailsModal, NanosystemsTable, SeriesHeader, RadialAnalysisModal} from '../components/series';
import {NanosystemViewer3DModal} from '../features/nanosystem-viewer/NanosystemViewer3DModal';
import {useCalculationsData, useNanosystemsData, useSeriesData, useRadialAnalysisData} from '../hooks/useSeriesDetail';
import {downloadNanosystem} from '../utils/seriesUtils';

export const SeriesDetailPage = () => {
  const { guid: seriesId = '' } = useParams<{ guid: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const [page, setPage] = useState(1);
  const [calculationPage] = useState(1);
  const pageSize = 100;

  // Modal states
  const [selectedNanosystem, setSelectedNanosystem] = useState<NanosystemDto | null>(null);
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationDto | null>(null);
  const [selectedRadialAnalysis, setSelectedRadialAnalysis] = useState<RadialAnalysisDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculationModalOpen, setIsCalculationModalOpen] = useState(false);
  const [isRadialAnalysisDetailsModalOpen, setIsRadialAnalysisDetailsModalOpen] = useState(false);
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);
  const [isSeriesCalculateModalOpen, setIsSeriesCalculateModalOpen] = useState(false);
  const [isRadialAnalysisModalOpen, setIsRadialAnalysisModalOpen] = useState(false);
  const [isSeriesAverageChartLoading, setIsSeriesAverageChartLoading] = useState(false);
  const [isSeriesScatteringGroupsLoading, setIsSeriesScatteringGroupsLoading] = useState(false);
  const [seriesScatteringGroups, setSeriesScatteringGroups] = useState<SeriesCalculationGroupDto[]>([]);
  const [selectedSeriesScatteringGroupId, setSelectedSeriesScatteringGroupId] = useState<string | null>(null);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  // Calculation parameters
  const [calculationParams, setCalculationParams] = useState<RunCalculationRequest>({
    qVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.01,
      start: 0.02,
      end: 0.4,
    },
    phiVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.1,
      start: 0,
      end: 6.28,
    },
    thetaVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.1,
      start: -1,
      end: 1,
    },
    systemId: '',
    requestId: '',
    particleKind: 0,
  });

  // Radial analysis parameters
  const [radialAnalysisParams, setRadialAnalysisParams] = useState<RunRadialAnalysisRequest>({
    nanosystemId: '',
    pointCount: 10000,
    layerCount: 10,
  });

  // Data fetching
  const { data: series, isLoading: isSeriesLoading } = useSeriesData(seriesId);
  const { data: nanosystems, isLoading: isNanosystemsLoading } = useNanosystemsData(seriesId, page, pageSize);
  const { data: calculations, isLoading: isCalculationsLoading, isError: isCalculationsError } = useCalculationsData(
    selectedNanosystem?.id,
    calculationPage,
    pageSize,
  );
  const { data: radialAnalyses, isLoading: isRadialAnalysesLoading, isError: isRadialAnalysesError } = useRadialAnalysisData(
    selectedNanosystem?.id,
    calculationPage,
    pageSize,
  );

  useEffect(() => {
    const loadSeriesGroups = async () => {
      if (!seriesId) return;
      setIsSeriesScatteringGroupsLoading(true);
      try {
        const res = await fetchSeriesCalculationGroups(seriesId);
        const groups = res.result ?? [];
        setSeriesScatteringGroups(groups);
        setSelectedSeriesScatteringGroupId(groups[0]?.groupId ?? null);
      } catch (error) {
        console.error('Error loading series calculation groups:', error);
        showError('Series groups', 'Failed to load scattering calculation groups for this series.');
      } finally {
        setIsSeriesScatteringGroupsLoading(false);
      }
    };

    loadSeriesGroups();
  }, [seriesId, showError]);

  const selectedSeriesScatteringGroup = seriesScatteringGroups.find(
    (g) => g.groupId === selectedSeriesScatteringGroupId,
  );

  // Event handlers
  const openNanosystemDetails = (system: NanosystemDto) => {
    setSelectedNanosystem(system);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNanosystem(null);
  };

  const openCalculationDetails = (calculation: CalculationDto) => {
    setSelectedCalculation(calculation);
    setIsCalculationModalOpen(true);
  };

  const openRadialAnalysisDetails = (analysis: RadialAnalysisDto) => {
    setSelectedRadialAnalysis(analysis);
    setIsRadialAnalysisDetailsModalOpen(true);
  };

  const openCalculateModal = (seriesId: string | null = null) => {
    if (selectedNanosystem || seriesId) {
      setCalculationParams((prev: RunCalculationRequest) => ({
        ...prev,
        systemId: seriesId ?? selectedNanosystem!.id,
      }));
      if(seriesId === null){
        setIsCalculateModalOpen(true);
      }
      else{
        setIsSeriesCalculateModalOpen(true);
      }
    }
  };

  const closeCalculateModal = () => {
    setIsCalculateModalOpen(false);
    setIsSeriesCalculateModalOpen(false);
  };

  const openRadialAnalysisModal = () => {
    if (selectedNanosystem) {
      setRadialAnalysisParams((prev: RunRadialAnalysisRequest) => ({
        ...prev,
        nanosystemId: selectedNanosystem.id,
      }));
      setIsRadialAnalysisModalOpen(true);
    }
  };

  const closeRadialAnalysisModal = () => {
    setIsRadialAnalysisModalOpen(false);
  };

  const handleCalculate = async (isSeries: boolean = false) => {
    try {
      console.log('Calculation started:', calculationParams);

      calculationParams.particleKind = selectedNanosystem?.particleKind == 'Parallelepiped' ? 1 : 0;
      if(isSeries) {
        await RunSeriesCalculation(calculationParams);
      } else {
        await RunCalculation(calculationParams);
      }

      closeCalculateModal();
      showSuccess('Calculation Started', 'Your calculation has been queued and will begin processing shortly.');
    } catch (error) {
      console.error('Error starting calculation:', error);
      showError('Calculation Failed', 'Unable to start calculation. Please try again.');
    }
  };

  const handleParamChange = (path: string, value: unknown) => {
    setCalculationParams((prev: RunCalculationRequest) => {
      const keys = path.split('.');
      const newParams = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newParams;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newParams;
    });
  };

  const handleRadialAnalysisParamChange = (path: string, value: unknown) => {
    setRadialAnalysisParams((prev: RunRadialAnalysisRequest) => {
      const keys = path.split('.');
      const newParams = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newParams;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newParams;
    });
  };

  const handleRadialAnalysis = async () => {
    try {
      console.log('Radial analysis started:', radialAnalysisParams);
      await runRadialAnalysis(radialAnalysisParams);
      closeRadialAnalysisModal();
      showSuccess('Radial Analysis Started', 'Your radial analysis has been queued and will begin processing shortly.');
    } catch (error) {
      console.error('Error starting radial analysis:', error);
      showError('Radial Analysis Failed', 'Unable to start radial analysis. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (selectedNanosystem) {
      try {
        await downloadNanosystem(selectedNanosystem.id);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const handleViewChartSelected = useCallback((analysisIds: string[]) => {
    const request: PlotAnalyseRequest = {
      RadialAnalysisIds: analysisIds,
      ChartTitle: 'Radial Analysis',
      XAxis: 'r, nm',
      YAxis: 'Numerical concentration',
      ScaleMethodsX: 0,
      ScaleMethodsY: 0,
    };
    navigate(`/radial-analyses/${analysisIds[0]}/chart`, { state: { request } });
  }, [navigate]);

  const handleViewCalculationChartSelected = useCallback((calculationIds: string[]) => {
    const request: PlotChartRequest = {
      CalculatesId: calculationIds,
      ChartTitle: 'Scattering',
      XAxis: 'Q',
      YAxis: 'I',
      ScaleMethodsX: 'Log',
      ScaleMethodsY: 'Log',
    };
    navigate(`/calculations/${calculationIds[0]}/chart`, { state: { request } });
  }, [navigate]);

  const handleViewCalculationChartAverageSelected = useCallback((calculationIds: string[]) => {
    const request: PlotChartRequest = {
      CalculatesId: calculationIds,
      ChartTitle: 'Scattering (average)',
      XAxis: 'Q',
      YAxis: 'I',
      ScaleMethodsX: 'Log',
      ScaleMethodsY: 'Log',
    };
    navigate(`/calculations/${calculationIds[0]}/chart`, { state: { request, isAverage: true } });
  }, [navigate]);

  const handleViewSeriesScatteringAverageChartSelected = useCallback(() => {
    if (!selectedSeriesScatteringGroup) return;
    if (selectedSeriesScatteringGroup.calculationIds.length === 0) return;
    const request: PlotChartRequest = {
      CalculatesId: selectedSeriesScatteringGroup.calculationIds,
      ChartTitle: 'Scattering (average)',
      XAxis: 'Q',
      YAxis: 'I',
      ScaleMethodsX: 'Log',
      ScaleMethodsY: 'Log',
    };
    navigate(`/calculations/${selectedSeriesScatteringGroup.calculationIds[0]}/chart`, {
      state: { request, isAverage: true },
    });
  }, [navigate, selectedSeriesScatteringGroup]);

  const handleViewSeriesAverageChart = useCallback(async () => {
    setIsSeriesAverageChartLoading(true);
    try {
      const res = await fetchNanosystemList(`seriesId=${seriesId}`, 1, 500);
      const nanosystems = res.result.data;
      if (nanosystems.length === 0) {
        showError('No systems', 'This series has no nanosystems.');
        return;
      }
      const firstAnalysisIds = await Promise.all(
        nanosystems.map((ns) =>
          fetchRadialAnalysisList(ns.id, 1, 1, undefined, 'startDate').then(
            (r) => r.result.data[0]?.id,
          ),
        ),
      );
      const ids = firstAnalysisIds.filter((id): id is string => id != null);
      if (ids.length === 0) {
        showError('No analyses', 'No radial analyses found for systems in this series. Run radial analysis for at least one system.');
        return;
      }
      const request: PlotAnalyseRequest = {
        RadialAnalysisIds: ids,
        ChartTitle: 'Series average (first analyses)',
        XAxis: 'r, nm',
        YAxis: 'Numerical concentration',
        ScaleMethodsX: 0,
        ScaleMethodsY: 0,
      };
      navigate(`/radial-analyses/${ids[0]}/chart`, { state: { request, isAverage: true } });
    } catch (error) {
      console.error('Error loading series average chart:', error);
      showError('Chart error', 'Failed to load first analyses for the series.');
    } finally {
      setIsSeriesAverageChartLoading(false);
    }
  }, [seriesId, navigate, showError]);

  // Loading and error states
  if (isSeriesLoading) {
    return <div className="text-center py-8">Loading series data...</div>;
  }

  if (!series) {
    return <div className="text-center py-8">Series not found</div>;
  }

  return (
    <div className="space-y-6">
      <SeriesHeader series={series} />
      
      {/* Calculation Action Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Calculate?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Start SAXS calculation for this series. The process will calculate by all nanosystems in the series.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 font-semibold text-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden"
              onClick={() => openCalculateModal(seriesId)}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon with animation */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold">Start Calculation</div>
                  <div className="text-xs opacity-90 font-normal">Launch SAXS calculate</div>
                </div>
              </div>
              
              {/* Loading indicator (hidden by default) */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Series average chart: one graph = average of first analysis per system */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chart: average of first analyses
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Build one chart with the average value across the first radial analysis of each system in this series.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              disabled={isSeriesAverageChartLoading}
              onClick={handleViewSeriesAverageChart}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-800 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 font-semibold text-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="text-left">
                  <div className="font-bold">
                    {isSeriesAverageChartLoading ? 'Loading…' : 'View series average chart'}
                  </div>
                  <div className="text-xs opacity-90 font-normal">First analysis per system, averaged</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Series scattering average: average by equal input parameters */}
      <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chart: average intensity by input parameters
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Choose one parameter set; we average scattering intensity across systems that match it.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              disabled={isSeriesScatteringGroupsLoading || !selectedSeriesScatteringGroup || selectedSeriesScatteringGroup.calculationIds.length === 0}
              onClick={handleViewSeriesScatteringAverageChartSelected}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-700 text-white rounded-xl shadow-lg hover:from-indigo-700 hover:to-cyan-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 font-semibold text-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="text-left">
                  <div className="font-bold">
                    {isSeriesScatteringGroupsLoading ? 'Loading…' : 'View averaged intensity'}
                  </div>
                  <div className="text-xs opacity-90 font-normal">
                    {selectedSeriesScatteringGroup
                      ? `Systems: ${selectedSeriesScatteringGroup.systemsCount}`
                      : 'Select a group'}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {isSeriesScatteringGroupsLoading ? (
          <div className="mt-4 text-center text-gray-600 dark:text-gray-300">
            Loading calculation groups...
          </div>
        ) : seriesScatteringGroups.length > 0 ? (
          <div className="mt-5 space-y-2">
            {seriesScatteringGroups.map((group) => (
              <label
                key={group.groupId}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSeriesScatteringGroupId === group.groupId
                    ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-300 dark:bg-indigo-900/20'
                    : 'border-gray-200 hover:border-indigo-300 dark:border-gray-800 dark:hover:border-indigo-300/60'
                }`}
              >
                <input
                  type="radio"
                  name="series-scattering-group"
                  checked={selectedSeriesScatteringGroupId === group.groupId}
                  onChange={() => setSelectedSeriesScatteringGroupId(group.groupId)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        Q: {group.parameters.qVectorFrom}-{group.parameters.qVectorTo}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Phi: {group.parameters.phiVectorFrom == null ? '—' : `${group.parameters.phiVectorFrom}-${group.parameters.phiVectorTo}`}
                        {' | '}
                        Theta: {group.parameters.thetaVectorFrom == null ? '—' : `${group.parameters.thetaVectorFrom}-${group.parameters.thetaVectorTo}`}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {group.systemsCount} systems
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-center text-gray-600 dark:text-gray-300">
            No grouped calculations found yet for this series.
          </div>
        )}
      </div>

      <NanosystemsTable
        nanosystems={nanosystems as ApiResponseListNanosystemDto}
        isLoading={isNanosystemsLoading}
        onNanosystemClick={openNanosystemDetails}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />


      <NanosystemDetailsModal
        nanosystem={selectedNanosystem}
        isOpen={isModalOpen}
        onClose={closeModal}
        onDownload={handleDownload}
        onCalculate={() => openCalculateModal()}
        onAnalyse={openRadialAnalysisModal}
        calculations={calculations || []}
        isCalculationsLoading={isCalculationsLoading}
        isCalculationsError={isCalculationsError}
        onCalculationClick={openCalculationDetails}
        radialAnalyses={radialAnalyses || []}
        isRadialAnalysesLoading={isRadialAnalysesLoading}
        isRadialAnalysesError={isRadialAnalysesError}
        onRadialAnalysisClick={openRadialAnalysisDetails}
        onViewChartSelected={handleViewChartSelected}
        onViewCalculationChartSelected={handleViewCalculationChartSelected}
        onViewCalculationChartAverageSelected={handleViewCalculationChartAverageSelected}
        onView3D={() => setIs3DModalOpen(true)}
      />

      <CalculationModal
        isOpen={isCalculateModalOpen}
        onClose={closeCalculateModal}
        calculationParams={calculationParams}
        onParamChange={handleParamChange}
        onCalculate={handleCalculate}

      />

      <CalculationModal
          isOpen={isSeriesCalculateModalOpen}
          onClose={closeCalculateModal}
          calculationParams={{...calculationParams, systemId: seriesId}}
          onParamChange={handleParamChange}
          onCalculate={handleCalculate}
          isSeries={true}
      />

      <RadialAnalysisModal
        isOpen={isRadialAnalysisModalOpen}
        onClose={closeRadialAnalysisModal}
        analysisParams={radialAnalysisParams}
        onParamChange={handleRadialAnalysisParamChange}
        onAnalyse={handleRadialAnalysis}
      />

      <NanosystemViewer3DModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        nanosystem={selectedNanosystem}
      />

      {selectedCalculation && (
        <CalculationDetailsCard
          calculation={selectedCalculation}
          isOpen={isCalculationModalOpen}
          onClose={() => setIsCalculationModalOpen(false)}
        />
      )}

      {selectedRadialAnalysis && (
        <RadialAnalysisDetailsCard
          analysis={selectedRadialAnalysis}
          isOpen={isRadialAnalysisDetailsModalOpen}
          onClose={() => setIsRadialAnalysisDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};