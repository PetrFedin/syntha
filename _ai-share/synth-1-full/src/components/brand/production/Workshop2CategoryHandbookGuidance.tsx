'use client';

import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import type { HandbookCategoryLeaf } from '@/lib/production/category-catalog';
import {
  formatComplianceSummary,
  formatMarketplaceHintLine,
  formatStockUnitRu,
  formatTnvedHints,
  getLeafHandbookGuidance,
} from '@/lib/production/category-catalog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Props = {
  leaf: HandbookCategoryLeaf | undefined;
  className?: string;
  /** inline — старый развёрнутый блок; popover — компактная строка + иконка (по умолчанию). */
  variant?: 'inline' | 'popover';
};

function HandbookGuidanceBody({
  leaf,
  g,
}: {
  leaf: HandbookCategoryLeaf;
  g: NonNullable<ReturnType<typeof getLeafHandbookGuidance>>;
}) {
  const { profile, requiredAxisLabels, commonAxisLabels, attachmentChecklist, canonicalLeafId } = g;

  return (
    <div className="text-text-primary space-y-2 text-[11px] leading-snug">
      <div>
        <p className="text-text-primary font-semibold">Справочник категории</p>
        <p className="text-text-secondary mt-0.5">
          {leaf.l1Name} › {leaf.l2Name} › {leaf.l3Name}
        </p>
        <p
          className="text-text-muted mt-0.5 font-mono text-[9px]"
          title="Канонический leafId при сохранении"
        >
          {canonicalLeafId}
        </p>
      </div>
      <dl className="grid gap-1.5">
        <div>
          <dt className="text-text-secondary">Ед. учёта</dt>
          <dd>
            {formatStockUnitRu(profile.stockUnitDefault)}
            {profile.stockUnitNotes ? ` · ${profile.stockUnitNotes}` : ''}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">Маршрут этапов</dt>
          <dd>
            {profile.productionRouteTemplateLabel ?? profile.productionRouteTemplateId ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">Комплаенс</dt>
          <dd>{formatComplianceSummary(profile.complianceTags)}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">ТН ВЭД</dt>
          <dd>{formatTnvedHints(profile)}</dd>
        </div>
        {profile.marketplaceRefs.length > 0 ? (
          <div>
            <dt className="text-text-secondary">Маркетплейсы</dt>
            <dd>
              <ul className="list-disc pl-3.5">
                {profile.marketplaceRefs.map((r, i) => (
                  <li key={`${r.channelId}-${i}`}>{formatMarketplaceHintLine(r)}</li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-text-secondary">Обязательные оси ТЗ</dt>
          <dd>{requiredAxisLabels.length ? requiredAxisLabels.join(' · ') : '—'}</dd>
        </div>
        {commonAxisLabels.length > 0 ? (
          <div>
            <dt className="text-text-secondary">Общие оси</dt>
            <dd className="text-text-secondary">{commonAxisLabels.join(' · ')}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-text-secondary">Чеклист вложений</dt>
          <dd>
            <ul className="mt-0.5 space-y-0.5">
              {attachmentChecklist.map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">Этикетка</dt>
          <dd className="text-text-secondary">
            {profile.labelLocalesDefault.join(', ') || '—'} ·{' '}
            {profile.mandatoryLabelBlocks.join(', ')}
          </dd>
        </div>
      </dl>
      <p className="border-border-default/80 text-text-muted border-t pt-2 text-[9px]">
        Не юридическая консультация. {profile.attributeBinding}
        {profile.attributeBindingNote ? ` — ${profile.attributeBindingNote}` : ''}
      </p>
    </div>
  );
}

/**
 * Подсказки по листу справочника — по умолчанию компактно (popover по иконке).
 */
export function Workshop2CategoryHandbookGuidance({ leaf, className, variant = 'popover' }: Props) {
  const g = useMemo(() => (leaf ? getLeafHandbookGuidance(leaf) : null), [leaf]);

  if (!g || !leaf) return null;

  if (variant === 'popover') {
    return (
      <div
        className={cn(
          'border-border-subtle bg-bg-surface2/60 flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5',
          className
        )}
        data-testid="brand-w2-create-article-category-handbook"
      >
        <p className="text-text-secondary min-w-0 flex-1 truncate text-[11px]">
          {leaf.l3Name}
          <span className="text-text-muted hidden sm:inline">
            {' '}
            · {leaf.l1Name} › {leaf.l2Name}
          </span>
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-text-muted hover:text-text-primary h-7 w-7 shrink-0 p-0"
              aria-label="Справочник категории — подробности"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="max-h-[min(70vh,28rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto p-3"
          >
            <HandbookGuidanceBody leaf={leaf} g={g} />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-border-default bg-bg-surface2/90 text-text-primary rounded-md border px-3 py-2.5 text-[10px] leading-snug',
        className
      )}
    >
      <HandbookGuidanceBody leaf={leaf} g={g} />
    </div>
  );
}
