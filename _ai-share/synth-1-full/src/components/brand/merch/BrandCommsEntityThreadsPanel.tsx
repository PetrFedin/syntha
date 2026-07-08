'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatformCoreCommsInboxPoll } from '@/hooks/use-platform-core-comms-inbox-poll';
import { attachBrandCommsEntityThreadTz } from '@/lib/fashion/brand-comms-entity-thread-attach-tz-store';
import { brandCommsEntityThreadSupportsAttachTz } from '@/lib/fashion/brand-comms-entity-thread-attach-tz';
import { buildBrandCommsEntityThreads } from '@/lib/fashion/brand-comms-entity-threads';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';
import { PLATFORM_CORE_DEMO, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PlatformCoreEntityThreadTemplatesStrip } from '@/components/platform/PlatformCoreEntityThreadTemplatesStrip';
import type { PlatformCoreEntityThreadKind } from '@/lib/communications/platform-core-entity-thread-templates';

export function BrandCommsEntityThreadsPanel() {
  const searchParams = useSearchParams();
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
  });
  const articleId =
    searchParams.get('article')?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01';
  const [busyId, setBusyId] = useState<string | null>(null);
  const [attached, setAttached] = useState<Record<string, boolean>>({});
  const { sseConnected: inboxSseConnected } = usePlatformCoreCommsInboxPoll(true);

  const rows = useMemo(
    () => buildBrandCommsEntityThreads({ collectionId, articleId }),
    [collectionId, articleId]
  );

  const inboxHref = `${ROUTES.brand.messages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=inbox`;

  const attachTz = async (threadId: (typeof rows)[number]['id']) => {
    if (!brandCommsEntityThreadSupportsAttachTz(threadId)) return;
    setBusyId(threadId);
    try {
      const res = await attachBrandCommsEntityThreadTz({
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
    <div className="space-y-4" data-testid="brand-comms-entity-threads-panel">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Structured threads</Badge>
        <Badge variant="outline">BOM · sample · QC · RFQ</Badge>
        <Badge variant="outline" data-testid="brand-comms-entity-threads-dossier-badge">
          Dossier TZ attach
        </Badge>
        <Badge
          variant="outline"
          className="text-[9px]"
          data-testid={`brand-comms-entity-threads-sse-${inboxSseConnected ? 'live' : 'poll'}`}
        >
          {inboxSseConnected ? 'inbox SSE' : 'inbox poll'}
        </Badge>
        <Button size="sm" variant="outline" asChild>
          <Link href={inboxHref}>Inbox</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href={`${ROUTES.brand.integrationsCentric}?${PILLAR_CAPABILITY_FEATURE_PARAM}=rfq`}>
            Centric RFQ
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Треды сущностей</CardTitle>
          <CardDescription>
            PLM-контекст: чат с привязкой к BOM, образцу, гейту КК или RFQ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              data-testid={`brand-comms-entity-thread-${row.id}`}
            >
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium">{row.labelRu}</p>
                <p className="text-text-muted text-xs">{row.summaryRu}</p>
                <Badge variant="outline" className="mt-1 text-[9px]">
                  {row.pillarRu}
                </Badge>
                <PlatformCoreEntityThreadTemplatesStrip
                  variant="brand"
                  threadKind={row.id as PlatformCoreEntityThreadKind}
                  collectionId={collectionId}
                  articleId={articleId}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href={row.messagesHref}>Открыть чат</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={row.contextHref}>Контекст</Link>
                </Button>
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
                      data-testid={`brand-comms-entity-thread-attach-tz-${row.id}`}
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
