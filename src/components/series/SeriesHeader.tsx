import { type NanosystemSeriesDto } from '../../features/nanosystems/api/nanosystemTypes';

interface ParameterBlockProps {
  title: string;
  value: string;
  icon: string;
}

interface SeriesHeaderProps {
  series: NanosystemSeriesDto;
}

const ParameterBlock = ({ title, value, icon }: ParameterBlockProps) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex items-center space-x-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-lg font-mono font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export const SeriesHeader = ({ series }: SeriesHeaderProps) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="bg-gradient-to-r from-blue-800 to-indigo-800 px-6 py-4">
      <h2 className="text-xl font-bold text-white">Series: {series.id}</h2>
      <p className="text-blue-200">Particle kind: {series.particleKind}</p>
    </div>

    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ParameterBlock
        title="Particle Count"
        value={`${series.particleCountFrom} - ${series.particleCountTo}`}
        icon="🧮"
      />
      <ParameterBlock
        title="Global Size"
        value={`${series.globalSizeFrom.toFixed(2)} - ${series.globalSizeTo.toFixed(2)} nm`}
        icon="📏"
      />
      <ParameterBlock
        title="Concentration"
        value={`${series.numericalConcentrationFrom} - ${series.numericalConcentrationTo}`}
        icon="🧪"
      />
      <ParameterBlock
        title="Particle Size"
        value={`${series.minParticleSizeFrom.toFixed(2)} - ${series.maxParticleSizeTo.toFixed(2)} nm`}
        icon="🔬"
      />
      <ParameterBlock
        title="Excess"
        value={series.excessFrom ? `${series.excessFrom.toFixed(2)} - ${series.excessTo?.toFixed(2)}` : 'N/A'}
        icon="⚖️"
      />
      <ParameterBlock
        title="K Parameter"
        value={`${series.kFrom.toFixed(2)} - ${series.kTo.toFixed(2)}`}
        icon="𝛋"
      />
      <ParameterBlock
        title="Theta"
        value={`${series.thetaFrom.toFixed(1)} - ${series.thetaTo.toFixed(1)}`}
        icon="∠"
      />
    </div>
  </div>
); 