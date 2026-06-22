import type { ScatteringCalculationDto } from '@/features/nanosystems/api/nanosystemTypes';
import type { SeriesCalculationGroupDto } from '@/features/calculation/api/calculationTypes';
import { formatQRange } from '@/lib/scatteringLabels';

/** Group keyed only by Q range (from–to). */
export interface QRangeGroup {
  groupId: string;
  qVectorFrom: number;
  qVectorTo: number;
  systemsCount: number;
  calculationIds: string[];
  nanosystemIds: string[];
}

export interface MatchedScatteringGroup {
  key: string;
  qLabel: string;
  model?: QRangeGroup;
  theory?: QRangeGroup;
}

export const qRangeKey = (from: number, to: number) => `${from}|${to}`;

/** Merge API model groups that share the same Q range (ignores φ, θ and Q grid settings). */
export function mergeModelGroupsByQRange(groups: SeriesCalculationGroupDto[]): QRangeGroup[] {
  const byQ = new Map<string, Map<string, string>>();

  for (const group of groups) {
    const key = qRangeKey(group.parameters.qVectorFrom, group.parameters.qVectorTo);
    const perSystem = byQ.get(key) ?? new Map<string, string>();
    for (let i = 0; i < group.calculationIds.length; i++) {
      const nsId = group.nanosystemIds[i];
      const calcId = group.calculationIds[i];
      if (nsId && calcId && !perSystem.has(nsId)) {
        perSystem.set(nsId, calcId);
      }
    }
    byQ.set(key, perSystem);
  }

  return Array.from(byQ.entries())
    .map(([key, perSystem]) => {
      const [from, to] = key.split('|').map(Number);
      return {
        groupId: key,
        qVectorFrom: from,
        qVectorTo: to,
        systemsCount: perSystem.size,
        calculationIds: Array.from(perSystem.values()),
        nanosystemIds: Array.from(perSystem.keys()),
      };
    })
    .sort((a, b) => b.systemsCount - a.systemsCount);
}

export function buildTheoryScatteringGroups(calculations: ScatteringCalculationDto[]): QRangeGroup[] {
  const byQ = new Map<string, ScatteringCalculationDto[]>();

  for (const calc of calculations) {
    const key = qRangeKey(calc.qVectorFrom, calc.qVectorTo);
    const list = byQ.get(key) ?? [];
    list.push(calc);
    byQ.set(key, list);
  }

  const groups: QRangeGroup[] = [];

  for (const [key, items] of byQ) {
    const perSystem = new Map<string, ScatteringCalculationDto>();
    for (const calc of items) {
      const existing = perSystem.get(calc.nanosystemId);
      if (!existing || new Date(calc.endDate) > new Date(existing.endDate)) {
        perSystem.set(calc.nanosystemId, calc);
      }
    }
    const picked = Array.from(perSystem.values());
    if (picked.length === 0) continue;
    const [from, to] = key.split('|').map(Number);
    groups.push({
      groupId: key,
      qVectorFrom: from,
      qVectorTo: to,
      systemsCount: picked.length,
      calculationIds: picked.map((c) => c.id),
      nanosystemIds: picked.map((c) => c.nanosystemId),
    });
  }

  return groups.sort((a, b) => b.systemsCount - a.systemsCount);
}

export function matchScatteringGroups(
  modelGroups: QRangeGroup[],
  theoryGroups: QRangeGroup[],
): MatchedScatteringGroup[] {
  const theoryByQ = new Map(theoryGroups.map((g) => [qRangeKey(g.qVectorFrom, g.qVectorTo), g]));

  const keys = new Set<string>();
  for (const m of modelGroups) keys.add(qRangeKey(m.qVectorFrom, m.qVectorTo));
  for (const t of theoryGroups) keys.add(qRangeKey(t.qVectorFrom, t.qVectorTo));

  return Array.from(keys)
    .map((key) => {
      const model = modelGroups.find((g) => qRangeKey(g.qVectorFrom, g.qVectorTo) === key);
      const theory = theoryByQ.get(key);
      const qFrom = model?.qVectorFrom ?? theory!.qVectorFrom;
      const qTo = model?.qVectorTo ?? theory!.qVectorTo;
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
