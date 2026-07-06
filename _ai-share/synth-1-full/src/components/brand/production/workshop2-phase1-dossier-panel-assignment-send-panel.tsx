'use client';

import * as LucideIcons from 'lucide-react';
import type { LegacyRef, ReactNode, RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { WORKSHOP_HINT_TOOLTIP_CLASS } from '@/components/brand/production/workshop2-phase1-dossier-panel-ui-constants';
import { w2RuMetkaCountLabel } from '@/components/brand/production/workshop2-phase1-dossier-panel-ru-count-label';
import { getWorkshop2ClientDossierStorageTarget } from '@/lib/production/workshop2-dossier-storage-mode';
import { W2_CONSTRUCTION_SUBPAGE_ANCHORS } from '@/lib/production/workshop2-construction-dossier-anchors';

export function Workshop2DossierAssignmentSendPanel({
  assignmentChain,
  assignmentSendChecklistDetailsRef,
  tzWriteDisabled,
  onOpenFinalTzWizard,
  lastProductionExportBadge,
  factorySendHubPreview,
  factorySendSketchPinReadiness,
  tzPreflight,
  productionPreflight,
  tzTraceRows,
  jumpToSketchLineRefs,
  onJumpToCadZip,
  sketchPinLinkAudit,
  onSketchPinFocus,
  collaborationMergeNote,
  onCollaborationMergeNoteChange,
  includeCompositionLabelInFactoryAssignment,
  children,
}: {
  assignmentChain: {
    checklistReady: boolean;
    lastExport: boolean;
    docCurrent: boolean;
    handoffClosed: boolean;
  };
  assignmentSendChecklistDetailsRef: RefObject<HTMLDetailsElement | null>;
  tzWriteDisabled: boolean;
  onOpenFinalTzWizard: () => void;
  lastProductionExportBadge: null | {
    statusLabel: string;
    statusClass: string;
    score: number;
    blockers: number;
    warnings: number;
    at: string;
  };
  factorySendHubPreview: {
    sectionSignoffsFull: number;
    blockers: readonly unknown[];
    sketchReady: boolean;
    techPackCount: number;
    techPackWithBytes: number;
    lastHandoff: null | { brandDispatchedAt?: string | null; factoryReceivedAt?: string | null };
    openCriticalCommentsCount: number;
    /** Первый незакрытый пункт чеклиста отправки (если есть) — для баннера «Задание». */
    firstUnmet?: { id: string; label: string } | null;
  };
  factorySendSketchPinReadiness: {
    showChecklistRow: boolean;
    open: number;
    total: number;
  };
  tzPreflight: {
    ok: boolean;
    issues: readonly { id: string; title: string; detail: string; fixHint: string }[];
  };
  productionPreflight: {
    canSendToFactory: boolean;
    score: number;
    blockers: readonly unknown[];
    warnings: readonly unknown[];
    issues: readonly { id: string; severity: string; label: string; detail: string }[];
  };
  tzTraceRows: readonly { id: string; status: string; label: string; detail: string }[];
  jumpToSketchLineRefs: () => void;
  onJumpToCadZip: () => void;
  sketchPinLinkAudit: readonly { id: string; messages: readonly string[] }[];
  onSketchPinFocus: (annotationId: string) => void;
  collaborationMergeNote: string;
  onCollaborationMergeNoteChange: (next: string) => void;
  includeCompositionLabelInFactoryAssignment: boolean;
  children?: ReactNode;
}) {
  const storagePilotNote = getWorkshop2ClientDossierStorageTarget() === 'server_target';

  return (
    <div
      id={W2_CONSTRUCTION_SUBPAGE_ANCHORS.send}
      className="border-border-default scroll-mt-24 space-y-4 rounded-xl border bg-white p-4 shadow-sm"
    >
      <div className="border-border-default flex flex-wrap items-start gap-3 border-b pb-4">
        <div className="bg-accent-primary/10 text-accent-primary border-accent-primary/15 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm">
          <LucideIcons.Send className="h-4 w-4 shrink-0" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-text-primary text-base font-semibold">Отправка</h2>
          <p className="text-text-secondary text-[11px] leading-snug">
            Финальная цепочка: ворота, pre-flight, handoff и «Итоговое ТЗ».
          </p>
          {includeCompositionLabelInFactoryAssignment ? (
            <div className="mt-2 rounded-lg border border-emerald-400/80 bg-emerald-50/80 px-3 py-2 text-[11px] leading-snug text-emerald-950">
              <strong>Составник включён в задание цеха.</strong> Полный макет и текст — во вкладке
              «Материалы», якорь «Бирка».
            </div>
          ) : null}
        </div>
      </div>

      <div className="text-text-secondary rounded-lg border border-slate-200/90 bg-slate-50/90 px-3 py-2.5 text-[11px] leading-relaxed">
        <p className="text-text-primary mb-1.5 text-xs font-semibold">Для менеджера: по шагам</p>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            Раскройте ниже «Чеклист и диагностика передачи» и доведите пункты до зелёных отметок
            (скетч, ZIP, подписи 4 секций, передача, комментарии).
          </li>
          <li>
            Нажмите кнопку «Мастер „Итоговое ТЗ“» выше — сформируйте файл; запись попадёт в журнал
            артикула.
          </li>
          <li>В блоке передачи ниже отметьте «бренд передал» и «цех принял».</li>
          <li>
            Непонятно, что мешает: кнопка «Пульс артикула» в шапке карточки или «Открыть проблемный
            блок» здесь — они ведут к той же диагностике.
          </li>
        </ol>
      </div>

      <div className="space-y-3">
        <div className="border-border-default bg-bg-surface2/40 rounded-lg border">
          <div className="text-text-primary border-border-default flex items-center gap-2 border-b px-3 py-2.5 text-left">
            <span className="text-[11px] font-semibold">Детали отправки и экспорт</span>
            <span className="text-text-secondary ml-auto text-[10px] tabular-nums">
              {assignmentChain.checklistReady ? 'чеклист ок' : 'чеклист открыт'} ·{' '}
              {assignmentChain.handoffClosed ? 'handoff закрыт' : 'handoff открыт'}
            </span>
          </div>
          <div className="border-border-default/80 space-y-2 p-3">
            <div className="border-border-default space-y-2 rounded-xl border bg-white p-3 shadow-sm">
              <div className="flex w-full flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-text-primary text-[10px] font-semibold">
                      Цепочка: чеклист → документ → передача
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="text-text-muted hover:text-text-primary border-border-subtle bg-bg-surface2/80 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow-sm"
                          aria-label="Как устроено: чеклист, документ, передача"
                        >
                          <LucideIcons.Info className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="text-text-secondary w-[min(100vw-2rem,22rem)] text-[11px] leading-snug"
                        align="start"
                        side="bottom"
                      >
                        <p className="text-text-primary mb-1.5 font-medium">Как устроено</p>
                        <p>
                          Сначала закройте чеклист и pre-flight. Затем сформируйте «Итоговое ТЗ»
                          (единый HTML/PDF в фиксированном порядке разделов). После этого
                          зафиксируйте handoff: «бренд передал» и «цех принял»; экспорт
                          автоматически попадёт в журнал.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <ol className="text-text-secondary flex flex-wrap gap-x-3 gap-y-1 text-[10px] leading-snug">
                    <li
                      className={
                        assignmentChain.checklistReady ? 'text-emerald-800' : 'text-amber-900'
                      }
                    >
                      {assignmentChain.checklistReady ? '✓' : '○'} Чеклист + pre-flight
                    </li>
                    <li aria-hidden className="text-text-muted">
                      →
                    </li>
                    <li
                      className={
                        assignmentChain.lastExport
                          ? assignmentChain.docCurrent
                            ? 'text-emerald-800'
                            : 'text-amber-900'
                          : 'text-text-secondary'
                      }
                    >
                      {assignmentChain.lastExport ? (assignmentChain.docCurrent ? '✓' : '!') : '○'}{' '}
                      Итоговое ТЗ
                      {assignmentChain.lastExport && !assignmentChain.docCurrent
                        ? ' (устарел — экспорт после правок)'
                        : ''}
                    </li>
                    <li aria-hidden className="text-text-muted">
                      →
                    </li>
                    <li
                      className={
                        assignmentChain.handoffClosed ? 'text-emerald-800' : 'text-text-secondary'
                      }
                    >
                      {assignmentChain.handoffClosed ? '✓' : '○'} Передача (бренд + цех)
                    </li>
                  </ol>
                  <button
                    type="button"
                    className="text-accent-primary text-left text-[10px] font-medium underline-offset-2 hover:underline"
                    onClick={() => {
                      const el = assignmentSendChecklistDetailsRef.current;
                      if (!el) return;
                      el.open = true;
                      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }}
                  >
                    Подробнее: чеклист, pre-flight и диагностика
                  </button>
                </div>
                <div className="ml-auto flex shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="h-8 shrink-0 gap-1.5 text-[10px] font-semibold"
                        onClick={onOpenFinalTzWizard}
                      >
                        <LucideIcons.FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        Мастер «Итоговое ТЗ»
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className={WORKSHOP_HINT_TOOLTIP_CLASS}>
                      <p className="max-w-xs text-xs">
                        Три шага: структура документа → предпросмотр HTML → скачивание или печать в
                        PDF. Итоговый файл — семантическая вёрстка (заголовки h1–h4, списки,
                        таблицы, pre для BOM), единые отступы и шрифт system-ui; печать через
                        браузер «Сохранить как PDF».
                        {tzWriteDisabled
                          ? ' Запись экспорта в досье и журнал — только с правом «Редактировать производство».'
                          : ''}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {lastProductionExportBadge ? (
          <div
            className={`rounded-md border px-3 py-2 text-[11px] leading-snug ${lastProductionExportBadge.statusClass}`}
          >
            <div className="font-semibold">
              Последний production export: {lastProductionExportBadge.statusLabel}
            </div>
            <div>
              score {lastProductionExportBadge.score}/100 · блокеры{' '}
              {lastProductionExportBadge.blockers} · предупреждения{' '}
              {lastProductionExportBadge.warnings}
            </div>
            <div className="opacity-80">Обновлено: {lastProductionExportBadge.at}</div>
          </div>
        ) : null}

        <details
          ref={assignmentSendChecklistDetailsRef as LegacyRef<HTMLDetailsElement>}
          className="group/diag border-border-default bg-bg-surface2/60 rounded-lg border"
        >
          <summary className="text-text-primary flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-left [&::-webkit-details-marker]:hidden">
            <LucideIcons.ChevronDown
              className="text-text-muted h-4 w-4 shrink-0 transition-transform group-open/diag:rotate-180"
              aria-hidden
            />
            <span className="text-[10px] font-semibold">Чеклист и диагностика передачи</span>
            <span className="text-text-secondary ml-auto text-[10px] tabular-nums">
              {factorySendHubPreview.sectionSignoffsFull}/4 ·{' '}
              {factorySendHubPreview.blockers.length > 0
                ? `${factorySendHubPreview.blockers.length} блок.`
                : 'ворота ок'}
            </span>
          </summary>
          <div className="border-border-default/80 space-y-3 border-t p-3">
            <div className="space-y-1">
              <p className="text-text-primary text-[10px] font-semibold">Чеклист передачи в цех</p>
              <ul className="text-text-secondary space-y-1 text-[11px] leading-snug">
                <li className="flex gap-2">
                  <span className="shrink-0" aria-hidden>
                    {factorySendHubPreview.sketchReady ? (
                      <LucideIcons.CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <LucideIcons.CircleDashed className="h-3.5 w-3.5 text-amber-600" />
                    )}
                  </span>
                  <span>
                    <span className="text-text-primary font-medium">Визуал / скетч</span> —{' '}
                    {factorySendHubPreview.sketchReady
                      ? 'канон или лист с изображением'
                      : 'нужен канон или лист с изображением'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0" aria-hidden>
                    {factorySendHubPreview.techPackCount > 0 &&
                    factorySendHubPreview.techPackWithBytes ===
                      factorySendHubPreview.techPackCount ? (
                      <LucideIcons.CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                    ) : factorySendHubPreview.techPackWithBytes > 0 ? (
                      <LucideIcons.CircleAlert className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <LucideIcons.CircleDashed className="text-text-secondary/70 h-3.5 w-3.5" />
                    )}
                  </span>
                  <span>
                    <span className="text-text-primary font-medium">Файлы в пакете (ZIP)</span> —{' '}
                    {factorySendHubPreview.techPackCount === 0
                      ? 'нет файлов CAD'
                      : `${factorySendHubPreview.techPackWithBytes} из ${factorySendHubPreview.techPackCount} в ZIP`}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0" aria-hidden>
                    {factorySendHubPreview.sectionSignoffsFull >= 4 ? (
                      <LucideIcons.CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                    ) : factorySendHubPreview.sectionSignoffsFull > 0 ? (
                      <LucideIcons.CircleAlert className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <LucideIcons.CircleDashed className="text-text-secondary/70 h-3.5 w-3.5" />
                    )}
                  </span>
                  <span>
                    <span className="text-text-primary font-medium">Секции ТЗ</span> —{' '}
                    {factorySendHubPreview.sectionSignoffsFull} из 4 (бренд+тех: паспорт, визуал,
                    материалы, конструкция)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0" aria-hidden>
                    {factorySendHubPreview.lastHandoff?.brandDispatchedAt &&
                    factorySendHubPreview.lastHandoff?.factoryReceivedAt ? (
                      <LucideIcons.CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <LucideIcons.CircleDashed className="text-text-secondary/70 h-3.5 w-3.5" />
                    )}
                  </span>
                  <span>
                    <span className="text-text-primary font-medium">Отметки передачи</span> —{' '}
                    {factorySendHubPreview.lastHandoff
                      ? [
                          factorySendHubPreview.lastHandoff.brandDispatchedAt
                            ? 'бренд: передано'
                            : 'бренд: не отмечено',
                          factorySendHubPreview.lastHandoff.factoryReceivedAt
                            ? 'цех: получено'
                            : 'цех: не отмечено',
                        ].join('; ')
                      : 'нет записи — блок ниже'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0" aria-hidden>
                    {factorySendHubPreview.openCriticalCommentsCount === 0 ? (
                      <LucideIcons.CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <LucideIcons.CircleAlert className="h-3.5 w-3.5 text-amber-600" />
                    )}
                  </span>
                  <span>
                    <span className="text-text-primary font-medium">Критичные комментарии</span> —{' '}
                    {factorySendHubPreview.openCriticalCommentsCount === 0
                      ? 'открытых нет'
                      : `${factorySendHubPreview.openCriticalCommentsCount} открытых`}
                  </span>
                </li>
                {factorySendSketchPinReadiness.showChecklistRow ? (
                  <li className="flex gap-2">
                    <span className="shrink-0" aria-hidden>
                      {factorySendSketchPinReadiness.open === 0 ? (
                        <LucideIcons.CircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <LucideIcons.CircleAlert className="h-3.5 w-3.5 text-amber-600" />
                      )}
                    </span>
                    <span>
                      <span className="text-text-primary font-medium">Привязки меток</span> —{' '}
                      {factorySendSketchPinReadiness.open === 0
                        ? `${w2RuMetkaCountLabel(factorySendSketchPinReadiness.total)} — привязки заполнены`
                        : `${factorySendSketchPinReadiness.open} из ${factorySendSketchPinReadiness.total} с пробелами (мастер, листы, подуровни)`}
                    </span>
                  </li>
                ) : null}
              </ul>
              <details className="group/pf border-border-default/80 mt-2 rounded-md border border-dashed bg-white/60">
                <summary className="text-text-primary flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-left text-[10px] font-semibold [&::-webkit-details-marker]:hidden">
                  <LucideIcons.ChevronDown
                    className="text-text-muted h-3.5 w-3.5 shrink-0 transition-transform group-open/pf:rotate-180"
                    aria-hidden
                  />
                  Pre-flight
                  <span className="text-text-secondary ml-auto font-normal normal-case">
                    {tzPreflight.ok ? 'PASS' : `${tzPreflight.issues.length} замеч.`}
                  </span>
                </summary>
                <div className="border-border-default/60 space-y-2 border-t px-2.5 pb-2.5 pt-1.5">
                  {tzPreflight.ok ? (
                    <p className="text-[10px] text-emerald-700">Критичных блокеров нет.</p>
                  ) : (
                    <ul className="space-y-1 text-[10px] leading-snug">
                      {tzPreflight.issues.slice(0, 8).map((issue) => (
                        <li key={issue.id} className="text-amber-900">
                          • {issue.title}: {issue.detail} · {issue.fixHint}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
              <details className="group/pf2 border-border-default/80 mt-2 rounded-md border border-dashed bg-white/60">
                <summary className="text-text-primary flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-left text-[10px] font-semibold [&::-webkit-details-marker]:hidden">
                  <LucideIcons.ChevronDown
                    className="text-text-muted h-3.5 w-3.5 shrink-0 transition-transform group-open/pf2:rotate-180"
                    aria-hidden
                  />
                  Производственный pre-flight
                  <span className="text-text-secondary ml-auto font-normal normal-case">
                    {productionPreflight.canSendToFactory
                      ? `PASS · ${productionPreflight.score}/100`
                      : `${productionPreflight.blockers.length} блок. · ${productionPreflight.score}/100`}
                  </span>
                </summary>
                <div className="border-border-default/60 space-y-2 border-t px-2.5 pb-2.5 pt-1.5">
                  <div className="text-[10px] leading-snug">
                    {productionPreflight.canSendToFactory ? (
                      <p className="text-emerald-700">Готово к передаче в производство.</p>
                    ) : (
                      <p className="text-amber-900">
                        Блокеры: {productionPreflight.blockers.length}, предупреждения:{' '}
                        {productionPreflight.warnings.length}.
                      </p>
                    )}
                  </div>
                  {productionPreflight.issues.length > 0 ? (
                    <ul className="space-y-1 text-[10px] leading-snug">
                      {productionPreflight.issues.slice(0, 8).map((issue) => (
                        <li
                          key={issue.id}
                          className={
                            issue.severity === 'blocker' ? 'text-rose-800' : 'text-amber-900'
                          }
                        >
                          • {issue.label}: {issue.detail}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
              <details className="group/tr border-border-default/80 mt-2 rounded-md border border-dashed bg-white/60">
                <summary className="text-text-primary flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-left text-[10px] font-semibold [&::-webkit-details-marker]:hidden">
                  <LucideIcons.ChevronDown
                    className="text-text-muted h-3.5 w-3.5 shrink-0 transition-transform group-open/tr:rotate-180"
                    aria-hidden
                  />
                  Расширенная диагностика (trace)
                  <span className="text-text-secondary ml-auto font-normal normal-case">
                    {tzTraceRows.filter((r) => r.status !== 'ok').length > 0
                      ? 'есть предупреждения'
                      : 'ок'}
                  </span>
                </summary>
                <div className="border-border-default/60 border-t px-2.5 pb-2.5 pt-1.5">
                  <ul className="space-y-1 text-[10px] leading-snug">
                    {tzTraceRows.map((row) => (
                      <li
                        key={row.id}
                        className={row.status === 'ok' ? 'text-emerald-700' : 'text-amber-900'}
                      >
                        • {row.label}: {row.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
              <details className="group/roles border-border-default/80 mt-2 rounded-md border border-dashed bg-white/60">
                <summary className="text-text-primary flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-left text-[10px] font-semibold [&::-webkit-details-marker]:hidden">
                  <LucideIcons.ChevronDown
                    className="text-text-muted h-3.5 w-3.5 shrink-0 transition-transform group-open/roles:rotate-180"
                    aria-hidden
                  />
                  Роли и порядок (подробнее)
                </summary>
                <div className="border-border-default/60 text-text-secondary space-y-2 border-t px-2.5 pb-2.5 pt-1.5 text-[9px] leading-snug">
                  <p className="text-text-primary font-semibold">До отметок ✓ в цепочке выше</p>
                  <ol className="list-decimal space-y-1 pl-4">
                    <li>Чеклист и pre-flight на этой вкладке без блокеров.</li>
                    <li>
                      Четыре секции ТЗ — заполнение и пары подписей бренд + технолог (блок
                      «Подтверждение секции» на каждой вкладке).
                    </li>
                    <li>
                      Мастер «Итоговое ТЗ» и при необходимости повторный экспорт после правок.
                    </li>
                    <li>Передача: вложения CAD, отметки «бренд передал» и «цех получил».</li>
                  </ol>
                  <p>
                    <strong className="text-text-primary">Дизайнер:</strong> «Визуал» — референсы,
                    скетч, канон; подпись секции «Визуал».
                  </p>
                  <p>
                    <strong className="text-text-primary">Технолог:</strong> «Материалы» и
                    «Конструкция» — BOM, мерки, CAD/ZIP; подписи этих секций.
                  </p>
                  <p>
                    <strong className="text-text-primary">Менеджер:</strong> «Паспорт» и «Задание» —
                    карточка, pre-flight, координация handoff.
                  </p>
                  <p className="border-border-default/80 text-text-secondary border-t pt-2">
                    Скачать HTML / печать в PDF доступны с доступом к экрану; запись экспорта в
                    досье и журнал — только при праве{' '}
                    <code className="text-[9px]">production:edit</code>.
                  </p>
                </div>
              </details>
              <div className="text-text-secondary border-border-default/80 mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-dashed pt-2 text-[10px]">
                <button
                  type="button"
                  className="text-accent-primary font-medium underline-offset-2 hover:underline"
                  onClick={jumpToSketchLineRefs}
                >
                  К скетчу
                </button>
                <button
                  type="button"
                  className="text-accent-primary font-medium underline-offset-2 hover:underline"
                  onClick={onJumpToCadZip}
                >
                  К CAD / ZIP
                </button>
              </div>
            </div>
          </div>
        </details>

        {sketchPinLinkAudit.length > 0 ? (
          <div
            className="border-border-default space-y-1.5 rounded-lg border border-amber-200/90 bg-amber-50/80 p-2.5"
            role="region"
            aria-label="Метки с неполными привязками"
          >
            <p className="text-[10px] font-semibold text-amber-950">
              Метки к доработке ({sketchPinLinkAudit.length})
            </p>
            <ul className="space-y-1.5">
              {sketchPinLinkAudit.slice(0, 6).map((row) => (
                <li key={row.id} className="text-[11px] leading-snug text-amber-950">
                  <button
                    type="button"
                    className="text-accent-primary text-left font-medium underline-offset-2 hover:underline"
                    onClick={() => onSketchPinFocus(row.id)}
                  >
                    Открыть на доске
                  </button>
                  <span className="text-text-secondary font-normal">
                    {' '}
                    · {row.messages[0]}
                    {row.messages.length > 1 ? ` (+${row.messages.length - 1})` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {storagePilotNote ? (
          <p
            className="rounded-md border border-slate-200 bg-slate-50/95 px-2.5 py-2 text-[11px] leading-snug text-slate-800"
            role="status"
          >
            Пилот: досье в браузере между сессиями; общая синхронизация — в планах. До неё — одно
            рабочее место или выгрузка пакета.
          </p>
        ) : null}
        <div className="space-y-1">
          <label className="text-text-secondary text-[10px]" htmlFor="w2-collab-merge">
            Конфликт вкладок / ручной merge (заметка команды)
          </label>
          <textarea
            id="w2-collab-merge"
            className="min-h-[48px] w-full rounded-md border border-input bg-background px-2 py-1.5 text-[11px]"
            placeholder="Кто что перезаписал, какая ревизия принята…"
            value={collaborationMergeNote}
            disabled={tzWriteDisabled}
            onChange={(e) => onCollaborationMergeNoteChange(e.target.value)}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
