'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  mobileWorkspaceNavigation,
  workspaceNavigation,
} from '@/shared/navigation';
import { Icon, IconButton } from '@/shared/ui';

interface WorkspaceShellProps {
  readonly children: ReactNode;
}

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const pathname = usePathname();

  return (
    <div className="workspaceShell">
      <aside className="sidebar" data-testid="desktop-navigation" aria-label="Основная навигация">
        <a className="brandLockup" href="/" aria-label="Syntha — главная">
          <span className="brandWordmark">SYNTHA</span>
          <span className="brandTagline">ИНТЕЛЛЕКТ СТИЛЯ</span>
        </a>

        <nav className="sidebarNav">
          {workspaceNavigation.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <a
                className={active ? 'navItem navItem--active' : 'navItem'}
                href={item.href}
                key={item.id}
                aria-current={active ? 'page' : undefined}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebarFooter">
          <a
            className={isActiveRoute(pathname, '/settings') ? 'navItem navItem--active' : 'navItem'}
            href="/settings"
            aria-current={isActiveRoute(pathname, '/settings') ? 'page' : undefined}
          >
            <Icon name="settings" size={19} />
            <span>Настройки</span>
          </a>
          <a className="organisationCard" href="/settings" aria-label="Активная организация FLASHIN">
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
          <a className="mobileBrand" href="/" aria-label="Syntha — главная">
            <strong>SYNTHA</strong>
            <span>WHOLESALE</span>
          </a>

          <form className="globalSearch" action="/search" method="get" role="search">
            <Icon name="search" size={18} />
            <label className="srOnly" htmlFor="workspace-search">Поиск по workspace</label>
            <input
              id="workspace-search"
              name="q"
              type="search"
              placeholder="Поиск коллекций, заказов, партнёров"
              autoComplete="off"
            />
            <kbd aria-hidden="true">⌘ K</kbd>
          </form>

          <div className="topbarActions">
            <IconButton href="/help" icon="help" label="Помощь" />
            <IconButton href="/notifications" icon="bell" label="Уведомления" badge="3" />
            <a className="profileButton" href="/settings" aria-label="Профиль Петра Фёдина">
              ПФ
            </a>
          </div>
        </header>

        {children}
      </div>

      <nav className="mobileNavigation" data-testid="mobile-navigation" aria-label="Мобильная навигация">
        {mobileWorkspaceNavigation.map((item) => {
          const active = isActiveRoute(pathname, item.href);

          return (
            <a
              className={active ? 'mobileNavItem mobileNavItem--active' : 'mobileNavItem'}
              href={item.href}
              key={item.id}
              aria-current={active ? 'page' : undefined}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
