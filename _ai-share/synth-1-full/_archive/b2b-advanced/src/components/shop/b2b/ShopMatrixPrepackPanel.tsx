'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  buildShopMatrixPrepackBreakdown,
  SHOP_MATRIX_SIZE_CURVE_SIZES,
  shopMatrixPrepackSizeSummary,
} from '@/lib/b2b/shop-matrix-prepack-curve';
import { fetchShopMatrixSizeCurveView } from '@/lib/b2b/shop-matrix-size-curve-client';
import type { ShopMatrixSizeCurveView } from '@/lib/b2b/shop-matrix-size-curve';
import { mergeCurveIntoStandardGrid } from '@/lib/b2b/shop-matrix-size-curve';
import { buildShopWholesaleMatrixSession } from '@/lib/b2b/shop-wholesale-matrix-workspace';
import { ShopCoMatrixInspectorPrepackPeerStrip } from '@/components/platform/ShopCoMatrixInspectorPrepackPeerStrip';
import { fetchWorkshop2MatrixProducts } from '@/lib/b2b/workshop2-b2b-matrix-catalog';
import type { Product } from '@/lib/types';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  isShopCoMatrixEmbeddedCabinetContext,
  shopCoMatrixEmbeddedTabHref,
} from '@/lib/platform-core-cabinet-workspace';
import { ROUTES, shopB2bMatrixPrepackApplyHref, shopB2bMatrixReorderHref } from '@/lib/routes';
import type { ShopMatrixPrepackApplyRequest } from '@/lib/b2b/shop-matrix-prepack-apply';

type Props = {
  collectionId: string;
  orderId?: string;
  focusArticleId?: string;
  onApplyInMatrix?: (request: ShopMatrixPrepackApplyRequest | ShopMatrixPrepackApplyRequest[]) => void;
};

export function ShopMatrixPrepackPanel({
  collectionId,
  orderId,
  focusArticleId,
  onApplyInMatrix,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const embeddedMatrix = isShopCoMatrixEmbeddedCabinetContext(pathname, searchParams.get('section'));
  const [packCount, setPackCount] = useState(2);
  const [articleId, setArticleId] = useState(focusArticleId ?? '');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [curveView, setCurveView] = useState<ShopMatrixSizeCurveView | null>(null);
  const [curveMessage, setCurveMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchWorkshop2MatrixProducts(collectionId).then((list) => {
      if (cancelled) return;
      setProducts(list);
      if (!articleId && list[0]?.id) setArticleId(list[0].id);
      if (selectedArticleIds.length === 0 && list[0]?.id) {
        setSelectedArticleIds([list[0].id]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleId]);

  useEffect(() => {
    if (!collectionId.trim()) return;
    let cancelled = false;
    void fetchShopMatrixSizeCurveView({ collectionId, articleId: articleId || undefined }).then(
      (result) => {
        if (cancelled) return;
        if (!result.ok) {
          setCurveView(null);
          setCurveMessage(result.messageRu);
          return;
        }
        setCurveView(result.view);
        if (!articleId) setArticleId(result.view.articleId);
        setCurveMessage(null);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleId]);

  const curve = useMemo(
    () => (curveView ? mergeCurveIntoStandardGrid(curveView.curve) : undefined),
    [curveView]
  );

  const breakdown = useMemo(
    () =>
      buildShopMatrixPrepackBreakdown({
        packCount,
        packSize: curveView?.packSize,
        curve,
      }),
    [packCount, curve, curveView?.packSize]
  );

  const applyHref =
    articleId.trim() && collectionId.trim()
      ? shopB2bMatrixPrepackApplyHref(collectionId, articleId, packCount, orderId)
      : ROUTES.shop.b2bMatrix;

  const applyInMatrix = () => {
    if (!articleId.trim() || !collectionId.trim()) return;
    onApplyInMatrix?.({ articleId: articleId.trim(), packCount });
  };

  const toggleArticleSelection = (id: string) => {
    setSelectedArticleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const applyBatchInMatrix = () => {
    if (!collectionId.trim() || selectedArticleIds.length === 0) return;
    const requests = selectedArticleIds.map((article) => ({
      articleId: article,
      packCount,
    }));
    onApplyInMatrix?.(requests.length === 1 ? requests[0] : requests);
  };

  const session = useMemo(
    () => buildShopWholesaleMatrixSession({ collectionId, orderId, articleId: articleId || undefined }),
    [collectionId, orderId, articleId]
  );
  const matrixNavInput = {
    collectionId,
    orderId,
    articleId: articleId || focusArticleId,
  };
  const matrixHref = embeddedMatrix
    ? shopCoMatrixEmbeddedTabHref('matrix', matrixNavInput)
    : `${shopB2bMatrixReorderHref(collectionId, orderId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=matrix`;

  const displaySizes = curveView?.sizes?.length
    ? [...new Set([...SHOP_MATRIX_SIZE_CURVE_SIZES, ...curveView.sizes])]
    : [...SHOP_MATRIX_SIZE_CURVE_SIZES];

  return (
    <div className="space-y-4" data-testid="shop-matrix-prepack-panel">
      {!embeddedMatrix ? (
      <ShopCoMatrixInspectorPrepackPeerStrip
        collectionId={collectionId}
        orderId={orderId}
        articleId={articleId || focusArticleId}
        activeTab="prepack"
      />
      ) : null}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Препак · размерная кривая</CardTitle>
          <CardDescription>
            Размерная сетка W2 ({curveView?.source ?? '…'}) × кратность препака{' '}
            {breakdown.packSize} ед. · бренд:{' '}
            <Link href={session.brandPackRulesCurveHref} className="text-accent-primary hover:underline">
              правила препака · кривая
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-xs">
              <span className="text-text-muted block">Артикул</span>
              <Input
                className="h-9 w-40 font-mono text-xs"
                value={articleId}
                onChange={(e) => setArticleId(e.target.value.trim())}
                data-testid="shop-matrix-prepack-article"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-text-muted block">Кол-во препаков</span>
              <Input
                type="number"
                min={1}
                className="h-9 w-24"
                value={packCount}
                onChange={(e) => setPackCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                data-testid="shop-matrix-prepack-count"
              />
            </label>
            <Badge variant="secondary">Итого: {breakdown.totalUnits} ед.</Badge>
            <Badge variant="outline">{shopMatrixPrepackSizeSummary(breakdown.bySize)}</Badge>
            {curveView ? (
              <Badge variant="outline" className="text-[10px] uppercase">
                {curveView.source}
              </Badge>
            ) : null}
          </div>
          {curveMessage ? <p className="text-text-secondary text-xs">{curveMessage}</p> : null}

          {products.length > 1 ? (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-text-secondary text-xs">
                Пакетное применение — выберите артикулы с общим числом препаков:
              </p>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {products.slice(0, 12).map((product) => {
                  const selected = selectedArticleIds.includes(product.id);
                  return (
                    <Button
                      key={product.id}
                      type="button"
                      size="sm"
                      variant={selected ? 'default' : 'outline'}
                      className="h-7 font-mono text-[10px]"
                      onClick={() => toggleArticleSelection(product.id)}
                      data-testid={`shop-matrix-prepack-select-${product.id}`}
                    >
                      {product.id}
                    </Button>
                  );
                })}
              </div>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                disabled={selectedArticleIds.length === 0}
                onClick={applyBatchInMatrix}
                data-testid="shop-matrix-prepack-apply-batch"
              >
                Применить выбранные ({selectedArticleIds.length})
              </Button>
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Размер</TableHead>
                <TableHead className="text-right">Вес</TableHead>
                <TableHead className="text-right">Кол-во</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displaySizes.map((size) => (
                <TableRow key={size}>
                  <TableCell className="font-medium">{size}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {curve?.[size as keyof typeof curve] ?? curveView?.curve[size] ?? '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {breakdown.bySize[size] ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {onApplyInMatrix ? (
          <Button
            size="sm"
            type="button"
            onClick={applyInMatrix}
            data-testid="shop-matrix-prepack-apply-inpage"
          >
            Применить в матрице
          </Button>
        ) : null}
        <Button size="sm" variant={onApplyInMatrix ? 'outline' : 'default'} asChild data-testid="shop-matrix-prepack-apply-matrix">
          <Link href={applyHref}>{onApplyInMatrix ? 'Применить · URL' : 'Применить в матрице'}</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={matrixHref}>Матрица</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={session.brandPackRulesShopPrepackHref}>Бренд · препак магазина</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.workingOrderBulkHref}>Рабочий заказ · пакетно</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.replenishmentHref}>Пополнение · ATP</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.landedMarginHref}>Маржа с доставкой</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.collaborativeHref}>Совместный заказ · согласования</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.orderCommsHref}>Трекинг заказа</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.showroomHref}>Шоурум</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.platformMarketroomHref}>Маркетрум платформы</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.inventoryOverviewHref}>Обзор остатков</Link>
        </Button>
      </div>
    </div>
  );
}
