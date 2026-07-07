'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, TrendingUp, Image, Video } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { getMarketingLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';

export default function TrendSentimentPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 pb-16">
      <SectionInfoCard
        title="Trend Sentiment Radar"
        description="Анализ соцсетей (TikTok, Instagram) для мгновенной корректировки дизайна в текущем цикле. Связь с Content Factory, Products, Production."
        icon={Megaphone}
        iconBg="bg-rose-100"
        iconColor="text-rose-600"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              TikTok
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              Instagram
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.cms}>Content</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Trend Sentiment Radar</h1>
      <Card className="rounded-xl border border-rose-100 bg-rose-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Радар трендов
          </CardTitle>
          <CardDescription>
            Мгновенная обратная связь из соцсетей для корректировки коллекции
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
              <Image className="h-10 w-10 text-rose-500" />
              <div>
                <p className="font-bold">Instagram</p>
                <p className="text-text-secondary text-[11px]">Охват, вовлечённость, топ-хэштеги</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
              <Video className="text-text-primary h-10 w-10" />
              <div>
                <p className="font-bold">TikTok</p>
                <p className="text-text-secondary text-[11px]">Virality, тренды, звуки</p>
              </div>
            </div>
          </div>
          <p className="text-text-muted mt-4 text-[10px]">Скоро: подключение API соцсетей</p>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={getMarketingLinks()} />
    </CabinetPageContent>
  );
}
