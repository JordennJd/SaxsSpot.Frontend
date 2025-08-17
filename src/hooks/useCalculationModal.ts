import { useState, useCallback } from 'react';
import { useModal } from './useModal';
import { CalculationService } from '@/services/calculationService';
import type { 
  CalculationDto, 
  RunCalculationRequest 
} from '@/features/calculation/api/calculationTypes';
import type { NanosystemDto } from '@/features/nanosystems/api/nanosystemTypes';

export interface UseCalculationModalReturn {
  // Nanosystem modal
  nanosystemModal: {
    isOpen: boolean;
    data: NanosystemDto | null;
    open: (nanosystem: NanosystemDto) => void;
    close: () => void;
  };
  
  // Calculation details modal
  calculationModal: {
    isOpen: boolean;
    data: CalculationDto | null;
    open: (calculation: CalculationDto) => void;
    close: () => void;
  };
  
  // Calculation form modal
  calculationFormModal: {
    isOpen: boolean;
    params: RunCalculationRequest;
    isSubmitting: boolean;
    open: (systemId: string) => void;
    close: () => void;
    updateParams: (path: string, value: unknown) => void;
    submit: () => Promise<void>;
  };
}

export function useCalculationModal(): UseCalculationModalReturn {
  const nanosystemModal = useModal<NanosystemDto>();
  const calculationModal = useModal<CalculationDto>();
  const calculationFormModal = useModal();
  
  const [calculationParams, setCalculationParams] = useState<RunCalculationRequest>(
    CalculationService.createDefaultCalculationParams('')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCalculationForm = useCallback((systemId: string) => {
    setCalculationParams(CalculationService.createDefaultCalculationParams(systemId));
    calculationFormModal.open();
  }, [calculationFormModal]);

  const updateCalculationParams = useCallback((path: string, value: unknown) => {
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
  }, []);

  const submitCalculation = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await CalculationService.startCalculation(calculationParams);
      calculationFormModal.close();
      // Could add a success notification here
    } catch (error) {
      console.error('Error starting calculation:', error);
      // Could add an error notification here
    } finally {
      setIsSubmitting(false);
    }
  }, [calculationParams, calculationFormModal]);

  return {
    nanosystemModal: {
      isOpen: nanosystemModal.isOpen,
      data: nanosystemModal.data,
      open: nanosystemModal.open,
      close: nanosystemModal.close,
    },
    calculationModal: {
      isOpen: calculationModal.isOpen,
      data: calculationModal.data,
      open: calculationModal.open,
      close: calculationModal.close,
    },
    calculationFormModal: {
      isOpen: calculationFormModal.isOpen,
      params: calculationParams,
      isSubmitting,
      open: openCalculationForm,
      close: calculationFormModal.close,
      updateParams: updateCalculationParams,
      submit: submitCalculation,
    },
  };
} 