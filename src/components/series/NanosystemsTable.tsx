import { type NanosystemDto } from '../../features/nanosystems/api/nanosystemTypes';
import { Pagination } from '../ui/Pagination';
import type { PaginatedResponse } from '../../features/nanosystems/api/common/commonTypes';

interface NanosystemsTableProps {
  nanosystems: PaginatedResponse<NanosystemDto>;
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
  onPageChange 
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

  if (nanosystems?.count === 0) {
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
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Generated Nanosystems</h3>
      </div>

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
                onClick={() => onNanosystemClick(system)}
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
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange}
            totalItems={nanosystems.count}
          />
        </div>
      )}
    </div>
  );
}; 