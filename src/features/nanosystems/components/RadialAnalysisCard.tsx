// RadialAnalysisDetailsCard.tsx
import { Dialog } from '@headlessui/react';
import { type RadialAnalysisDto } from '../api/nanosystemTypes';
import { downloadRadialAnalysis } from '../api/nanosystemApi';
import {
    XMarkIcon,
    CalendarIcon,
    CubeIcon,
    HashtagIcon,
    ChartBarIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

export const RadialAnalysisDetailsCard = ({
    analysis,
    isOpen,
    onClose,
}: {
    analysis: RadialAnalysisDto;
    isOpen: boolean;
    onClose: () => void;
}) => {
    const handleDownload = async () => {
        try {
            await downloadRadialAnalysis(analysis.id);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };
    // Группируем данные для лучшей организации
    const basicInfo = [
        { label: 'Nanosystem ID', value: analysis.nanosystemId, icon: CubeIcon },
        { label: 'Analysis ID', value: analysis.id, icon: HashtagIcon },
    ];

    const parametersInfo = [
        { label: 'Point Count', value: analysis.pointCount.toString(), icon: HashtagIcon },
        { label: 'Layer Count', value: analysis.layerCount.toString(), icon: HashtagIcon },
    ];

    const timeInfo = [
        { label: 'Start Date', value: analysis.startDate, icon: CalendarIcon },
        { label: 'End Date', value: analysis.endDate || 'N/A', icon: CalendarIcon },
    ];

    return (
        <Dialog open={isOpen} onClose={onClose} style={{ zIndex: 99999 }}>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" style={{ zIndex: 99998 }} aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
                <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-700 px-6 py-5 rounded-t-xl flex justify-between items-start">
                        <div>
                            <Dialog.Title className="text-2xl font-bold text-white flex items-center gap-2">
                                <ChartBarIcon className="h-6 w-6" />
                                Radial Analysis Details
                            </Dialog.Title>
                            <p className="text-purple-100 mt-1 flex items-center gap-1">
                                <HashtagIcon className="h-4 w-4" />
                                ID: {analysis?.id || 'N/A'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        {/* Basic Information Section */}
                        <Section title="Basic Information">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {basicInfo.map((item, index) => (
                                    <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                                ))}
                            </div>
                        </Section>

                        {/* Parameters Section */}
                        <Section title="Analysis Parameters">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parametersInfo.map((item, index) => (
                                    <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                                ))}
                            </div>
                        </Section>

                        {/* Time Information Section */}
                        <Section title="Timeline">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {timeInfo.map((item, index) => (
                                    <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-xl">
                        <button
                            onClick={handleDownload}
                            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
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
            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
            {title}
        </h3>
        {children}
    </div>
);

// Улучшенный компонент деталей с иконкой
const DetailItem = ({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string | null;
    icon: React.ComponentType<{ className?: string }>;
}) => (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Icon className="h-4 w-4" />
            <h4 className="text-xs font-medium uppercase tracking-wide">{label}</h4>
        </div>
        <p className="mt-1 font-medium text-gray-900 break-words pl-6">
            {value || <span className="text-gray-400 italic">N/A</span>}
        </p>
    </div>
);

