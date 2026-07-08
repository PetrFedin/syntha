import type { CommissionRecord, CommissionStatus } from '@/lib/distributor/sub-agent-commission';
import type { Workshop2B2bCommissionLine } from '@/lib/production/workshop2-b2b-commission';

const REP_DISPLAY: Record<string, string> = {
  'rep-anna': 'Anna (rep-anna)',
  'rep-ivan': 'Ivan (rep-ivan)',
};

export function resolveBrandAgentRepDisplayName(repId: string): string {
  const id = repId.trim();
  return REP_DISPLAY[id] ?? id;
}

export function mapWorkshop2PayoutStatusToCommissionStatus(
  payoutStatus?: Workshop2B2bCommissionLine['payoutStatus']
): CommissionStatus {
  if (payoutStatus === 'paid') return 'paid';
  if (payoutStatus === 'payout_pending') return 'approved';
  return 'pending';
}

export function workshop2B2bCommissionLineToRecord(
  line: Workshop2B2bCommissionLine
): CommissionRecord {
  const d = new Date(line.attributedAt);
  const period = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

  return {
    id: line.id ?? `${line.repId}-${line.orderId}`,
    subAgentId: line.repId,
    subAgentName: resolveBrandAgentRepDisplayName(line.repId),
    period,
    orderIds: [line.orderId],
    revenueRub: line.orderTotalRub,
    commissionRub: line.commissionRub,
    status: mapWorkshop2PayoutStatusToCommissionStatus(line.payoutStatus),
    commissionType: 'per_order',
  };
}

export function workshop2B2bCommissionLinesToRecords(
  lines: readonly Workshop2B2bCommissionLine[]
): CommissionRecord[] {
  return lines.map(workshop2B2bCommissionLineToRecord);
}
