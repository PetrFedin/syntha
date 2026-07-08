'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { glossary } from '@/lib/education-data';

export function GlossaryText({ text }: { text: string }) {
  if (!text) return null;

  const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'g');

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const entry = glossary[part];
        if (entry) {
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <span className="border-accent-primary/40 text-accent-primary hover:bg-accent-primary/10 cursor-help border-b border-dotted px-0.5 font-bold transition-colors">
                  {part}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-text-primary border-text-primary/30 max-w-[280px] rounded-xl p-4 text-white shadow-2xl">
                <p className="text-accent-primary mb-1 text-[10px] font-bold uppercase tracking-widest">
                  {entry.term}
                </p>
                <p className="text-xs font-medium leading-relaxed">{entry.definition}</p>
              </TooltipContent>
            </Tooltip>
          );
        }
        return part;
      })}
    </>
  );
}
