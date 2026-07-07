'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, BookOpen, Clock, PlayCircle, Search, Star } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyStateB2B } from '@/components/ui/empty-state-b2b';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import {
  DEMO_ORGANIZATION_OWNER_ID,
  filterCoursesVisibleInClientCatalog,
  getCoursesForOrganizationAcademyStudio,
} from '@/lib/academy-catalog';
import { academyLevelLabels } from '@/lib/education-data';
import { courseProfessionalScopeLabel } from '@/lib/academy-course-meta';
import { AcademyStudioCourseOriginBadges } from '@/components/academy/academy-studio-course-origin-badges';
import { RegistryPageHeader } from '@/components/design-system';

const CATEGORIES = [
  { id: 'all', label: 'Все', value: '' },
  { id: 'economics', label: 'Экономика', value: 'economics' },
  { id: 'legal', label: 'Право', value: 'legal' },
  { id: 'management', label: 'Менеджмент', value: 'management' },
  { id: 'retail', label: 'Ритейл', value: 'retail' },
];

export default function OrganizationAcademyStudioPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [matchClientCatalogOnly, setMatchClientCatalogOnly] = useState(false);

  const orgPool = useMemo(
    () => getCoursesForOrganizationAcademyStudio(DEMO_ORGANIZATION_OWNER_ID),
    []
  );

  const filtered = useMemo(() => {
    const pool = matchClientCatalogOnly ? filterCoursesVisibleInClientCatalog(orgPool) : orgPool;
    return pool.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = !category || c.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category, orgPool, matchClientCatalogOnly]);

  const pendingCount = orgPool.filter((c) => c.moderationStatus === 'pending_review').length;

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-10 pb-16">
      <RegistryPageHeader
        title="Студия организации"
        leadPlain="Курсы, которые ведёт партнёрская организация: публикация в клиентском каталоге возможна только после согласования с платформой. Демо-данные для org-demo-partner."
      />

      <div className="border-border-default/80 flex flex-col gap-4 rounded-2xl border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-accent-primary/12 flex size-11 shrink-0 items-center justify-center rounded-xl">
            <Building2 className="text-accent-primary size-5" aria-hidden />
          </div>
          <div>
            <p className="text-text-primary text-sm font-semibold">Модерация платформы</p>
            <p className="text-text-secondary mt-1 max-w-xl text-sm leading-relaxed">
              Заявки на публикацию попадают в общую очередь администраторов. Пока статус «На
              модерации», курс не показывается клиентам в витрине академии.
            </p>
            {pendingCount > 0 ? (
              <p className="text-text-muted mt-2 text-xs">
                Сейчас на проверке:{' '}
                <span className="text-text-primary font-medium">{pendingCount}</span> из{' '}
                {orgPool.length}
              </p>
            ) : null}
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 self-start sm:self-center">
          <Link href={ROUTES.admin.academyModeration}>Очередь модерации</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-text-muted absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Поиск по названию или описанию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border-default h-12 rounded-xl pl-11 text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.value ? 'default' : 'outline'}
              size="sm"
              className="h-10 rounded-xl px-4 font-medium"
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <section>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-text-primary text-xl font-bold">Курсы организации</h2>
            <p className="text-text-secondary mt-1 text-sm">Найдено: {filtered.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="org-match-client-catalog"
              checked={matchClientCatalogOnly}
              onCheckedChange={(v) => setMatchClientCatalogOnly(v === true)}
            />
            <Label
              htmlFor="org-match-client-catalog"
              className="text-text-secondary cursor-pointer text-sm font-normal leading-snug"
            >
              Как на витрине{' '}
              <Link
                href={ROUTES.academyPlatform}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                /academy
              </Link>
            </Label>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full">
              <EmptyStateB2B
                icon={BookOpen}
                title="Нет курсов по фильтрам"
                description={
                  matchClientCatalogOnly
                    ? 'Снимите режим «Как на витрине /academy» или ослабьте поиск — в студии показываются также платформенные курсы и черновики организации.'
                    : 'Измените поиск или категорию.'
                }
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setCategory('');
                      setMatchClientCatalogOnly(false);
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                }
              />
            </div>
          ) : null}
          {filtered.map((course) => (
            <Link key={course.id} href={ROUTES.brand.academyPlatformCourse(course.id)}>
              <Card className="border-border-default/80 hover:border-accent-primary/30 group h-full overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-md hover:shadow-xl">
                <div className="bg-bg-surface2 relative aspect-video overflow-hidden">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="from-bg-surface2 to-border-subtle absolute inset-0 flex items-center justify-center bg-gradient-to-br">
                      <PlayCircle className="text-text-muted h-12 w-12" />
                    </div>
                  )}
                  <AcademyStudioCourseOriginBadges course={course} />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-text-primary line-clamp-2 font-semibold leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-text-secondary mt-2 line-clamp-2 text-sm">
                    {course.description}
                  </p>
                  {course.audienceKind === 'professional' &&
                  courseProfessionalScopeLabel(course) ? (
                    <p className="text-text-muted mt-2 text-[11px] font-medium">
                      {courseProfessionalScopeLabel(course)}
                    </p>
                  ) : null}
                  <div className="text-text-secondary mt-4 flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {course.rating}
                    </span>
                    <span>{course.studentsCount.toLocaleString()} слушателей</span>
                  </div>
                  {course.level ? (
                    <Badge variant="outline" className="mt-3 text-[10px]">
                      {academyLevelLabels[course.level] ?? course.level}
                    </Badge>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
