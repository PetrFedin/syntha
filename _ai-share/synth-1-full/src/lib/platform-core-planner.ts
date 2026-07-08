/**
 * Platform Core — планировщик развития и справочник техдолга (hub «План»).
 * Агенты дополняют: `platform-core-planner-agent.ts` → PLATFORM_CORE_PLANNER_AGENT_ITEMS.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_PILLARS } from '@/lib/platform-core-hub-matrix';
import {
  getPlatformCoreReadinessMatrix,
  ROLE_LABELS,
  type ReadinessCell,
} from '@/lib/platform-core-readiness-audit';
import {
  PLATFORM_CORE_PLANNER_AGENT_ITEMS,
  type PlatformCorePlannerAgentItem,
} from '@/lib/platform-core-planner-agent';
import {
  isPlatformCorePlannerAutoDoneTitle,
  isPlatformCorePlannerClosedWaveTitle,
} from '@/lib/platform-core-planner-auto-done';
import { getPlatformCorePlannerSessionSummary } from '@/lib/platform-core-planner-session';

export type PlannerPriority = 'P0' | 'P1' | 'P2';
export type PlannerItemKind = 'improve' | 'add' | 'stage' | 'existing';
export type TechDebtCategory =
  | 'error'
  | 'dead-end'
  | 'stub'
  | 'demo-dupe'
  | 'missing-link'
  | 'noise'
  | 'monster-file';

export type PlatformCorePlannerItem = {
  id: string;
  kind: PlannerItemKind;
  priority: PlannerPriority;
  title: string;
  roleId?: CoreChainRoleId;
  pillarId?: CoreHubPillarId;
  pillarTitle?: string;
  roleLabel?: string;
  source: 'audit-fix' | 'audit-gap' | 'audit-section' | 'agent' | 'pillar-stage' | 'tech-debt';
  href?: string;
  status: 'open' | 'in_progress' | 'done';
  claimedBy?: string;
  claimedAt?: string;
  note?: string;
};

export type PlatformCoreTechDebtItem = {
  id: string;
  category: TechDebtCategory;
  priority: PlannerPriority;
  title: string;
  action: 'fix' | 'change' | 'remove' | 'merge';
  hint?: string;
  source: string;
};

type AgentPlannerRow = PlatformCorePlannerAgentItem;

const agentItems = PLATFORM_CORE_PLANNER_AGENT_ITEMS;

const PILLAR_TITLE: Record<CoreHubPillarId, string> = Object.fromEntries(
  PLATFORM_CORE_PILLARS.map((p) => [p.id, p.title])
) as Record<CoreHubPillarId, string>;

const TECH_DEBT_REGISTRY: PlatformCoreTechDebtItem[] = [
  {
    id: 'td-ts-brand',
    category: 'error',
    priority: 'P2',
    title:
      'TypeScript — зона brand / production / merch (закрыто: typecheck:w2 + platform-core gate)',
    action: 'fix',
    hint: 'typecheck:platform-core green; остаток full typecheck ~83 err вне hot paths',
    source: 'CORE_PRODUCT_DEEP_PLAN §4',
  },
  {
    id: 'td-ts-shop-b2b',
    category: 'error',
    priority: 'P2',
    title: 'TypeScript — shop/b2b и inventory (закрыто: typecheck:order-subset в gate)',
    action: 'fix',
    hint: 'typecheck:order-subset + platform-core gate; full tsc — layouts/runway',
    source: 'CORE_PRODUCT_DEEP_PLAN §4',
  },
  {
    id: 'td-api-process-store',
    category: 'stub',
    priority: 'P1',
    title: 'API процессов — PG store (закрыто: postgres persistence + unit test)',
    action: 'change',
    hint: 'process-workflow-store.test.ts persistence:postgres; multi-instance Redis bump — P2',
    source: 'CORE_PRODUCT_DEEP_PLAN §4',
  },
  {
    id: 'td-comms-chat-memory',
    category: 'stub',
    priority: 'P2',
    title: 'Contextual chat — memoryStore + JSON (закрыто: PG primary, core-52)',
    action: 'change',
    hint: 'workshop2-contextual-messages-repository.ts — PG + core-52 POST→GET',
    source: 'planner-scan spine',
  },
  {
    id: 'td-comms-sender-hardcoded',
    category: 'stub',
    priority: 'P2',
    title: 'Contextual sender fallback «Участник» (workshop2-contextual-message-sender, закрыто)',
    action: 'change',
    hint: 'resolveContextualMessageSenderFromHeaders — x-w2-actor-label / email local-part',
    source: 'planner-scan spine',
  },
  {
    id: 'td-comms-no-realtime',
    category: 'missing-link',
    priority: 'P2',
    title: 'Contextual chat SSE на тред + poll fallback (закрыто: contextual-chat-sse-live-badge)',
    action: 'change',
    hint: 'ContextualChatThread + /api/messages/contextual/stream + workshop2-realtime-hub',
    source: 'planner-scan spine',
  },
  {
    id: 'td-brand-tasks-localstorage',
    category: 'stub',
    priority: 'P1',
    title: 'Brand tasks Kanban — localStorage brand_tasks_kanban_v1 (закрыто: PG API)',
    action: 'change',
    hint: 'brand-tasks-client.ts API-only в core; brand_tasks_kanban migration 031',
    source: 'planner-scan spine',
  },
  {
    id: 'td-b2b-orders-json-snapshot',
    category: 'stub',
    priority: 'P2',
    title: 'B2B orders read-model — snapshot/mock только без PG-primary (закрыто: core-33/52)',
    action: 'change',
    hint: 'b2b-orders-list-read-model.server.ts — isPlatformCoreSpinePgPrimary()',
    source: 'planner-scan spine',
  },
  {
    id: 'td-b2b-invoice-pdf-stub',
    category: 'stub',
    priority: 'P1',
    title: 'B2B invoice — jsPDF schet-offerta.pdf (закрыто: core-52 invoice PDF API)',
    action: 'change',
    hint: 'workshop2-b2b-invoice-stub.ts; contrast schet-offerta.pdf route',
    source: 'planner-scan spine',
  },
  {
    id: 'td-b2b-orders-no-pg',
    category: 'missing-link',
    priority: 'P2',
    title: 'Native B2B orders PG SoT (закрыто: workshop2_b2b_orders + core-33/52)',
    action: 'change',
    hint: 'ADR-002 PG-primary; listB2BOrdersForOperationalUiServerAsync',
    source: 'planner-scan spine',
  },
  {
    id: 'td-spine-no-single-pg-e2e',
    category: 'missing-link',
    priority: 'P2',
    title: 'E2E в одной БД (закрыто: core-15/18/19/20 + core-52 contextual PG)',
    action: 'fix',
    hint: 'core golden + clean PG checkout; contextual POST→GET core-52',
    source: 'planner-scan spine',
  },
  {
    id: 'td-dossier-file-fallback',
    category: 'stub',
    priority: 'P1',
    title: 'phase1-dossier — PG-only banner + fail-closed file fallback (закрыто)',
    action: 'change',
    hint: 'workshop2-core-dossier-file-persist-banner на W2 hub; file только без DATABASE_URL',
    source: 'planner-scan spine',
  },
  {
    id: 'td-no-pg-json-fallback',
    category: 'stub',
    priority: 'P1',
    title: 'Auxiliary stores без PG — JSON mirrors (закрыто: pg-primary-file-policy)',
    action: 'change',
    hint: 'shouldWorkshop2PersistAuxiliaryJsonToFile fail-closed при PG-only',
    source: 'planner-scan spine',
  },
  {
    id: 'td-brand-create-article-wizard-gap',
    category: 'missing-link',
    priority: 'P1',
    title: 'Create-article wizard — hub path (закрыто: core-37)',
    action: 'change',
    hint: 'Workshop2CreateArticleDialog + core-37 e2e; hub entry SS27',
    source: 'planner-scan spine',
  },
  {
    id: 'td-mocks-inventory',
    category: 'stub',
    priority: 'P1',
    title: 'Экраны на placeholder-data / статичных JSON (закрыто: demo badge)',
    action: 'change',
    hint: 'platform-core-placeholder-surfaces.ts + PlatformCoreDemoDataBadge',
    source: 'CORE_PRODUCT_DEEP_PLAN §4',
  },
  {
    id: 'td-demo-dupe-nav',
    category: 'demo-dupe',
    priority: 'P1',
    title: 'Дубли demo-id / handoff / cross-role на core-path (закрыто: audit 35/35)',
    action: 'merge',
    hint: 'npm run audit:platform-core-ui — anti-noise контракт',
    source: 'platform-core-ui-surfaces',
  },
  {
    id: 'td-missing-cross-role-e2e',
    category: 'missing-link',
    priority: 'P1',
    title: 'Незакрытые строки CROSS_ROLE_FLOWS §5.6 (закрыто: core-54)',
    action: 'fix',
    hint: 'dual-session + shop UI mirror core-54/57/33',
    source: 'CROSS_ROLE_FLOWS.md',
  },
  {
    id: 'td-dead-end-empty27',
    category: 'dead-end',
    priority: 'P2',
    title: 'EMPTY27 / пустая цепочка без онбординга (закрыто: BrandDevEmptyChainOnboarding)',
    action: 'fix',
    hint: 'brand-dev-empty-onboarding + core-44/60',
    source: 'platform hub',
  },
  {
    id: 'td-noise-session-banner',
    category: 'noise',
    priority: 'P2',
    title: 'Dev-баннеры и recovery chrome на core-path (закрыто: golden path suppress)',
    action: 'remove',
    hint: 'DevOnlyChrome + DevSessionBanner off на isPlatformCoreGoldenPath',
    source: 'DevOnlyChrome / session banners',
  },
  {
    id: 'td-monster-dossier',
    category: 'monster-file',
    priority: 'P1',
    title: 'workshop2-phase1-dossier-panel* — гигантские модули (закрыто: ~99%)',
    action: 'merge',
    hint: '19 sectionBodies + nav zones incl. visuals catalog — волна 58',
    source: 'brand/production',
  },
  {
    id: 'td-monster-nav-matrix',
    category: 'monster-file',
    priority: 'P2',
    title: 'role-hub-matrix / b2b-workspace-matrix — сверхдлинные конфиги (закрыто)',
    action: 'change',
    hint: 'tabs + flow + roles extracted — волна 56',
    source: 'src/lib/data',
  },
];

function inferPriority(text: string, defaultP: PlannerPriority): PlannerPriority {
  const t = text.toLowerCase();
  if (/\bp0\b|крит|block|блок/.test(t)) return 'P0';
  if (/\bp2\b|nice|later|volna d/i.test(t)) return 'P2';
  if (/e2e|pg-primary|bootstrap|сквозн/.test(t)) return 'P0';
  return defaultP;
}

function slugId(parts: string[]) {
  return parts
    .join('-')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .slice(0, 80);
}

function itemsFromCell(cell: ReadinessCell): PlatformCorePlannerItem[] {
  const out: PlatformCorePlannerItem[] = [];
  const roleLabel = ROLE_LABELS[cell.roleId];
  const pillarTitle = PILLAR_TITLE[cell.pillarId];

  for (const [i, title] of (cell.fix ?? []).entries()) {
    if (isPlatformCorePlannerAutoDoneTitle(title)) continue;
    out.push({
      id: slugId(['fix', cell.roleId, cell.pillarId, String(i), title.slice(0, 24)]),
      kind: 'improve',
      priority: inferPriority(title, 'P1'),
      title,
      roleId: cell.roleId,
      pillarId: cell.pillarId,
      roleLabel,
      pillarTitle,
      source: 'audit-fix',
      href: cell.workspaceHref,
      status: 'open',
    });
  }

  for (const [i, title] of (cell.bad ?? []).entries()) {
    if (isPlatformCorePlannerAutoDoneTitle(title)) continue;
    out.push({
      id: slugId(['gap', cell.roleId, cell.pillarId, String(i), title.slice(0, 24)]),
      kind: 'add',
      priority: inferPriority(title, 'P2'),
      title,
      roleId: cell.roleId,
      pillarId: cell.pillarId,
      roleLabel,
      pillarTitle,
      source: 'audit-gap',
      href: cell.workspaceHref,
      status: 'open',
    });
  }

  for (const sub of cell.subItems ?? []) {
    for (const [i, title] of (sub.fix ?? []).entries()) {
      const full = `${sub.label}: ${title}`;
      if (isPlatformCorePlannerAutoDoneTitle(full) || isPlatformCorePlannerAutoDoneTitle(title))
        continue;
      out.push({
        id: slugId(['sec', sub.id, String(i)]),
        kind: 'improve',
        priority: inferPriority(title, 'P1'),
        title: full,
        roleId: cell.roleId,
        pillarId: cell.pillarId,
        roleLabel,
        pillarTitle,
        source: 'audit-section',
        href: sub.href,
        status: 'open',
      });
    }
  }

  return out;
}

function pillarStageItems(): PlatformCorePlannerItem[] {
  return PLATFORM_CORE_PILLARS.map((p) => ({
    id: `stage-${p.id}`,
    kind: 'stage' as const,
    priority: 'P1' as const,
    title: p.title,
    pillarId: p.id,
    pillarTitle: p.title,
    source: 'pillar-stage' as const,
    status: 'open' as const,
  }));
}

function agentPlannerItems(): PlatformCorePlannerItem[] {
  return (agentItems ?? []).map((row) => ({
    id: row.id,
    kind: row.kind ?? 'improve',
    priority: row.priority ?? 'P1',
    title: row.title,
    roleId: row.roleId,
    pillarId: row.pillarId,
    roleLabel: row.roleId ? ROLE_LABELS[row.roleId] : undefined,
    pillarTitle: row.pillarId ? PILLAR_TITLE[row.pillarId] : undefined,
    source: 'agent' as const,
    href: row.href,
    status: row.status ?? 'open',
  }));
}

const PRIORITY_ORDER: Record<PlannerPriority, number> = { P0: 0, P1: 1, P2: 2 };

export type PlannerRuntimeOverlay = {
  statusById?: Record<string, 'open' | 'in_progress' | 'done'>;
  claims?: Record<string, { at: string; by: string }>;
  notes?: Record<string, string>;
  lastAgentAt?: string | null;
  discoveredDevelopment?: Array<{
    id: string;
    kind: PlannerItemKind;
    priority: PlannerPriority;
    title: string;
    evidence: string;
    href?: string;
    roleId?: CoreChainRoleId;
    pillarId?: CoreHubPillarId;
    addedAt: string;
  }>;
  discoveredTechDebt?: Array<PlatformCoreTechDebtItem & { evidence: string; addedAt: string }>;
  agentDispatch?: {
    taskId: string;
    taskTitle: string;
    priority: string;
    by: string;
    startedAt: string;
    prompt: string;
  } | null;
};

export type PlatformCorePlannerTechDebtRow = PlatformCoreTechDebtItem & {
  status: 'open' | 'in_progress' | 'done';
  claimedBy?: string;
  claimedAt?: string;
  note?: string;
};

export type PlatformCorePlannerSnapshot = {
  development: (PlatformCorePlannerItem & {
    claimedBy?: string;
    claimedAt?: string;
    note?: string;
  })[];
  techDebt: PlatformCorePlannerTechDebtRow[];
  queue: PlatformCorePlannerItem[];
  counts: {
    development: number;
    techDebt: number;
    p0: number;
    open: number;
    inProgress: number;
    done: number;
  };
  agentConnected: boolean;
  agentDispatch: PlannerRuntimeOverlay['agentDispatch'];
  sessionSummary?: import('@/lib/platform-core-planner-session').PlatformCorePlannerSessionSummary;
  updatedAt: string;
};

/** Пустой snapshot для UI до первого успешного GET planner API (dev:core :3001). */
export const EMPTY_PLATFORM_CORE_PLANNER_SNAPSHOT: PlatformCorePlannerSnapshot = {
  development: [],
  techDebt: [],
  queue: [],
  counts: { development: 0, techDebt: 0, p0: 0, open: 0, inProgress: 0, done: 0 },
  agentConnected: false,
  agentDispatch: null,
  updatedAt: new Date(0).toISOString(),
};

function applyAutoDoneStatus(items: PlatformCorePlannerItem[]): PlatformCorePlannerItem[] {
  return items.map((item) =>
    isPlatformCorePlannerAutoDoneTitle(item.title) ? { ...item, status: 'done' as const } : item
  );
}

function visiblePlannerItems<T extends { title: string }>(items: T[]): T[] {
  return items.filter((item) => !isPlatformCorePlannerClosedWaveTitle(item.title));
}

function applyRuntimeOverlay<
  T extends { id: string; title: string; status: 'open' | 'in_progress' | 'done' },
>(
  items: T[],
  overlay?: PlannerRuntimeOverlay
): (T & { claimedBy?: string; claimedAt?: string; note?: string })[] {
  return items.map((item) => {
    if (isPlatformCorePlannerClosedWaveTitle(item.title)) {
      return { ...item, status: 'done' as const };
    }
    if (!overlay?.statusById) return item;
    const overlayStatus = overlay.statusById[item.id] ?? item.status;
    const status = isPlatformCorePlannerAutoDoneTitle(item.title)
      ? ('done' as const)
      : (overlayStatus as 'open' | 'in_progress' | 'done');
    return {
      ...item,
      status,
      claimedBy: status === 'done' ? undefined : overlay.claims?.[item.id]?.by,
      claimedAt: status === 'done' ? undefined : overlay.claims?.[item.id]?.at,
      note: overlay.notes?.[item.id],
    };
  });
}

/** Полный реестр id→title до фильтра closed wave (для scrub runtime). */
export function collectPlatformCorePlannerRegistry(
  collectionId = 'SS27'
): Array<{ id: string; title: string }> {
  const cells = getPlatformCoreReadinessMatrix(collectionId);
  const merged = [...pillarStageItems(), ...cells.flatMap(itemsFromCell), ...agentPlannerItems()];
  const dedup = new Map<string, string>();
  for (const item of merged) {
    if (!dedup.has(item.id)) dedup.set(item.id, item.title);
  }
  return [...dedup.entries()].map(([id, title]) => ({ id, title }));
}

function techDebtRowToQueueItem(row: PlatformCorePlannerTechDebtRow): PlatformCorePlannerItem {
  return {
    id: row.id,
    kind: 'improve',
    priority: row.priority,
    title: row.title,
    source: 'tech-debt',
    status: row.status,
    claimedBy: row.claimedBy,
    claimedAt: row.claimedAt,
    note: row.note ?? row.hint,
  };
}

function isDiscoveredTechDebtNoise(item: {
  title: string;
  hint?: string;
  source?: string;
}): boolean {
  if (item.source !== 'analyze:code-scan') return false;
  const blob = `${item.title} ${item.hint ?? ''}`;
  if (/CommsPillarThreadStrip/i.test(blob)) return true;
  if (/comms-hub-inbox-rows\.test/i.test(blob)) return true;
  if (/placeholder:text-text-muted/i.test(blob)) return true;
  if (/placeholder-треды/i.test(blob)) return true;
  return false;
}

export function buildPlatformCorePlanner(
  collectionId = 'SS27',
  runtime?: PlannerRuntimeOverlay
): PlatformCorePlannerSnapshot {
  const cells = getPlatformCoreReadinessMatrix(collectionId);
  const fromAudit = cells.flatMap(itemsFromCell);
  const merged = [
    ...pillarStageItems(),
    ...fromAudit,
    ...agentPlannerItems(),
    ...(runtime?.discoveredDevelopment ?? [])
      .filter((d) => !isPlatformCorePlannerClosedWaveTitle(d.title))
      .map((d) => ({
        id: d.id,
        kind: d.kind,
        priority: d.priority,
        title: d.title,
        roleId: d.roleId,
        pillarId: d.pillarId,
        roleLabel: d.roleId ? ROLE_LABELS[d.roleId] : undefined,
        pillarTitle: d.pillarId ? PILLAR_TITLE[d.pillarId] : undefined,
        source: 'agent' as const,
        href: d.href,
        status: 'open' as const,
        note: d.evidence,
      })),
  ];

  const dedup = new Map<string, PlatformCorePlannerItem>();
  for (const item of merged) {
    if (!dedup.has(item.id)) dedup.set(item.id, item);
  }

  const developmentRaw = applyAutoDoneStatus(
    [...dedup.values()].sort(
      (a, b) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        (a.pillarTitle ?? '').localeCompare(b.pillarTitle ?? '') ||
        (a.roleLabel ?? '').localeCompare(b.roleLabel ?? '')
    )
  );

  const development = visiblePlannerItems(
    applyAutoDoneStatus(applyRuntimeOverlay(developmentRaw, runtime))
  );
  const techDebtRaw = [
    ...TECH_DEBT_REGISTRY,
    ...(runtime?.discoveredTechDebt ?? [])
      .filter((d) => !isDiscoveredTechDebtNoise(d))
      .map((d) => ({
        id: d.id,
        category: d.category as TechDebtCategory,
        priority: d.priority,
        title: d.title,
        action: d.action,
        hint: d.hint ?? d.evidence,
        source: d.source,
      })),
  ].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const techDebt: PlatformCorePlannerTechDebtRow[] = visiblePlannerItems(
    applyRuntimeOverlay(
      techDebtRaw.map((td) => ({ ...td, status: 'open' as const, id: td.id })),
      runtime
    ).map((row) =>
      isPlatformCorePlannerAutoDoneTitle(row.title) ? { ...row, status: 'done' as const } : row
    )
  );

  const openCount = development.filter((i) => i.status === 'open').length;
  const inProgressCount = development.filter((i) => i.status === 'in_progress').length;
  const doneCount = development.filter((i) => i.status === 'done').length;

  return {
    development,
    techDebt,
    queue: [...development, ...techDebt.map(techDebtRowToQueueItem)].sort(
      (a, b) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        (a.status === 'open' ? 0 : a.status === 'in_progress' ? 1 : 2) -
          (b.status === 'open' ? 0 : b.status === 'in_progress' ? 1 : 2)
    ),
    counts: {
      development: development.length,
      techDebt: techDebt.length,
      p0:
        development.filter((i) => i.priority === 'P0' && i.status !== 'done').length +
        techDebt.filter((i) => i.priority === 'P0' && i.status !== 'done').length,
      open: openCount + techDebt.filter((i) => i.status === 'open').length,
      inProgress: inProgressCount + techDebt.filter((i) => i.status === 'in_progress').length,
      done: doneCount + techDebt.filter((i) => i.status === 'done').length,
    },
    agentConnected: Boolean(
      runtime?.lastAgentAt && Date.now() - new Date(runtime.lastAgentAt).getTime() < 5 * 60 * 1000
    ),
    agentDispatch: runtime?.agentDispatch ?? null,
    sessionSummary: getPlatformCorePlannerSessionSummary(),
    updatedAt: new Date().toISOString(),
  };
}

export const TECH_DEBT_CATEGORY_LABELS: Record<TechDebtCategory, string> = {
  error: 'Ошибки',
  'dead-end': 'Тупики',
  stub: 'Заглушки',
  'demo-dupe': 'Демо / дубли',
  'missing-link': 'Нет связей',
  noise: 'Шум',
  'monster-file': 'Монстры',
};

export const PLANNER_KIND_LABELS: Record<PlannerItemKind, string> = {
  improve: 'Улучшить',
  add: 'Добавить',
  stage: 'Этап столпа',
  existing: 'Есть',
};

export const PLANNER_STATUS_LABELS: Record<'open' | 'in_progress' | 'done', string> = {
  open: 'В очереди',
  in_progress: 'В работе',
  done: 'Готово',
};
