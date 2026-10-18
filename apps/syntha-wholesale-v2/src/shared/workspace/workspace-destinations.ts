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

const serviceFallbacks: Partial<Record<WorkspaceSectionId, WorkspaceDestination>> = {
  messages: { href: '/dealspace', label: 'Открыть DealSpace' },
  calendar: { href: '/campaigns', label: 'Открыть кампании' },
  notifications: { href: '/campaigns', label: 'Открыть кампании' },
  search: { href: '/collections', label: 'Открыть коллекции' },
};

export interface WorkspaceDestination {
  readonly href: WorkspaceHref;
  readonly label: string;
}

export function isCommercialEntityType(value: string | undefined): value is CommercialEntityType {
  return Boolean(value && Object.prototype.hasOwnProperty.call(entitySectionHref, value));
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

  if (isCommercialEntityType(context.entityType) && context.entityId) {
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
  if (fallback) return fallback;

  return { href: '/', label: 'Вернуться на dashboard' };
}
