'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { MapPin } from 'lucide-react';

export default function DistributorShowroomsPage() {
  return (
    <CabinetPageContent
      maxWidth="full"
      className="flex min-h-[60vh] flex-col items-center justify-center space-y-4"
    >
      <div className="bg-bg-surface2 flex h-12 w-12 items-center justify-center rounded-2xl">
        <MapPin className="text-text-muted h-8 w-8" />
      </div>
      <h1 className="text-sm font-black uppercase tracking-tighter">Региональные шоурумы</h1>
      <p className="text-text-muted max-w-md text-center font-medium">
        Раздел находится в разработке. Здесь будет поиск и управление физическими площадками для
        презентации коллекций в регионах.
      </p>
    </CabinetPageContent>
  );
}
