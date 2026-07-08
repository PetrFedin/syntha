'use client';

/**
 * Быстрый переход к чату и календарю с контекстом заказа (ядро: коммуникации в процессе B2B).
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  brandCalendarB2bOrderContextHref,
  brandMessagesB2bOrderContextHref,
  brandProductsMatrixB2bOrderContextHref,
  shopB2bMatrixOrderContextHref,
  shopB2bSelectionBuilderOrderContextHref,
  shopB2bWhiteboardOrderContextHref,
  shopCalendarB2bOrderContextHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/routes';

export function B2bOrderCommsContextButtons({
  orderId,
  variant,
  className,
  showWorkspaceDeepLinks = true,
}: {
  orderId: string;
  variant: 'brand' | 'shop';
  className?: string;
  /** Матрица · подборки · доска (shop) или матрица бренда — тот же контур заказа, что у чата. */
  showWorkspaceDeepLinks?: boolean;
}) {
  if (!orderId) return null;
  const msgHref =
    variant === 'brand'
      ? brandMessagesB2bOrderContextHref(orderId)
      : shopMessagesB2bOrderContextHref(orderId);
  const calHref =
    variant === 'brand'
      ? brandCalendarB2bOrderContextHref(orderId)
      : shopCalendarB2bOrderContextHref(orderId);

  const matrixBrandHref = brandProductsMatrixB2bOrderContextHref(orderId);
  const matrixShopHref = shopB2bMatrixOrderContextHref(orderId);
  const selectionHref = shopB2bSelectionBuilderOrderContextHref(orderId);
  const whiteboardHref = shopB2bWhiteboardOrderContextHref(orderId);

  return (
    <div
      className={cn('flex flex-col gap-1.5', className)}
      data-testid="b2b-order-comms-context-buttons"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide"
          asChild
        >
          <Link href={msgHref} title="Открыть сообщения с контекстом этого заказа">
            <MessageSquare className="size-3.5" aria-hidden />
            Чат
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide"
          asChild
        >
          <Link href={calHref} title="Календарь задач с привязкой к заказу">
            <Calendar className="size-3.5" aria-hidden />
            Задачи
          </Link>
        </Button>
      </div>
      {showWorkspaceDeepLinks ? (
        <div
          className="flex max-w-[min(100%,22rem)] flex-wrap gap-x-2 gap-y-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
          data-testid="b2b-order-workspace-deep-links"
        >
          {variant === 'brand' ? (
            <Link
              href={matrixBrandHref}
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Матрица
            </Link>
          ) : (
            <>
              <Link
                href={matrixShopHref}
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                Матрица
              </Link>
              <span className="text-border-default" aria-hidden>
                ·
              </span>
              <Link
                href={selectionHref}
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                Подборки
              </Link>
              <span className="text-border-default" aria-hidden>
                ·
              </span>
              <Link
                href={whiteboardHref}
                className="underline-offset-2 hover:text-foreground hover:underline"
              >
                Доска
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
