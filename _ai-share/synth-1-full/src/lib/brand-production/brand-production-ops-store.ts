import type { BrandProductionOpsSnapshot } from '@/lib/production/brand-production-ops-spine';
import type { BrandProductionOpsLocalSyncPayload } from '@/lib/production/brand-production-ops-local-sync';

export async function fetchBrandProductionOpsSnapshot(input: {
  collectionId: string;
  orderId?: string;
}): Promise<{ ok: boolean } & BrandProductionOpsSnapshot> {
  const qs = new URLSearchParams({ collectionId: input.collectionId.trim() });
  if (input.orderId?.trim()) qs.set('orderId', input.orderId.trim());
  const res = await fetch(`/api/brand/production/ops?${qs.toString()}`, { cache: 'no-store' });
  const json = (await res.json()) as { ok?: boolean } & BrandProductionOpsSnapshot;
  if (!res.ok || !json.ok) {
    return { ok: false, poRows: [], bomRows: [], storageMode: 'empty' };
  }
  return {
    ok: true,
    poRows: json.poRows ?? [],
    bomRows: json.bomRows ?? [],
    storageMode: json.storageMode ?? 'empty',
  };
}

export async function syncBrandProductionOpsToSpine(
  payload: BrandProductionOpsLocalSyncPayload
): Promise<
  { ok: boolean; messageRu?: string } & BrandProductionOpsSnapshot & {
      poSynced?: number;
      bomSynced?: number;
    }
> {
  const res = await fetch('/api/brand/production/ops', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'sync-local', payload }),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    messageRu?: string;
    poSynced?: number;
    bomSynced?: number;
  } & BrandProductionOpsSnapshot;
  if (!res.ok || !json.ok) {
    return { ok: false, poRows: [], bomRows: [], storageMode: 'empty', messageRu: json.messageRu };
  }
  return {
    ok: true,
    poRows: json.poRows ?? [],
    bomRows: json.bomRows ?? [],
    storageMode: json.storageMode ?? 'empty',
    poSynced: json.poSynced,
    bomSynced: json.bomSynced,
    messageRu: json.messageRu,
  };
}
