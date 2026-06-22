import type { ScatteringCalculationDto } from '@/features/nanosystems/api/nanosystemTypes';
import type { SeriesCalculationGroupDto } from '@/features/calculation/api/calculationTypes';
import { formatQRange } from '@/lib/scatteringLabels';

export interface TheoryScatteringGroup {
  groupId: string;
  qVectorFrom: number;
  qVectorTo: number;
  qSpaceMethod: number;
  qScaleMethod: number;
  qSpaceParameter: number;
  systemsCount: number;
  scatteringIds: string[];
  nanosystemIds: string[];
}

export interface MatchedScatteringGroup {
  key: string;
  qLabel: string;
  model?: SeriesCalculationGroupDto;
  theory?: TheoryScatteringGroup;
}

const qKey = (from: number, to: number, method: number, scale: number, param: number) =>
  `${from}|${to}|${method}|${scale}|${param}`;

export function buildTheoryScatteringGroups(calculations: ScatteringCalculationDto[]): TheoryScatteringGroup[] {
  const byKey = new Map<string, ScatteringCalculationDto[]>();

  for (const calc of calculations) {
    const key = qKey(calc.qVectorFrom, calc.qVectorTo, calc.qSpaceMethod, calc.qScaleMethod, calc.qSpaceParameter);
    const list = byKey.get(key) ?? [];
    list.push(calc);
    byKey.set(key, list);
  }

  const groups: TheoryScatteringGroup[] = [];

  for (const [, items] of byKey) {
    const perSystem = new Map<string, ScatteringCalculationDto>();
    for (const calc of items) {
      const existing = perSystem.get(calc.nanosystemId);
      if (!existing || new Date(calc.endDate) > new Date(existing.endDate)) {
        perSystem.set(calc.nanosystemId, calc);
      }
    }
    const picked = Array.from(perSystem.values());
    if (picked.length === 0) continue;
    const sample = picked[0];
    const key = qKey(sample.qVectorFrom, sample.qVectorTo, sample.qSpaceMethod, sample.qScaleMethod, sample.qSpaceParameter);
    groups.push({
      groupId: key.slice(0, 16),
      qVectorFrom: sample.qVectorFrom,
      qVectorTo: sample.qVectorTo,
      qSpaceMethod: sample.qSpaceMethod,
      qScaleMethod: sample.qScaleMethod,
      qSpaceParameter: sample.qSpaceParameter,
      systemsCount: picked.length,
      scatteringIds: picked.map((c) => c.id),
      nanosystemIds: picked.map((c) => c.nanosystemId),
    });
  }

  return groups.sort((a, b) => b.systemsCount - a.systemsCount);
}

export function matchScatteringGroups(
  modelGroups: SeriesCalculationGroupDto[],
  theoryGroups: TheoryScatteringGroup[],
): MatchedScatteringGroup[] {
  const theoryByQ = new Map(
    theoryGroups.map((g) => [
      qKey(g.qVectorFrom, g.qVectorTo, g.qSpaceMethod, g.qScaleMethod, g.qSpaceParameter),
      g,
    ]),
  );

  const keys = new Set<string>();
  for (const m of modelGroups) {
    keys.add(qKey(m.parameters.qVectorFrom, m.parameters.qVectorTo, m.parameters.qSpaceMethod, m.parameters.qScaleMethod, m.parameters.qSpaceParameter));
  }
  for (const t of theoryGroups) {
    keys.add(qKey(t.qVectorFrom, t.qVectorTo, t.qSpaceMethod, t.qScaleMethod, t.qSpaceParameter));
  }

  return Array.from(keys)
    .map((key) => {
      const model = modelGroups.find(
        (g) => qKey(g.parameters.qVectorFrom, g.parameters.qVectorTo, g.parameters.qSpaceMethod, g.parameters.qScaleMethod, g.parameters.qSpaceParameter) === key,
      );
      const theory = theoryByQ.get(key);
      const qFrom = model?.parameters.qVectorFrom ?? theory!.qVectorFrom;
      const qTo = model?.parameters.qVectorTo ?? theory!.qVectorTo;
      return {
        key,
        qLabel: formatQRange(qFrom, qTo),
        model,
        theory,
      };
    })
    .sort((a, b) => {
      const aCount = Math.max(a.model?.systemsCount ?? 0, a.theory?.systemsCount ?? 0);
      const bCount = Math.max(b.model?.systemsCount ?? 0, b.theory?.systemsCount ?? 0);
      return bCount - aCount;
    });
}

export function modelGroupQKey(group: SeriesCalculationGroupDto): string {
  const p = group.parameters;
  return qKey(p.qVectorFrom, p.qVectorTo, p.qSpaceMethod, p.qScaleMethod, p.qSpaceParameter);
}

export function theoryGroupQKey(group: TheoryScatteringGroup): string {
  return qKey(group.qVectorFrom, group.qVectorTo, group.qSpaceMethod, group.qScaleMethod, group.qSpaceParameter);
}
