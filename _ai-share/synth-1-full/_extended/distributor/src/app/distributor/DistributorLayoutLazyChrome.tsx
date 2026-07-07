'use client';

import dynamic from 'next/dynamic';
import { Briefcase } from 'lucide-react';

export { Briefcase as DistributorHubIcon };

function SidebarSkeleton() {
  return <div className="mx-3 my-4 h-24 animate-pulse rounded-md bg-muted/40" aria-hidden />;
}

export const DistributorLayoutSidebarPanel = dynamic(
  () =>
    import('./DistributorLayoutSidebarPanel').then((m) => ({
      default: m.DistributorLayoutSidebarPanel,
    })),
  { ssr: false, loading: SidebarSkeleton }
);

export const DistributorMobileSidebarSheet = dynamic(
  () =>
    import('./DistributorMobileSidebarSheet').then((m) => ({
      default: m.DistributorMobileSidebarSheet,
    })),
  { ssr: false }
);
