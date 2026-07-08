'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WidgetCard } from '@/components/ui/widget-card';
import { AcademySegmentSwitcher } from '@/components/brand/AcademySegmentSwitcher';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { getCollectionTrainingById } from '@/lib/academy/brand-academy-data';
import { COLLECTION_TRAINING_TYPE_LABELS } from '@/lib/academy/brand-academy-data';
import { RegistryPageHeader } from '@/components/design-system';

export default function CollectionTrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string | undefined) ?? '';
  const training = getCollectionTrainingById(id);

  if (!training) {
    return (
      <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
        <RegistryPageHeader
          title="Обучение не найдено"
          leadPlain="Записи с таким идентификатором нет в демо-данных."
          eyebrow={
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 shrink-0"
              onClick={() => router.back()}
              aria-label="Назад"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          }
        />
        <Button variant="outline" asChild>
          <Link href={ROUTES.brand.academy}>Вернуться в академию</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title={training.title}
        leadPlain={`${training.collectionName} · ${training.season}`}
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
        description="Материалы для партнёров, купивших коллекцию."
      >
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
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
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-text-primary leading-relaxed">{training.description}</p>
            {training.forStores && (
              <p className="text-text-secondary text-[11px]">
                Доступно магазинам, купившим коллекцию {training.collectionName}
              </p>
            )}
          </CardContent>
        </Card>
      </WidgetCard>

      <Button variant="outline" asChild>
        <Link href={ROUTES.brand.academyStores}>← К списку тренингов</Link>
      </Button>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
