import { Dialog } from '@headlessui/react';
import type { RunCalculationRequest } from '../../features/calculation/api/calculationTypes';

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationParams: RunCalculationRequest;
  onParamChange: (path: string, value: unknown) => void;
  onCalculate: () => void;
}

export const CalculationModal = ({
  isOpen,
  onClose,
  calculationParams,
  onParamChange,
  onCalculate,
}: CalculationModalProps) => {
  const renderVectorParameters = (
    title: string,
    params: any,
    prefix: string,
  ) => (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start</label>
          <input
            type="number"
            step="0.01"
            value={params.start}
            onChange={(e) => onParamChange(`${prefix}.start`, parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End</label>
          <input
            type="number"
            step="0.01"
            value={params.end}
            onChange={(e) => onParamChange(`${prefix}.end`, parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Space Parameter</label>
          <input
            type="number"
            step="0.001"
            value={params.spaceParameter}
            onChange={(e) => onParamChange(`${prefix}.spaceParameter`, parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <Dialog.Title className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-4 rounded-t-lg">
            <div className="text-xl font-bold text-white">Calculation Parameters</div>
          </Dialog.Title>

          <div className="p-6 space-y-4">
            {renderVectorParameters(
              'Q Vector Parameters',
              calculationParams.qVectorSpaceParameters,
              'qVectorSpaceParameters',
            )}
            {renderVectorParameters(
              'Phi Vector Parameters',
              calculationParams.phiVectorSpaceParameters,
              'phiVectorSpaceParameters',
            )}
            {renderVectorParameters(
              'Theta Vector Parameters',
              calculationParams.thetaVectorSpaceParameters,
              'thetaVectorSpaceParameters',
            )}
          </div>

          <div className="px-6 py-3 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
            </button>
            <button
              onClick={onCalculate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Calculate
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 