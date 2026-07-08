'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Shield,
  Store,
  ShoppingCart,
  User,
  Briefcase,
  Factory,
  Warehouse,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIdentitySwitch } from '@/hooks/use-identity-switch';
import { ROUTES } from '@/lib/routes';
import { CORE_CHAIN_ROLE_KEYS, isPlatformCoreMode } from '@/lib/cabinet-core-mode';

const roles = [
  {
    href: ROUTES.admin.home,
    icon: Shield,
    label: 'Администратор',
    email: 'admin@syntha.ai',
    roleKey: 'admin',
    orgId: 'org-hq-001',
  },
  {
    href: ROUTES.brand.profile,
    icon: Store,
    label: 'Бренд',
    email: 'brand@syntha.ai',
    roleKey: 'brand',
    orgId: 'org-brand-001',
  },
  {
    href: ROUTES.shop.home,
    icon: ShoppingCart,
    label: 'Магазин',
    email: 'shop@syntha.ai',
    roleKey: 'shop',
    orgId: 'org-shop-001',
  },
  {
    href: ROUTES.distributor.home,
    icon: Briefcase,
    label: 'Дистрибьютор',
    email: 'dist@syntha.ai',
    roleKey: 'distributor',
    orgId: 'org-dist-001',
  },
  {
    href: '/factory?role=manufacturer',
    icon: Factory,
    label: 'Производство',
    roleKey: 'manufacturer',
    email: 'factory@syntha.ai',
    orgId: 'org-factory-001',
  },
  {
    href: '/factory?role=supplier',
    icon: Warehouse,
    label: 'Поставщик',
    roleKey: 'supplier',
    email: 'supplier@syntha.ai',
    orgId: 'org-supplier-001',
  },
  {
    href: ROUTES.client.profile,
    icon: User,
    label: 'Клиент',
    email: 'elena.petrova@example.com',
    roleKey: 'client',
    orgId: 'org-client-001',
  },
] as const;

export default function RolePanel() {
  return (
    <Suspense fallback={null}>
      <RolePanelContent />
    </Suspense>
  );
}

function RolePanelContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRole = searchParams.get('role');
  const { handleIdentitySwitch } = useIdentitySwitch();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const runSwitch = async (role: (typeof roles)[number]) => {
    if (busyRef.current || loadingRole) return;
    busyRef.current = true;
    setLoadingRole(role.roleKey);
    try {
      await handleIdentitySwitch(role.email, role.roleKey, role.orgId);
    } catch (err) {
      console.error('RolePanel: Switch failed:', err);
    } finally {
      busyRef.current = false;
      setLoadingRole(null);
    }
  };

  const coreMode = isPlatformCoreMode();
  const visibleRoles = coreMode ? roles.filter((r) => CORE_CHAIN_ROLE_KEYS.has(r.roleKey)) : roles;

  const panel = (
    <aside
      className="fixed right-2 top-1/2 z-[10050] flex max-h-[min(560px,calc(100vh-6rem))] -translate-y-1/2 touch-manipulation select-none flex-col gap-2 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white/95 p-2.5 shadow-2xl backdrop-blur-md"
      aria-label="Демо: переключение роли"
    >
      <p className="text-text-muted px-0.5 text-center text-[8px] font-black uppercase leading-tight tracking-widest">
        {coreMode ? 'Цепочка' : 'Роли'}
      </p>
      {visibleRoles.map((role) => {
        const isActive =
          role.roleKey === 'manufacturer' || role.roleKey === 'supplier'
            ? pathname.startsWith('/factory') && currentRole === role.roleKey
            : pathname === role.href || (pathname.startsWith(role.href) && role.href !== '/');

        const isLoading = loadingRole === role.roleKey;

        return (
          <button
            key={role.roleKey}
            type="button"
            title={role.label}
            aria-label={role.label}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => void runSwitch(role)}
            disabled={loadingRole !== null}
            className={cn(
              'relative flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-xl border border-transparent transition-colors',
              isActive
                ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              loadingRole !== null && !isLoading && 'opacity-45'
            )}
          >
            {isLoading ? (
              <RefreshCcw className="h-5 w-5 animate-spin text-indigo-600" />
            ) : (
              <role.icon className="h-6 w-6" aria-hidden />
            )}
          </button>
        );
      })}
    </aside>
  );

  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(panel, document.body);
}
