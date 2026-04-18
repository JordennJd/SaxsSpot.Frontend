/** Escape special Gridify characters in user-provided filter values. */
export function escapeGridifyValue(value: string): string {
  return value.replace(/([(),|\\]|\/i)/g, '\\$1');
}

export type SeriesFilterForm = {
  commentContains: string;
  particleKind: '' | '0' | '1';
  /** '' = any, 'yes' = SAT-only series, 'no' = optimized intersection path */
  satOnly: '' | 'yes' | 'no';
  createdAtFrom: string;
  createdAtTo: string;
  particleCountMin: string;
  particleCountMax: string;
  globalSizeMin: string;
  globalSizeMax: string;
  concentrationMin: string;
  concentrationMax: string;
};

const empty = (s: string) => s.trim() === '';

/** AND-combine Gridify clauses (comma = AND in Gridify). */
function joinAnd(parts: string[]): string {
  return parts.filter(Boolean).join(',');
}

/**
 * Gridify filter for nanosystem_series list.
 * Uses overlap semantics for numeric ranges (series interval intersects [min,max]).
 */
export function buildSeriesListGridifyFilter(f: SeriesFilterForm): string {
  const parts: string[] = [];

  if (!empty(f.commentContains)) {
    parts.push(`comment=*${escapeGridifyValue(f.commentContains.trim())}/i`);
  }

  if (f.particleKind === '0' || f.particleKind === '1') {
    parts.push(`ParticleKind=${f.particleKind}`);
  }

  if (f.satOnly === 'yes') {
    parts.push('DisableIntersectionOptimizations=true');
  } else if (f.satOnly === 'no') {
    parts.push('DisableIntersectionOptimizations=false');
  }

  const caFrom = f.createdAtFrom.trim();
  const caTo = f.createdAtTo.trim();
  if (!empty(caFrom)) {
    parts.push(`CreatedAt>=${caFrom}T00:00:00`);
  }
  if (!empty(caTo)) {
    parts.push(`CreatedAt<=${caTo}T23:59:59.999`);
  }

  const pcMin = f.particleCountMin.trim();
  const pcMax = f.particleCountMax.trim();
  if (!empty(pcMin) && !empty(pcMax)) {
    parts.push(`ParticleCountFrom<=${pcMax}`, `ParticleCountTo>=${pcMin}`);
  } else if (!empty(pcMin)) {
    parts.push(`ParticleCountTo>=${pcMin}`);
  } else if (!empty(pcMax)) {
    parts.push(`ParticleCountFrom<=${pcMax}`);
  }

  const gsMin = f.globalSizeMin.trim();
  const gsMax = f.globalSizeMax.trim();
  if (!empty(gsMin) && !empty(gsMax)) {
    parts.push(`GlobalSizeFrom<=${gsMax}`, `GlobalSizeTo>=${gsMin}`);
  } else if (!empty(gsMin)) {
    parts.push(`GlobalSizeTo>=${gsMin}`);
  } else if (!empty(gsMax)) {
    parts.push(`GlobalSizeFrom<=${gsMax}`);
  }

  const cMin = f.concentrationMin.trim();
  const cMax = f.concentrationMax.trim();
  if (!empty(cMin) && !empty(cMax)) {
    parts.push(`NumericalConcentrationFrom<=${cMax}`, `NumericalConcentrationTo>=${cMin}`);
  } else if (!empty(cMin)) {
    parts.push(`NumericalConcentrationTo>=${cMin}`);
  } else if (!empty(cMax)) {
    parts.push(`NumericalConcentrationFrom<=${cMax}`);
  }

  return joinAnd(parts);
}

export type NanosystemFilterForm = {
  particleCountMin: string;
  particleCountMax: string;
  kMin: string;
  kMax: string;
  thetaMin: string;
  thetaMax: string;
  inputDateFrom: string;
  inputDateTo: string;
};

/** Extra Gridify fragment for nanosystems in a series (without seriesId=). */
export function buildNanosystemListGridifyFilter(f: NanosystemFilterForm): string {
  const parts: string[] = [];

  const pcMin = f.particleCountMin.trim();
  const pcMax = f.particleCountMax.trim();
  if (!empty(pcMin)) parts.push(`ParticleCount>=${pcMin}`);
  if (!empty(pcMax)) parts.push(`ParticleCount<=${pcMax}`);

  const kMin = f.kMin.trim();
  const kMax = f.kMax.trim();
  if (!empty(kMin)) parts.push(`K>=${kMin}`);
  if (!empty(kMax)) parts.push(`K<=${kMax}`);

  const tMin = f.thetaMin.trim();
  const tMax = f.thetaMax.trim();
  if (!empty(tMin)) parts.push(`Theta>=${tMin}`);
  if (!empty(tMax)) parts.push(`Theta<=${tMax}`);

  const dFrom = f.inputDateFrom.trim();
  const dTo = f.inputDateTo.trim();
  if (!empty(dFrom)) parts.push(`InputDate>=${dFrom}T00:00:00`);
  if (!empty(dTo)) parts.push(`InputDate<=${dTo}T23:59:59.999`);

  return joinAnd(parts);
}
