import React from 'react';
import { NanosystemFilters } from './NanosystemFilters';
import { useNavigate } from 'react-router-dom';
import { useNanosystemSeries } from '../hooks/useNanosystems';
import {Pagination, LoadingSkeleton, ParticleKindBadge} from '@/components';
import type {NanosystemSeriesDto} from '../api/nanosystemTypes.ts';
import {EyeIcon} from '@heroicons/react/16/solid';

interface NanosystemsTableProps {
  initialPage?: number
  pageSize?: number
}

export const NanosystemsTable: React.FC<NanosystemsTableProps> = ({
  initialPage = 1,
  pageSize = 10,
}) => {
  const [page, setPage] = React.useState(initialPage);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data, isLoading, isError } = useNanosystemSeries(
    searchQuery,
    page,
    pageSize,
  );

  if (isError) return <ErrorState />;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Header and Search */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Nanosystem Series
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total: {data?.result.count || 0}
            </span>
          </div>

        </div>
        <span>
          <NanosystemFilters onFilterChange={setSearchQuery}></NanosystemFilters>
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <TableContent 
          isLoading={isLoading}
          data={data?.result.data}
          pageSize={pageSize}
        />
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalItems={data?.result.count || 0}
        onPageChange={setPage}
        pageSize={pageSize}
      />
    </div>
  );
};

const TableContent = ({
  isLoading,
  data,
  pageSize,
}: {
  isLoading: boolean
  data?: NanosystemSeriesDto[]
  pageSize: number
}) => {
  if (isLoading) return <LoadingSkeleton rows={pageSize} />;
  if (!data?.length) return <EmptyState />;

  return (
    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
      <TableHeader />
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((ns) => (
          <TableRow key={ns.id} data={ns} />
        ))}
      </tbody>
    </table>
  );
};

const TableHeader = () => (
  <thead className="bg-gray-50 dark:bg-gray-800">
    <tr>
      <TableHeaderCell>Particle kind</TableHeaderCell>
      <TableHeaderCell>Count</TableHeaderCell>
      <TableHeaderCell>Size (nm)</TableHeaderCell>
      <TableHeaderCell>Concentration</TableHeaderCell>
      <TableHeaderCell>Excess</TableHeaderCell>
      <TableHeaderCell>Actions</TableHeaderCell>
    </tr>
  </thead>
);

const TableRow = ({ data }: { data: NanosystemSeriesDto }) => {
  return (<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <TableCell>
      <ParticleKindBadge kind={data.particleKind} />
    </TableCell>
    <TableCell>
      {data.particleCountFrom} - {data.particleCountTo}
    </TableCell>
    <TableCell>
      {data.globalSizeFrom.toFixed(2)} - {data.globalSizeTo.toFixed(2)}
    </TableCell>
    <TableCell>
      {(data.numericalConcentrationFrom * 100).toFixed(1)} - {(data.numericalConcentrationTo * 100).toFixed(1)}%
    </TableCell>
    <TableCell>
      {data.excessFrom} - {data.excessTo}
    </TableCell>
    <TableCell >
      <DetailsButton id={data.id} />
    </TableCell>
  </tr>);

};

const DetailsButton = ({ id }: { id: string }) => {
  const navigate = useNavigate();
    return (<button 
      className="flex items-center gap-1 px-3 py-1.5 rounded-md 
                bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300
                hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                onClick={() => navigate(`/series/${id}`)}
      >
      <EyeIcon className="h-4 w-4" />
      <span>Details</span>
    </button>
  );

};

// Вспомогательные компоненты
const TableHeaderCell = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
    {children}
  </th>
);

const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 transition-colors duration-150">
    {children}
  </td>
);


const EmptyState = () => (
  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
    No data available
  </div>
);

const ErrorState = () => (
  <div className="p-8 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl">
    Error loading data. Please try again later.
  </div>
);