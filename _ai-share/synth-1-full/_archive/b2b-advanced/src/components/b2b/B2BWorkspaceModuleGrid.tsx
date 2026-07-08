'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  WORKSPACE_TABS,
  WORKSPACE_ITEMS,
  ROLE_PERMISSIONS,
  WORKSPACE_ITEM_PATHS,
  type B2BUserRole,
  type WorkspaceTabId,
} from '@/lib/data/b2b-workspace-matrix';
import { ROUTES } from '@/lib/routes';

/** Сопоставление платформенной роли с матрицей модулей (ROLE_PERMISSIONS). */
export function resolveB2bWorkspaceRole(
  rbacRole: string,
  opts: { isRetailer: boolean; isBrand: boolean; isBuyer: boolean }
): B2BUserRole {
  if (opts.isBrand) return 'brand';
  if (opts.isBuyer) return 'buyer';
  if (rbacRole === 'distributor') return 'distributor';
  if (
    opts.isRetailer ||
    rbacRole === 'retailer' ||
    rbacRole === 'merchandiser' ||
    rbacRole === 'sales_rep'
  )
    return 'retailer';
  return 'retailer';
}

interface B2BWorkspaceModuleGridProps {
  primaryRole: B2BUserRole;
  className?: string;
  title?: string;
  lead?: string;
}

/**
 * Компактная сетка модулей B2B (вкладки × карточки) — перенос логики с бывшей страницы /shop/b2b.
 * Полноэкранная карта (`DigitalWorkplaceMap`) остаётся отдельно для глубокого UX.
 */
export function B2BWorkspaceModuleGrid({
  primaryRole,
  className,
  title = 'Модули B2B по направлению',
  lead = 'Матрица возможностей: фильтр по роли и переход в рабочий маршрут.',
}: B2BWorkspaceModuleGridProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('ops');

  const filteredItems = useMemo(() => {
    const allowed = ROLE_PERMISSIONS[primaryRole] || ROLE_PERMISSIONS.retailer;
    return WORKSPACE_ITEMS.filter((it) => it.tabId === activeTab && allowed.includes(it.id));
  }, [activeTab, primaryRole]);

  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-text-secondary mb-1 text-[11px] font-black uppercase tracking-[0.2em]">
          {title}
        </h2>
        <p className="text-text-primary text-sm">{lead}</p>
      </div>

      <nav className="border-border-default/60 bg-bg-surface2/80 flex flex-wrap gap-2 rounded-xl border p-2">
        {WORKSPACE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'rounded-xl px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide transition-all md:px-4 md:py-2.5 md:text-sm md:font-semibold md:normal-case',
              activeTab === tab.id
                ? 'border-border-default text-text-primary border bg-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/70'
            )}
          >
            <span className="line-clamp-2">{tab.label}</span>
          </button>
        ))}
      </nav>

      <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">
        {WORKSPACE_TABS.find((t) => t.id === activeTab)?.label ?? 'Модули'}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => {
          const href = WORKSPACE_ITEM_PATHS[item.id] ?? ROUTES.shop.b2bDiscover;
          return (
            <Link key={item.id} href={href} className="block h-full">
              <div className="border-border-default/80 group flex h-full min-h-[140px] flex-col rounded-xl border bg-white p-4 transition-all hover:border-rose-200 hover:shadow-md">
                <span className="text-text-muted text-[9px] font-bold uppercase tracking-widest">
                  {item.category}
                </span>
                <div className="mt-3 flex flex-1 flex-col justify-center text-center">
                  <div className="border-border-subtle bg-bg-surface2 text-text-secondary mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border transition-colors group-hover:border-rose-100 group-hover:bg-rose-50 group-hover:text-rose-600">
                    <Layers className="size-6" />
                  </div>
                  <h3 className="text-text-primary text-xs font-bold uppercase leading-tight tracking-tight group-hover:text-rose-600 md:text-sm">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary mt-2 line-clamp-3 text-[10px] font-medium normal-case leading-snug">
                    {item.description}
                  </p>
                </div>
                <div className="border-border-subtle mt-2 flex items-center justify-end border-t pt-3">
                  <ArrowUpRight className="text-text-muted size-4 transition-colors group-hover:text-rose-500" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <p className="border-border-default bg-bg-surface2 text-text-muted rounded-lg border border-dashed px-4 py-6 text-center text-sm">
          Нет модулей для этой вкладки в текущей роли. Переключите вкладку или организацию.
        </p>
      )}
    </section>
  );
}
