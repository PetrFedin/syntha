import { readdir, readFile } from 'fs/promises';
import path from 'path';
import type { PlannerPriority } from '@/lib/platform-core-planner';

export type UiDedupScanHit = {
  id: string;
  file: string;
  rule: string;
  priority: PlannerPriority;
  agentId: 'ui_improvement';
  hint: string;
};

const SCAN_ROOTS = ['src/components/platform', 'src/app/brand', 'src/app/shop', 'src/app/factory'];

/** Lightweight grep rules mirroring platform-core-ui-dedup-audit (no full Jest in analyze). */
const UI_DEDUP_RULES: {
  id: string;
  rule: string;
  re: RegExp;
  priority: PlannerPriority;
  hint: string;
  fileFilter: (rel: string) => boolean;
}[] = [
  {
    id: 'dedup-registry-page-header',
    rule: 'RegistryPageHeader title/lead на core-path',
    re: /\bRegistryPageHeader\b/,
    priority: 'P1',
    hint: 'Уберите title/lead — только actions toolbar на core-path',
    fileFilter: (r) => r.endsWith('-core.tsx') || r.includes('/core/'),
  },
  {
    id: 'dedup-shop-b2b-content-header',
    rule: 'ShopB2bContentHeader на core-path',
    re: /\bShopB2bContentHeader\b/,
    priority: 'P1',
    hint: 'Замените на PlatformCoreListChrome + context-bar',
    fileFilter: (r) =>
      r.startsWith('src/app/shop/') &&
      (r.endsWith('-core.tsx') || r.includes('/core/') || r.includes('b2b/')),
  },
  {
    id: 'dedup-cross-role-full',
    rule: 'RolePillarCrossRoleLinks variant=full',
    re: /RolePillarCrossRoleLinks[\s\S]{0,120}variant=["']full["']/,
    priority: 'P1',
    hint: 'Используйте variant="compact" — один cross-role блок',
    fileFilter: (r) => r.startsWith('src/components/platform/') || r.endsWith('-core.tsx'),
  },
  {
    id: 'dedup-cabinet-hub-title',
    rule: 'CabinetHubTitleRow без suppress на core layout',
    re: /CabinetHubTitleRow/,
    priority: 'P2',
    hint: 'shouldSuppressCabinetHubLayoutChrome() → null',
    fileFilter: (r) => r.endsWith('layout.tsx') && r.includes('src/app/'),
  },
  {
    id: 'dedup-brand-section-header',
    rule: 'BrandSectionHeaderBlock на platform core path',
    re: /\bBrandSectionHeaderBlock\b/,
    priority: 'P2',
    hint: 'suppress при isPlatformCoreMode()',
    fileFilter: (r) => r.endsWith('-core.tsx') || r.includes('/core/'),
  },
  {
    id: 'dedup-messages-ru-banner',
    rule: 'BrandMessagesRuWorkspaceBanner на comms core',
    re: /\bBrandMessagesRuWorkspaceBanner\b/,
    priority: 'P2',
    hint: 'null при isPlatformCoreMode() — дубль slim banner',
    fileFilter: (r) => r.includes('messages') && (r.endsWith('.tsx') || r.endsWith('-core.tsx')),
  },
];

async function walkTsFiles(root: string, rel: string, out: string[], depth = 0) {
  if (depth > 6 || out.length > 180) return;
  const dir = path.join(root, rel);
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (ent.name.startsWith('.') || ent.name === 'node_modules' || ent.name === '_archive')
      continue;
    const sub = path.join(rel, ent.name);
    if (ent.isDirectory()) {
      await walkTsFiles(root, sub, out, depth + 1);
    } else if (/\.(tsx|ts)$/.test(ent.name)) {
      out.push(sub);
    }
  }
}

export async function scanPlatformCoreUiDedup(root: string): Promise<UiDedupScanHit[]> {
  const files: string[] = [];
  for (const dir of SCAN_ROOTS) {
    await walkTsFiles(root, dir, files);
  }

  const hits: UiDedupScanHit[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const rel = file.replace(/\\/g, '/');
    let content: string;
    try {
      content = await readFile(path.join(root, file), 'utf8');
    } catch {
      continue;
    }
    if (content.includes('shouldSuppressCabinetHubLayoutChrome') && rel.endsWith('layout.tsx')) {
      continue;
    }
    for (const rule of UI_DEDUP_RULES) {
      if (!rule.fileFilter(rel)) continue;
      if (!rule.re.test(content)) continue;
      const key = `${rule.id}:${rel}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        id: rule.id,
        file: rel,
        rule: rule.rule,
        priority: rule.priority,
        agentId: 'ui_improvement',
        hint: rule.hint,
      });
      break;
    }
    if (hits.length >= 12) break;
  }

  return hits;
}
