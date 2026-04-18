import {type ApiResponseListNanosystemDto, type NanosystemDto} from '../../features/nanosystems/api/nanosystemTypes';

function intersectionPlacementLabel(system: NanosystemDto): string {
  if (system.particleKind !== 'Parallelepiped') return '—';
  return system.disableIntersectionOptimizations ? 'SAT-only' : 'Optimized';
}
import { Pagination } from '../ui/Pagination';
import { formatDateTime, formatGenerationDuration } from '@/lib/utils';

interface NanosystemsTableProps {
  nanosystems: ApiResponseListNanosystemDto;
  isLoading: boolean;
  onNanosystemClick: (system: NanosystemDto) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const NanosystemsTable = ({ 
  nanosystems, 
  isLoading, 
  onNanosystemClick, 
  currentPage, 
  pageSize, 
  onPageChange, 
}: NanosystemsTableProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-800">Generated Nanosystems</h3>
        </div>
        <div className="p-6 text-center">Loading nanosystems...</div>
      </div>
    );
  }

  if (nanosystems?.result.count === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-800">Generated Nanosystems</h3>
        </div>
        <div className="p-6 text-center text-gray-500">No nanosystems found</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-200">
        <h3 className="text-sm sm:text-base font-medium text-gray-800">Generated Nanosystems</h3>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particles</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concentration</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Excess</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gen. time</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intersection</th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nanosystems?.result.data.map((system) => (
              <tr
                key={system.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onNanosystemClick(system)}
              >
                <td 
                  className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 cursor-pointer"
                  onClick={() => onNanosystemClick(system)}
                >
                  {system.id.slice(0, 8)}...
                </td>
                <td 
                  className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onClick={() => onNanosystemClick(system)}
                >
                  {system.particleCount.toLocaleString()}
                </td>
                <td 
                  className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onClick={() => onNanosystemClick(system)}
                >
                  {system.globalSize} nm
                </td>
                <td 
                  className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onClick={() => onNanosystemClick(system)}
                >
                  {system.numericalConcentration}
                </td>
                <td 
                  className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onClick={() => onNanosystemClick(system)}
                >
                  {system.excess}
                </td>
                <td 
                  className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onClick={() => onNanosystemClick(system)}
                >
                  {formatDateTime(system.generationStart)}
                </td>
                <td
                  className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono cursor-pointer"
                  onClick={() => onNanosystemClick(system)}
                >
                  {formatGenerationDuration(system.generationStart, system.generationEnd)}
                </td>
                <td
                  className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onClick={() => onNanosystemClick(system)}
                >
                  {intersectionPlacementLabel(system)}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Generated
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {nanosystems?.result.data.map((system) => (
          <div
            key={system.id}
            role="button"
            tabIndex={0}
            className="p-3 hover:bg-gray-50 active:bg-gray-100 touch-manipulation cursor-pointer"
            onClick={() => onNanosystemClick(system)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNanosystemClick(system);
              }
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-blue-600 truncate">
                  ID: {system.id.slice(0, 8)}...
                </p>
              </div>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex-shrink-0 ml-2">
                Generated
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Particles:</span>
                <span className="ml-1 font-medium text-gray-900">{system.particleCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-1 font-medium text-gray-900">{system.globalSize} nm</span>
              </div>
              <div>
                <span className="text-gray-500">Concentration:</span>
                <span className="ml-1 font-medium text-gray-900">{system.numericalConcentration}</span>
              </div>
              <div>
                <span className="text-gray-500">Excess:</span>
                <span className="ml-1 font-medium text-gray-900">{system.excess}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Intersection:</span>
                <span className="ml-1 font-medium text-gray-900">{intersectionPlacementLabel(system)}</span>
              </div>
            </div>
            {(system.generationStart || system.generationEnd) && (
              <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                <div>Generated: {formatDateTime(system.generationStart)}</div>
                <div className="font-mono text-gray-700 dark:text-gray-300">
                  Duration: {formatGenerationDuration(system.generationStart, system.generationEnd)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {nanosystems && (
        <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange}
            totalItems={nanosystems.result.count}
          />
        </div>
      )}
    </div>
  );
}; 