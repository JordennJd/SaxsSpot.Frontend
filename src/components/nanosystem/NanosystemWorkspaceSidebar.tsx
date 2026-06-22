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

const SectionButton = ({
  active,
  label,
  count,
  icon: Icon,
  onClick,
  accent,
}: {
  active: boolean;
  label: string;
  count?: number;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  accent: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? `${accent} text-white shadow-md`
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
    }`}
  >
    <Icon className="h-5 w-5 shrink-0" />
    <span className="flex-1 text-left">{label}</span>
    {count != null && count > 0 && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'}`}>
        {count}
      </span>
    )}
  </button>
);

const ActionButton = ({
  label,
  icon: Icon,
  onClick,
  variant = 'default',
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'saxs';
}) => {
  const styles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600',
    saxs: 'bg-orange-500 text-white hover:bg-orange-600 border border-orange-500',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${styles[variant]}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
};

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
  <aside className="w-full lg:w-56 xl:w-60 shrink-0 flex flex-col gap-5">
    {!standalone && (
      <Link
        to={`/series/${seriesId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to series
      </Link>
    )}

    <nav className="space-y-1">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Browse</p>
      <SectionButton
        active={activeSection === 'overview'}
        label="Overview"
        icon={ChartBarSquareIcon}
        onClick={() => onSectionChange('overview')}
        accent="bg-slate-700"
      />
      <SectionButton
        active={activeSection === 'calculations'}
        label="Pick & compare"
        icon={ChartBarIcon}
        onClick={() => onSectionChange('calculations')}
        accent="bg-violet-600"
      />
      <SectionButton
        active={activeSection === 'legacy'}
        label="Legacy scattering"
        count={legacyCount}
        icon={CalculatorIcon}
        onClick={() => onSectionChange('legacy')}
        accent="bg-indigo-600"
      />
      <SectionButton
        active={activeSection === 'radial'}
        label="Radial analysis"
        count={radialCount}
        icon={ChartBarIcon}
        onClick={() => onSectionChange('radial')}
        accent="bg-purple-600"
      />
      <SectionButton
        active={activeSection === 'saxs'}
        label="SAXS results"
        count={saxsCount}
        icon={BeakerIcon}
        onClick={() => onSectionChange('saxs')}
        accent="bg-orange-500"
      />
    </nav>

    <div className="space-y-2">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Actions</p>
      <ActionButton label="Download system" icon={ArrowDownTrayIcon} onClick={onDownload} />
      {onView3D && <ActionButton label="3D viewer" icon={CubeTransparentIcon} onClick={onView3D} />}
      <ActionButton label="Run legacy calc" icon={CalculatorIcon} onClick={onCalculate} variant="primary" />
      <ActionButton label="Run radial analysis" icon={ChartBarIcon} onClick={onAnalyse} />
      <ActionButton label="Run SAXS" icon={BeakerIcon} onClick={onScatteringCalculate} variant="saxs" />
    </div>

    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Series</p>
      <Link
        to={getSeriesCalculationsUrl(seriesId)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
      >
        <ChartBarSquareIcon className="h-4 w-4" />
        Series charts & groups
      </Link>
      {onOpenNewWindow && !standalone && (
        <button
          type="button"
          onClick={onOpenNewWindow}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          Open in new window
        </button>
      )}
    </div>
  </aside>
);
