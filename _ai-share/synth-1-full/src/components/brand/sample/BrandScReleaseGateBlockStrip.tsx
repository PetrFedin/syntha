'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  brandAttributeSchemaFeatureHref,
  brandAttributeSchemaMaterialPassportHref,
} from '@/lib/fashion/brand-attribute-schema-workspace';
import { fetchBrandScReleaseGateCheck } from '@/lib/production/brand-sc-release-gate-passport';

type Props = {
  collectionId: string;
  compact?: boolean;
};

/** Wave UV · blocks linesheet/showroom publish until material passport complete. */
export function BrandScReleaseGateBlockStrip({ collectionId, compact }: Props) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(true);
  const [messageRu, setMessageRu] = useState('');
  const [ready, setReady] = useState(0);
  const [total, setTotal] = useState(0);
  const [storageMode, setStorageMode] = useState<string | undefined>();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const gate = await fetchBrandScReleaseGateCheck(collectionId);
      setBlocked(gate.blocked);
      setMessageRu(gate.messageRu);
      setReady(gate.summary.ready);
      setTotal(gate.summary.total);
      setStorageMode(gate.storageMode);
    } catch {
      setBlocked(true);
      setMessageRu('Release gate: не удалось проверить material passport.');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const schemaHref = brandAttributeSchemaFeatureHref('health', collectionId);
  const passportHref = brandAttributeSchemaMaterialPassportHref(collectionId);

  return (
    <div
      className={
        compact
          ? 'space-y-1.5 rounded border border-amber-200/70 bg-amber-50/40 px-2 py-2 text-[10px]'
          : 'mb-4 space-y-2 rounded-md border border-amber-200/60 bg-amber-50/30 px-3 py-3 text-xs'
      }
      data-testid="brand-sc-release-gate-block-strip"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px] uppercase">
          Release gate
        </Badge>
        {loading ? (
          <Badge variant="secondary" data-testid="brand-sc-release-gate-block-loading">
            Проверка passport…
          </Badge>
        ) : blocked ? (
          <Badge variant="destructive" data-testid="brand-sc-release-gate-block-badge">
            Publish заблокирован · {ready}/{total} certs
          </Badge>
        ) : (
          <Badge
            className="border-emerald-300 bg-emerald-50 text-emerald-800"
            data-testid="brand-sc-release-gate-block-ready-badge"
          >
            Passport ready · {ready}/{total}
          </Badge>
        )}
        {storageMode ? (
          <Badge variant="outline" className="text-[9px] uppercase">
            {storageMode}
          </Badge>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="ml-auto h-7 text-[10px]"
          disabled={loading}
          data-testid="brand-sc-release-gate-block-recheck-btn"
          onClick={() => void reload()}
        >
          {loading ? '…' : 'Перепроверить'}
        </Button>
      </div>
      {!loading && messageRu ? (
        <p
          className="text-text-secondary text-[10px] leading-snug"
          data-testid="brand-sc-release-gate-block-message"
        >
          {messageRu}
        </p>
      ) : null}
      {!loading && blocked ? (
        <div className="flex flex-wrap gap-2">
          <Link
            href={passportHref}
            className="text-accent-primary text-[10px] hover:underline"
            data-testid="brand-sc-release-gate-block-passport-link"
          >
            Заполнить material passport
          </Link>
          <Link
            href={schemaHref}
            className="text-accent-primary text-[10px] hover:underline"
            data-testid="brand-sc-release-gate-block-schema-link"
          >
            Attribute schema
          </Link>
        </div>
      ) : null}
    </div>
  );
}
