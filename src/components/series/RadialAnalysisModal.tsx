import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import type { RunRadialAnalysisRequest } from '../../features/nanosystems/api/nanosystemApi';

interface RadialAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisParams: RunRadialAnalysisRequest;
  onParamChange: (path: string, value: unknown) => void;
  onAnalyse: () => void;
  isAnalysing?: boolean;
}

export const RadialAnalysisModal = ({
  isOpen,
  onClose,
  analysisParams,
  onParamChange,
  onAnalyse,
  isAnalysing = false,
}: RadialAnalysisModalProps) => {
  const [isDirty, setIsDirty] = useState(false);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!isOpen) {
      setIsDirty(false);
    }
  }, [isOpen]);

  const handleParamChange = (path: string, value: unknown) => {
    if (!isDirty) setIsDirty(true);
    onParamChange(path, value);
  };

  const handleAnalyse = () => {
    setIsDirty(false);
    onAnalyse();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} style={{ zIndex: 99999 }}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 99998 }} aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden transform transition-all">
          <div className="bg-gradient-to-r from-purple-600 to-pink-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-bold text-white">
                Radial Analysis Parameters
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-purple-100 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analysis Parameters</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Configure the parameters for radial analysis
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Point Count
                    <span className="text-xs text-gray-500 ml-1">(number of points)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={analysisParams.pointCount}
                    onChange={(e) => handleParamChange('pointCount', parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of points to analyze
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layer Count
                    <span className="text-xs text-gray-500 ml-1">(number of layers)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={analysisParams.layerCount}
                    onChange={(e) => handleParamChange('layerCount', parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of layers for analysis
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-purple-700">
                      This will run radial analysis with {analysisParams.pointCount} points and {analysisParams.layerCount} layers
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
                onClick={handleAnalyse}
                disabled={isAnalysing}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-700 text-white rounded-lg hover:from-purple-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center"
              >
                {isAnalysing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analysing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Analyse
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

