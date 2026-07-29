import { notFound } from 'next/navigation';

import {
  getNextWorkspaceSection,
  getPreviousWorkspaceSection,
  getWorkspaceSection,
} from '@/shared/navigation';
import { Badge, Icon } from '@/shared/ui';
import {
  LifecycleNavigation,
  WorkspaceContextBar,
  WorkspacePageHeader,
} from '@/shared/workspace/components';
import { OrderConfirmationWorkspacePanel } from '@/shared/workspace/components/order-confirmation-workspace-panel';

export async function OrderConfirmationWorkspacePage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const section = getWorkspaceSection('confirmation');
  if (!section) notFound();
  const previous = getPreviousWorkspaceSection(section);
  const next = getNextWorkspaceSection(section);
  const resolvedSearchParams = await searchParams;

  return (
    <main className="workspacePage">
      <WorkspacePageHeader section={section} />
      <WorkspaceContextBar />
      <section className="workspaceModuleGrid">
        <article className="modulePanel">
          <div className="sectionHeader">
            <div>
              <p className="sectionEyebrow">Системные возможности</p>
              <h2>{section.label} в едином контуре</h2>
            </div>
            {section.lifecycleStage ? <Badge tone="accent">{section.lifecycleStage}</Badge> : null}
          </div>
          <p>{section.systemRole}</p>
          <ul className="moduleChecklist">
            {section.capabilities.map((capability) => (
              <li key={capability}>
                <span className="moduleChecklistMark"><Icon name="check" size={15} /></span>
                {capability}
              </li>
            ))}
          </ul>
        </article>
        <aside className="modulePanel">
          <p className="sectionEyebrow">Связанные стадии</p>
          <h2>Переходы без тупиков</h2>
          <div className="workflowLinks">
            {previous ? <p>Назад: <strong>{previous.title}</strong></p> : <p>Начало lifecycle</p>}
            {next ? <p>Далее: <strong>{next.title}</strong></p> : <p>Завершение lifecycle</p>}
          </div>
        </aside>
      </section>
      <OrderConfirmationWorkspacePanel searchParams={resolvedSearchParams} />
      <LifecycleNavigation section={section} />
    </main>
  );
}
