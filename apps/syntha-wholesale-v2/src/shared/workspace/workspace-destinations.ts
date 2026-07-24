import type { CommercialEntityType } from '@/shared/commercial-context';
import {
  getNextWorkspaceSection,
  getPreviousWorkspaceSection,
  type WorkspaceSection,
  type WorkspaceSectionId,
} from '@/shared/navigation';
import type { WorkspaceHref } from '@/shared/routing';
import type { WorkspaceUrlContext } from '@/shared/workspace/workspace-links';

const entitySectionHref: Record<CommercialEntityType, WorkspaceHref> = {
  organisation: '/settings',
  season: '/campaigns',
  campaign: '/campaigns',
  collection: '/collections',
  showroom: '/showroom',
  selection: '/selections',
  'order-draft': '/order-builder',
  order: '/orders',
  confirmation: '/confirmation',
  deal: '/dealspace',
};

const serviceFallbacks: Partial<Record<WorkspaceSectionId, WorkspaceHref>> = {
  messages: '/dealspace',
  calendar: '/campaigns',
  notifications: '/campaigns',
  search: '/collections',
};

export interface WorkspaceDestination {
  readonly href: WorkspaceHref;
  readonly label: string;
}

export function getEntitySectionHref(type: CommercialEntityType): WorkspaceHref {
  return entitySectionHref[type];
}

export function resolveWorkspacePrimaryDestination(
  section: WorkspaceSection,
  context: WorkspaceUrlContext,
): WorkspaceDestination {
  const next = getNextWorkspaceSection(section);
  if (next) return { href: next.href, label: section.primaryActionLabel };

  if (context.entityType && context.entityId) {
    return {
      href: getEntitySectionHref(context.entityType),
      label: section.primaryActionLabel,
    };
  }

  const previous = getPreviousWorkspaceSection(section);
  if (previous && section.id === 'dealspace') {
    return { href: previous.href, label: 'Вернуться к подтверждению' };
  }

  const fallback = serviceFallbacks[section.id];
  if (fallback) {
    return {
      href: fallback,
      label: section.id === 'calendar'
        ? 'Открыть кампании'
        : section.id === 'search'
          ? 'Открыть коллекции'
          : section.id === 'messages'
            ? 'Открыть DealSpace'
            : 'Открыть кампании',
    };
  }

  return { href: '/', label: 'Вернуться на dashboard' };
}
