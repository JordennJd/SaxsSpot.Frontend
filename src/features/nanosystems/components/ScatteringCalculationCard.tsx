import { Dialog } from '@headlessui/react';
import { type ScatteringCalculationDto } from '../api/nanosystemTypes';
import { downloadScatteringCalculation } from '../api/nanosystemApi';
import {
  XMarkIcon,
  CalendarIcon,
  CubeIcon,
  HashtagIcon,
  BeakerIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { formatDateTime } from '@/lib/utils';

const kindLabels: Record<number, string> = {
  0: 'Strict parallelepiped',
  1: 'Sphere',
};

export const ScatteringCalculationDetailsCard = ({
  calculation,
  isOpen,
  onClose,
}: {
  calculation: ScatteringCalculationDto;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const handleDownload = async () => {
    try {
      await downloadScatteringCalculation(calculation.id);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} style={{ zIndex: 99999 }}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 99998 }} aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-amber-700 px-6 py-5 rounded-t-xl flex justify-between items-start">
            <div>
              <Dialog.Title className="text-2xl font-bold text-white flex items-center gap-2">
                <BeakerIcon className="h-6 w-6" />
                SAXS Scattering Details
              </Dialog.Title>
              <p className="text-orange-100 mt-1 flex items-center gap-1">
                <HashtagIcon className="h-4 w-4" />
                ID: {calculation.id}
              </p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <Section title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Nanosystem ID" value={calculation.nanosystemId} icon={CubeIcon} />
                <DetailItem label="Kind" value={kindLabels[calculation.calculationKind] ?? 'Unknown'} icon={BeakerIcon} />
              </div>
            </Section>
            <Section title="Q-space">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Q from" value={String(calculation.qVectorFrom)} icon={HashtagIcon} />
                <DetailItem label="Q to" value={String(calculation.qVectorTo)} icon={HashtagIcon} />
                {calculation.excess != null && (
                  <DetailItem label="Excess" value={String(calculation.excess)} icon={HashtagIcon} />
                )}
              </div>
            </Section>
            <Section title="Timeline">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Input date" value={formatDateTime(calculation.inputDate)} icon={CalendarIcon} />
                <DetailItem label="Completed" value={formatDateTime(calculation.endDate)} icon={CalendarIcon} />
              </div>
            </Section>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-xl">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Download
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
      <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
      {title}
    </h3>
    {children}
  </div>
);

const DetailItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2 text-gray-500 mb-1">
      <Icon className="h-4 w-4" />
      <h4 className="text-xs font-medium uppercase tracking-wide">{label}</h4>
    </div>
    <p className="mt-1 font-medium text-gray-900 break-words pl-6">{value}</p>
  </div>
);
