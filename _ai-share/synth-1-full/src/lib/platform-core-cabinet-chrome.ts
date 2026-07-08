import { cn } from '@/lib/utils';

/** value пункта «Мой кабинет» в augment nav. */
export const PLATFORM_CORE_CABINET_NAV_VALUE = 'platform-core-cabinet';

export function isPlatformCoreCabinetNavLink(value: string): boolean {
  return value === PLATFORM_CORE_CABINET_NAV_VALUE;
}

/** Типографика кабинета: минимум 11px для operator UI. */
export const cabinetTypography = {
  pageTitle: 'text-text-primary text-[17px] font-semibold leading-tight md:text-lg',
  sectionTitle: 'text-text-primary text-[15px] font-semibold leading-snug',
  body: 'text-text-secondary text-[13px] leading-relaxed md:text-sm',
  caption: 'text-text-muted text-[11px] leading-snug',
  label: 'text-text-muted text-[11px] font-medium',
} as const;

/** Единые токены hub-кабинета роли и list-chrome рабочих экранов. */
export const hubCabinet = {
  page: 'flex w-full flex-col gap-3 max-w-none px-4 py-3 md:gap-4 md:px-6 lg:py-4',
  /** md+: rail столпов + контент; lg+: action rail справа (3 col). */
  shell:
    'flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:gap-4 lg:grid lg:grid-cols-[11.5rem_minmax(0,1fr)_16rem] lg:items-start lg:gap-5',
  shellMain: 'min-w-0 flex-1 space-y-3',
  shellActionRail:
    'border-border-subtle lg:sticky lg:top-3 lg:w-64 lg:shrink-0 lg:space-y-2 lg:rounded-xl lg:border lg:bg-bg-surface lg:p-3',
  header: 'space-y-1 border-b border-border-subtle pb-3',
  headerCompact: 'border-border-subtle border-b pb-2',
  headerCompactLine: 'text-text-secondary line-clamp-1 text-[11px] font-medium md:text-xs',
  title: 'text-sm font-bold tracking-tight text-text-primary',
  lead: 'max-w-3xl text-xs leading-relaxed text-text-secondary',
  roleMeta: 'text-[11px] font-medium text-text-muted',
  layout: 'flex flex-col gap-3 md:flex-row md:items-start md:gap-4',
  pillarNav:
    'border-border-subtle shrink-0 rounded-lg border bg-bg-surface p-2 shadow-none max-md:hidden md:w-44 lg:w-48',
  /** Embedded workspace: только «Разделы», без списка столпов — уже в segmented nav. */
  pillarSectionNav:
    'border-border-subtle shrink-0 rounded-lg border bg-bg-surface p-2 shadow-none max-md:hidden md:w-36 lg:w-[9.25rem]',
  pillarNavMobile: 'border-border-subtle rounded-xl border bg-bg-surface p-1 shadow-sm md:hidden',
  /** Столпы в шапке кабинета при embedded (desktop + mobile). */
  pillarNavEmbedded: 'border-border-subtle rounded-xl border bg-bg-surface p-1 shadow-sm',
  pillarSegmentRow: 'flex flex-wrap gap-1',
  pillarSegmentBtn:
    'inline-flex min-h-10 flex-1 basis-[calc(50%-0.25rem)] items-center justify-center rounded-lg px-2 text-[11px] font-semibold leading-tight transition-colors sm:basis-auto sm:flex-none sm:px-3',
  pillarSegmentBtnActive: 'bg-accent-primary/10 text-text-primary ring-1 ring-accent-primary/25',
  pillarSegmentBtnIdle: 'text-text-secondary hover:bg-bg-surface2',
  pillarNavLabel: 'text-text-muted px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide',
  pillarBtnActive:
    'bg-accent-primary/10 text-text-primary flex w-full flex-col rounded-lg border border-accent-primary/20 px-2 py-1.5 text-left transition-colors',
  pillarBtnIdle:
    'text-text-secondary hover:bg-bg-surface2 flex w-full flex-col rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors',
  pillarBtnTitle: 'text-[13px] font-semibold leading-tight md:text-xs',
  pillarNavHorizontal:
    'border-border-subtle rounded-xl border bg-bg-surface p-0.5 shadow-sm md:hidden',
  /** Strip на workspace: виден < lg (на desktop — столпы в сайдбаре). */
  workspacePillarStrip: 'border-border-subtle rounded-xl border bg-bg-surface p-0.5 shadow-sm',
  pillarNavPillRow:
    'flex flex-wrap gap-0.5 sm:flex-nowrap sm:overflow-x-auto sm:overscroll-x-contain sm:snap-x sm:snap-mandatory sm:scroll-px-0.5 sm:[-webkit-overflow-scrolling:touch] sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden',
  pillarPill:
    'inline-flex h-9 shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-[11px] font-semibold sm:h-8',
  pillarPanel:
    'border-border-subtle min-w-0 flex-1 rounded-lg border bg-white p-3 shadow-sm md:p-4',
  pillarTitle: cabinetTypography.pageTitle,
  pillarLead: cabinetTypography.body,
  panelHeader: 'flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between',
  panelHeaderSticky:
    'max-md:sticky max-md:top-0 max-md:z-10 max-md:-mx-3 max-md:bg-bg-surface/95 max-md:px-3 max-md:pb-2 max-md:backdrop-blur-sm',
  /** Core cabinet panel: title · insight · CTA (mobile CTA sticky bottom). */
  pillarPanelGrid:
    'grid gap-3 md:gap-4 max-md:grid-rows-[auto_minmax(0,1fr)_auto] md:grid-cols-[1fr_auto] md:grid-rows-[auto_auto]',
  pillarPanelTitleRow:
    'min-w-0 max-md:row-start-1 max-md:sticky max-md:top-0 max-md:z-10 max-md:-mx-3 max-md:bg-bg-surface/95 max-md:px-3 max-md:pb-1 max-md:backdrop-blur-sm md:col-start-1 md:row-start-1',
  pillarPanelCtaCell:
    'max-md:sticky max-md:bottom-0 max-md:z-10 max-md:row-start-3 max-md:pb-safe max-md:bg-gradient-to-t max-md:from-bg-surface max-md:via-bg-surface/95 max-md:to-transparent max-md:pt-2 md:col-start-2 md:row-start-1 md:self-start',
  pillarPanelInsightCell: 'min-h-0 max-md:row-start-2 md:col-span-2 md:row-start-2',
  insightGrid: 'space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0',
  primaryCta:
    'bg-accent-primary text-accent-primary-foreground inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold shadow-sm transition-opacity hover:opacity-90 lg:w-full',
  listChrome: 'min-w-0 space-y-2 overflow-x-clip md:space-y-3',
  /** Одна строка: ← кабинет · роль · столп · entity */
  contextBar:
    'text-text-muted flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden text-[11px] font-medium',
  contextBarBack:
    'text-text-secondary hover:text-text-primary inline-flex shrink-0 items-center gap-0.5 font-semibold hover:underline',
  contextBarSep: 'text-text-muted/50 shrink-0 select-none',
  contextBarEntity:
    'bg-bg-surface2 text-text-muted line-clamp-1 min-w-0 max-w-[42vw] shrink rounded px-1.5 py-0.5 text-[11px] font-medium hover:text-text-primary md:max-w-xs',
  workspaceCardGrid: 'grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4',
  workspaceTableScroll: 'overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]',
  workspaceStickyHead: 'sticky top-0 z-20 bg-bg-surface/95 backdrop-blur-sm',
  workspaceStickyCol:
    'sticky left-0 z-10 border-border-subtle border-r bg-bg-surface shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]',
  orderDetailLayout:
    'min-w-0 overflow-x-clip lg:grid lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-4',
  orderDetailMain: 'min-w-0 space-y-3 overflow-x-clip',
  orderDetailRail:
    'border-border-subtle space-y-3 rounded-lg border bg-bg-surface p-3 max-lg:hidden lg:sticky lg:top-4',
  orderDetailCrossRoleMobile:
    'border-border-subtle mt-4 rounded-lg border bg-bg-surface/80 p-3 pt-3 pb-safe max-lg:block lg:hidden',
  commsCrossRoleFooter: 'border-border-subtle mt-4 border-t pt-3 pb-safe',
  /** Comms bottom nav — только mobile (< md). */
  commsBottomBar:
    'border-border-subtle sticky bottom-0 z-20 -mx-3 gap-1 border-t bg-bg-surface/95 px-2 pt-2 pb-safe backdrop-blur-sm',
  /** Primary CTA row в workspace — sticky bottom на < md. */
  workspaceStickyActions:
    'flex flex-col gap-2 max-md:sticky max-md:bottom-0 max-md:z-20 max-md:border-t max-md:border-border-subtle max-md:bg-bg-surface/95 max-md:pt-3 max-md:pb-safe sm:flex-row sm:flex-wrap',
  workspacePrimaryBtn: 'min-h-11 w-full sm:w-auto',
  /** Fade/slide при смене столпа — только < md */
  pillarPanelEnter:
    'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-1 motion-safe:duration-200 md:motion-safe:animate-none',
} as const;

/** Insight-карточки столпов в кабинете — responsive stack / grid / CTA. */
export const pillarInsight = {
  root: 'flex flex-col gap-2',
  card: 'border-border-subtle rounded-xl border bg-bg-surface shadow-none lg:transition-shadow lg:hover:shadow-sm',
  body: 'flex flex-col gap-2 p-3 md:p-4 text-xs',
  split: 'flex flex-col gap-3 md:grid md:grid-cols-2 md:items-start md:gap-3',
  header: 'flex min-w-0 items-center gap-2',
  iconWrap: 'bg-bg-surface2 text-text-primary inline-flex shrink-0 rounded-md p-1',
  icon: 'h-4 w-4 md:h-3.5 md:w-3.5',
  title: 'text-text-primary text-[15px] font-semibold leading-tight md:text-sm',
  subtitle: 'text-text-secondary line-clamp-2 text-[11px] leading-snug md:text-xs',
  stepRow: 'flex flex-wrap gap-1',
  stepChip:
    'inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium',
  stepChipDone: 'border-emerald-200/80 bg-emerald-50/80 text-emerald-900',
  stepChipIdle: 'border-border-subtle bg-bg-surface2 text-text-muted',
  stepNum: 'text-text-muted shrink-0 font-mono text-[11px] tabular-nums',
  stepList: 'hidden space-y-1.5 md:block',
  stepListMobile: 'space-y-1.5 md:hidden',
  statRow: 'flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-snug',
  stat: 'text-text-secondary',
  muted: 'text-text-muted text-xs leading-snug',
  metaBadge:
    'border-border-subtle bg-bg-surface2 h-5 shrink-0 px-1.5 text-[11px] text-text-secondary',
  ctaRow:
    'flex flex-col gap-2 pt-0.5 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-1',
  ctaLink:
    'text-text-primary w-full text-center text-xs font-medium hover:underline md:w-auto md:text-left',
  insightCta:
    'bg-accent-primary text-accent-primary-foreground inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-opacity hover:opacity-90 md:w-auto',
  goldenPath:
    'border-border-subtle bg-bg-surface2/60 flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1.5 rounded-md border px-2.5 py-2 text-xs leading-snug max-md:flex-nowrap max-md:overflow-x-auto max-md:overscroll-x-contain max-md:[-webkit-overflow-scrolling:touch] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden',
  goldenSep: 'text-text-muted/60 shrink-0 select-none',
  goldenLink:
    'text-text-primary inline-flex min-h-11 items-center text-[13px] font-medium hover:underline md:min-h-0',
  sectionList: 'grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-2',
  sectionRow:
    'border-border-subtle hover:bg-bg-surface2 flex min-h-11 items-center gap-2 rounded-lg border bg-bg-surface px-3 py-2 transition-colors',
  sectionRowLabel: 'text-text-primary min-w-0 flex-1 text-[13px] font-medium leading-snug',
  sectionRowMeta: 'text-text-muted shrink-0 text-[11px]',
  liveDot: 'inline-flex h-2 w-2 shrink-0 rounded-full',
  liveDotOn: 'bg-emerald-500',
  liveDotPoll: 'animate-pulse bg-amber-500',
} as const;

/** Выделение «Мой кабинет» в сайдбаре — якорь роли, не обычный пункт. */
export function platformCoreCabinetNavLinkClass(active: boolean, base: string): string {
  return cn(
    base,
    active
      ? 'ring-1 ring-accent-primary/30'
      : 'border border-accent-primary/15 bg-accent-primary/[0.04] hover:bg-accent-primary/[0.08]'
  );
}
