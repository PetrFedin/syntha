'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Share2,
  Instagram,
  MessageCircle,
  Video,
  Radio,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Upload,
  Globe,
} from 'lucide-react';
import { getMarketingLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';

const SOCIAL_CHANNELS = [
  {
    id: 'telegram',
    name: 'Telegram',
    icon: MessageCircle,
    status: 'inactive',
    desc: 'Канал, группа, бот',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    status: 'inactive',
    desc: 'Посты, Reels, Stories',
  },
  { id: 'vk', name: 'VK', icon: Share2, status: 'inactive', desc: 'ВКонтакте, группы' },
  {
    id: 'max',
    name: 'Max (сайт бренда)',
    icon: Globe,
    status: 'inactive',
    desc: 'Синхронизация контента',
  },
];

export default function ContentHubPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Content Hub"
        leadPlain="Синхронизация с Telegram, Instagram, VK, сайтом бренда. Видео, стримы, подкасты, блог, фото коллекций и репосты в Stories платформы."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Share2 className="size-6 shrink-0 text-muted-foreground" aria-hidden />
            <Badge variant="outline" className="text-[9px]">
              TG
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              IG
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              VK
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.media}>Media</Link>
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="social" className="space-y-6">
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'flex-wrap')}>
          <TabsTrigger value="social" className={cn(cabinetSurface.tabsTrigger, 'h-8')}>
            Синк с соцсетями
          </TabsTrigger>
          <TabsTrigger value="video" className={cn(cabinetSurface.tabsTrigger, 'h-8')}>
            Видео и стримы
          </TabsTrigger>
          <TabsTrigger value="blog" className={cn(cabinetSurface.tabsTrigger, 'h-8')}>
            Блог и статьи
          </TabsTrigger>
          <TabsTrigger value="photos" className={cn(cabinetSurface.tabsTrigger, 'h-8')}>
            Фото и репосты
          </TabsTrigger>
        </TabsList>

        <TabsContent value="social" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="border-accent-primary/20 rounded-xl border">
            <CardHeader>
              <CardTitle>Подключение каналов</CardTitle>
              <CardDescription>
                Синхронизация контента с Telegram, Instagram, VK, сайтом бренда (Max)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {SOCIAL_CHANNELS.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center justify-between rounded-xl border bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <ch.icon className="text-text-secondary h-8 w-8" />
                      <div>
                        <p className="font-bold">{ch.name}</p>
                        <p className="text-text-secondary text-[11px]">{ch.desc}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Подключить
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className={cabinetSurface.cabinetProfileTabPanel}>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" /> Загрузка видео
                </CardTitle>
                <CardDescription>Загрузите видео для каталога, Lookbook</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" /> Загрузить
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" /> Онлайн-трансляции
                </CardTitle>
                <CardDescription>Стримы от бренда</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.brand.media}>Настроить</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5" /> Подкасты
                </CardTitle>
                <CardDescription>Аудио-контент бренда</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  Добавить
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blog" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Статьи, новости, блог
              </CardTitle>
              <CardDescription>Публикации и ведение блога бренда</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" /> Создать публикацию
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className={cabinetSurface.cabinetProfileTabPanel}>
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" /> Фото коллекций и репосты
              </CardTitle>
              <CardDescription>
                Загрузка фотографий коллекций. Репост контента из соцсетей и в соцсети. Дублирование
                в Stories на платформе.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" /> Загрузить фото
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Репост из соцсетей
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" /> Опубликовать в Stories
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RelatedModulesBlock links={getMarketingLinks()} />
    </CabinetPageContent>
  );
}
