'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { WidgetCard } from '@/components/ui/widget-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { Store, Search, ChevronRight, Plus, Clock } from 'lucide-react';
import { EmptyStateB2B } from '@/components/ui/empty-state-b2b';
import { getCollectionTrainings } from '@/lib/academy/brand-academy-data';
import { RegistryPageHeader } from '@/components/design-system';

export default function AcademyStoresPage() {
  const [searchStores, setSearchStores] = useState('');
  const [filterCollection, setFilterCollection] = useState<string>('Все');

  const collectionIds = useMemo(() => {
    const ids = new Set<string>();
    getCollectionTrainings().forEach((t) => ids.add(t.collectionId));
    return Array.from(ids);
  }, []);

  const collectionTrainings = useMemo(() => {
    const all = getCollectionTrainings();
    const bySearch = !searchStores
      ? all
      : all.filter(
          (t) =>
            t.title.toLowerCase().includes(searchStores.toLowerCase()) ||
            t.description.toLowerCase().includes(searchStores.toLowerCase())
        );
    if (filterCollection === 'Все') return bySearch;
    return bySearch.filter((t) => t.collectionId === filterCollection);
  }, [searchStores, filterCollection]);

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Тренинги по коллекциям для магазинов"
        leadPlain="Product knowledge, мерчандайзинг и тренинги для партнёров."
      />
      <section className="space-y-6">
        <WidgetCard
          title="Тренинги"
          description="Поиск и фильтрация по коллекциям"
          actions={
            <Button variant="outline" className="rounded-lg" asChild>
              <Link href={ROUTES.brand.academyCollectionTrainingCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Добавить
              </Link>
            </Button>
          }
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Поиск по тренингам..."
                value={searchStores}
                onChange={(e) => setSearchStores(e.target.value)}
                className="h-11 rounded-xl pl-9"
              />
            </div>
            <select
              value={filterCollection}
              onChange={(e) => setFilterCollection(e.target.value)}
              className="border-border-default min-w-[160px] rounded-xl border px-3 py-2.5 text-sm"
            >
              <option value="Все">Все коллекции</option>
              {collectionIds.map((cid) => (
                <option key={cid} value={cid}>
                  {cid.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            {collectionTrainings.length === 0 ? (
              <EmptyStateB2B
                icon={Store}
                title="Нет тренингов"
                description="Добавьте обучение по коллекции для магазинов"
                action={
                  <Button variant="outline" size="sm" className="rounded-lg" asChild>
                    <Link href={ROUTES.brand.academyCollectionTrainingCreate}>Добавить</Link>
                  </Button>
                }
              />
            ) : (
              collectionTrainings.map((t) => (
                <Link key={t.id} href={ROUTES.brand.academyCollectionTraining(t.id)}>
                  <div className="border-border-default/80 hover:border-border-default flex cursor-pointer items-start justify-between rounded-xl border p-5 transition-all hover:shadow-md">
                    <div>
                      <p className="text-text-primary font-semibold">{t.title}</p>
                      <p className="text-text-secondary mt-1 text-[11px]">{t.description}</p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline" className="text-[9px]">
                          {t.collectionName} · {t.season}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px]">
                          <Clock className="mr-0.5 h-2.5 w-2.5" /> {t.duration}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px]">
                          {t.modules} модулей
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="text-text-muted h-4 w-4 shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </WidgetCard>
      </section>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
