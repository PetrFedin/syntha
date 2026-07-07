'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatWorkshop2RubCurrency } from '@/lib/production/workshop2-rub-currency';

type AnalyticsPayload = {
  ok?: boolean;
  orderCount?: number;
  totalRub?: number;
  topSkus?: Array<{ articleId: string; totalRub: number; qty: number }>;
  messageRu?: string;
};

type Props = {
  collectionId?: string;
};

/** Wave 29: реальные B2B метрики из PG, не нули на /brand/analytics. */
export function BrandB2bAnalyticsStrip({ collectionId = 'SS27' }: Props) {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch(`/api/brand/b2b/analytics?collectionId=${encodeURIComponent(collectionId)}`);
        const json = (await r.json()) as AnalyticsPayload;
        setData(json);
      } catch {
        setData({ ok: false, messageRu: 'B2B analytics недоступна' });
      } finally {
        setLoading(false);
      }
    })();
  }, [collectionId]);

  const orders = data?.orderCount ?? 0;
  const total = data?.totalRub ?? 0;

  return (
    <Card data-testid="brand-b2b-analytics-strip-w29">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">B2B опт · {collectionId}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {loading ? (
          <p className="text-text-muted text-xs">Загрузка B2B метрик…</p>
        ) : (
          <>
            <p>
              Заказов: <strong>{orders}</strong> · Оборот:{' '}
              <strong>{formatWorkshop2RubCurrency(total)}</strong>
            </p>
            {data?.topSkus?.length ? (
              <ul className="text-text-secondary space-y-0.5 text-xs">
                {data.topSkus.slice(0, 3).map((s) => (
                  <li key={s.articleId}>
                    {s.articleId}: {formatWorkshop2RubCurrency(s.totalRub)} ({s.qty} шт.)
                  </li>
                ))}
              </ul>
            ) : orders === 0 ? (
              <p className="text-text-muted text-xs">
                Нет заказов — создайте через{' '}
                <Link href="/shop/b2b/showroom" className="text-accent-primary underline">
                  showroom
                </Link>
                .
              </p>
            ) : null}
            {data?.messageRu ? (
              <p className="text-text-muted text-[10px]">{data.messageRu}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
