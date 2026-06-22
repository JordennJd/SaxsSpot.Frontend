import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SeriesCalculationGroupDto } from '@/features/calculation/api/calculationTypes';
import type { PlotChartRequest } from '@/features/calculation/api/calculationTypes';
import { SCATTERING, formatQRange } from '@/lib/scatteringLabels';
import { matchScatteringGroups, type TheoryScatteringGroup } from '@/lib/theoryScatteringGroups';

interface SeriesGroupComparePanelProps {
  seriesId: string;
  modelGroups: SeriesCalculationGroupDto[];
  theoryGroups: TheoryScatteringGroup[];
  modelLoading?: boolean;
  theoryLoading?: boolean;
  compact?: boolean;
}

function navigateModelAverage(
  navigate: ReturnType<typeof useNavigate>,
  seriesId: string,
  group: SeriesCalculationGroupDto,
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
  params.set('qFrom', String(group.parameters.qVectorFrom));
  params.set('qTo', String(group.parameters.qVectorTo));
  navigate(`/calculations/${group.calculationIds[0]}/chart?${params.toString()}`, {
    state: { request, isAverage: true },
  });
}

function navigateTheoryAverage(
  navigate: ReturnType<typeof useNavigate>,
  seriesId: string,
  group: TheoryScatteringGroup,
) {
  const params = new URLSearchParams();
  params.set('scatteringIds', group.scatteringIds.join(','));
  params.set('isAverage', '1');
  params.set('seriesId', seriesId);
  navigate(`/scattering-calculations/${group.scatteringIds[0]}/chart?${params.toString()}`, {
    state: { scatteringIds: group.scatteringIds, isAverage: true },
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
  compact = false,
}: SeriesGroupComparePanelProps) => {
  const navigate = useNavigate();
  const matched = useMemo(() => matchScatteringGroups(modelGroups, theoryGroups), [modelGroups, theoryGroups]);

  const isLoading = modelLoading || theoryLoading;
  const comparable = matched.filter((m) => m.model && m.theory);

  if (isLoading) {
    return <p className="text-sm text-gray-500 py-4">Loading groups…</p>;
  }

  if (matched.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center border border-dashed rounded-xl">
        No scattering groups yet. Run {SCATTERING.model.toLowerCase()} or {SCATTERING.theory.toLowerCase()} on systems in this series.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Groups matched by Q parameters. Compare averaged {SCATTERING.modelShort.toLowerCase()} with averaged {SCATTERING.theoryShort.toLowerCase()} for the same Q range.
        </p>
      )}

      {comparable.length > 0 && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
          {comparable.length} group{comparable.length === 1 ? '' : 's'} ready to compare
        </p>
      )}

      <ul className="space-y-2">
        {matched.map((row) => {
          const qFrom = row.model?.parameters.qVectorFrom ?? row.theory!.qVectorFrom;
          const qTo = row.model?.parameters.qVectorTo ?? row.theory!.qVectorTo;
          const canCompare = !!row.model && !!row.theory;

          return (
            <li
              key={row.key}
              className={`rounded-xl border p-4 ${
                canCompare
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{formatQRange(qFrom, qTo)}</div>
                  {row.model && (
                    <p className="text-xs text-gray-500 mt-1">
                      φ: {row.model.parameters.phiVectorFrom ?? '—'} – {row.model.parameters.phiVectorTo ?? '—'}
                      {' · '}
                      θ: {row.model.parameters.thetaVectorFrom ?? '—'} – {row.model.parameters.thetaVectorTo ?? '—'}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    <span className={row.model ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-400'}>
                      {SCATTERING.modelShort}: {row.model ? `${row.model.systemsCount} systems` : '—'}
                    </span>
                    <span className={row.theory ? 'text-orange-700 dark:text-orange-300' : 'text-gray-400'}>
                      {SCATTERING.theoryShort}: {row.theory ? `${row.theory.systemsCount} systems` : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {row.model && (
                    <button
                      type="button"
                      onClick={() => navigateModelAverage(navigate, seriesId, row.model!)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      {SCATTERING.modelAverage}
                    </button>
                  )}
                  {row.theory && (
                    <button
                      type="button"
                      onClick={() => navigateTheoryAverage(navigate, seriesId, row.theory!)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600"
                    >
                      {SCATTERING.theoryAverage}
                    </button>
                  )}
                  {canCompare && (
                    <button
                      type="button"
                      onClick={() =>
                        navigateCompare(navigate, seriesId, row.model!.calculationIds, row.theory!.scatteringIds)
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {SCATTERING.compareAverages}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
