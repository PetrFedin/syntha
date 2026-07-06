'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postBrandAgentRepCommissionDispute } from '@/lib/fashion/brand-agent-rep-commission-dispute-store';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  commissionId?: string;
  repName?: string;
};

/** Brand agent rep · commission dispute stub POST (wave UC). */
export function BrandAgentRepCommissionDisputeStrip({
  commissionId = 'comm-demo-001',
  repName,
}: Props) {
  const [reasonRu, setReasonRu] = useState('');
  const [busy, setBusy] = useState(false);
  const [messageRu, setMessageRu] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = reasonRu.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setMessageRu(null);
    try {
      const res = await postBrandAgentRepCommissionDispute({
        commissionId,
        reasonRu: trimmed,
        repName,
      });
      if (res.ok && res.dispute) {
        setDisputeId(res.dispute.disputeId);
        setMessageRu(res.messageRu ?? 'Спор принят.');
        setReasonRu('');
      } else {
        setMessageRu(res.messageRu ?? 'Не удалось отправить спор.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-agent-rep-commission-dispute-strip">
      <Badge variant="outline" data-testid="brand-agent-rep-commission-dispute-label">
        Спор по комиссии
      </Badge>
      <Input
        value={reasonRu}
        onChange={(event) => setReasonRu(event.target.value)}
        placeholder="Причина спора (RU)"
        className="h-7 max-w-xs text-xs"
        data-testid="brand-agent-rep-commission-dispute-reason"
      />
      <Button
        size="sm"
        variant="outline"
        disabled={busy || !reasonRu.trim()}
        onClick={() => void submit()}
        data-testid="brand-agent-rep-commission-dispute-submit"
      >
        Отправить
      </Button>
      {disputeId ? (
        <Badge variant="secondary" data-testid="brand-agent-rep-commission-dispute-id">
          {disputeId}
        </Badge>
      ) : null}
      {messageRu ? (
        <span className="text-text-muted text-[10px]" data-testid="brand-agent-rep-commission-dispute-message">
          {messageRu}
        </span>
      ) : null}
    </div>
  );
}
