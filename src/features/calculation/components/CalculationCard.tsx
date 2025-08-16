// CalculationDetailsCard.tsx
import { Dialog } from '@headlessui/react';
import type {CalculationDto} from "../api/calculationTypes.ts";

export const CalculationDetailsCard = ({
                                           calculation,
                                           isOpen,
                                           onClose,
                                       }: {
    calculation: CalculationDto;
    isOpen: boolean;
    onClose: () => void;
}) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white shadow-xl flex flex-col max-h-[90vh]">
                    <Dialog.Title className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-4 rounded-t-lg">
                        <div className="text-xl font-bold text-white">Calculation Details</div>
                        <p className="text-blue-200">ID: {calculation?.id || 'N/A'}</p>
                    </Dialog.Title>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
                        <DetailItem label="Nanosystem ID" value={calculation.nanosystemId} />
                        <DetailItem label="Object ID" value={calculation.objectId} />
                        <DetailItem label="User ID" value={calculation.userId} />
                        <DetailItem label="Q Vector Range" value={`${calculation.qVectorFrom} - ${calculation.qVectorTo}`} />
                        <DetailItem label="Q Space Method" value={calculation.qSpaceMethod} />
                        <DetailItem label="Q Scale Method" value={calculation.qScaleMethod} />
                        <DetailItem label="Q Space Parameter" value={calculation.qSpaceParameter.toString()} />
                        {calculation.phiVectorFrom && calculation.phiVectorTo && (
                            <DetailItem label="Φ Vector Range" value={`${calculation.phiVectorFrom} - ${calculation.phiVectorTo}`} />
                        )}
                        {calculation.phiSpaceMethod !== null && (
                            <DetailItem label="Φ Space Method" value={calculation.phiSpaceMethod} />
                        )}
                        {calculation.phiScaleMethod !== null && (
                            <DetailItem label="Φ Scale Method" value={calculation.phiScaleMethod} />
                        )}
                        {calculation.phiSpaceParameter !== null && (
                            <DetailItem label="Φ Space Parameter" value={calculation.phiSpaceParameter.toString()} />
                        )}
                        {calculation.thetaVectorFrom !== null && calculation.thetaVectorTo && (
                            <DetailItem label="θ Vector Range" value={`${calculation.thetaVectorFrom} - ${calculation.thetaVectorTo}`} />
                        )}
                        {calculation.thetaSpaceMethod !== null && (
                            <DetailItem label="θ Space Method" value={calculation.thetaSpaceMethod} />
                        )}
                        {calculation.thetaScaleMethod !== null && (
                            <DetailItem label="θ Scale Method" value={calculation.thetaScaleMethod} />
                        )}
                        {calculation.thetaSpaceParameter !== null && (
                            <DetailItem label="θ Space Parameter" value={calculation.thetaSpaceParameter.toString()} />
                        )}
                        <DetailItem label="Input Date" value={calculation.inputDate} />
                        <DetailItem label="Calculation Start" value={calculation.calculateStart} />
                        <DetailItem label="Calculation End" value={calculation.calculateEnd} />
                    </div>

                    <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Close
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-gray-50 p-3 rounded border border-gray-200">
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
        <p className="mt-1 font-mono text-sm text-gray-900 break-all">{value}</p>
    </div>
);