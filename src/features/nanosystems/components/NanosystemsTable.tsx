// src/components/NanosystemsTable.tsx
import React from 'react';
import { useNanosystemSeries } from '../hooks/useNanosystems';
import { ParticleKindBadge } from '../../../components/ui/nanosystems/ParticleKindBadge';
import { Pagination } from '../../../components/ui/Pagination';
import { LoadingSkeleton } from '../../../components/ui/nanosystems/LoadingSkeleton';
import type { NanosystemSeriesDto } from '../api/nanosystemTypes'; 
export const NanosystemsTable = () => {
  const [page, setPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data, isLoading, isError } = useNanosystemSeries(searchQuery, page);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Сброс на первую страницу при новом поиске
  };

  if (isError) return <ErrorState />;
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Заголовок и поиск */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Серии наносистем
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Всего: {data?.count || 0}
          </span>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Поиск по параметрам..."
            className="w-full p-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <TableHeader>Тип частицы</TableHeader>
              <TableHeader>Кол-во</TableHeader>
              <TableHeader>Размер</TableHeader>
              <TableHeader>Концентрация</TableHeader>
              <TableHeader>K-фактор</TableHeader>
              <TableHeader>Действия</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <LoadingSkeleton rows={5} />
            ) : (
              data?.data.map((ns) => (
                <TableRow key={ns.id} data={ns} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <Pagination
          currentPage={page}
          totalItems={data?.count || 0}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

// Компонент строки таблицы
const TableRow = ({ data }: { data: NanosystemSeriesDto }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <TableCell>
      <ParticleKindBadge kind={data.particleKind} />
    </TableCell>
    <TableCell>
      {data.particleCountFrom} - {data.particleCountTo}
    </TableCell>
    <TableCell>
      {data.globalSizeFrom.toFixed(2)} - {data.globalSizeTo.toFixed(2)} нм
    </TableCell>
    <TableCell>
      {(data.numericalConcentrationFrom * 100).toFixed(1)} - {(data.numericalConcentrationTo * 100).toFixed(1)}%
    </TableCell>
    <TableCell>
      {data.kFrom.toFixed(2)} - {data.kTo.toFixed(2)}
    </TableCell>
    <TableCell>
      <button className="text-blue-600 dark:text-blue-400 hover:underline">
        Детали
      </button>
    </TableCell>
  </tr>
);

// Вспомогательные компоненты
const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
    {children}
  </th>
);

const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
    {children}
  </td>
);

const ErrorState = () => (
  <div className="p-8 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl">
    Ошибка загрузки данных. Пожалуйста, попробуйте позже.
  </div>
);