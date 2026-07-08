'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Filter,
  ChevronRight,
  ShieldCheck,
  Leaf,
  Heart,
  Check,
  Clock,
  MessageSquare,
  Sparkles,
  Zap,
  Star,
  Handshake,
  BarChart2,
  Info,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { brands as allBrands } from '@/lib/placeholder-data';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Mock quality data for all brands
const mockQualityData: Record<string, any> = {
  syntha: {
    score: 92,
    metrics: [
      { id: 'reputation', score: 98, status: 'active' },
      { id: 'eco', score: 92, status: 'active' },
      { id: 'loyalty', score: 95, status: 'active' },
      { id: 'quality', score: 97, status: 'active' },
      { id: 'delivery', score: 88, status: 'active' },
      { id: 'service', score: 94, status: 'active' },
      { id: 'trend', score: 75, status: 'potential' },
      { id: 'innovation', score: 82, status: 'potential' },
      { id: 'experts', score: 68, status: 'potential' },
      { id: 'social', score: 45, status: 'potential' },
    ],
  },
  nordic: {
    score: 85,
    metrics: [
      { id: 'reputation', score: 90, status: 'active' },
      { id: 'eco', score: 95, status: 'active' },
      { id: 'loyalty', score: 88, status: 'active' },
      { id: 'quality', score: 92, status: 'active' },
      { id: 'delivery', score: 75, status: 'potential' },
      { id: 'service', score: 82, status: 'potential' },
      { id: 'trend', score: 65, status: 'potential' },
      { id: 'innovation', score: 60, status: 'potential' },
      { id: 'experts', score: 85, status: 'active' },
      { id: 'social', score: 70, status: 'potential' },
    ],
  },
  // ... other brands would have default or generated data
};

const metricIcons: Record<string, any> = {
  reputation: <ShieldCheck className="h-4 w-4" />,
  eco: <Leaf className="h-4 w-4" />,
  loyalty: <Heart className="h-4 w-4" />,
  quality: <Check className="h-4 w-4" />,
  delivery: <Clock className="h-4 w-4" />,
  service: <MessageSquare className="h-4 w-4" />,
  trend: <Sparkles className="h-4 w-4" />,
  innovation: <Zap className="h-4 w-4" />,
  experts: <Star className="h-4 w-4" />,
  social: <Handshake className="h-4 w-4" />,
};

export default function AdminQualityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  const filteredBrands = useMemo(() => {
    return allBrands.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <CabinetPageContent maxWidth="full" className="space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black uppercase tracking-tighter">
            Контроль Системы Качества
          </h1>
          <p className="text-muted-foreground">
            Глобальный мониторинг показателей и достижений всех брендов платформы.
          </p>
        </div>
        <div className="flex gap-3">
          <Card className="flex items-center gap-3 border-accent/10 bg-accent/5 px-6 py-3">
            <BarChart2 className="h-6 w-6 text-accent" />
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Средний BPI</p>
              <p className="text-sm font-black">78.4%</p>
            </div>
          </Card>
        </div>
      </header>

      <Card className="overflow-hidden rounded-3xl border-muted/20 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-black uppercase tracking-tighter">
              Реестр показателей
            </CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск бренда..."
                className="rounded-xl pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-muted/20 hover:bg-transparent">
                <TableHead className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                  Бренд
                </TableHead>
                <TableHead className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                  Общий балл
                </TableHead>
                <TableHead className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                  Активные знаки
                </TableHead>
                <TableHead className="text-text-secondary text-[10px] font-black uppercase tracking-widest">
                  Ключевая компетенция
                </TableHead>
                <TableHead className="text-text-secondary text-right text-[10px] font-black uppercase tracking-widest">
                  Детализация
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => {
                const data = mockQualityData[brand.id] || mockQualityData['nordic']; // fallback
                const activeCount = data.metrics.filter((m: any) => m.status === 'active').length;
                return (
                  <TableRow
                    key={brand.id}
                    className="group cursor-pointer transition-colors hover:bg-muted/5"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white p-1">
                          <img
                            src={brand.logo.url}
                            alt={brand.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight">
                          {brand.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              data.score > 90
                                ? 'bg-yellow-500'
                                : data.score > 80
                                  ? 'bg-accent'
                                  : 'bg-text-muted'
                            )}
                            style={{ width: `${data.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-black">{data.score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {data.metrics
                          .filter((m: any) => m.status === 'active')
                          .slice(0, 5)
                          .map((m: any) => (
                            <div
                              key={m.id}
                              className="text-text-secondary flex h-6 w-6 items-center justify-center rounded-md bg-muted/50"
                            >
                              {metricIcons[m.id]}
                            </div>
                          ))}
                        {activeCount > 5 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/50 text-[8px] font-black">
                            +{activeCount - 5}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-accent/20 text-[9px] font-black uppercase text-accent"
                      >
                        {data.metrics[0].id === 'reputation' ? 'Безупречность' : 'Экологичность'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-[9px] font-black uppercase transition-all group-hover:bg-black group-hover:text-white"
                        onClick={() => setSelectedBrand({ ...brand, quality: data })}
                      >
                        Просмотр <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Brand Quality Detail Dialog */}
      <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrand(null)}>
        <DialogContent className="max-w-4xl overflow-hidden rounded-xl border-none p-0 shadow-2xl">
          <VisuallyHidden>
            <DialogTitle>Детализация качества: {selectedBrand?.name}</DialogTitle>
          </VisuallyHidden>
          {selectedBrand && (
            <div className="flex flex-col">
              <div className="bg-text-primary flex items-center justify-between p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-white p-2">
                    <img
                      src={selectedBrand.logo.url}
                      alt={selectedBrand.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-tighter">
                      {selectedBrand.name}
                    </h2>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="border-none bg-yellow-500 text-[10px] font-black text-white">
                        PREMIUM PARTNER
                      </Badge>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        ID: {selectedBrand.id}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-[10px] font-black uppercase text-white/40">
                    Глобальный BPI
                  </p>
                  <p className="text-sm font-black text-yellow-500">
                    {selectedBrand.quality.score}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 bg-white p-4 md:grid-cols-2">
                <div className="space-y-6">
                  <h4 className="text-text-muted text-[11px] font-black uppercase tracking-widest">
                    Детализация по 10 параметрам
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedBrand.quality.metrics.map((m: any) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-2xl border border-muted/10 bg-muted/20 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg',
                              m.status === 'active'
                                ? 'bg-accent text-white'
                                : 'text-text-muted bg-muted'
                            )}
                          >
                            {metricIcons[m.id]}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-tight">
                            {m.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black">{m.score}%</span>
                          <Badge
                            className={cn(
                              'h-4 text-[8px] font-black',
                              m.status === 'active' ? 'bg-green-500' : 'bg-border-default'
                            )}
                          >
                            {m.status === 'active' ? 'OK' : 'WAIT'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-text-muted text-[11px] font-black uppercase tracking-widest">
                    Логи нарушений и успехов
                  </h4>
                  <Card className="rounded-3xl border-muted/20 bg-muted/5 p-4">
                    <div className="space-y-6">
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-text-primary text-[10px] font-black uppercase">
                            Улучшение логистики
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            Время обработки заказов снизилось на 15% за последний месяц.
                          </p>
                          <span className="text-text-muted mt-2 block text-[8px] font-bold uppercase">
                            12 Янв 2024
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-text-primary text-[10px] font-black uppercase">
                            Жалоба на качество упаковки
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            Клиент сообщил о повреждении коробки при доставке. Требуется проверка
                            упаковочного материала.
                          </p>
                          <span className="text-text-muted mt-2 block text-[8px] font-bold uppercase">
                            08 Янв 2024
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-text-primary text-[10px] font-black uppercase">
                            Продление статуса «Репутация»
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                            Бренд успешно прошел ежеквартальную проверку доверия платформы.
                          </p>
                          <span className="text-text-muted mt-2 block text-[8px] font-bold uppercase">
                            01 Янв 2024
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="flex gap-2">
                    <Button className="h-12 flex-1 rounded-2xl bg-black text-[10px] font-black uppercase text-white">
                      Связаться с брендом
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 flex-1 rounded-2xl border-muted/20 text-[10px] font-black uppercase"
                    >
                      Назначить аудит
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CabinetPageContent>
  );
}
