'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Ruler, Scan, CheckCircle, Smartphone } from 'lucide-react';
import { bodyScanClient } from '@/lib/ai-client/api';
import { BodyMeasurements } from '@/lib/types/client';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';

/**
 * AI Body Scanner UI
 * Пошаговый интерфейс замера тела для клиента.
 */

export default function BodyScannerPage() {
  const [step, setStep] = useState<'intro' | 'setup' | 'photo' | 'processing' | 'result'>('intro');
  const [height, setHeight] = useState<number>(175);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [results, setResults] = useState<BodyMeasurements | null>(null);

  const startScan = async () => {
    setStep('processing');
    try {
      // Имитация передачи фото
      const scanData = await bodyScanClient({
        userId: 'client-123',
        height,
        unit,
        frontImageUrl: 'base64_placeholder',
      });
      setResults(scanData);
      setStep('result');
    } catch (error) {
      console.error('Scan failed:', error);
      setStep('setup');
    }
  };

  return (
    <CabinetPageContent maxWidth="lg" className="space-y-6 pb-16">
      <ClientCabinetSectionHeader />

      {step === 'intro' && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-primary" />
              Как это работает?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Установите телефон</p>
                  <p className="text-xs text-muted-foreground">
                    Поставьте телефон вертикально на уровне пояса.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Ruler className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Укажите ваш рост</p>
                  <p className="text-xs text-muted-foreground">
                    Это необходимо для калибровки точности замера.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Camera className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Сделайте фото</p>
                  <p className="text-xs text-muted-foreground">
                    Одно фото в полный рост (спереди) и одно (сбоку).
                  </p>
                </div>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => setStep('setup')}>
              Начать замер
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle>Параметры калибровки</CardTitle>
            <CardDescription>Укажите ваш реальный рост для точности AI-модели.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ваш рост ({unit})</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  placeholder="Напр. 175"
                />
                <Button variant="outline" onClick={() => setUnit(unit === 'cm' ? 'in' : 'cm')}>
                  {unit}
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep('photo')}>
              Далее: Камера
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'photo' && (
        <div className="space-y-4">
          <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-muted">
            <div className="space-y-4 p-4 text-center">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">Разместите себя в рамке</p>
              <div className="mx-auto h-64 w-48 rounded-full border-2 border-white/50 opacity-30"></div>
            </div>
          </div>
          <Button className="size-lg h-12 w-full rounded-full" onClick={startScan}>
            СДЕЛАТЬ ФОТО И АНАЛИЗИРОВАТЬ
          </Button>
        </div>
      )}

      {step === 'processing' && (
        <Card className="py-12 text-center">
          <CardContent className="space-y-6">
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <Scan className="absolute inset-0 m-auto h-10 w-10 animate-pulse text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold">Искусственный интеллект работает...</h3>
              <p className="text-sm text-muted-foreground">
                Оцифровываем пропорции тела и создаем 3D-модель.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'result' && results && (
        <Card className="border-2 border-green-500/20">
          <CardHeader className="border-b pb-4 text-center">
            <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
            <CardTitle>Замер завершен!</CardTitle>
            <CardDescription>Ваши данные сохранены в профиле Synth-1</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-y border-b">
              <div className="p-4 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Грудь</p>
                <p className="text-base font-bold">
                  {results.chest.toFixed(1)} <span className="text-xs font-normal">{unit}</span>
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Талия</p>
                <p className="text-base font-bold">
                  {results.waist.toFixed(1)} <span className="text-xs font-normal">{unit}</span>
                </p>
              </div>
              <div className="border-t-0 p-4 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Бедра</p>
                <p className="text-base font-bold">
                  {results.hips.toFixed(1)} <span className="text-xs font-normal">{unit}</span>
                </p>
              </div>
            </div>
            <div className="space-y-4 p-4">
              <div className="space-y-2 rounded-xl bg-primary/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Рекомендованный размер (Zara)
                </p>
                <p className="text-sm font-black text-primary">M (Regular Fit)</p>
                <p className="text-[10px] italic text-muted-foreground">
                  На основе сравнения с базой размеров Zara и Mango.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setStep('intro')}>
                Повторить замер
              </Button>
              <Button className="w-full">Перейти в Маркетрум</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </CabinetPageContent>
  );
}
