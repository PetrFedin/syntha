'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Video,
  Settings,
  Upload,
  Link as LinkIcon,
  PlusCircle,
  Trash2,
  GripVertical,
  FileText,
  ChevronRight,
  BarChart2,
  Mic,
  Radio,
  BookCopy,
  MessageSquare,
  Hand,
  ThumbsUp,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  Clock,
  PlayCircle,
  Eye,
  ShoppingCart,
  Users,
  Tv,
  Share2,
  Instagram,
  Send as SendIcon,
  MapPin,
  File,
  Shield,
  MicOff,
  Image as ImageIcon,
  TrendingUp,
  Zap,
  Globe,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { products } from '@/lib/products';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import LivePlayer from '@/components/live-player';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  LiveStreamAnalyticsDialog,
  AudienceRetentionDialog,
  PromotionDialog,
} from '@/components/brand';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrandDAM } from '@/components/brand/BrandDAM';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { RegistryPageHeader } from '@/components/design-system';

const ContentHubContent = dynamic(
  () => import('@/app/brand/content-hub/page').then((m) => m.default),
  { ssr: false, loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div> }
);
const CmsContent = dynamic(() => import('@/app/brand/cms/page').then((m) => m.default), {
  ssr: false,
  loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div>,
});
const BlogContent = dynamic(() => import('@/app/brand/blog/page').then((m) => m.default), {
  ssr: false,
  loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div>,
});
const LiveContent = dynamic(() => import('@/app/brand/live/page').then((m) => m.default), {
  ssr: false,
  loading: () => <div className="text-text-muted p-8 text-center">Загрузка...</div>,
});

export default function BrandMediaPage() {
  const [streamType, setStreamType] = useState<string>('show');
  const [isCommentsEnabled, setIsCommentsEnabled] = useState(true);
  const [publicationDate, setPublicationDate] = useState<Date>();
  const [tab, setTab] = useState('media');
  const [activeTab, setActiveTab] = useState('dam');
  const [isPreviewPlayerOpen, setIsPreviewPlayerOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isRetentionAnalyticsOpen, setIsRetentionAnalyticsOpen] = useState(false);
  const [initialMetric, setInitialMetric] = useState<'views' | 'reactions' | 'comments' | 'cart'>(
    'views'
  );
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);

  const { toast } = useToast();
  const mockLiveEvent = PlaceHolderImages.find((img) => img.id.startsWith('live-'));

  const handleStartStream = () => {
    toast({
      title: 'Трансляция запущена (симуляция)',
      description: 'Ваш прямой эфир начался и виден пользователям.',
    });
  };

  return (
    <TooltipProvider>
      <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
        <RegistryPageHeader
          title="Медиа и контент"
          leadPlain="DAM, контент-хаб, CMS, блог и live: единая медиа-поверхность бренда."
        />
        <div className="space-y-4 duration-700 animate-in fade-in">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            {/* cabinetSurface v1 */}
            <TabsList className={cn(cabinetSurface.tabsList, 'flex-wrap')}>
              <TabsTrigger value="media" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
                Медиа и DAM
              </TabsTrigger>
              <TabsTrigger
                value="content-hub"
                className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}
              >
                Контент-хаб
              </TabsTrigger>
              <TabsTrigger value="cms" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
                CMS
              </TabsTrigger>
              <TabsTrigger value="blog" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
                Блог
              </TabsTrigger>
              <TabsTrigger value="live" className={cn(cabinetSurface.tabsTrigger, 'h-7 gap-1.5')}>
                Live
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="media"
              className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
            >
              <Tabs defaultValue="dam" onValueChange={setActiveTab} className="w-full">
                {/* cabinetSurface v1 */}
                <TabsList className={cn(cabinetSurface.tabsList, 'mb-8 flex-wrap')}>
                  <TabsTrigger value="dam" className={cn(cabinetSurface.tabsTrigger, 'min-h-9')}>
                    Brand DAM
                  </TabsTrigger>
                  <TabsTrigger
                    value="streams"
                    className={cn(cabinetSurface.tabsTrigger, 'min-h-9')}
                  >
                    Трансляции
                  </TabsTrigger>
                  <TabsTrigger value="videos" className={cn(cabinetSurface.tabsTrigger, 'min-h-9')}>
                    AI-Видео
                  </TabsTrigger>
                  <TabsTrigger
                    value="digital_hub"
                    className={cn(cabinetSurface.tabsTrigger, 'min-h-9')}
                  >
                    Digital Hub
                  </TabsTrigger>
                  <TabsTrigger
                    value="archive"
                    className={cn(cabinetSurface.tabsTrigger, 'min-h-9')}
                  >
                    Архив
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dam" className={cabinetSurface.cabinetProfileTabPanel}>
                  <BrandDAM />
                </TabsContent>

                <TabsContent value="streams" className={cabinetSurface.cabinetProfileTabPanel}>
                  <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <Card className="border-border-subtle overflow-hidden rounded-xl shadow-sm">
                        <CardHeader className="p-4 pb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base font-black uppercase tracking-tight">
                                Настройки прямого эфира
                              </CardTitle>
                              <CardDescription className="mt-1 text-xs font-medium">
                                Подключитесь к нашему стриминговому сервису или используйте внешний
                                RTMP-сервер.
                              </CardDescription>
                            </div>
                            <Button
                              onClick={() => setIsPromotionDialogOpen(true)}
                              variant="outline"
                              className="border-border-default rounded-xl text-[10px] font-black uppercase"
                            >
                              <TrendingUp className="mr-2 h-3.5 w-3.5" /> Продвигать эфир
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6 p-4 pt-0">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                                Название трансляции
                              </Label>
                              <Input
                                className="h-12 rounded-xl text-sm font-bold"
                                placeholder="Презентация новой коллекции SS26"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                                Описание
                              </Label>
                              <Textarea
                                className="min-h-[100px] resize-none rounded-xl text-sm font-medium"
                                placeholder="Краткое описание вашего эфира..."
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                                Дата и время начала
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={'outline'}
                                    className="border-border-default h-12 w-full justify-start rounded-xl text-left font-bold"
                                  >
                                    <CalendarIcon className="text-accent-primary mr-2 h-4 w-4" />
                                    {publicationDate ? (
                                      format(publicationDate, 'd MMMM yyyy, HH:mm', { locale: ru })
                                    ) : (
                                      <span>Выберите дату и время</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={publicationDate}
                                    onSelect={setPublicationDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                                Место проведения
                              </Label>
                              <Input
                                className="h-12 rounded-xl text-sm font-bold"
                                placeholder="Напр., Студия Syntha, Москва"
                              />
                            </div>
                          </div>

                          <Button
                            onClick={handleStartStream}
                            className="bg-accent-primary hover:bg-accent-primary shadow-accent-primary/10 h-12 w-full rounded-xl text-[11px] font-black uppercase text-white shadow-lg"
                          >
                            Начать трансляцию <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4 lg:col-span-1">
                      <Card className="border-border-subtle overflow-hidden rounded-xl shadow-sm">
                        <CardHeader className="p-4 pb-4">
                          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                            <div className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                            </div>
                            Live Studio
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-4 pt-0">
                          <div className="bg-bg-surface2 border-border-default hover:bg-bg-surface2 group relative flex aspect-[9/16] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors">
                            <div className="space-y-2 text-center">
                              <Video className="text-text-muted group-hover:text-accent-primary mx-auto h-10 w-10 transition-colors" />
                              <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                                Превью камеры
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="bg-bg-surface2 flex items-center justify-between rounded-2xl p-3">
                              <div className="flex items-center gap-2">
                                <div className="border-border-subtle flex h-8 w-8 items-center justify-center rounded-full border bg-white">
                                  <Mic className="text-text-secondary h-4 w-4" />
                                </div>
                                <Label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                                  Микрофон
                                </Label>
                              </div>
                              <Switch />
                            </div>
                            <div className="bg-bg-surface2 flex items-center justify-between rounded-2xl p-3">
                              <div className="flex items-center gap-2">
                                <div className="border-border-subtle flex h-8 w-8 items-center justify-center rounded-full border bg-white">
                                  <MessageSquare className="text-text-secondary h-4 w-4" />
                                </div>
                                <Label className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                                  Чат
                                </Label>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          </div>

                          <Button className="bg-text-primary h-12 w-full rounded-xl text-[10px] font-black uppercase text-white hover:bg-black">
                            <Tv className="mr-2 h-4 w-4" /> Предпросмотр
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className={cabinetSurface.cabinetProfileTabPanel}>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Card className="border-border-subtle bg-accent-primary group relative cursor-pointer overflow-hidden rounded-xl text-white shadow-sm">
                      <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                        <Zap className="h-32 w-32" />
                      </div>
                      <CardContent className="space-y-4 p-4">
                        <Badge className="border-none bg-white/20 text-[9px] font-black uppercase text-white">
                          New AI Feature
                        </Badge>
                        <h3 className="text-sm font-black uppercase tracking-tighter">
                          AI Lookbook (Video)
                        </h3>
                        <p className="text-accent-primary/30 text-xs font-medium leading-relaxed">
                          Генерация 15-секундных Reels и TikTok проходок с цифровыми моделями на
                          основе ваших 3D-лекал.
                        </p>
                        <Button className="text-accent-primary hover:bg-accent-primary/10 h-10 w-full rounded-xl bg-white text-[10px] font-black uppercase">
                          Сгенерировать видео
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-border-subtle bg-bg-surface2 hover:border-accent-primary/30 group relative cursor-pointer overflow-hidden rounded-xl shadow-sm transition-colors">
                      <CardContent className="space-y-4 p-4">
                        <Badge
                          variant="outline"
                          className="border-border-default text-text-secondary text-[9px] font-black uppercase"
                        >
                          Static Content
                        </Badge>
                        <h3 className="text-text-primary text-sm font-black uppercase tracking-tighter">
                          Standard Lookbook
                        </h3>
                        <p className="text-text-secondary text-xs font-medium leading-relaxed">
                          Генерация высококачественных студийных фото на различных фонах для
                          E-commerce.
                        </p>
                        <Button
                          variant="outline"
                          className="border-border-default text-text-primary h-10 w-full rounded-xl bg-white text-[10px] font-black uppercase"
                        >
                          Создать фотосет
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="digital_hub" className={cabinetSurface.cabinetProfileTabPanel}>
                  <div className="space-y-6">
                    <Card className="border-border-subtle overflow-hidden rounded-xl bg-white shadow-sm">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="bg-accent-primary/10 text-accent-primary flex h-20 w-20 items-center justify-center rounded-xl">
                          <Globe className="h-10 w-10" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge className="bg-accent-primary/15 text-accent-primary border-none text-[8px] font-black uppercase">
                              Enterprise Sync
                            </Badge>
                            <span className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                              Universal API
                            </span>
                          </div>
                          <h3 className="text-base font-black uppercase tracking-tight">
                            Universal Retail API
                          </h3>
                          <p className="text-text-secondary mt-1 text-xs font-medium">
                            Мгновенная синхронизация с Shopify, SAP, NetSuite и 1C ритейлеров.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-border-default h-12 rounded-xl px-6 text-[10px] font-black uppercase"
                        >
                          Управление ключами
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-border-subtle bg-text-primary overflow-hidden rounded-xl text-white shadow-sm">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
                          <Layers className="h-10 w-10" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge className="border-none bg-emerald-50 text-[8px] font-black uppercase text-white">
                              Scale Up
                            </Badge>
                            <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                              Platform-as-a-Service
                            </span>
                          </div>
                          <h3 className="text-base font-black uppercase tracking-tight">
                            White-label Client Portals
                          </h3>
                          <p className="text-text-muted mt-1 text-xs font-medium">
                            Запуск собственной версии Syntha для ваших суб-брендов или закрытых
                            групп за 5 минут.
                          </p>
                        </div>
                        <Button className="hover:bg-bg-surface2 h-12 rounded-xl bg-white px-6 text-[10px] font-black uppercase text-black">
                          Создать портал
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent
              value="content-hub"
              className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}
            >
              {tab === 'content-hub' && <ContentHubContent />}
            </TabsContent>
            <TabsContent value="cms" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
              {tab === 'cms' && <CmsContent />}
            </TabsContent>
            <TabsContent value="blog" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
              {tab === 'blog' && <BlogContent />}
            </TabsContent>
            <TabsContent value="live" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-4')}>
              {tab === 'live' && <LiveContent />}
            </TabsContent>
          </Tabs>
        </div>
      </CabinetPageContent>

      <LiveStreamAnalyticsDialog
        isOpen={isAnalyticsOpen}
        onOpenChange={setIsAnalyticsOpen}
        initialMetric={initialMetric}
      />

      <AudienceRetentionDialog
        open={isRetentionAnalyticsOpen}
        onOpenChange={setIsRetentionAnalyticsOpen}
      />

      {mockLiveEvent && (
        <LivePlayer
          event={mockLiveEvent}
          isOpen={isPreviewPlayerOpen}
          onOpenChange={setIsPreviewPlayerOpen}
          isLive={true}
        />
      )}
      <PromotionDialog
        isOpen={isPromotionDialogOpen}
        onOpenChange={setIsPromotionDialogOpen}
        initialType="live_shopping_event"
        initialName="Продвижение прямого эфира"
      />
    </TooltipProvider>
  );
}
