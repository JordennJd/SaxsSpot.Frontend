import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { type NanosystemDto } from '../features/nanosystems/api/nanosystemTypes';
import type { CalculationDto, RunCalculationRequest } from "../features/calculation/api/calculationTypes.ts";
import { RunCalculation } from "../features/calculation/api/calculationApi.ts";
import { CalculationDetailsCard } from "../features/calculation/components/CalculationCard.tsx";
import { 
  SeriesHeader, 
  NanosystemsTable, 
  NanosystemDetailsModal, 
  CalculationModal 
} from '../components/series';
import { 
  useSeriesData, 
  useNanosystemsData, 
  useCalculationsData 
} from '../hooks/useSeriesDetail';
import { downloadNanosystem } from '../utils/seriesUtils';



// Main Component
export const SeriesDetailPage = () => {
  const { guid: seriesId = "" } = useParams<{ guid: string }>();
  const [page, setPage] = useState(1);
  const [calculationPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [selectedNanosystem, setSelectedNanosystem] = useState<NanosystemDto | null>(null);
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculationModalOpen, setIsCalculationModalOpen] = useState(false);
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);

  // Calculation parameters
  const [calculationParams, setCalculationParams] = useState<RunCalculationRequest>({
    qVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.01,
      start: 0.02,
      end: 0.4
    },
    phiVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.1,
      start: -1,
      end: 1
    },
    thetaVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.1,
      start: 0,
      end: 6.28
    },
    systemId: "",
    requestId: ""
  });

  // Data fetching
  const { data: series, isLoading: isSeriesLoading } = useSeriesData(seriesId);
  const { data: nanosystems, isLoading: isNanosystemsLoading } = useNanosystemsData(seriesId, page, pageSize);
  const { data: calculations, isLoading: isCalculationsLoading } = useCalculationsData(
    selectedNanosystem?.id,
    calculationPage,
    pageSize
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

  const openCalculateModal = () => {
    if (selectedNanosystem) {
      setCalculationParams(prev => ({
        ...prev,
        systemId: selectedNanosystem.id
      }));
      setIsCalculateModalOpen(true);
    }
  };

  const closeCalculateModal = () => {
    setIsCalculateModalOpen(false);
  };

  const handleCalculate = async () => {
    try {
      console.log('Calculation started:', calculationParams);
      await RunCalculation(calculationParams);
      closeCalculateModal();
      alert('Calculation started');
    } catch (error) {
      console.error('Error starting calculation:', error);
      alert('Error starting calculation');
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

      <NanosystemsTable
        nanosystems={nanosystems || { data: [], count: 0, page: 1, pageSize: 10 }}
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