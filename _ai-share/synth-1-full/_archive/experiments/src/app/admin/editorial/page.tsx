'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Plus,
  Search,
  ChevronRight,
  ArrowRight,
  Eye,
  Calendar,
  Clock,
  Zap,
  Sparkles,
  ImageIcon,
  Layout,
  Share2,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  History,
  TrendingUp,
  Newspaper,
  Rocket,
} from 'lucide-react';
import { EditorialArticle, EditorialStatus, EditorialCategory } from '@/lib/types/editorial';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/**
 * Editorial Marketroom CMS — Admin/Brand Dashboard
 * Журнальный формат главной страницы: тренд-репорты, интервью и подборки.
 */

export default function EditorialCMSPage() {
  const [articles, setArticles] = useState<EditorialArticle[]>([
    {
      id: 'art-1',
      title: 'Metallic Textures: SS26 Key Trends',
      slug: 'metallic-textures-ss26',
      subtitle: 'Why liquid metal is the new black this season.',
      author: { name: 'Viktoria B.', role: 'Trend Analyst' },
      category: 'trend_report',
      status: 'published',
      mainImageUrl: '/editorial/metallic.jpg',
      summary: 'Exploring the shift towards high-gloss materials in luxury fashion.',
      contentNodes: [],
      tags: ['Trend', 'SS26', 'Luxury'],
      readingTime: 5,
      publishedAt: '2026-03-05T10:00:00Z',
      viewCount: 12450,
    },
    {
      id: 'art-2',
      title: 'Interview: Designing for the Metaverse',
      slug: 'interview-digital-design',
      subtitle: 'Exclusive talk with lead designers of Synth Lab.',
      author: { name: 'Artem N.', role: 'Digital Creator' },
      category: 'interview',
      status: 'scheduled',
      mainImageUrl: '/editorial/meta.jpg',
      summary: 'How digital twins are changing the physical design process.',
      contentNodes: [],
      tags: ['Digital', 'Web3', 'Innovation'],
      readingTime: 8,
      publishedAt: '2026-03-10T09:00:00Z',
      viewCount: 0,
    },
  ]);

  const getStatusBadge = (status: EditorialStatus) => {
    const config: Record<EditorialStatus, { label: string; color: string }> = {
      draft: {
        label: 'Черновик',
        color: 'bg-bg-surface2 text-text-secondary border-border-default',
      },
      scheduled: {
        label: 'Запланировано',
        color: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
      },
      published: {
        label: 'Опубликовано',
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      },
      archived: { label: 'Архив', color: 'bg-text-primary text-white border-none' },
    };
    const item = config[status];
    return (
      <Badge
        variant="outline"
        className={cn('h-5 px-2 text-[8px] font-black uppercase', item.color)}
      >
        {item.label}
      </Badge>
    );
  };

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-10 px-4 py-6 pb-16 pb-24 sm:px-6">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="text-accent-primary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Newspaper className="h-3.5 w-3.5" />
            Marketroom Editorial CMS
          </div>
          <h1 className="font-headline text-sm font-black uppercase tracking-tighter">
            Content Studio
          </h1>
          <p className="font-medium text-muted-foreground">
            Управление нативным контентом и тренд-репортами платформы Synth-1.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase"
          >
            <Layout className="h-4 w-4" /> Шаблоны
          </Button>
          <Button className="bg-text-primary h-11 gap-2 rounded-xl px-6 text-[10px] font-black uppercase text-white shadow-lg">
            <Plus className="h-4 w-4" /> Создать статью
          </Button>
        </div>
      </header>

      {/* Analytics Row */}
      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Всего статей', value: '42', icon: FileText, color: 'text-text-primary' },
          { label: 'Total Views', value: '185K', icon: Eye, color: 'text-accent-primary' },
          { label: 'Avg CTR', value: '12.4%', icon: TrendingUp, color: 'text-emerald-600' },
          {
            label: 'Trending Tags',
            value: '#SS26, #Silk',
            icon: Sparkles,
            color: 'text-amber-600',
          },
        ].map((stat, i) => (
          <Card key={i} className="rounded-3xl border-none bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="bg-bg-surface2 rounded-xl p-2">
                <stat.icon className="text-text-muted h-4 w-4" />
              </div>
              <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
            <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden rounded-xl border-none bg-white shadow-md shadow-xl">
            <CardHeader className="border-border-subtle flex flex-row items-center justify-between border-b p-4">
              <CardTitle className="text-base font-black uppercase tracking-tight">
                Статьи и Репорты
              </CardTitle>
              <div className="relative">
                <Search className="text-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Поиск по заголовку"
                  className="border-border-subtle h-10 w-64 rounded-xl pl-9 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-bg-surface2/80">
                  <TableRow>
                    <TableHead className="pl-8 text-[10px] font-black uppercase">Контент</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Статус</TableHead>
                    <TableHead className="text-[10px] font-black uppercase">Просмотры</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-black uppercase">
                      Действие
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow
                      key={article.id}
                      className="hover:bg-bg-surface2/80 group cursor-pointer transition-colors"
                    >
                      <TableCell className="py-6 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="bg-bg-surface2 border-border-subtle relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border">
                            <ImageIcon className="text-text-muted h-6 w-6" />
                            <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                              {article.category.replace('_', ' ')}
                            </p>
                            <h4 className="text-text-primary text-sm font-black leading-tight">
                              {article.title}
                            </h4>
                            <div className="text-text-muted flex items-center gap-3 text-[9px] font-bold">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {article.readingTime} min
                              </span>
                              <span className="flex items-center gap-1 uppercase tracking-tighter">
                                {article.author.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell>
                        <p className="text-text-primary text-sm font-black">
                          {article.viewCount.toLocaleString()}
                        </p>
                        <p className="text-text-muted text-[9px] font-bold uppercase tracking-tight">
                          Total Reads
                        </p>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-muted hover:text-accent-primary rounded-xl"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-text-primary rounded-xl border-none p-4 text-white shadow-md shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Zap className="text-accent-primary h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">
                  AI Content Assistant
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Smart Optimization
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                  Headline Recommendation
                </p>
                <p className="text-xs font-medium leading-relaxed text-white/80">
                  "SS26 Trends" слишком общий заголовок. ИИ рекомендует: "Liquid Metal & Urban
                  Safari: 5 Core Textures for SS26".
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-[10px] font-bold uppercase tracking-tight text-emerald-100">
                  SEO Score: 94/100
                </p>
              </div>
            </div>
            <Button className="bg-accent-primary hover:bg-accent-primary mt-8 h-10 w-full rounded-xl border-none text-[9px] font-black uppercase text-white shadow-lg">
              Analyze Draft
            </Button>
          </Card>

          <Card className="border-border-subtle rounded-xl border border-none bg-white p-4 shadow-md shadow-xl">
            <h3 className="text-text-primary mb-6 text-sm font-black uppercase tracking-tight">
              Marketroom Layout
            </h3>
            <div className="space-y-4">
              <div className="bg-bg-surface2 space-y-3 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-[10px] font-black uppercase">
                    Hero Section
                  </span>
                  <Badge className="bg-text-primary text-[8px] uppercase text-white">Active</Badge>
                </div>
                <p className="text-text-primary text-xs font-black uppercase">
                  "Metallic Textures..."
                </p>
              </div>
              <Button
                variant="outline"
                className="border-border-subtle hover:bg-bg-surface2 h-12 w-full gap-2 rounded-2xl text-[10px] font-black uppercase"
              >
                <Layout className="h-4 w-4" /> Change Layout Design
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </CabinetPageContent>
  );
}
