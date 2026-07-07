'use client';

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
import { addClientMaterial } from '@/lib/academy/brand-academy-data';
import { ArrowLeft } from 'lucide-react';

export default function ClientMaterialsPage() {
  const router = useRouter();
  const [type, setType] = useState<'care' | 'styling' | 'intro' | 'lookbook'>('care');
  const [collectionId, setCollectionId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const material = addClientMaterial({
      collectionId: collectionId || undefined,
      type,
      title,
      description,
      url: url || undefined,
    });
    router.push(ROUTES.brand.academyClientMaterial(material.id));
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.brand.academy}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Материалы для клиентов</h1>
            <p className="text-sm text-slate-500">Уход, стилинг, коллекции — для покупателей</p>
          </div>
        </div>
        <AcademySegmentSwitcher active="brand" />
      </div>

      <WidgetCard
        title="Для клиентов"
        description="Обучающие и ознакомительные материалы: уход за изделиями, идеи стилизации, описание коллекций. Доступны покупателям на сайте и в приложении."
      >
        <Card className="rounded-xl border border-slate-100">
          <CardHeader>
            <CardTitle>Добавить материал</CardTitle>
            <CardDescription>Уход, стилинг, о коллекции, lookbook.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Тип</Label>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                >
                  <option value="care">Уход за изделиями</option>
                  <option value="styling">Стилинг / сочетания</option>
                  <option value="intro">О коллекции</option>
                  <option value="lookbook">Lookbook</option>
                </select>
              </div>
              <div>
                <Label>Коллекция (опционально)</Label>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                >
                  <option value="">— Общее —</option>
                  <option value="fw26">FW26 Main</option>
                  <option value="ss26">SS26 Pre-collection</option>
                </select>
              </div>
              <div>
                <Label>Название</Label>
                <Input
                  placeholder="Уход за изделиями FW26"
                  className="mt-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea
                  placeholder="Стирка, хранение, ремонт..."
                  rows={3}
                  className="mt-1"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Ссылка на контент (опционально)</Label>
                <Input
                  type="url"
                  placeholder="https://…"
                  className="mt-1"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
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
    </div>
  );
}
