'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, FileText, Grid3X3, Share2, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

type B2bRepMobileShellProps = {
  repId: string;
  demoCampaignId?: string;
  onShareUrl?: (url: string | null) => void;
  onSampleMessage?: (msg: string | null) => void;
  children: React.ReactNode;
};

const REP_NAV = [
  { href: ROUTES.shop.b2bSalesRepPortal ?? '/shop/b2b/sales-rep-portal', label: 'Портал', icon: Store },
  { href: '/shop/b2b/showroom?collection=SS27', label: 'Шоурум', icon: Grid3X3 },
  { href: ROUTES.shop.b2bOrders ?? '/shop/b2b/orders', label: 'Заказы', icon: FileText },
  { href: ROUTES.shop.b2bVipRoomBooking ?? '/shop/b2b/vip-room-booking', label: 'Встречи', icon: Calendar },
] as const;

/**
 * Wave 43: mobile-first shell для sales rep — bottom nav + share/sample hooks.
 */
export function B2bRepMobileShell({
  repId,
  demoCampaignId,
  onShareUrl,
  onSampleMessage,
  children,
}: B2bRepMobileShellProps) {
  const pathname = usePathname() ?? '';

  const createShareLink = async () => {
    if (!demoCampaignId) return;
    try {
      const res = await fetch(
        `/api/shop/b2b/rep/share-link?campaignId=${encodeURIComponent(demoCampaignId)}&repId=${encodeURIComponent(repId)}`
      );
      const json = (await res.json()) as { shareUrl?: string };
      onShareUrl?.(json.shareUrl ?? null);
    } catch {
      onShareUrl?.(null);
    }
  };

  const queueSample = () => {
    onSampleMessage?.(`Sample queued for ${repId}`);
  };

  return (
    <div className="pb-20" data-testid="b2b-rep-mobile-shell">
      <div className="mb-3 flex flex-wrap gap-2 px-1 md:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase"
          onClick={() => void createShareLink()}
        >
          <Share2 className="h-3 w-3" />
          Share
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase"
          onClick={queueSample}
        >
          Sample
        </button>
      </div>
      {children}
      <nav
        className="bg-bg-surface/95 fixed inset-x-0 bottom-0 z-40 flex justify-around border-t p-2 md:hidden"
        aria-label="Rep mobile navigation"
        data-testid="b2b-rep-mobile-bottom-nav"
      >
        {REP_NAV.map((item) => {
          const active = pathname === item.href.split('?')[0];
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[9px] font-bold uppercase',
                active ? 'text-primary' : 'text-text-secondary'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
