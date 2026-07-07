'use client';

import * as React from 'react';
import { use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Gavel,
  Clock,
  CheckCircle,
  Trophy,
  ShieldCheck,
  AlertTriangle,
  Bot,
  Brain,
  History,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Zap,
  Info,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockAuctions } from '@/lib/auction-data';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function AuctionDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { toast } = useToast();
  const auction = mockAuctions.find((a) => a.id === params.id);
  const [selectedBidId, setSelectedBidId] = React.useState<string | null>(null);

  if (!auction)
    return (
      <div className="text-text-muted p-20 text-center font-black uppercase tracking-widest">
        Аукцион не найден
      </div>
    );

  const handleAcceptBid = (bidderName: string) => {
    toast({
      title: 'Предложение принято',
      description: `Контракт с ${bidderName} успешно сформирован. Переход к этапу оплаты...`,
    });
  };

  const selectedBid = auction.bids.find((b) => b.id === selectedBidId);

  return (
    <div className="bg-bg-surface2/80 min-h-screen p-4 font-sans md:p-4">
      <div className="mx-auto max-w-[1400px] space-y-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div className="space-y-4">
            <Button
              asChild
              variant="ghost"
              className="text-text-muted hover:text-text-primary group p-0 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-transparent"
            >
              <Link href="/brand/auctions" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />{' '}
                К списку тендеров
              </Link>
            </Button>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-text-primary flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg">
                  <Gavel className="h-5 w-5 text-white" />
                </div>
                <Badge
                  variant="outline"
                  className="border-text-primary/20 text-text-primary bg-text-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                >
                  ID: {auction.id}
                </Badge>
                <Badge className="animate-pulse border-none bg-green-500 px-3 text-[10px] font-black uppercase tracking-widest text-white">
                  Active Tender
                </Badge>
              </div>
              <h1 className="text-text-primary max-w-2xl text-sm font-black uppercase leading-tight tracking-tighter">
                {auction.title}
              </h1>
              <p className="text-text-muted max-w-xl text-sm font-medium">{auction.description}</p>
            </div>
          </div>

          <Card className="rounded-xl border-none bg-white p-4 shadow-2xl md:min-w-[320px]">
            <div className="space-y-6">
              {auction.type === 'collaboration' ? (
                <>
                  <div className="border-border-subtle flex items-center justify-between border-b pb-4">
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                      Platform
                    </p>
                    <Badge className="bg-bg-surface2 text-text-primary border-none px-3 text-[10px] font-black uppercase">
                      {auction.influencerData?.platform}
                    </Badge>
                  </div>
                  <div className="border-border-subtle flex items-center justify-between border-b pb-4">
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                      Engagement Rate
                    </p>
                    <p className="text-accent-primary text-base font-black">
                      {auction.influencerData?.er}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                      Status
                    </p>
                    <div className="flex items-center gap-2 text-green-500">
                      <Zap className="h-4 w-4 fill-current" />
                      <p className="text-base font-black uppercase tracking-tighter">Available</p>
                    </div>
                  </div>
                  <Button className="bg-accent-primary shadow-accent-primary/20 hover:bg-accent-primary h-10 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all">
                    Обсудить коллаборацию
                  </Button>
                </>
              ) : (
                <>
                  <div className="border-border-subtle flex items-center justify-between border-b pb-4">
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                      Target Price
                    </p>
                    <p className="text-text-primary text-base font-black">
                      {auction.targetPrice?.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="border-border-subtle flex items-center justify-between border-b pb-4">
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                      Units
                    </p>
                    <p className="text-text-primary text-base font-black">
                      {auction.targetQuantity?.toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                      Time Left
                    </p>
                    <div className="flex items-center gap-2 text-rose-500">
                      <Clock className="h-4 w-4 animate-pulse" />
                      <p className="text-base font-black uppercase tracking-tighter">2d 14h 30m</p>
                    </div>
                  </div>
                  <Button className="bg-text-primary h-10 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                    Закрыть досрочно
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="space-y-4 lg:col-span-8">
            {auction.type === 'collaboration' ? (
              <div className="space-y-10">
                {/* Social Media Analytics Block */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <TrendingUp className="text-accent-primary h-5 w-5" />
                    <h3 className="text-text-primary text-base font-black uppercase tracking-tight">
                      Анализ социальных сетей
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Card className="space-y-2 rounded-xl border-none bg-white p-4 shadow-xl">
                      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                        Real Audience Score
                      </p>
                      <div className="flex items-end gap-2">
                        <p className="text-text-primary text-base font-black">
                          {auction.influencerData?.realAudienceScore}%
                        </p>
                        <Badge className="mb-1 border-none bg-green-100 text-[8px] font-black uppercase text-green-600">
                          High Trust
                        </Badge>
                      </div>
                      <Progress
                        value={auction.influencerData?.realAudienceScore}
                        className="bg-bg-surface2 h-1"
                      />
                    </Card>

                    <Card className="space-y-4 rounded-xl border-none bg-white p-4 shadow-xl">
                      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                        Топ География
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {auction.influencerData?.topGeography.map((geo, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-bg-surface2 text-text-secondary border-border-subtle rounded-lg px-3 py-1 text-[9px] font-bold uppercase tracking-wider"
                          >
                            {geo}
                          </Badge>
                        ))}
                      </div>
                    </Card>

                    <Card className="space-y-2 rounded-xl border-none bg-white p-4 shadow-xl">
                      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
                        Audience Quality
                      </p>
                      <p className="text-text-secondary text-xs font-medium italic leading-relaxed">
                        {auction.influencerData?.audienceQuality}
                      </p>
                    </Card>
                  </div>
                </section>

                {/* AI Smart Advisor Detailed View */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <Brain className="text-accent-primary h-5 w-5" />
                    <h3 className="text-text-primary text-base font-black uppercase tracking-tight">
                      AI Smart Advisor
                    </h3>
                  </div>

                  <Card className="bg-text-primary relative overflow-hidden rounded-xl border-none p-3 text-white shadow-2xl">
                    <div className="absolute right-0 top-0 p-4 opacity-5">
                      <Sparkles className="h-48 w-48" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-accent-primary text-[10px] font-black uppercase tracking-[0.2em]">
                            Relevance Recommendation
                          </p>
                          <h4 className="text-base font-black uppercase tracking-tighter">
                            Match Analysis
                          </h4>
                        </div>
                        <div className="border-accent-primary/150 relative flex h-20 w-20 items-center justify-center rounded-full border-4">
                          <span className="text-sm font-black">
                            {auction.aiSmartAdvisor?.relevanceScore}%
                          </span>
                          <svg className="absolute inset-0 h-full w-full -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="36"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              className="text-accent-primary"
                              strokeDasharray={`${auction.aiSmartAdvisor ? auction.aiSmartAdvisor.relevanceScore * 2.26 : 0} 226`}
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-xl border border-white/5 bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                          <Info className="text-accent-primary h-5 w-5" />
                          <p className="text-text-muted text-sm font-bold leading-relaxed">
                            {auction.aiSmartAdvisor?.matchAnalysis}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            Efficiency Forecast
                          </p>
                          <p className="text-text-muted text-sm font-medium">
                            Прогнозируемый рост охвата бренда на{' '}
                            <span className="font-black text-green-400">+12-15%</span> в целевом
                            сегменте в течение первой недели после публикации.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            Engagement Potential
                          </p>
                          <p className="text-text-muted text-sm font-medium">
                            Высокая вероятность конверсии в лояльных клиентов благодаря высокому
                            уровню доверия аудитории (Trust Score: 9.2/10).
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-text-primary text-base font-black uppercase tracking-tight">
                    Поступившие заявки
                  </h3>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-text-muted text-[9px] font-black uppercase tracking-widest">
                        Leading Bid
                      </span>
                    </div>
                  </div>
                </div>

                <Card className="overflow-hidden rounded-xl border-none bg-white shadow-xl">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-bg-surface2/80">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="text-text-muted px-8 py-4 text-[10px] font-black uppercase tracking-widest">
                            Поставщик
                          </TableHead>
                          <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                            Цена (ед.)
                          </TableHead>
                          <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                            Срок (дней)
                          </TableHead>
                          <TableHead className="text-text-muted py-4 text-[10px] font-black uppercase tracking-widest">
                            AI Score
                          </TableHead>
                          <TableHead className="text-text-muted px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest">
                            Действие
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auction.bids.map((bid) => (
                          <TableRow
                            key={bid.id}
                            className={cn(
                              'border-border-subtle group cursor-pointer border-b transition-colors',
                              selectedBidId === bid.id
                                ? 'bg-text-primary hover:bg-text-primary/90'
                                : 'hover:bg-bg-surface2/80'
                            )}
                            onClick={() => setSelectedBidId(bid.id)}
                          >
                            <TableCell className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black transition-colors',
                                    selectedBidId === bid.id
                                      ? 'bg-white/10 text-white'
                                      : 'bg-bg-surface2 text-text-muted'
                                  )}
                                >
                                  {bid.bidderName[0]}
                                </div>
                                <div>
                                  <p
                                    className={cn(
                                      'font-bold uppercase tracking-tight',
                                      selectedBidId === bid.id ? 'text-white' : 'text-text-primary'
                                    )}
                                  >
                                    {bid.bidderName}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <Trophy className="h-2.5 w-2.5 text-amber-500" />
                                    <p className="text-text-muted text-[9px] font-black uppercase">
                                      {bid.bidderRating} Rating
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-6 text-sm font-black">
                              <span
                                className={cn(
                                  selectedBidId === bid.id ? 'text-green-400' : 'text-text-primary'
                                )}
                              >
                                {bid.amount.toLocaleString('ru-RU')} ₽
                              </span>
                            </TableCell>
                            <TableCell
                              className={cn(
                                'py-6 text-sm font-bold',
                                selectedBidId === bid.id ? 'text-white/60' : 'text-text-muted'
                              )}
                            >
                              {bid.deliveryDays}
                            </TableCell>
                            <TableCell className="py-6">
                              {bid.aiAnalysis && (
                                <Badge
                                  className={cn(
                                    'border-none px-3 py-1 text-[9px] font-black',
                                    bid.aiAnalysis.reliabilityScore > 90
                                      ? 'bg-green-500 text-white'
                                      : 'bg-amber-500 text-white'
                                  )}
                                >
                                  {bid.aiAnalysis.reliabilityScore}%
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="px-8 py-6 text-right">
                              <Button
                                className={cn(
                                  'h-10 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all',
                                  selectedBidId === bid.id
                                    ? 'text-text-primary hover:bg-bg-surface2 bg-white'
                                    : 'bg-text-primary text-white opacity-0 hover:bg-black group-hover:opacity-100'
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptBid(bid.bidderName);
                                }}
                              >
                                Принять
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* AI Analysis Sidebar */}
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-3 px-2">
              <Brain className="h-5 w-5 text-accent" />
              <h3 className="text-text-primary text-base font-black uppercase tracking-tight text-accent">
                AI Advisor PRO
              </h3>
            </div>

            {auction.type === 'collaboration' ? (
              <Card className="bg-text-primary relative h-fit overflow-hidden rounded-xl border-none p-3 text-white shadow-2xl">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Bot className="h-32 w-32 rotate-12" />
                </div>

                <div className="relative z-10 space-y-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                        AI Smart Advisor
                      </p>
                      <h4 className="text-sm font-black uppercase tracking-tighter">
                        Strategic Match
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Relevance
                      </p>
                      <Badge className="bg-accent-primary border-none px-3 text-[9px] font-black uppercase">
                        {auction.aiSmartAdvisor?.relevanceScore}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        Engagement Analysis
                      </p>
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                        <p className="text-xs font-bold leading-relaxed">
                          Engagement Rate ({auction.influencerData?.er}%) значительно выше среднего
                          по рынку (2.4%). Аудитория активно взаимодействует с контентом.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        Fraud Detection
                      </p>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
                        <ShieldCheck className="h-5 w-5 shrink-0 text-green-400" />
                        <div>
                          <p className="mb-0.5 text-[9px] font-black uppercase text-green-400">
                            Real Audience
                          </p>
                          <p className="text-xs font-bold leading-relaxed">
                            {auction.influencerData?.realAudienceScore}% живых пользователей
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="text-text-primary hover:bg-bg-surface2 h-10 w-full rounded-2xl bg-white text-[10px] font-black uppercase tracking-widest transition-all">
                    Открыть чат с блогером
                  </Button>
                </div>
              </Card>
            ) : selectedBid ? (
              <Card className="bg-text-primary relative h-fit overflow-hidden rounded-xl border-none p-3 text-white shadow-2xl">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Bot className="h-32 w-32 rotate-12" />
                </div>

                <div className="relative z-10 space-y-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                        Strategic Assessment
                      </p>
                      <h4 className="text-sm font-black uppercase tracking-tighter">
                        {selectedBid.bidderName}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Risk Level
                      </p>
                      <Badge
                        className={cn(
                          'border-none px-3 text-[9px] font-black uppercase',
                          selectedBid.aiAnalysis?.riskLevel === 'low'
                            ? 'bg-green-500'
                            : 'bg-amber-500'
                        )}
                      >
                        {selectedBid.aiAnalysis?.riskLevel}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        Reliability Score
                      </p>
                      <p className="text-base font-black text-white">
                        {selectedBid.aiAnalysis?.reliabilityScore}%
                      </p>
                      <Progress
                        value={selectedBid.aiAnalysis?.reliabilityScore}
                        className="h-1 bg-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">
                        Market Competitiveness
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-base font-black text-green-400">High</p>
                        <span className="text-[10px] font-black uppercase text-white/20">
                          v Market
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />
                      <div>
                        <p className="mb-0.5 text-[9px] font-black uppercase text-accent">
                          Primary Factor
                        </p>
                        <p className="text-xs font-bold leading-relaxed">
                          {selectedBid.aiAnalysis?.riskFactor}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4 rounded-xl border border-white/5 bg-white/5 p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                          Executive Summary
                        </span>
                      </div>
                      <p className="text-xs font-medium italic leading-relaxed text-white/80">
                        "{selectedBid.aiAnalysis?.summary}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <p className="mb-4 text-center text-[9px] font-black uppercase italic tracking-widest text-white/40 opacity-60">
                      Система рекомендует принять предложение на основе комбинации цены и низких
                      логистических рисков.
                    </p>
                    <div className="flex gap-2">
                      <Button className="h-10 flex-1 rounded-2xl bg-accent text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-accent/20">
                        Принять оффер
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-2xl bg-white/5 text-white hover:bg-white/10"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-border-default flex h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-transparent p-3 text-center">
                <div className="bg-bg-surface2 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                  <Brain className="text-text-muted h-10 w-10" />
                </div>
                <h4 className="text-text-muted mb-2 text-sm font-black uppercase tracking-widest">
                  Выберите ставку
                </h4>
                <p className="text-text-muted max-w-[200px] text-xs font-bold uppercase tracking-tight">
                  Нажмите на любую строку в таблице, чтобы запустить глубокий AI-анализ предложения.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
