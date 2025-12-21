import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import type { RunCalculationRequest } from '../../features/calculation/api/calculationTypes';

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationParams: RunCalculationRequest;
  onParamChange: (path: string, value: unknown) => void;
  onCalculate: (isSeries: boolean) => void;
  isCalculating?: boolean;
  isSeries?: boolean
}

export const CalculationModal = ({
                                   isOpen,
                                   onClose,
                                   calculationParams,
                                   onParamChange,
                                   onCalculate,
                                   isSeries = false,
                                   isCalculating = false,
                                 }: CalculationModalProps) => {
  const [activeTab, setActiveTab] = useState('q');
  const [isDirty, setIsDirty] = useState(false);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!isOpen) {
      setIsDirty(false);
      setActiveTab('q');
    }
  }, [isOpen]);

  const handleParamChange = (path: string, value: unknown) => {
    if (!isDirty) setIsDirty(true);
    onParamChange(path, value);
  };

  const handleCalculate = () => {
    setIsDirty(false);
    onCalculate(isSeries);
  };

  const renderVectorParameters = (
      title: string,
      params: any,
      prefix: string,
      description: string,
  ) => (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start
              <span className="text-xs text-gray-500 ml-1">(min value)</span>
            </label>
            <input
                type="number"
                step="0.01"
                value={params.start}
                onChange={(e) => handleParamChange(`${prefix}.start`, parseFloat(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End
              <span className="text-xs text-gray-500 ml-1">(max value)</span>
            </label>
            <input
                type="number"
                step="0.01"
                value={params.end}
                onChange={(e) => handleParamChange(`${prefix}.end`, parseFloat(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step
              <span className="text-xs text-gray-500 ml-1">(increment)</span>
            </label>
            <input
                type="number"
                step="0.001"
                min="0.001"
                value={params.spaceParameter}
                onChange={(e) => handleParamChange(`${prefix}.spaceParameter`, parseFloat(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                This will generate {Math.floor((params.end - params.start) / params.spaceParameter) + 1} values from {params.start} to {params.end}
              </p>
            </div>
          </div>
        </div>
      </div>
  );

  return (
      <Dialog open={isOpen} onClose={onClose} style={{ zIndex: 99999 }}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 99998 }} aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-xl font-bold text-white">Calculation Parameters</Dialog.Title>
                <button
                    onClick={onClose}
                    className="text-blue-100 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 pt-4 border-b border-gray-200">
              <nav className="flex space-x-4">
                {[
                  { id: 'q', name: 'Q Vector', description: 'Momentum transfer parameters' },
                  { id: 'phi', name: 'Phi Vector', description: 'Azimuthal angle parameters' },
                  { id: 'theta', name: 'Theta Vector', description: 'Polar angle parameters' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === tab.id
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab.name}
                    </button>
                ))}
              </nav>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {activeTab === 'q' && renderVectorParameters(
                  'Q Vector Parameters',
                  calculationParams.qVectorSpaceParameters,
                  'qVectorSpaceParameters',
                  'Parameters for momentum transfer vector Q',
              )}

              {activeTab === 'phi' && renderVectorParameters(
                  'Phi Vector Parameters',
                  calculationParams.phiVectorSpaceParameters,
                  'phiVectorSpaceParameters',
                  'Parameters for azimuthal angle φ',
              )}

              {activeTab === 'theta' && renderVectorParameters(
                  'Theta Vector Parameters',
                  calculationParams.thetaVectorSpaceParameters,
                  'thetaVectorSpaceParameters',
                  'Parameters for polar angle θ',
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <div>
                {isDirty && (
                    <span className="text-sm text-gray-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Unsaved changes
                </span>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center"
                >
                  {isCalculating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating...
                      </>
                  ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Calculate
                      </>
                  )}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
  );
};