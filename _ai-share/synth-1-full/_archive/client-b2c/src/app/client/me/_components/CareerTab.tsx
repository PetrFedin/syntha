'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  FileText,
  Plus,
  Image as ImageIcon,
  Pencil,
  Trash2,
  ExternalLink,
  Globe,
  GraduationCap,
  Award,
  Sparkles,
  CheckCircle2,
  Search,
  Users,
  Camera,
  MapPin,
  Clock,
  DollarSign,
  Brain,
  Target,
  TrendingUp,
  Instagram,
  Share2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

interface CareerTabProps {
  user: any;
}

export function CareerTab({ user }: CareerTabProps) {
  const [isEditing, setIsClientEditing] = useState(false);
  const [profile, setProfile] = useState({
    role: 'Fashion Designer / Creative Director',
    bio: 'Специализируюсь на создании коллекций из переработанных материалов. Работала с крупными домами моды в Италии. Ищу возможности для коллабораций и долгосрочных контрактов.',
    experience: '8 лет',
    location: 'Милан / Москва',
    education: 'Istituto Marangoni, Milan',
    skills: ['Luxury', 'Sustainable', 'Couture', '3D Design', 'Fabric Sourcing'],
    portfolio: [
      {
        id: 1,
        title: 'Summer Capsule 24',
        image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400',
      },
      {
        id: 2,
        title: 'Nordic Wool Project',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400',
      },
      {
        id: 3,
        title: 'Milan Fashion Week 23',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=400',
      },
    ],
    lookingFor: ['Постоянная работа', 'Фриланс проекты', 'Коллаборации'],
    status: 'active_search', // 'active_search', 'open_for_offers', 'not_looking'
  });

  return (
    <div className="py-6 outline-none duration-300 animate-in fade-in-50">
      <div className="space-y-4">
        {/* Career Header & Controls */}
        <div className="border-border-subtle bg-bg-surface relative flex flex-col justify-between gap-3 overflow-hidden rounded-xl border p-4 shadow-sm md:flex-row md:items-center">
          <div className="absolute right-0 top-0 p-4 opacity-5">
            <Briefcase className="h-32 w-32 rotate-12" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-black uppercase tracking-tight">
                Профессиональный Профиль
              </h2>
              <Badge
                className={cn(
                  'border-none px-2 py-0.5 text-[8px] font-black uppercase',
                  profile.status === 'active_search'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-500 text-white'
                )}
              >
                {profile.status === 'active_search' ? 'В активном поиске' : 'Открыт к предложениям'}
              </Badge>
            </div>
            <p className="max-w-2xl font-medium text-muted-foreground">
              Управляйте вашим резюме и портфолио в экосистеме Syntha. Ваш профиль доступен для
              поиска брендам, магазинам и агентствам.
            </p>
          </div>
          <div className="relative z-10 flex gap-3">
            <Button
              asChild
              variant="outline"
              className="hover:border-text-primary hover:bg-bg-surface2 h-12 rounded-2xl px-6 text-xs font-black uppercase tracking-widest transition-all"
            >
              <Link href={ROUTES.shop.career}>
                <Search className="mr-2 h-4 w-4" />
                Биржа Талантов
              </Link>
            </Button>
            <Button
              onClick={() => setIsClientEditing(!isEditing)}
              className="button-glimmer button-professional h-12 rounded-2xl border-none !bg-black px-8 text-xs font-black uppercase tracking-widest shadow-xl shadow-black/15 hover:!bg-black"
            >
              {isEditing ? (
                'Сохранить изменения'
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Редактировать
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Social Influence & Collaborative Power */}
        <Card className="from-text-primary via-accent-primary/25 to-text-primary text-text-inverse relative overflow-hidden rounded-xl border-none bg-gradient-to-br shadow-2xl">
          <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-10">
            <Instagram className="h-64 w-64 rotate-12" />
          </div>
          <CardContent className="relative z-10 space-y-10 p-3">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                  </div>
                  <Badge className="bg-accent-primary text-text-inverse border-none px-2 text-[8px] font-black uppercase tracking-widest">
                    Influencer Tier: Macro
                  </Badge>
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">
                  Влияние и Коллаборации
                </h3>
                <p className="max-w-xl text-sm font-medium leading-relaxed text-white/50">
                  Ваши охваты в соцсетях синхронизированы с Syntha. Бренды видят ваш потенциал и
                  могут предлагать прямые контракты на рекламу и создание контента.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="border-r border-white/10 px-4 text-center">
                  <p className="text-sm font-black">12.4K</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
                    Followers
                  </p>
                </div>
                <div className="px-4 text-center">
                  <p className="text-accent-primary text-sm font-black">4.8%</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
                    Eng. Rate
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="group cursor-pointer space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 transition-transform group-hover:scale-110">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <Badge className="border-none bg-emerald-500 text-[7px] font-black uppercase text-white">
                    Синхронизировано
                  </Badge>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Рыночная стоимость
                </p>
                <p className="text-base font-black">
                  ~45,000 ₽{' '}
                  <span className="text-[10px] font-bold uppercase tracking-normal text-white/30">
                    / post
                  </span>
                </p>
              </div>

              <div className="group cursor-pointer space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div className="bg-accent-primary/20 text-accent-primary flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                    <Zap className="h-5 w-5" />
                  </div>
                  <Badge className="border-none bg-amber-500 text-[7px] font-black uppercase text-white">
                    3 Active Offers
                  </Badge>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Партнёрский статус
                </p>
                <p className="text-base font-black italic">Open for Drops</p>
              </div>

              <div className="bg-accent-primary hover:bg-accent-primary/90 group cursor-pointer space-y-4 rounded-3xl p-4 shadow-xl shadow-black/15 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white transition-transform group-hover:scale-110">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  Syntha Privileges
                </p>
                <p className="text-base font-black">Премиум-статус</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Main Info (Left Column) */}
          <div className="space-y-4 lg:col-span-8">
            {/* Professional Summary */}
            <Card className="border-border-subtle bg-bg-surface overflow-hidden rounded-xl border shadow-sm">
              <CardHeader className="p-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-accent-primary/10 text-accent-primary flex h-10 w-10 items-center justify-center rounded-xl">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-black uppercase tracking-tight">
                    Резюме и Опыт
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-4 pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Желаемая роль
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        className="border-border-subtle rounded-xl"
                      />
                    ) : (
                      <p className="text-text-primary text-sm font-black">{profile.role}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      О себе и целях
                    </label>
                    {isEditing ? (
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="border-border-subtle min-h-[120px] rounded-xl"
                      />
                    ) : (
                      <p className="border-accent-primary/25 text-text-secondary border-l-2 pl-4 text-sm font-medium italic leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-2">
                  {[
                    {
                      icon: Clock,
                      label: 'Опыт работы',
                      value: profile.experience,
                      key: 'experience',
                    },
                    { icon: MapPin, label: 'Локация', value: profile.location, key: 'location' },
                    {
                      icon: GraduationCap,
                      label: 'Образование',
                      value: profile.education,
                      key: 'education',
                    },
                    {
                      icon: Target,
                      label: 'Интересы',
                      value: profile.lookingFor.join(', '),
                      key: 'lookingFor',
                    },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <item.icon className="h-3 w-3" />
                        {item.label}
                      </div>
                      <p className="text-text-primary text-sm font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Grid */}
            <Card className="border-border-subtle bg-bg-surface overflow-hidden rounded-xl border shadow-sm">
              <CardHeader className="p-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent-primary/10 text-accent-primary flex h-10 w-10 items-center justify-center rounded-xl">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-black uppercase tracking-tight">
                      Портфолио
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border-subtle h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Plus className="mr-2 h-3 w-3" /> Добавить работу
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {profile.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="bg-bg-surface2 group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white">
                          {item.title}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-lg border-none bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-black"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-lg border-none"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-border-subtle bg-bg-surface2/80 text-text-muted hover:border-accent-primary hover:text-accent-primary flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all">
                    <Plus className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Загрузить проект
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-4 lg:col-span-4">
            {/* AI Career Insights */}
            <Card className="bg-text-primary text-text-inverse relative space-y-4 overflow-hidden rounded-xl p-4 shadow-2xl">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                <Brain className="h-24 w-24" />
              </div>
              <div className="relative z-10 space-y-2">
                <Badge className="mb-2 border-none bg-accent px-2 py-0.5 text-[8px] font-black uppercase text-white">
                  Neural_HR
                </Badge>
                <h4 className="text-sm font-black uppercase tracking-tight">
                  AI Карьерный Помощник
                </h4>
                <p className="text-[11px] font-medium leading-relaxed text-white/50">
                  Анализ рынка на основе ваших навыков и опыта FW26
                </p>
              </div>

              <div className="relative z-10 space-y-6">
                {[
                  { label: 'Спрос рынка', value: 'Высокий (топ 5%)', icon: TrendingUp },
                  { label: 'Оценка совпадения', value: '94% соответствие', icon: Target },
                  { label: 'Видимость профиля', value: '840 просмотров/мес', icon: Users },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="mb-1 text-[9px] font-black uppercase leading-none text-white/40">
                        {item.label}
                      </p>
                      <p className="text-sm font-bold uppercase tracking-tight">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 border-t border-white/10 pt-4">
                <div className="rounded-2xl border border-accent/20 bg-accent/10 p-3">
                  <p className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase text-accent">
                    <Sparkles className="h-3 w-3" /> Рекомендация
                  </p>
                  <p className="text-[11px] font-medium italic leading-relaxed text-white/80">
                    «Ваш опыт работы с кашемиром востребован у 12 брендов в этом месяце. Обновите
                    портфолио работами SS25 для повышения видимости.»
                  </p>
                </div>
              </div>
            </Card>

            {/* Verification Status */}
            <Card className="border-border-subtle bg-bg-surface space-y-6 rounded-xl border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight">Верификация</h4>
              </div>
              <div className="space-y-4">
                <div className="border-border-subtle bg-bg-surface2 flex items-center justify-between rounded-2xl border p-4">
                  <div className="flex items-center gap-3">
                    <Globe className="text-text-muted h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-tight">
                      Центр идентичности
                    </span>
                  </div>
                  <Badge className="border-none bg-emerald-500 text-[8px] uppercase">
                    Проверено
                  </Badge>
                </div>
                <div className="border-border-subtle bg-bg-surface2 flex items-center justify-between rounded-2xl border p-4">
                  <div className="flex items-center gap-3">
                    <Award className="text-text-muted h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-tight">Case Reviews</span>
                  </div>
                  <Badge className="bg-bg-surface2 text-text-muted border-none text-[8px] uppercase">
                    Pending
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-12 w-full rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest"
              >
                Пройти аттестацию
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
