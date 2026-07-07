'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { b2bV1SynthaActorRoleHeaders } from '@/lib/auth/b2b-v1-api-client-headers';
import { parseOperationalOrderV1DetailResponse } from '@/lib/order/operational-order-dto.schema';
import { patchOperationalOrderNoteV1 } from '@/lib/order/v1/patch-operational-order-note-v1';
import { cn } from '@/lib/utils';
import { operationalLayoutContract as o } from '@/lib/ui/operational-layout-contract';
import { FileText, Lock, Loader2, StickyNote } from 'lucide-react';

type Variant = 'brand' | 'shop';

/**
 * Загрузка и сохранение операционных / внутренних заметок через B2B v1 API.
 * - **shop:** только операционная заметка (`orderNotes` в DTO), internal не показывается.
 * - **brand:** обе заметки, отдельные кнопки сохранения (разные PATCH с Idempotency-Key).
 */
export function OperationalOrderNotesV1Sync({
  orderId,
  variant,
}: {
  orderId: string;
  variant: Variant;
}) {
  const { toast } = useToast();
  const actorRole = variant === 'brand' ? ('brand' as const) : ('shop' as const);
  const [loading, setLoading] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [savingOp, setSavingOp] = useState(false);
  const [savingIn, setSavingIn] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/b2b/v1/operational-orders/${encodeURIComponent(orderId)}`, {
        headers: { ...b2bV1SynthaActorRoleHeaders(actorRole) },
        cache: 'no-store',
      });
      const raw: unknown = await res.json();
      const parsed = parseOperationalOrderV1DetailResponse(raw);
      if (!parsed.success) {
        toast({
          variant: 'destructive',
          title: 'Не удалось загрузить заметки',
          description: 'Проверьте API v1 operational orders.',
        });
        return;
      }
      const o = parsed.data.data.order;
      setOrderNotes(o.orderNotes ?? '');
      if (variant === 'brand') {
        setInternalNotes(o.internalNotes ?? '');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, actorRole, variant, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveOperational = async () => {
    setSavingOp(true);
    try {
      const r = await patchOperationalOrderNoteV1({
        orderId,
        actorRole,
        idempotencyKey: `v1-op-${orderId}-${crypto.randomUUID()}`,
        note: orderNotes,
      });
      if (!r.ok) {
        toast({ variant: 'destructive', title: 'Ошибка сохранения', description: r.message });
        return;
      }
      setOrderNotes(r.data.note);
      toast({ title: 'Сохранено', description: 'Операционная заметка записана на сервер.' });
    } finally {
      setSavingOp(false);
    }
  };

  const saveInternal = async () => {
    if (variant !== 'brand') return;
    setSavingIn(true);
    try {
      const r = await patchOperationalOrderNoteV1({
        orderId,
        actorRole,
        idempotencyKey: `v1-in-${orderId}-${crypto.randomUUID()}`,
        internalNote: internalNotes,
      });
      if (!r.ok) {
        toast({ variant: 'destructive', title: 'Ошибка сохранения', description: r.message });
        return;
      }
      if (r.data.internalNote !== undefined) {
        setInternalNotes(r.data.internalNote);
      }
      toast({ title: 'Сохранено', description: 'Внутренняя заметка бренда записана.' });
    } finally {
      setSavingIn(false);
    }
  };

  if (!orderId) return null;

  if (loading) {
    return (
      <Card className={cn(o.panel, 'border-dashed shadow-none')}>
        <CardContent className="text-text-muted flex items-center gap-2 py-8 text-sm">
          <Loader2 className="size-4 animate-spin" /> Загрузка заметок (v1)…
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn(o.panel, 'shadow-none')}>
        <CardHeader className="border-border-default/60 border-b pb-3">
          <CardTitle className="text-text-primary flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]">
            <FileText className="text-text-muted size-3.5" aria-hidden />
            Операционные заметки
            <span className="text-text-muted font-semibold normal-case tracking-normal">
              {variant === 'shop' ? '· видны бренду' : '· оптовый контур'}
            </span>
          </CardTitle>
          <CardDescription className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
            API v1 · синхронизация заметок заказа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <Textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Сроки, отгрузка, согласования по линиям…"
            className="border-border-default min-h-[88px] text-sm"
          />
          <Button
            type="button"
            size="sm"
            disabled={savingOp}
            onClick={() => void saveOperational()}
            className="h-8 gap-2 text-[11px] font-semibold"
          >
            {savingOp ? <Loader2 className="size-4 animate-spin" /> : null}
            Сохранить
          </Button>
        </CardContent>
      </Card>

      {variant === 'brand' ? (
        <Card className={cn(o.panel, 'border-l-[3px] border-l-amber-600/70 shadow-none')}>
          <CardHeader className="border-border-default/60 border-b pb-3">
            <CardTitle className="text-text-primary flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]">
              <Lock className="size-3.5 text-amber-700/90" aria-hidden />
              <StickyNote className="text-text-muted size-3.5" aria-hidden />
              Внутренние заметки бренда
            </CardTitle>
            <CardDescription className="text-text-muted text-[10px] font-medium uppercase tracking-wider">
              Только команда бренда · не для кабинета shop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Пометки, согласования, риски…"
              className="border-border-default min-h-[88px] bg-white text-sm"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={savingIn}
              onClick={() => void saveInternal()}
              className="h-8 gap-2 text-[11px] font-semibold"
            >
              {savingIn ? <Loader2 className="size-4 animate-spin" /> : null}
              Сохранить внутреннюю
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
