'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  SUPPLIER_CORE_MATERIAL_CATALOG_MATERIALS_PEER_TESTID,
  SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID,
  SUPPLIER_CORE_MATERIAL_CATALOG_RFQ_PEER_TESTID,
  SUPPLIER_DEV_PILLAR_MATERIAL_CATALOG_NAV_TESTID,
  supDevMaterialCatalogCabinetHrefsForDemo,
  supDevMaterialCatalogMaterialsPeerLabelRu,
  supDevMaterialCatalogPillarNavLabelRu,
  supDevMaterialCatalogRfqPeerLabelRu,
} from '@/lib/fashion/supplier-dev-wave-wk';
import { prefetchPlatformCoreW2FromHref } from '@/lib/platform-core-w2-prefetch';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';

type Props = {
  demo: PlatformCoreDemoContext;
  /** When false, peers collapse (non-development pillar). */
  showPeers?: boolean;
};

/** Wave WK · material catalog link inside supplier pillar aside nav (development). */
export function SupplierDevPillarMaterialCatalogNav({ demo, showPeers = true }: Props) {
  const { catalogHref, materialsHref, rfqHref } = supDevMaterialCatalogCabinetHrefsForDemo(demo);

  return (
    <>
      <Link
        href={catalogHref}
        data-testid={SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID}
        className="text-text-secondary hover:text-text-primary hover:bg-bg-surface2 flex min-h-11 w-full items-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors"
        onMouseEnter={() => prefetchPlatformCoreW2FromHref(catalogHref)}
      >
        <span data-testid={SUPPLIER_DEV_PILLAR_MATERIAL_CATALOG_NAV_TESTID}>
          {supDevMaterialCatalogPillarNavLabelRu()}
        </span>
        <ArrowRight className="size-3 opacity-60" aria-hidden />
      </Link>
      {showPeers ? (
        <nav
          aria-label="Смежные разделы каталога"
          className="flex flex-col gap-0.5 pl-1"
          data-testid="supplier-core-material-catalog-peers"
        >
          <Link
            href={materialsHref}
            data-testid={SUPPLIER_CORE_MATERIAL_CATALOG_MATERIALS_PEER_TESTID}
            className="text-text-muted hover:text-accent-primary rounded px-2 py-1 text-[11px] transition-colors"
            onMouseEnter={() => prefetchPlatformCoreW2FromHref(materialsHref)}
          >
            {supDevMaterialCatalogMaterialsPeerLabelRu()} →
          </Link>
          <Link
            href={rfqHref}
            data-testid={SUPPLIER_CORE_MATERIAL_CATALOG_RFQ_PEER_TESTID}
            className="text-text-muted hover:text-accent-primary rounded px-2 py-1 text-[11px] transition-colors"
          >
            {supDevMaterialCatalogRfqPeerLabelRu()} →
          </Link>
        </nav>
      ) : null}
    </>
  );
}
