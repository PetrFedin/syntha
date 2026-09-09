'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { RouteGuardGate } from '@/components/layout/RouteGuardGate';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { TooltipProvider } from '../ui/tooltip';
import { LeftSidebarNav } from './left-sidebar-nav';
import { OfflineBanner } from '@/components/brand/production/OfflineBanner';
import { RegisterServiceWorker } from '@/components/pwa/RegisterServiceWorker';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { RunwayAnalyticsGate } from '@/components/layout/RunwayAnalyticsGate';
import { RolePanelGate } from '@/components/layout/RolePanelGate';
import { shouldMountUIStateProvider } from '@/lib/layout/ui-state-route';
import { cn } from '@/lib/utils';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { isCabinetPathname } from '@/lib/layout/cabinet-route-match';
import { isInvestorBriefPathname } from '@/lib/investors/investor-brief-route';
import { CoreModeHeader } from '@/components/layout/core-mode-header';
import { PlatformCoreBootstrapBanner } from '@/components/platform/PlatformCoreBootstrapBanner';
import GlobalPodcastPlayer from './global-podcast-player';

const AiStylist = dynamic(() => import('@/components/ai-stylist'), { ssr: false });
const CartSheet = dynamic(() => import('@/components/layout/cart-sheet'), { ssr: false });
const WishlistSheet = dynamic(() => import('@/components/layout/wishlist-sheet'), { ssr: false });
const PreOrderSheet = dynamic(() => import('@/components/layout/pre-order-sheet'), { ssr: false });
const ComparisonPanel = dynamic(() => import('../comparison-panel'), { ssr: false });

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const platformCore = isPlatformCoreMode();
  const isCabinet = isCabinetPathname(pathname);
  const isPlatformHub = pathname === '/platform';
  const isInvestorBrief = isInvestorBriefPathname(pathname);
  const uiStateChrome = shouldMountUIStateProvider(pathname) && !platformCore;

  return (
    <ThemeProvider>
      <TooltipProvider>
        <RouteGuardGate>
          <RegisterServiceWorker />
          <RunwayAnalyticsGate />
          <div className="relative flex min-h-screen flex-col">
            {!isInvestorBrief ? <OfflineBanner /> : null}
            {uiStateChrome ? <GlobalPodcastPlayer /> : null}
            {/* Core: hub — минимальный header; кабинеты — свой chrome, без B2C nav. Investor brief — собственный presentation chrome. */}
            {platformCore ? (
              <>
                {!isCabinet ? <CoreModeHeader /> : null}
                <PlatformCoreBootstrapBanner />
              </>
            ) : isInvestorBrief ? null : (
              <Header />
            )}
            {/* Иначе fixed z-[100] перекрывает собственный сайдбар кабинета (бренд z-30) и «съедает» клики слева. */}
            {!isCabinet && !platformCore && !isInvestorBrief ? <LeftSidebarNav /> : null}
            <main
              className={cn('flex-1', isCabinet || isPlatformHub || isInvestorBrief ? '' : 'pb-32')}
            >
              {children}
            </main>
            {!isCabinet && !platformCore && !isInvestorBrief ? <Footer /> : null}
            {uiStateChrome ? <CartSheet /> : null}
            {uiStateChrome ? <WishlistSheet /> : null}
            {uiStateChrome ? <PreOrderSheet /> : null}
            {uiStateChrome ? <AiStylist /> : null}
            {uiStateChrome ? <ComparisonPanel /> : null}
            {!isInvestorBrief ? <RolePanelGate /> : null}
            <Toaster />
          </div>
        </RouteGuardGate>
      </TooltipProvider>
    </ThemeProvider>
  );
}
