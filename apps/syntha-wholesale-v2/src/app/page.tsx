import { Suspense } from 'react';
import { commercialLifecycle } from '@/shared/navigation';
import type { WorkspaceHref } from '@/shared/routing';
import type { IconName } from '@/shared/ui';
import { Badge, Icon, MetricCard } from '@/shared/ui';
import {
  ContextualButtonLink as ButtonLink,
  ContextualLink as Link,
} from '@/shared/workspace/contextual-links';
import { WorkspaceLoadingState } from '@/shared/workspace/components';

const workspaceEntrypoints: ReadonlyArray<{
  title: string;
  meta: string;
  description: string;
  href: WorkspaceHref;
  icon: IconName;
}> = [
  {
    title: 'Подготовить коммерческую кампанию',
    meta: 'Campaign → Collection',
    description: 'Зафиксировать сезон, рынки, партнёров, сроки и правила до начала работы с ассортиментом.',
    href: '/campaigns',
    icon: 'calendar',
  },
  {
    title: 'Опубликовать коллекцию',
    meta: 'Collection → Showroom',
    description: 'Проверить коммерческие данные и передать согласованную версию в Digital Showroom.',
    href: '/collections',
    icon: 'collections',
  },
  {
    title: 'Собрать и подтвердить заказ',
    meta: 'Selection → Confirmation',
    description: 'Провести выбор через размерные сетки, версии заказа и финальное подтверждение обязательств.',
    href: '/selections',
    icon: 'orders',
  },
] as const;

const connectedCapabilities: ReadonlyArray<{
  title: string;
  description: string;
  href: WorkspaceHref;
  icon: IconName;
}> = [
  {
    title: 'Контекстные сообщения',
    description: 'Коммуникация открывается из исходной коллекции, выбора, заказа или сделки.',
    href: '/messages',
    icon: 'messages',
  },
  {
    title: 'Единый календарь',
    description: 'Сроки всех стадий собраны в одном временном контуре и ведут к исходной сущности.',
    href: '/calendar',
    icon: 'calendar',
  },
  {
    title: 'Сквозная аналитика',
    description: 'Метрики используют общий коммерческий процесс, а не отдельные несвязанные отчёты.',
    href: '/analytics',
    icon: 'analytics',
  },
] as const;

export default function HomePage() {
  return (
    <Suspense fallback={<WorkspaceLoadingState />}>
      <main className="workspaceMain" id="overview">
      <section className="welcomePanel" aria-labelledby="workspace-title">
        <div>
          <div className="sectionKicker">
            <Badge tone="accent">V2 Workspace</Badge>
            <span>Единая рабочая среда бренда</span>
          </div>
          <h1 id="workspace-title">Коммерческая работа — в одном контуре.</h1>
          <p>
            Syntha связывает кампанию, коллекцию, showroom, выбор байера, заказ, подтверждение и
            исполнение сделки без дублирования навигации, состояния и бизнес-контекста.
          </p>
          <div className="welcomeActions">
            <ButtonLink href="/campaigns" icon="arrow-right">
              Начать коммерческий поток
            </ButtonLink>
            <ButtonLink href="/collections" variant="secondary">
              Открыть коллекции
            </ButtonLink>
          </div>
        </div>
        <div className="heroSignal" aria-label="Состояние коммерческого контура">
          <Icon name="sparkles" size={28} />
          <strong>Единый коммерческий поток</strong>
          <span>8 связанных стадий · 1 реестр маршрутов · 0 Legacy-зависимостей</span>
        </div>
      </section>

      <section aria-labelledby="metrics-title">
        <div className="sectionHeader">
          <div>
            <p className="sectionEyebrow">Архитектурный контроль</p>
            <h2 id="metrics-title">Состояние workspace</h2>
          </div>
          <Badge tone="success">Контур связан</Badge>
        </div>
        <div className="metricGrid">
          <MetricCard label="Стадии процесса" value="8" change="Campaign → DealSpace" tone="positive" />
          <MetricCard label="Разделы workspace" value="15" change="Все имеют реальные маршруты" tone="positive" />
          <MetricCard label="Источник навигации" value="1" change="Единый registry" tone="positive" />
          <MetricCard label="Legacy-зависимости" value="0" change="Независимый runtime" tone="positive" />
        </div>
      </section>

      <section className="dashboardGrid" aria-label="Рабочие точки входа">
        <article className="panel activeWorkPanel">
          <div className="panelHeader">
            <div>
              <p className="sectionEyebrow">Продолжить</p>
              <h2>Коммерческие сценарии</h2>
            </div>
            <Link className="textLink" href="/campaigns">
              Весь поток <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="workList">
            {workspaceEntrypoints.map((item) => (
              <Link className="workItem" href={item.href} key={item.href}>
                <div className="workItemTopline">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.meta}</span>
                  </div>
                  <Icon name={item.icon} size={20} />
                </div>
                <p>{item.description}</p>
                <div className="workItemFooter">
                  <span>Открыть связанный процесс</span>
                  <Icon name="arrow-right" size={16} />
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="panel calendarPanel">
          <div className="panelHeader">
            <div>
              <p className="sectionEyebrow">Координация</p>
              <h2>Общие сервисы</h2>
            </div>
            <Icon name="calendar" size={20} />
          </div>
          <ol className="deadlineList">
            <li>
              <span className="activityMark"><Icon name="calendar" size={14} /></span>
              <div><strong>Коммерческий календарь</strong><span>Сроки кампаний, выборов и подтверждений</span></div>
              <ButtonLink href="/calendar" variant="ghost">Открыть</ButtonLink>
            </li>
            <li>
              <span className="activityMark"><Icon name="bell" size={14} /></span>
              <div><strong>Уведомления</strong><span>Переход к исходной сущности без потери контекста</span></div>
              <ButtonLink href="/notifications" variant="ghost">Открыть</ButtonLink>
            </li>
            <li>
              <span className="activityMark"><Icon name="search" size={14} /></span>
              <div><strong>Глобальный поиск</strong><span>Коллекции, SKU, партнёры, заказы и сделки</span></div>
              <ButtonLink href="/search" variant="ghost">Открыть</ButtonLink>
            </li>
          </ol>
        </article>
      </section>

      <section className="panel lifecyclePanel" aria-labelledby="lifecycle-title">
        <div className="panelHeader">
          <div>
            <p className="sectionEyebrow">Канонический процесс</p>
            <h2 id="lifecycle-title">Один коммерческий поток</h2>
          </div>
          <span className="panelMeta">Campaign → DealSpace</span>
        </div>
        <ol className="lifecycleFlow">
          {commercialLifecycle.map((section, index) => (
            <li key={section.id}>
              <span className="lifecycleNumber">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong><Link href={section.href}>{section.lifecycleStage}</Link></strong>
                <p>{section.description}</p>
              </div>
              {index < commercialLifecycle.length - 1 ? (
                <Icon name="arrow-right" size={16} />
              ) : (
                <Icon name="check" size={16} />
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="dashboardGrid dashboardGrid--lower">
        <article className="panel">
          <div className="panelHeader">
            <div>
              <p className="sectionEyebrow">Сквозные возможности</p>
              <h2>Связи между модулями</h2>
            </div>
            <Badge tone="neutral">Registry driven</Badge>
          </div>
          <div className="activityList">
            {connectedCapabilities.map((item) => (
              <Link className="activityItem" href={item.href} key={item.href}>
                <span className="activityMark"><Icon name={item.icon} size={14} /></span>
                <div><strong>{item.title}</strong><p>{item.description}</p></div>
                <Icon name="arrow-right" size={16} />
              </Link>
            ))}
          </div>
        </article>

        <article className="panel systemPanel">
          <div className="panelHeader">
            <div>
              <p className="sectionEyebrow">Контур</p>
              <h2>Состояние системы</h2>
            </div>
            <span className="statusDot" aria-label="Система доступна" />
          </div>
          <dl className="systemList">
            <div><dt>Архитектура</dt><dd>Vertical modular monolith</dd></div>
            <div><dt>Организация</dt><dd>FLASHIN · Brand</dd></div>
            <div><dt>Навигация</dt><dd>Single source of truth</dd></div>
            <div><dt>Legacy dependency</dt><dd>None</dd></div>
          </dl>
          <p className="isolationNote">
            WorkspaceShell принадлежит корневому layout. Страницы отвечают только за содержимое и
            получают маршруты, метаданные и связи из общего registry.
          </p>
          <ButtonLink href="/settings" variant="secondary">Настроить workspace</ButtonLink>
        </article>
      </section>
      </main>
    </Suspense>
  );
}
