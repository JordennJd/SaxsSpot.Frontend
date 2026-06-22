/** User-facing labels for the two scattering pipelines. */
export const SCATTERING = {
  model: 'Scattering by model',
  modelShort: 'By model',
  theory: 'Theory scattering',
  theoryShort: 'Theory',
  compare: 'Model vs theory',
  compareShort: 'Compare',
  runModel: 'Run scattering by model',
  runTheory: 'Run theory scattering',
  runTheorySeries: 'Start theory scattering',
  modelAverage: 'Model average chart',
  theoryAverage: 'Theory average chart',
  compareAverages: 'Compare averages',
  noModelCalcs: 'No scattering-by-model calculations yet.',
  noTheoryCalcs: 'No theory scattering calculations yet.',
} as const;

export const formatQRange = (from: number, to: number) => `Q: ${from} – ${to}`;
