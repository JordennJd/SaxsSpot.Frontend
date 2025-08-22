import { Dialog } from '@headlessui/react';
import { type NanosystemDto } from '../../features/nanosystems/api/nanosystemTypes';
import type { CalculationDto } from '../../features/calculation/api/calculationTypes';

interface DetailItemProps {
  label: string;
  value: string;
}

interface NanosystemDetailsModalProps {
  nanosystem: NanosystemDto | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onCalculate: () => void;
  calculations: CalculationDto[];
  isCalculationsLoading: boolean;
  onCalculationClick: (calculation: CalculationDto) => void;
}

const DetailItem = ({ label, value }: DetailItemProps) => (
  <div className="bg-gray-50 p-3 rounded border border-gray-200">
    <h4 className="text-sm font-medium text-gray-500">{label}</h4>
    <p className="mt-1 font-mono text-sm text-gray-900 break-all">{value}</p>
  </div>
);

export const NanosystemDetailsModal = ({
  nanosystem,
  isOpen,
  onClose,
  onDownload,
  onCalculate,
  calculations,
  isCalculationsLoading,
  onCalculationClick
}: NanosystemDetailsModalProps) => {
  if (!nanosystem) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white shadow-xl flex flex-col max-h-[90vh]">
          <Dialog.Title className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-4 rounded-t-lg">
            <div className="text-xl font-bold text-white">Nanosystem Details</div>
            <p className="text-blue-200">ID: {nanosystem.id}</p>
          </Dialog.Title>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
            <DetailItem label="Particle Kind" value={nanosystem.particleKind} />
            <DetailItem label="Series ID" value={nanosystem.seriesId} />
            <DetailItem label="Object ID" value={nanosystem.objectId} />
            <DetailItem label="User ID" value={nanosystem.userId.toString()} />
            <DetailItem label="Particle Count" value={nanosystem.particleCount.toLocaleString()} />
            <DetailItem label="Global Size" value={`${nanosystem.globalSize.toFixed(2)} nm`} />
            <DetailItem label="Generation Zone Volume" value={nanosystem.generationZoneVolume.toString()} />
            <DetailItem label="Generation Zone Form" value={nanosystem.generationZoneForm} />
            <DetailItem label="Numerical Concentration" value={nanosystem.numericalConcentration.toString()} />
            <DetailItem label="Max Particle Size" value={`${nanosystem.maxParticleSize.toFixed(2)} nm`} />
            <DetailItem label="Min Particle Size" value={`${nanosystem.minParticleSize.toFixed(2)} nm`} />
            <DetailItem label="Excess" value={nanosystem.excess.toFixed(2)} />
            <DetailItem label="K Parameter" value={nanosystem.k.toFixed(2)} />
            <DetailItem label="Theta" value={nanosystem.theta.toFixed(1)} />
            <DetailItem label="Generation Start" value={nanosystem.generationStart} />
            <DetailItem label="Generation End" value={nanosystem.generationEnd} />
            <DetailItem label="Input Date" value={nanosystem.inputDate} />
          </div>

          <div className="px-6 py-3 border-t border-gray-200 flex justify-between">
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <div className="flex space-x-2">
              <button
                onClick={onCalculate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Calculate
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>

          <div className="px-6 py-1 border-t border-gray-200" style={{ height: '400px', overflow: 'hidden' }}>
            <h3 className="font-medium text-gray-800 mb-3">Calculations</h3>
            {isCalculationsLoading ? (
              <div className="text-center py-2">Loading calculations...</div>
            ) : calculations?.length === 0 ? (
              <div className="text-center py-2 text-gray-500">No calculations found</div>
            ) : (
              <div className="h-[calc(100%-40px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <ul className="divide-y divide-gray-200">
                  {calculations?.map((calc) => (
                    <li
                      key={calc.id}
                      className="py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onCalculationClick(calc)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p>{calc.inputDate}</p>
                          <p className="text-sm font-mono text-blue-600">{calc.id}</p>
                          <p className="text-xs text-gray-500">
                            Q: {calc.qVectorFrom}-{calc.qVectorTo} | {calc.inputDate}
                          </p>
                        </div>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          Calculation
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 