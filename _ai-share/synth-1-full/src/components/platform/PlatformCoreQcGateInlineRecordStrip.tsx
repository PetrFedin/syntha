'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type QcResult = 'pass' | 'fail' | 'rework';

type Props = {
  collectionId: string;
  defaultOrderId?: string;
  articleId?: string;
  inspectorLabel?: string;
  onRecorded?: () => void;
  testIdPrefix: string;
};

/** QC gate in-tab loop: POST inspection без ухода на QC App. */
export function PlatformCoreQcGateInlineRecordStrip({
  collectionId,
  defaultOrderId,
  articleId,
  inspectorLabel = 'Гейт КК в карточке',
  onRecorded,
  testIdPrefix,
}: Props) {
  const [orderId, setOrderId] = useState(defaultOrderId ?? '');
  const [result, setResult] = useState<QcResult>('pass');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (defaultOrderId?.trim()) setOrderId(defaultOrderId.trim());
  }, [defaultOrderId]);

  const handleSubmit = async () => {
    const oid = orderId.trim();
    if (!oid || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/brand/production/qc-gate/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: oid,
          collectionId,
          articleId: articleId?.trim() || undefined,
          result,
          inspectorLabel,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      if (!res.ok || !json.ok) {
        setMessage(json.messageRu ?? 'Не удалось записать инспекцию.');
        return;
      }
      setMessage(json.messageRu ?? 'Инспекция записана в PG.');
      onRecorded?.();
    } catch {
      setMessage('Ошибка сети при записи QC.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="border-border-subtle bg-bg-surface2/50 space-y-2 rounded-md border px-3 py-3"
      data-testid={`${testIdPrefix}-inline-record-strip`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[9px] uppercase">
          In-tab QC
        </Badge>
        <span className="text-text-secondary text-xs">Запись инспекции → PG gate без QC App</span>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[12rem] flex-1">
          <label className="text-text-muted mb-1 block text-[10px] uppercase">Order / PO</label>
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="h-8 text-xs"
            data-testid={`${testIdPrefix}-inline-record-order`}
            placeholder="B2B-DEMO-SHOP1-SS27"
          />
        </div>
        <div className="w-[8rem]">
          <label className="text-text-muted mb-1 block text-[10px] uppercase">Result</label>
          <Select value={result} onValueChange={(v) => setResult(v as QcResult)}>
            <SelectTrigger
              className="h-8 text-xs"
              data-testid={`${testIdPrefix}-inline-record-result`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pass">pass</SelectItem>
              <SelectItem value="fail">fail</SelectItem>
              <SelectItem value="rework">rework</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-8 text-[10px]"
          disabled={busy || !orderId.trim()}
          data-testid={`${testIdPrefix}-inline-record-submit`}
          onClick={() => void handleSubmit()}
        >
          {busy ? '…' : 'Записать'}
        </Button>
      </div>
      {message ? (
        <p
          className="text-text-muted text-[10px]"
          data-testid={`${testIdPrefix}-inline-record-message`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
