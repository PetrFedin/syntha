'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loadBodyProfile, saveBodyProfile } from '@/lib/fashion/fit-match-logic';
import type { BodyProfileV1 } from '@/lib/fashion/types';
import { useToast } from '@/hooks/use-toast';
import { Ruler } from 'lucide-react';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function FitProfilePage() {
  const { toast } = useToast();
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    const p = loadBodyProfile();
    if (p) {
      setChest(String(p.chest || ''));
      setWaist(String(p.waist || ''));
      setHips(String(p.hips || ''));
      setHeight(String(p.height || ''));
    }
  }, []);

  const handleSave = () => {
    const profile: BodyProfileV1 = {
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      height: height ? parseFloat(height) : undefined,
    };
    saveBodyProfile(profile);
    toast({
      title: 'Профиль сохранён',
      description: 'Теперь на PDP будет отображаться процент соответствия размера.',
    });
  };

  return (
    <CabinetPageContent maxWidth="lg">
      <ClientCabinetSectionHeader />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Параметры тела</CardTitle>
          <CardDescription>
            Используются для расчета комфортной посадки (ease allowance).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chest">Обхват груди, см</Label>
              <Input
                id="chest"
                inputMode="decimal"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                placeholder="92"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waist">Обхват талии, см</Label>
              <Input
                id="waist"
                inputMode="decimal"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="74"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hips">Обхват бёдер, см</Label>
              <Input
                id="hips"
                inputMode="decimal"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Рост, см</Label>
              <Input
                id="height"
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="176"
              />
            </div>
          </div>
          <Button className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
            Сохранить профиль
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
        <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="text-xs leading-relaxed text-emerald-800">
          <p className="mb-1 font-semibold">Как мы считаем?</p>
          Мы берем физические замеры изделия (chest, waist, hips) и сравниваем их с вашими. Для
          комфортной носки мы закладываем "прибавку на свободу облегания" (2-8 см в зависимости от
          типа вещи).
        </div>
      </div>
    </CabinetPageContent>
  );
}
