'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AcademySegmentSwitcher } from '@/components/brand/AcademySegmentSwitcher';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { getPlatformArticleById, getCourseById } from '@/lib/education-data';
import { ArrowLeft } from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

export default function PlatformArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string | undefined) ?? '';
  const article = getPlatformArticleById(id);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  if (!article) {
    return (
      <CabinetPageContent
        maxWidth="full"
        className="from-bg-surface2/80 to-bg-surface w-full space-y-6 bg-gradient-to-b pb-16"
      >
        <RegistryPageHeader
          title="Статья не найдена"
          leadPlain="Материал отсутствует в демо-данных платформы."
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
          <Link href={ROUTES.brand.academyPlatform}>Вернуться в Академию платформы</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  const relatedIds = (article as { relatedIds?: string[] }).relatedIds ?? [];
  const relatedCourses = relatedIds
    .map((rid) => getCourseById(rid))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const category = (article as { category?: string }).category ?? 'Статья';
  const updated = formatDate((article as { updatedAt?: string }).updatedAt ?? '');
  const authorName = (article as { authorName?: string }).authorName;
  const leadPlain = [
    `База знаний · ${category} · Обновлено ${updated}`,
    authorName ? `Автор: ${authorName}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <CabinetPageContent
      maxWidth="full"
      className="from-bg-surface2/80 to-bg-surface w-full space-y-8 bg-gradient-to-b pb-16"
    >
      <RegistryPageHeader
        title={article.title}
        leadPlain={leadPlain}
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.academyPlatform} aria-label="К списку платформы">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={<AcademySegmentSwitcher active="platform" />}
      />

      <article className="space-y-8">
        <Card className="border-border-default/80 rounded-2xl border">
          <CardContent className="prose prose-slate max-w-none p-6">
            <p className="text-text-primary text-base leading-relaxed">
              {(article as { content?: string }).content ?? article.excerpt}
            </p>
          </CardContent>
        </Card>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {relatedCourses.length > 0 && (
          <div>
            <h2 className="text-text-primary mb-3 font-semibold">Связанные курсы</h2>
            <div className="space-y-2">
              {relatedCourses.map((course) => (
                <Link key={course.id} href={ROUTES.brand.academyPlatformCourse(course.id)}>
                  <div className="border-border-default/80 hover:border-accent-primary/30 hover:bg-accent-primary/10 flex items-center justify-between rounded-xl border p-4 transition-colors">
                    <span className="text-text-primary font-medium">{course.title}</span>
                    <ArrowLeft className="text-text-muted h-4 w-4 rotate-180" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Button variant="outline" asChild>
        <Link href={ROUTES.brand.academyPlatform} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> К базе знаний
        </Link>
      </Button>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
