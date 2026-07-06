'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchShopMatrixArticleInspectorView } from '@/lib/b2b/shop-matrix-article-inspector';
import type { ShopMatrixArticleInspectorView } from '@/lib/b2b/shop-matrix-article-inspector.types';
import { buildShopWholesaleMatrixSession } from '@/lib/b2b/shop-wholesale-matrix-workspace';
import { ShopCoMatrixInspectorPrepackPeerStrip } from '@/components/platform/ShopCoMatrixInspectorPrepackPeerStrip';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  isShopCoMatrixEmbeddedCabinetContext,
  shopCoMatrixEmbeddedTabHref,
} from '@/lib/platform-core-cabinet-workspace';

type Props = {
  collectionId: string;
  articleId?: string;
  orderId?: string;
  onPickFromMatrix?: () => void;
};

export function ShopMatrixArticleInspectorPanel({
  collectionId,
  articleId,
  orderId,
  onPickFromMatrix,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const embeddedMatrix = isShopCoMatrixEmbeddedCabinetContext(pathname, searchParams.get('section'));
  const [view, setView] = useState<ShopMatrixArticleInspectorView | null>(null);
  const [messageRu, setMessageRu] = useState<string | null>(null);
  const [gateBlocked, setGateBlocked] = useState<
    | {
        sheetsReady: number;
        sheetsTotal: number;
        blockersRu: string[];
        brandFactoryPackHref: string;
        brandReleaseGateHref: string;
      }
    | null
  >(null);
  const [loading, setLoading] = useState(false);

  const session = useMemo(
    () => buildShopWholesaleMatrixSession({ collectionId, orderId, articleId }),
    [collectionId, orderId, articleId]
  );
  const matrixNavInput = { collectionId, orderId, articleId };
  const matrixHref = embeddedMatrix
    ? shopCoMatrixEmbeddedTabHref('matrix', matrixNavInput)
    : session.matrixHref;
  const prepackHref = embeddedMatrix
    ? shopCoMatrixEmbeddedTabHref('prepack', matrixNavInput)
    : session.prepackHref;

  useEffect(() => {
    const aid = articleId?.trim();
    if (!collectionId.trim() || !aid) {
      setView(null);
      setGateBlocked(null);
      setMessageRu('Выберите артикул в матрице — модель поставщика только для просмотра в контексте коллекции.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMessageRu(null);
    setGateBlocked(null);
    void fetchShopMatrixArticleInspectorView({ collectionId, articleId: aid }).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setView(null);
        if (result.code === 'factory_pack_gate_blocked' && result.releaseGate) {
          setGateBlocked(result.releaseGate);
          setMessageRu(result.messageRu);
          return;
        }
        setGateBlocked(null);
        setMessageRu(result.messageRu);
        return;
      }
      setView(result.view);
    });
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleId]);

  if (!articleId?.trim()) {
    return (
      <Card data-testid="shop-matrix-inspector-empty">
        <CardHeader>
          <CardTitle className="text-base">Артикул · инспектор</CardTitle>
          <CardDescription>
            Только просмотр: модель поставщика, ткань, MOQ — после релиз-гейта бренда (столп 2 → 3).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-text-secondary">{messageRu}</p>
          <Button variant="outline" size="sm" asChild>
            <Link href={matrixHref}>К матрице</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <p className="text-text-secondary text-sm" data-testid="shop-matrix-inspector-loading">
        Загрузка инспектора…
      </p>
    );
  }

  if (!view) {
    return (
      <Card
        data-testid={
          gateBlocked ? 'shop-matrix-inspector-gate-blocked' : 'shop-matrix-inspector-error'
        }
      >
        <CardHeader>
          <CardTitle className="text-base">
            {gateBlocked ? 'Инспектор · гейт фабричного пакета' : 'Инспектор · ошибка'}
          </CardTitle>
          <CardDescription className="text-xs leading-snug">
            {gateBlocked
              ? `Релиз-гейт: ${gateBlocked.sheetsReady}/${gateBlocked.sheetsTotal} листов. Магазин только для просмотра до прохождения брендом (столп 1 → 3).`
              : 'Не удалось загрузить модель поставщика.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-amber-950">{messageRu ?? 'Нет данных.'}</p>
          {gateBlocked ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={gateBlocked.brandReleaseGateHref}>Бренд · релиз-гейт</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={gateBlocked.brandFactoryPackHref}>W2 · фабричный пакет</Link>
              </Button>
            </div>
          ) : null}
          {onPickFromMatrix ? (
            <Button variant="outline" size="sm" onClick={onPickFromMatrix}>
              К матрице
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={matrixHref}>К матрице</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const reorderHref = matrixHref;

  return (
    <div className="space-y-4" data-testid="shop-matrix-inspector-panel">
      {!embeddedMatrix ? (
      <ShopCoMatrixInspectorPrepackPeerStrip
        collectionId={collectionId}
        orderId={orderId}
        articleId={articleId}
        activeTab="inspector"
      />
      ) : null}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
          <div>
            <CardTitle className="text-base">{view.name}</CardTitle>
            <CardDescription>
              {view.sku} · {view.collectionId}
              {view.campaignName ? ` · ${view.campaignName}` : ''}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">
              только просмотр
            </Badge>
            {view.lifecycleLabel ? (
              <Badge variant="secondary" className="text-[10px]">
                {view.lifecycleLabel}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[120px_1fr]">
          {view.heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={view.heroImageUrl}
              alt={view.name}
              className="border-border-subtle h-28 w-28 rounded-md border object-cover"
            />
          ) : null}
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-muted text-[10px] uppercase">Опт</dt>
              <dd className="font-semibold tabular-nums">
                {view.wholesalePriceRub.toLocaleString('ru-RU')} ₽
              </dd>
            </div>
            {view.msrpRub != null ? (
              <div>
                <dt className="text-text-muted text-[10px] uppercase">РРЦ</dt>
                <dd className="tabular-nums">{view.msrpRub.toLocaleString('ru-RU')} ₽</dd>
              </div>
            ) : null}
            {view.moq != null ? (
              <div>
                <dt className="text-text-muted text-[10px] uppercase">MOQ</dt>
                <dd>{view.moq} ед.</dd>
              </div>
            ) : null}
            {view.supplierModelNote ? (
              <div className="sm:col-span-2">
                <dt className="text-text-muted text-[10px] uppercase">Модель поставщика</dt>
                <dd>{view.supplierModelNote}</dd>
              </div>
            ) : null}
            {view.compositionSummary ? (
              <div className="sm:col-span-2">
                <dt className="text-text-muted text-[10px] uppercase">Состав</dt>
                <dd>{view.compositionSummary}</dd>
              </div>
            ) : null}
            {view.sizeSchemaNote ? (
              <div className="sm:col-span-2">
                <dt className="text-text-muted text-[10px] uppercase">Размерная сетка</dt>
                <dd>{view.sizeSchemaNote}</dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      {view.fabricLines.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ткань · BOM (только просмотр)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Материал</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Состав</TableHead>
                  <TableHead>Поставщик</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {view.fabricLines.map((line) => (
                  <TableRow key={`${line.materialName}-${line.role}`}>
                    <TableCell className="font-medium">{line.materialName}</TableCell>
                    <TableCell>{line.role}</TableCell>
                    <TableCell>{line.compositionText ?? '—'}</TableCell>
                    <TableCell>{line.supplier ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={reorderHref} data-testid="shop-matrix-inspector-back-matrix">
            В матрицу
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={prepackHref}>Препак</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.replenishmentHref}>Пополнение · ATP</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.landedMarginHref}>Маржа с доставкой</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.orderCommsHref}>Трекинг заказа</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.brandOrderChatHref}>Чат заказа бренда</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={session.platformMarketroomHref}>Маркетрум платформы</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={session.inventoryOverviewHref}>Обзор остатков</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={`${session.showroomHref}&article=${encodeURIComponent(view.articleId)}`}
          >
            Шоурум
          </Link>
        </Button>
        {onPickFromMatrix ? (
          <Button variant="ghost" size="sm" type="button" onClick={onPickFromMatrix}>
            Другой артикул
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function shopMatrixInspectorSearchParams(
  articleId: string,
  preserve?: URLSearchParams
): URLSearchParams {
  const sp = new URLSearchParams(preserve?.toString() ?? '');
  sp.set('article', articleId);
  sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, 'inspector');
  return sp;
}
