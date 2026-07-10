export type PlatformCoreOrderRevisionActor = 'brand' | 'shop';

export type PlatformCoreOrderRevisionStatus =
  | 'draft'
  | 'requested'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'superseded';

export type PlatformCoreOrderLineSnapshot = {
  lineId: string;
  articleId: string;
  skuId?: string;
  colorCode?: string;
  sizeCode?: string;
  quantity: number;
  unitPrice: number;
  deliveryWindow?: string;
};

export type PlatformCoreOrderSnapshot = {
  orderId: string;
  version: number;
  currency: string;
  lines: readonly PlatformCoreOrderLineSnapshot[];
};

export type PlatformCoreOrderRevisionChangeType =
  | 'line_added'
  | 'line_removed'
  | 'quantity_changed'
  | 'unit_price_changed'
  | 'sku_replaced'
  | 'delivery_window_changed';

export type PlatformCoreOrderRevisionChange = {
  lineId: string;
  changeType: PlatformCoreOrderRevisionChangeType;
  before?: PlatformCoreOrderLineSnapshot;
  after?: PlatformCoreOrderLineSnapshot;
};

export type PlatformCoreOrderRevision = {
  revisionId: string;
  orderId: string;
  baseVersion: number;
  proposedVersion: number;
  initiatedBy: PlatformCoreOrderRevisionActor;
  reason: string;
  status: PlatformCoreOrderRevisionStatus;
  changes: readonly PlatformCoreOrderRevisionChange[];
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: PlatformCoreOrderRevisionActor;
};

export type PlatformCoreOrderRevisionDecision = {
  status: 'approved' | 'rejected';
  decidedBy: PlatformCoreOrderRevisionActor;
  decidedAt: string;
  comment?: string;
};

function getLineMap(snapshot: PlatformCoreOrderSnapshot): Map<string, PlatformCoreOrderLineSnapshot> {
  return new Map(snapshot.lines.map((line) => [line.lineId, line]));
}

function lineIdentityChanged(
  before: PlatformCoreOrderLineSnapshot,
  after: PlatformCoreOrderLineSnapshot
): boolean {
  return (
    before.articleId !== after.articleId ||
    before.skuId !== after.skuId ||
    before.colorCode !== after.colorCode ||
    before.sizeCode !== after.sizeCode
  );
}

export function diffPlatformCoreOrderVersions(
  before: PlatformCoreOrderSnapshot,
  after: PlatformCoreOrderSnapshot
): PlatformCoreOrderRevisionChange[] {
  if (before.orderId !== after.orderId) {
    throw new Error('Cannot diff snapshots from different orders');
  }
  if (after.version <= before.version) {
    throw new Error('Proposed order version must be greater than base version');
  }

  const beforeMap = getLineMap(before);
  const afterMap = getLineMap(after);
  const lineIds = new Set([...beforeMap.keys(), ...afterMap.keys()]);
  const changes: PlatformCoreOrderRevisionChange[] = [];

  for (const lineId of lineIds) {
    const previous = beforeMap.get(lineId);
    const next = afterMap.get(lineId);

    if (!previous && next) {
      changes.push({ lineId, changeType: 'line_added', after: next });
      continue;
    }
    if (previous && !next) {
      changes.push({ lineId, changeType: 'line_removed', before: previous });
      continue;
    }
    if (!previous || !next) continue;

    if (lineIdentityChanged(previous, next)) {
      changes.push({ lineId, changeType: 'sku_replaced', before: previous, after: next });
    }
    if (previous.quantity !== next.quantity) {
      changes.push({ lineId, changeType: 'quantity_changed', before: previous, after: next });
    }
    if (previous.unitPrice !== next.unitPrice) {
      changes.push({ lineId, changeType: 'unit_price_changed', before: previous, after: next });
    }
    if (previous.deliveryWindow !== next.deliveryWindow) {
      changes.push({ lineId, changeType: 'delivery_window_changed', before: previous, after: next });
    }
  }

  return changes;
}

export function createPlatformCoreOrderRevision(args: {
  revisionId: string;
  before: PlatformCoreOrderSnapshot;
  after: PlatformCoreOrderSnapshot;
  initiatedBy: PlatformCoreOrderRevisionActor;
  reason: string;
  createdAt: string;
}): PlatformCoreOrderRevision {
  const reason = args.reason.trim();
  if (!reason) throw new Error('Revision reason is required');

  const changes = diffPlatformCoreOrderVersions(args.before, args.after);
  if (changes.length === 0) throw new Error('Revision must contain at least one change');

  return {
    revisionId: args.revisionId,
    orderId: args.before.orderId,
    baseVersion: args.before.version,
    proposedVersion: args.after.version,
    initiatedBy: args.initiatedBy,
    reason,
    status: 'requested',
    changes,
    createdAt: args.createdAt,
  };
}

export function reviewPlatformCoreOrderRevision(
  revision: PlatformCoreOrderRevision,
  decision: PlatformCoreOrderRevisionDecision
): PlatformCoreOrderRevision {
  if (!['requested', 'under_review'].includes(revision.status)) {
    throw new Error(`Revision in status ${revision.status} cannot be reviewed`);
  }
  if (decision.decidedBy === revision.initiatedBy) {
    throw new Error('Revision must be approved or rejected by the counterparty');
  }

  return {
    ...revision,
    status: decision.status,
    reviewedAt: decision.decidedAt,
    reviewedBy: decision.decidedBy,
  };
}

export function getPlatformCoreOrderWorkflowAfterRevision(
  revision: PlatformCoreOrderRevision
): 'revision_pending' | 'confirm_order' | 'revision_rejected' {
  if (revision.status === 'approved') return 'confirm_order';
  if (revision.status === 'rejected') return 'revision_rejected';
  return 'revision_pending';
}

export function canPlatformCoreApplyOrderRevision(revision: PlatformCoreOrderRevision): boolean {
  return revision.status === 'approved' && revision.changes.length > 0;
}
