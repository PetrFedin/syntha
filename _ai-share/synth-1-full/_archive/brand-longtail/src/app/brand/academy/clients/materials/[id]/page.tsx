'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WidgetCard } from '@/components/ui/widget-card';
import { AcademySegmentSwitcher } from '@/components/brand/AcademySegmentSwitcher';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getClientMaterialById } from '@/lib/academy/brand-academy-data';
import { RegistryPageHeader } from '@/components/design-system';

const TYPE_LABELS: Record<string, string> = {
  care: 'Уход за изделиями',
  styling: 'Стилинг / сочетания',
  intro: 'О коллекции',
  lookbook: 'Lookbook',
};

export default function ClientMaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string | undefined) ?? '';
  const material = getClientMaterialById(id);

  if (!material) {
    return (
      <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
        <RegistryPageHeader
          title="Материал не найден"
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
        title={material.title}
        leadPlain={TYPE_LABELS[material.type] ?? material.type}
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.academy} aria-label="Назад в академию">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={<AcademySegmentSwitcher active="brand" />}
      />

      <WidgetCard title="Для клиентов" description="Материалы для конечных покупателей.">
        <Card className="border-border-subtle rounded-xl border">
          <CardContent className="space-y-4 pt-6">
            <div className="flex gap-2">
              <Badge variant="outline">{TYPE_LABELS[material.type] ?? material.type}</Badge>
              {material.collectionId && (
                <Badge variant="secondary" className="text-[10px]">
                  {material.collectionId.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-text-primary leading-relaxed">{material.description}</p>
            {material.url && (
              <Button variant="outline" size="sm" asChild>
                <a href={material.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ExternalLink className="h-3.5 w-3.5" /> Открыть материал
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </WidgetCard>

      <Button variant="outline" asChild>
        <Link href={ROUTES.brand.academyClients}>← К списку материалов</Link>
      </Button>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
