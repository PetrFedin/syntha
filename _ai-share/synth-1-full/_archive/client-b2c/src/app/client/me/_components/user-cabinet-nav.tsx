import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { ChevronRight } from 'lucide-react';

/** Единая крошка для экранов блока `/client/me/*` (вне главного таб-профиля). */
export function UserCabinetBreadcrumb({ current }: { current: string }) {
  return (
    <div className="text-text-muted flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
      <Link href="/" className="hover:text-accent-primary transition-colors">
        Аккаунт
      </Link>
      <ChevronRight className="h-2.5 w-2.5" />
      <Link href={ROUTES.client.profile} className="hover:text-accent-primary transition-colors">
        Профиль
      </Link>
      <ChevronRight className="h-2.5 w-2.5" />
      <span className="text-accent-primary">{current}</span>
    </div>
  );
}
