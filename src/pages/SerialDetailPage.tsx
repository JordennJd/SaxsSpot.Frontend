import {useState} from 'react';
import {useParams} from 'react-router-dom';
import {useToastContext} from '../contexts/ToastContext';

import {type ApiResponseListNanosystemDto, type NanosystemDto} from '../features/nanosystems/api/nanosystemTypes';
import type {CalculationDto, RunCalculationRequest} from '../features/calculation/api/calculationTypes.ts';
import {RunCalculation, RunSeriesCalculation} from '../features/calculation/api/calculationApi.ts';
import {CalculationDetailsCard} from '../features/calculation/components/CalculationCard.tsx';
import {CalculationModal, NanosystemDetailsModal, NanosystemsTable, SeriesHeader} from '../components/series';
import {useCalculationsData, useNanosystemsData, useSeriesData} from '../hooks/useSeriesDetail';
import {downloadNanosystem} from '../utils/seriesUtils';

export const SeriesDetailPage = () => {
  const { guid: seriesId = '' } = useParams<{ guid: string }>();
  const { showSuccess, showError } = useToastContext();
  const [page, setPage] = useState(1);
  const [calculationPage] = useState(1);
  const pageSize = 100;

  // Modal states
  const [selectedNanosystem, setSelectedNanosystem] = useState<NanosystemDto | null>(null);
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculationModalOpen, setIsCalculationModalOpen] = useState(false);
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);
  const [isSeriesCalculateModalOpen, setIsSeriesCalculateModalOpen] = useState(false);

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

  // Data fetching
  const { data: series, isLoading: isSeriesLoading } = useSeriesData(seriesId);
  const { data: nanosystems, isLoading: isNanosystemsLoading } = useNanosystemsData(seriesId, page, pageSize);
  const { data: calculations, isLoading: isCalculationsLoading } = useCalculationsData(
    selectedNanosystem?.id,
    calculationPage,
    pageSize,
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

  const openCalculateModal = (seriesId: string | null = null) => {
    if (selectedNanosystem || seriesId) {
      setCalculationParams(prev => ({
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

  const handleCalculate = async (isSeries: boolean = false) => {
    try {
      console.log('Calculation started:', calculationParams);

      calculationParams.particleKind = selectedNanosystem?.particleKind == 'Parallelepiped' ? 1 : 0;
      if(isSeries) {
        await RunSeriesCalculation(calculationParams);
      } else await RunCalculation(calculationParams);

      closeCalculateModal();
      showSuccess('Calculation Started', 'Your calculation has been queued and will begin processing shortly.');
    } catch (error) {
      console.error('Error starting calculation:', error);
      showError('Calculation Failed', 'Unable to start calculation. Please try again.');
    }
  };

  const handleParamChange = (path: string, value: unknown) => {
    setCalculationParams(prev => {
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

  const handleDownload = async () => {
    if (selectedNanosystem) {
      try {
        await downloadNanosystem(selectedNanosystem.id);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

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
      <button
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          onClick={() => openCalculateModal(seriesId)}>Start calculation
      </button>
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
        onCalculate={openCalculateModal}
        calculations={calculations || []}
        isCalculationsLoading={isCalculationsLoading}
        onCalculationClick={openCalculationDetails}
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
          onCalculate={() => handleCalculate(true)}
      />

      {selectedCalculation && (
        <CalculationDetailsCard
          calculation={selectedCalculation}
          isOpen={isCalculationModalOpen}
          onClose={() => setIsCalculationModalOpen(false)}
        />
      )}
    </div>
  );
};