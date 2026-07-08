export type BrandAgentRepCommissionDisputeInput = {
  commissionId: string;
  reasonRu: string;
  repName?: string;
};

export type BrandAgentRepCommissionDisputeRecord = {
  disputeId: string;
  commissionId: string;
  reasonRu: string;
  repName: string | null;
  status: 'received';
  createdAt: string;
};

export type BrandAgentRepCommissionDisputeResponse = {
  ok: boolean;
  dispute?: BrandAgentRepCommissionDisputeRecord;
  storageMode?: 'postgres' | 'pg' | 'file' | 'memory' | 'demo';
  disputes?: BrandAgentRepCommissionDisputeRecord[];
  messageRu?: string;
};

export async function fetchBrandAgentRepCommissionDisputes(): Promise<
  BrandAgentRepCommissionDisputeResponse & {
    disputes: BrandAgentRepCommissionDisputeRecord[];
  }
> {
  const res = await fetch('/api/brand/b2b/commissions/dispute');
  const json = (await res.json()) as BrandAgentRepCommissionDisputeResponse & {
    disputes?: BrandAgentRepCommissionDisputeRecord[];
  };
  return {
    ok: Boolean(json.ok),
    disputes: Array.isArray(json.disputes) ? json.disputes : [],
    storageMode: json.storageMode,
    messageRu: json.messageRu,
  };
}

export async function postBrandAgentRepCommissionDispute(
  input: BrandAgentRepCommissionDisputeInput
): Promise<BrandAgentRepCommissionDisputeResponse> {
  const res = await fetch('/api/brand/b2b/commissions/dispute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = (await res.json()) as BrandAgentRepCommissionDisputeResponse;
  if (!res.ok || !json.ok) {
    return { ok: false, messageRu: json.messageRu ?? 'Не удалось отправить спор.' };
  }
  return json;
}
