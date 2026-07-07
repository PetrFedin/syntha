'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  workshop2B2bAmendmentStatusLabelRu,
  type Workshop2B2bAmendmentRecord,
} from '@/lib/production/workshop2-b2b-amendment';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  brandB2bOrderHref,
  brandOrderAmendmentsOrderHref,
  shopCoreCollectionOrderCabinetHref,
} from '@/lib/routes';

type Props = {
  orderId: string;
  variant: 'shop' | 'brand';
  canShopSubmit: boolean;
  collectionId?: string;
};

export function B2bOrderAmendmentPanel({
  orderId,
  variant,
  canShopSubmit,
  collectionId,
}: Props) {
  const [pending, setPending] = useState<Workshop2B2bAmendmentRecord | null>(null);
  const [noteRu, setNoteRu] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/workshop2/b2b/orders/${encodeURIComponent(orderId)}/amendments`, {
        headers: buildWorkshop2ApiRequestHeaders(),
        cache: 'no-store',
      });
      const json = (await res.json()) as {
        ok?: boolean;
        pending?: Workshop2B2bAmendmentRecord | null;
      };
      if (json.ok) setPending(json.pending ?? null);
      else setPending(null);
    } catch {
      setPending(null);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    void load();
  }, [orderId]);

  const submitRequest = async () => {
    if (!canShopSubmit || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/shop/b2b/orders/${encodeURIComponent(orderId)}/amend-request`, {
        method: 'POST',
        headers: { ...buildWorkshop2ApiRequestHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteRu }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      if (json.ok) {
        setMessage(json.messageRu ?? 'Заявка отправлена.');
        setNoteRu('');
        await load();
      } else {
        setMessage(json.messageRu ?? 'Не удалось отправить заявку.');
      }
    } catch {
      setMessage('Ошибка сети.');
    } finally {
      setBusy(false);
    }
  };

  const resolveAmendment = async (action: 'approve' | 'reject') => {
    if (!pending || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/brand/b2b/orders/${encodeURIComponent(orderId)}/amendments/${encodeURIComponent(pending.id)}/${action}`,
        {
          method: 'POST',
          headers: { ...buildWorkshop2ApiRequestHeaders(), 'Content-Type': 'application/json' },
          body: '{}',
        }
      );
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      if (json.ok) {
        setMessage(json.messageRu ?? (action === 'approve' ? 'Одобрено.' : 'Отклонено.'));
        await load();
      } else {
        setMessage(json.messageRu ?? 'Не удалось обработать заявку.');
      }
    } catch {
      setMessage('Ошибка сети.');
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) return null;

  if (variant === 'shop') {
    if (!canShopSubmit && !pending) return null;
    return (
      <Card
        data-testid="shop-b2b-amend-request-panel"
        className="border-violet-200/70 bg-violet-50/20"
      >
        <CardContent className="space-y-2 py-3 text-xs">
          {pending ? (
            <p data-testid="shop-b2b-amend-pending-badge" className="text-amber-900">
              Заявка на изменение: {workshop2B2bAmendmentStatusLabelRu(pending.status)} ·{' '}
              {pending.noteRu}
            </p>
          ) : canShopSubmit ? (
            <>
              <label className="text-text-muted text-[10px] font-bold uppercase" htmlFor="shop-amend-note">
                Заявка на изменение (до подтверждения брендом)
              </label>
              <Textarea
                id="shop-amend-note"
                value={noteRu}
                onChange={(e) => setNoteRu(e.target.value)}
                rows={3}
                className="text-xs"
                placeholder="Например: уменьшить M до 10 шт., добавить L +6 шт."
                data-testid="shop-b2b-amend-note-input"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-[11px]"
                disabled={busy || noteRu.trim().length < 8}
                data-testid="shop-b2b-amend-request-submit"
                onClick={() => void submitRequest()}
              >
                {busy ? 'Отправка…' : 'Отправить заявку бренду'}
              </Button>
            </>
          ) : null}
          {message ? (
            <p className="text-text-secondary" role="status">
              {message}
            </p>
          ) : null}
          {collectionId?.trim() ? (
            <Link
              href={brandOrderAmendmentsOrderHref(orderId)}
              className="text-accent-primary text-[11px] font-medium hover:underline"
              data-testid="shop-b2b-amend-brand-amendments-link"
            >
              Заявки бренда
            </Link>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (!pending) return null;

  return (
    <Card
      data-testid="brand-b2b-amend-pending-panel"
      className="border-amber-200/80 bg-amber-50/40"
    >
      <CardContent className="space-y-2 py-3 text-xs">
        <p className="text-[10px] font-bold uppercase text-amber-950">Заявка на изменение заказа</p>
        <p data-testid="brand-b2b-amend-pending-note">{pending.noteRu}</p>
        {pending.proposedLines?.length ? (
          <p className="text-text-secondary">
            Предложено строк: {pending.proposedLines.length}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="h-8 text-[11px]"
            disabled={busy}
            data-testid="brand-b2b-amend-approve"
            onClick={() => void resolveAmendment('approve')}
          >
            Одобрить
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-[11px]"
            disabled={busy}
            data-testid="brand-b2b-amend-reject"
            onClick={() => void resolveAmendment('reject')}
          >
            Отклонить
          </Button>
        </div>
        {message ? (
          <p className="text-text-secondary" role="status">
            {message}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
          <Link
            href={brandB2bOrderHref(orderId)}
            className="text-accent-primary font-medium hover:underline"
            data-testid="brand-b2b-amend-order-detail-link"
          >
            Карточка заказа
          </Link>
          {collectionId?.trim() ? (
            <Link
              href={shopCoreCollectionOrderCabinetHref(collectionId, orderId)}
              className="text-accent-primary font-medium hover:underline"
              data-testid="brand-b2b-amend-shop-cabinet-link"
            >
              Кабинет магазина
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
