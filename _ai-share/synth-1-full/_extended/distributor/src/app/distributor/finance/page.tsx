'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
export default function DistributorFinancePage() {
  return (
    <CabinetPageContent
      maxWidth="full"
      className="flex min-h-[60vh] flex-col items-center justify-center space-y-4"
    >
      <h1 className="text-sm font-black uppercase tracking-tighter">Финансовый модуль</h1>
      <p className="text-text-muted font-medium">
        Раздел находится в разработке. Здесь будет управление дебиторской задолженностью дилеров и
        автоматизация взаиморасчетов.
      </p>
    </CabinetPageContent>
  );
}
