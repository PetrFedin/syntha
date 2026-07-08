'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  Building2,
  ChevronRight,
  Download,
  Globe,
  ImageIcon,
  Lock,
  Mail,
  Newspaper,
  Palette,
  Phone,
  Send,
  Sparkles,
  Store,
  UserPlus,
  Users,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { TabsContent } from '@/components/ui/tabs';
import {
  MediaAssetsViewer,
  type AssetTypeId,
  type MediaAssetItem,
} from '@/components/brand/MediaAssetsViewer';
import { useToast } from '@/hooks/use-toast';
import { exportBrandProfilePDF } from '@/lib/brand-profile-export-utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import type { Brand } from '@/lib/types';

export type BrandProfilePresskitTabProps = {
  brand: Brand;
  isEditing: boolean;
  tabPanelClassName: string;
  pressKitAssets: Record<AssetTypeId, MediaAssetItem[]>;
  setPressKitAssets: Dispatch<SetStateAction<Record<AssetTypeId, MediaAssetItem[]>>>;
  mediaViewerOpen: boolean;
  setMediaViewerOpen: Dispatch<SetStateAction<boolean>>;
  mediaViewerType: AssetTypeId | null;
  setMediaViewerType: Dispatch<SetStateAction<AssetTypeId | null>>;
  pressKitAutoArchiveDays: number;
  setPressKitAutoArchiveDays: Dispatch<SetStateAction<number>>;
};

const PRESSKIT_ASSET_ROWS: {
  id: AssetTypeId;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  usage: readonly ('public' | 'internal' | 'catalog' | 'individual')[];
}[] = [
  {
    id: 'brand-identity',
    title: 'Айдентика',
    desc: 'Логотипы, цвета, шрифты',
    icon: Palette,
    color: 'bg-accent-soft text-accent-primary',
    usage: ['public', 'catalog'],
  },
  {
    id: 'lookbooks',
    title: 'Лукбуки',
    desc: 'Коллекции SS26 и FW25',
    icon: ImageIcon,
    color: 'bg-state-success/10 text-state-success',
    usage: ['public', 'internal', 'catalog', 'individual'],
  },
  {
    id: 'press-releases',
    title: 'Пресс-релизы',
    desc: 'Новости бренда',
    icon: Newspaper,
    color: 'bg-amber-50 text-amber-600',
    usage: ['public', 'internal'],
  },
  {
    id: 'brand-video',
    title: 'Видео бренда',
    desc: 'Манифест и показы',
    icon: Video,
    color: 'bg-state-error/10 text-state-error',
    usage: ['public', 'catalog'],
  },
  {
    id: 'team-bios',
    title: 'О команде',
    desc: 'Профили руководства',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
    usage: ['internal', 'individual'],
  },
  {
    id: 'store-photos',
    title: 'Фото магазинов',
    desc: 'Торговые пространства',
    icon: Building2,
    color: 'bg-accent-primary/10 text-accent-primary',
    usage: ['catalog', 'internal', 'individual'],
  },
];

export function BrandProfilePresskitTab({
  brand,
  isEditing,
  tabPanelClassName,
  pressKitAssets,
  setPressKitAssets,
  mediaViewerOpen,
  setMediaViewerOpen,
  mediaViewerType,
  setMediaViewerType,
  pressKitAutoArchiveDays,
  setPressKitAutoArchiveDays,
}: BrandProfilePresskitTabProps) {
  const { toast } = useToast();

  return (
    <TabsContent value="presskit" className={tabPanelClassName}>
      <div className="border-border-subtle space-y-1 border-b pb-4">
        <h2 className="text-text-primary text-base font-semibold">Press Kit и медиа</h2>
        <p className="text-text-secondary text-sm">
          Материалы для витрины, каталога и партнёров; рассылки и выгрузки.
        </p>
      </div>
      <div className="border-border-default flex flex-wrap items-center gap-2 rounded-xl border bg-muted/30 p-3">
        <span className="text-text-secondary text-sm font-medium">Инструменты:</span>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-border-default h-9 gap-1.5 rounded-lg text-xs font-medium"
        >
          <Link href={ROUTES.brand.media}>
            <ImageIcon className="size-3.5" /> DAM-активы
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-border-default h-9 gap-1.5 rounded-lg text-xs font-medium"
        >
          <Link href={ROUTES.brand.marketingContentFactory}>
            <Sparkles className="size-3.5" /> Content Factory
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-border-default h-9 gap-1.5 rounded-lg text-xs font-medium"
        >
          <Link href={ROUTES.brand.aiTools}>
            <Bot className="size-3.5" /> AI Creator
          </Link>
        </Button>
      </div>
      <div className="space-y-4">
        <div className="border-border-subtle flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h3 className="text-text-primary text-sm font-semibold">Медиа-материалы</h3>
            <p className="text-text-secondary max-w-xl text-sm">
              Назначение: публичная витрина, каталог, работа с партнёрами. Рассылки приходят в
              профили партнёров.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 rounded-lg text-xs font-medium"
              onClick={() =>
                toast({
                  title: 'Переслать партнёру',
                  description: 'Выберите партнёра для отправки материалов',
                })
              }
            >
              <Send className="size-3.5" /> Переслать партнёру
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 rounded-lg text-xs font-medium"
              onClick={() =>
                toast({
                  title: 'Рассылка всем',
                  description: 'Уведомление отправлено всем партнёрам (магазины, дистрибуторы)',
                })
              }
            >
              <UserPlus className="size-3.5" /> Всем партнёрам
            </Button>
            <Button
              size="sm"
              className="bg-text-primary hover:bg-accent-primary h-9 gap-2 rounded-lg px-3 text-xs font-medium text-white shadow-sm"
              onClick={() => {
                exportBrandProfilePDF();
                toast({
                  title: 'Brand Book',
                  description: 'Используйте печать для сохранения PDF',
                });
              }}
            >
              <Download className="size-3.5" /> Brand Book PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-2 rounded-lg text-xs font-medium"
              onClick={() => toast({ title: 'Press Kit', description: 'Полный архив — DAM' })}
            >
              <Download className="size-3.5" /> Полный Press Kit
            </Button>
          </div>
        </div>

        <div className="border-border-default bg-bg-surface2 text-text-secondary flex flex-wrap gap-x-4 gap-y-2 rounded-lg border p-3 text-xs">
          <span className="text-text-primary font-semibold">Назначение:</span>
          <span className="flex items-center gap-1">
            <Globe className="text-state-success size-3" /> Публичное — Live
          </span>
          <span className="flex items-center gap-1">
            <Lock className="size-3 text-amber-600" /> Внутреннее — дистрибуторы, магазины
          </span>
          <span className="flex items-center gap-1">
            <Store className="text-accent-primary size-3" /> Каталог, шоурум
          </span>
          <span className="flex items-center gap-1">
            <UserPlus className="text-text-secondary size-3" /> Индивидуально — настройки по
            партнёру
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PRESSKIT_ASSET_ROWS.map((asset) => {
            const items = pressKitAssets[asset.id] || [];
            const activeCount = items.filter((i) => !i.archived).length;
            const archivedCount = items.filter((i) => i.archived).length;
            return (
              <Card
                key={asset.id}
                className="border-border-default hover:border-accent-soft group flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md md:p-5"
                onClick={() => {
                  setMediaViewerType(asset.id);
                  setMediaViewerOpen(true);
                }}
              >
                <div
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-lg border shadow-inner transition-transform group-hover:scale-105',
                    asset.color,
                    asset.color.replace('text-', 'border-').replace('50', '100')
                  )}
                >
                  <asset.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h4 className="text-text-primary truncate text-base font-semibold tracking-tight">
                      {asset.title}
                    </h4>
                    <span className="text-text-secondary shrink-0 text-xs font-medium">
                      {activeCount} активн.
                      {archivedCount > 0 ? ` · ${archivedCount} в архиве` : ''}
                    </span>
                  </div>
                  <p className="text-text-secondary mb-2 truncate text-sm">{asset.desc}</p>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {asset.usage.includes('public') && (
                      <Badge
                        variant="outline"
                        className={cn(
                          cabinetSurface.badgeMetaRow,
                          'border-state-success/30 bg-state-success/10 text-state-success'
                        )}
                      >
                        <Globe className="mr-0.5 size-3" /> Live
                      </Badge>
                    )}
                    {asset.usage.includes('internal') && (
                      <Badge
                        variant="outline"
                        className={cn(
                          cabinetSurface.badgeMetaRow,
                          'border-amber-200 bg-amber-50 text-amber-900'
                        )}
                      >
                        <Lock className="mr-0.5 size-3" /> Внутр.
                      </Badge>
                    )}
                    {asset.usage.includes('catalog') && (
                      <Badge
                        variant="outline"
                        className={cn(
                          cabinetSurface.badgeMetaRow,
                          'border-accent-soft bg-accent-soft text-accent-hover'
                        )}
                      >
                        <Store className="mr-0.5 size-3" /> Каталог
                      </Badge>
                    )}
                    {asset.usage.includes('individual') && (
                      <Badge
                        variant="outline"
                        className={cn(
                          cabinetSurface.badgeMetaRow,
                          'border-border-default bg-bg-surface2 text-text-secondary'
                        )}
                      >
                        <UserPlus className="mr-0.5 size-3" /> Индив.
                      </Badge>
                    )}
                  </div>
                  <span className="text-accent-primary group-hover:text-accent-hover inline-flex items-center gap-1 text-xs font-medium">
                    Открыть <ChevronRight className="size-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
        <MediaAssetsViewer
          open={mediaViewerOpen}
          onOpenChange={setMediaViewerOpen}
          assetTypeId={mediaViewerType}
          items={mediaViewerType ? pressKitAssets[mediaViewerType] || [] : []}
          onItemsChange={(typeId, newItems) =>
            setPressKitAssets((prev) => ({ ...prev, [typeId]: newItems }))
          }
          autoArchiveDays={pressKitAutoArchiveDays}
          onAutoArchiveDaysChange={setPressKitAutoArchiveDays}
        />
      </div>

      <div className="mt-8 space-y-3">
        <div className="border-border-subtle border-b pb-3">
          <h3 className="text-text-primary text-sm font-semibold">История бренда</h3>
        </div>
        <Card className="border-border-default from-bg-surface2 to-accent-soft rounded-xl border bg-gradient-to-br p-4 shadow-sm md:p-5">
          <div className="space-y-4">
            {isEditing ? (
              <Textarea
                defaultValue="Syntha — российский бренд технологичной одежды, основанный в 2022 году. Мы создаем функциональный гардероб для жизни в мегаполисе, объединяя традиционное мастерство с инновационными материалами. Наша философия — Cyber-Heritage."
                className="border-border-default text-text-secondary min-h-[100px] rounded-lg bg-white p-3 text-sm font-medium"
              />
            ) : (
              <p className="text-text-secondary text-sm font-medium italic leading-relaxed">
                {`"Syntha — российский бренд технологичной одежды, основанный в 2022 году. Мы создаем функциональный гардероб для жизни в мегаполисе, объединяя традиционное мастерство с инновационными материалами. Наша философия — Cyber-Heritage."`}
              </p>
            )}

            <div className="border-border-default/60 grid grid-cols-2 gap-3 border-t pt-4 md:grid-cols-4">
              {[
                { label: 'Основан', value: brand.foundedYear },
                { label: 'Страна', value: brand.countryOfOrigin },
                {
                  label: 'Подписчиков',
                  value: `${((brand.followers || 0) / 1000).toFixed(1)}K`,
                },
                { label: 'Категория', value: 'Luxury Tech' },
              ].map((stat, i) => (
                <div key={i} className="space-y-0.5">
                  <p className="text-text-secondary text-xs font-medium">{stat.label}</p>
                  <p className="text-text-primary text-sm font-semibold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-border-default/60 flex flex-wrap gap-3 border-t pt-4">
              <div className="border-border-default flex items-center gap-2 rounded-lg border bg-white p-2 px-3 shadow-sm">
                <Mail className="text-accent-primary size-3.5" />
                <span className="text-text-primary text-sm font-medium">press@syntha.ru</span>
              </div>
              <div className="border-border-default flex items-center gap-2 rounded-lg border bg-white p-2 px-3 shadow-sm">
                <Phone className="text-accent-primary size-3.5" />
                <span className="text-text-primary text-sm font-medium">+7 (495) 123-45-67</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
