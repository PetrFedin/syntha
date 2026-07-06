'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { PlatformCoreQcGateInlineRecordStrip } from '@/components/platform/PlatformCoreQcGateInlineRecordStrip';
import { buildManufacturerQcGateSession } from '@/lib/production/manufacturer-qc-gate';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { ClipboardCheck } from 'lucide-react';

type Props = {
  factoryId: string;
  collectionId: string;
  orderId?: string;
  articleId?: string;
};

export function ManufacturerQcGatePanel({ factoryId, collectionId, orderId, articleId }: Props) {
  const session = buildManufacturerQcGateSession({ factoryId, collectionId, orderId, articleId });
  const resolvedOrderId = orderId?.trim();
  const { sseConnected } = usePlatformCoreChainStatusPoll(Boolean(resolvedOrderId), [
    resolvedOrderId ?? '',
  ]);

  return (
    <div className="space-y-4" data-testid="manufacturer-qc-gate-panel">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <CardTitle className="text-base">Контроль качества · цех</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase">
              Inspectorio
            </Badge>
            {resolvedOrderId ? (
              <PlatformCoreChainStatusRefreshBadge
                sseConnected={sseConnected}
                enabled
                sseTestId="mfr-qc-gate-chain-sse-live-badge"
                pollTestId="mfr-qc-gate-chain-poll-badge"
              />
            ) : null}
          </div>
          <CardDescription>
            Чеклист AQL + доказательства — мост гейта КК бренда ↔ досье цеха ↔ передача.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={session.brandQcTabHref} data-testid="mfr-qc-gate-brand-ops-link">
              Brand QC tab
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.liveQcHref}>Live QC app</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.dossierHref} data-testid="mfr-qc-gate-dossier-link">
              Shop-floor dossier
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={session.handoffHref} data-testid="mfr-qc-gate-handoff-link">
              Очередь передачи
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={session.brandHandoffHref}>Передача бренда</Link>
          </Button>
        </CardContent>
      </Card>

      {resolvedOrderId ? (
        <PlatformCoreQcGateInlineRecordStrip
          collectionId={collectionId}
          defaultOrderId={resolvedOrderId}
          articleId={articleId}
          inspectorLabel="Гейт КК производства"
          testIdPrefix="mfr-qc-gate"
        />
      ) : null}
    </div>
  );
}
