'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlatformCoreCommsInboxPoll } from '@/hooks/use-platform-core-comms-inbox-poll';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';

type Props = {
  collectionId: string;
};

/** Sample status events → inbox SSE/poll (server bump on domain events). */
export function BrandSampleLifecycleCommsPeerStrip({ collectionId }: Props) {
  const { sseConnected } = usePlatformCoreCommsInboxPoll(true);
  const inboxHref = `${ROUTES.brand.messages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=inbox&collection=${encodeURIComponent(collectionId)}`;
  const entitiesHref = `${ROUTES.brand.messages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=entities&collection=${encodeURIComponent(collectionId)}`;

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid="brand-sample-lifecycle-comms-peer-strip"
    >
      <Badge variant="outline" className="text-[9px]">
        Связь · события образца
      </Badge>
      <Badge
        variant="outline"
        className="text-[9px]"
        data-testid={`brand-sample-lifecycle-comms-sse-${sseConnected ? 'live' : 'poll'}`}
      >
        {sseConnected ? 'входящие SSE' : 'опрос входящих'}
      </Badge>
      <span className="text-text-secondary">
        Статус образца → POST transition → inbox SSE (`sample_order.status_changed`).
      </span>
      <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
        <Link href={inboxHref} data-testid="brand-sample-lifecycle-comms-inbox-link">
          Входящие
        </Link>
      </Button>
      <Button size="sm" variant="ghost" className="h-7 text-[10px]" asChild>
        <Link href={entitiesHref} data-testid="brand-sample-lifecycle-comms-entities-link">
          Сущности
        </Link>
      </Button>
    </div>
  );
}
