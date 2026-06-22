import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  BeakerIcon,
  CalculatorIcon,
  ChartBarSquareIcon,
  ChartBarIcon,
  CubeTransparentIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getSeriesCalculationsUrl } from '@/lib/navigation';
import { SCATTERING } from '@/lib/scatteringLabels';

export type WorkspaceSection = 'overview' | 'calculations' | 'legacy' | 'radial' | 'saxs';

interface NanosystemWorkspaceSidebarProps {
  seriesId: string;
  activeSection: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
  onDownload: () => void;
  onView3D?: () => void;
  onCalculate: () => void;
  onAnalyse: () => void;
  onScatteringCalculate: () => void;
  onOpenNewWindow?: () => void;
  standalone?: boolean;
  legacyCount?: number;
  radialCount?: number;
  saxsCount?: number;
}

const NavItem = ({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
      active
        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 font-medium'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
  >
    <span>{label}</span>
    {count != null && count > 0 && (
      <span className={`text-xs tabular-nums ${active ? 'opacity-70' : 'text-gray-400'}`}>{count}</span>
    )}
  </button>
);

export const NanosystemWorkspaceSidebar = ({
  seriesId,
  activeSection,
  onSectionChange,
  onDownload,
  onView3D,
  onCalculate,
  onAnalyse,
  onScatteringCalculate,
  onOpenNewWindow,
  standalone = false,
  legacyCount = 0,
  radialCount = 0,
  saxsCount = 0,
}: NanosystemWorkspaceSidebarProps) => (
  <aside className="w-full lg:w-48 shrink-0 flex flex-col gap-4">
    {!standalone && (
      <Link
        to={`/series/${seriesId}`}
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Series
      </Link>
    )}

    <nav className="space-y-0.5">
      <NavItem active={activeSection === 'overview'} label="Overview" onClick={() => onSectionChange('overview')} />
      <NavItem
        active={activeSection === 'calculations'}
        label="Compare"
        onClick={() => onSectionChange('calculations')}
      />
      <NavItem
        active={activeSection === 'legacy'}
        label={SCATTERING.modelShort}
        count={legacyCount}
        onClick={() => onSectionChange('legacy')}
      />
      <NavItem
        active={activeSection === 'saxs'}
        label={SCATTERING.theoryShort}
        count={saxsCount}
        onClick={() => onSectionChange('saxs')}
      />
      <NavItem
        active={activeSection === 'radial'}
        label="Radial"
        count={radialCount}
        onClick={() => onSectionChange('radial')}
      />
    </nav>

    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
      <button type="button" onClick={onDownload} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900">
        <ArrowDownTrayIcon className="h-3.5 w-3.5" /> Download
      </button>
      {onView3D && (
        <button type="button" onClick={onView3D} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900">
          <CubeTransparentIcon className="h-3.5 w-3.5" /> 3D
        </button>
      )}
      <button type="button" onClick={onCalculate} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-700 hover:text-indigo-900">
        <CalculatorIcon className="h-3.5 w-3.5" /> {SCATTERING.runModel}
      </button>
      <button type="button" onClick={onAnalyse} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900">
        <ChartBarIcon className="h-3.5 w-3.5" /> Radial analysis
      </button>
      <button type="button" onClick={onScatteringCalculate} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-orange-700 hover:text-orange-900">
        <BeakerIcon className="h-3.5 w-3.5" /> {SCATTERING.runTheory}
      </button>
      <Link
        to={getSeriesCalculationsUrl(seriesId)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-violet-700 hover:text-violet-900"
      >
        <ChartBarSquareIcon className="h-3.5 w-3.5" /> Series charts
      </Link>
      {onOpenNewWindow && !standalone && (
        <button type="button" onClick={onOpenNewWindow} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900">
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" /> New window
        </button>
      )}
    </div>
  </aside>
);
