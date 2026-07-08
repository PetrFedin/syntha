'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ensureFacetSelectionSet } from '@/components/brand/production/workshop2-tab-content-utils';

/** Мультивыбор значения фасета: пустой набор = «все»; иначе строка проходит, если её значение в наборе (OR внутри фасета). */
export function Workshop2ArticleFacetPopover({
  label,
  title,
  options,
  selected,
  onSelectedChange,
  triggerId,
  compactLabel,
}: {
  label: string;
  title: string;
  options: string[];
  selected: ReadonlySet<string> | unknown;
  onSelectedChange: (next: Set<string>) => void;
  triggerId: string;
  /** Короткая подпись на узком экране (кнопка 36×36). */
  compactLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const sel = ensureFacetSelectionSet(selected);
  const summary = sel.size === 0 ? 'Все' : sel.size === 1 ? [...sel][0]! : `Выбрано: ${sel.size}`;

  const toggle = (opt: string) => {
    const n = new Set(sel);
    if (n.has(opt)) n.delete(opt);
    else n.add(opt);
    onSelectedChange(n);
  };

  return (
    <div className="relative flex shrink-0 flex-col gap-0.5 max-sm:gap-0">
      <span className="text-text-secondary hidden whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide sm:block">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            id={triggerId}
            className={cn(
              'text-text-primary relative h-9 justify-between gap-1 border text-[10px] font-semibold',
              'w-9 p-0 max-sm:justify-center sm:w-[7.75rem] sm:max-w-[10rem] sm:px-1.5 sm:text-left'
            )}
            title={title}
            aria-label={title}
          >
            <span className="hidden truncate sm:inline">{summary}</span>
            <span className="text-[10px] font-bold uppercase sm:hidden">
              {compactLabel ?? label.slice(0, 3)}
            </span>
            <ChevronDown
              className="text-text-secondary hidden h-3.5 w-3.5 shrink-0 sm:block"
              aria-hidden
            />
            {sel.size > 0 ? (
              <span
                className="bg-accent-primary absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full sm:hidden"
                aria-hidden
              />
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,18rem)] p-0" align="start">
          <div className="max-h-64 space-y-1 overflow-y-auto p-2">
            {options.length === 0 ? (
              <p className="text-text-secondary px-2 py-2 text-[11px]">Нет значений.</p>
            ) : (
              options.map((o, idx) => {
                const checkId = `${triggerId}-opt-${idx}`;
                return (
                  <label
                    key={o}
                    className="hover:bg-bg-surface2 flex cursor-pointer items-start gap-2 rounded-md py-1.5 pl-1 pr-2"
                  >
                    <Checkbox
                      id={checkId}
                      checked={sel.has(o)}
                      onCheckedChange={() => toggle(o)}
                      className="mt-0.5 shrink-0"
                    />
                    <span className="text-text-primary min-w-0 text-[11px] leading-snug">{o}</span>
                  </label>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
