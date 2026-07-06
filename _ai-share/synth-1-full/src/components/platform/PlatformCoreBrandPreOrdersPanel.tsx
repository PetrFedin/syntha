'use client';

import Link from 'next/link';
import { AlertCircle, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROUTES, brandB2bOrderHref } from '@/lib/platform-core-routes';
import { B2bChainPhaseBadge } from '@/components/b2b/B2bChainPhaseBadge';
import { useBrandWorkshop2B2bOrdersList } from '@/hooks/use-brand-workshop2-b2b-orders-list';
import { useWorkshop2B2bChainSummaries } from '@/hooks/use-workshop2-b2b-chain-summaries';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { getPlatformCoreCollectionLabel } from '@/lib/platform-core-hub-matrix';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';
import { useB2bRegistryIntegrationOverlay } from '@/hooks/use-b2b-registry-integration-overlay';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

/** Core mode: предзаказы опта из PG (без INT-JOOR overlay). */
export function PlatformCoreBrandPreOrdersPanel() {
  const { collectionId } = usePlatformCoreDemoContext();
  const collectionLabel = getPlatformCoreCollectionLabel(collectionId);
  const coreMode = isPlatformCoreMode();
  const { rows, loadState } = useBrandWorkshop2B2bOrdersList(true);
  const integrationOverlay = useB2bRegistryIntegrationOverlay('brand', !coreMode);
  const prebookRows = (rows ?? []).filter((row) => row.orderMode === 'pre_order');
  const importedPrebook = coreMode
    ? []
    : integrationOverlay.importedBrandRows.filter(
        (row) =>
          isIntegrationImportedWholesaleOrderId(row.order) && row.orderMode === 'pre_order'
      );
  const chainOrderIds = [
    ...new Set([...prebookRows.map((row) => row.order), ...importedPrebook.map((r) => r.order)]),
  ];
  const { summaries: chainSummaries } = useWorkshop2B2bChainSummaries(chainOrderIds, true);
  const matrixHref = platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=${encodeURIComponent(collectionId)}`);
  const hasRows = prebookRows.length > 0 || importedPrebook.length > 0;

  return (
    <Card data-testid="platform-core-pre-orders-pg" className="border-amber-200/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <ShoppingCart className="h-4 w-4 text-amber-600" aria-hidden />
          Предзаказы опта (prebook)
        </CardTitle>
        <CardDescription className="text-xs">
          Розничные предзаказы вне этой цепочки. Здесь — оптовые заказы с режимом prebook из базы
          данных и внешних каналов.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadState === 'loading' || (!coreMode && integrationOverlay.loadState === 'loading') ? (
          <p className="text-text-muted text-sm" data-testid="brand-pre-orders-loading">
            Загрузка prebook…
          </p>
        ) : loadState === 'error' ? (
          <p className="text-text-muted flex items-start gap-2 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Данные предзаказов недоступны. Проверьте подключение к базе данных.
          </p>
        ) : !hasRows ? (
          <div className="space-y-3 text-sm">
            <p className="text-text-secondary" data-testid="brand-pre-orders-empty-honest">
              Для «{collectionLabel}» предзаказов пока нет. Импортируйте заказы из B2B-канала или
              создайте prebook в матрице магазина.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={ROUTES.brand.b2bOrders}>Реестр оптовых заказов</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={matrixHref}>Матрица заказа магазина</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заказ</TableHead>
                <TableHead>Магазин</TableHead>
                <TableHead>Коллекция</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead className="text-right">Карточка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prebookRows.map((row) => (
                <TableRow key={row.order}>
                  <TableCell className="font-mono text-xs">{row.order}</TableCell>
                  <TableCell>{row.shop}</TableCell>
                  <TableCell>{row.collectionId ?? '—'}</TableCell>
                  <TableCell>
                    <span data-testid={`brand-pre-orders-chain-badge-${row.order}`}>
                      <B2bChainPhaseBadge
                        orderStatusLabel={row.status}
                        chain={chainSummaries[row.order]}
                      />
                    </span>
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={brandB2bOrderHref(row.order)}
                      className="text-accent-primary text-xs font-medium hover:underline"
                    >
                      Открыть
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {importedPrebook.map((row) => (
                <TableRow key={row.order}>
                  <TableCell className="font-mono text-xs">
                    {row.order}
                    <Badge variant="outline" className="ml-2 text-[8px]">
                      Внешний канал
                    </Badge>
                  </TableCell>
                  <TableCell>{row.shop}</TableCell>
                  <TableCell>{row.collectionId ?? '—'}</TableCell>
                  <TableCell>
                    <span data-testid={`brand-pre-orders-chain-badge-${row.order}`}>
                      <B2bChainPhaseBadge
                        orderStatusLabel={row.status}
                        chain={chainSummaries[row.order]}
                      />
                    </span>
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={brandB2bOrderHref(row.order)}
                      className="text-accent-primary text-xs font-medium hover:underline"
                    >
                      Открыть
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
