import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { NanosystemDetailsView } from '../components/series/NanosystemDetailsView';
import { NanosystemWorkspaceModals } from '../components/series/NanosystemWorkspaceModals';
import { NanosystemWorkspaceSidebar, type WorkspaceSection } from '../components/nanosystem/NanosystemWorkspaceSidebar';
import { useNanosystemData, useSeriesData } from '../hooks/useSeriesDetail';
import { useNanosystemWorkspace } from '../hooks/useNanosystemWorkspace';
import { formatDateTime, formatGenerationDuration } from '@/lib/utils';
import { openNanosystemInNewWindow } from '@/lib/navigation';
import { SCATTERING } from '@/lib/scatteringLabels';

const parseSection = (tab: string | null): WorkspaceSection => {
  if (tab === 'calculations' || tab === 'legacy' || tab === 'radial' || tab === 'saxs' || tab === 'overview') {
    return tab;
  }
  return 'overview';
};

export const NanosystemDetailPage = () => {
  const { seriesId = '', nanosystemId = '' } = useParams<{ seriesId: string; nanosystemId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const standalone = searchParams.get('standalone') === '1';

  const { data: series, isLoading: isSeriesLoading } = useSeriesData(seriesId);
  const { data: nanosystem, isLoading: isNanosystemLoading, isError } = useNanosystemData(nanosystemId);
  const workspace = useNanosystemWorkspace(nanosystem, seriesId);

  const activeSection = useMemo(
    () => parseSection(searchParams.get('tab')),
    [searchParams],
  );

  const handleSectionChange = (section: WorkspaceSection) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', section);
      return next;
    });
  };

  const viewTab = activeSection === 'calculations' ? 'legacy' : activeSection;

  if (isSeriesLoading || isNanosystemLoading) {
    return <div className="text-center py-16 text-gray-600">Loading nanosystem workspace…</div>;
  }

  if (isError || !nanosystem) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-gray-600">Nanosystem not found.</p>
        <Link to={`/series/${seriesId}`} className="text-indigo-600 hover:underline">Back to series</Link>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${standalone ? 'pb-4' : 'pb-8'}`}>
      {!standalone && (
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-800">Series</Link>
          <ChevronRightIcon className="h-4 w-4 shrink-0" />
          <Link to={`/series/${seriesId}`} className="hover:text-gray-800 truncate max-w-[180px]">
            {series?.comment?.trim() || seriesId.slice(0, 8)}
          </Link>
          <ChevronRightIcon className="h-4 w-4 shrink-0" />
          <span className="text-gray-900 font-medium font-mono">{nanosystem.id.slice(0, 10)}…</span>
        </nav>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-slate-800 to-indigo-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white">Nanosystem workspace</h1>
              <p className="font-mono text-xs text-indigo-200 mt-0.5 break-all">{nanosystem.id}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white">{nanosystem.particleKind}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white">{nanosystem.particleCount.toLocaleString()} pts</span>
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white">{nanosystem.globalSize} nm</span>
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white">
                  {formatGenerationDuration(nanosystem.generationStart, nanosystem.generationEnd)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-white">{formatDateTime(nanosystem.inputDate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[640px]">
          <div className="lg:border-r border-gray-200 dark:border-gray-700 p-4 lg:p-5 bg-gray-50/80 dark:bg-gray-900/40">
            <NanosystemWorkspaceSidebar
              seriesId={seriesId}
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              onDownload={workspace.viewProps.onDownload}
              onView3D={workspace.viewProps.onView3D}
              onCalculate={workspace.viewProps.onCalculate}
              onAnalyse={workspace.viewProps.onAnalyse}
              onScatteringCalculate={workspace.viewProps.onScatteringCalculate}
              onOpenNewWindow={() => openNanosystemInNewWindow(seriesId, nanosystemId, activeSection)}
              standalone={standalone}
              legacyCount={workspace.viewProps.calculations.length}
              radialCount={workspace.viewProps.radialAnalyses.length}
              saxsCount={workspace.viewProps.scatteringCalculations.length}
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            {activeSection === 'calculations' && (
              <div className="px-5 py-3 bg-violet-50 dark:bg-violet-950/30 border-b border-violet-100 dark:border-violet-900/50 text-sm text-violet-800 dark:text-violet-200">
                <strong>Pick & compare:</strong> use checkboxes in {SCATTERING.model} and {SCATTERING.theory} tabs, then build charts or compare pipelines. Switch tabs below without losing this panel.
              </div>
            )}
            <NanosystemDetailsView
              nanosystem={nanosystem}
              layout="page"
              compactChrome
              pickerMode={activeSection === 'calculations'}
              initialTab={viewTab}
              onTabChange={(tab) => handleSectionChange(tab)}
              showFooterActions={false}
              showTabBar={activeSection !== 'calculations'}
              forceTab={activeSection === 'calculations' ? undefined : viewTab}
              {...workspace.viewProps}
            />
          </div>
        </div>
      </div>

      <NanosystemWorkspaceModals workspace={workspace} />
    </div>
  );
};
