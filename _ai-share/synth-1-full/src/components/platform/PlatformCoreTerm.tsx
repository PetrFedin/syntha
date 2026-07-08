'use client';

import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PLATFORM_CORE_TERM_TIPS } from '@/lib/platform-core-canonical-labels';

type Props = {
  term: keyof typeof PLATFORM_CORE_TERM_TIPS | string;
  children?: ReactNode;
};

/** Аббревиатура с подсказкой EN + RU (Platform Core). */
export function PlatformCoreTerm({ term, children }: Props) {
  const tip = PLATFORM_CORE_TERM_TIPS[term];
  const label = children ?? tip?.labelRu ?? term;

  if (!tip) {
    return <>{label}</>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="border-current/40 cursor-help border-b border-dashed">{label}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-left text-xs">
          <p className="font-medium">{tip.en}</p>
          <p className="mt-1 text-muted-foreground">{tip.ru}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
