'use client';

import Link from 'next/link';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PLATFORM_CORE_PILLARS } from '@/lib/platform-core-hub-matrix';
import {
  ROLE_LABELS,
  formatReadinessScore,
  readinessScoreTone,
  type ReadinessCell,
  type ReadinessSubItem,
} from '@/lib/platform-core-readiness-audit';
import { buildReadinessScoreBreakdown } from '@/lib/platform-core-readiness-sections';
import { stackHubMatrixLabelLines } from '@/lib/platform-core-matrix-label-lines';
import { cn } from '@/lib/utils';
import type { ReadinessImprovementItem } from '@/lib/platform-core-readiness-improvements';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { MATRIX_COL_LABEL, READINESS_SCORE_BOX } from '@/lib/platform-core-readiness-matrix-layout';

export function MatrixColumnLabel({
  text,
  align = 'center',
}: {
  text: string;
  align?: 'center' | 'start';
}) {
  const lines = stackHubMatrixLabelLines(text);
  if (lines.length === 1) {
    return (
      <span className={cn(MATRIX_COL_LABEL, align === 'start' ? 'text-left' : 'text-center')}>
        {lines[0]}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'flex max-w-full flex-col gap-px',
        align === 'start' ? 'items-start text-left' : 'items-center text-center'
      )}
    >
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className={MATRIX_COL_LABEL}>
          {line}
        </span>
      ))}
    </span>
  );
}

/** Сильная ячейка по ручному аудиту; 9+ не используем — нет телеметрии «идеала». */
function isReadinessStrong(score: number | null): boolean {
  return score != null && score >= 8.5;
}

function truncateReadinessSummary(text: string, maxLen = 36): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const space = cut.lastIndexOf(' ');
  return `${(space > 40 ? cut.slice(0, space) : cut).trim()}…`;
}

export function ScoreTooltipBody({ cell, live }: { cell: ReadinessCell; live: boolean }) {
  const score = live ? cell.liveScore : cell.staticScore;
  const pillarTitle =
    PLATFORM_CORE_PILLARS.find((p) => p.id === cell.pillarId)?.title ?? cell.pillarId;

  if (!cell.active) {
    return (
      <div className="max-w-sm space-y-1.5 text-left text-[11px] leading-snug">
        <p className="font-semibold">
          {ROLE_LABELS[cell.roleId]} · {pillarTitle}
        </p>
        <p className="text-text-muted italic">
          {cell.emptyReason ?? 'Роль не участвует в этом столпе'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-2 text-left text-[11px] leading-snug">
      <p className="font-semibold">
        {ROLE_LABELS[cell.roleId]} · {pillarTitle}
        {' — '}
        {formatReadinessScore(score)}/10
      </p>
      <p className="text-text-secondary">{truncateReadinessSummary(cell.summary)}</p>
      {cell.subItems.length > 0 ? (
        <p className="text-text-muted text-[10px]">Нажмите на оценку — развернуть разделы ниже.</p>
      ) : null}
      {cell.workspaceHref ? (
        <p className="text-text-muted border-border-subtle border-t pt-2 text-[10px]">
          <Link
            href={cell.workspaceHref}
            className="text-accent-primary font-semibold hover:underline"
          >
            Открыть рабочий экран →
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export function ReadinessScoreTrigger({
  cell,
  live,
  isOpen,
  onToggleSections,
}: {
  cell: ReadinessCell;
  live: boolean;
  isOpen?: boolean;
  onToggleSections?: () => void;
}) {
  const score = live ? cell.liveScore : cell.staticScore;
  const href = cell.active ? cell.workspaceHref : cell.cabinetHref;
  const tone = readinessScoreTone(score, live);
  const done = isReadinessStrong(score);
  const hasSections = cell.active && cell.subItems.length > 0;
  const boxClassName = cn(
    READINESS_SCORE_BOX,
    'hover:border-accent-primary/50 hover:bg-accent-primary/5',
    tone,
    done && 'border-emerald-200/80 bg-emerald-50/40',
    hasSections && isOpen && 'border-accent-primary/60 bg-accent-primary/5'
  );
  const label = `${ROLE_LABELS[cell.roleId]} ${cell.pillarId}: ${formatReadinessScore(score)}`;
  const scoreContent = (
    <>
      {done ? (
        <CheckCircle2
          className={cn(
            'h-3 w-3 shrink-0 text-emerald-600',
            live && 'motion-safe:duration-300 motion-safe:animate-in motion-safe:zoom-in-50'
          )}
          aria-hidden
        />
      ) : null}
      {formatReadinessScore(score)}
    </>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {hasSections ? (
          <button
            type="button"
            data-testid={`readiness-score-${cell.roleId}-${cell.pillarId}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSections?.();
            }}
            className={boxClassName}
            aria-expanded={isOpen}
            aria-label={label}
          >
            {scoreContent}
          </button>
        ) : (
          <Link
            href={href}
            data-testid={`readiness-score-${cell.roleId}-${cell.pillarId}`}
            className={boxClassName}
            aria-label={label}
          >
            {scoreContent}
          </Link>
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-sm p-3">
        <ScoreTooltipBody cell={cell} live={live} />
      </TooltipContent>
    </Tooltip>
  );
}

function ReadinessAuditList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'good' | 'bad' | 'fix';
}) {
  if (items.length === 0) return null;
  const toneClass =
    tone === 'good' ? 'text-emerald-800' : tone === 'bad' ? 'text-amber-900' : 'text-sky-900';
  return (
    <div>
      <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide">{title}</p>
      <ul className={cn('mt-1 list-disc space-y-0.5 pl-4 text-[11px] leading-snug', toneClass)}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReadinessSectionAuditDetail({
  sub,
  live,
  verbose = false,
}: {
  sub: ReadinessSubItem;
  live: boolean;
  verbose?: boolean;
}) {
  const breakdown = buildReadinessScoreBreakdown(
    sub.staticScore,
    sub.liveScore,
    sub.good,
    sub.bad,
    sub.fix,
    live ? 'live' : 'static'
  );

  return (
    <div className="space-y-2 text-left text-[11px] leading-snug">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-semibold">{sub.label}</span>
        <span
          className={cn(
            'font-mono font-bold tabular-nums',
            readinessScoreTone(breakdown.score, live)
          )}
        >
          {formatReadinessScore(breakdown.score)}/10
        </span>
      </div>
      <p className="text-text-muted font-mono text-[10px]">
        static {formatReadinessScore(breakdown.staticScore)}
        {breakdown.liveDelta > 0 ? (
          <>
            {' '}
            · live +{formatReadinessScore(breakdown.liveDelta)} (PG/e2e: {breakdown.pgSignals})
          </>
        ) : (
          <> · без PG-бонуса</>
        )}
        {' · '}
        good {breakdown.goodCount}
        {breakdown.badCount > 0 ? ` · bad ${breakdown.badCount}` : ''}
        {breakdown.fixCount > 0 ? ` · fix ${breakdown.fixCount}` : ''}
      </p>
      <p className="text-text-secondary">{truncateReadinessSummary(sub.summary)}</p>
      {verbose ? (
        <>
          <ReadinessAuditList title="Реализовано" items={sub.good} tone="good" />
          <ReadinessAuditList title="Ограничения" items={sub.bad} tone="bad" />
          <ReadinessAuditList title="Следующий шаг" items={sub.fix} tone="fix" />
        </>
      ) : null}
    </div>
  );
}

function SectionSubItemTooltipBody({ sub, live }: { sub: ReadinessSubItem; live: boolean }) {
  return (
    <div className="max-w-sm">
      <ReadinessSectionAuditDetail sub={sub} live={live} verbose />
    </div>
  );
}

function ReadinessSectionLink({
  sub,
  live,
  testId,
  summaryLines = 1,
  skipTooltip = false,
}: {
  sub: ReadinessSubItem;
  live: boolean;
  testId: string;
  summaryLines?: 1 | 'full';
  /** true — прямой переход по клику (inline-разворот матрицы). */
  skipTooltip?: boolean;
}) {
  const score = live ? sub.liveScore : sub.staticScore;
  const body = (
    <Link
      href={sub.href}
      data-testid={testId}
      className="hover:text-accent-primary group flex items-start justify-between gap-2"
    >
      <span className="text-text-secondary group-hover:text-accent-primary min-w-0 flex-1">
        <span className="text-text-muted font-mono">{sub.order}.</span> {sub.label}
        {summaryLines === 'full' ? (
          <span className="text-text-muted mt-1 block text-[11px] font-normal leading-snug">
            {sub.summary}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          'shrink-0 font-mono text-[10px] font-semibold',
          readinessScoreTone(score, live)
        )}
      >
        {formatReadinessScore(score)}
      </span>
    </Link>
  );

  if (summaryLines === 'full' || skipTooltip) return body;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent side="left" className="max-w-sm p-3">
        <SectionSubItemTooltipBody sub={sub} live={live} />
      </TooltipContent>
    </Tooltip>
  );
}

export function ReadinessCellSectionsPanel({
  cell,
  live,
  testIdPrefix,
  variant,
}: {
  cell: ReadinessCell;
  live: boolean;
  testIdPrefix: string;
  variant: 'inline' | 'sheet';
}) {
  const score = live ? cell.liveScore : cell.staticScore;

  if (variant === 'sheet') {
    return (
      <div data-testid="readiness-sections-sheet" className="space-y-5 pb-2">
        <div className="border-border-subtle bg-bg-surface2/40 rounded-xl border p-4">
          <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
            Общая оценка
          </p>
          <p
            className={cn(
              'mt-1 font-mono text-3xl font-bold tabular-nums',
              readinessScoreTone(score, live)
            )}
          >
            {formatReadinessScore(score)}
            <span className="text-text-muted text-base font-semibold">/10</span>
          </p>
          <p className="text-text-secondary mt-2 text-xs leading-relaxed">{cell.summary}</p>
          {cell.subItems.length > 0 ? (
            <p className="text-text-muted mt-2 text-[10px] leading-snug">
              Оценка ячейки = min(среднее {cell.subItems.length} разделов, cap аудита). Ниже —
              каждый раздел: static (UI/peers без PG), live (+PG/e2e), списки good/bad/fix.
            </p>
          ) : null}
        </div>

        {cell.subItems.length > 0 ? (
          <div>
            <p className="text-text-muted mb-2 text-[10px] font-black uppercase tracking-widest">
              Разделы ({cell.subItems.length})
            </p>
            <ol className="space-y-3">
              {cell.subItems.map((sub) => (
                <li
                  key={sub.id}
                  className="border-border-subtle rounded-xl border bg-white p-3 shadow-sm"
                >
                  <ReadinessSectionAuditDetail sub={sub} live={live} verbose />
                  <Link
                    href={sub.href}
                    data-testid={`${testIdPrefix}-${sub.order - 1}`}
                    className="text-accent-primary mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                  >
                    Открыть раздел
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {cell.workspaceHref ? (
          <Link
            href={cell.workspaceHref}
            className="text-accent-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            Открыть рабочий экран
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
    );
  }

  if (cell.subItems.length > 0) {
    return (
      <>
        <ol className="border-border-subtle mt-2 space-y-1 border-t pt-2 text-left">
          {cell.subItems.map((sub) => (
            <li key={sub.id}>
              <ReadinessSectionLink
                sub={sub}
                live={live}
                testId={`${testIdPrefix}-${sub.order - 1}`}
                skipTooltip
              />
            </li>
          ))}
        </ol>
        {cell.workspaceHref ? (
          <p className="text-text-muted mt-2 text-[10px]">
            <Link
              href={cell.workspaceHref}
              data-testid={`readiness-workspace-${cell.roleId}-${cell.pillarId}`}
              className="text-accent-primary inline-flex items-center gap-0.5 hover:underline"
            >
              Открыть столп
              <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        ) : null}
      </>
    );
  }

  if (cell.workspaceHref) {
    return (
      <p className="text-text-muted mt-2 text-[10px]">
        <Link
          href={cell.workspaceHref}
          data-testid={`readiness-workspace-${cell.roleId}-${cell.pillarId}`}
          className="text-accent-primary inline-flex items-center gap-0.5 hover:underline"
        >
          Открыть столп
          <ExternalLink className="h-3 w-3" />
        </Link>
      </p>
    );
  }

  return null;
}

function ReadinessImprovementLink({ item }: { item: ReadinessImprovementItem }) {
  return (
    <Link
      href={item.href}
      data-testid={`readiness-improvement-${item.id}`}
      className="hover:border-accent-primary/40 group block rounded-xl border bg-white p-3 shadow-sm transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-text-primary text-xs font-semibold leading-snug">
            <span className="text-text-muted font-mono text-[10px]">
              {item.priority.toFixed(0)}
            </span>{' '}
            {item.kind === 'fix' ? '→' : '·'} {item.title}
          </p>
          <p className="text-text-muted mt-1 text-[10px] leading-snug">
            {ROLE_LABELS[item.roleId]} ·{' '}
            {PLATFORM_CORE_PILLARS.find((p) => p.id === item.pillarId)?.title}
            {item.sectionLabel ? ` · ${item.sectionLabel}` : ''}
          </p>
          <p className="text-text-secondary mt-2 text-[11px] leading-relaxed">{item.linkageRu}</p>
        </div>
        <ExternalLink className="text-text-muted group-hover:text-accent-primary mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />
      </div>
    </Link>
  );
}

export function ReadinessImprovementsPanel({
  items,
  filterPillarId,
  variant,
}: {
  items: ReadinessImprovementItem[];
  filterPillarId?: CoreHubPillarId;
  variant: 'inline' | 'sheet';
}) {
  const pillarTitle = filterPillarId
    ? PLATFORM_CORE_PILLARS.find((p) => p.id === filterPillarId)?.title
    : null;

  if (items.length === 0) {
    return (
      <p className="text-text-muted py-2 text-xs italic">
        {filterPillarId
          ? `По столпу «${pillarTitle}» открытых доработок в аудите нет.`
          : 'Открытых доработок в аудите нет.'}
      </p>
    );
  }

  return (
    <div
      data-testid="readiness-improvements-panel"
      className={cn('space-y-2', variant === 'sheet' ? 'pb-2' : 'pt-2')}
    >
      <p className="text-text-muted text-[10px] leading-snug">
        {filterPillarId
          ? `Доработки столпа «${pillarTitle}» и сквозные связи · ${items.length} · по убыванию важности.`
          : `Все доработки матрицы · ${items.length} · упорядочены от наиболее важных.`}
      </p>
      <ol className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <ReadinessImprovementLink item={item} />
          </li>
        ))}
      </ol>
    </div>
  );
}
