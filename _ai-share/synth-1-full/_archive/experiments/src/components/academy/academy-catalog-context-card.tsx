'use client';

import Link from 'next/link';
import { ExternalLink, Globe, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EducationCourse } from '@/lib/types';
import {
  courseAudienceKindLabel,
  courseOutcomeLabel,
  courseProfessionalScopeLabel,
  formatCoursePrice,
} from '@/lib/academy-course-meta';
import { catalogSourceLabel, moderationStatusStudioLabel } from '@/lib/academy-moderation-labels';
import { getAuthorWorkspaceHome, getClientCatalogPreview } from '@/lib/academy-course-context';

type AcademyCatalogContextCardProps = {
  course: EducationCourse;
};

/**
 * Связка курса с клиентским каталогом, модерацией и студией автора (кабинет бренда).
 */
export function AcademyCatalogContextCard({ course }: AcademyCatalogContextCardProps) {
  const preview = getClientCatalogPreview(course);
  const workspace = getAuthorWorkspaceHome(course);
  const scope = courseProfessionalScopeLabel(course);

  return (
    <Card className="border-border-default/80 border-dashed bg-[#fafbfc]">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Shield className="text-accent-primary size-4 shrink-0" aria-hidden />
          <CardTitle className="text-text-primary text-base font-semibold">
            Контекст каталога
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-normal">
            {catalogSourceLabel(course.catalogSource)}
          </Badge>
          {course.catalogSource !== 'platform' && course.moderationStatus ? (
            <Badge variant="outline" className="font-normal">
              {moderationStatusStudioLabel(course.moderationStatus)}
            </Badge>
          ) : null}
          <Badge variant="outline" className="font-normal">
            {courseAudienceKindLabel(course)}
            {scope ? ` · ${scope}` : ''}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {formatCoursePrice(course)}
          </Badge>
          {courseOutcomeLabel(course) ? (
            <Badge variant="outline" className="font-normal">
              {courseOutcomeLabel(course)}
            </Badge>
          ) : null}
        </div>

        {preview.kind === 'live' ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-text-secondary text-sm">
              Этот курс доступен клиентам в каталоге{' '}
              <span className="text-text-primary font-medium">/academy</span>.
            </p>
            <Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5" asChild>
              <Link href={preview.href} target="_blank" rel="noopener noreferrer">
                <Globe className="size-3.5" aria-hidden />
                Открыть как клиент
                <ExternalLink className="size-3 opacity-70" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
            <p className="text-text-primary text-sm font-semibold">{preview.title}</p>
            <p className="text-text-secondary text-sm leading-relaxed">{preview.description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {preview.primaryAction ? (
                <Button variant="default" size="sm" className="h-8 text-xs" asChild>
                  <Link href={preview.primaryAction.href}>{preview.primaryAction.label}</Link>
                </Button>
              ) : null}
              {preview.secondaryAction ? (
                <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                  <Link href={preview.secondaryAction.href}>{preview.secondaryAction.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {workspace ? (
          <p className="text-text-muted text-xs">
            Студия автора:{' '}
            <Link
              href={workspace.href}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {workspace.label}
            </Link>
          </p>
        ) : (
          <p className="text-text-muted text-xs">
            Платформенный курс Syntha — модерация не требуется.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
