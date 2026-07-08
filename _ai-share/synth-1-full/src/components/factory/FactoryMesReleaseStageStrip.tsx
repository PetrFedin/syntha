'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FACTORY_MES_RELEASE_STAGE_ORDER,
  FACTORY_MES_RELEASE_STAGE_LABEL_RU,
  canAdvanceFactoryMesReleaseStage,
  factoryMesReleaseStageLabelRu,
  factoryMesReleaseStageProgressIndex,
  type FactoryMesReleaseStage,
} from '@/lib/production/workshop2-factory-mes-release-stage';

type Props = {
  stage: string;
  poStatus: string;
  busy?: boolean;
  onAdvance?: () => void;
  testId?: string;
};

/** Компактная полоса MES cut / sew / qc / released для реестра production-orders. */
export function FactoryMesReleaseStageStrip({ stage, poStatus, busy, onAdvance, testId }: Props) {
  const current = factoryMesReleaseStageProgressIndex(stage);
  const canAdvance = canAdvanceFactoryMesReleaseStage(poStatus, stage);
  const nextLabel = canAdvance
    ? FACTORY_MES_RELEASE_STAGE_LABEL_RU[
        FACTORY_MES_RELEASE_STAGE_ORDER[current + 1] as FactoryMesReleaseStage
      ]
    : null;

  return (
    <div className="space-y-1.5" data-testid={testId}>
      <div className="flex flex-wrap gap-1">
        {FACTORY_MES_RELEASE_STAGE_ORDER.filter((s) => s !== 'queued').map((step, idx) => {
          const stepIndex = idx + 1;
          const active = current >= stepIndex;
          const isCurrent =
            factoryMesReleaseStageProgressIndex(stage) === stepIndex ||
            (stage === 'queued' && step === 'cut' && poStatus !== 'synced');
          return (
            <Badge
              key={step}
              variant={active ? 'default' : 'outline'}
              className={cn(
                'text-[8px] font-semibold normal-case',
                isCurrent && 'ring-accent-primary/40 ring-1',
                !active && 'text-text-muted opacity-70'
              )}
              data-testid={testId ? `${testId}-step-${step}` : undefined}
            >
              {FACTORY_MES_RELEASE_STAGE_LABEL_RU[step]}
            </Badge>
          );
        })}
      </div>
      <p className="text-text-muted text-[9px]">
        MES: {factoryMesReleaseStageLabelRu(stage)}
        {poStatus !== 'synced' ? ' · примите серию' : null}
      </p>
      {canAdvance && onAdvance ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-6 px-2 text-[9px]"
          disabled={busy}
          data-testid={testId ? `${testId}-advance` : undefined}
          onClick={onAdvance}
        >
          {busy ? '…' : nextLabel ? `→ ${nextLabel}` : 'Далее'}
        </Button>
      ) : null}
    </div>
  );
}
