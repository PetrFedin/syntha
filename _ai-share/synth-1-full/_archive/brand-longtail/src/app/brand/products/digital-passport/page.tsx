'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe2, Leaf, ShieldCheck } from 'lucide-react';

export default function DigitalPassportPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 pb-16">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Цифровой паспорт</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Digital product passport with full traceability
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border-default">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-sky-600" />
              <CardTitle className="text-sm">Происхождение материалов</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-sm font-medium">Италия · Турция · РФ</p>
            <p className="text-text-secondary mt-1 text-[10px]">по SKU SS26-042</p>
          </CardContent>
        </Card>
        <Card className="border-border-default">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm">Углеродный след</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black tabular-nums">8.2 кг</p>
            <p className="text-text-secondary mt-1 text-[10px]">CO₂e на единицу (оценка)</p>
          </CardContent>
        </Card>
        <Card className="border-border-default sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-accent-primary h-4 w-4" />
              <CardTitle className="text-sm">Сертификаты</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary text-sm font-medium">OEKO-TEX · GRS</p>
            <p className="text-text-secondary mt-1 text-[10px]">действуют до 2027-06</p>
          </CardContent>
        </Card>
      </div>
    </CabinetPageContent>
  );
}
