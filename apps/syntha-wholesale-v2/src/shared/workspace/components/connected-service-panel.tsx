import { workspaceServiceFixtures } from '@/shared/connected-services/fixtures';
import type { WorkspaceSectionId } from '@/shared/navigation';
import { Badge } from '@/shared/ui';
import { WorkspaceEntityLink } from '@/shared/workspace/components';
import { mergeWorkspaceContextIntoHref } from '@/shared/workspace/workspace-links';

const serviceSections = ['messages', 'notifications', 'calendar', 'search'] as const;
type ConnectedServiceSection = (typeof serviceSections)[number];

function isConnectedService(section: WorkspaceSectionId): section is ConnectedServiceSection {
  return serviceSections.some((candidate) => candidate === section);
}

export function ConnectedServicePanel({ section }: { readonly section: WorkspaceSectionId }) {
  if (!isConnectedService(section)) return null;

  const items = {
    messages: workspaceServiceFixtures.messages.map((item) => ({
      id: item.id,
      title: item.title,
      entity: item.sourceEntity,
      href: mergeWorkspaceContextIntoHref(item.targetHref, { threadId: item.threadId }),
    })),
    notifications: workspaceServiceFixtures.notifications.map((item) => ({
      id: item.id,
      title: item.title,
      entity: item.sourceEntity,
      href: item.targetHref,
    })),
    calendar: workspaceServiceFixtures.calendar.map((item) => ({
      id: item.id,
      title: item.title,
      entity: item.sourceEntity,
      href: item.targetHref,
    })),
    search: workspaceServiceFixtures.search.map((item) => ({
      id: item.id,
      title: item.title,
      entity: item.sourceEntity,
      href: item.href,
    })),
  }[section];

  return (
    <section className="modulePanel" aria-labelledby="connected-service-title">
      <div className="sectionHeader">
        <div>
          <p className="sectionEyebrow">Связанные сущности</p>
          <h2 id="connected-service-title">Переход к источнику</h2>
        </div>
        <Badge tone="warning">Demo fixture</Badge>
      </div>
      <p>Данные ниже проверяют только структурный контракт. Они не имитируют production API.</p>
      <div className="workflowLinks">
        {items.map((item) => (
          <WorkspaceEntityLink entity={item.entity} href={item.href} key={item.id}>
            {item.title}
          </WorkspaceEntityLink>
        ))}
      </div>
    </section>
  );
}
