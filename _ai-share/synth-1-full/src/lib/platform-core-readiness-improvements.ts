import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_PILLARS } from '@/lib/platform-core-hub-matrix';
import type { ReadinessCell } from '@/lib/platform-core-readiness-audit';
import { ROLE_LABELS } from '@/lib/platform-core-readiness-audit';

export type ReadinessImprovementKind = 'gap' | 'fix';

export type ReadinessImprovementItem = {
  id: string;
  priority: number;
  kind: ReadinessImprovementKind;
  title: string;
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  sectionLabel?: string;
  sectionOrder?: number;
  href: string;
  /** Как доработка связана внутри роли / между ролями / между столпами. */
  linkageRu: string;
};

const PILLAR_TITLE: Record<CoreHubPillarId, string> = Object.fromEntries(
  PLATFORM_CORE_PILLARS.map((p) => [p.id, p.title])
) as Record<CoreHubPillarId, string>;

const PILLAR_ORDER: CoreHubPillarId[] = [
  'development',
  'sample_collection',
  'collection_order',
  'order_production',
  'comms',
];

const PILLAR_CHAIN_HINT: Record<CoreHubPillarId, string> = {
  development:
    'Вертикаль: усиливает переход «ТЗ → образец» и release gate перед витриной.',
  sample_collection:
    'Связка «ТЗ → образец» с витриной и shop matrix (столп «Коллекция → заказ»).',
  collection_order:
    'Связка shop↔brand и handoff в «Заказ → производство» + inventory/comms.',
  order_production:
    'Связка brand↔shop: исполнение заказа, handoff и buyer tracking после опта.',
  comms:
    'Горизонталь brand↔shop вокруг PO; без этого рвётся цепочка статусов и чатов.',
};

const ROLE_ALIASES: Partial<Record<CoreChainRoleId, string[]>> = {
  brand: ['brand', 'бренд'],
  shop: ['shop', 'магазин', 'ритейл'],
  manufacturer: ['manufacturer', 'factory', 'цех', 'фабрик', 'mfr'],
  supplier: ['supplier', 'поставщ', 'mrp', 'procurement'],
};

const PILLAR_KEYWORDS: Partial<Record<CoreHubPillarId, string[]>> = {
  development: ['w2', 'dossier', 'тз', 'tz', 'образец', 'sample', 'release', 'attribute'],
  sample_collection: ['linesheet', 'showroom', 'витрин', 'publish', 'syndication'],
  collection_order: ['matrix', 'replenish', 'margin', 'working order', 'collaborative', 'pricelist'],
  order_production: ['handoff', 'cut ticket', 'qc', 'po', 'bom', 'wip', 'production'],
  comms: ['comms', 'chat', 'tracking', 'messages', 'calendar', 'entity thread'],
};

function normalizeKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function detectRoles(text: string): CoreChainRoleId[] {
  const lower = text.toLowerCase();
  const found = new Set<CoreChainRoleId>();
  for (const [roleId, aliases] of Object.entries(ROLE_ALIASES) as [CoreChainRoleId, string[]][]) {
    if (aliases.some((a) => lower.includes(a))) found.add(roleId);
  }
  return [...found];
}

function detectPillars(text: string, anchor: CoreHubPillarId): CoreHubPillarId[] {
  const lower = text.toLowerCase();
  const found = new Set<CoreHubPillarId>([anchor]);
  for (const [pillarId, keywords] of Object.entries(PILLAR_KEYWORDS) as [
    CoreHubPillarId,
    string[],
  ][]) {
    if (keywords.some((k) => lower.includes(k))) found.add(pillarId);
  }
  const ordered = PILLAR_ORDER.filter((p) => found.has(p));
  return ordered.length > 0 ? ordered : [anchor];
}

function buildLinkageRu(input: {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  sectionLabel?: string;
  text: string;
}): string {
  const role = ROLE_LABELS[input.roleId];
  const pillar = PILLAR_TITLE[input.pillarId];
  const lower = input.text.toLowerCase();
  const parts: string[] = [];

  if (input.sectionLabel) {
    parts.push(
      `Внутри «${role} · ${pillar}»: раздел «${input.sectionLabel}» — доработка закрывает пробел в этом экране.`
    );
  } else {
    parts.push(`Внутри «${role} · ${pillar}»: усиливает общую готовность ячейки матрицы.`);
  }

  const roles = detectRoles(input.text);
  const otherRoles = roles.filter((r) => r !== input.roleId);
  if (otherRoles.length > 0) {
    parts.push(
      `Между ролями: ${[input.roleId, ...otherRoles].map((r) => ROLE_LABELS[r]).join(' ↔ ')} — нужен общий контекст заказа/коллекции.`
    );
  } else if (lower.includes('shop') || lower.includes('brand') || lower.includes('магазин') || lower.includes('бренд')) {
    parts.push(`Между ролями: бренд ↔ магазин — общий контекст коллекции и оптового заказа.`);
  }

  const pillars = detectPillars(input.text, input.pillarId);
  if (pillars.length > 1) {
    parts.push(
      `Между столпами: ${pillars.map((p) => PILLAR_TITLE[p]).join(' → ')} — сквозной сценарий Platform Core.`
    );
  } else {
    parts.push(PILLAR_CHAIN_HINT[input.pillarId]);
  }

  return parts.join(' ');
}

function scorePriority(input: {
  kind: ReadinessImprovementKind;
  text: string;
  cellScore: number | null;
  sectionScore?: number;
}): number {
  const text = input.text.toLowerCase();
  let score = input.kind === 'fix' ? 52 : 44;
  const sectionScore = input.sectionScore ?? input.cellScore ?? 7;
  score += Math.max(0, 8.5 - sectionScore) * 12;

  if (/\bp0\b|критич|block|блок|без order|dead-end|дубль nav/i.test(text)) score += 18;
  if (/push|sse|notification|api|pg|handoff|tracking|atp|inventory|comms|qc/i.test(text)) {
    score += 14;
  }
  if (/cross|peer|chain|мост|связ/i.test(text)) score += 8;
  if (input.kind === 'gap' && /нет |no |отсутств|read-only/i.test(text)) score += 6;

  return Math.round(score * 10) / 10;
}

function normalizeAuditStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function pushItem(
  bucket: Map<string, ReadinessImprovementItem>,
  item: Omit<ReadinessImprovementItem, 'id' | 'priority'> & { priority?: number }
) {
  const key = normalizeKey(`${item.roleId}__${item.pillarId}__${item.sectionLabel ?? 'cell'}__${item.title}`);
  const priority =
    item.priority ??
    scorePriority({
      kind: item.kind,
      text: item.title,
      cellScore: null,
    });
  const existing = bucket.get(key);
  if (existing && existing.priority >= priority) return;
  bucket.set(key, { ...item, id: key, priority });
}

/** Все доработки из матрицы готовности — dedupe, сортировка по priority (desc). */
export function buildPlatformCoreReadinessImprovements(
  cells: ReadonlyArray<ReadinessCell>,
  options?: { pillarId?: CoreHubPillarId; minPriority?: number }
): ReadinessImprovementItem[] {
  const bucket = new Map<string, ReadinessImprovementItem>();

  for (const cell of cells) {
    if (!cell.active && cell.subItems.length === 0) continue;
    const cellScore = cell.liveScore ?? cell.staticScore;

    for (const gap of normalizeAuditStrings(cell.bad)) {
      const title = gap.trim();
      if (!title) continue;
      pushItem(bucket, {
        kind: 'gap',
        title,
        roleId: cell.roleId,
        pillarId: cell.pillarId,
        href: cell.workspaceHref,
        linkageRu: buildLinkageRu({
          roleId: cell.roleId,
          pillarId: cell.pillarId,
          text: title,
        }),
        priority: scorePriority({ kind: 'gap', text: title, cellScore }),
      });
    }

    for (const fix of normalizeAuditStrings(cell.fix)) {
      const title = fix.trim();
      if (!title) continue;
      pushItem(bucket, {
        kind: 'fix',
        title,
        roleId: cell.roleId,
        pillarId: cell.pillarId,
        href: cell.workspaceHref,
        linkageRu: buildLinkageRu({
          roleId: cell.roleId,
          pillarId: cell.pillarId,
          text: title,
        }),
        priority: scorePriority({ kind: 'fix', text: title, cellScore }),
      });
    }

    for (const sub of cell.subItems) {
      const sectionScore = sub.liveScore ?? sub.staticScore;
      for (const gap of normalizeAuditStrings(sub.bad)) {
        const title = gap.trim();
        if (!title) continue;
        pushItem(bucket, {
          kind: 'gap',
          title,
          roleId: cell.roleId,
          pillarId: cell.pillarId,
          sectionLabel: sub.label,
          sectionOrder: sub.order,
          href: sub.href,
          linkageRu: buildLinkageRu({
            roleId: cell.roleId,
            pillarId: cell.pillarId,
            sectionLabel: sub.label,
            text: title,
          }),
          priority: scorePriority({ kind: 'gap', text: title, cellScore, sectionScore }),
        });
      }
      for (const fix of normalizeAuditStrings(sub.fix)) {
        const title = fix.trim();
        if (!title) continue;
        pushItem(bucket, {
          kind: 'fix',
          title,
          roleId: cell.roleId,
          pillarId: cell.pillarId,
          sectionLabel: sub.label,
          sectionOrder: sub.order,
          href: sub.href,
          linkageRu: buildLinkageRu({
            roleId: cell.roleId,
            pillarId: cell.pillarId,
            sectionLabel: sub.label,
            text: title,
          }),
          priority: scorePriority({ kind: 'fix', text: title, cellScore, sectionScore }),
        });
      }
    }
  }

  let items = [...bucket.values()];
  if (options?.pillarId) {
    const pillarId = options.pillarId;
    items = items.filter(
      (item) =>
        item.pillarId === pillarId ||
        detectPillars(item.title, item.pillarId).includes(pillarId)
    );
  }
  if (options?.minPriority != null) {
    items = items.filter((item) => item.priority >= options.minPriority!);
  }

  return items.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.pillarId !== b.pillarId) {
      return PILLAR_ORDER.indexOf(a.pillarId) - PILLAR_ORDER.indexOf(b.pillarId);
    }
    if (a.roleId !== b.roleId) return a.roleId.localeCompare(b.roleId);
    return (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0);
  });
}

export function countPlatformCoreReadinessImprovements(
  cells: ReadonlyArray<ReadinessCell>,
  pillarId?: CoreHubPillarId
): number {
  return buildPlatformCoreReadinessImprovements(cells, { pillarId }).length;
}
