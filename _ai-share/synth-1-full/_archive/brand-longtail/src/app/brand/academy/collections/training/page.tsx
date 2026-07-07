'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WidgetCard } from '@/components/ui/widget-card';
import { AcademySegmentSwitcher } from '@/components/brand/AcademySegmentSwitcher';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { addCollectionTraining } from '@/lib/academy/brand-academy-data';
import { ArrowLeft } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

const COLLECTION_OPTIONS = [
  { id: 'fw26', name: 'FW26 Main', season: 'FW26' },
  { id: 'ss26', name: 'SS26 Pre-collection', season: 'SS26' },
];

export default function CollectionTrainingPage() {
  const router = useRouter();
  const [collectionId, setCollectionId] = useState('fw26');
  const [type, setType] = useState<'product' | 'merchandising' | 'sales' | 'full'>('product');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [modules, setModules] = useState(3);

  const collection = COLLECTION_OPTIONS.find((c) => c.id === collectionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const training = addCollectionTraining({
      collectionId,
      collectionName: collection?.name ?? collectionId,
      season: collection?.season ?? collectionId,
      type,
      title,
      description,
      duration: duration || '30 мин',
      modules,
      forStores: true,
    });
    router.push(ROUTES.brand.academyCollectionTraining(training.id));
  };

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title="Обучение по коллекции"
        leadPlain="Для магазинов: product knowledge, мерчандайзинг"
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.academy} aria-label="Назад в академию">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={<AcademySegmentSwitcher active="brand" />}
      />

      <WidgetCard
        title="Обучение для магазинов"
        description="Магазины, купившие коллекцию, получают доступ к материалам для обучения своих продавцов: продуктовая линейка, выкладка, скрипты продаж."
      >
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader>
            <CardTitle>Добавить обучение</CardTitle>
            <CardDescription>Привязка к коллекции, тип, модули.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Коллекция</Label>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                >
                  {COLLECTION_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.season}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Тип обучения</Label>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                >
                  <option value="full">Полное (product + merchandising + sales)</option>
                  <option value="product">Product knowledge</option>
                  <option value="merchandising">Мерчандайзинг</option>
                  <option value="sales">Скрипты продаж</option>
                </select>
              </div>
              <div>
                <Label>Название</Label>
                <Input
                  placeholder="Ключевые модели FW26"
                  className="mt-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea
                  placeholder="Материалы, крой, USP каждой модели..."
                  rows={3}
                  className="mt-1"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div>
                  <Label>Длительность</Label>
                  <Input
                    placeholder="45 мин"
                    className="mt-1 w-32"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Модулей</Label>
                  <Input
                    type="number"
                    min={1}
                    className="mt-1 w-24"
                    value={modules}
                    onChange={(e) => setModules(Number(e.target.value) || 1)}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit">Сохранить</Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={ROUTES.brand.academy}>Отмена</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </WidgetCard>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
