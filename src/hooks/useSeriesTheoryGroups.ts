import { useEffect, useState } from 'react';
import { fetchNanosystemList, fetchScatteringCalculationList } from '@/features/nanosystems/api/nanosystemApi';
import type { ScatteringCalculationDto } from '@/features/nanosystems/api/nanosystemTypes';
import { buildTheoryScatteringGroups, type QRangeGroup } from '@/lib/theoryScatteringGroups';

export function useSeriesTheoryGroups(seriesId: string) {
  const [groups, setGroups] = useState<QRangeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) return;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allCalcs: ScatteringCalculationDto[] = [];
        let page = 1;
        const pageSize = 100;
        while (true) {
          const res = await fetchNanosystemList(`seriesId=${seriesId}`, page, pageSize);
          const systems = res.result.data;
          const batch = await Promise.all(
            systems.map((s) => fetchScatteringCalculationList(s.id, 1, 100).then((r) => r.result.data)),
          );
          allCalcs.push(...batch.flat());
          if (page * pageSize >= res.result.count) break;
          page += 1;
        }
        if (!cancelled) {
          setGroups(buildTheoryScatteringGroups(allCalcs));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load theory groups');
          setGroups([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  return { groups, isLoading, error };
}
