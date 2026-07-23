import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getNextWorkspaceSection,
  getPreviousWorkspaceSection,
  getWorkspaceSection,
  workspaceSections,
} from '@/shared/navigation';
import { Badge, Icon } from '@/shared/ui';
import {
  LifecycleNavigation,
  WorkspaceContextBar,
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspaceSectionFooter,
} from '@/shared/workspace/components';
import { ConnectedServicePanel } from '@/shared/workspace/components/connected-service-panel';

export const dynamicParams = false;

interface WorkspaceSectionPageProps {
  readonly params: Promise<{ readonly section: string }>;
}

export function generateStaticParams() {
  return workspaceSections.map(({ slug }) => ({ section: slug }));
}

export async function generateMetadata({
  params,
}: Pick<WorkspaceSectionPageProps, 'params'>): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getWorkspaceSection(slug);
  return section
    ? { title: section.title, description: section.description }
    : { title: 'Раздел не найден' };
}

export default async function WorkspaceSectionPage({
  params,
}: WorkspaceSectionPageProps) {
  const { section: slug } = await params;
  const section = getWorkspaceSection(slug);
  if (!section) notFound();

  const previous = getPreviousWorkspaceSection(section);
  const next = getNextWorkspaceSection(section);

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

      <ConnectedServicePanel section={section.id} />
      <WorkspaceEmptyState section={section} />
      <LifecycleNavigation section={section} />
      <WorkspaceSectionFooter section={section} />
    </main>
  );
}
