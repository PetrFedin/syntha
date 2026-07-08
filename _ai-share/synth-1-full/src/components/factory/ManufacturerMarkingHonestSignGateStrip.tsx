'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  resolveWorkshop2MarkingUiStatusRu,
  workshop2MarkingUiStatusLabelRu,
} from '@/lib/production/workshop2-marking-honest-sign';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

type SupplierStatusPayload = {
  markingStatus?: string | null;
  gtin?: string | null;
};

type Props = {
  collectionId: string;
  articleId: string;
};

/** Mfr OP · Честный ЗНАК — read-only gate + CSV export (без fake ACK в core). */
export function ManufacturerMarkingHonestSignGateStrip({ collectionId, articleId }: Props) {
  const [status, setStatus] = useState<SupplierStatusPayload | null>(null);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ supplierStatus: '1' });
    const res = await fetch(
      `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/dossier?${params}`,
      { headers: buildWorkshop2ApiRequestHeaders(), cache: 'no-store' }
    );
    if (!res.ok) {
      setStatus(null);
      return;
    }
    const json = (await res.json()) as {
      ok?: boolean;
      supplierStatus?: SupplierStatusPayload;
    };
    if (json.ok && json.supplierStatus) setStatus(json.supplierStatus);
  }, [articleId, collectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isPlatformCoreMode()) return;
    void fetch('/api/workshop2/health', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { integrations?: { markingApiConfigured?: boolean } };
      })
      .then((json) => {
        if (json?.integrations?.markingApiConfigured != null) {
          setApiConfigured(json.integrations.markingApiConfigured);
        }
      })
      .catch(() => {
        /* optional probe */
      });
  }, []);

  const uiStatus = resolveWorkshop2MarkingUiStatusRu({
    apiConfigured: apiConfigured === true,
    crptOrderId: status?.markingStatus === 'registered' ? 'registered' : null,
    mirrorStatus:
      status?.markingStatus === 'registered'
        ? 'registered'
        : status?.markingStatus === 'pending_external'
          ? 'pending_external'
          : undefined,
  });
  const uiLabel = workshop2MarkingUiStatusLabelRu(uiStatus);
  const csvHref = `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/marking/export-csv`;
  const registerDisabled =
    busy || uiStatus === 'registered' || (isPlatformCoreMode() && apiConfigured === false);

  const register = async () => {
    if (registerDisabled) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/marking/register-order`,
        {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ markingRequired: true, gtin: status?.gtin ?? undefined }),
        }
      );
      const json = (await res.json()) as {
        ok?: boolean;
        messageRu?: string;
        uiStatusLabelRu?: string;
      };
      if (json.ok) {
        setMessage(json.uiStatusLabelRu ?? json.messageRu ?? 'Journal обновлён');
        await load();
      } else {
        setMessage(json.messageRu ?? 'Register недоступен');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="border-border-subtle flex flex-wrap items-center gap-2 rounded-md border bg-violet-50/40 px-3 py-2 text-xs"
      data-testid="mfr-op-marking-honest-sign-gate-strip"
      data-marking-api={apiConfigured == null ? 'unknown' : apiConfigured ? 'live' : 'disabled'}
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        ЧЗ
      </Badge>
      <span className="text-text-secondary" data-testid="mfr-op-marking-ui-status">
        {uiLabel}
        {status?.gtin ? ` · GTIN ${status.gtin}` : ''}
      </span>
      <Link
        href={csvHref}
        data-testid="mfr-op-marking-csv-export-link"
        className="text-accent-primary font-medium hover:underline"
      >
        CSV →
      </Link>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-[10px]"
        disabled={registerDisabled}
        data-testid="mfr-op-marking-register-btn"
        onClick={() => void register()}
      >
        {busy ? '…' : 'Journal register'}
      </Button>
      {isPlatformCoreMode() && apiConfigured === false ? (
        <span
          className="text-text-muted text-[10px]"
          data-testid="mfr-op-marking-core-disabled-hint"
        >
          API ЧЗ не настроен — только CSV
        </span>
      ) : null}
      {message ? (
        <span
          className="text-text-secondary text-[10px]"
          data-testid="mfr-op-marking-register-message"
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
