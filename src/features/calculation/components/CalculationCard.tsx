// CalculationDetailsCard.tsx
import { Dialog } from '@headlessui/react';
import { type CalculationDto, type PlotChartRequest } from '../api/calculationTypes.ts';
import { useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    XMarkIcon,
    CalendarIcon,
    CubeIcon,
    UserIcon,
    ArrowsRightLeftIcon,
    ScaleIcon,
    HashtagIcon,
} from '@heroicons/react/24/outline';

export const CalculationDetailsCard = ({
                                           calculation,
                                           isOpen,
                                           onClose,
                                       }: {
    calculation: CalculationDto;
    isOpen: boolean;
    onClose: () => void;
}) => {
    const navigate = useNavigate();

    const handleViewChart = async () => {
        const request: PlotChartRequest = {
            CalculatesId: [calculation.id],
            ChartTitle: 'Scattering',
            XAxis: 'Q',
            YAxis: 'I',
            ScaleMethodsX: 'Linear',
            ScaleMethodsY: 'Linear',
        };
        navigate(`/calculations/${calculation.id}/chart`, { state: { request } });
    };

    // Группируем данные для лучшей организации
    const basicInfo = [
        { label: 'Nanosystem ID', value: calculation.nanosystemId, icon: CubeIcon },
        { label: 'Object ID', value: calculation.objectId, icon: CubeIcon },
        { label: 'User ID', value: calculation.userId, icon: UserIcon },
    ];

    const qVectorInfo = [
        { label: 'Q Vector Range', value: `${calculation.qVectorFrom} - ${calculation.qVectorTo}`, icon: ArrowsRightLeftIcon },
        { label: 'Q Space Method', value: calculation.qSpaceMethod, icon: ScaleIcon },
        { label: 'Q Scale Method', value: calculation.qScaleMethod, icon: ScaleIcon },
        { label: 'Q Space Parameter', value: calculation.qSpaceParameter.toString(), icon: HashtagIcon },
    ];

    const phiVectorInfo = [
        calculation.phiVectorFrom !== null && calculation.phiVectorTo !== null &&
        { label: 'Φ Vector Range', value: `${calculation.phiVectorFrom} - ${calculation.phiVectorTo}`, icon: ArrowsRightLeftIcon },
        calculation.phiSpaceMethod !== null &&
        { label: 'Φ Space Method', value: calculation.phiSpaceMethod, icon: ScaleIcon },
        calculation.phiScaleMethod !== null &&
        { label: 'Φ Scale Method', value: calculation.phiScaleMethod, icon: ScaleIcon },
        calculation.phiSpaceParameter !== null &&
        { label: 'Φ Space Parameter', value: calculation.phiSpaceParameter.toString(), icon: HashtagIcon },
    ].filter(Boolean);

    const thetaVectorInfo = [
        calculation.thetaVectorFrom !== null && calculation.thetaVectorTo !== null &&
        { label: 'θ Vector Range', value: `${calculation.thetaVectorFrom} - ${calculation.thetaVectorTo}`, icon: ArrowsRightLeftIcon },
        calculation.thetaSpaceMethod !== null &&
        { label: 'θ Space Method', value: calculation.thetaSpaceMethod, icon: ScaleIcon },
        calculation.thetaScaleMethod !== null &&
        { label: 'θ Scale Method', value: calculation.thetaScaleMethod, icon: ScaleIcon },
        calculation.thetaSpaceParameter !== null &&
        { label: 'θ Space Parameter', value: calculation.thetaSpaceParameter.toString(), icon: HashtagIcon },
    ].filter(Boolean);

    const timeInfo = [
        { label: 'Input Date', value: calculation.inputDate, icon: CalendarIcon },
        { label: 'Calculation Start', value: calculation.calculateStart, icon: CalendarIcon },
        { label: 'Calculation End', value: calculation.calculateEnd, icon: CalendarIcon },
    ];

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-3xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 rounded-t-xl flex justify-between items-start">
                        <div>
                            <Dialog.Title className="text-2xl font-bold text-white flex items-center gap-2">
                                <CubeIcon className="h-6 w-6" />
                                Calculation Details
                            </Dialog.Title>
                            <p className="text-blue-100 mt-1 flex items-center gap-1">
                                <HashtagIcon className="h-4 w-4" />
                                ID: {calculation?.id || 'N/A'}
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

                        {/* Q Vector Section */}
                        <Section title="Q Vector Parameters">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {qVectorInfo.map((item, index) => (
                                    <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                                ))}
                            </div>
                        </Section>

                        {/* Φ Vector Section (conditional) */}
                        {phiVectorInfo.length > 0 && (
                            <Section title="Φ Vector Parameters">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {phiVectorInfo.map((item, index) => (
                                        <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* θ Vector Section (conditional) */}
                        {thetaVectorInfo.length > 0 && (
                            <Section title="θ Vector Parameters">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {thetaVectorInfo.map((item, index) => (
                                        <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Time Information Section */}
                        <Section title="Timeline">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {timeInfo.map((item, index) => (
                                    <DetailItem key={index} label={item.label} value={item.value} icon={item.icon} />
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-xl">
                        <button
                            onClick={handleViewChart}
                            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <ChartBarIcon className="h-5 w-5" />
                            View Chart
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

// Компонент секции с заголовком
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300 flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
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