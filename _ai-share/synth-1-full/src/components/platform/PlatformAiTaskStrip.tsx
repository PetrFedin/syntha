'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';
import { backendAgentForSection } from '@/lib/platform-core-planner-agent-routing';
import { cn } from '@/lib/utils';

type Props = {
  sectionId: string;
  pillarId: CoreHubPillarId;
  roleId: CoreChainRoleId;
  task: string;
  collectionId?: string;
  orderId?: string;
  orders?: Array<Record<string, unknown>>;
  contextExtra?: Record<string, unknown>;
  buttonLabel?: string;
  testId?: string;
  className?: string;
};

type AiPayload = {
  agent: string;
  task_type: string;
  code_changes?: string | null;
  next_step?: string | null;
};

export function PlatformAiTaskStrip({
  sectionId,
  pillarId,
  roleId,
  task,
  collectionId,
  orderId,
  orders,
  contextExtra,
  buttonLabel = 'Проверить аномалии',
  testId = 'platform-ai-task-strip',
  className,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiPayload | null>(null);
  const hintAgent = backendAgentForSection(sectionId);

  async function runScan() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/dev/platform-ai/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          context: {
            pillar: pillarId,
            role: roleId,
            section_id: sectionId,
            collectionId,
            orderId,
            orders,
            ...contextExtra,
          },
        }),
      });
      const json = (await res.json()) as { ok?: boolean; data?: AiPayload; error?: string };
      if (!res.ok || !json.ok || !json.data) {
        setError(json.error || 'Агент недоступен (FastAPI :8000?)');
        setResult(null);
        return;
      }
      setResult(json.data);
    } catch {
      setError('Ошибка сети при вызове агента');
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(hubGadget.goldenPath + ' mb-3 flex flex-col gap-2', className)}
      data-testid={testId}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[11px]">AI · {hintAgent ?? 'orchestrator'}</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          data-testid={`${testId}-run`}
          onClick={() => void runScan()}
        >
          {busy ? 'Анализ…' : buttonLabel}
        </Button>
      </div>
      {error ? (
        <p className="text-[11px] text-destructive" data-testid={`${testId}-error`}>
          {error}
        </p>
      ) : null}
      {result ? (
        <div className="text-text-secondary space-y-1 text-[11px]" data-testid={`${testId}-result`}>
          <p>
            <span className="text-text-muted">Агент:</span> {result.agent} · {result.task_type}
          </p>
          {result.code_changes ? (
            <p className="max-h-28 overflow-y-auto whitespace-pre-wrap">{result.code_changes}</p>
          ) : null}
          {result.next_step ? <p className="text-text-muted">{result.next_step}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
