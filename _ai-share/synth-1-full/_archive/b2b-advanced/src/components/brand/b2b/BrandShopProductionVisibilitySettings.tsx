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
  collectionId: string;
};

export function BrandShopProductionVisibilitySettings({ collectionId }: Props) {
  const cid = collectionId.trim();
  const [visibility, setVisibility] = useState<ShopProductionVisibility>('milestones');
  const [source, setSource] = useState<'pg' | 'env_default'>('env_default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!cid) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(cid)}/shop-production-visibility`,
          { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          visibility?: ShopProductionVisibility;
          source?: 'pg' | 'env_default';
        };
        if (!cancelled && json.ok && json.visibility) {
          setVisibility(json.visibility);
          setSource(json.source ?? 'env_default');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cid]);

  async function save(next: ShopProductionVisibility) {
    if (!cid || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/workshop2/collections/${encodeURIComponent(cid)}/shop-production-visibility`,
        {
          method: 'PATCH',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ visibility: next }),
        }
      );
      const json = (await res.json()) as { ok?: boolean; messageRu?: string; visibility?: ShopProductionVisibility };
      if (!json.ok) {
        setMessage(json.messageRu ?? 'Не удалось сохранить регламент.');
        return;
      }
      setVisibility(json.visibility ?? next);
      setSource('pg');
      setMessage('Сохранено — магазин увидит обновлённый buyer-tracking.');
    } catch {
      setMessage('Ошибка сети при сохранении.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="border-border-subtle rounded-xl border bg-white p-4 shadow-sm"
      data-testid="brand-co-shop-production-visibility"
    >
      <div className="mb-3 space-y-1">
        <h2 className="text-text-primary text-sm font-bold">Раскрытие производства для магазина</h2>
        <p className="text-text-muted text-xs leading-relaxed">
          Регламент для раздела buyer-tracking (столп «Заказ коллекции»). Коллекция {cid}.
          {source === 'env_default' ? ' · сейчас значение по умолчанию' : ' · сохранено в PG'}
        </p>
      </div>
      {loading ? (
        <p className="text-text-muted text-xs" data-testid="brand-co-shop-production-visibility-loading">
          Загрузка…
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {LEVELS.map((level) => {
            const active = visibility === level;
            return (
              <label
                key={level}
                className={
                  active
                    ? 'border-accent-primary/40 bg-accent-primary/5 flex cursor-pointer gap-3 rounded-lg border p-3'
                    : 'border-border-subtle hover:bg-bg-surface2/60 flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors'
                }
                data-testid={`brand-co-shop-production-visibility-${level}`}
              >
                <input
                  type="radio"
                  name="shop-production-visibility"
                  className="mt-0.5"
                  checked={active}
                  disabled={saving}
                  onChange={() => void save(level)}
                />
                <span className="min-w-0">
                  <span className="text-text-primary block text-xs font-semibold">
                    {SHOP_PRODUCTION_VISIBILITY_LABELS_RU[level]}
                  </span>
                  <span className="text-text-muted mt-0.5 block text-[11px] leading-snug">
                    {SHOP_PRODUCTION_VISIBILITY_HINTS_RU[level]}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
      {message ? (
        <p className="text-text-secondary mt-2 text-[11px]" data-testid="brand-co-shop-production-visibility-message">
          {message}
        </p>
      ) : null}
    </section>
  );
}
