'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Wand2 } from 'lucide-react';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { getRelatedLinks } from '@/lib/data/integration-modules';
import { RegistryPageHeader } from '@/components/design-system';

/** WizCommerce: WizStudio / AI-каталог — виртуальные съёмки без фотосессии. */
export default function BrandMarketingContentFactoryPage() {
  const links = getRelatedLinks('wiz-studio').map((l) => ({ label: l.label, href: l.href }));

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-6 pb-16 duration-700 animate-in fade-in"
    >
      <RegistryPageHeader
        title="WizStudio / AI-каталог"
        leadPlain="Виртуальные съёмки и контент без фотосессии. Генерация образов по flat-фото, фоны, lifestyle."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Camera className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <Badge variant="outline" className="text-[9px]">
              WizCommerce
            </Badge>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>AI-съёмка</CardTitle>
          <CardDescription>
            Загрузите flat-фото — получите lifestyle, модели, разные фоны.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-text-secondary flex items-center gap-2 text-sm">
            <Wand2 className="size-4" />
            <span>Без реальной фотосессии. Экономия времени и бюджета.</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.brand.aiTools}>AI Creator Studio</Link>
          </Button>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={links} title="Связанные модули" />
    </CabinetPageContent>
  );
}
