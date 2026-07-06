import type { CoreChainRoleId, CoreHubPillarId, PlatformCoreDemoContext } from '@/lib/platform-core-hub-matrix';
import type { ReadinessSubItem } from '@/lib/platform-core-readiness-audit';

export type SectionAuditTemplate = Omit<ReadinessSubItem, 'href'> & {
  resolveHref: (demo: PlatformCoreDemoContext) => string;
  /** Тот же экран — не входит в среднее ячейки (детальный audit-id). */
  scoreAliasOf?: string;
  /** Осознанные ограничения read-only — ADR backlog, не audit bad. */
  adrBacklog?: readonly string[];
};

export type SectionAuditMap = Partial<
  Record<CoreChainRoleId, Partial<Record<CoreHubPillarId, readonly SectionAuditTemplate[]>>>
>;
