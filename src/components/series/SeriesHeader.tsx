import { type NanosystemSeriesDto } from '../../features/nanosystems/api/nanosystemTypes';

interface ParameterBlockProps {
  title: string;
  value: string;
  icon: string;
}

interface SeriesHeaderProps {
  series: NanosystemSeriesDto;
  onDelete?: () => void;
}

const ParameterBlock = ({ title, value, icon }: ParameterBlockProps) => (
  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
    <div className="flex items-center space-x-2 sm:space-x-3">
      <span className="text-xl sm:text-2xl flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs sm:text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-sm sm:text-base md:text-lg font-mono font-semibold text-gray-900 break-words">{value}</p>
      </div>
    </div>
  </div>
);

export const SeriesHeader = ({ series, onDelete }: SeriesHeaderProps) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="bg-gradient-to-r from-blue-800 to-indigo-800 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-start">
      <div className="flex-1">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white break-words">Series: {series.id}</h2>
        <p className="text-sm sm:text-base text-blue-200 mt-1">Particle kind: {series.particleKind}</p>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-4 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-blue-800"
          title="Delete series"
        >
          Delete Series
        </button>
      )}
    </div>

    <div className="p-3 sm:p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      <ParameterBlock
        title="Particle Count"
        value={`${series.particleCountFrom} - ${series.particleCountTo}`}
        icon="🧮"
      />
      <ParameterBlock
        title="Global Size"
        value={`${series.globalSizeFrom} - ${series.globalSizeTo} nm`}
        icon="📏"
      />
      <ParameterBlock
        title="Concentration"
        value={`${series.numericalConcentrationFrom} - ${series.numericalConcentrationTo}`}
        icon="🧪"
      />
      <ParameterBlock
        title="Particle Size"
        value={`${series.minParticleSizeFrom} - ${series.maxParticleSizeTo} nm`}
        icon="🔬"
      />
      <ParameterBlock
        title="Excess"
        value={series.excessFrom ? `${series.excessFrom} - ${series.excessTo}` : 'N/A'}
        icon="⚖️"
      />
      <ParameterBlock
        title="K Parameter"
        value={`${series.kFrom} - ${series.kTo}`}
        icon="𝛋"
      />
      <ParameterBlock
        title="Theta"
        value={`${series.thetaFrom} - ${series.thetaTo}`}
        icon="∠"
      />
    </div>
  </div>
); 