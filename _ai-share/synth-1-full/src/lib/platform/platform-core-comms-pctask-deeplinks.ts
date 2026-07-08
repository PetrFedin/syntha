import { appendSupplierOpPoContextToHref } from '@/lib/b2b/supplier-op-po-context-hrefs';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';
import {
  brandCalendarB2bOrderContextHref,
  factoryCalendarB2bOrderContextHref,
  factorySupplierCalendarB2bOrderContextHref,
  shopCalendarB2bOrderContextHref,
  shopB2bTrackingOrderHref,
} from '@/lib/routes';
import {
  universalInboxOrderDeepLinks,
  type PlatformCoreUniversalInboxVariant,
} from '@/lib/platform/platform-core-universal-inbox-order-links';
import type { PlatformCoreChainCalendarStepKind } from '@/lib/server/platform-core-chain-calendar-hook';

export type PlatformCoreCommsCalendarOwnerRole = CoreChainRoleId;

function variantForRole(
  role: PlatformCoreCommsCalendarOwnerRole
): PlatformCoreUniversalInboxVariant {
  if (role === 'manufacturer') return 'manufacturer';
  if (role === 'supplier') return 'supplier';
  if (role === 'brand') return 'brand';
  return 'shop';
}

/** Stable PG task id for chain-status calendar slot (Wave WC · all roles). */
export function platformCoreChainCalendarTaskId(
  orderId: string,
  ownerRole: PlatformCoreCommsCalendarOwnerRole,
  kind: PlatformCoreChainCalendarStepKind = 'chain_status'
): string {
  return `chain-${kind}-${orderId.trim()}-${ownerRole}`;
}

/** Role-aware tracking / handoff / PO card href from calendar or inbox. */
export function platformCoreCmCalendarTrackingHrefForRole(
  role: PlatformCoreCommsCalendarOwnerRole,
  orderId: string,
  opts?: { factoryId?: string; collectionId?: string }
): string {
  return universalInboxOrderDeepLinks(variantForRole(role), orderId.trim(), opts).trackingHref;
}

/** Back-compat: shop tracking when role omitted; role-aware when provided (Wave WC). */
export function platformCoreCmCalendarTrackingHref(
  orderId: string,
  role?: PlatformCoreCommsCalendarOwnerRole,
  opts?: { factoryId?: string; collectionId?: string }
): string {
  const id = orderId.trim();
  if (!id) return shopB2bTrackingOrderHref('');
  if (role) return platformCoreCmCalendarTrackingHrefForRole(role, id, opts);
  return shopB2bTrackingOrderHref(id);
}

/** Calendar deep-link with pcTask + role order context (handoff / PO / tracking spine). */
export function platformCoreCalendarPcTaskHref(input: {
  role: PlatformCoreCommsCalendarOwnerRole;
  collectionId: string;
  orderId?: string | null;
  taskId: string;
  factoryId?: string;
  productionOrderId?: string;
}): string {
  const task = encodeURIComponent(input.taskId.trim());
  const orderId = input.orderId?.trim();
  const { role, collectionId } = input;

  if (orderId) {
    let base: string;
    if (role === 'brand') {
      base = brandCalendarB2bOrderContextHref(orderId);
    } else if (role === 'shop') {
      base = shopCalendarB2bOrderContextHref(orderId);
    } else if (role === 'supplier') {
      base = appendSupplierOpPoContextToHref(factorySupplierCalendarB2bOrderContextHref(orderId), {
        orderId,
        productionOrderId: input.productionOrderId,
      });
    } else {
      const baseCalendar = factoryCalendarB2bOrderContextHref(orderId);
      base = input.factoryId?.trim()
        ? `${baseCalendar}&factoryId=${encodeURIComponent(input.factoryId.trim())}`
        : baseCalendar;
    }
    return `${base}&pcTask=${task}`;
  }

  if (role === 'shop') {
    return `/shop/b2b/calendar?collection=${encodeURIComponent(collectionId)}&pcTask=${task}`;
  }
  return role === 'brand'
    ? `/brand/calendar?collection=${encodeURIComponent(collectionId)}&pcTask=${task}`
    : `/factory/calendar?role=${role}&collection=${encodeURIComponent(collectionId)}&pcTask=${task}`;
}

/** Universal inbox: calendar with default chain-status pcTask + tracking pair. */
export function universalInboxOrderCalendarRowLinks(
  variant: PlatformCoreUniversalInboxVariant,
  orderId: string,
  opts?: { factoryId?: string; collectionId?: string; productionOrderId?: string }
): { calendarHref: string; trackingHref: string; pcTaskId: string } {
  const role: PlatformCoreCommsCalendarOwnerRole =
    variant === 'manufacturer'
      ? 'manufacturer'
      : variant === 'supplier'
        ? 'supplier'
        : variant === 'brand'
          ? 'brand'
          : 'shop';
  const collectionId = opts?.collectionId?.trim() || 'SS27';
  const pcTaskId = platformCoreChainCalendarTaskId(orderId, role);
  return {
    pcTaskId,
    calendarHref: platformCoreCalendarPcTaskHref({
      role,
      collectionId,
      orderId,
      taskId: pcTaskId,
      factoryId: opts?.factoryId,
      productionOrderId: opts?.productionOrderId,
    }),
    trackingHref: platformCoreCmCalendarTrackingHrefForRole(role, orderId, opts),
  };
}
