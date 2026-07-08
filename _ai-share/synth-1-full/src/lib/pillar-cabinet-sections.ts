import type {
  CoreChainRoleId,
  CoreHubPillarId,
  PlatformCoreDemoContext,
} from '@/lib/platform-core-hub-matrix';
import { getPillarCrossRolePeersForDemo } from '@/lib/platform-core-hub-matrix';
import type { ReadinessSubItem } from '@/lib/platform-core-readiness-audit';
import {
  buildEmptySectionSubItems,
  buildSectionSubItems,
} from '@/lib/platform-core-readiness-sections';
import { hasEmptyCellInsightPanel } from '@/lib/platform-core-empty-cell-registry';
import { buildPillarRegistryCrossLinks } from '@/lib/pillar-cross-links';
import { filterCabinetSectionsForArticleSpine } from '@/lib/platform-core-article-spine';
import { filterReadinessSubItemsForTwoRoleBaseline } from '@/lib/platform-core-two-role-sections';

const CABINET_SECTION_EXCLUDE_ID_RE = /-(cabinet|banner|cross|pg-sync|investor)(?:-|$)/i;

const CABINET_SECTION_MAX = 12;
const RELATED_LINK_MAX = 3;

export type PillarCabinetLink = {
  id: string;
  label: string;
  href: string;
  kind: 'section' | 'peer';
};

function buildAllCabinetSectionItems(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId: string,
  opts?: { emptyCell?: boolean }
): ReadinessSubItem[] {
  const raw = opts?.emptyCell
    ? buildEmptySectionSubItems(roleId, pillarId, collectionId)
    : buildSectionSubItems(roleId, pillarId, collectionId);

  return filterReadinessSubItemsForTwoRoleBaseline(
    filterCabinetSectionsForArticleSpine(
      raw
        .filter((item) => !CABINET_SECTION_EXCLUDE_ID_RE.test(item.id))
        .sort((a, b) => a.order - b.order)
    ),
    roleId,
    pillarId
  );
}

/** Разделы для списка в кабинете (без audit scores, без meta-разделов). */
export function buildPillarCabinetSectionItems(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId: string,
  opts?: { emptyCell?: boolean }
): ReadinessSubItem[] {
  return buildAllCabinetSectionItems(roleId, pillarId, collectionId, opts).slice(
    0,
    CABINET_SECTION_MAX
  );
}

/** Overflow разделы для sheet «Ещё». */
export function buildPillarCabinetOverflowSections(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId: string,
  opts?: { emptyCell?: boolean }
): ReadinessSubItem[] {
  return buildAllCabinetSectionItems(roleId, pillarId, collectionId, opts).slice(
    CABINET_SECTION_MAX
  );
}

/** До 3 связанных ссылок: registry integrations + cross-role peers (без дубля overflow разделов). */
export function buildPillarCabinetRelatedLinks(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  collectionId: string,
  demo: PlatformCoreDemoContext,
  opts?: { emptyCell?: boolean }
): PillarCabinetLink[] {
  void collectionId;
  void opts;

  const registry = buildPillarRegistryCrossLinks(roleId, pillarId, demo).map((link) => ({
    id: link.id,
    label: link.label,
    href: link.href,
    kind: 'peer' as const,
  }));

  const peers = getPillarCrossRolePeersForDemo(roleId, pillarId, demo)
    .filter((peer) => peer.participates && peer.demoHref)
    .map((peer) => ({
      id: `peer-${peer.roleId}`,
      label: peer.label,
      href: peer.demoHref!,
      kind: 'peer' as const,
    }));

  const seen = new Set<string>();
  const merged: PillarCabinetLink[] = [];
  for (const link of [...registry, ...peers]) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    merged.push(link);
    if (merged.length >= RELATED_LINK_MAX) break;
  }
  return merged;
}

export function pillarCabinetUsesEmptySections(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  cellKind: 'active' | 'empty'
): boolean {
  return cellKind === 'empty' && hasEmptyCellInsightPanel(roleId, pillarId);
}
