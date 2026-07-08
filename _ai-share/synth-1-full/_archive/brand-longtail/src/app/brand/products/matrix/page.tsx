'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { VariantMatrixEditor } from '@/components/brand/VariantMatrixEditor';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';

export default function VariantMatrixPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 pb-16">
      <B2bOrderUrlContextBanner variant="brand" className="rounded-xl" />
      <SectionInfoCard
        title="Variant Matrix"
        description="Размерные сетки, цвета и вариации SKU. Связи: Products (PIM), Production (Assortment), Inventory, Linesheets."
        icon={Layers}
        iconBg="bg-accent-primary/15"
        iconColor="text-accent-primary"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              SKU Variants
            </Badge>
            <Button variant="outline" size="sm" className="ml-1 h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.products}>Products</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.production}>Production</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.inventory}>Inventory</Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.b2bLinesheets}>Linesheets</Link>
            </Button>
          </>
        }
      />
      <header className="border-border-subtle flex flex-col justify-between gap-3 border-b pb-3 md:flex-row md:items-end">
        <div className="space-y-0.5">
          <div className="text-text-muted flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]">
            <Layers className="text-accent-primary h-3.5 w-3.5" />
            Fashion OS — Product Intelligence
          </div>
          <h1 className="text-text-primary text-sm font-bold uppercase leading-tight tracking-tight">
            Variant Matrix
          </h1>
          <p className="text-text-secondary text-[11px] font-medium">
            Управление размерными сетками, цветами и SKU в едином интерфейсе.
          </p>
        </div>
      </header>
      <div className="bg-transparent">
        <VariantMatrixEditor />
      </div>
    </CabinetPageContent>
  );
}
