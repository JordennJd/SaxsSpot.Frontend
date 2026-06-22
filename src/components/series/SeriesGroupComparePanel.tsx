import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlotChartRequest } from '@/features/calculation/api/calculationTypes';
import { SCATTERING, formatQRange } from '@/lib/scatteringLabels';
import { matchScatteringGroups, type QRangeGroup } from '@/lib/theoryScatteringGroups';

interface SeriesGroupComparePanelProps {
  seriesId: string;
  modelGroups: QRangeGroup[];
  theoryGroups: QRangeGroup[];
  modelLoading?: boolean;
  theoryLoading?: boolean;
}

function navigateModelAverage(
  navigate: ReturnType<typeof useNavigate>,
  seriesId: string,
  group: QRangeGroup,
) {
  const request: PlotChartRequest = {
    CalculatesId: group.calculationIds,
    ChartTitle: `${SCATTERING.model} (average)`,
    XAxis: 'Q',
    YAxis: 'I',
    ScaleMethodsX: 'Log',
    ScaleMethodsY: 'Log',
  };
  const params = new URLSearchParams();
  params.set('calcIds', group.calculationIds.join(','));
  params.set('isAverage', '1');
  params.set('seriesId', seriesId);
  params.set('qFrom', String(group.qVectorFrom));
  params.set('qTo', String(group.qVectorTo));
  navigate(`/calculations/${group.calculationIds[0]}/chart?${params.toString()}`, {
    state: { request, isAverage: true },
  });
}

function navigateTheoryAverage(
  navigate: ReturnType<typeof useNavigate>,
  seriesId: string,
  group: QRangeGroup,
) {
  const ids = group.calculationIds;
  const params = new URLSearchParams();
  params.set('scatteringIds', ids.join(','));
  params.set('isAverage', '1');
  params.set('seriesId', seriesId);
  navigate(`/scattering-calculations/${ids[0]}/chart?${params.toString()}`, {
    state: { scatteringIds: ids, isAverage: true },
  });
}

function navigateCompare(
  navigate: ReturnType<typeof useNavigate>,
  seriesId: string,
  modelIds: string[],
  theoryIds: string[],
) {
  const params = new URLSearchParams();
  params.set('legacyIds', modelIds.join(','));
  params.set('nanoIds', theoryIds.join(','));
  params.set('averageLegacy', '1');
  params.set('averageNano', '1');
  params.set('seriesId', seriesId);
  navigate(`/scattering-calculations/compare/chart?${params.toString()}`, {
    state: {
      request: {
        LegacyCalculationIds: modelIds,
        NanoScatteringIds: theoryIds,
        ChartTitle: SCATTERING.compare,
        XAxis: 'Q',
        YAxis: 'I',
        AverageLegacy: true,
        AverageNano: true,
        ScaleMethodsX: 'Log',
        ScaleMethodsY: 'Log',
      },
    },
  });
}

export const SeriesGroupComparePanel = ({
  seriesId,
  modelGroups,
  theoryGroups,
  modelLoading = false,
  theoryLoading = false,
}: SeriesGroupComparePanelProps) => {
  const navigate = useNavigate();
  const matched = useMemo(() => matchScatteringGroups(modelGroups, theoryGroups), [modelGroups, theoryGroups]);

  const isLoading = modelLoading || theoryLoading;
  const comparable = matched.filter((m) => m.model && m.theory);

  if (isLoading) {
    return <p className="text-sm text-gray-500 py-4">Loading…</p>;
  }

  if (matched.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center border border-dashed rounded-lg">
        No Q groups yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {matched.map((row) => {
        const qFrom = row.model?.qVectorFrom ?? row.theory!.qVectorFrom;
        const qTo = row.model?.qVectorTo ?? row.theory!.qVectorTo;
        const canCompare = !!row.model && !!row.theory;

        return (
          <li
            key={row.key}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 bg-white dark:bg-gray-800/50"
          >
            <div className="min-w-0">
              <div className="font-medium text-sm text-gray-900 dark:text-white">{formatQRange(qFrom, qTo)}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {SCATTERING.modelShort}: {row.model?.systemsCount ?? '—'}
                {' · '}
                {SCATTERING.theoryShort}: {row.theory?.systemsCount ?? '—'}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 shrink-0">
              {row.model && (
                <button
                  type="button"
                  onClick={() => navigateModelAverage(navigate, seriesId, row.model!)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/50"
                >
                  Model avg
                </button>
              )}
              {row.theory && (
                <button
                  type="button"
                  onClick={() => navigateTheoryAverage(navigate, seriesId, row.theory!)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 dark:text-orange-300 dark:bg-orange-950/50"
                >
                  Theory avg
                </button>
              )}
              {canCompare && (
                <button
                  type="button"
                  onClick={() =>
                    navigateCompare(navigate, seriesId, row.model!.calculationIds, row.theory!.calculationIds)
                  }
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Compare
                </button>
              )}
            </div>
          </li>
        );
      })}
      {comparable.length === 0 && matched.length > 0 && (
        <li className="px-4 py-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/40">
          Run both pipelines with the same Q range to enable comparison.
        </li>
      )}
    </ul>
  );
};
