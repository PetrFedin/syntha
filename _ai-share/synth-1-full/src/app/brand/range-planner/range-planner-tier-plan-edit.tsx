'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import type { RangePlannerTier } from '@/lib/production/workshop2-range-planner-bridge';

type Props = {
  collectionId: string;
  tierId: RangePlannerTier;
  budget: number;
  targetMargin: number;
  onSaved: () => void;
};

export function RangePlannerTierPlanEdit({
  collectionId,
  tierId,
  budget,
  targetMargin,
  onSaved,
}: Props) {
  const [marginDraft, setMarginDraft] = useState(String(targetMargin));
  const [budgetDraft, setBudgetDraft] = useState(String(budget));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    const nextMargin = Number.parseInt(marginDraft, 10);
    const nextBudget = Number.parseInt(budgetDraft.replace(/\s/g, ''), 10);
    if (!Number.isFinite(nextMargin) || nextMargin <= 0 || nextMargin > 100) {
      setMessage('Маржа: от 1 до 100%.');
      return;
    }
    if (!Number.isFinite(nextBudget) || nextBudget <= 0) {
      setMessage('Бюджет должен быть больше 0.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/workshop2/collections/${encodeURIComponent(collectionId)}/range-planner`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...buildWorkshop2ApiRequestHeaders(),
          },
          body: JSON.stringify({
            tier: tierId,
            budget: nextBudget,
            targetMargin: nextMargin,
          }),
        }
      );
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      if (!res.ok || !json.ok) {
        setMessage(json.messageRu ?? 'Не удалось сохранить план.');
        return;
      }
      setMessage('Сохранено в коллекции.');
      onSaved();
    } catch {
      setMessage('Сеть недоступна.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="space-y-2 border-t border-dashed border-emerald-100 pt-2"
      data-testid={`range-planner-tier-edit-${tierId}`}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-0.5 text-[10px]">
          <span className="text-text-muted font-bold uppercase">Маржа %</span>
          <Input
            type="number"
            min={1}
            max={100}
            value={marginDraft}
            onChange={(e) => setMarginDraft(e.target.value)}
            className="h-8 text-xs tabular-nums"
            data-testid={`range-planner-tier-margin-input-${tierId}`}
          />
        </label>
        <label className="space-y-0.5 text-[10px]">
          <span className="text-text-muted font-bold uppercase">Бюджет ₽</span>
          <Input
            type="number"
            min={1}
            step={1000}
            value={budgetDraft}
            onChange={(e) => setBudgetDraft(e.target.value)}
            className="h-8 text-xs tabular-nums"
            data-testid={`range-planner-tier-budget-input-${tierId}`}
          />
        </label>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="min-h-11 w-full text-[10px] font-bold uppercase sm:h-7 sm:min-h-0"
        disabled={busy}
        data-testid={`range-planner-tier-plan-save-${tierId}`}
        onClick={() => void save()}
      >
        {busy ? 'Сохранение…' : 'Сохранить план уровня'}
      </Button>
      {message ? (
        <p className="text-[10px] text-sky-900" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
