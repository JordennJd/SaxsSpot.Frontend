import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import type { RunScatteringCalculationRequest } from '../../features/nanosystems/api/nanosystemApi';

interface ScatteringCalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: RunScatteringCalculationRequest;
  onParamChange: (path: string, value: unknown) => void;
  onRun: () => void;
  isRunning?: boolean;
  showExcess?: boolean;
}

const SpaceParameterFields = ({
  title,
  prefix,
  params,
  onParamChange,
}: {
  title: string;
  prefix: 'qSpaceParameters';
  params: RunScatteringCalculationRequest['qSpaceParameters'];
  onParamChange: (path: string, value: unknown) => void;
}) => (
  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">Configure Q-vector sampling</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Start" value={params.start} onChange={(v) => onParamChange(`${prefix}.start`, v)} />
      <Field label="End" value={params.end} onChange={(v) => onParamChange(`${prefix}.end`, v)} />
      <Field label="Space parameter" value={params.spaceParameter} onChange={(v) => onParamChange(`${prefix}.spaceParameter`, v)} />
      <SelectField
        label="Space method"
        value={params.spaceMethod}
        options={[
          { value: 0, label: 'Linear' },
          { value: 1, label: 'Log' },
        ]}
        onChange={(v) => onParamChange(`${prefix}.spaceMethod`, v)}
      />
      <SelectField
        label="Scale method"
        value={params.scaleMethod}
        options={[
          { value: 0, label: 'Step' },
          { value: 1, label: 'Count' },
        ]}
        onChange={(v) => onParamChange(`${prefix}.scaleMethod`, v)}
      />
    </div>
  </div>
);

const Field = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: { value: number; label: string }[];
  onChange: (value: number) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

export const ScatteringCalculationModal = ({
  isOpen,
  onClose,
  params,
  onParamChange,
  onRun,
  isRunning = false,
  showExcess = false,
}: ScatteringCalculationModalProps) => {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsDirty(false);
  }, [isOpen]);

  const handleParamChange = (path: string, value: unknown) => {
    if (!isDirty) setIsDirty(true);
    onParamChange(path, value);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} style={{ zIndex: 99999 }}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 99998 }} aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden transform transition-all">
          <div className="bg-gradient-to-r from-orange-600 to-amber-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-bold text-white">
                SAXS Scattering Calculation
              </Dialog.Title>
              <button onClick={onClose} className="text-orange-100 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <SpaceParameterFields
              title="Q-space parameters"
              prefix="qSpaceParameters"
              params={params.qSpaceParameters}
              onParamChange={handleParamChange}
            />
            {showExcess && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <Field
                  label="Excess (0-1)"
                  value={params.excess ?? 0}
                  onChange={(v) => handleParamChange('excess', v)}
                />
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setIsDirty(false); onRun(); }}
              disabled={isRunning}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 transition-all"
            >
              {isRunning ? 'Starting...' : 'Run SAXS calculation'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
