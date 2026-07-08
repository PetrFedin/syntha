'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Footwear360PairingModule } from '@/components/footwear/footwear-360-pairing-module';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { DEMO_FOOTWEAR_BUNDLE, DEMO_PAIRING_PRESETS } from '@/lib/footwear-viewer/demo-bundle';
import { ROUTES } from '@/lib/routes';
import { Footprints } from 'lucide-react';

/**
 * Обувь: 360° ракурсы (в т.ч. подошва / верх / сбоку), опция GLB после 3D-скана,
 * пресеты сочетания с джинсами, брюками, спортом и т.д.
 */
export default function BrandFootwear360Page() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 pb-16">
      <SectionInfoCard
        title="Обувь: 360° и контексты носки"
        description="Многоракурсные кадры и круговой просмотр, заготовка под GLB из 3D-скана. Блок «с чем носить» — тип низа, материал и цвет для витрины и B2B."
        icon={Footprints}
        iconBg="bg-amber-100"
        iconColor="text-amber-800"
        badges={
          <Badge variant="outline" className="text-[9px]">
            PIM · DAM
          </Badge>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.brand.products}>← Каталог (PIM)</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.productsDigitalTwinTesting}>Digital twin testing</Link>
        </Button>
      </div>
      <Footwear360PairingModule
        bundle={DEMO_FOOTWEAR_BUNDLE}
        pairingPresets={DEMO_PAIRING_PRESETS}
      />
    </CabinetPageContent>
  );
}
