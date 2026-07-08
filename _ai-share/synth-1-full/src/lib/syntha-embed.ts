/** `synthaEmbed=1` — полное приложение из device preview (MacBook) или iframe embed. */
export function isSynthaEmbedSearchParam(
  search: string | URLSearchParams | null | undefined
): boolean {
  if (!search) return false;
  try {
    const params = typeof search === 'string' ? new URLSearchParams(search) : search;
    return params.get('synthaEmbed') === '1';
  } catch {
    return false;
  }
}

export function isSynthaEmbedClient(): boolean {
  if (typeof window === 'undefined') return false;
  return isSynthaEmbedSearchParam(window.location.search);
}
