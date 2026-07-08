import 'server-only';

import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix.types';
import { getWorkshop2ServerDossierStoreMode } from '@/lib/platform-core-ports/dossier-store';
import { getPlatformCoreCapacityForOrder } from '@/lib/platform-core-gateways/capacity-gateway';
import { getPlatformCoreCommsForOrder } from '@/lib/platform-core-gateways/entity-comms-gateway';
import { getPlatformCoreShipmentForOrder } from '@/lib/platform-core-gateways/shipment-gateway';

export type PlatformCoreExceptionGatewaySource =
  | 'platform_core_derived_gate'
  | 'capacity_gateway'
  | 'shipment_gateway'
  | 'comms_gateway';

export type PlatformCoreAdapterIssue = {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
};

export type PlatformCoreExceptionBlocker = {
  id: string;
  source: PlatformCoreExceptionGatewaySource;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ownerRoleId: CoreChainRoleId;
  recoveryAction: string;
};

export type PlatformCoreExceptionSnapshot = {
  orderId: string;
  collectionId?: string;
  articleId?: string;
  source: PlatformCoreExceptionGatewaySource;
  exceptionId: string;
  open: boolean;
  exceptionCount: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  ownerRoleId?: CoreChainRoleId;
  dueAt?: string;
  recoveryAction?: string;
  blockerIds: string[];
  blockers: PlatformCoreExceptionBlocker[];
  linkedThreadId?: string;
  linkedCalendarEventId?: string;
  completenessPct: number;
};

export type PlatformCoreExceptionEvaluation = {
  status: 'core_ready' | 'warning' | 'blocked' | 'needs_input';
  eventCreated: string;
  nextOwnerLabel: string;
  issues: PlatformCoreAdapterIssue[];
};

export type PlatformCoreExceptionOrderResult =
  | {
      ok: true;
      orderId: string;
      collectionId?: string;
      articleId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
      exception: PlatformCoreExceptionSnapshot;
      evaluation: PlatformCoreExceptionEvaluation;
    }
  | {
      ok: false;
      reason: 'invalid_path' | 'not_found';
      orderId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
    };

const SEVERITY_RANK: Record<PlatformCoreExceptionBlocker['severity'], number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function cleanString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t || undefined;
}

function severityFromIssue(
  source: PlatformCoreExceptionGatewaySource,
  severity: PlatformCoreAdapterIssue['severity']
): PlatformCoreExceptionBlocker['severity'] {
  if (severity !== 'blocker') return 'medium';
  if (source === 'shipment_gateway') return 'critical';
  return 'high';
}

function ownerFromSource(
  source: PlatformCoreExceptionGatewaySource,
  issueId: string
): CoreChainRoleId {
  if (source === 'shipment_gateway' && /dpp|document/.test(issueId)) return 'brand';
  if (source === 'shipment_gateway' && /qc/.test(issueId)) return 'manufacturer';
  if (source === 'capacity_gateway') return 'manufacturer';
  return 'brand';
}

function recoveryAction(source: PlatformCoreExceptionGatewaySource): string {
  if (source === 'capacity_gateway')
    return 'Уточнить линию, доступные минуты и дату старта производства.';
  if (source === 'shipment_gateway')
    return 'Закрыть shipment blockers: QC, документы, DPP, ASN или ETA.';
  if (source === 'comms_gateway')
    return 'Зафиксировать решение в entity-chat и поставить срок в календаре.';
  return 'Закрыть blocker и назначить owner.';
}

function blockersFromIssues(input: {
  source: PlatformCoreExceptionGatewaySource;
  issues: readonly PlatformCoreAdapterIssue[];
}): PlatformCoreExceptionBlocker[] {
  return input.issues
    .filter((issue) => issue.severity === 'blocker')
    .map((issue) => ({
      id: `${input.source}.${issue.id}`,
      source: input.source,
      message: issue.message,
      severity: severityFromIssue(input.source, issue.severity),
      ownerRoleId: ownerFromSource(input.source, issue.id),
      recoveryAction: recoveryAction(input.source),
    }));
}

function topBlocker(
  blockers: PlatformCoreExceptionBlocker[]
): PlatformCoreExceptionBlocker | undefined {
  return [...blockers].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])[0];
}

function evaluateException(input: {
  orderId: string;
  blockers: PlatformCoreExceptionBlocker[];
  linkedThreadId?: string;
  linkedCalendarEventId?: string;
  defaultDueAt?: string;
}): { snapshot: PlatformCoreExceptionSnapshot; evaluation: PlatformCoreExceptionEvaluation } {
  const issues: PlatformCoreAdapterIssue[] = [];
  const top = topBlocker(input.blockers);

  if (input.blockers.length > 0 && !input.linkedThreadId) {
    issues.push({
      id: 'exception.thread.missing',
      severity: 'warning',
      message: 'Исключение не связано с entity-chat.',
    });
  }
  if (input.blockers.length > 0 && !input.linkedCalendarEventId && !input.defaultDueAt) {
    issues.push({
      id: 'exception.calendar.missing',
      severity: 'warning',
      message: 'Исключение не связано с календарным сроком.',
    });
  }
  if (top && !top.recoveryAction) {
    issues.push({
      id: 'exception.recovery.missing',
      severity: 'warning',
      message: 'Нет recovery action.',
    });
  }
  if (top && !(top.ownerRoleId || input.defaultDueAt)) {
    issues.push({
      id: 'exception.owner.missing',
      severity: 'blocker',
      message: 'Нет владельца исключения.',
    });
  }

  const open = Boolean(top);
  const status: PlatformCoreExceptionEvaluation['status'] = open
    ? issues.some((i) => i.severity === 'blocker')
      ? 'blocked'
      : 'needs_input'
    : issues.some((i) => i.severity === 'blocker')
      ? 'blocked'
      : issues.some((i) => i.severity === 'warning')
        ? 'warning'
        : 'core_ready';

  const checks = top
    ? [
        Boolean(input.orderId),
        Boolean(top.message),
        Boolean(top.ownerRoleId),
        Boolean(input.defaultDueAt),
        Boolean(top.recoveryAction),
        Boolean(input.linkedThreadId),
      ]
    : [true];
  const completenessPct = top
    ? Math.round((checks.filter(Boolean).length / checks.length) * 100)
    : 100;

  const snapshot: PlatformCoreExceptionSnapshot = {
    orderId: input.orderId,
    source: 'platform_core_derived_gate',
    exceptionId: `pc-exception-${input.orderId}`,
    open,
    exceptionCount: input.blockers.length,
    severity: top?.severity,
    reason: top?.message,
    ownerRoleId: top?.ownerRoleId ?? 'brand',
    dueAt: input.defaultDueAt,
    recoveryAction: top?.recoveryAction,
    blockerIds: input.blockers.map((b) => b.id),
    blockers: input.blockers,
    linkedThreadId: input.linkedThreadId,
    linkedCalendarEventId: input.linkedCalendarEventId,
    completenessPct,
  };

  return {
    snapshot,
    evaluation: {
      status,
      eventCreated: open ? 'exception.opened' : 'exception.none',
      nextOwnerLabel: open ? (top?.ownerRoleId ?? 'Бренд') : 'Закрыто',
      issues,
    },
  };
}

export async function getPlatformCoreExceptionForOrder(input: {
  orderId: string;
  organizationId?: string;
}): Promise<PlatformCoreExceptionOrderResult> {
  const orderId = input.orderId?.trim();
  const storeMode = getWorkshop2ServerDossierStoreMode();

  if (!orderId) {
    return { ok: false, reason: 'invalid_path', orderId, storeMode };
  }

  const [capacity, shipment, comms] = await Promise.all([
    getPlatformCoreCapacityForOrder({ orderId }),
    getPlatformCoreShipmentForOrder({ orderId, organizationId: input.organizationId }),
    getPlatformCoreCommsForOrder({ orderId, organizationId: input.organizationId }),
  ]);

  if (!capacity.ok && capacity.reason === 'not_found') {
    return { ok: false, reason: 'not_found', orderId, storeMode };
  }

  const blockers: PlatformCoreExceptionBlocker[] = [
    ...(capacity.ok
      ? blockersFromIssues({ source: 'capacity_gateway', issues: capacity.evaluation.issues })
      : []),
    ...(shipment.ok
      ? blockersFromIssues({ source: 'shipment_gateway', issues: shipment.evaluation.issues })
      : []),
    ...(comms.ok
      ? blockersFromIssues({ source: 'comms_gateway', issues: comms.evaluation.issues })
      : []),
  ];

  const defaultDueAt = comms.ok ? comms.calendar.nextDeadlineAt : undefined;
  const linkedThreadId = comms.ok ? comms.thread.threadId : undefined;
  const linkedCalendarEventId = comms.ok ? `pc-cal-order-${orderId}` : undefined;

  const { snapshot, evaluation } = evaluateException({
    orderId,
    blockers,
    linkedThreadId,
    linkedCalendarEventId,
    defaultDueAt,
  });

  return {
    ok: true,
    orderId,
    collectionId: capacity.ok ? capacity.collectionId : comms.ok ? comms.collectionId : undefined,
    articleId: capacity.ok ? capacity.articleId : comms.ok ? comms.articleId : undefined,
    storeMode,
    exception: snapshot,
    evaluation,
  };
}
