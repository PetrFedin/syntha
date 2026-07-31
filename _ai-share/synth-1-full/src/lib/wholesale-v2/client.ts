export type WholesaleEntity = Record<string, unknown> & { id: string };

export type WholesaleWorkspace = {
  memberships: WholesaleEntity[];
  organisations: WholesaleEntity[];
  relationships: WholesaleEntity[];
  invitations: WholesaleEntity[];
  campaigns: WholesaleEntity[];
  collections: WholesaleEntity[];
  showrooms: WholesaleEntity[];
  cycles: WholesaleEntity[];
  selections: WholesaleEntity[];
  orders: WholesaleEntity[];
  deals: WholesaleEntity[];
  calendar: WholesaleEntity[];
};

export type FirebaseTokenUser = {
  getIdToken(forceRefresh?: boolean): Promise<string>;
};

type ApiEnvelope<T> = { data?: T; error?: { code?: string; message?: string }; requestId?: string };

export async function loadWholesaleWorkspace(
  user: FirebaseTokenUser,
  fetchImpl: typeof fetch = fetch,
): Promise<WholesaleWorkspace> {
  const token = await user.getIdToken();
  if (!token) throw new Error('Firebase ID token is unavailable');
  const response = await fetchImpl('/api/wholesale-v2/workspace', {
    method: 'GET',
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    cache: 'no-store',
  });
  const payload = (await response.json()) as ApiEnvelope<WholesaleWorkspace>;
  if (!response.ok || !payload.data) {
    const code = payload.error?.code ?? `HTTP_${response.status}`;
    throw new Error(`${code}: ${payload.error?.message ?? 'Unable to load wholesale workspace'}`);
  }
  return normalizeWorkspace(payload.data);
}

function normalizeWorkspace(value: WholesaleWorkspace): WholesaleWorkspace {
  return {
    memberships: array(value.memberships),
    organisations: array(value.organisations),
    relationships: array(value.relationships),
    invitations: array(value.invitations),
    campaigns: array(value.campaigns),
    collections: array(value.collections),
    showrooms: array(value.showrooms),
    cycles: array(value.cycles),
    selections: array(value.selections),
    orders: array(value.orders),
    deals: array(value.deals),
    calendar: array(value.calendar),
  };
}

function array(value: WholesaleEntity[] | undefined): WholesaleEntity[] {
  return Array.isArray(value) ? value : [];
}
