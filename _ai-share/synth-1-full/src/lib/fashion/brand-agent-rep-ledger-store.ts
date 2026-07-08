import type { CommissionRecord } from '@/lib/distributor/sub-agent-commission';

export async function fetchBrandAgentRepLedgerRecords(input?: { repId?: string }): Promise<{
  records: CommissionRecord[];
  mode: 'postgres' | 'file' | 'memory' | 'empty';
}> {
  const qs = input?.repId?.trim() ? `?repId=${encodeURIComponent(input.repId.trim())}` : '';
  const res = await fetch(`/api/brand/b2b/agent-rep/ledger${qs}`, { cache: 'no-store' });
  const json = (await res.json()) as {
    ok?: boolean;
    records?: CommissionRecord[];
    mode?: 'postgres' | 'file' | 'memory' | 'empty';
  };
  if (!res.ok || !json.ok) {
    return { records: [], mode: 'empty' };
  }
  return {
    records: json.records ?? [],
    mode: json.mode ?? 'empty',
  };
}

export async function fetchShopAgentRepCommissionSummary(repId: string): Promise<{
  lines: Array<{
    orderId: string;
    commissionRub: number;
    orderTotalRub: number;
    customerName?: string;
    attributedAt: string;
  }>;
  totalCommissionRub: number;
  mode: 'postgres' | 'file' | 'memory' | 'empty';
}> {
  const res = await fetch(`/api/shop/b2b/commissions?repId=${encodeURIComponent(repId)}`, {
    cache: 'no-store',
  });
  const json = (await res.json()) as {
    ok?: boolean;
    lines?: Array<{
      orderId: string;
      commissionRub: number;
      orderTotalRub: number;
      customerName?: string;
      attributedAt: string;
    }>;
    totalCommissionRub?: number;
    mode?: 'postgres' | 'file' | 'memory' | 'empty';
  };
  if (!res.ok || !json.ok) {
    return { lines: [], totalCommissionRub: 0, mode: 'empty' };
  }
  return {
    lines: json.lines ?? [],
    totalCommissionRub: json.totalCommissionRub ?? 0,
    mode: json.mode ?? 'empty',
  };
}
