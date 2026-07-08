'use client';

import dynamic from 'next/dynamic';

export const VendorLayoutShell = dynamic(
  () =>
    import('./VendorLayoutShell').then((m) => ({
      default: m.VendorLayoutShell,
    })),
  {
    loading: () => (
      <div className="bg-bg-canvas text-text-muted flex h-screen items-center justify-center text-xs font-medium uppercase tracking-widest">
        Загрузка…
      </div>
    ),
  }
);
