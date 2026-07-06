/**
 * Section-groups для столпа «Связь»: обсуждение по контексту раздела другого столпа.
 * Канон: platform-core-comms-canon.ts · ADR-002 Appendix B.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  PLATFORM_CORE_PILLARS,
  getPlatformCoreHubRow,
} from '@/lib/platform-core-hub-matrix';
import {
  isPlatformCoreCommsPeerSectionAuditId,
  platformCoreCommsSectionContextQuery,
} from '@/lib/platform-core-comms-canon';
import { SECTION_AUDIT } from '@/lib/platform-core-readiness-sections';
import {
  brandMessagesB2bOrderContextHref,
  factoryMessagesB2bOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/platform-core-routes';

export type CommsSectionGroupRow = {
  pillarId: CoreHubPillarId;
  pillarTitle: string;
  sectionId: string;
  label: string;
  order: number;
};

function isSectionGroupCandidate(sectionId: string): boolean {
  if (sectionId.endsWith('-cm-section-groups')) return false;
  if (isPlatformCoreCommsPeerSectionAuditId(sectionId)) return false;
  return true;
}

/** Активные разделы всех столпов роли — цели для group picker в comms. */
export function buildCommsSectionGroupsForRole(roleId: CoreChainRoleId): CommsSectionGroupRow[] {
  const row = getPlatformCoreHubRow(roleId);
  if (!row) return [];

  const out: CommsSectionGroupRow[] = [];
  for (const pillar of PLATFORM_CORE_PILLARS) {
    const cell = row.pillars[pillar.id];
    if (cell?.kind !== 'active') continue;
    const templates = SECTION_AUDIT[roleId]?.[pillar.id];
    if (!templates?.length) continue;
    for (const t of templates) {
      if (!isSectionGroupCandidate(t.id)) continue;
      out.push({
        pillarId: pillar.id,
        pillarTitle: pillar.title,
        sectionId: t.id,
        label: t.label,
        order: t.order,
      });
    }
  }
  return out.sort((a, b) => {
    const pa = PLATFORM_CORE_PILLARS.findIndex((p) => p.id === a.pillarId);
    const pb = PLATFORM_CORE_PILLARS.findIndex((p) => p.id === b.pillarId);
    if (pa !== pb) return pa - pb;
    return a.order - b.order;
  });
}

export function appendCommsSectionContextToHref(
  messagesHref: string,
  input: {
    pillarId: CoreHubPillarId;
    sectionId: string;
    collectionId?: string;
    orderId?: string;
  }
): string {
  const q = platformCoreCommsSectionContextQuery({
    pillarId: input.pillarId,
    sectionId: input.sectionId,
    collectionId: input.collectionId,
    orderId: input.orderId,
  });
  const params = new URLSearchParams(q);
  const sep = messagesHref.includes('?') ? '&' : '?';
  return `${messagesHref}${sep}${params.toString()}`;
}

/** Infer pillar from audit section id prefix (`brand-co-*` → collection_order, …). */
export function inferCommsSectionPillarId(sectionId: string): CoreHubPillarId {
  const id = sectionId.trim();
  if (id.includes('-co-')) return 'collection_order';
  if (id.includes('-op-')) return 'order_production';
  if (id.includes('-dev-')) return 'development';
  if (id.includes('-sc-')) return 'sample_collection';
  if (id.includes('-cm-')) return 'comms';
  return 'collection_order';
}

/** Chat/calendar deep-link from order interaction strip with section context (волна 27). */
export function buildOrderSectionCommsMessagesHref(input: {
  roleId: CoreChainRoleId;
  orderId: string;
  collectionId: string;
  sectionId: string;
  pillarId?: CoreHubPillarId;
}): string {
  return buildCommsSectionGroupMessagesHref({
    roleId: input.roleId,
    orderId: input.orderId,
    collectionId: input.collectionId,
    sectionId: input.sectionId,
    pillarId: input.pillarId ?? inferCommsSectionPillarId(input.sectionId),
  });
}

export function buildCommsSectionGroupMessagesHref(input: {
  roleId: CoreChainRoleId;
  orderId: string;
  collectionId: string;
  pillarId: CoreHubPillarId;
  sectionId: string;
}): string {
  const orderId = input.orderId.trim();
  const base =
    input.roleId === 'brand'
      ? brandMessagesB2bOrderContextHref(orderId)
      : input.roleId === 'shop'
        ? shopMessagesB2bOrderContextHref(orderId)
        : input.roleId === 'supplier'
          ? factorySupplierMessagesB2bOrderContextHref(orderId)
          : factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });

  return appendCommsSectionContextToHref(base, {
    pillarId: input.pillarId,
    sectionId: input.sectionId,
    collectionId: input.collectionId,
    orderId,
  });
}

/** Nav «Группы» в comms cabinet — первый section-group или inbox messages. */
export function buildCommsGroupsNavHref(input: {
  roleId: CoreChainRoleId;
  orderId: string;
  collectionId: string;
}): string {
  const orderId = input.orderId.trim();
  if (!orderId) {
    return input.roleId === 'brand'
      ? brandMessagesB2bOrderContextHref('')
      : input.roleId === 'shop'
        ? shopMessagesB2bOrderContextHref('')
        : input.roleId === 'supplier'
          ? factorySupplierMessagesB2bOrderContextHref('')
          : factoryMessagesB2bOrderContextHref('', { role: 'manufacturer' });
  }
  const groups = buildCommsSectionGroupsForRole(input.roleId);
  const first = groups[0];
  if (first) {
    return buildCommsSectionGroupMessagesHref({
      roleId: input.roleId,
      orderId,
      collectionId: input.collectionId,
      pillarId: first.pillarId,
      sectionId: first.sectionId,
    });
  }
  return buildCommsSectionGroupMessagesHref({
    roleId: input.roleId,
    orderId,
    collectionId: input.collectionId,
    pillarId: 'comms',
    sectionId: `${input.roleId}-cm-section-groups`,
  });
}

export function commsSectionGroupsPickerTestId(
  variant: 'brand' | 'shop' | 'manufacturer' | 'supplier'
): string {
  if (variant === 'shop') return 'shop-cm-section-groups-picker';
  if (variant === 'manufacturer') return 'mfr-cm-section-groups-picker';
  if (variant === 'supplier') return 'sup-cm-section-groups-picker';
  return 'brand-cm-section-groups-picker';
}

export function commsSectionGroupItemTestId(
  variant: 'brand' | 'shop' | 'manufacturer' | 'supplier',
  sectionId: string
): string {
  const prefix =
    variant === 'shop'
      ? 'shop-cm'
      : variant === 'manufacturer'
        ? 'mfr-cm'
        : variant === 'supplier'
          ? 'sup-cm'
          : 'brand-cm';
  return `${prefix}-section-group-${sectionId}`;
}
