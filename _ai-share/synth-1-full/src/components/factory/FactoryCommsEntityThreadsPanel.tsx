'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatformCoreCommsInboxPoll } from '@/hooks/use-platform-core-comms-inbox-poll';
import { attachFactoryCommsEntityThreadTz } from '@/lib/fashion/factory-comms-entity-thread-attach-tz-store';
import {
  manufacturerCommsEntityThreadSupportsAttachTz,
  supplierCommsEntityThreadSupportsAttachTz,
} from '@/lib/fashion/factory-comms-entity-thread-attach-tz';
import {
  buildManufacturerCommsEntityThreads,
  manufacturerCommsInboxHref,
} from '@/lib/fashion/manufacturer-comms-entity-threads';
import {
  buildSupplierCommsEntityThreads,
  supplierCommsEntitiesHref,
} from '@/lib/fashion/supplier-comms-entity-threads';
import { SupplierManufacturerHandoffPeerStrip } from '@/components/factory/supplier/SupplierManufacturerHandoffPeerStrip';
import { SupplierRfqSlaTimerStrip } from '@/components/factory/supplier/SupplierRfqSlaTimerStrip';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { PLATFORM_CORE_DEMO, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';
import { PlatformCoreEntityThreadTemplatesStrip } from '@/components/platform/PlatformCoreEntityThreadTemplatesStrip';
import type { PlatformCoreEntityThreadKind } from '@/lib/communications/platform-core-entity-thread-templates';

type Props = {
  variant: 'manufacturer' | 'supplier';
};

export function FactoryCommsEntityThreadsPanel({ variant }: Props) {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({ collection: searchParams.get('collection') });
  const articleId =
    searchParams.get('article')?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01';
  const orderId =
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    searchParams.get('wholesaleOrderId')?.trim() ||
    undefined;
  const factoryId = searchParams.get('factoryId')?.trim() || PLATFORM_CORE_DEMO.factoryId;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [attached, setAttached] = useState<Record<string, boolean>>({});
  const { sseConnected: inboxSseConnected } = usePlatformCoreCommsInboxPoll(true);

  const rows = useMemo(() => {
    if (variant === 'manufacturer') {
      return buildManufacturerCommsEntityThreads({ collectionId, articleId, orderId, factoryId });
    }
    return buildSupplierCommsEntityThreads({ collectionId, articleId, orderId });
  }, [variant, collectionId, articleId, orderId, factoryId]);

  const inboxHref =
    variant === 'manufacturer'
      ? manufacturerCommsInboxHref()
      : `${ROUTES.factory.supplierMessages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=inbox&collection=${encodeURIComponent(collectionId)}`;

  const manufacturerHandoffHref = manufacturerHandoffFeatureHref('handoff', {
    factoryId,
    collectionId,
    orderId,
  });
  const manufacturerQcHref = manufacturerHandoffFeatureHref('qc-gate', {
    factoryId,
    collectionId,
    orderId,
  });
  const manufacturerAckHref = manufacturerHandoffFeatureHref('techpack-ack', {
    factoryId,
    collectionId,
    orderId,
  });

  const supportsAttach = (threadId: (typeof rows)[number]['id']) =>
    variant === 'manufacturer'
      ? manufacturerCommsEntityThreadSupportsAttachTz(
          threadId as 'dossier' | 'sample' | 'handoff' | 'qc'
        )
      : supplierCommsEntityThreadSupportsAttachTz(threadId as 'bom' | 'rfq' | 'handoff' | 'qc');

  const attachTz = async (threadId: (typeof rows)[number]['id']) => {
    if (!supportsAttach(threadId)) return;
    setBusyId(threadId);
    try {
      const res = await attachFactoryCommsEntityThreadTz({
        variant,
        collectionId,
        articleId,
        threadKind: threadId,
      });
      if (res.ok) setAttached((prev) => ({ ...prev, [threadId]: true }));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4" data-testid={`${variant}-comms-entity-threads-panel`}>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Треды сущностей</Badge>
        <Badge variant="outline">Столп 5 · comms</Badge>
        <Badge
          variant="outline"
          className="text-[9px]"
          data-testid={`${variant}-comms-entity-threads-sse-${inboxSseConnected ? 'live' : 'poll'}`}
        >
          {inboxSseConnected ? 'inbox SSE' : 'inbox poll'}
        </Badge>
        <Button size="sm" variant="outline" asChild>
          <Link href={inboxHref}>Inbox</Link>
        </Button>
        {variant === 'supplier' ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href={supplierCommsEntitiesHref(collectionId, articleId)}>Entities tab</Link>
          </Button>
        ) : null}
      </div>

      {variant === 'supplier' ? (
        <SupplierManufacturerHandoffPeerStrip
          factoryId={factoryId}
          collectionId={collectionId}
          orderId={orderId}
        />
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Structured threads</CardTitle>
          <CardDescription>
            PLM-style: чат с привязкой к handoff, dossier, QC или BOM/RFQ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              data-testid={`${variant}-comms-entity-thread-${row.id}`}
            >
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium">{row.labelRu}</p>
                <p className="text-text-muted text-xs">{row.summaryRu}</p>
                <Badge variant="outline" className="mt-1 text-[9px]">
                  {row.pillarRu}
                </Badge>
                {variant === 'supplier' && row.id === 'rfq' ? (
                  <SupplierRfqSlaTimerStrip
                    collectionId={collectionId}
                    articleId={articleId}
                    variant="inline"
                    context="thread"
                  />
                ) : null}
                <PlatformCoreEntityThreadTemplatesStrip
                  variant={variant}
                  threadKind={row.id as PlatformCoreEntityThreadKind}
                  collectionId={collectionId}
                  articleId={articleId}
                  orderId={orderId}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href={row.messagesHref}>Открыть чат</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={row.contextHref}>Контекст</Link>
                </Button>
                {variant === 'supplier' && row.id === 'handoff' ? (
                  <>
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={manufacturerHandoffHref}
                        data-testid="supplier-comms-entity-manufacturer-handoff-link"
                      >
                        Factory handoff
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link
                        href={manufacturerAckHref}
                        data-testid="supplier-comms-entity-manufacturer-ack-link"
                      >
                        Factory-ack
                      </Link>
                    </Button>
                  </>
                ) : null}
                {variant === 'supplier' && row.id === 'qc' ? (
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      href={manufacturerQcHref}
                      data-testid="supplier-comms-entity-manufacturer-qc-link"
                    >
                      Manufacturer QC
                    </Link>
                  </Button>
                ) : null}
                {row.attachTzSupported ? (
                  <>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={row.dossierTzHref}>Dossier TZ</Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyId != null || attached[row.id]}
                      onClick={() => void attachTz(row.id)}
                      data-testid={`${variant}-comms-entity-thread-attach-tz-${row.id}`}
                    >
                      {busyId === row.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : attached[row.id] ? (
                        'TZ attached'
                      ) : (
                        'Attach TZ'
                      )}
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
