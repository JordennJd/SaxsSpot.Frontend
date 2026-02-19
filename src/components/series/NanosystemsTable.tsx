import {type ApiResponseListNanosystemDto, type NanosystemDto} from '../../features/nanosystems/api/nanosystemTypes';
import { Pagination } from '../ui/Pagination';

interface NanosystemsTableProps {
  nanosystems: ApiResponseListNanosystemDto;
  isLoading: boolean;
  onNanosystemClick: (system: NanosystemDto) => void;
  onDelete?: (systemId: string) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const NanosystemsTable = ({ 
  nanosystems, 
  isLoading, 
  onNanosystemClick,
  onDelete,
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
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {onDelete && (
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nanosystems?.result.data.map((system) => (
              <tr
                key={system.id}
                className="hover:bg-gray-50"
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
                  {system.generationStart}
                </td>
                <td 
                  className="px-4 lg:px-6 py-4 whitespace-nowrap cursor-pointer"
                  onClick={() => onNanosystemClick(system)}
                >
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Generated
                  </span>
                </td>
                {onDelete && (
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(system.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      title="Delete nanosystem"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </td>
                )}
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
            className="p-3 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
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
            </div>
            {system.generationStart && (
              <div className="mt-2 text-xs text-gray-500">
                Generated: {system.generationStart}
              </div>
            )}
            {onDelete && (
              <div className="mt-3">
                <button
                  onClick={() => onNanosystemClick(system)}
                  className="w-full mb-2 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => onDelete(system.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete System
                </button>
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