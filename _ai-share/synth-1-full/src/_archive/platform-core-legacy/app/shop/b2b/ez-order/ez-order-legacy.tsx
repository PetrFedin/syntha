'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { ShopB2bNuOrderScope } from '@/components/shop/ShopB2bNuOrderScope';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Link2, Copy, Check } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import allProducts from '@/lib/products';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { generateEzOrderToken } from '@/lib/b2b/ez-order-link';
import { tid } from '@/lib/ui/test-ids';

/** NuOrder: EZ Order / One-Click Linesheet — лайншит = форма заказа без перехода в матрицу. */
const LINESHEET_PRODUCTS = allProducts.slice(0, 8);

export function ShopB2bEzOrderLegacyPage() {
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [ezLink, setEzLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateLink = () => {
    const { url } = generateEzOrderToken({
      brandId: 'brand-syntha',
      linesheetId: 'fw26-core',
      collectionId: 'all',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    setEzLink(url);
    navigator.clipboard.writeText(url).then(() => setCopied(true));
    setTimeout(() => setCopied(false), 2000);
  };
  const totalUnits = Object.values(qtys).reduce((a, b) => a + b, 0);
  const totalAmount = LINESHEET_PRODUCTS.reduce((sum, p) => sum + (qtys[p.id] || 0) * p.price, 0);

  const handleSubmit = () => {
    const items = LINESHEET_PRODUCTS.filter((p) => (qtys[p.id] || 0) > 0).map((p) => ({
      productId: p.id,
      size: p.sizes?.[0]?.name || 'M',
      quantity: qtys[p.id] || 0,
      price: p.price,
    }));
    if (items.length === 0) return;
    window.alert(
      `EZ Order: отправлено ${items.length} позиций, ${totalUnits} ед. на ${totalAmount.toLocaleString('ru-RU')} ₽. В проде — API.`
    );
  };

  return (
    <ShopB2bNuOrderScope
      className="min-h-[200px] space-y-6"
      data-testid={tid.page('shop-b2b-ez-order')}
    >
      <ShopB2bContentHeader
        backHref={LEGACY_ROUTES.shop.b2bOrderMode}
        lead="NuOrder: открыл лайншит → выбрал qty → отправил, без перехода в матрицу (EZ Order)."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Лайншит FW26 — Core Collection</CardTitle>
          <CardDescription>
            Выберите количество по стилям и отправьте заказ одной кнопкой.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {LINESHEET_PRODUCTS.map((p) => (
              <li
                key={p.id}
                className="border-border-subtle bg-bg-surface2 flex items-center justify-between gap-4 rounded-xl border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {p.images?.[0]?.url && (
                    <img
                      src={p.images[0].url}
                      alt=""
                      className="size-14 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-text-secondary text-xs">
                      {p.sku} · {p.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    className="w-20 text-center"
                    value={qtys[p.id] ?? ''}
                    onChange={(e) =>
                      setQtys((prev) => ({
                        ...prev,
                        [p.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                      }))
                    }
                  />
                  <span className="text-text-muted text-xs">ед.</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium">Итого: {totalUnits} ед.</span>
            <span className="font-semibold">{totalAmount.toLocaleString('ru-RU')} ₽</span>
          </div>
          <Button className="mt-4 w-full" onClick={handleSubmit} disabled={totalUnits === 0}>
            <ShoppingBag className="mr-2 size-4" /> Отправить заказ (EZ Order)
          </Button>
        </CardContent>
      </Card>

      {ezLink && (
        <Card className="border-accent-primary/30 bg-accent-primary/10 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Link2 className="size-4" /> Заказ по ссылке (NuOrder)
            </CardTitle>
            <CardDescription>
              Отправьте ссылку байеру — он оформит заказ без входа в платформу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={ezLink} readOnly className="font-mono text-xs" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(ezLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCreateLink}>
          <Link2 className="mr-1 size-3" /> Создать ссылку для заказа
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bMatrix}>Матрица заказа</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bOrders}>Мои заказы</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Матрица, Working Order, аналитика"
        className="mt-6"
      />
    </ShopB2bNuOrderScope>
  );
}
