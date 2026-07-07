'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { getCollectionTrainingById } from '@/lib/academy/brand-academy-data';
import { COLLECTION_TRAINING_TYPE_LABELS } from '@/lib/academy/brand-academy-data';

export default function ShopTrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const training = getCollectionTrainingById(id);

  if (!training) {
    return (
      <CabinetPageContent maxWidth="2xl" className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-text-secondary mt-4">Обучение не найдено</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href={ROUTES.shop.b2bAcademy}>В академию</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  return (
    <CabinetPageContent maxWidth="2xl" className="space-y-6">
      <ShopB2bContentHeader
        backHref={ROUTES.shop.b2bAcademy}
        lead={
          <>
            <span className="font-medium">{training.title}</span>
            <span className="text-text-secondary mt-1 block text-sm">
              {training.collectionName} · {training.season}
            </span>
          </>
        }
      />

      <Card className="border-border-subtle rounded-xl border">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {COLLECTION_TRAINING_TYPE_LABELS[training.type] ?? training.type}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              <Clock className="mr-1 inline h-2.5 w-2.5" /> {training.duration}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              <BookOpen className="mr-1 inline h-2.5 w-2.5" /> {training.modules} модулей
            </Badge>
          </div>
          <p className="text-text-primary leading-relaxed">{training.description}</p>
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href={ROUTES.shop.b2bAcademy}>← К списку тренингов</Link>
      </Button>
    </CabinetPageContent>
  );
}
