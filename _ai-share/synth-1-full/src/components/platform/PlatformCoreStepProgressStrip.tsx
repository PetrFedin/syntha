'use client';

import { CheckCircle2, Circle } from 'lucide-react';

export type PlatformCoreStep = { id: string; labelRu: string; done: boolean };

type Props = {
  steps: PlatformCoreStep[];
  testId?: string;
  variant?: 'horizontal' | 'vertical';
};

/** Визуальный прогресс этапов — горизонтальная полоса или вертикальный список. */
export function PlatformCoreStepProgressStrip({
  steps,
  testId = 'platform-core-step-progress',
  variant = 'horizontal',
}: Props) {
  if (steps.length === 0) return null;

  if (variant === 'vertical') {
    return (
      <ul data-testid={testId} className="space-y-1.5">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-2 text-xs">
            {step.done ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
            ) : (
              <Circle className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            <span className={step.done ? 'text-text-primary' : 'text-text-muted'}>
              {step.labelRu}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ol
      data-testid={testId}
      aria-label="Прогресс этапов"
      className="flex max-w-full flex-nowrap items-start gap-1 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="flex min-w-[4.5rem] max-w-[9rem] shrink-0 snap-start flex-col items-center gap-1 md:min-w-0 md:max-w-[9rem] md:flex-1"
        >
          <div className="flex w-full items-center">
            {index > 0 ? (
              <span
                className={
                  step.done || steps[index - 1]?.done
                    ? 'h-px min-w-[0.35rem] flex-1 bg-emerald-300'
                    : 'bg-border-subtle h-px min-w-[0.35rem] flex-1'
                }
                aria-hidden
              />
            ) : (
              <span className="min-w-[0.35rem] flex-1" aria-hidden />
            )}
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            ) : (
              <Circle className="text-text-muted h-4 w-4 shrink-0" aria-hidden />
            )}
            {index < steps.length - 1 ? (
              <span
                className={
                  step.done
                    ? 'h-px min-w-[0.35rem] flex-1 bg-emerald-300'
                    : 'bg-border-subtle h-px min-w-[0.35rem] flex-1'
                }
                aria-hidden
              />
            ) : (
              <span className="min-w-[0.35rem] flex-1" aria-hidden />
            )}
          </div>
          <span
            className={
              step.done
                ? 'text-text-primary text-center text-[9px] font-medium leading-tight'
                : 'text-text-muted text-center text-[9px] leading-tight'
            }
          >
            {step.labelRu}
          </span>
        </li>
      ))}
    </ol>
  );
}
