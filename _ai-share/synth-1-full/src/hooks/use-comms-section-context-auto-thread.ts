'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isCoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { buildSectionSubItems } from '@/lib/platform-core-readiness-sections';
import { markPgSectionVisited } from '@/lib/communications/pg-contextual-section-read-state';
import { isPlatformCorePgB2bOrder } from '@/lib/platform-core-demo-order';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  brandMessagesB2bOrderContextHref,
  factoryMessagesB2bOrderContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/routes';

type Variant = 'brand' | 'shop' | 'manufacturer' | 'supplier';

function variantToRole(variant: Variant): CoreChainRoleId {
  if (variant === 'shop') return 'shop';
  if (variant === 'manufacturer') return 'manufacturer';
  if (variant === 'supplier') return 'supplier';
  return 'brand';
}

function orderMessagesHref(variant: Variant, orderId: string): string {
  if (variant === 'shop') return shopMessagesB2bOrderContextHref(orderId);
  if (variant === 'brand') return brandMessagesB2bOrderContextHref(orderId);
  if (variant === 'supplier') return factorySupplierMessagesB2bOrderContextHref(orderId);
  return factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });
}

type Input = {
  variant: Variant;
  collectionId: string;
  orderId?: string;
  disabled?: boolean;
  readerId?: string;
  enabled?: boolean;
};

export type CommsSectionContextRow = {
  sectionId: string;
  label: string;
  href: string;
};

/** Ensure PG thread for ?pillar=&section=; return row for thread list (minimalChrome). */
export function useCommsSectionContextAutoThread({
  variant,
  collectionId,
  orderId: orderIdProp,
  disabled,
  readerId,
  enabled = true,
}: Input): CommsSectionContextRow | null {
  const searchParams = useSearchParams();
  const ensuredRef = useRef<string>('');

  const pillarRaw = searchParams.get('pillar')?.trim() ?? '';
  const sectionId = searchParams.get('section')?.trim() ?? '';
  const orderFromUrl = searchParams.get('order')?.trim() ?? '';
  const pillarId: CoreHubPillarId | null =
    pillarRaw && isCoreHubPillarId(pillarRaw) ? pillarRaw : null;
  const orderId = (orderIdProp?.trim() || orderFromUrl).trim();

  const sectionRow = useMemo((): CommsSectionContextRow | null => {
    if (!enabled || disabled || !orderId || !pillarId || !sectionId) return null;
    const roleId = variantToRole(variant);
    const items = buildSectionSubItems(roleId, pillarId, collectionId);
    const match = items.find((i) => i.id === sectionId);
    const label = match?.label ?? sectionId;
    const href = match?.href ?? orderMessagesHref(variant, orderId);
    return { sectionId, label, href };
  }, [enabled, disabled, orderId, pillarId, sectionId, variant, collectionId]);

  useEffect(() => {
    if (
      !enabled ||
      disabled ||
      !orderId ||
      !isPlatformCorePgB2bOrder(orderId) ||
      !pillarId ||
      !sectionId
    ) {
      return;
    }

    const key = `${orderId}:${pillarId}:${sectionId}`;
    if (ensuredRef.current === key) return;
    ensuredRef.current = key;

    void fetch('/api/messages/contextual/ensure-b2b-order', {
      method: 'POST',
      headers: {
        ...buildWorkshop2ApiRequestHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        pillarId,
        sectionId,
        source: 'api',
      }),
    })
      .then((res) => {
        if (res.ok) markPgSectionVisited(orderId, pillarId, sectionId, readerId);
      })
      .catch(() => {
        ensuredRef.current = '';
      });
  }, [enabled, disabled, orderId, pillarId, sectionId, readerId]);

  return sectionRow;
}
