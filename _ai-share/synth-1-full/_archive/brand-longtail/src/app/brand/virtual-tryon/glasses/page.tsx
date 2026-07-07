'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { Glasses } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const GlassesVirtualTryOn = dynamic(
  () =>
    import('@/components/virtual-tryon/glasses-virtual-try-on').then((m) => m.GlassesVirtualTryOn),
  {
    ssr: false,
    loading: () => <p className="py-8 text-sm text-muted-foreground">Загрузка модуля примерки…</p>,
  }
);

/**
 * Опция для брендов очков: примерка по лицу (MediaPipe Face Landmarker + слой оправы).
 * Query: ?frame=https://…/oprawa.png — подставить оправу SKU.
 */
export default function BrandGlassesVirtualTryOnPage() {
  const [frameUrl, setFrameUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    setFrameUrl(new URLSearchParams(window.location.search).get('frame')?.trim() || undefined);
  }, []);

  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6 pb-16 duration-500 animate-in fade-in">
      <SectionInfoCard
        title="Виртуальная примерка очков"
        description="Камера или фото лица: оправа масштабируется по межзрачковому расстоянию и наклону головы. Расчёт в браузере; лица на ваш бэкенд не отправляются."
        icon={Glasses}
        iconBg="bg-sky-100"
        iconColor="text-sky-700"
        badges={
          <Badge variant="outline" className="text-[9px]">
            Опция eyewear
          </Badge>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Примерка</CardTitle>
          <CardDescription>
            Укажите URL PNG/WebP оправы с прозрачным фоном или используйте демо. Для встраивания в
            витрину передайте <code className="rounded bg-muted px-1 text-xs">?frame=</code> или
            prop <code className="rounded bg-muted px-1 text-xs">initialGlassesUrl</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlassesVirtualTryOn initialGlassesUrl={frameUrl} />
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Примерка одежды (полноценный try-on) по-прежнему через{' '}
        <code className="rounded bg-muted px-1 text-xs">POST /ai/virtual-tryon</code> — отдельный
        сценарий с opentryon/GPU.
      </p>
      <p className="text-sm">
        <Link
          href={ROUTES.brand.marketingSamples}
          className="text-primary underline-offset-4 hover:underline"
        >
          ← Образцы и маркетинг
        </Link>
      </p>
    </CabinetPageContent>
  );
}
