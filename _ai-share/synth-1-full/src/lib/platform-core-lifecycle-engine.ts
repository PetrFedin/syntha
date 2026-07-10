import type { PlatformCoreDocument } from '@/lib/platform-core-document-engine';
import { canPlatformCoreAdvanceDocumentStage } from '@/lib/platform-core-document-engine';
import type { PlatformCoreOrderRevision } from '@/lib/platform-core-revision-engine';
import { getPlatformCoreOrderWorkflowAfterRevision } from '@/lib/platform-core-revision-engine';

export type PlatformCoreLifecycleEntityType =
  | 'article'
  | 'sample'
  | 'collection'
  | 'order'
  | 'fulfillment'
  | 'shipment'
  | 'acceptance'
  | 'closeout';

export type PlatformCoreLifecycleState =
  | 'article_draft'
  | 'article_ready'
  | 'sample_in_development'
  | 'sample_approved'
  | 'collection_draft'
  | 'collection_published'
  | 'order_draft'
  | 'order_revision_pending'
  | 'order_confirmed'
  | 'fulfillment_planned'
  | 'fulfillment_in_progress'
  | 'shipment_ready'
  | 'shipment_dispatched'
  | 'delivery_accepted'
  | 'claim_open'
  | 'closed';

export type PlatformCoreLifecycleAction =
  | 'mark_article_ready'
  | 'approve_sample'
  | 'publish_collection'
  | 'request_revision'
  | 'approve_revision'
  | 'confirm_order'
  | 'plan_fulfillment'
  | 'start_fulfillment'
  | 'mark_shipment_ready'
  | 'dispatch_shipment'
  | 'accept_delivery'
  | 'open_claim'
  | 'resolve_claim'
  | 'close_order';

export type PlatformCoreLifecycleBlocker = {
  code:
    | 'invalid_transition'
    | 'missing_documents'
    | 'revision_pending'
    | 'revision_not_approved'
    | 'claim_open'
    | 'custom_guard_failed';
  message: string;
};

export type PlatformCoreLifecycleContext = {
  entityId: string;
  documents?: readonly PlatformCoreDocument[];
  revision?: PlatformCoreOrderRevision;
  hasOpenClaim?: boolean;
  customGuards?: readonly { passed: boolean; message: string }[];
};

export type PlatformCoreLifecycleTransitionResult = {
  allowed: boolean;
  from: PlatformCoreLifecycleState;
  to?: PlatformCoreLifecycleState;
  action: PlatformCoreLifecycleAction;
  blockers: readonly PlatformCoreLifecycleBlocker[];
};

type TransitionRule = {
  from: PlatformCoreLifecycleState;
  action: PlatformCoreLifecycleAction;
  to: PlatformCoreLifecycleState;
  requiredDocumentStage?:
    | 'article_ready'
    | 'sample_approved'
    | 'collection_publish'
    | 'order_confirm'
    | 'shipment_ready'
    | 'delivery_acceptance'
    | 'claim_resolution';
};

export const PLATFORM_CORE_LIFECYCLE_TRANSITIONS: readonly TransitionRule[] = [
  { from: 'article_draft', action: 'mark_article_ready', to: 'article_ready', requiredDocumentStage: 'article_ready' },
  { from: 'sample_in_development', action: 'approve_sample', to: 'sample_approved', requiredDocumentStage: 'sample_approved' },
  { from: 'collection_draft', action: 'publish_collection', to: 'collection_published', requiredDocumentStage: 'collection_publish' },
  { from: 'order_draft', action: 'request_revision', to: 'order_revision_pending' },
  { from: 'order_revision_pending', action: 'approve_revision', to: 'order_confirmed' },
  { from: 'order_draft', action: 'confirm_order', to: 'order_confirmed', requiredDocumentStage: 'order_confirm' },
  { from: 'order_confirmed', action: 'plan_fulfillment', to: 'fulfillment_planned' },
  { from: 'fulfillment_planned', action: 'start_fulfillment', to: 'fulfillment_in_progress' },
  { from: 'fulfillment_in_progress', action: 'mark_shipment_ready', to: 'shipment_ready', requiredDocumentStage: 'shipment_ready' },
  { from: 'shipment_ready', action: 'dispatch_shipment', to: 'shipment_dispatched' },
  { from: 'shipment_dispatched', action: 'accept_delivery', to: 'delivery_accepted', requiredDocumentStage: 'delivery_acceptance' },
  { from: 'delivery_accepted', action: 'open_claim', to: 'claim_open' },
  { from: 'claim_open', action: 'resolve_claim', to: 'delivery_accepted', requiredDocumentStage: 'claim_resolution' },
  { from: 'delivery_accepted', action: 'close_order', to: 'closed' },
] as const;

function getTransitionRule(
  from: PlatformCoreLifecycleState,
  action: PlatformCoreLifecycleAction
): TransitionRule | undefined {
  return PLATFORM_CORE_LIFECYCLE_TRANSITIONS.find(
    (rule) => rule.from === from && rule.action === action
  );
}

export function evaluatePlatformCoreLifecycleTransition(args: {
  from: PlatformCoreLifecycleState;
  action: PlatformCoreLifecycleAction;
  context: PlatformCoreLifecycleContext;
}): PlatformCoreLifecycleTransitionResult {
  const rule = getTransitionRule(args.from, args.action);
  if (!rule) {
    return {
      allowed: false,
      from: args.from,
      action: args.action,
      blockers: [{ code: 'invalid_transition', message: `Action ${args.action} is not allowed from ${args.from}` }],
    };
  }

  const blockers: PlatformCoreLifecycleBlocker[] = [];

  if (rule.requiredDocumentStage) {
    const documents = args.context.documents ?? [];
    const canAdvance = canPlatformCoreAdvanceDocumentStage({
      stage: rule.requiredDocumentStage,
      ownerId: args.context.entityId,
      documents,
    });
    if (!canAdvance) {
      blockers.push({
        code: 'missing_documents',
        message: `Required documents are missing for stage ${rule.requiredDocumentStage}`,
      });
    }
  }

  if (args.action === 'approve_revision') {
    if (!args.context.revision) {
      blockers.push({ code: 'revision_pending', message: 'Revision is required before approval' });
    } else if (getPlatformCoreOrderWorkflowAfterRevision(args.context.revision) !== 'confirm_order') {
      blockers.push({ code: 'revision_not_approved', message: 'Revision must be approved by the counterparty' });
    }
  }

  if (args.action === 'close_order' && args.context.hasOpenClaim) {
    blockers.push({ code: 'claim_open', message: 'Order cannot be closed while a claim is open' });
  }

  for (const guard of args.context.customGuards ?? []) {
    if (!guard.passed) {
      blockers.push({ code: 'custom_guard_failed', message: guard.message });
    }
  }

  return {
    allowed: blockers.length === 0,
    from: args.from,
    to: blockers.length === 0 ? rule.to : undefined,
    action: args.action,
    blockers,
  };
}

export function applyPlatformCoreLifecycleTransition(args: {
  from: PlatformCoreLifecycleState;
  action: PlatformCoreLifecycleAction;
  context: PlatformCoreLifecycleContext;
}): PlatformCoreLifecycleState {
  const result = evaluatePlatformCoreLifecycleTransition(args);
  if (!result.allowed || !result.to) {
    throw new Error(result.blockers.map((blocker) => blocker.message).join('; '));
  }
  return result.to;
}

export function getPlatformCoreAvailableLifecycleActions(
  state: PlatformCoreLifecycleState
): PlatformCoreLifecycleAction[] {
  return PLATFORM_CORE_LIFECYCLE_TRANSITIONS
    .filter((rule) => rule.from === state)
    .map((rule) => rule.action);
}

export function getPlatformCoreLifecycleEntityType(
  state: PlatformCoreLifecycleState
): PlatformCoreLifecycleEntityType {
  if (state.startsWith('article_')) return 'article';
  if (state.startsWith('sample_')) return 'sample';
  if (state.startsWith('collection_')) return 'collection';
  if (state.startsWith('order_')) return 'order';
  if (state.startsWith('fulfillment_')) return 'fulfillment';
  if (state.startsWith('shipment_')) return 'shipment';
  if (state === 'delivery_accepted' || state === 'claim_open') return 'acceptance';
  return 'closeout';
}
