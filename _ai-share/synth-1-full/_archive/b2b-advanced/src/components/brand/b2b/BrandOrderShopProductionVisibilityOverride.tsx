'use client';

import { useEffect, useState } from 'react';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  SHOP_PRODUCTION_VISIBILITY_HINTS_RU,
  SHOP_PRODUCTION_VISIBILITY_LABELS_RU,
  type ShopProductionVisibility,
} from '@/lib/platform-core-shop-production-visibility';

const LEVELS: ShopProductionVisibility[] = ['none', 'milestones', 'logistics', 'full'];

type Props = {
  orderId: string;
};

export function BrandOrderShopProductionVisibilityOverride({ orderId }: Props) {
  const oid = orderId.trim();
  const [orderOverride, setOrderOverride] = useState<ShopProductionVisibility | null>(null);
  const [effective, setEffective] = useState<ShopProductionVisibility>('milestones');
  const [source, setSource] = useState<'order' | 'collection' | 'env_default'>('env_default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function reload() {
    if (!oid) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/workshop2/b2b/orders/${encodeURIComponent(oid)}/shop-production-visibility`,
        { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        orderOverride?: ShopProductionVisibility | null;
        visibility?: ShopProductionVisibility;
        source?: 'order' | 'collection' | 'env_default';
      };
      if (json.ok) {
        setOrderOverride(json.orderOverride ?? null);
        setEffective(json.visibility ?? 'milestones');
        setSource(json.source ?? 'env_default');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [oid]);

  async function save(next: ShopProductionVisibility | null) {
    if (!oid || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/workshop2/b2b/orders/${encodeURIComponent(oid)}/shop-production-visibility`,
        {
          method: 'PATCH',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(next == null ? { clear: true } : { visibility: next }),
        }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        orderOverride?: ShopProductionVisibility | null;
        visibility?: ShopProductionVisibility;
        source?: 'order' | 'collection' | 'env_default';
      };
      if (!json.ok) {
        setMessage(json.messageRu ?? 'Не удалось сохранить.');
        return;
      }
      setOrderOverride(json.orderOverride ?? null);
      setEffective(json.visibility ?? 'milestones');
      setSource(json.source ?? 'env_default');
      setMessage(json.messageRu ?? 'Сохранено.');
    } catch {
      setMessage('Ошибка сети.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="border-border-subtle rounded-lg border bg-white/80 p-3"
      data-testid="brand-co-order-shop-production-visibility"
    >
      <p className="text-text-muted text-[10px] font-bold uppercase">Buyer-tracking для этого заказа</p>
      <p className="text-text-secondary mt-1 text-[11px] leading-relaxed">
        Переопределяет регламент коллекции для магазина. Сейчас:{' '}
        {SHOP_PRODUCTION_VISIBILITY_LABELS_RU[effective]}
        {source === 'order' ? ' · переопределение заказа' : source === 'collection' ? ' · коллекция' : ' · по умолчанию'}
      </p>
      {loading ? (
        <p className="text-text-muted mt-2 text-xs">Загрузка…</p>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            className="border-border-subtle h-8 rounded-md border bg-white px-2 text-xs"
            data-testid="brand-co-order-shop-production-visibility-select"
            value={orderOverride ?? ''}
            disabled={saving}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) void save(null);
              else void save(v as ShopProductionVisibility);
            }}
          >
            <option value="">Как у коллекции</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {SHOP_PRODUCTION_VISIBILITY_LABELS_RU[level]}
              </option>
            ))}
          </select>
          {orderOverride ? (
            <button
              type="button"
              className="text-accent-primary text-[11px] font-medium hover:underline"
              data-testid="brand-co-order-shop-production-visibility-clear"
              disabled={saving}
              onClick={() => void save(null)}
            >
              Сбросить
            </button>
          ) : null}
        </div>
      )}
      {orderOverride ? (
        <p className="text-text-muted mt-1 text-[10px]">{SHOP_PRODUCTION_VISIBILITY_HINTS_RU[orderOverride]}</p>
      ) : null}
      {message ? (
        <p className="text-text-secondary mt-1 text-[10px]" data-testid="brand-co-order-shop-production-visibility-message">
          {message}
        </p>
      ) : null}
    </section>
  );
}
