'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WidgetCard } from '@/components/ui/widget-card';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft } from 'lucide-react';
import { AcademySegmentSwitcher } from '@/components/brand/AcademySegmentSwitcher';
import { getKnowledgeArticle } from '@/lib/academy/brand-academy-data';
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/academy/brand-academy-data';
import { RegistryPageHeader } from '@/components/design-system';

export default function KnowledgeArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string | undefined) ?? '';
  const article = getKnowledgeArticle(id);

  if (!article) {
    return (
      <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
        <RegistryPageHeader
          title="Статья не найдена"
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
        title={article.title}
        leadPlain={`База знаний · ${KNOWLEDGE_CATEGORY_LABELS[article.category] ?? article.category}`}
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.academy} aria-label="Назад в академию">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={<AcademySegmentSwitcher active="brand" />}
      />

      <WidgetCard title="База знаний" description="Статьи для партнёров и клиентов.">
        <Card className="border-border-subtle rounded-xl border">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {KNOWLEDGE_CATEGORY_LABELS[article.category] ?? article.category}
              </Badge>
              {article.audience.map((aud) => (
                <Badge key={aud} variant="secondary" className="text-[10px]">
                  {aud === 'partners' ? 'Партнёрам' : aud === 'clients' ? 'Клиентам' : 'Команде'}
                </Badge>
              ))}
              <span className="text-text-secondary text-[11px]">Обновлено {article.updatedAt}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-text-primary leading-relaxed">{article.excerpt}</p>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[9px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </WidgetCard>

      <Button variant="outline" asChild>
        <Link href={ROUTES.brand.academyKnowledge}>← К списку статей</Link>
      </Button>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
