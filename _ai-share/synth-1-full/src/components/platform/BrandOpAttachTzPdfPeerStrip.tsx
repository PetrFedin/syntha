'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { postBrandB2bOrderAttachTzPdf } from '@/lib/platform-core-ports/fashion/brand-b2b-order-attach-tz-pdf-client';
import { buildBrandOpAttachTzPoSession } from '@/lib/platform-core-ports/fashion/brand-op-attach-tz-po-session';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';

type Props = {
  orderId: string;
  collectionId: string;
  articleId: string;
  factoryId?: string;
  productionOrderId?: string;
};

/** Brand OP · TZ PDF attach peer on B2B order record (`#brand-op-attach-tz-pdf-peer`, Wave UN/UY). */
export function BrandOpAttachTzPdfPeerStrip({
  orderId,
  collectionId,
  articleId,
  factoryId,
  productionOrderId,
}: Props) {
  const searchParams = useSearchParams();
  const anchorRef = useRef<HTMLDivElement>(null);
  const autoAttachStartedRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [attached, setAttached] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [tzPdfHref, setTzPdfHref] = useState<string | null>(null);

  const session = buildBrandOpAttachTzPoSession({
    orderId,
    collectionId,
    articleId,
    factoryId,
    productionOrderId,
  });

  const attachTzPdf = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const result = await postBrandB2bOrderAttachTzPdf({
        orderId,
        collectionId,
        articleId,
        productionOrderId: session.productionOrderId,
      });
      if (result.ok) {
        setAttached(true);
        setTzPdfHref(result.tzPdfHref ?? null);
        setStatus(result.messageRu ?? 'ТЗ PDF прикреплено к PO.');
      } else {
        setStatus(result.messageRu ?? 'Не удалось прикрепить ТЗ PDF.');
      }
    } catch {
      setStatus('Сеть недоступна — повторите позже.');
    } finally {
      setBusy(false);
    }
  };

  const wantsAutoAttach = searchParams.get('attachTzPdf') === '1';

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash === '#brand-op-attach-tz-pdf-peer') {
      anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (wantsAutoAttach && !autoAttachStartedRef.current) {
      autoAttachStartedRef.current = true;
      void attachTzPdf();
    }
  }, [wantsAutoAttach]);

  return (
    <div
      ref={anchorRef}
      id="brand-op-attach-tz-pdf-peer"
      className={cn(
        'border-border-subtle bg-bg-surface2/50 rounded-md border px-3 py-2 text-xs',
        searchParams.get('attachTzPdf') === '1' && 'ring-accent-primary/30 ring-1'
      )}
      data-testid="brand-op-attach-tz-pdf-peer-strip"
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px] uppercase">
          TZ PDF · PO
        </Badge>
        <Button
          type="button"
          size="sm"
          variant={attached ? 'secondary' : 'default'}
          className="h-7 text-[10px]"
          disabled={busy || attached}
          data-testid="brand-op-attach-tz-pdf-btn"
          onClick={() => void attachTzPdf()}
        >
          {attached ? 'ТЗ PDF на PO' : busy ? 'Прикрепление…' : 'Прикрепить ТЗ PDF к PO'}
        </Button>
        {tzPdfHref ? (
          <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
            <a href={tzPdfHref} data-testid="brand-op-attach-tz-pdf-download-link">
              Скачать PDF
            </a>
          </Button>
        ) : null}
        {status ? (
          <span
            className="text-text-muted text-[10px]"
            data-testid="brand-op-attach-tz-pdf-status"
            role="status"
          >
            {status}
          </span>
        ) : null}
      </div>
      <div className={hubGadget.goldenPath}>
        <Link
          href={session.attachTzPoHref}
          data-testid="brand-op-attach-tz-po-link"
          className={hubGadget.goldenLink}
        >
          Прикрепить ТЗ к PO
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={session.attachTzPdfPeerHref}
          data-testid="brand-op-attach-tz-pdf-peer-link"
          className={hubGadget.goldenLink}
        >
          ТЗ PDF на заказе
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={session.poHref}
          data-testid="brand-op-attach-tz-po-order-link"
          className={hubGadget.goldenLink}
        >
          PO {session.productionOrderId}
        </Link>
      </div>
    </div>
  );
}
