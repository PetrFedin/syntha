'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import {
  Save,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  Lock,
  Globe,
  Users,
  FileText,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Info,
  Sparkles,
  Box,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RegistryPageHeader } from '@/components/design-system';

import { ROUTES } from '@/lib/routes';

export default function CreateLinesheetPage() {
  const router = useRouter();
  const [name, setName] = useState('Основная коллекция FW24');
  const [description, setDescription] = useState(
    'Ключевые образы и коммерческие хиты сезона Осень-Зима 2024.'
  );
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [moqEnabled, setMoqEnabled] = useState(true);
  const [layoutStrategy, setLayoutStrategy] = useState<'ai' | 'commercial' | 'story'>('ai');

  const handleCreateAndEdit = () => {
    const linesheetId = 'ls-fw24';
    router.push(`/brand/b2b/linesheets/${linesheetId}`);
  };

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="New Linesheet"
        leadPlain="Создайте персональную выборку для ваших байеров."
        eyebrow={
          <Button
            variant="outline"
            size="icon"
            className="border-border-default rounded-xl"
            asChild
          >
            <Link href={ROUTES.brand.b2bLinesheets} aria-label="Назад к лайншитам">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <Card className="mx-auto max-w-2xl overflow-hidden rounded-xl border-none bg-white shadow-sm">
        <CardHeader className="bg-bg-surface2 border-border-subtle flex flex-row items-center justify-between border-b p-4">
          <CardTitle className="text-text-muted flex items-center gap-2 text-sm font-black uppercase tracking-widest">
            <FileText className="h-4 w-4" /> Основная информация
          </CardTitle>
          <Badge className="bg-accent-primary h-5 px-3 text-[8px] font-black uppercase tracking-widest text-white">
            Шаг 1 из 3
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-text-muted ml-1 text-[10px] font-black uppercase tracking-widest"
              >
                Название лайншита
              </Label>
              <Input
                id="name"
                className="border-border-subtle h-12 rounded-xl text-sm font-bold"
                placeholder="Например, Предзаказ FW25"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-text-muted ml-1 text-[10px] font-black uppercase tracking-widest"
              >
                Описание для байера
              </Label>
              <Textarea
                id="description"
                className="border-border-subtle min-h-[100px] resize-none rounded-2xl text-sm font-medium"
                placeholder="Краткое описание коллекции или эксклюзивных условий."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="border-border-subtle space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-text-muted ml-1 text-[10px] font-black uppercase tracking-widest">
                Коммерческие правила & MOQ
              </Label>
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-600">
                <ShieldCheck className="h-3 w-3" /> Авто-контроль активен
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="bg-bg-surface2 border-border-subtle space-y-4 rounded-[1.5rem] border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary text-[10px] font-black uppercase">
                    Минимальный заказ
                  </span>
                  <Checkbox
                    checked={moqEnabled}
                    onCheckedChange={(checked) => setMoqEnabled(!!checked)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      defaultValue="250000"
                      className="border-border-default h-10 rounded-xl pl-4 pr-10 text-xs font-black"
                    />
                    <span className="text-text-muted absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase">
                      ₽
                    </span>
                  </div>
                  <span className="text-text-muted text-[8px] font-bold uppercase">Per order</span>
                </div>
              </div>
              <div className="bg-accent-primary/10 border-accent-primary/20 space-y-4 rounded-[1.5rem] border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-accent-primary text-[10px] font-black uppercase">
                    Pack Buy Mode
                  </span>
                  <Zap className="text-accent-primary h-3.5 w-3.5" />
                </div>
                <p className="text-text-secondary text-[9px] font-bold uppercase italic leading-tight">
                  Байер обязан заказывать полными размерными сетками (Packs).
                </p>
                <Button
                  variant="outline"
                  className="border-accent-primary/30 text-accent-primary h-8 w-full rounded-lg text-[9px] font-black uppercase"
                >
                  Настроить сетки
                </Button>
              </div>
            </div>
          </div>

          <div className="border-border-subtle space-y-4 border-t pt-4">
            <Label className="text-text-muted ml-1 text-[10px] font-black uppercase tracking-widest">
              Стратегия развески (Merchandising)
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'ai',
                  label: 'AI Optimized',
                  icon: Sparkles,
                  color: 'text-accent-primary',
                  bg: 'bg-accent-primary/10',
                },
                {
                  id: 'commercial',
                  label: 'Commercial',
                  icon: Box,
                  color: 'text-text-primary',
                  bg: 'bg-bg-surface2',
                },
                {
                  id: 'story',
                  label: 'Storytelling',
                  icon: LayoutGrid,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                },
              ].map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setLayoutStrategy(strategy.id as any)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all',
                    layoutStrategy === strategy.id
                      ? 'border-text-primary -translate-y-1 bg-white shadow-lg'
                      : 'border-border-subtle bg-bg-surface2/80 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                  )}
                >
                  <strategy.icon className={cn('h-5 w-5', strategy.color)} />
                  <span className="text-center text-[9px] font-black uppercase">
                    {strategy.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="bg-accent-primary flex items-center gap-3 rounded-xl p-3">
              <Info className="h-4 w-4 text-white" />
              <p className="text-[9px] font-bold uppercase italic leading-tight text-white/90">
                AI проанализирует историю продаж байера и выстроит товары в лайншите для
                максимизации чека.
              </p>
            </div>
          </div>

          <div className="border-border-subtle space-y-4 border-t pt-4">
            <Label className="text-text-muted ml-1 text-[10px] font-black uppercase tracking-widest">
              Уровень доступа (Visibility)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setVisibility('public')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all',
                  visibility === 'public'
                    ? 'border-accent-primary bg-accent-primary/10'
                    : 'border-border-subtle bg-bg-surface2/80 opacity-60 grayscale'
                )}
              >
                <Globe
                  className={cn(
                    'h-6 w-6',
                    visibility === 'public' ? 'text-accent-primary' : 'text-text-muted'
                  )}
                />
                <span className="text-[10px] font-black uppercase">Public (Все партнеры)</span>
              </button>
              <button
                onClick={() => setVisibility('private')}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all',
                  visibility === 'private'
                    ? 'border-amber-600 bg-amber-50/50'
                    : 'border-border-subtle bg-bg-surface2/80 opacity-60 grayscale'
                )}
              >
                <Lock
                  className={cn(
                    'h-6 w-6',
                    visibility === 'private' ? 'text-amber-600' : 'text-text-muted'
                  )}
                />
                <span className="text-[10px] font-black uppercase">Private (Выбранные)</span>
              </button>
            </div>
          </div>

          {visibility === 'private' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <Label className="text-text-muted ml-1 text-[10px] font-black uppercase tracking-widest">
                Выберите получателей
              </Label>
              <div className="bg-bg-surface2 border-border-subtle rounded-2xl border p-2">
                <div className="flex flex-wrap gap-2">
                  {['PODIUM', 'TSUM', 'SELFRIDGES'].map((p) => (
                    <Badge
                      key={p}
                      className="text-text-primary border-border-default flex items-center gap-2 bg-white px-3 py-1 text-[9px] font-black uppercase"
                    >
                      {p} <PlusCircle className="text-text-muted h-3 w-3" />
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    className="text-accent-primary h-7 text-[9px] font-black uppercase"
                  >
                    Добавить еще...
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-bg-surface2 border-border-subtle border-t p-4">
          <Button
            onClick={handleCreateAndEdit}
            disabled={!name}
            className="bg-text-primary h-12 w-full rounded-xl text-[11px] font-black uppercase text-white shadow-xl"
          >
            Создать и перейти в конструктор <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </CabinetPageContent>
  );
}
