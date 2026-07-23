'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  mobileWorkspaceNavigation,
  workspaceNavigation,
} from '@/shared/navigation';
import {
  WorkspaceSearchContextFields,
  WorkspaceShellLink,
} from '@/shared/workspace/workspace-shell-navigation';
import { Icon } from '@/shared/ui';

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
    <div className="workspaceShell" data-testid="workspace-shell">
      <aside className="sidebar" data-testid="desktop-navigation" aria-label="Основная навигация">
        <WorkspaceShellLink className="brandLockup" href="/" ariaLabel="Syntha — главная">
          <span className="brandWordmark">SYNTHA</span>
          <span className="brandTagline">ИНТЕЛЛЕКТ СТИЛЯ</span>
        </WorkspaceShellLink>

        <nav className="sidebarNav">
          {workspaceNavigation.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <WorkspaceShellLink
                className={active ? 'navItem navItem--active' : 'navItem'}
                href={item.href}
                key={item.id}
                ariaCurrent={active ? 'page' : undefined}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
              </WorkspaceShellLink>
            );
          })}
        </nav>

        <div className="sidebarFooter">
          <WorkspaceShellLink
            className={isActiveRoute(pathname, '/settings') ? 'navItem navItem--active' : 'navItem'}
            href="/settings"
            ariaCurrent={isActiveRoute(pathname, '/settings') ? 'page' : undefined}
          >
            <Icon name="settings" size={19} />
            <span>Настройки</span>
          </WorkspaceShellLink>
          <WorkspaceShellLink className="organisationCard" href="/settings" ariaLabel="Активная организация FLASHIN">
            <span className="organisationAvatar">FL</span>
            <span className="organisationCopy">
              <strong>FLASHIN</strong>
              <small>Brand workspace</small>
            </span>
            <Icon name="chevron-down" size={16} />
          </WorkspaceShellLink>
        </div>
      </aside>

      <div className="workspace">
        <header className="workspaceTopbar">
          <WorkspaceShellLink className="mobileBrand" href="/" ariaLabel="Syntha — главная">
            <strong>SYNTHA</strong>
            <span>WHOLESALE</span>
          </WorkspaceShellLink>

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
            <WorkspaceSearchContextFields />
            <kbd aria-hidden="true">⌘ K</kbd>
          </form>

          <div className="topbarActions">
            <WorkspaceShellLink className="iconButton" href="/help" ariaLabel="Помощь" title="Помощь">
              <Icon name="help" />
            </WorkspaceShellLink>
            <WorkspaceShellLink className="iconButton" href="/notifications" ariaLabel="Уведомления" title="Уведомления">
              <Icon name="bell" />
              <span className="iconButton__badge">3</span>
            </WorkspaceShellLink>
            <WorkspaceShellLink className="profileButton" href="/settings" ariaLabel="Профиль Петра Фёдина">
              ПФ
            </WorkspaceShellLink>
          </div>
        </header>

        {children}
      </div>

      <nav className="mobileNavigation" data-testid="mobile-navigation" aria-label="Мобильная навигация">
        {mobileWorkspaceNavigation.map((item) => {
          const active = isActiveRoute(pathname, item.href);

          return (
            <WorkspaceShellLink
              className={active ? 'mobileNavItem mobileNavItem--active' : 'mobileNavItem'}
              href={item.href}
              key={item.id}
              ariaCurrent={active ? 'page' : undefined}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </WorkspaceShellLink>
          );
        })}
      </nav>
    </div>
  );
}
