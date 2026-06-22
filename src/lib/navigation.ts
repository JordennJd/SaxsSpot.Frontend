/** Build URL for nanosystem workspace page. */
export function getNanosystemWorkspaceUrl(seriesId: string, nanosystemId: string, tab?: string, standalone = false): string {
  const params = new URLSearchParams();
  if (tab) params.set('tab', tab);
  if (standalone) params.set('standalone', '1');
  const qs = params.toString();
  return `/series/${seriesId}/nanosystems/${nanosystemId}${qs ? `?${qs}` : ''}`;
}

export function getSeriesCalculationsUrl(seriesId: string): string {
  return `/series/${seriesId}/calculations`;
}

/** Open nanosystem workspace in a new browser window (minimal chrome). */
export function openNanosystemInNewWindow(seriesId: string, nanosystemId: string, tab?: string): Window | null {
  const url = getNanosystemWorkspaceUrl(seriesId, nanosystemId, tab, true);
  return window.open(url, '_blank', 'noopener,noreferrer,width=1280,height=900');
}
