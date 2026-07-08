'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { products } from '@/lib/products';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

const productOptions = products.map((p) => ({
  value: p.id,
  label: `${p.name} (${p.sku})`,
}));

export default function CreateKickstarterPage() {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [campaignName, setCampaignName] = useState('');

  const canProceed = selectedProductId && campaignName;

  const handleCreate = () => {
    const query = new URLSearchParams({
      productId: selectedProductId || '',
      name: campaignName,
    });

    router.push(`/brand/kickstarter/new/edit?${query.toString()}`);
  };

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Новая кампания"
        leadPlain="Создайте кампанию по сбору предзаказов на новый товар."
        eyebrow={
          <Button variant="outline" size="icon" asChild>
            <Link href={ROUTES.brand.kickstarter} aria-label="Назад к кампаниям">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Шаг 1: Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="space-y-2">
            <Label htmlFor="product">Товар</Label>
            <Combobox
              options={productOptions}
              value={selectedProductId}
              onChange={(v) => setSelectedProductId(v as string)}
              placeholder="Выберите товар из каталога..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Название кампании</Label>
            <Input
              id="name"
              placeholder="Например, Предзаказ Куртки-трансформера"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreate} disabled={!canProceed}>
            Создать и перейти к настройкам <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </CabinetPageContent>
  );
}
