export function buildWholesaleV2CorePath(pathParts: readonly string[]): string {
  const normalized = pathParts.filter(Boolean).map((part) => decodeURIComponent(part));
  if (normalized.length === 1 && (normalized[0] === 'health' || normalized[0] === 'openapi.json')) {
    return `/${normalized[0]}`;
  }
  return `/v2/${normalized.map(encodeURIComponent).join('/')}`;
}

export function createWholesaleV2CoreRequest(request: Request, pathParts: readonly string[]): Request {
  const url = new URL(request.url);
  url.pathname = buildWholesaleV2CorePath(pathParts);
  return new Request(url, request);
}
