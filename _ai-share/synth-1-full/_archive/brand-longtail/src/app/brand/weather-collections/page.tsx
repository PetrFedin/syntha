'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { CloudRain, Thermometer, Sun, Target, Package } from 'lucide-react';
import { getProductLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';

export default function WeatherCollectionsPage() {
  const [weather, setWeather] = useState<{
    temperature: number;
    precipitation: number;
    weatherCode: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/weather')
      .then((r) => r.json())
      .then((d: unknown) => {
        setWeather(d as { temperature: number; precipitation: number; weatherCode: number });
        setLoading(false);
      })
      .catch(() => {
        setWeather({ temperature: 15, precipitation: 0, weatherCode: 0 });
        setLoading(false);
      });
  }, []);

  const temp = weather?.temperature ?? 15;
  const rain = weather?.precipitation ?? 0;
  const isCold = temp < 10;
  const isWarm = temp >= 18;
  const isRainy = rain > 0.5;

  const recommendations = [
    {
      when: isCold,
      text: 'Усилить верхнюю одежду и тёплый трикотаж в дропе',
      category: 'Outerwear',
    },
    {
      when: isWarm && !isRainy,
      text: 'Добавить лёгкие ткани, шорты, футболки',
      category: 'Lightwear',
    },
    { when: isRainy, text: 'Акцент на водозащитные ткани и аксессуары', category: 'Rain-ready' },
    { when: true, text: 'Базовый ассортимент Core сохранять в каждом дропе', category: 'Core' },
  ].filter((r) => r.when);

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 pb-16">
      <SectionInfoCard
        title="Weather-Driven Collections"
        description="Рекомендации по наполнению дропа на основе прогноза погоды и сезонности. Связь с Range Planner и ассортиментом."
        icon={CloudRain}
        iconBg="bg-sky-100"
        iconColor="text-sky-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              AI
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.rangePlanner}>
                <Target className="mr-1 h-3 w-3" /> Range Planner
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.products}>Products</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Weather-Driven Collections</h1>

      <Card className="border-border-default rounded-xl border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" /> Текущая погода (Москва)
          </CardTitle>
          <CardDescription>
            Прогноз используется для рекомендаций по ассортименту дропа
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-text-secondary text-sm">Загрузка...</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              <div className="bg-bg-surface2 border-border-default flex items-center gap-3 rounded-xl border p-4">
                <Thermometer className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-text-secondary text-[10px] font-bold uppercase">Температура</p>
                  <p className="text-2xl font-black">{temp} °C</p>
                </div>
              </div>
              <div className="bg-bg-surface2 border-border-default flex items-center gap-3 rounded-xl border p-4">
                <CloudRain className="h-8 w-8 text-sky-500" />
                <div>
                  <p className="text-text-secondary text-[10px] font-bold uppercase">Осадки</p>
                  <p className="text-2xl font-black">{rain} mm</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <Sun className="h-8 w-8 text-sky-600" />
                <div>
                  <p className="text-text-secondary text-[10px] font-bold uppercase">
                    Рекомендация
                  </p>
                  <p className="text-sm font-bold">
                    {isCold ? 'Холодно' : isWarm ? 'Тепло' : 'Умеренно'}
                    {isRainy ? ' · Дождь' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-sky-200 bg-sky-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Рекомендации по дропу
          </CardTitle>
          <CardDescription>Наполнение коллекции с учётом погоды и сезонности</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li
                key={i}
                className="border-border-default flex items-center gap-3 rounded-lg border bg-white p-3"
              >
                <Badge variant="outline" className="shrink-0 text-[9px]">
                  {r.category}
                </Badge>
                <span className="text-sm">{r.text}</span>
              </li>
            ))}
          </ul>
          <p className="text-text-secondary mt-3 text-[10px]">
            Данные погоды: Open-Meteo API. Интегрируйте с Range Planner для автоматического
            пересчёта долей Core/Trend/Novelty.
          </p>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={getProductLinks()} />
    </CabinetPageContent>
  );
}
