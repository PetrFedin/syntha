'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { Store, BookOpen, ChevronRight, Clock, PlayCircle } from 'lucide-react';
import {
  getCollectionTrainings,
  getBrandKnowledgeArticles,
} from '@/lib/academy/brand-academy-data';
import { COLLECTION_TRAINING_TYPE_LABELS } from '@/lib/academy/brand-academy-data';
import { cn } from '@/lib/utils';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';

/** Мок: коллекции, купленные магазином (в проде — из заказов/договоров) */
const PURCHASED_COLLECTIONS = ['fw26', 'ss26'];

export default function ShopAcademyPage() {
  const [activeTab, setActiveTab] = useState<'trainings' | 'knowledge'>('trainings');
  const allTrainings = getCollectionTrainings();
  const myTrainings = allTrainings.filter(
    (t) => PURCHASED_COLLECTIONS.includes(t.collectionId) && t.forStores
  );
  const knowledgeArticles = getBrandKnowledgeArticles('partners');

  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6">
      <ShopB2bContentHeader lead="Обучение по купленным коллекциям и база знаний бренда для партнёров." />

      <div className="bg-bg-surface2 flex gap-1 rounded-xl p-2">
        <button
          type="button"
          onClick={() => setActiveTab('trainings')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors',
            activeTab === 'trainings'
              ? 'text-text-primary bg-white shadow-sm'
              : 'text-text-secondary hover:bg-white/60'
          )}
        >
          <Store className="h-3.5 w-3.5" /> По коллекциям
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('knowledge')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors',
            activeTab === 'knowledge'
              ? 'text-text-primary bg-white shadow-sm'
              : 'text-text-secondary hover:bg-white/60'
          )}
        >
          <BookOpen className="h-3.5 w-3.5" /> База знаний
        </button>
      </div>

      {activeTab === 'trainings' && (
        <div className="mt-6">
          <Card className="border-border-subtle rounded-xl border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="text-accent-primary h-5 w-5" /> Тренинги по коллекциям
              </CardTitle>
              <CardDescription>
                Product knowledge, мерчандайзинг, скрипты продаж — по коллекциям, которые вы
                закупили.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {myTrainings.length === 0 ? (
                <p className="text-text-secondary text-sm">
                  Нет доступных тренингов. Обучающие материалы появятся после закупки коллекций.
                </p>
              ) : (
                myTrainings.map((t) => (
                  <Link key={t.id} href={ROUTES.shop.b2bAcademyTraining(t.id)}>
                    <div className="border-border-subtle hover:border-accent-primary/20 flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-colors">
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
                            {COLLECTION_TRAINING_TYPE_LABELS[t.type] ?? t.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="text-accent-primary h-5 w-5" />
                        <ChevronRight className="text-text-muted h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="mt-6">
          <Card className="border-border-subtle rounded-xl border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-accent-primary h-5 w-5" /> База знаний бренда
              </CardTitle>
              <CardDescription>
                Информация о бренде, процессах, индустрии — для партнёров.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {knowledgeArticles.length === 0 ? (
                <p className="text-text-secondary py-8 text-center text-sm">
                  Нет статей в базе знаний.
                </p>
              ) : (
                knowledgeArticles.map((a) => (
                  <Link key={a.id} href={ROUTES.shop.b2bAcademyKnowledge(a.id)}>
                    <div className="border-border-subtle hover:border-accent-primary/20 flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-colors">
                      <div>
                        <p className="text-text-primary font-semibold">{a.title}</p>
                        <p className="text-text-secondary mt-1 text-[11px]">{a.excerpt}</p>
                      </div>
                      <ChevronRight className="text-text-muted h-4 w-4 shrink-0" />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Button variant="outline" asChild>
        <Link href={ROUTES.shop.home}>← Кабинет магазина</Link>
      </Button>
    </CabinetPageContent>
  );
}
