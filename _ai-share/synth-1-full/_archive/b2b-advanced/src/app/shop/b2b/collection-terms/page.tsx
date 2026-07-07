'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Tag } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import {
  WHOLESALE_DELIVERY_WINDOWS,
  WHOLESALE_MOQ_BY_PRODUCT,
} from '@/lib/b2b/wholesale-order-terms';
import { getOrderRulesForPartner } from '@/lib/b2b/order-rules';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { B2BIntegrationStatusWidget } from '@/components/b2b/B2BIntegrationStatusWidget';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

const MOV_DEFAULT = 150_000; // минимальная сумма заказа (мок)

export default function B2BCollectionTermsPage() {
  const rules = getOrderRulesForPartner();
  const moqEntries = Object.entries(WHOLESALE_MOQ_BY_PRODUCT);
  const [priceLists, setPriceLists] = useState<{ slug: string; name: string; currency?: string }[]>(
    []
  );

  useEffect(() => {
    fetch('/api/b2b/integrations/price-lists')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) =>
        setPriceLists(
          Array.isArray(data) ? (data as { slug: string; name: string; currency?: string }[]) : []
        )
      )
      .catch(() => {});
  }, []);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Условия коллекции: дедлайны заказа, MOQ по стилю, минимальная сумма заказа (MOV) и прайс-листы." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
            <Package className="h-4 w-4" /> Минимум по стилю (MOQ)
          </CardTitle>
          <CardDescription>
            Минимальное количество по артикулу. Ниже — заказ по позиции не пройдёт.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {moqEntries.map(([productId, moq]) => (
              <li
                key={productId}
                className="bg-bg-surface2 flex justify-between rounded-lg px-3 py-2"
              >
                <span className="text-text-secondary font-mono">Стиль {productId}</span>
                <span className="font-bold">MOQ {moq} шт.</span>
              </li>
            ))}
            <li className="bg-bg-surface2 text-text-secondary flex justify-between rounded-lg px-3 py-2">
              <span>Остальные стили</span>
              <span>MOQ 6 шт. (по умолчанию)</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase">
            Минимальная сумма заказа (MOV)
          </CardTitle>
          <CardDescription>Минимальная сумма одного заказа по бренду/коллекции.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text-primary text-2xl font-black">
            {MOV_DEFAULT.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
          </p>
          {rules.movByBrand && Object.keys(rules.movByBrand).length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {Object.entries(rules.movByBrand).map(([brand, mov]) => (
                <li key={brand} className="flex justify-between">
                  <span>{brand}</span>
                  <span>
                    {typeof mov === 'number' ? mov.toLocaleString('ru-RU') + ' ₽' : String(mov)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase">Дедлайны и окна доставки</CardTitle>
          <CardDescription>
            Дата отмены (cancel date) — до неё можно отменить или изменить заказ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {WHOLESALE_DELIVERY_WINDOWS.map((w) => (
            <div key={w.id} className="bg-bg-surface2 rounded-lg px-3 py-2 text-sm">
              <span className="font-bold">{w.label}</span>
              <span className="text-text-secondary ml-2">
                · отмена до {w.cancelDate} · отгрузка {w.startShipDate}–{w.completeShipDate}
              </span>
            </div>
          ))}
          <Button variant="link" size="sm" className="h-auto px-0 text-xs" asChild>
            <Link href={ROUTES.shop.b2bDeliveryCalendar}>Актуальные окна по заказам →</Link>
          </Button>
        </CardContent>
      </Card>

      {priceLists.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Tag className="h-4 w-4" /> Прайс-листы партнёра
            </CardTitle>
            <CardDescription>
              Доступные прайс-листы для расчёта цен в матрице заказа.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {priceLists.map((pl) => (
                <li
                  key={pl.slug}
                  className="bg-bg-surface2 flex justify-between rounded-lg px-3 py-2"
                >
                  <span className="font-medium">{pl.name}</span>
                  <span className="text-text-secondary">
                    {pl.slug}
                    {pl.currency ? ` · ${pl.currency}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <B2BIntegrationStatusWidget settingsHref={ROUTES.shop.b2bSettings} />
      <RelatedModulesBlock
        title="Связанные разделы"
        links={getShopB2BHubLinks().filter((l) =>
          [ROUTES.shop.b2bDeliveryCalendar, ROUTES.shop.b2bCreateOrder].includes(l.href as string)
        )}
      />
    </CabinetPageContent>
  );
}
