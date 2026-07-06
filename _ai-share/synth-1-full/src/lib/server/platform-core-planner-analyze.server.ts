import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { getPlatformCoreReadinessMatrix, ROLE_LABELS } from '@/lib/platform-core-readiness-audit';
import { PLATFORM_CORE_PILLARS } from '@/lib/platform-core-hub-matrix';
import { buildPlatformCorePlanner, type PlannerPriority } from '@/lib/platform-core-planner';
import type {
  PlannerDiscoveredDevItem,
  PlannerDiscoveredTechDebtItem,
  PlannerRuntimeState,
} from '@/lib/server/platform-core-planner-runtime.server';
import { runtimeToOverlay } from '@/lib/server/platform-core-planner-runtime.server';
import { isPlatformCorePlannerAutoDoneTitle } from '@/lib/platform-core-planner-auto-done';
import {
  backendAgentForSection,
  plannerDispatchAgentLines,
} from '@/lib/platform-core-planner-agent-routing';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';

const SCAN_DIRS = [
  'src/components/platform',
  'src/app/brand',
  'src/app/shop',
  'src/app/factory',
  'src/lib',
  'src/app/api/dev/platform-core',
];

const CODE_MARKERS: { re: RegExp; category: string; priority: PlannerPriority }[] = [
  { re: /\bTODO\b/i, category: 'missing-link', priority: 'P2' },
  { re: /\bFIXME\b/i, category: 'error', priority: 'P1' },
  { re: /\bHACK\b/i, category: 'error', priority: 'P1' },
  { re: /placeholder|PLACEHOLDER|mock-data|MOCK_/i, category: 'stub', priority: 'P1' },
  {
    re: /not implemented|NotImplemented|throw new Error\(['"]unimplemented/i,
    category: 'stub',
    priority: 'P1',
  },
  { re: /legacy|_archive|deprecated/i, category: 'demo-dupe', priority: 'P2' },
];

function slugId(parts: string[]) {
  return parts
    .join('-')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
    .slice(0, 80);
}

function normTitle(t: string) {
  return t.toLowerCase().replace(/\s+/g, ' ').trim();
}

function inferPriority(text: string, fallback: PlannerPriority): PlannerPriority {
  const t = text.toLowerCase();
  if (/\bp0\b|крит|block|e2e|pg-primary/.test(t)) return 'P0';
  if (/\bp2\b|nice|later|todo/.test(t)) return 'P2';
  return fallback;
}

async function walkTsFiles(root: string, rel: string, out: string[], depth = 0) {
  if (depth > 5 || out.length > 220) return;
  const dir = path.join(root, rel);
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.name.startsWith('.') || ent.name === 'node_modules') continue;
    const sub = path.join(rel, ent.name);
    if (ent.isDirectory()) {
      await walkTsFiles(root, sub, out, depth + 1);
    } else if (/\.(tsx?|jsx?)$/.test(ent.name)) {
      out.push(sub);
    }
  }
}

async function scanCodeHonestMarkers(root: string) {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    await walkTsFiles(root, dir, files);
  }

  const hits: { file: string; line: string; category: string; priority: PlannerPriority }[] = [];
  for (const file of files.slice(0, 160)) {
    let content: string;
    try {
      content = await readFile(path.join(root, file), 'utf8');
    } catch {
      continue;
    }
    const lines = content.split('\n').slice(0, 400);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.trim();
      if (line.length < 8 || line.startsWith('// eslint')) continue;
      for (const marker of CODE_MARKERS) {
        if (marker.re.test(line)) {
          hits.push({
            file,
            line: line.slice(0, 140),
            category: marker.category,
            priority: marker.priority,
          });
          break;
        }
      }
    }
  }
  return hits;
}

export type MatrixScanBrief = {
  collectionId: string;
  pillars: { id: string; title: string }[];
  cells: {
    roleId: string;
    role: string;
    pillarId: string;
    active: boolean;
    liveScore: number | null;
    summary: string;
    bad: string[];
    fix: string[];
    workspaceHref: string;
    sections: {
      id: string;
      label: string;
      liveScore: number;
      bad: string[];
      fix: string[];
      href: string;
    }[];
  }[];
};

export function exportReadinessMatrixBrief(collectionId: string): MatrixScanBrief {
  const cells = getPlatformCoreReadinessMatrix(collectionId);
  return {
    collectionId,
    pillars: PLATFORM_CORE_PILLARS.map((p) => ({ id: p.id, title: p.title })),
    cells: cells.map((c) => ({
      roleId: c.roleId,
      role: ROLE_LABELS[c.roleId],
      pillarId: c.pillarId,
      active: c.active,
      liveScore: c.liveScore,
      summary: c.summary.slice(0, 280),
      bad: c.bad ?? [],
      fix: c.fix ?? [],
      workspaceHref: c.workspaceHref,
      sections: c.subItems.map((s) => ({
        id: s.id,
        label: s.label,
        liveScore: s.liveScore,
        bad: s.bad ?? [],
        fix: s.fix ?? [],
        href: s.href,
      })),
    })),
  };
}

export function buildPlannerScanPrompt(input: {
  sessionId: string;
  collectionId: string;
  matrix: MatrixScanBrief;
  localAdded: number;
}): string {
  const ingestRel = `_ai-share/synth-1-full/.planning/planner-scan-${input.sessionId}.json`;
  const matrixJson = JSON.stringify(input.matrix, null, 2).slice(0, 28000);

  return [
    'SYNTHA Platform Core — глубокое сканирование проекта для планировщика развития.',
    `Session: ${input.sessionId}`,
    `Collection: ${input.collectionId}`,
    `Локальный аудит уже добавил ${input.localAdded} пункт(ов). Твоя задача — найти дополнительные пробелы в коде и UX.`,
    '',
    '## Матрица роли × столпы × разделы (канон аудита)',
    matrixJson,
    '',
    '## Что проверить в репозитории',
    '- Монорепо: Projects/ — фронт `_ai-share/synth-1-full`, бэкенд `app/`',
    '- Для каждой active-ячейки и каждого раздела (sections): есть ли реализация, связи между ролями, PG-primary, e2e',
    '- TODO/FIXME/stub/placeholder/mock в platform, brand, shop, factory',
    '- Тупики навигации, дубли UI, monster-файлы, отсутствующие API',
    '',
    '## Формат результата (обязательно)',
    `Запиши JSON-файл: ${ingestRel}`,
    'Схема:',
    JSON.stringify(
      {
        collection: input.collectionId,
        development: [
          {
            id: 'scan-dev-example',
            kind: 'improve',
            priority: 'P1',
            title: '[Бренд] Раздел X: краткая задача',
            evidence: 'файл/маршрут и почему',
            href: '/brand/...',
            roleId: 'brand',
            pillarId: 'development',
          },
        ],
        techDebt: [
          {
            id: 'scan-td-example',
            category: 'stub',
            priority: 'P1',
            title: 'Заглушка в ...',
            action: 'fix',
            hint: 'что сделать',
            source: 'cursor-scan',
            evidence: 'path:line',
          },
        ],
      },
      null,
      2
    ),
    '',
    'Правила:',
    '- Только новые пункты, не дублируй очевидное из матрицы verbatim',
    '- Привязывай development к roleId (brand|shop|manufacturer|supplier) и pillarId (development|sample_collection|collection_order|order_production|comms)',
    '- 10–40 development + 5–20 techDebt, приоритет P0 только для блокеров цепочки',
    '- НЕ вноси код — только файл JSON. Runner сам загрузит в planner/discover',
    '- После записи файла кратко перечисли топ-5 находок в ответе',
  ].join('\n');
}

export type AnalyzePlannerResult = {
  development: PlannerDiscoveredDevItem[];
  techDebt: PlannerDiscoveredTechDebtItem[];
  skippedDuplicates: number;
};

function pushDev(
  item: PlannerDiscoveredDevItem,
  existingTitles: Set<string>,
  devCandidates: PlannerDiscoveredDevItem[],
  skipped: { n: number }
) {
  if (isPlatformCorePlannerAutoDoneTitle(item.title)) {
    skipped.n++;
    return;
  }
  if (existingTitles.has(normTitle(item.title))) {
    skipped.n++;
    return;
  }
  existingTitles.add(normTitle(item.title));
  devCandidates.push(item);
}

function pushDebt(
  item: PlannerDiscoveredTechDebtItem,
  existingTitles: Set<string>,
  debtCandidates: PlannerDiscoveredTechDebtItem[],
  skipped: { n: number }
) {
  if (existingTitles.has(normTitle(item.title))) {
    skipped.n++;
    return;
  }
  existingTitles.add(normTitle(item.title));
  debtCandidates.push(item);
}

export async function analyzeProjectForPlanner(
  collectionId: string,
  runtime: PlannerRuntimeState
): Promise<AnalyzePlannerResult> {
  const root = process.cwd();
  const snapshot = buildPlatformCorePlanner(collectionId, runtimeToOverlay(runtime));

  const existingTitles = new Set<string>([
    ...snapshot.development.map((i) => normTitle(i.title)),
    ...snapshot.techDebt.map((i) => normTitle(i.title)),
    ...runtime.discoveredDevelopment.map((i) => normTitle(i.title)),
    ...runtime.discoveredTechDebt.map((i) => normTitle(i.title)),
  ]);

  const devCandidates: PlannerDiscoveredDevItem[] = [];
  const debtCandidates: PlannerDiscoveredTechDebtItem[] = [];
  const skipped = { n: 0 };

  const cells = getPlatformCoreReadinessMatrix(collectionId);
  const now = new Date().toISOString();

  for (const cell of cells) {
    const roleLabel = ROLE_LABELS[cell.roleId];

    for (const bad of cell.bad ?? []) {
      pushDev(
        {
          id: slugId(['an-cell-bad', cell.roleId, cell.pillarId, bad.slice(0, 24)]),
          kind: 'add',
          priority: inferPriority(
            bad,
            cell.liveScore != null && cell.liveScore < 6.5 ? 'P0' : 'P2'
          ),
          title: `[${roleLabel}] ${bad}`,
          evidence: `столп ${cell.pillarId} · live ${cell.liveScore ?? '—'}`,
          href: cell.workspaceHref,
          roleId: cell.roleId,
          pillarId: cell.pillarId,
          addedAt: now,
        },
        existingTitles,
        devCandidates,
        skipped
      );
    }

    for (const fix of cell.fix ?? []) {
      pushDev(
        {
          id: slugId(['an-cell-fix', cell.roleId, cell.pillarId, fix.slice(0, 24)]),
          kind: 'improve',
          priority: inferPriority(fix, 'P1'),
          title: `[${roleLabel}] ${fix}`,
          evidence: cell.summary.slice(0, 200),
          href: cell.workspaceHref,
          roleId: cell.roleId,
          pillarId: cell.pillarId,
          addedAt: now,
        },
        existingTitles,
        devCandidates,
        skipped
      );
    }

    for (const sub of cell.subItems) {
      for (const bad of sub.bad ?? []) {
        pushDev(
          {
            id: slugId(['an-sub-bad', sub.id, bad.slice(0, 24)]),
            kind: 'add',
            priority: inferPriority(bad, sub.liveScore < 6.5 ? 'P0' : 'P1'),
            title: `${sub.label}: ${bad}`,
            evidence: `раздел · live ${sub.liveScore}/10 · ${roleLabel} · ${cell.active ? 'active' : 'peer'}`,
            href: sub.href,
            roleId: cell.roleId,
            pillarId: cell.pillarId,
            addedAt: now,
          },
          existingTitles,
          devCandidates,
          skipped
        );
      }
      for (const fix of sub.fix ?? []) {
        pushDev(
          {
            id: slugId(['an-sub-fix', sub.id, fix.slice(0, 24)]),
            kind: 'improve',
            priority: inferPriority(fix, sub.liveScore < 6.5 ? 'P0' : 'P1'),
            title: `${sub.label}: ${fix}`,
            evidence: sub.summary.slice(0, 200),
            href: sub.href,
            roleId: cell.roleId,
            pillarId: cell.pillarId,
            addedAt: now,
          },
          existingTitles,
          devCandidates,
          skipped
        );
      }
      if (sub.liveScore < 7 && sub.summary) {
        const agentHint = backendAgentForSection(sub.id);
        pushDev(
          {
            id: slugId(['an-sub-score', sub.id]),
            kind: 'improve',
            priority: sub.liveScore < 6.5 ? 'P0' : 'P1',
            title: agentHint
              ? `Раздел «${sub.label}» · ${sub.liveScore}/10 · agent:${agentHint}`
              : `Раздел «${sub.label}» · ${sub.liveScore}/10`,
            evidence: sub.summary.slice(0, 200),
            href: sub.href,
            roleId: cell.roleId,
            pillarId: cell.pillarId,
            addedAt: now,
          },
          existingTitles,
          devCandidates,
          skipped
        );
      }
    }
  }

  const codeHits = await scanCodeHonestMarkers(root);
  for (const hit of codeHits.slice(0, 80)) {
    const title = `${hit.file}: ${hit.line.slice(0, 90)}`;
    if (hit.category === 'stub' || hit.category === 'error' || hit.category === 'demo-dupe') {
      pushDebt(
        {
          id: slugId(['an-code', hit.file, hit.line.slice(0, 16)]),
          category: hit.category,
          priority: hit.priority,
          title: `Код: ${hit.file}`,
          action: hit.category === 'error' ? 'fix' : 'change',
          hint: hit.line.slice(0, 120),
          source: 'analyze:code-scan',
          evidence: hit.line,
          addedAt: now,
        },
        existingTitles,
        debtCandidates,
        skipped
      );
    } else {
      pushDev(
        {
          id: slugId(['an-code-dev', hit.file, hit.line.slice(0, 16)]),
          kind: 'improve',
          priority: hit.priority,
          title,
          evidence: `маркер в ${hit.file}`,
          addedAt: now,
        },
        existingTitles,
        devCandidates,
        skipped
      );
    }
  }

  const priorityOrder: Record<PlannerPriority, number> = { P0: 0, P1: 1, P2: 2 };
  devCandidates.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  debtCandidates.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return { development: devCandidates, techDebt: debtCandidates, skippedDuplicates: skipped.n };
}

export function buildAgentDispatchPrompt(task: {
  id: string;
  title: string;
  priority: string;
  source?: string;
  href?: string;
  pillarId?: CoreHubPillarId;
  roleId?: CoreChainRoleId;
  sectionId?: string;
}): string {
  const agentLines = plannerDispatchAgentLines({
    pillarId: task.pillarId,
    roleId: task.roleId,
    sectionId: task.sectionId,
  });
  return [
    'SYNTHA Platform Core — задача для Cursor SDK (local agent, cwd=Projects).',
    `ID: ${task.id}`,
    `Приоритет: ${task.priority}`,
    `Задача: ${task.title}`,
    task.source ? `Источник: ${task.source}` : '',
    task.href ? `Маршрут в продукте: ${task.href}` : '',
    ...agentLines,
    '',
    'Репозиторий: монорепо Projects — фронт _ai-share/synth-1-full, бэкенд app/',
    '',
    'После реализации:',
    '1. Минимальный diff, канон путей, без параллельных стеков',
    '2. read_lints / smoke по затронутой зоне',
    `3. POST http://127.0.0.1:3001/api/dev/platform-core/planner/complete`,
    `   body: {"id":"${task.id}","note":"кратко что сделано","by":"cursor-agent"}`,
    '4. Следующая задача: GET /api/dev/platform-core/planner/next',
  ]
    .filter(Boolean)
    .join('\n');
}
