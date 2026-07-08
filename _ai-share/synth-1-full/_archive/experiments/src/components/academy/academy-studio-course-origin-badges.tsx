'use client';

import { Badge } from '@/components/ui/badge';
import type { EducationCourse } from '@/lib/types';
import {
  catalogSourceLabel,
  moderationStatusBadgeVariant,
  moderationStatusStudioLabel,
} from '@/lib/academy-moderation-labels';

type AcademyStudioCourseOriginBadgesProps = {
  course: EducationCourse;
  /** Бейджи модерации для курсов бренда/организации (по умолчанию вкл.) */
  showModeration?: boolean;
  /** Бейдж «Архив» для снятых с витрины курсов */
  showArchived?: boolean;
  className?: string;
};

/**
 * Подписи источника и статуса на превью курса в студиях бренда/организации и витрине платформы.
 */
export function AcademyStudioCourseOriginBadges({
  course,
  showModeration = true,
  showArchived = true,
  className,
}: AcademyStudioCourseOriginBadgesProps) {
  return (
    <div
      className={
        className ??
        'absolute left-3 top-3 z-10 flex max-w-[min(100%,14rem)] flex-col items-start gap-1.5'
      }
    >
      <Badge variant="secondary" className="text-[9px] font-medium shadow-sm">
        {catalogSourceLabel(course.catalogSource)}
      </Badge>
      {showModeration && course.catalogSource !== 'platform' && course.moderationStatus ? (
        <Badge
          variant={moderationStatusBadgeVariant(course.moderationStatus)}
          className="text-[9px] font-medium shadow-sm"
        >
          {moderationStatusStudioLabel(course.moderationStatus)}
        </Badge>
      ) : null}
      {showArchived && course.archived ? (
        <Badge variant="outline" className="border-dashed text-[9px] font-medium shadow-sm">
          Архив витрины
        </Badge>
      ) : null}
    </div>
  );
}
