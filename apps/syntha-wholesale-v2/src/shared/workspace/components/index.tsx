'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import type { CommercialEntityReference } from '@/shared/commercial-context';
import type { WorkspaceHref } from '@/shared/routing';
import type { WorkspaceSection } from '@/shared/navigation';
import {
  getNextWorkspaceSection,
  getPreviousWorkspaceSection,
  isLifecycleSection,
} from '@/shared/navigation';
import { Badge, ButtonLink, Icon } from '@/shared/ui';
import { useWorkspaceContext } from '@/shared/workspace/workspace-context';
import {
  mergeWorkspaceContextIntoHref,
  parseWorkspaceSearchParams,
  type WorkspaceUrlContext,
} from '@/shared/workspace/workspace-links';
import {
  getEntitySectionHref,
  resolveWorkspacePrimaryDestination,
} from '@/shared/workspace/workspace-destinations';

export { getEntitySectionHref } from '@/shared/workspace/workspace-destinations';

export function WorkspacePageHeader({ section }: { readonly section: WorkspaceSection }) {
  return (
    <header className="workspacePageHeader">
      <div>
        <div className="sectionKicker">
          <Badge tone={isLifecycleSection(section) ? 'accent' : 'neutral'}>
            {section.lifecycleStage ?? 'Workspace service'}
          </Badge>
          <span>{section.label}</span>
        </div>
        <h1>{section.title}</h1>
        <p>{section.description}</p>
      </div>
      <div className="workspacePageSignal">
        <Icon name={section.icon} size={28} />
        <strong>Роль в системе</strong>
        <span>{section.systemRole}</span>
      </div>
    </header>
  );
}

export function WorkspaceContextBar({
  urlContext,
}: {
  readonly urlContext?: WorkspaceUrlContext;
}) {
  const workspace = useWorkspaceContext();
  const searchParams = useSearchParams();
  const resolvedContext = urlContext ?? parseWorkspaceSearchParams(searchParams);
  const values = [
    ['Организация', resolvedContext.organisationId ?? workspace.organisationName ?? workspace.organisationId ?? 'Не выбрана'],
    ['Сезон', resolvedContext.seasonId ?? workspace.seasonName ?? workspace.seasonId ?? 'Не выбран'],
    ['Кампания', resolvedContext.campaignId ?? workspace.campaignId ?? 'Не выбрана'],
    ['Валюта', resolvedContext.currency ?? workspace.currency ?? 'RUB'],
  ] as const;

  return (
    <section className="workspaceContextGrid" aria-label="Контекст workspace">
      {values.map(([label, value]) => (
        <div className="contextCard" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}

export function LifecycleNavigation({
  section,
  context,
}: {
  readonly section: WorkspaceSection;
  readonly context?: WorkspaceUrlContext;
}) {
  const searchParams = useSearchParams();
  const resolvedContext = context ?? parseWorkspaceSearchParams(searchParams);
  const previous = getPreviousWorkspaceSection(section);
  const next = getNextWorkspaceSection(section);

  return (
    <nav className="lifecycleNavigation" aria-label="Переходы коммерческого процесса">
      {previous ? (
        <Link className="workflowLink" href={mergeWorkspaceContextIntoHref(previous.href, resolvedContext)}>
          <Icon name="arrow-right" size={16} />
          <span>Предыдущая стадия<strong>{previous.label}</strong></span>
        </Link>
      ) : <span />}
      {next ? (
        <Link className="workflowLink" href={mergeWorkspaceContextIntoHref(next.href, resolvedContext)}>
          <span>Следующая стадия<strong>{next.label}</strong></span>
          <Icon name="arrow-right" size={16} />
        </Link>
      ) : null}
    </nav>
  );
}

export function WorkspaceEmptyState({
  section,
  context,
}: {
  readonly section: WorkspaceSection;
  readonly context?: WorkspaceUrlContext;
}) {
  const searchParams = useSearchParams();
  const resolvedContext = context ?? parseWorkspaceSearchParams(searchParams);
  const destination = resolveWorkspacePrimaryDestination(section, resolvedContext);

  return (
    <section className="workspaceState" aria-labelledby="workspace-empty-title">
      <Icon name={section.icon} size={26} />
      <h2 id="workspace-empty-title">Рабочие данные появятся из связанного процесса</h2>
      <p>
        Раздел не подменяет серверные данные демонстрационными показателями. Выберите родительский
        контекст или продолжите канонический lifecycle.
      </p>
      <div className="workspaceStateActions">
        <ButtonLink
          href={mergeWorkspaceContextIntoHref(destination.href, resolvedContext)}
          icon="arrow-right"
        >
          {destination.label}
        </ButtonLink>
        <ButtonLink href={mergeWorkspaceContextIntoHref('/', resolvedContext)} variant="secondary">
          На dashboard
        </ButtonLink>
      </div>
    </section>
  );
}

export function WorkspaceSectionFooter({ section }: { readonly section: WorkspaceSection }) {
  const searchParams = useSearchParams();
  const context = parseWorkspaceSearchParams(searchParams);
  const destination = resolveWorkspacePrimaryDestination(section, context);

  return (
    <footer className="workspacePageFooter">
      <ButtonLink href={mergeWorkspaceContextIntoHref('/', context)} variant="secondary">
        На dashboard
      </ButtonLink>
      <ButtonLink
        href={mergeWorkspaceContextIntoHref(destination.href, context)}
        icon="arrow-right"
      >
        {destination.label}
      </ButtonLink>
    </footer>
  );
}

export function WorkspaceErrorState({
  retry,
  code,
}: {
  readonly retry: () => void;
  readonly code?: string;
}) {
  return (
    <section className="workspacePage">
      <div className="workspaceState" role="alert">
        <Icon name="help" size={26} />
        <h1>Не удалось загрузить раздел</h1>
        <p>Повторите безопасную загрузку или вернитесь на dashboard.</p>
        {code ? <code>{code}</code> : null}
        <div className="workspaceStateActions">
          <button className="button button--primary" onClick={retry} type="button">Повторить</button>
          <ButtonLink href="/" variant="secondary">На dashboard</ButtonLink>
        </div>
      </div>
    </section>
  );
}

export function WorkspaceLoadingState() {
  return (
    <main className="workspacePage" aria-busy="true" aria-label="Загрузка раздела">
      <div className="workspaceSkeleton workspaceSkeleton--hero" />
      <div className="workspaceContextGrid">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="workspaceSkeleton workspaceSkeleton--context" key={index} />
        ))}
      </div>
      <div className="workspaceSkeleton workspaceSkeleton--content" />
    </main>
  );
}

export function WorkspaceEntityLink({
  entity,
  href,
  children,
}: {
  readonly entity: CommercialEntityReference;
  readonly href: WorkspaceHref;
  readonly children: ReactNode;
}) {
  return (
    <Link
      className="workspaceEntityLink"
      href={mergeWorkspaceContextIntoHref(href, {
        entityType: entity.type,
        entityId: entity.id,
      })}
    >
      <span>{children}</span>
      <small>{entity.type} · {entity.id}</small>
      <Icon name="arrow-right" size={16} />
    </Link>
  );
}
