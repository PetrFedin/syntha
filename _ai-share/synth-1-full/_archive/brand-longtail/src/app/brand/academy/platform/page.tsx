'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetCard } from '@/components/ui/widget-card';
import { EmptyStateB2B } from '@/components/ui/empty-state-b2b';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Clock,
  Star,
  ChevronRight,
  Search,
  BookOpen,
  Lightbulb,
  ListOrdered,
  FileText,
  Award,
  Store,
  Shirt,
  Factory,
  Users,
  PlayCircle,
  Calendar,
  Building2,
  MessageCircle,
} from 'lucide-react';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import {
  mockArticles,
  mockAcademyEvents,
  getMyPlatformEnrollments,
  getCourseById,
  academyLevelLabels,
} from '@/lib/education-data';
import {
  DEMO_BRAND_OWNER_ID,
  filterCoursesVisibleInClientCatalog,
  getCoursesForBrandAcademyStudio,
  getLearningPathsForClient,
} from '@/lib/academy-catalog';
import { cn } from '@/lib/utils';
import { RegistryPageHeader } from '@/components/design-system';
import { AcademyStudioCourseOriginBadges } from '@/components/academy/academy-studio-course-origin-badges';
import { academyCohortChatId, academyStaffChatId } from '@/lib/academy/academy-course-chats';
import { AcademyClientLearningBar } from '@/components/academy/academy-client-learning-bar';

const CATEGORIES = [
  { id: 'all', label: 'Все', value: '' },
  { id: 'economics', label: 'Экономика', value: 'economics' },
  { id: 'design', label: 'Дизайн', value: 'design' },
  { id: 'management', label: 'Менеджмент', value: 'management' },
  { id: 'retail', label: 'Ритейл', value: 'retail' },
];

export default function AcademyPlatformPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  /** Сузить список до курсов, видимых на клиентской витрине /academy */
  const [matchClientCatalogOnly, setMatchClientCatalogOnly] = useState(false);

  /** Витрина платформы + курсы этого бренда (включая черновики и заявки — демо). */
  const brandAcademyPool = useMemo(() => getCoursesForBrandAcademyStudio(DEMO_BRAND_OWNER_ID), []);

  const myEnrollments = getMyPlatformEnrollments();
  const myEnrollmentCourses = useMemo(
    () =>
      myEnrollments
        .map((e) => ({ enrollment: e, course: getCourseById(e.courseId) }))
        .filter((x) => x.course),
    [myEnrollments]
  );

  const clientLearningPaths = useMemo(() => getLearningPathsForClient(), []);

  const filteredCourses = useMemo(() => {
    const pool = matchClientCatalogOnly
      ? filterCoursesVisibleInClientCatalog(brandAcademyPool)
      : brandAcademyPool;
    return pool.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = !category || c.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category, brandAcademyPool, matchClientCatalogOnly]);

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-12 pb-16">
      <RegistryPageHeader
        title="Курсы платформы"
        leadPlain="Курсы, траектории обучения, статьи и события академии платформы для разных ролей в fashion-экосистеме."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-[10px] font-bold uppercase"
            asChild
          >
            <Link href={ROUTES.brand.academyOrganizationStudio}>
              <Building2 className="size-3.5" aria-hidden />
              Студия организации
            </Link>
          </Button>
        }
      />
      {/* Мои курсы */}
      {myEnrollmentCourses.length > 0 && (
        <WidgetCard title="Мои курсы" description="Курсы в процессе прохождения">
          <div className="space-y-3">
            {myEnrollmentCourses.map(({ enrollment, course }) => (
              <div
                key={enrollment.courseId}
                className="border-accent-primary/20 bg-accent-primary/10 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link
                  href={ROUTES.brand.academyPlatformCourse(enrollment.courseId)}
                  className="hover:bg-accent-primary/5 -m-1 flex min-w-0 flex-1 items-center gap-4 rounded-lg p-1 transition-colors"
                >
                  <div className="bg-accent-primary/15 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <PlayCircle className="text-accent-primary h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-text-primary font-semibold">{course!.title}</p>
                      {course!.archived ? (
                        <Badge variant="outline" className="text-[9px] font-normal">
                          Архив витрины
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-text-secondary text-xs">{course!.duration}</span>
                      <div className="w-24">
                        <Progress value={enrollment.progress} className="h-1.5 rounded-full" />
                      </div>
                      <span className="text-accent-primary text-xs font-medium">
                        {enrollment.progress}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-text-muted h-4 w-4 shrink-0" />
                </Link>
                <div className="flex shrink-0 flex-wrap gap-2 border-t border-black/5 pt-2 sm:border-t-0 sm:pt-0 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-3">
                  <Link
                    href={ROUTES.brand.messagesChat(academyStaffChatId(enrollment.courseId))}
                    className="text-accent-primary inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-[10px] font-semibold hover:bg-white/60 hover:underline"
                  >
                    <MessageCircle className="size-3 shrink-0" aria-hidden />
                    Куратор
                  </Link>
                  <Link
                    href={ROUTES.brand.messagesChat(academyCohortChatId(enrollment.courseId))}
                    className="text-text-secondary inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-[10px] font-semibold hover:bg-white/60 hover:underline"
                  >
                    <Users className="size-3 shrink-0" aria-hidden />
                    Группа
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>
      )}

      <AcademyClientLearningBar
        messagesRole="brand"
        className="border-border-default/80 bg-bg-surface2/40 rounded-xl border"
      />

      {/* Для кого */}
      <section>
        <h2 className="text-text-secondary mb-4 text-sm font-semibold uppercase tracking-wider">
          Для кого
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="border-border-default/80 hover:border-accent-primary/30 rounded-2xl border bg-white p-5 transition-colors">
            <Store className="text-accent-primary mb-3 h-8 w-8" />
            <h3 className="text-text-primary font-semibold">Магазины</h3>
            <p className="text-text-secondary mt-1 text-xs">
              Мерчандайзинг, продажи, продуктовая экспертиза
            </p>
          </div>
          <div className="border-border-default/80 hover:border-accent-primary/30 rounded-2xl border bg-white p-5 transition-colors">
            <Shirt className="text-accent-primary mb-3 h-8 w-8" />
            <h3 className="text-text-primary font-semibold">Бренды</h3>
            <p className="text-text-secondary mt-1 text-xs">Дизайн, стратегия, построение бренда</p>
          </div>
          <div className="border-border-default/80 hover:border-accent-primary/30 rounded-2xl border bg-white p-5 transition-colors">
            <Factory className="text-accent-primary mb-3 h-8 w-8" />
            <h3 className="text-text-primary font-semibold">Производители</h3>
            <p className="text-text-secondary mt-1 text-xs">Логистика, поставки, ESG, compliance</p>
          </div>
          <div className="border-border-default/80 hover:border-accent-primary/30 rounded-2xl border bg-white p-5 transition-colors">
            <Users className="text-accent-primary mb-3 h-8 w-8" />
            <h3 className="text-text-primary font-semibold">Дистрибьюторы</h3>
            <p className="text-text-secondary mt-1 text-xs">
              B2B-операции, маржа, управление запасами
            </p>
          </div>
        </div>
      </section>

      {/* Поиск и категории */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-text-muted absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Поиск курсов по названию или описанию..."
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

      {/* Траектории обучения */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h2 className="text-text-primary text-xl font-bold">Траектории обучения</h2>
          </div>
        </div>
        <p className="text-text-secondary mb-6 max-w-3xl text-sm leading-relaxed">
          Программы из нескольких курсов в логичном порядке: видно длительность, число шагов,
          уровень и что получите по итогам — прежде чем открывать страницу программы. Состав списка
          совпадает с клиентской витриной{' '}
          <Link
            href={ROUTES.academyPlatform}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            /academy
          </Link>
          : в программу попадают только курсы, уже доступные в каталоге (после модерации).
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {clientLearningPaths.map((path) => {
            const stepCount = path.courses.length;
            const stepLabel =
              stepCount === 1
                ? '1 курс'
                : stepCount < 5
                  ? `${stepCount} курса`
                  : `${stepCount} курсов`;
            return (
              <Link key={path.id} href={ROUTES.brand.academyPlatformPath(path.id)}>
                <Card className="border-accent-primary/30 from-accent-primary/10 hover:shadow-accent-primary/10 hover:border-accent-primary/30 group flex h-full overflow-hidden rounded-2xl border bg-gradient-to-br to-white transition-all duration-200 hover:shadow-lg">
                  <CardContent className="flex h-full min-h-[280px] flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        {path.audience ? (
                          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
                            {path.audience}
                          </p>
                        ) : null}
                        <h3 className="text-text-primary text-lg font-semibold leading-snug">
                          {path.title}
                        </h3>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="bg-accent-primary/15 rounded-xl p-3">
                          <Award className="text-accent-primary h-6 w-6" aria-hidden />
                        </div>
                        <ChevronRight
                          className="text-text-muted group-hover:text-accent-primary h-5 w-5 transition-colors"
                          aria-hidden
                        />
                      </div>
                    </div>
                    <p className="text-text-secondary mt-3 line-clamp-3 text-sm leading-relaxed">
                      {path.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="gap-1 text-[10px] font-medium">
                        <ListOrdered className="h-3 w-3 shrink-0" aria-hidden />
                        {stepLabel}
                      </Badge>
                      <Badge variant="secondary" className="gap-1 text-[10px] font-medium">
                        <Clock className="h-3 w-3 shrink-0" aria-hidden />
                        {path.totalDuration}
                      </Badge>
                      {path.level ? (
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {academyLevelLabels[path.level]}
                        </Badge>
                      ) : null}
                      {path.format ? (
                        <Badge
                          variant="outline"
                          className="border-border-default max-w-full truncate text-[10px] font-normal"
                          title={path.format}
                        >
                          {path.format}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="border-border-default/80 bg-bg-surface2/60 mt-auto flex items-start gap-3 rounded-xl border p-3">
                      <Award className="text-accent-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide">
                          Итог программы
                        </p>
                        <p className="text-text-primary mt-0.5 text-sm font-medium leading-snug">
                          {path.outcome}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Курсы */}
      <section>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-text-primary text-xl font-bold">Курсы</h2>
            <p className="text-text-secondary mt-1 text-sm">Найдено: {filteredCourses.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="match-client-catalog"
              checked={matchClientCatalogOnly}
              onCheckedChange={(v) => setMatchClientCatalogOnly(v === true)}
            />
            <Label
              htmlFor="match-client-catalog"
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
          {filteredCourses.length === 0 ? (
            <div className="col-span-full">
              <EmptyStateB2B
                icon={BookOpen}
                title="Нет курсов по фильтрам"
                description={
                  matchClientCatalogOnly
                    ? 'Снимите режим «Как на витрине /academy», измените категорию или поиск — в студии могут отображаться черновики и архив.'
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
          {filteredCourses.map((course) => (
            <Link key={course.id} href={ROUTES.brand.academyPlatformCourse(course.id)}>
              <Card className="border-border-default/80 hover:border-accent-primary/30 group h-full overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-md hover:shadow-xl">
                <div className="bg-bg-surface2 relative aspect-video overflow-hidden">
                  <AcademyStudioCourseOriginBadges course={course} />
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
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    {(course as { isRecommended?: boolean }).isRecommended && (
                      <Badge className="bg-accent-primary text-[9px]">Рекомендуем</Badge>
                    )}
                    {(course as { isNew?: boolean }).isNew && (
                      <Badge variant="secondary" className="text-[9px]">
                        Новый
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-text-primary line-clamp-2 font-semibold leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-text-secondary mt-2 line-clamp-2 text-sm">
                    {course.description}
                  </p>
                  <div className="text-text-secondary mt-4 flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {course.rating}
                    </span>
                    <span>{course.studentsCount.toLocaleString()} слушателей</span>
                  </div>
                  {course.level && (
                    <Badge variant="outline" className="mt-3 text-[10px]">
                      {academyLevelLabels[course.level] ?? course.level}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Мероприятия */}
      {mockAcademyEvents.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-2">
            <Calendar className="text-accent-primary h-5 w-5" />
            <h2 className="text-text-primary text-xl font-bold">Ближайшие мероприятия</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mockAcademyEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="border-border-default/80 hover:border-accent-primary/30 rounded-2xl border bg-white p-5 transition-colors"
              >
                <Badge variant="secondary" className="mb-2 text-[10px]">
                  {event.type === 'webinar'
                    ? 'Вебинар'
                    : event.type === 'workshop'
                      ? 'Воркшоп'
                      : event.type}
                </Badge>
                <h3 className="text-text-primary font-semibold">{event.title}</h3>
                <p className="text-text-secondary mt-1 line-clamp-2 text-sm">{event.description}</p>
                <p className="text-text-muted mt-2 text-xs">{event.hostName}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* База знаний */}
      <section>
        <div className="mb-6 flex items-center gap-2">
          <FileText className="text-text-secondary h-5 w-5" />
          <h2 className="text-text-primary text-xl font-bold">База знаний</h2>
        </div>
        <p className="text-text-secondary mb-6 text-sm">
          Wiki-статьи по терминам, процессам и регуляторике. Актуальная информация для партнёров.
        </p>
        <div className="space-y-3">
          {mockArticles.map((art) => (
            <Link key={art.id} href={ROUTES.brand.academyPlatformArticle(art.id)}>
              <Card className="border-border-default/80 hover:border-accent-primary/30 hover:shadow-accent-primary/5 group rounded-2xl border bg-white transition-all duration-200 hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-text-primary font-semibold">{art.title}</h3>
                    <p className="text-text-secondary mt-1 line-clamp-1 text-sm">{art.excerpt}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {art.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="text-text-muted group-hover:text-accent-primary h-5 w-5 shrink-0 transition-colors" />
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
