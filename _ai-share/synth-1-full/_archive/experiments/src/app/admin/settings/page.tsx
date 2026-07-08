'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUIState } from '@/providers/ui-state';
import { Activity, MessageSquare, Layout } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';

const features = {
  homepage: [
    { id: 'stories', label: 'Истории (Stories)', default: true },
    { id: 'weeklyLooks', label: 'Образы недели', default: true },
    { id: 'liveShopping', label: 'Прямые эфиры', default: true },
    { id: 'sustainabilityBanner', label: 'Баннер "Осознанный выбор"', default: true },
  ],
  productPage: [
    { id: 'priceComparison', label: 'Сравнение цен', default: true },
    { id: 'communityLooks', label: '"Как носят другие"', default: true },
    { id: 'similarProducts', label: 'AI-поиск похожих', default: true },
    { id: 'arTryOn', label: 'AR-примерка', default: true },
    { id: '3dViewer', label: '3D-просмотр товара', default: true },
  ],
  global: [
    { id: 'aiStylist', label: 'AI Стилист (чат-бот)', default: true },
    { id: 'comparisonPanel', label: 'Панель сравнения товаров', default: true },
    { id: 'loyaltyProgram', label: 'Программа лояльности', default: true },
  ],
  brandDashboard: [
    { id: 'abTesting', label: 'A/B Тестирование', default: true },
    { id: 'campaignGenerator', label: 'AI-генератор кампаний', default: true },
    { id: 'collaborationInsights', label: 'AI-аналитика коллабораций', default: true },
    { id: 'digitalCollectibles', label: 'Создатель цифровых коллекций (NFT)', default: true },
  ],
};

type FeatureFlags = Record<string, Record<string, boolean>>;

const getDefaultFlags = (): FeatureFlags => {
  const defaults: FeatureFlags = {};
  Object.entries(features).forEach(([groupKey, groupFeatures]) => {
    defaults[groupKey] = {};
    groupFeatures.forEach((feature) => {
      defaults[groupKey][feature.id] = feature.default;
    });
  });
  return defaults;
};

export default function AdminSettingsPage() {
  const { pulseMode, setPulseMode } = useUIState();
  const [flags, setFlags] = useState<FeatureFlags>(getDefaultFlags());
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleFlagChange = (group: string, featureId: string, checked: boolean) => {
    setFlags((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [featureId]: checked,
      },
    }));
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Настройки сохранены',
        description: 'Отображение функций на сайте обновлено.',
      });
      console.log('Saved flags:', flags);
    }, 1500);
  };

  return (
    <CabinetPageContent maxWidth="full" className="bg-bg-canvas space-y-4">
      <header>
        <h1 className="text-text-primary font-headline text-base font-bold">
          Настройки доступности (Feature Flags)
        </h1>
        <p className="text-muted-foreground">
          Включайте и выключайте разделы и функции приложения для всех пользователей.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Главная страница</CardTitle>
            <CardDescription>Управление блоками на главной странице.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.homepage.map((feature) => (
              <div
                key={feature.id}
                className="border-border-subtle bg-bg-surface flex items-center justify-between rounded-md border p-3"
              >
                <Label htmlFor={`flag-${feature.id}`}>{feature.label}</Label>
                <Switch
                  id={`flag-${feature.id}`}
                  checked={flags.homepage?.[feature.id] ?? false}
                  onCheckedChange={(checked) => handleFlagChange('homepage', feature.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Страница товара</CardTitle>
            <CardDescription>Управление виджетами и блоками на странице товара.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.productPage.map((feature) => (
              <div
                key={feature.id}
                className="border-border-subtle bg-bg-surface flex items-center justify-between rounded-md border p-3"
              >
                <Label htmlFor={`flag-${feature.id}`}>{feature.label}</Label>
                <Switch
                  id={`flag-${feature.id}`}
                  checked={flags.productPage?.[feature.id] ?? false}
                  onCheckedChange={(checked) =>
                    handleFlagChange('productPage', feature.id, checked)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Глобальные функции</CardTitle>
            <CardDescription>Включение и выключение общесайтовых функций.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.global.map((feature) => (
              <div
                key={feature.id}
                className="border-border-subtle bg-bg-surface flex items-center justify-between rounded-md border p-3"
              >
                <Label htmlFor={`flag-${feature.id}`}>{feature.label}</Label>
                <Switch
                  id={`flag-${feature.id}`}
                  checked={flags.global?.[feature.id] ?? false}
                  onCheckedChange={(checked) => handleFlagChange('global', feature.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Инструменты бренда</CardTitle>
            <CardDescription>
              Управление доступом к AI-инструментам в кабинете бренда.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.brandDashboard.map((feature) => (
              <div
                key={feature.id}
                className="border-border-subtle bg-bg-surface flex items-center justify-between rounded-md border p-3"
              >
                <Label htmlFor={`flag-${feature.id}`}>{feature.label}</Label>
                <Switch
                  id={`flag-${feature.id}`}
                  checked={flags.brandDashboard?.[feature.id] ?? false}
                  onCheckedChange={(checked) =>
                    handleFlagChange('brandDashboard', feature.id, checked)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-subtle overflow-hidden rounded-xl shadow-xl">
        <CardHeader className="bg-text-primary text-text-inverse p-4">
          <div className="flex items-center gap-3">
            <Activity className="text-accent-primary h-6 w-6" />
            <div>
              <CardTitle className="text-base font-black uppercase tracking-tight">
                Интерфейс Syntha OS
              </CardTitle>
              <CardDescription className="text-text-muted">
                Настройка отображения системных событий (Pulse Engine).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
            <div className="space-y-1">
              <Label className="text-text-primary text-sm font-black uppercase tracking-widest">
                Режим уведомлений Live Pulse
              </Label>
              <p className="text-text-secondary text-xs font-medium">
                Выберите формат отображения активности экосистемы.
              </p>
            </div>

            <Tabs
              defaultValue={pulseMode}
              value={pulseMode}
              onValueChange={(val) => setPulseMode(val as any)}
              className="w-full md:w-auto"
            >
              {/* cabinetSurface v1 */}
              <TabsList className={cn(cabinetSurface.tabsList, 'h-auto w-full md:w-auto')}>
                <TabsTrigger
                  value="ticker"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'px-6 py-2 text-[10px] font-black uppercase'
                  )}
                >
                  <Layout className="h-3.5 w-3.5" /> Бегущая строка
                </TabsTrigger>
                <TabsTrigger
                  value="floating"
                  className={cn(
                    cabinetSurface.tabsTrigger,
                    'px-6 py-2 text-[10px] font-black uppercase'
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Всплывающие
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-8">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Сохранить изменения
        </Button>
      </div>
    </CabinetPageContent>
  );
}
