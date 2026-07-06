'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { ProductionWorkshop2HubBanner } from '@/components/brand/production/ProductionWorkshop2HubBanner';
import { BrandProductionFloorTabsSection } from '@/app/brand/production/brand-production-floor-tabs-section';
import type { BrandProductionFloorTabsShellProps } from '@/app/brand/production/brand-production-floor-tabs-shell';
import type { ProductionFloorTabId } from '@/lib/production/floor-flow';
import { BrandCollectionInventoryOverlayPgStrip } from '@/components/brand/production/BrandCollectionInventoryOverlayPgStrip';

export type BrandProductionInventoryOverlayStripProps = {
  collectionId: string;
  overlayCount: number;
  persistMode: 'postgres' | 'localStorage' | 'unavailable';
  pgUnavailable: boolean;
  loading?: boolean;
};

export type BrandProductionCollectionFlowPageViewProps = {
  tab: ProductionFloorTabId;
  onTabChange: (value: string) => void;
  shell: BrandProductionFloorTabsShellProps;
  inventoryOverlayStrip?: BrandProductionInventoryOverlayStripProps;
};

export function BrandProductionCollectionFlowPageView(
  props: BrandProductionCollectionFlowPageViewProps
) {
  const { tab, onTabChange, shell, inventoryOverlayStrip } = props;

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-6 pb-16"
      data-testid="brand-production-page"
    >
      <ProductionWorkshop2HubBanner />
      {inventoryOverlayStrip ? (
        <BrandCollectionInventoryOverlayPgStrip
          collectionId={inventoryOverlayStrip.collectionId}
          overlayCount={inventoryOverlayStrip.overlayCount}
          persistMode={inventoryOverlayStrip.persistMode}
          pgUnavailable={inventoryOverlayStrip.pgUnavailable}
          loading={inventoryOverlayStrip.loading}
        />
      ) : null}
      <BrandProductionFloorTabsSection tab={tab} onTabChange={onTabChange} shell={shell} />
    </CabinetPageContent>
  );
}
