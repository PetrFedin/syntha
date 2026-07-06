'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { platformCoreCabinetSectionHref } from '@/lib/platform-core-cabinet-workspace';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

export type BrandCoEmbeddedSectionId = 'brand-co-registry' | 'brand-co-detail';

type Props = {
  collectionId: string;
  orderId?: string;
  articleId?: string;
  activeSection?: BrandCoEmbeddedSectionId;
  /** Явно: табы в `/brand/core?pillar=collection_order`. */
  embedded?: boolean;
};

/** Реестр ↔ карточка заказа — golden path brand CO в embedded hub (без CRM/ritail peer noise). */
export function BrandCoRegistryDetailPeerStrip({
  collectionId,
  orderId,
  articleId,
  activeSection,
  embedded: embeddedProp,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const embedded =
    embeddedProp ??
    (searchParams.get('pillar') === 'collection_order' &&
      (pathname === '/brand/core' || pathname.endsWith('/brand/core')));

  if (!embedded) return null;

  const demo = {
    collectionId,
    demoOrderId: orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId,
    demoArticleId: articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId,
  };

  const registryHref = platformCoreCabinetSectionHref(
    'brand',
    'collection_order',
    'brand-co-registry',
    demo
  );
  const detailHref = platformCoreCabinetSectionHref(
    'brand',
    'collection_order',
    'brand-co-detail',
    demo
  );

  const linkClass = (section: BrandCoEmbeddedSectionId) =>
    cn(hubGadget.goldenLink, activeSection === section && 'font-bold underline');

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-co-registry-detail-peer-strip">
      <Link
        href={registryHref}
        data-testid="brand-co-tab-registry-link"
        className={linkClass('brand-co-registry')}
      >
        Реестр
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={detailHref}
        data-testid="brand-co-tab-detail-link"
        className={linkClass('brand-co-detail')}
      >
        Карточка
      </Link>
    </div>
  );
}
