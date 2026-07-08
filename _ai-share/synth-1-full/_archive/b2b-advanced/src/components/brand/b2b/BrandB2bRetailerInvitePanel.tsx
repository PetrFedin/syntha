'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

/** CRM: demo-invite для нового ритейлера (симметрия shop-sc-partners-invite). */
export function BrandB2bRetailerInvitePanel({
  buyerEmail = 'buyer@shop-demo.local',
  compact = false,
}: {
  buyerEmail?: string;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function requestDemoInvite() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/brand/b2b/invites', {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buyerEmail, tier: 'standard' }),
      });
      const json = (await res.json()) as { ok?: boolean; acceptUrl?: string; messageRu?: string };
      if (json.ok && json.acceptUrl) {
        setInviteUrl(json.acceptUrl);
        setMessage('Ссылка для байера готова.');
      } else {
        setMessage(json.messageRu ?? 'Не удалось создать invite.');
      }
    } catch {
      setMessage('Invite API недоступен.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={
        compact
          ? 'inline-flex flex-wrap items-center gap-2'
          : 'border-border-subtle bg-bg-surface2/40 space-y-2 rounded-md border px-3 py-2'
      }
      data-testid="brand-co-registry-invite-panel"
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-[10px] font-bold uppercase"
        disabled={busy}
        data-testid="brand-co-registry-invite-generate"
        onClick={() => void requestDemoInvite()}
      >
        {busy ? '…' : 'Invite байера'}
      </Button>
      {inviteUrl ? (
        <span
          className="text-text-secondary max-w-[14rem] truncate text-[10px]"
          data-testid="brand-co-registry-invite-url"
          title={inviteUrl}
        >
          {inviteUrl}
        </span>
      ) : null}
      {message && !compact ? <p className="text-text-muted text-[10px]">{message}</p> : null}
    </div>
  );
}
