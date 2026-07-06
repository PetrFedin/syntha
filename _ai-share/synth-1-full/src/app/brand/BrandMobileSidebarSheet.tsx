'use client';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { BrandLayoutSidebarPanel } from '@/app/brand/BrandLayoutSidebarPanel';
import { SidebarOrgHeader } from '@/components/brand/SidebarOrgHeader';
import { BrandSidebarWidgetGate } from '@/app/brand/BrandSidebarWidgetGate';
import type { PlatformRole } from '@/lib/rbac';
import type { Resource, Action } from '@/lib/rbac';

type BrandMobileSidebarSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: PlatformRole;
  can: (resource: Resource, action: Action) => boolean;
};

/** Мобильное меню brand hub — chunk грузится при первом открытии Sheet. */
export function BrandMobileSidebarSheet({
  open,
  onOpenChange,
  role,
  can,
}: BrandMobileSidebarSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
        <div className="shrink-0 pb-0 pt-12">
          <SidebarOrgHeader />
        </div>
        <div className="border-border-subtle shrink-0 border-b px-3 pb-2">
          <SheetTitle className="text-text-muted text-[9px] font-black uppercase tracking-widest">
            Навигация
          </SheetTitle>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <BrandLayoutSidebarPanel role={role} can={can} onNavigate={() => onOpenChange(false)} />
        </div>
        <BrandSidebarWidgetGate />
      </SheetContent>
    </Sheet>
  );
}
