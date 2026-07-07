'use client';

import { useState } from 'react';
import Link from 'next/link';
import PromotionsPage from '@/app/admin/promotions/page';
import { Button } from '@/components/ui/button';
import { PromotionDialog } from '@/components/brand/promotion-dialog';
import { Badge } from '@/components/ui/badge';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';
import { PlusCircle, Megaphone, Package } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { ROUTES } from '@/lib/routes';

export default function BrandPromotionsPage() {
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <SectionInfoCard
          title="Продвижение"
          description={
            <>
              Кампании, скидки, акции. <AcronymWithTooltip abbr="ROI" /> и конверсия. Связь с
              Products, Analytics и B2C.
            </>
          }
          icon={Megaphone}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          badges={
            <>
              <Badge variant="outline" className="text-[9px]">
                Products
              </Badge>
              <Badge variant="outline" className="text-[9px]">
                Analytics
              </Badge>
              <Button variant="outline" size="sm" className="ml-1 h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.products}>
                  <Package className="mr-1 h-3 w-3" /> Products
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.analytics}>Analytics</Link>
              </Button>
            </>
          }
        />
        <div className="flex items-center justify-between">
          <header>
            <h1 className="font-headline text-base font-bold">Управление продвижением</h1>
            <p className="text-muted-foreground">
              Создавайте кампании и отслеживайте их эффективность.
            </p>
          </header>
          <Button onClick={() => setIsPromotionDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать продвижение
          </Button>
        </div>
        <PromotionsPage />
      </div>
      <PromotionDialog isOpen={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen} />
    </>
  );
}
