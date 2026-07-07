'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Map,
  CloudRain,
  Sun,
  Snowflake,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Info,
  ShoppingBag,
} from 'lucide-react';
import { getStoreWeatherImpact } from '@/lib/fashion/weather-impact';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function WeatherTrafficPage() {
  const data = getStoreWeatherImpact();

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 p-8 pb-24">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-sky-100 p-2 shadow-sm">
            <CloudRain className="h-6 w-6 text-sky-600" />
          </div>
          <h1 className="text-text-primary text-3xl font-bold uppercase tracking-tight tracking-tighter">
            Store Weather Correlation
          </h1>
        </div>
        <p className="font-medium text-muted-foreground">
          Анализ влияния погодных условий на трафик оффлайн-магазинов и рекомендации по
          ассортименту.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {data.map((item, idx) => {
          const isPositive = item.trafficImpact > 0;

          return (
            <Card
              key={idx}
              className="border-border-subtle group relative overflow-hidden border-2 p-6 shadow-sm transition-all hover:border-sky-100"
            >
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                {item.weatherCondition === 'rain' ? (
                  <CloudRain className="h-16 w-16 text-sky-600" />
                ) : (
                  <Snowflake className="h-16 w-16 text-blue-400" />
                )}
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                    {item.date}
                  </div>
                  <div className="text-text-primary mt-1 text-xl font-black">{item.storeId}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`flex items-center justify-end gap-1.5 text-2xl font-black uppercase ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-6 w-6" />
                    ) : (
                      <TrendingDown className="h-6 w-6" />
                    )}
                    {isPositive ? '+' : ''}
                    {item.trafficImpact}%
                  </div>
                  <div className="text-text-muted mt-1 text-[10px] font-black uppercase leading-none">
                    Traffic Impact
                  </div>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-4 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
                  <Thermometer className="h-5 w-5 text-sky-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-[10px] font-black uppercase leading-none text-sky-500">
                    Condition
                  </div>
                  <div className="text-sm font-bold capitalize text-sky-700">
                    {item.weatherCondition}
                  </div>
                </div>
              </div>

              <div className="border-border-subtle space-y-4 border-t pt-4">
                <div className="text-text-muted mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase">
                  <ShoppingBag className="h-3.5 w-3.5" /> Recommended Stock Push
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.recommendedStock.map((sku) => (
                    <Badge
                      key={sku}
                      variant="outline"
                      className="h-5 border-sky-200 bg-white text-[9px] font-bold uppercase text-sky-700 shadow-sm"
                    >
                      {sku}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-border-subtle text-text-muted mt-6 flex items-center gap-2 border-t pt-3 text-[9px] font-bold uppercase italic leading-none">
                <Info className="h-3 w-3" /> Met Office Integration Active • Local Ops v2.4
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-bg-surface2 border-border-default mt-8 flex flex-col items-center gap-6 rounded-2xl border p-6 shadow-md md:flex-row">
        <div className="border-border-default flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-md">
          <CloudRain className="h-7 w-7 text-sky-600" />
        </div>
        <div className="flex-1">
          <div className="text-text-muted mb-1 text-xs font-black uppercase tracking-tight">
            AI Weather Attribution
          </div>
          <div className="text-text-primary text-[14px] font-medium leading-tight tracking-tight">
            На основе прогноза погоды на ближайшие 48 часов в Москве (дождь), рекомендуется{' '}
            <b>увеличить фронтальную выкладку зонтов и дождевиков</b> в магазине MSK-CITY.
          </div>
        </div>
        <Button
          size="sm"
          className="bg-text-primary/90 hover:bg-text-primary/90 h-10 w-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg md:w-auto"
        >
          View Full Forecast
        </Button>
      </div>
    </CabinetPageContent>
  );
}
