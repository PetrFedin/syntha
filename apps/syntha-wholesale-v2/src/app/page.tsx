import type { IconName } from '@/shared/ui';
import { Badge, ButtonLink, Icon, IconButton, MetricCard } from '@/shared/ui';

const navigation: ReadonlyArray<{ label: string; href: string; icon: IconName }> = [
  { label: 'Главная', href: '#overview', icon: 'home' },
  { label: 'Коллекции', href: '#lifecycle', icon: 'collections' },
  { label: 'Шоурум', href: '#active-work', icon: 'showroom' },
  { label: 'Выбор', href: '#active-work', icon: 'selection' },
  { label: 'Заказы', href: '#orders', icon: 'orders' },
  { label: 'Сообщения', href: '#activity', icon: 'messages' },
  { label: 'Календарь', href: '#calendar', icon: 'calendar' },
  { label: 'Аналитика', href: '#metrics', icon: 'analytics' },
];

const mobileNavigation = navigation.filter(({ label }) =>
  ['Главная', 'Коллекции', 'Шоурум', 'Заказы', 'Сообщения'].includes(label),
);

const lifecycle = [
  ['01', 'Campaign', 'Календарь сезона и коммерческий контекст'],
  ['02', 'Collection', 'Ассортимент, цены и материалы'],
  ['03', 'Showroom', 'Публикация и презентация байерам'],
  ['04', 'Selection', 'Рабочий выбор магазина'],
  ['05', 'Order Builder', 'Размерные сетки, количества и условия'],
  ['06', 'Order', 'Формализованный заказ и версии'],
  ['07', 'Confirmation', 'Согласование и фиксация обязательств'],
  ['08', 'DealSpace', 'Документы, сообщения и исполнение сделки'],
] as const;

const activeWork = [
  {
    title: 'Pre-Fall 2027',
    meta: 'Коллекция · 128 SKU',
    status: 'Готово к публикации',
    progress: 86,
  },
  {
    title: 'TSUM Main Buy',
    meta: 'Выбор · 47 SKU',
    status: 'Требует решения',
    progress: 62,
  },
  {
    title: 'Order #SW-2048',
    meta: 'Заказ · 1 840 000 ₽',
    status: 'На согласовании',
    progress: 74,
  },
] as const;

const activity = [
  ['Заказ #SW-2048', 'Shop предложил изменения по 6 позициям', '12 минут назад'],
  ['Pre-Fall 2027', 'Коллекция прошла проверку обязательных данных', '1 час назад'],
  ['TSUM Main Buy', 'Добавлено 14 размеров в рабочий выбор', 'Сегодня, 14:20'],
] as const;

export default function HomePage() {
  return (
    <div className="workspaceShell">
      <aside className="sidebar" data-testid="desktop-navigation" aria-label="Основная навигация">
        <a className="brandLockup" href="#overview" aria-label="Syntha — главная">
          <span className="brandWordmark">SYNTHA</span>
          <span className="brandTagline">ИНТЕЛЛЕКТ СТИЛЯ</span>
        </a>

        <nav className="sidebarNav">
          {navigation.map((item, index) => (
            <a
              className={index === 0 ? 'navItem navItem--active' : 'navItem'}
              href={item.href}
              key={item.label}
              aria-current={index === 0 ? 'page' : undefined}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebarFooter">
          <a className="navItem" href="#system">
            <Icon name="settings" size={19} />
            <span>Настройки</span>
          </a>
          <a className="organisationCard" href="#organisation" aria-label="Активная организация">
            <span className="organisationAvatar">FL</span>
            <span className="organisationCopy">
              <strong>FLASHIN</strong>
              <small>Brand workspace</small>
            </span>
            <Icon name="chevron-down" size={16} />
          </a>
        </div>
      </aside>

      <div className="workspace">
        <header className="workspaceTopbar">
          <div className="mobileBrand" aria-hidden="true">
            <strong>SYNTHA</strong>
            <span>WHOLESALE</span>
          </div>

          <label className="globalSearch">
            <Icon name="search" size={18} />
            <span className="srOnly">Поиск по workspace</span>
            <input type="search" placeholder="Поиск коллекций, заказов, партнёров" />
            <kbd>⌘ K</kbd>
          </label>

          <div className="topbarActions">
            <IconButton href="#system" icon="help" label="Помощь" />
            <IconButton href="#activity" icon="bell" label="Уведомления" badge="3" />
            <a className="profileButton" href="#organisation" aria-label="Профиль Петра Фёдина">
              ПФ
            </a>
          </div>
        </header>

        <main className="workspaceMain" id="overview">
          <section className="welcomePanel" aria-labelledby="workspace-title">
            <div>
              <div className="sectionKicker">
                <Badge tone="accent">V2 Workspace</Badge>
                <span>Среда бренда · 22 июля 2026</span>
              </div>
              <h1 id="workspace-title">Коммерческая работа — в одном контуре.</h1>
              <p>
                Syntha связывает коллекцию, выбор байера, заказ, календарь и коммуникацию без
                разрывов между командами и без зависимости от Legacy.
              </p>
              <div className="welcomeActions">
                <ButtonLink href="#active-work" icon="arrow-right">
                  Продолжить работу
                </ButtonLink>
                <ButtonLink href="/api/health" variant="secondary">
                  Проверить систему
                </ButtonLink>
              </div>
            </div>
            <div className="heroSignal" aria-label="Состояние коммерческого контура">
              <Icon name="sparkles" size={28} />
              <strong>Единый коммерческий поток</strong>
              <span>8 связанных стадий · 0 Legacy-зависимостей</span>
            </div>
          </section>

          <section id="metrics" aria-labelledby="metrics-title">
            <div className="sectionHeader">
              <div>
                <p className="sectionEyebrow">Сегодня</p>
                <h2 id="metrics-title">Контроль workspace</h2>
              </div>
              <Badge tone="success">Система активна</Badge>
            </div>
            <div className="metricGrid">
              <MetricCard label="Активные коллекции" value="12" change="+2 за неделю" tone="positive" />
              <MetricCard label="Выборы в работе" value="8" change="3 требуют решения" />
              <MetricCard label="Заказы сезона" value="₽24,8 млн" change="+18% к плану" tone="positive" />
              <MetricCard label="Непрочитанные" value="16" change="4 приоритетных" />
            </div>
          </section>

          <section className="dashboardGrid" aria-label="Рабочая сводка">
            <article className="panel activeWorkPanel" id="active-work">
              <div className="panelHeader">
                <div>
                  <p className="sectionEyebrow">Продолжить</p>
                  <h2>Активная работа</h2>
                </div>
                <a className="textLink" href="#lifecycle">
                  Весь поток <Icon name="arrow-right" size={16} />
                </a>
              </div>
              <div className="workList">
                {activeWork.map((item) => (
                  <article className="workItem" key={item.title}>
                    <div className="workItemTopline">
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.meta}</span>
                      </div>
                      <Icon name="more" size={18} />
                    </div>
                    <div className="progressTrack" aria-label={`Прогресс ${item.progress}%`}>
                      <span style={{ width: `${item.progress}%` }} />
                    </div>
                    <div className="workItemFooter">
                      <span>{item.status}</span>
                      <strong>{item.progress}%</strong>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel calendarPanel" id="calendar">
              <div className="panelHeader">
                <div>
                  <p className="sectionEyebrow">Календарь</p>
                  <h2>Ближайшие сроки</h2>
                </div>
                <Icon name="calendar" size={20} />
              </div>
              <ol className="deadlineList">
                <li>
                  <time dateTime="2026-07-23">23 <small>ИЮЛ</small></time>
                  <div><strong>Публикация Pre-Fall</strong><span>Коллекция · 12:00</span></div>
                  <Badge tone="warning">Завтра</Badge>
                </li>
                <li>
                  <time dateTime="2026-07-25">25 <small>ИЮЛ</small></time>
                  <div><strong>Закрытие выбора TSUM</strong><span>Selection · 18:00</span></div>
                </li>
                <li>
                  <time dateTime="2026-07-29">29 <small>ИЮЛ</small></time>
                  <div><strong>Подтверждение заказа</strong><span>Order #SW-2048</span></div>
                </li>
              </ol>
            </article>
          </section>

          <section className="panel lifecyclePanel" id="lifecycle" aria-labelledby="lifecycle-title">
            <div className="panelHeader">
              <div>
                <p className="sectionEyebrow">Канонический процесс</p>
                <h2 id="lifecycle-title">Один коммерческий поток</h2>
              </div>
              <span className="panelMeta">Campaign → DealSpace</span>
            </div>
            <ol className="lifecycleFlow">
              {lifecycle.map(([number, title, description], index) => (
                <li key={title}>
                  <span className="lifecycleNumber">{number}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                  {index < lifecycle.length - 1 ? <Icon name="arrow-right" size={16} /> : <Icon name="check" size={16} />}
                </li>
              ))}
            </ol>
          </section>

          <section className="dashboardGrid dashboardGrid--lower">
            <article className="panel" id="activity">
              <div className="panelHeader">
                <div>
                  <p className="sectionEyebrow">События</p>
                  <h2>Последняя активность</h2>
                </div>
                <Badge tone="neutral">Live</Badge>
              </div>
              <div className="activityList">
                {activity.map(([title, description, time]) => (
                  <div className="activityItem" key={`${title}-${time}`}>
                    <span className="activityMark"><Icon name="check" size={14} /></span>
                    <div><strong>{title}</strong><p>{description}</p></div>
                    <time>{time}</time>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel systemPanel" id="system">
              <div className="panelHeader">
                <div>
                  <p className="sectionEyebrow">Контур</p>
                  <h2>Состояние системы</h2>
                </div>
                <span className="statusDot" aria-label="Система доступна" />
              </div>
              <dl className="systemList">
                <div><dt>Архитектура</dt><dd>Vertical modular monolith</dd></div>
                <div><dt>Организация</dt><dd id="organisation">FLASHIN · Brand</dd></div>
                <div><dt>Runtime</dt><dd>Independent V2</dd></div>
                <div><dt>Legacy dependency</dt><dd>None</dd></div>
              </dl>
              <p className="isolationNote">
                New Syntha is isolated from Legacy. Legacy UI, routes, services and runtime state are not used.
              </p>
            </article>
          </section>

          <section className="ordersAnchor" id="orders" aria-label="Заказы">
            <span>Order workspace подключается к этому контуру следующим вертикальным срезом.</span>
          </section>
        </main>
      </div>

      <nav className="mobileNavigation" data-testid="mobile-navigation" aria-label="Мобильная навигация">
        {mobileNavigation.map((item, index) => (
          <a
            className={index === 0 ? 'mobileNavItem mobileNavItem--active' : 'mobileNavItem'}
            href={item.href}
            key={item.label}
            aria-current={index === 0 ? 'page' : undefined}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
