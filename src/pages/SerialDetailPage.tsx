import { useQuery } from '@tanstack/react-query';
import { type NanosystemDto, type NanosystemSeriesDto } from '../features/nanosystems/api/nanosystemTypes';
import { Pagination } from '../components/ui/Pagination';
import { useState } from 'react';
import { fetchNanosystemList, fetchSeriesNanosystems } from '../features/nanosystems/api/nanosystemApi';
import { useParams } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { nanosystemApiClient } from "../lib/axios.ts";
import type {CalculationDto, RunCalculationRequest} from "../features/calculation/api/calculationTypes.ts";
import {fetchCalculationsByNanosystem, RunCalculation} from "../features/calculation/api/calculationApi.ts";
import { CalculationDetailsCard } from "../features/calculation/components/CalculationCard.tsx";
import type { PaginatedResponse } from "../features/nanosystems/api/common/commonTypes.ts";

const fetchSeries = async (seriesId: string): Promise<NanosystemSeriesDto> => {
  const response = await fetchSeriesNanosystems("id=" + seriesId, 1, 1);
  if (response.data.length === 0) {
    throw new Error("Series not found");
  }
  return response.data[0];
};

const fetchNanosystems = async (
    gridifyQuery?: string,
    page: number = 1,
    pageSize: number = 10
): Promise<PaginatedResponse<NanosystemDto>> => {
  try {
    const response = await fetchNanosystemList(gridifyQuery, page, pageSize);
    if (response.data.length === 0) {
      throw new Error("Nanosystem List query error");
    }
    return response;
  } catch (e) {
    console.log(e);
    throw new Error("Nanosystem List query error");
  }
};

const downloadNanosystem = async (id: string) => {
  try {
    const response = await nanosystemApiClient.get('/nanosystem/download-nanosystem', {
      responseType: 'blob',
      params: { id }
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', id);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

const ParameterBlock = ({ title, value, icon }: { title: string; value: string; icon: string }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="text-sm font-medium text-gray-500">{title}</h4>
          <p className="text-lg font-mono font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-gray-50 p-3 rounded border border-gray-200">
      <h4 className="text-sm font-medium text-gray-500">{label}</h4>
      <p className="mt-1 font-mono text-sm text-gray-900 break-all">{value}</p>
    </div>
);

export const SeriesDetailPage = () => {
  const { guid: seriesId = "" } = useParams<{ guid: string }>();
  const [page, setPage] = useState(1);
  const [calculationPage, setCalculationPage] = useState(1);
  const pageSize = 10;

  const [selectedNanosystem, setSelectedNanosystem] = useState<NanosystemDto | null>(null);
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculationModalOpen, setIsCalculationModalOpen] = useState(false);
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);

  const [calculationParams, setCalculationParams] = useState<RunCalculationRequest>({
    qVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.01,
      start: 0.02,
      end: 0.4
    },
    phiVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.01,
      start: 0.02,
      end: 0.04
    },
    thetaVectorSpaceParameters: {
      spaceMethod: 0,
      scaleMethod: 0,
      spaceParameter: 0.01,
      start: 0.02,
      end: 0.04
    },
    systemId: "",
    requestId: ""
  });

  const fetchCalculations = async (nanosystemId: string): Promise<CalculationDto[]> => {
    try {
      const response = await fetchCalculationsByNanosystem(nanosystemId, calculationPage, pageSize);
      return response.result.data;
    } catch (error) {
      console.error('Error fetching calculations:', error);
      throw new Error('Failed to fetch calculations');
    }
  };

  const { data: calculations, isLoading: isCalculationsLoading } = useQuery<CalculationDto[]>({
    queryKey: ['calculations', selectedNanosystem?.id],
    queryFn: () => selectedNanosystem ? fetchCalculations(selectedNanosystem.id) : [],
    enabled: !!selectedNanosystem,
  });

  const { data: series, isLoading: isSeriesLoading } = useQuery({
    queryKey: ['series', seriesId],
    queryFn: () => fetchSeries(seriesId),
  });

  const { data: nanosystems, isLoading: isNanosystemsLoading } = useQuery<PaginatedResponse<NanosystemDto>>({
    queryKey: ['nanosystems', seriesId, page, pageSize],
    queryFn: () => fetchNanosystems(`seriesId=${seriesId}`, page, pageSize),
    placeholderData: (previousData) => previousData,
    retry: 1,
  });

  const openNanosystemDetails = (system: NanosystemDto) => {
    setSelectedNanosystem(system);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNanosystem(null);
  };

  const openCalculationDetails = (calculation: CalculationDto) => {
    setSelectedCalculation(calculation);
    setIsCalculationModalOpen(true);
  };

  const openCalculateModal = () => {
    if (selectedNanosystem) {
      setCalculationParams(prev => ({
        ...prev,
        systemId: selectedNanosystem.id
      }));
      setIsCalculateModalOpen(true);
    }
  };

  const closeCalculateModal = () => {
    setIsCalculateModalOpen(false);
  };

  const handleCalculate = async () => {
    try {
      console.log('Calculation started:', calculationParams);
      await RunCalculation(calculationParams)
      closeCalculateModal();
      alert('Calculation started' )
    } catch (error) {
      console.error('Error starting calculation:', error);
      alert('Error starting calculation')
    }
  };

  const handleParamChange = (path: string, value: any) => {
    setCalculationParams(prev => {
      const keys = path.split('.');
      const newParams = { ...prev };
      let current: any = newParams;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newParams;
    });
  };

  const handleDownload = async () => {
    if (selectedNanosystem) {
      try {
        await downloadNanosystem(selectedNanosystem.id);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  if (isSeriesLoading) {
    return <div className="text-center py-8">Loading series data...</div>;
  }

  if (!series) {
    return <div className="text-center py-8">Series not found</div>;
  }

  return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Series: {series.id}</h2>
            <p className="text-blue-200">Particle kind: {series.particleKind}</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ParameterBlock
                title="Particle Count"
                value={`${series.particleCountFrom} - ${series.particleCountTo}`}
                icon="🧮"
            />
            <ParameterBlock
                title="Global Size"
                value={`${series.globalSizeFrom.toFixed(2)} - ${series.globalSizeTo.toFixed(2)} nm`}
                icon="📏"
            />
            <ParameterBlock
                title="Concentration"
                value={`${series.numericalConcentrationFrom} - ${series.numericalConcentrationTo}`}
                icon="🧪"
            />
            <ParameterBlock
                title="Particle Size"
                value={`${series.minParticleSizeFrom.toFixed(2)} - ${series.maxParticleSizeTo.toFixed(2)} nm`}
                icon="🔬"
            />
            <ParameterBlock
                title="Excess"
                value={series.excessFrom ? `${series.excessFrom.toFixed(2)} - ${series.excessTo?.toFixed(2)}` : 'N/A'}
                icon="⚖️"
            />
            <ParameterBlock
                title="K Parameter"
                value={`${series.kFrom.toFixed(2)} - ${series.kTo.toFixed(2)}`}
                icon="𝛋"
            />
            <ParameterBlock
                title="Theta"
                value={`${series.thetaFrom.toFixed(1)} - ${series.thetaTo.toFixed(1)}`}
                icon="∠"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Generated Nanosystems</h3>
          </div>

          {isNanosystemsLoading ? (
              <div className="p-6 text-center">Loading nanosystems...</div>
          ) : nanosystems?.count === 0 ? (
              <div className="p-6 text-center text-gray-500">No nanosystems found</div>
          ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concentration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {nanosystems?.data.map((system) => (
                        <tr
                            key={system.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => openNanosystemDetails(system)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                            {system.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {system.particleCount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {system.globalSize.toFixed(2)} nm
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {system.numericalConcentration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {system.generationStart}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Generated
                        </span>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
                {nanosystems && (
                    <div className="px-6 py-3 border-t border-gray-200">
                      <Pagination
                          currentPage={page}
                          pageSize={pageSize}
                          onPageChange={setPage}
                          totalItems={nanosystems.count}
                      />
                    </div>
                )}
              </>
          )}
        </div>

        {selectedNanosystem && (
            <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white shadow-xl flex flex-col max-h-[90vh]">
                  <Dialog.Title className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-4 rounded-t-lg">
                    <div className="text-xl font-bold text-white">Nanosystem Details</div>
                    <p className="text-blue-200">ID: {selectedNanosystem?.id || 'N/A'}</p>
                  </Dialog.Title>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1">
                    <DetailItem label="Particle Kind" value={selectedNanosystem.particleKind} />
                    <DetailItem label="Series ID" value={selectedNanosystem.seriesId} />
                    <DetailItem label="Object ID" value={selectedNanosystem.objectId} />
                    <DetailItem label="User ID" value={selectedNanosystem.userId.toString()} />
                    <DetailItem label="Particle Count" value={selectedNanosystem.particleCount.toLocaleString()} />
                    <DetailItem label="Global Size" value={`${selectedNanosystem.globalSize.toFixed(2)} nm`} />
                    <DetailItem label="Generation Zone Volume" value={selectedNanosystem.generationZoneVolume.toString()} />
                    <DetailItem label="Generation Zone Form" value={selectedNanosystem.generationZoneForm} />
                    <DetailItem label="Numerical Concentration" value={selectedNanosystem.numericalConcentration.toString()} />
                    <DetailItem label="Max Particle Size" value={`${selectedNanosystem.maxParticleSize.toFixed(2)} nm`} />
                    <DetailItem label="Min Particle Size" value={`${selectedNanosystem.minParticleSize.toFixed(2)} nm`} />
                    <DetailItem label="Excess" value={selectedNanosystem.excess.toFixed(2)} />
                    <DetailItem label="K Parameter" value={selectedNanosystem.k.toFixed(2)} />
                    <DetailItem label="Theta" value={selectedNanosystem.theta.toFixed(1)} />
                    <DetailItem label="Generation Start" value={selectedNanosystem.generationStart} />
                    <DetailItem label="Generation End" value={selectedNanosystem.generationEnd} />
                    <DetailItem label="Input Date" value={selectedNanosystem.inputDate} />
                  </div>
                  <span className="flex space-x-2">
                      <div className="px-6 py-3 border-t border-gray-200 flex justify-between">
                        <div className="flex space-x-2">
                          <button
                              onClick={handleDownload}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </div>

                      <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={openCalculateModal}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Calculate
                        </button>
                      </div>
                      <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Close
                        </button>
                      </div>
                    </span>
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
                                    onClick={() => openCalculationDetails(calc)}
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
        )}

        <Dialog open={isCalculateModalOpen} onClose={closeCalculateModal} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
              <Dialog.Title className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-4 rounded-t-lg">
                <div className="text-xl font-bold text-white">Calculation Parameters</div>
              </Dialog.Title>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Q Vector Parameters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start</label>
                      <input
                          type="number"
                          step="0.01"
                          value={calculationParams.qVectorSpaceParameters.start}
                          onChange={(e) => handleParamChange('qVectorSpaceParameters.start', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End</label>
                      <input
                          type="number"
                          step="0.01"
                          value={calculationParams.qVectorSpaceParameters.end}
                          onChange={(e) => handleParamChange('qVectorSpaceParameters.end', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Space Parameter</label>
                      <input
                          type="number"
                          step="0.001"
                          value={calculationParams.qVectorSpaceParameters.spaceParameter}
                          onChange={(e) => handleParamChange('qVectorSpaceParameters.spaceParameter', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Phi Vector Parameters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start</label>
                      <input
                          type="number"
                          step="0.01"
                          value={calculationParams.phiVectorSpaceParameters.start}
                          onChange={(e) => handleParamChange('phiVectorSpaceParameters.start', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End</label>
                      <input
                          type="number"
                          step="0.01"
                          value={calculationParams.phiVectorSpaceParameters.end}
                          onChange={(e) => handleParamChange('phiVectorSpaceParameters.end', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Space Parameter</label>
                      <input
                          type="number"
                          step="0.001"
                          value={calculationParams.phiVectorSpaceParameters.spaceParameter}
                          onChange={(e) => handleParamChange('phiVectorSpaceParameters.spaceParameter', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Theta Vector Parameters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start</label>
                      <input
                          type="number"
                          step="0.01"
                          value={calculationParams.thetaVectorSpaceParameters.start}
                          onChange={(e) => handleParamChange('thetaVectorSpaceParameters.start', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End</label>
                      <input
                          type="number"
                          step="0.01"
                          value={calculationParams.thetaVectorSpaceParameters.end}
                          onChange={(e) => handleParamChange('thetaVectorSpaceParameters.end', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Space Parameter</label>
                      <input
                          type="number"
                          step="0.001"
                          value={calculationParams.thetaVectorSpaceParameters.spaceParameter}
                          onChange={(e) => handleParamChange('thetaVectorSpaceParameters.spaceParameter', parseFloat(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-gray-200 flex justify-end space-x-3">
                <button
                    onClick={closeCalculateModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
                <button
                    onClick={handleCalculate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Calculate
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {selectedCalculation && (
            <CalculationDetailsCard
                calculation={selectedCalculation}
                isOpen={isCalculationModalOpen}
                onClose={() => setIsCalculationModalOpen(false)}
            />
        )}
      </div>
  );
};