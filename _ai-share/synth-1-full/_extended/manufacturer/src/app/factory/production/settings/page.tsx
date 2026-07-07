'use client';

import React from 'react';
import {
  Settings,
  Activity,
  Layout,
  MessageSquare,
  ShieldCheck,
  Bell,
  Factory,
  Warehouse,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUIState } from '@/providers/ui-state';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';

export default function FactorySettingsPage() {
  const { pulseMode, setPulseMode } = useUIState();

  return (
    <div className="bg-bg-canvas space-y-6 duration-300 animate-in fade-in">
      <header className="space-y-2">
        <h1 className="text-text-primary text-sm font-black uppercase tracking-tighter">
          Настройки производства
        </h1>
        <p className="text-text-secondary max-w-2xl text-sm font-medium italic">
          Конфигурация уведомлений, прав доступа и параметров визуализации процессов.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Card className="border-border-subtle bg-bg-surface overflow-hidden rounded-xl border shadow-sm">
            <CardHeader className="bg-accent-primary text-text-inverse p-3 pb-4">
              <div className="flex items-center gap-3">
                <Activity className="text-text-inverse/80 h-6 w-6" />
                <div>
                  <CardTitle className="text-base font-black uppercase tracking-tight">
                    Системный Пульс (Live Pulse)
                  </CardTitle>
                  <CardDescription className="text-text-inverse/80 italic">
                    Настройте отображение активности смежных отделов и партнеров.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-10 p-3">
              <div className="bg-bg-surface2 border-border-subtle flex flex-col items-start justify-between gap-3 rounded-xl border p-4 md:flex-row md:items-center">
                <div className="space-y-2">
                  <Label className="text-text-primary text-[11px] font-black uppercase tracking-widest">
                    Формат уведомлений
                  </Label>
                  <p className="text-text-secondary max-w-xs text-xs font-medium leading-relaxed">
                    Для цеха рекомендуется «Бегущая строка», для офиса — «Всплывающие окна».
                  </p>
                </div>

                <Tabs
                  defaultValue={pulseMode}
                  value={pulseMode}
                  onValueChange={(val) => setPulseMode(val as any)}
                >
                  {/* cabinetSurface v1 */}
                  <TabsList className={cn(cabinetSurface.tabsList, 'w-fit flex-wrap')}>
                    <TabsTrigger
                      value="ticker"
                      className={cn(
                        cabinetSurface.tabsTrigger,
                        'data-[state=active]:text-accent-primary h-9 gap-2 px-5'
                      )}
                    >
                      <Layout className="h-3.5 w-3.5" /> Бегущая строка
                    </TabsTrigger>
                    <TabsTrigger
                      value="floating"
                      className={cn(
                        cabinetSurface.tabsTrigger,
                        'data-[state=active]:text-accent-primary h-9 gap-2 px-5'
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Всплывающие
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  {
                    icon: Bell,
                    title: 'Производственные алерты',
                    desc: 'Уведомления о поломках и задержках',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Контроль доступа',
                    desc: 'Управление правами технологов',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-bg-surface border-border-subtle flex cursor-pointer items-center gap-3 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="bg-bg-surface2 flex h-10 w-10 items-center justify-center rounded-xl">
                      <item.icon className="text-text-muted h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-text-primary text-[10px] font-black uppercase">
                        {item.title}
                      </p>
                      <p className="text-text-muted text-[9px] font-bold uppercase">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end p-3 pt-0">
              <Button className="bg-text-primary text-text-inverse h-10 rounded-2xl px-12 text-[10px] font-black uppercase tracking-widest shadow-xl transition-transform hover:scale-105">
                Сохранить изменения
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card className="border-border-subtle bg-text-primary text-text-inverse relative space-y-6 overflow-hidden rounded-xl border p-4 shadow-xl">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Factory className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <h4 className="text-base font-black uppercase tracking-tighter">IoT Станция</h4>
              <p className="text-text-muted text-xs font-medium leading-relaxed">
                Ваш терминал подключен к основным производственным линиям. Все события
                синхронизируются с Global Pulse.
              </p>
              <Button
                variant="outline"
                className="text-text-inverse hover:bg-bg-surface hover:text-text-primary h-12 w-full rounded-xl border-white/20 text-[9px] font-black uppercase tracking-widest"
              >
                Тест связи
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
