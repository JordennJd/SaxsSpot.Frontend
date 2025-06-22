import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { ParticleKindMap, ParticleKindSchema, type NanosystemDto, type NanosystemSeriesDto } from '../features/nanosystems/api/nanosystemTypes';
import { Pagination } from '../components/ui/Pagination';
import { useState } from 'react';
import { fetchNanosystemList, fetchSeriesNanosystems, type PaginatedResponse } from '../features/nanosystems/api/nanosystemApi';
import { useParams } from 'react-router-dom';

const fetchSeries = async (seriesId: string): Promise<NanosystemSeriesDto> => {
  const response = await fetchSeriesNanosystems("id=" + seriesId, 1, 1);
  if(response.data.length === 0) {
    throw new Error("Series not found");
  }

  return response.data[0];
};

const fetchNanosystems = async (
    gridifyQuery?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<NanosystemDto>> => {
    try{
        const response = await fetchNanosystemList(gridifyQuery, page, pageSize);
        if(response.data.length === 0) {
          throw new Error("Nanosystem List query error");
        }
        console.log(response);
        return response;
    }
    catch(e){
      console.log(e);
      throw new Error("Nanosystem List query error");
}
  };

export const SeriesDetailPage = () => {
  const { guid: seriesId } = useParams<{ guid: string }>();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Загрузка данных серии
  const { data: series, isLoading: isSeriesLoading } = useQuery({
    queryKey: ['series', seriesId],
    queryFn: () => fetchSeries(seriesId),
  });

  // Загрузка наносистем с пагинацией
  const { data: nanosystems, isLoading: isNanosystemsLoading } = useQuery<PaginatedResponse<NanosystemDto>>({
    queryKey: ['nanosystems', seriesId, page, pageSize],
    queryFn: () => fetchNanosystems(`seriesId=${seriesId}`, page, pageSize),
    placeholderData: (previousData) => previousData,
    retry: 1,
  });

  if (isSeriesLoading) {
    return <div className="text-center py-8">Loading series data...</div>;
  }

  if (!series) {
    return <div className="text-center py-8">Series not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Шапка серии */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            Series: {series.id}
          </h2>
          <p className="text-blue-200">
            Particle kind: {series.particleKind}
          </p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Блоки с параметрами серии */}
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

      {/* Список наносистем */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-800">
            Generated Nanosystems
          </h3>
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
                  {nanosystems?.data.map((system) => {
                      return (
                          <tr key={system.id} className="hover:bg-gray-50">
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
                                  {(system.generationStart)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Generated{/*  TODO */}
                                  </span>
                              </td>
                          </tr>
                      );
                  })}
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
    </div>
  );
};

// Компонент для отображения параметров
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