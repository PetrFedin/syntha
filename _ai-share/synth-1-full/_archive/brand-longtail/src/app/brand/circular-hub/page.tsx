'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import {
  Leaf,
  Search,
  Filter,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Layers,
  Tag,
  Clock,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  Activity,
  Maximize2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  MOCK_MATERIAL_LISTINGS,
  getConditionLabel,
  getConditionColor,
} from '@/lib/logic/circular-economy-utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

export default function CircularEconomyHubPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredListings = MOCK_MATERIAL_LISTINGS.filter(
    (listing) =>
      (searchTerm === '' ||
        listing.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedType === null || listing.type === selectedType)
  );

  return (
    <CabinetPageContent
      maxWidth="full"
      className="w-full space-y-6 pb-16 duration-700 animate-in fade-in"
    >
      <RegistryPageHeader
        title="Circular Hub"
        leadPlain="Sustainability P3: остатки тканей и материалов, верификация, ESG. Доступно 2 450 кг · углеродный след −12% CO₂."
        eyebrow={
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link href={ROUTES.brand.home} className="transition-colors hover:text-emerald-600">
              Бренд-офис
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Circular Economy Hub</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge variant="outline" className="text-[9px]">
              Sustainability P3
            </Badge>
            <Leaf className="size-6 shrink-0 text-emerald-600" aria-hidden />
            <Button className="h-11 rounded-xl bg-emerald-600 px-6 text-[10px] font-bold uppercase tracking-widest text-white shadow-md hover:bg-emerald-700">
              Продать остатки
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-emerald-200 px-6 text-[10px] font-bold uppercase tracking-widest text-emerald-900 hover:bg-emerald-50"
            >
              Eco Аналитика
            </Button>
          </div>
        }
      />

      {/* Stats / Info */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="border-border-subtle rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-text-primary text-[13px] font-bold uppercase tracking-tight">
                Экономия до 60%
              </h4>
              <p className="text-text-muted mt-0.5 text-[10px] font-bold uppercase tracking-wider">
                От рыночной цены
              </p>
            </div>
          </div>
          <p className="text-text-secondary text-[13px] font-medium leading-relaxed">
            Покупайте качественные остатки тканей от ведущих брендов и фабрик по сниженным ценам.
          </p>
        </Card>

        <Card className="border-text-primary/30 bg-text-primary group relative overflow-hidden rounded-xl border p-4 text-white shadow-lg">
          <div className="absolute -bottom-4 -right-4 opacity-10 transition-transform duration-700 group-hover:scale-110">
            <ShieldCheck className="h-24 w-24 text-emerald-400" />
          </div>
          <div className="relative z-10 mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/10 shadow-inner transition-all group-hover:bg-white/20">
              <Globe className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-tight">Verified Quality</h4>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                Synth Lab Verification
              </p>
            </div>
          </div>
          <p className="relative z-10 text-[13px] font-medium leading-relaxed text-white/60">
            Каждый лот проходит автоматическую верификацию состава через сырьевой паспорт.
          </p>
        </Card>

        <Card className="border-border-subtle rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-text-primary text-[13px] font-bold uppercase tracking-tight">
                ESG Отчетность
              </h4>
              <p className="text-text-muted mt-0.5 text-[10px] font-bold uppercase tracking-wider">
                Zero Waste сертификаты
              </p>
            </div>
          </div>
          <p className="text-text-secondary text-[13px] font-medium leading-relaxed">
            Сделки автоматически учитываются в годовом ESG-отчете как вклад в экономику цикла.
          </p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="bg-bg-surface2 border-border-default flex flex-col justify-between gap-3 rounded-2xl border p-1.5 shadow-inner md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="text-text-muted absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Поиск по ткани, цвету или поставщику..."
            className="h-11 rounded-xl border-none bg-white pl-11 text-[12px] font-medium tracking-tight shadow-sm focus:ring-2 focus:ring-emerald-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 px-1">
          {[
            { id: 'fabric', label: 'Ткани' },
            { id: 'leather', label: 'Кожа' },
            { id: 'yarn', label: 'Пряжа' },
            { id: 'trims', label: 'Фурнитура' },
          ].map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? 'default' : 'ghost'}
              onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
              className={cn(
                'h-9 rounded-lg px-4 text-[10px] font-bold uppercase tracking-wider transition-all',
                selectedType === type.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 hover:bg-emerald-700'
                  : 'text-text-secondary hover:bg-white hover:shadow-sm'
              )}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Marketplace Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredListings.map((listing) => (
            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-border-subtle group cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-xl">
                <div className="bg-bg-surface2 relative aspect-[16/10] overflow-hidden">
                  <img
                    src={listing.images[0]}
                    alt={listing.materialName}
                    className="h-full w-full object-cover transition-transform [transition-duration:1500ms] group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <Badge
                      className={cn(
                        'h-5 border-none px-2 text-[9px] font-bold uppercase shadow-md',
                        getConditionColor(listing.condition)
                      )}
                    >
                      {getConditionLabel(listing.condition)}
                    </Badge>
                    {listing.isEcoCertified && (
                      <Badge className="h-5 border-none bg-emerald-600 px-2 text-[9px] font-bold uppercase text-white shadow-md">
                        <Leaf className="mr-1 h-2.5 w-2.5" /> Eco
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-1 transform items-center justify-center rounded-full bg-white/90 text-emerald-600 opacity-0 shadow-lg backdrop-blur-md transition-all group-hover:translate-y-0 group-hover:bg-emerald-600 group-hover:text-white group-hover:opacity-100">
                    <ShoppingBag className="h-4.5 w-4.5" />
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        {listing.supplierName}
                      </p>
                      <h3 className="text-text-primary text-[15px] font-bold tracking-tight transition-colors group-hover:text-emerald-600">
                        {listing.materialName}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-text-primary text-[15px] font-bold">
                        {listing.pricePerUnit.toLocaleString('ru-RU')} ₽
                      </p>
                      <p className="text-text-muted text-[9px] font-bold uppercase tracking-wider">
                        / {listing.unit === 'meters' ? 'метр' : 'кг'}
                      </p>
                    </div>
                  </div>

                  <div className="border-border-subtle bg-bg-surface2/80 mb-4 grid grid-cols-2 gap-3 rounded-lg border-y px-3 py-4">
                    <div>
                      <p className="text-text-muted mb-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Состав
                      </p>
                      <p className="text-text-primary truncate text-[11px] font-bold">
                        {listing.composition}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted mb-0.5 text-[9px] font-bold uppercase tracking-wider">
                        В наличии
                      </p>
                      <p className="text-text-primary text-[11px] font-bold">
                        {listing.quantity} {listing.unit === 'meters' ? 'м' : 'кг'}
                      </p>
                    </div>
                  </div>

                  <div className="text-text-muted flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <div className="bg-bg-surface2 flex items-center gap-1.5 rounded-md px-2 py-1">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-rose-500">
                        -
                        {Math.round(
                          (1 -
                            listing.pricePerUnit /
                              (listing.originalPrice || listing.pricePerUnit)) *
                            100
                        )}
                        %
                      </span>
                      <ChevronRight className="text-text-muted h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </CabinetPageContent>
  );
}
