'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

const SidebarWidget = dynamic(
  () =>
    import('@/components/brand/SidebarWidget').then((m) => ({
      default: m.SidebarWidget,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="border-border-subtle mx-2 mb-2 h-16 shrink-0 animate-pulse rounded-md bg-muted/30"
        aria-hidden
      />
    ),
  }
);

/** Notes/calendar widget в sidebar — только вне Platform Core (заметки → столп «Связь»). */
export function BrandSidebarWidgetGate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setMounted(true), { timeout: 3500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(() => setMounted(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (isPlatformCoreMode()) return null;
  if (!mounted) return null;
  return <SidebarWidget />;
}
