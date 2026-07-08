'use client';

import dynamic from 'next/dynamic';
import { cabinetHubLayout } from '@/lib/ui/cabinet-surface';

function AcademyLayoutSkeleton() {
  return (
    <div className={cabinetHubLayout.suspenseFallback} aria-busy aria-label="Загрузка академии" />
  );
}

/** brand-academy-data + KPI/tabs — отдельный chunk; layout.tsx остаётся лёгким. */
export const BrandAcademyLayoutShell = dynamic(
  () =>
    import('./BrandAcademyLayoutShell').then((m) => ({
      default: m.BrandAcademyLayoutShell,
    })),
  { loading: AcademyLayoutSkeleton }
);
