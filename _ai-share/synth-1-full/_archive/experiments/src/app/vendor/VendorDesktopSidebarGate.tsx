'use client';

import dynamic from 'next/dynamic';
import { CabinetDesktopOnly } from '@/components/layout/CabinetDesktopOnly';
import { VendorDesktopSidebarPlaceholder } from '@/app/vendor/VendorDesktopSidebar';

const VendorDesktopSidebar = dynamic(
  () =>
    import('./VendorDesktopSidebar').then((m) => ({
      default: m.VendorDesktopSidebar,
    })),
  { ssr: false, loading: VendorDesktopSidebarPlaceholder }
);

/** Vendor desktop sidebar — только ≥ lg. */
export function VendorDesktopSidebarGate() {
  return (
    <CabinetDesktopOnly>
      <VendorDesktopSidebar />
    </CabinetDesktopOnly>
  );
}
