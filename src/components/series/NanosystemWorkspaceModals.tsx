import { CalculationDetailsCard } from '../../features/calculation/components/CalculationCard';
import { RadialAnalysisDetailsCard } from '../../features/nanosystems/components/RadialAnalysisCard';
import { ScatteringCalculationDetailsCard } from '../../features/nanosystems/components/ScatteringCalculationCard';
import { NanosystemViewer3DModal } from '../../features/nanosystem-viewer/NanosystemViewer3DModal';
import { CalculationModal, RadialAnalysisModal, ScatteringCalculationModal } from './index';
import type { useNanosystemWorkspace } from '../../hooks/useNanosystemWorkspace';

type Workspace = ReturnType<typeof useNanosystemWorkspace>;

interface NanosystemWorkspaceModalsProps {
  workspace: Workspace;
}

export const NanosystemWorkspaceModals = ({ workspace }: NanosystemWorkspaceModalsProps) => {
  const { nanosystem, modals } = workspace;
  const {
    selectedCalculation,
    isCalculationModalOpen,
    setIsCalculationModalOpen,
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
  } = modals;

  return (
    <>
      <CalculationModal
        isOpen={isCalculateModalOpen}
        onClose={closeCalculateModal}
        calculationParams={calculationParams}
        onParamChange={handleParamChange}
        onCalculate={handleCalculate}
      />

      <RadialAnalysisModal
        isOpen={isRadialAnalysisModalOpen}
        onClose={closeRadialAnalysisModal}
        analysisParams={radialAnalysisParams}
        onParamChange={handleRadialAnalysisParamChange}
        onAnalyse={handleRadialAnalysis}
      />

      <ScatteringCalculationModal
        isOpen={isScatteringCalculationModalOpen}
        onClose={closeScatteringCalculationModal}
        params={scatteringCalculationParams}
        onParamChange={handleScatteringCalculationParamChange}
        onRun={handleScatteringCalculation}
        isRunning={isRunningScatteringCalculation}
      />

      <NanosystemViewer3DModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        nanosystem={nanosystem ?? null}
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

      {selectedScatteringCalculation && (
        <ScatteringCalculationDetailsCard
          calculation={selectedScatteringCalculation}
          isOpen={isScatteringCalculationDetailsModalOpen}
          onClose={() => setIsScatteringCalculationDetailsModalOpen(false)}
        />
      )}
    </>
  );
};
