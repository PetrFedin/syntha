'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

export type PillarInsightStep = { id: string; labelRu: string; done: boolean };

type HeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
};

/** Иконка слева + заголовок крупнее, subtitle мельче — как hub quick cards. */
export function PillarInsightHeader({ icon: Icon, title, subtitle, className }: HeaderProps) {
  return (
    <div className={cn(pillarInsight.header, className)}>
      <span className={pillarInsight.iconWrap}>
        <Icon className={pillarInsight.icon} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className={pillarInsight.title}>{title}</h3>
        {subtitle ? <p className={pillarInsight.subtitle}>{subtitle}</p> : null}
      </div>
    </div>
  );
}

type StepsProps = {
  steps: PillarInsightStep[];
  testId?: string;
  /** На md+ показывать полный список вместо chips */
  preferListFromMd?: boolean;
};

/** iPhone: numbered chips; md+: опционально классический список. */
export function PillarInsightSteps({ steps, testId, preferListFromMd = true }: StepsProps) {
  if (steps.length === 0) return null;

  const chips = (
    <div className={cn(pillarInsight.stepRow, preferListFromMd && 'md:hidden')} data-testid={testId}>
      {steps.map((step, index) => (
        <span
          key={step.id}
          data-testid={`platform-core-chain-step-${step.id}`}
          data-done={step.done ? 'true' : 'false'}
          className={cn(
            pillarInsight.stepChip,
            step.done ? pillarInsight.stepChipDone : pillarInsight.stepChipIdle
          )}
        >
          <span className={pillarInsight.stepNum}>{index + 1}</span>
          <span className="line-clamp-1">{step.labelRu}</span>
        </span>
      ))}
    </div>
  );

  if (!preferListFromMd) return chips;

  return (
    <>
      {chips}
      <ul className={pillarInsight.stepList} data-testid={testId ? `${testId}-list` : undefined}>
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-start gap-2 text-xs"
            data-testid={`platform-core-chain-step-${step.id}`}
            data-done={step.done ? 'true' : 'false'}
          >
            <span
              className={cn(
                'mt-0.5 shrink-0 font-mono text-[11px] tabular-nums',
                step.done ? 'text-emerald-600' : 'text-text-muted'
              )}
            >
              {steps.indexOf(step) + 1}.
            </span>
            <span className={step.done ? 'text-text-primary' : 'text-text-muted'}>
              {step.labelRu}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

type CtaRowProps = {
  children: ReactNode;
  className?: string;
};

export function PillarInsightCtaRow({ children, className }: CtaRowProps) {
  return <div className={cn(pillarInsight.ctaRow, className)}>{children}</div>;
}
