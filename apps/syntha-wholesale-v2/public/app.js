const TOKEN_KEY = 'syntha-v2-session';
const STAGES = ['campaign','collection','showroom','selection','order-builder','order','confirmation','deal-space'];
const NAV = [
  ['overview','Обзор'], ['partners','Контрагенты'], ['catalog','Кампании'], ['showrooms','Шоурумы'],
  ['selections','Selection'], ['orders','Заказы'], ['calendar','Календарь'], ['notifications','Уведомления'],
];

const state = {
  token: sessionStorage.getItem(TOKEN_KEY) || '',
  user: null,
  workspace: emptyWorkspace(),
  notifications: [],
  view: 'overview',
  busy: false,
};
const root = document.querySelector('#app');

boot();

async function boot() {
  if (!state.token) return renderLogin();
  try { await reload(); renderApp(); }
  catch { clearSession(); renderLogin('Сессия недействительна. Войдите снова.'); }
}

async function reload() {
  const [me, workspace, notifications] = await Promise.all([
    api('/v2/auth/me'), api('/v2/workspace'), api('/v2/notifications').catch(() => []),
  ]);
  state.user = me;
  state.workspace = { ...emptyWorkspace(), ...workspace };
  state.notifications = Array.isArray(notifications) ? notifications : [];
}

function renderLogin(message = '') {
  clear(root);
  const wrap = el('main', { className: 'login-wrap' });
  const card = el('section', { className: 'card login' });
  card.append(brandBlock(), el('p', { className: 'muted', text: 'Автономный wholesale workspace. Собственная PostgreSQL-сессия, без внешнего identity provider.' }));
  if (message) card.append(notice(message, 'error'));
  const form = el('form');
  const email = inputField('Email', 'email', { name: 'email', autocomplete: 'username', required: true, value: 'owner@syntha.local' });
  const password = inputField('Пароль', 'password', { name: 'password', autocomplete: 'current-password', required: true, minlength: '12' });
  const submit = el('button', { className: 'button primary', text: 'Войти', type: 'submit' });
  form.append(email.label, password.label, submit);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setButtonBusy(submit, true, 'Входим…');
    try {
      const data = await api('/v2/auth/login', { method: 'POST', body: { email: email.control.value, password: password.control.value }, anonymous: true });
      state.token = data.accessToken;
      sessionStorage.setItem(TOKEN_KEY, state.token);
      await reload();
      renderApp();
    } catch (error) { showInlineError(form, error.message); }
    finally { setButtonBusy(submit, false, 'Войти'); }
  });
  card.append(form, el('p', { className: 'login-hint', text: 'Первый владелец создаётся командой npm run bootstrap:owner.' }));
  wrap.append(card); root.append(wrap);
}

function renderApp() {
  clear(root);
  const shell = el('div', { className: 'shell' });
  const sidebar = el('aside', { className: 'sidebar' });
  sidebar.append(brandBlock());
  const nav = el('nav', { className: 'nav', ariaLabel: 'Разделы' });
  for (const [id, label] of NAV) {
    const button = el('button', { text: label, className: state.view === id ? 'active' : '' });
    button.addEventListener('click', () => { state.view = id; renderApp(); });
    nav.append(button);
  }
  const footer = el('div', { className: 'sidebar-footer' });
  const refresh = el('button', { className: 'button', text: 'Обновить' });
  refresh.addEventListener('click', () => runAction(async () => { await reload(); renderApp(); }, refresh));
  const logout = el('button', { className: 'button danger', text: 'Выйти' });
  logout.addEventListener('click', () => runAction(async () => {
    await api('/v2/auth/logout', { method: 'POST' }).catch(() => null);
    clearSession(); renderLogin();
  }, logout));
  footer.append(refresh, logout); sidebar.append(nav, footer);

  const main = el('main', { className: 'main' });
  const topbar = el('header', { className: 'topbar' });
  const heading = el('div');
  heading.append(el('p', { className: 'eyebrow', text: 'Syntha V2 / PostgreSQL' }), el('h2', { text: viewTitle(state.view) }), el('p', { className: 'muted', text: `${state.user?.displayName || state.user?.email || 'Пользователь'} · ${ownOrganisationNames().join(', ') || 'организация не назначена'}` }));
  topbar.append(heading, statusBadge('online'));
  main.append(topbar, renderView());
  shell.append(sidebar, main); root.append(shell, dialogHost(), el('div', { id: 'toast', className: 'toast' }));
}

function renderView() {
  switch (state.view) {
    case 'partners': return renderPartners();
    case 'catalog': return renderCatalog();
    case 'showrooms': return renderShowrooms();
    case 'selections': return renderSelections();
    case 'orders': return renderOrders();
    case 'calendar': return renderCalendar();
    case 'notifications': return renderNotifications();
    default: return renderOverview();
  }
}

function renderOverview() {
  const box = el('div');
  const w = state.workspace;
  const kpis = el('section', { className: 'grid kpis' });
  [
    ['Активные связи', w.relationships.filter(x => x.status === 'active').length],
    ['Открытые циклы', w.cycles.filter(x => x.stage !== 'deal-space').length],
    ['Заказы', w.orders.length],
    ['DealSpace', w.deals.length],
  ].forEach(([label, value]) => kpis.append(kpi(label, value)));
  box.append(kpis);
  const activeCycles = [...w.cycles].sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,5);
  box.append(sectionCard('Коммерческий pipeline', activeCycles.length ? activeCycles.map(cycleEntity) : [empty('Коммерческие циклы ещё не созданы.')]),
    sectionCard('Ближайшие события', w.calendar.length ? [...w.calendar].sort((a,b)=>String(a.startsAt).localeCompare(String(b.startsAt))).slice(0,6).map(calendarEntity) : [empty('Календарь пока пуст.')]),
    sectionCard('Последние уведомления', state.notifications.length ? state.notifications.slice(0,6).map(notificationEntity) : [empty('Новых уведомлений нет.')])
  );
  return box;
}

function renderPartners() {
  const box = el('div');
  const controls = toolbar('Торговые отношения и доступы', 'Запросить связь', () => relationshipForm());
  box.append(controls);
  const grid = el('div', { className: 'grid two' });
  grid.append(sectionCard('Отношения', state.workspace.relationships.length ? state.workspace.relationships.map(relationshipEntity) : [empty('Нет отношений с контрагентами.')]),
    sectionCard('Приглашения в шоурумы', state.workspace.invitations.length ? state.workspace.invitations.map(invitationEntity) : [empty('Нет приглашений.')])
  );
  box.append(grid); return box;
}

function renderCatalog() {
  const box = el('div');
  box.append(toolbar('Кампании и коллекции', 'Создать кампанию', campaignForm));
  const grid = el('div', { className: 'grid two' });
  grid.append(sectionCard('Кампании', state.workspace.campaigns.length ? state.workspace.campaigns.map(campaignEntity) : [empty('Кампаний пока нет.')]),
    sectionCard('Коллекции', state.workspace.collections.length ? state.workspace.collections.map(collectionEntity) : [empty('Коллекций пока нет.')], 'Создать коллекцию, collectionForm));
  box.append(grid); return box;
}

function renderShowrooms() {
  const box = el('div');
  box.append(toolbar$�PЀL@