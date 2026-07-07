'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, Target, Ruler } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

function BodyScannerMetricsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-border-subtle rounded-xl border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
            <Scan className="text-accent-primary h-4 w-4" />
            Scans completed
          </CardTitle>
          <CardDescription className="text-xs">Завершённых сканов</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text-primary text-2xl font-black">—</p>
        </CardContent>
      </Card>
      <Card className="border-border-subtle rounded-xl border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
            <Target className="h-4 w-4 text-emerald-600" />
            Accuracy rate
          </CardTitle>
          <CardDescription className="text-xs">Точность модели</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text-primary text-2xl font-black">—</p>
        </CardContent>
      </Card>
      <Card className="border-border-subtle rounded-xl border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
            <Ruler className="h-4 w-4 text-amber-600" />
            Size recommendations generated
          </CardTitle>
          <CardDescription className="text-xs">Рекомендаций размера</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text-primary text-2xl font-black">—</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BodyScannerPage() {
  const pathname = usePathname() ?? '';
  const embeddedInAiDesignHub = pathname === '/brand/ai-design' || pathname === '/brand/ai-design/';

  if (embeddedInAiDesignHub) {
    return (
      <div className="space-y-4">
        <BodyScannerMetricsGrid />
      </div>
    );
  }

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="AI Сканер тела"
        leadPlain="3D-сканирование и рекомендации размеров на основе измерений."
      />
      <BodyScannerMetricsGrid />
    </CabinetPageContent>
  );
}
