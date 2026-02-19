import React, { useState } from 'react';
import { NanosystemFilters } from './NanosystemFilters';
import { useNavigate } from 'react-router-dom';
import { useNanosystemSeries } from '../hooks/useNanosystems';
import {Pagination, LoadingSkeleton, ParticleKindBadge} from '@/components';
import type {NanosystemSeriesDto} from '../api/nanosystemTypes.ts';
import {EyeIcon} from '@heroicons/react/16/solid';
import { deleteSeries } from '../api/nanosystemApi';
import { useToastContext } from '@/contexts/ToastContext';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useNanosystemSeries(
    searchQuery,
    page,
    pageSize,
  );
  const { showSuccess, showError } = useToastContext();
  const navigate = useNavigate();

  const handleDeleteSeries = async (password?: string) => {
    if (!seriesToDelete) return;
    if (!password || password !== '123') {
      showError('Password Required', 'Password "123" is required to delete a series.');
      return;
    }
    try {
      await deleteSeries({ seriesId: seriesToDelete });
      setIsDeleteDialogOpen(false);
      setSeriesToDelete(null);
      showSuccess('Series Deleted', 'The series and all related nanosystems have been deleted.');
      refetch();
    } catch (error) {
      showError('Delete Failed', error instanceof Error ? error.message : 'Failed to delete series.');
    }
  };

  if (isError) return <ErrorState />;

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
        {/* Header and Search */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
              Nanosystem Series
            </h2>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Total: {data?.result.count || 0}
              </span>
            </div>
          </div>
          <div>
            <NanosystemFilters onFilterChange={setSearchQuery}></NanosystemFilters>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <TableContent 
            isLoading={isLoading}
            data={data?.result.data}
            pageSize={pageSize}
            onDelete={(seriesId) => {
              setSeriesToDelete(seriesId);
              setIsDeleteDialogOpen(true);
            }}
          />
        </div>

        {/* Pagination */}
        <div className="p-3 sm:p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={page}
            totalItems={data?.result.count || 0}
            onPageChange={setPage}
            pageSize={pageSize}
          />
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSeriesToDelete(null);
        }}
        onConfirm={handleDeleteSeries}
        title="Delete Series"
        message="Are you sure you want to delete this series? This will permanently delete the series and ALL nanosystems in it, including all radial analyses, metrics, and objects from storage. This action cannot be undone."
        confirmButtonText="Delete Series"
        requirePassword={true}
      />
    </>
  );
};

const TableContent = ({
  isLoading,
  data,
  pageSize,
  onDelete,
}: {
  isLoading: boolean
  data?: NanosystemSeriesDto[]
  pageSize: number
  onDelete?: (seriesId: string) => void
}) => {
  if (isLoading) return <LoadingSkeleton rows={pageSize} />;
  if (!data?.length) return <EmptyState />;

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <TableHeader />
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((ns) => (
              <TableRow key={ns.id} data={ns} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((ns) => (
          <MobileCardRow key={ns.id} data={ns} onDelete={onDelete} />
        ))}
      </div>
    </>
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

const TableRow = ({ data, onDelete }: { data: NanosystemSeriesDto; onDelete?: (seriesId: string) => void }) => {
  return (<tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <TableCell>
      <ParticleKindBadge kind={data.particleKind} />
    </TableCell>
    <TableCell>
      {data.particleCountFrom} - {data.particleCountTo}
    </TableCell>
    <TableCell>
      {data.globalSizeFrom} - {data.globalSizeTo}
    </TableCell>
    <TableCell>
      {(data.numericalConcentrationFrom * 100)} - {(data.numericalConcentrationTo * 100)}%
    </TableCell>
    <TableCell>
      {data.excessFrom} - {data.excessTo}
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <DetailsButton id={data.id} />
        {onDelete && (
          <DeleteButton 
            seriesId={data.id} 
            onDelete={onDelete}
          />
        )}
      </div>
    </TableCell>
  </tr>);

};

const DetailsButton = ({ id }: { id: string }) => {
  const navigate = useNavigate();
    return (<button 
      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md 
                bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300
                hover:bg-blue-100 dark:hover:bg-blue-900/50 active:bg-blue-200 dark:active:bg-blue-900/70
                transition-colors touch-manipulation"
                onClick={() => navigate(`/series/${id}`)}
      >
      <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
      <span>Details</span>
    </button>
  );
};

const DeleteButton = ({ seriesId, onDelete }: { seriesId: string; onDelete: (seriesId: string) => void }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(seriesId);
      }}
      className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md 
                bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300
                hover:bg-red-100 dark:hover:bg-red-900/50 active:bg-red-200 dark:active:bg-red-900/70
                transition-colors touch-manipulation border border-red-200 dark:border-red-800"
      title="Delete series"
    >
      <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span>Delete</span>
    </button>
  );
};

const MobileCardRow = ({ data, onDelete }: { data: NanosystemSeriesDto; onDelete?: (seriesId: string) => void }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors active:bg-gray-100 dark:active:bg-gray-800 touch-manipulation"
    >
      <div className="flex items-start justify-between mb-2">
        <ParticleKindBadge kind={data.particleKind} />
        <div className="flex items-center gap-2">
          <DetailsButton id={data.id} />
          {onDelete && (
            <DeleteButton 
              seriesId={data.id} 
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Count:</span>
          <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
            {data.particleCountFrom} - {data.particleCountTo}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Size:</span>
          <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
            {data.globalSizeFrom} - {data.globalSizeTo} nm
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Concentration:</span>
          <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
            {(data.numericalConcentrationFrom * 100)} - {(data.numericalConcentrationTo * 100)}%
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Excess:</span>
          <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
            {data.excessFrom} - {data.excessTo}
          </span>
        </div>
      </div>
    </div>
  );
};

// Вспомогательные компоненты
const TableHeaderCell = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
    {children}
  </th>
);

const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 transition-colors duration-150">
    {children}
  </td>
);


const EmptyState = () => (
  <div className="p-4 sm:p-6 md:p-8 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
    No data available
  </div>
);

const ErrorState = () => (
  <div className="p-4 sm:p-6 md:p-8 text-center text-sm sm:text-base text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl">
    Error loading data. Please try again later.
  </div>
);