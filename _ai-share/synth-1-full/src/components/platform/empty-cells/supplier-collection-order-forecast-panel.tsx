'use client';

import Link from 'next/link';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import { factoryMaterialsProcurementHrefForDemo } from '@/lib/platform-core-hub-matrix';
import { shopReplenishmentTabHref } from '@/lib/platform-core-ports/b2b/shop-collection-order-hrefs';
import { SupEmptyCoPeerStrip } from '@/components/platform/empty-cells/SupEmptyCoPeerStrip';
import { SupEmptyCoExpectedPoDateStrip } from '@/components/platform/empty-cells/SupEmptyCoExpectedPoDateStrip';
import { SupplierManufacturerHandoffPeerStrip } from '@/components/factory/supplier/SupplierManufacturerHandoffPeerStrip';
import { WAVE_WZ_SUP_EMPTY_CO_CHECKOUT_RU } from '@/lib/platform-core-ports/platform/wave-wz-ru-noise-dedup-final';
import {
  formatDossierMaterialPreviewLine,
  type Workshop2DossierMaterialPreview,
} from '@/lib/platform-core-ports/dossier-material-preview';
import { formatWholesaleOrderDisplayId } from '@/lib/integrations/spine/integration-ui-utils';
import {
  estimateSupplierMaterialNeed,
  formatSupplierMaterialNeedRu,
  SUPPLIER_FORECAST_B2B_CONFIRMED_NOTE_RU,
  SUPPLIER_FORECAST_B2B_DISCLAIMER_RU,
} from '@/lib/platform-core-supplier-forecast';
import { SupplierBomDrawer } from '@/components/platform/SupplierBomDrawer';
import { PlatformCoreTerm } from '@/components/platform/PlatformCoreTerm';
import { PlatformCorePillarNotificationCenterCompact } from '@/components/platform/PlatformCorePillarNotificationCenterCompact';
import {
  PLATFORM_CORE_BOM_UNAVAILABLE_RU,
  PLATFORM_CORE_SUPPLIER_BOM_EMPTY_RU,
} from '@/lib/platform-core-user-messages';

type SupplierForecastRow = {
  articleId: string;
  orderQty: number;
  materials: Workshop2DossierMaterialPreview[];
  supplierConfirmed: boolean;
};

export default function SupplierCollectionOrderForecast({
  demo,
  hideLead = false,
  embedCrossRole = false,
}: {
  demo: PlatformCoreDemoContext;
  hideLead?: boolean;
  embedCrossRole?: boolean;
}) {
  const { collectionId, factoryId } = demo;
  const { snapshot, loading, error } = usePillarSnapshot({
    collectionId,
    pillarId: 'collection_order',
    roleId: 'supplier',
    factoryId,
  });
  const forecast =
    snapshot?.pillarId === 'collection_order' && 'supplierCollectionOrderForecast' in snapshot
      ? snapshot.supplierCollectionOrderForecast
      : null;
  const activeOrderId = forecast?.orderId ?? '';
  const rows: SupplierForecastRow[] = (forecast?.rows ?? []).map((row) => ({
    articleId: row.articleId,
    orderQty: row.orderQty,
    materials: row.materials,
    supplierConfirmed: row.supplierConfirmed,
  }));
  const totalUnits = forecast?.totalUnits ?? null;
  const orderStatus = forecast?.orderStatusLabel ?? null;
  const productionOrderId = forecast?.productionOrderId ?? null;
  const expectedHandoffAt = forecast?.expectedHandoffAt ?? null;
  const confirmedArticles = Object.fromEntries(rows.map((r) => [r.articleId, r.supplierConfirmed]));
  const loadState = loading
    ? 'loading'
    : error
      ? 'error'
      : !activeOrderId
        ? 'waiting-order'
        : rows.length === 0
          ? 'waiting-data'
          : 'ready';

  return (
    <section data-testid="supplier-collection-order-workspace" className="space-y-2">
      {hideLead && activeOrderId ? (
        <PlatformCorePillarNotificationCenterCompact
          variant="supplier"
          compact
          collectionId={collectionId}
          orderId={activeOrderId}
          orderScoped
        />
      ) : null}
      <Card data-testid="supplier-collection-order-forecast" className="border-blue-200/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Прогноз сырья по оптовому заказу</CardTitle>
          {hideLead ? null : (
            <CardDescription className="text-xs">
              Строки матрицы заказа × <PlatformCoreTerm term="BOM" /> из досье (только чтение).
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <p className="flex flex-wrap items-center gap-1">
            {activeOrderId ? (
              <Link
                href={factoryMaterialsProcurementHrefForDemo(
                  { ...demo, demoOrderId: activeOrderId },
                  { role: 'supplier' }
                )}
                className="text-accent-primary font-mono text-[10px] hover:underline"
                data-testid="supplier-forecast-b2b-order-link"
              >
                {formatWholesaleOrderDisplayId(activeOrderId)}
              </Link>
            ) : (
              <span className="text-text-muted">Нет заказа в очереди передачи</span>
            )}
            {orderStatus ? <Badge variant="outline">{orderStatus}</Badge> : null}
            {totalUnits != null ? (
              <span className="text-text-muted">
                · {totalUnits} ед. в заказе · {rows.length} артикул(ов)
              </span>
            ) : null}
          </p>
          <p className="text-text-muted text-[10px] leading-snug">
            {SUPPLIER_FORECAST_B2B_DISCLAIMER_RU}
          </p>
          {Object.values(confirmedArticles).some(Boolean) ? (
            <p
              className="text-[10px] leading-snug text-emerald-800"
              data-testid="supplier-forecast-confirmed-note"
            >
              {SUPPLIER_FORECAST_B2B_CONFIRMED_NOTE_RU}
            </p>
          ) : null}
          {loadState === 'loading' ? (
            <p className="text-text-muted">Загрузка матрицы и BOM…</p>
          ) : loadState === 'error' ? (
            <p className="text-text-muted">{PLATFORM_CORE_BOM_UNAVAILABLE_RU}</p>
          ) : loadState === 'waiting-order' ? (
            <p className="text-text-muted" data-testid="supplier-forecast-waiting-order">
              {WAVE_WZ_SUP_EMPTY_CO_CHECKOUT_RU}
            </p>
          ) : loadState === 'waiting-data' ? (
            <p className="text-text-muted" data-testid="supplier-forecast-waiting-data">
              Заказ {formatWholesaleOrderDisplayId(activeOrderId)} в очереди — матрица и BOM
              появятся после подтверждения брендом.
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li key={row.articleId} className="rounded-md border border-blue-100/80 p-2">
                  <p className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-semibold">
                    <span>
                      {row.articleId} × {row.orderQty} шт.
                    </span>
                    {confirmedArticles[row.articleId] ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-300 text-[9px] text-emerald-800"
                        data-testid={`supplier-forecast-material-confirmed-${row.articleId}`}
                      >
                        Поставка подтверждена
                      </Badge>
                    ) : null}
                  </p>
                  {row.materials.length > 0 ? (
                    <ul className="text-text-muted mt-1 space-y-0.5">
                      {row.materials.slice(0, 4).map((preview) => {
                        const need = estimateSupplierMaterialNeed({
                          preview,
                          orderQty: row.orderQty,
                        });
                        return (
                          <li key={`${row.articleId}-${preview.name}`}>
                            {formatDossierMaterialPreviewLine(preview)}
                            {need ? (
                              <span className="text-text-primary block text-[10px]">
                                {formatSupplierMaterialNeedRu(need)}
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-text-muted mt-1">{PLATFORM_CORE_SUPPLIER_BOM_EMPTY_RU}</p>
                  )}
                  {row.materials.length > 0 ? (
                    <SupplierBomDrawer
                      collectionId={collectionId}
                      articleId={row.articleId}
                      orderQty={row.orderQty}
                      previewCount={row.materials.length}
                      testId={`supplier-forecast-bom-drawer-${row.articleId}`}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <Link
            href={factoryMaterialsProcurementHrefForDemo(demo)}
            className="text-accent-primary font-medium hover:underline"
            data-testid="supplier-forecast-procurement-link"
          >
            Закупка под производственный заказ →
          </Link>
          {activeOrderId ? (
            <Link
              href={shopReplenishmentTabHref('stock-atp', collectionId, activeOrderId)}
              className="text-accent-primary block font-medium hover:underline"
              data-testid="supplier-forecast-replenishment-atp-link"
            >
              Shop replenishment · ATP →
            </Link>
          ) : null}
        </CardContent>
      </Card>
      {activeOrderId ? (
        <SupplierManufacturerHandoffPeerStrip
          factoryId={factoryId}
          collectionId={collectionId}
          orderId={activeOrderId}
        />
      ) : null}
      <SupEmptyCoExpectedPoDateStrip
        demo={demo}
        orderId={activeOrderId || undefined}
        productionOrderId={productionOrderId}
        expectedPoDateIso={expectedHandoffAt}
      />
      <SupEmptyCoPeerStrip demo={demo} orderId={activeOrderId || undefined} />
      {embedCrossRole ? (
        <RolePillarCrossRoleLinks roleId="supplier" pillarId="collection_order" variant="compact" />
      ) : null}
    </section>
  );
}
