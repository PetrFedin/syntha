'use client';

import { useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  GraduationCap,
  Clock,
  ListOrdered,
  Star,
  Users,
  TrendingUp,
  Search,
  PlayCircle,
  Award,
  Target,
  FileText,
  ClipboardList,
  Calendar as CalendarIcon,
  Video,
  HelpCircle,
  Download,
  Check,
  Archive,
  X as CloseIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUIState } from '@/providers/ui-state';
import {
  getCourseById,
  mockArticles,
  mockAcademyEvents,
  mockAssessments,
  getMyPlatformEnrollments,
  mockAcademyDeskTasks,
  academyLevelLabels,
  glossary,
} from '@/lib/education-data';
import { getClientCatalogCourses, getLearningPathsForClient } from '@/lib/academy-catalog';
import {
  academyCourseFiltersMatchUrl,
  parseAcademyCourseFiltersSnapshot,
  urlHasAcademyCourseFilterKeys,
  writeAcademyCourseFiltersToSearchParams,
} from '@/lib/academy-url-filters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAcademyFavorites } from '@/hooks/use-academy-favorites';
import { downloadAcademyEventIcs } from '@/lib/academy-ics';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GlossaryText } from './glossary-text';
import { LearningPathAboutDialog } from '@/components/academy/learning-path-about-dialog';
import { AcademyClientLearningBar } from '@/components/academy/academy-client-learning-bar';
import { ROUTES, calendarHrefForRole } from '@/lib/routes';
import { ACADEMY_CTA_PRIMARY, ACADEMY_CTA_PRIMARY_FULL_WIDTH } from '@/lib/ui/academy-cta';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import type { EducationCourse, LearningPath } from '@/lib/types';

const TESTS_CATEGORY_ORDER: EducationCourse['category'][] = [
  'economics',
  'legal',
  'design',
  'production',
  'analytics',
  'management',
  'retail',
];
const TESTS_CATEGORY_LABEL_RU: Record<EducationCourse['category'], string> = {
  economics: 'Экономика',
  legal: 'Право',
  design: 'Дизайн',
  production: 'Производство',
  analytics: 'Аналитика',
  management: 'Менеджмент',
  retail: 'Ритейл',
};

import {
  courseAudienceKindLabel,
  courseOutcomeLabel,
  courseProviderKindShortLabel,
  formatCoursePrice,
  inferCourseAccess,
} from '@/lib/academy-course-meta';
import {
  ACADEMY_TABS,
  type AcademyTab,
  readAcademyTabFromUrl,
  readFavoritesOnlyFromUrl,
  readLiveSegmentFromUrl,
  readKbaseSegmentFromUrl,
  readAttSegmentFromUrl,
  readProgramsCatalogSegmentFromUrl,
  readPathsSegmentFromUrl,
} from '@/lib/academy/client-platform-url';
import { articleToCourse, assessmentToCourse } from '@/lib/academy/client-academy-card-mappers';

function knowledgeArticleHrefById(articleId: string | undefined): string | null {
  if (!articleId) return null;
  const art = mockArticles.find((a) => a.id === articleId);
  return art ? ROUTES.clientAcademyKnowledgeArticle(art.slug) : null;
}

function academyEventTypeLabel(type: string) {
  switch (type) {
    case 'webinar':
      return 'Вебинар';
    case 'workshop':
      return 'Воркшоп';
    case 'live_stream':
      return 'Прямой эфир';
    default:
      return type;
  }
}

export default function AcademyPage() {
  const { viewRole } = useUIState();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const [accessFilter, setAccessFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<
    'all' | 'diploma' | 'qualification' | 'certificate' | 'casual'
  >('all');
  const [providerOrgFilter, setProviderOrgFilter] = useState<string>('all');
  const [audienceKindFilter, setAudienceKindFilter] = useState<
    'all' | 'individual' | 'professional'
  >('all');
  const [wikiCategory, setWikiCategory] = useState<string>('Все');
  const [wikiSegment, setWikiSegment] = useState<'current' | 'archive'>(readKbaseSegmentFromUrl);
  const [testsSegment, setTestsSegment] = useState<'current' | 'archive'>(readAttSegmentFromUrl);
  const [programsSegment, setProgramsSegment] = useState<'current' | 'archive'>(
    readProgramsCatalogSegmentFromUrl
  );
  const [pathsSegment, setPathsSegment] = useState<'current' | 'archive'>(readPathsSegmentFromUrl);
  const [testsCategory, setTestsCategory] = useState<'all' | EducationCourse['category']>('all');
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [testScore, setTestScore] = useState(0);

  const { toast } = useToast();
  const {
    favorites,
    toggleCourse,
    toggleArticle,
    toggleEvent,
    isCourseFavorite,
    isArticleFavorite,
    isEventFavorite,
    pruneStaleCourseFavorites,
  } = useAcademyFavorites();
  const [liveSegment, setLiveSegment] = useState<'upcoming' | 'archive'>(readLiveSegmentFromUrl);
  const [favoritesOnly, setFavoritesOnly] = useState(readFavoritesOnlyFromUrl);

  const [academyTab, setAcademyTab] = useState<AcademyTab>(() => readAcademyTabFromUrl());
  /** false — «в работе», true — архив (пройденные), если есть оба списка */
  const [myCoursesDeskArchive, setMyCoursesDeskArchive] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    const nextTab: AcademyTab =
      tab && ACADEMY_TABS.includes(tab as AcademyTab) ? (tab as AcademyTab) : 'courses';
    setAcademyTab((prev) => (prev === nextTab ? prev : nextTab));

    const live = searchParams.get('live');
    if (live === 'archive' || live === 'upcoming') {
      setLiveSegment((prev) => (prev === live ? prev : live));
    }

    const kb = searchParams.get('kbase');
    const nextKb: 'current' | 'archive' = kb === 'archive' ? 'archive' : 'current';
    setWikiSegment((prev) => (prev === nextKb ? prev : nextKb));

    const att = searchParams.get('att');
    const nextAtt: 'current' | 'archive' = att === 'archive' ? 'archive' : 'current';
    setTestsSegment((prev) => (prev === nextAtt ? prev : nextAtt));

    const programs = searchParams.get('programs');
    const nextPrograms: 'current' | 'archive' = programs === 'archive' ? 'archive' : 'current';
    setProgramsSegment((prev) => (prev === nextPrograms ? prev : nextPrograms));

    const paths = searchParams.get('paths');
    const nextPaths: 'current' | 'archive' = paths === 'archive' ? 'archive' : 'current';
    setPathsSegment((prev) => (prev === nextPaths ? prev : nextPaths));

    const fav = searchParams.get('fav') === '1';
    setFavoritesOnly((prev) => (prev === fav ? prev : fav));

    const tabForFilters = searchParams.get('tab');
    const coursesTab =
      tabForFilters && ACADEMY_TABS.includes(tabForFilters as AcademyTab)
        ? (tabForFilters as AcademyTab)
        : 'courses';
    if (coursesTab === 'courses' && urlHasAcademyCourseFilterKeys(searchParams)) {
      const snap = parseAcademyCourseFiltersSnapshot(searchParams);
      setSearchQuery(snap.searchQuery);
      setActiveCategory(snap.activeCategory);
      setAccessFilter(snap.accessFilter);
      setOutcomeFilter(snap.outcomeFilter);
      setProviderOrgFilter(snap.providerOrgFilter);
      setAudienceKindFilter(snap.audienceKindFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (academyTab !== 'courses') return;
    const url = new URL(window.location.href);
    const snap = {
      searchQuery,
      activeCategory,
      accessFilter,
      outcomeFilter,
      providerOrgFilter,
      audienceKindFilter,
    };
    if (academyCourseFiltersMatchUrl(url.searchParams, snap)) return;
    writeAcademyCourseFiltersToSearchParams(url.searchParams, snap);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [
    academyTab,
    searchQuery,
    activeCategory,
    accessFilter,
    outcomeFilter,
    providerOrgFilter,
    audienceKindFilter,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tabTitles: Record<AcademyTab, string> = {
      courses: 'Каталог программ',
      wiki: 'База знаний',
      tests: 'Тесты и аттестация',
      live: 'Эфиры и календарь',
    };
    const prev = document.title;
    document.title = `${tabTitles[academyTab]} · Академия`;
    return () => {
      document.title = prev;
    };
  }, [academyTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncFromUrl = () => {
      setAcademyTab(readAcademyTabFromUrl());
      setWikiSegment(readKbaseSegmentFromUrl());
      setTestsSegment(readAttSegmentFromUrl());
      setProgramsSegment(readProgramsCatalogSegmentFromUrl());
      setPathsSegment(readPathsSegmentFromUrl());
      setLiveSegment(readLiveSegmentFromUrl());
      setFavoritesOnly(readFavoritesOnlyFromUrl());
    };
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    if (academyTab !== 'courses') return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [academyTab]);

  const onAcademyTabChange = useCallback((v: string) => {
    const resolved = ACADEMY_TABS.includes(v as AcademyTab) ? (v as AcademyTab) : 'courses';
    setAcademyTab(resolved);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', resolved);
      if (resolved !== 'live') url.searchParams.delete('live');
      if (resolved !== 'wiki') url.searchParams.delete('kbase');
      if (resolved !== 'tests') url.searchParams.delete('att');
      if (resolved !== 'courses') {
        url.searchParams.delete('programs');
        url.searchParams.delete('paths');
      }
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  const scrollToAcademyTabs = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.requestAnimationFrame(() => {
      document
        .getElementById('academy-tabs')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const goToTestsTab = useCallback(() => {
    onAcademyTabChange('tests');
    scrollToAcademyTabs();
  }, [onAcademyTabChange, scrollToAcademyTabs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (academyTab !== 'live') return;
    const url = new URL(window.location.href);
    url.searchParams.set('live', liveSegment);
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [academyTab, liveSegment]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (academyTab !== 'wiki') return;
    const url = new URL(window.location.href);
    if (wikiSegment === 'current') url.searchParams.delete('kbase');
    else url.searchParams.set('kbase', 'archive');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [academyTab, wikiSegment]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (academyTab !== 'courses') return;
    const url = new URL(window.location.href);
    if (programsSegment === 'current') url.searchParams.delete('programs');
    else url.searchParams.set('programs', 'archive');
    if (pathsSegment === 'current') url.searchParams.delete('paths');
    else url.searchParams.set('paths', 'archive');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [academyTab, programsSegment, pathsSegment]);

  const toggleFavoritesOnly = useCallback(() => {
    setFavoritesOnly((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (next) url.searchParams.set('fav', '1');
        else url.searchParams.delete('fav');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setWikiCategory('Все');
  }, [wikiSegment]);

  useEffect(() => {
    setTestsCategory('all');
  }, [testsSegment]);

  const categories = [
    'Все',
    'Экономика',
    'Дизайн',
    'Производство',
    'Аналитика',
    'Менеджмент',
    'Ритейл',
    'Право',
  ];

  const clientCatalogCourses = useMemo(() => getClientCatalogCourses(), []);

  useEffect(() => {
    pruneStaleCourseFavorites(new Set(clientCatalogCourses.map((c) => c.id)));
  }, [clientCatalogCourses, pruneStaleCourseFavorites]);

  const organizationFilterOptions = useMemo(() => {
    const names = new Set(
      clientCatalogCourses.map((c) => c.provider.trim()).filter((s) => s.length > 0)
    );
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [clientCatalogCourses]);

  const clientLearningPaths = useMemo(() => getLearningPathsForClient(), []);

  const visibleLearningPaths = useMemo(
    () =>
      clientLearningPaths.filter((path) => Boolean(path.archived) === (pathsSegment === 'archive')),
    [clientLearningPaths, pathsSegment]
  );

  const filteredCourses = useMemo(() => {
    return clientCatalogCourses.filter((course) => {
      if (favoritesOnly && !favorites.courseIds.includes(course.id)) return false;
      const isArchived = Boolean(course.archived);
      if (isArchived !== (programsSegment === 'archive')) return false;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMap: Record<string, string> = {
        Все: 'All',
        Экономика: 'economics',
        Дизайн: 'design',
        Производство: 'production',
        Аналитика: 'analytics',
        Менеджмент: 'management',
        Ритейл: 'retail',
        Право: 'legal',
      };
      const targetCategory = categoryMap[activeCategory];
      const matchesCategory =
        activeCategory === 'Все' || course.category.toLowerCase() === targetCategory?.toLowerCase();
      const acc = inferCourseAccess(course);
      const matchesAccess = accessFilter === 'all' || accessFilter === acc;
      const matchesOutcome =
        outcomeFilter === 'all' ||
        (course.outcomeKind != null && course.outcomeKind === outcomeFilter);
      const matchesProvider = providerOrgFilter === 'all' || course.provider === providerOrgFilter;
      const matchesAudience =
        audienceKindFilter === 'all' || course.audienceKind === audienceKindFilter;
      return (
        matchesSearch &&
        matchesCategory &&
        matchesAccess &&
        matchesOutcome &&
        matchesProvider &&
        matchesAudience
      );
    });
  }, [
    searchQuery,
    activeCategory,
    accessFilter,
    outcomeFilter,
    providerOrgFilter,
    audienceKindFilter,
    clientCatalogCourses,
    favoritesOnly,
    favorites.courseIds,
    programsSegment,
  ]);

  const filteredArticles = useMemo(() => {
    return mockArticles.filter(
      (art) =>
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const wikiArticleCategories = useMemo(() => {
    const pool = mockArticles.filter((a) =>
      wikiSegment === 'archive' ? Boolean(a.archived) : !a.archived
    );
    return ['Все', ...Array.from(new Set(pool.map((a) => a.category)))];
  }, [wikiSegment]);

  const wikiArchiveGlossary = useMemo(() => {
    const archived = mockArticles.filter((a) => a.archived);
    const hay = archived
      .map((a) => `${a.title} ${a.excerpt} ${a.tags.join(' ')} ${a.content}`)
      .join(' ')
      .toLowerCase();
    return Object.entries(glossary).filter(([abbr, info]) => {
      const ab = abbr.toLowerCase();
      if (hay.includes(ab)) return true;
      const words = info.term
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      return words.some((w) => hay.includes(w));
    });
  }, []);

  const wikiFilteredArticles = useMemo(() => {
    return filteredArticles
      .filter((a) => (wikiSegment === 'archive' ? Boolean(a.archived) : !a.archived))
      .filter((a) => {
        if (favoritesOnly && !favorites.articleIds.includes(a.id)) return false;
        return wikiCategory === 'Все' || a.category === wikiCategory;
      });
  }, [filteredArticles, wikiCategory, wikiSegment, favoritesOnly, favorites.articleIds]);

  const wikiMaterialsPoolCount = useMemo(
    () =>
      filteredArticles.filter((a) =>
        wikiSegment === 'archive' ? Boolean(a.archived) : !a.archived
      ).length,
    [filteredArticles, wikiSegment]
  );

  const testsAssessmentPool = useMemo(
    () =>
      mockAssessments.filter((a) =>
        testsSegment === 'archive' ? Boolean(a.archived) : !a.archived
      ),
    [testsSegment]
  );

  const testsCategoryKeys = useMemo(() => {
    const present = new Set(testsAssessmentPool.map((a) => a.category));
    return TESTS_CATEGORY_ORDER.filter((c) => present.has(c));
  }, [testsAssessmentPool]);

  const assessmentsForTestsTab = useMemo(() => {
    if (testsCategory === 'all') return testsAssessmentPool;
    return testsAssessmentPool.filter((a) => a.category === testsCategory);
  }, [testsAssessmentPool, testsCategory]);

  const clientRecommendedIds = useMemo(() => {
    return new Set(
      clientCatalogCourses
        .filter((c) => c.targetRoles.includes(viewRole) || c.isRecommended)
        .map((c) => c.id)
    );
  }, [viewRole, clientCatalogCourses]);

  const myEnrollments = useMemo(() => getMyPlatformEnrollments(), []);

  const myCoursesWithMeta = useMemo(
    () =>
      myEnrollments
        .map((e) => ({
          enrollment: e,
          course: getCourseById(e.courseId),
        }))
        .filter(
          (row): row is typeof row & { course: NonNullable<typeof row.course> } => !!row.course
        ),
    [myEnrollments]
  );

  const myCoursesInProgress = useMemo(
    () => myCoursesWithMeta.filter((row) => row.enrollment.status === 'in_progress'),
    [myCoursesWithMeta]
  );

  const myCoursesCompleted = useMemo(
    () => myCoursesWithMeta.filter((row) => row.enrollment.status === 'completed'),
    [myCoursesWithMeta]
  );

  const hasMyCoursesDesk = myCoursesInProgress.length + myCoursesCompleted.length > 0;
  const showMyCoursesArchiveList =
    myCoursesDeskArchive || (myCoursesInProgress.length === 0 && myCoursesCompleted.length > 0);
  const myCoursesDeskList = showMyCoursesArchiveList ? myCoursesCompleted : myCoursesInProgress;

  const { upcomingEvents, pastEvents, featuredLiveEvent, otherUpcomingEvents } = useMemo(() => {
    const now = Date.now();
    let upcoming = mockAcademyEvents
      .filter((e) => new Date(e.endTime).getTime() >= now)
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
    let past = mockAcademyEvents
      .filter((e) => new Date(e.endTime).getTime() < now)
      .sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));
    if (favoritesOnly) {
      const fav = new Set(favorites.eventIds);
      upcoming = upcoming.filter((e) => fav.has(e.id));
      past = past.filter((e) => fav.has(e.id));
    }
    const featured = upcoming[0] ?? null;
    const rest = featured ? upcoming.slice(1) : upcoming;
    return {
      upcomingEvents: upcoming,
      pastEvents: past,
      featuredLiveEvent: featured,
      otherUpcomingEvents: rest,
    };
  }, [favoritesOnly, favorites.eventIds]);

  const startTest = (assessment: any) => {
    setActiveAssessment(assessment);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const finishTest = () => {
    let correctCount = 0;
    activeAssessment.questions.forEach((q: any) => {
      if (answers[q.id] === q.correctAnswer) correctCount++;
    });
    const score = Math.round((correctCount / activeAssessment.questions.length) * 100);
    setTestScore(score);
    setIsResultOpen(true);
    setActiveAssessment(null);

    toast({
      title: score >= activeAssessment.passingScore ? 'Тест пройден!' : 'Тест не пройден',
      description: `Ваш результат: ${score}% (Минимум: ${activeAssessment.passingScore}%)`,
      variant: score >= activeAssessment.passingScore ? 'default' : 'destructive',
    });
  };

  return (
    <TooltipProvider>
      <div className="w-full space-y-4 py-2">
        <ClientCabinetSectionHeader
          showBack={false}
          description={false}
          meta={
            <>
              <span className="text-text-secondary/70 mx-1.5 font-light" aria-hidden>
                |
              </span>
              <span className="text-text-secondary max-w-[min(100%,42rem)] text-sm font-medium normal-case leading-snug tracking-normal">
                Курсы, база знаний и эфиры для профи.
              </span>
            </>
          }
        />
        <div className="relative w-full space-y-4 pb-12 duration-700 animate-in fade-in">
          <div className="container mx-auto max-w-5xl space-y-4 px-4 py-2">
            <section className="relative overflow-hidden rounded-2xl border border-indigo-400/35 bg-gradient-to-br from-[#4f46e5] via-[#3730a3] to-[#1e1b4b] p-6 shadow-lg sm:p-8 md:min-h-[240px] md:p-10">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-400/30 blur-2xl"
                aria-hidden
              />
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
                <div className="min-w-0 max-w-2xl flex-1 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200/90">
                    Единая академия Syntha
                  </p>
                  <h1 className="font-headline text-xl font-bold uppercase leading-tight tracking-tighter text-white md:text-2xl lg:text-[26px]">
                    Обучение и <span className="text-indigo-100">база знаний</span> для вас
                  </h1>
                  <p className="max-w-xl text-[13px] font-medium leading-relaxed text-indigo-100/95">
                    Персональные подборки курсов, статей и эфиров — в вашем кабинете покупателя
                    Syntha. Для вас как для специалиста, без сценариев «для компании» или отдела.
                    Курсы ведут разные организации — платформа Syntha, бренды, школы, вузы, партнёры
                    и ассоциации: от бесплатных коротких форматов до платных траекторий с дипломом,
                    повышением квалификации, сертификатом или лёгкими курсами для общего развития.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-9 rounded-lg border border-white/30 bg-white px-5 text-[11px] font-semibold uppercase tracking-wide text-slate-900 shadow-sm transition-colors hover:bg-indigo-50"
                      asChild
                    >
                      <Link href={`${ROUTES.academyPlatform}#academy-tabs`}>К материалам</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-lg border-white/35 bg-white/5 px-5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm hover:bg-white/15"
                      asChild
                    >
                      <Link href={ROUTES.contact}>Вопрос по обучению</Link>
                    </Button>
                  </div>
                </div>
                <dl className="grid w-full shrink-0 grid-cols-3 gap-2 sm:max-w-xl lg:w-auto lg:max-w-md">
                  <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-md">
                    <dt className="text-[9px] font-bold uppercase tracking-widest text-indigo-200/90">
                      Участников
                    </dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums tracking-tight text-white">
                      12 400+
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-md">
                    <dt className="text-[9px] font-bold uppercase tracking-widest text-indigo-200/90">
                      Материалов
                    </dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums tracking-tight text-white">
                      450+
                    </dd>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-md">
                    <dt className="text-[9px] font-bold uppercase tracking-widest text-indigo-200/90">
                      Оценка полезности
                    </dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums tracking-tight text-white">
                      4.9
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <AcademyClientLearningBar
              messagesRole="shop"
              className="rounded-2xl border border-slate-200/80 bg-slate-50/90 px-3 py-2.5 shadow-sm sm:px-4"
            />

            <div
              id="academy-desk"
              className="w-full space-y-5 rounded-2xl border border-slate-200/70 bg-white/95 p-4 text-[13px] leading-snug text-slate-800 shadow-sm ring-1 ring-slate-100/80 sm:p-5"
            >
              <Tabs
                value={academyTab}
                onValueChange={onAcademyTabChange}
                className="space-y-5"
                aria-label="Разделы академии"
              >
                <div
                  id="academy-tabs"
                  className="sticky top-0 z-20 -mx-4 mb-2 scroll-mt-20 border-b border-slate-200/60 bg-white/90 pb-3 pt-1 backdrop-blur-md sm:-mx-5 sm:px-1"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <TabsList className="flex h-auto min-h-9 w-fit min-w-0 max-w-full flex-wrap items-center justify-start gap-0.5 rounded-xl border border-slate-200/80 bg-slate-50/90 p-1 text-slate-500 shadow-inner">
                      <TabsTrigger
                        value="courses"
                        className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium normal-case tracking-normal text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0b63ce] data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-[#0b63ce]/25"
                      >
                        <span className="sm:hidden">Курсы</span>
                        <span className="hidden sm:inline">Курсы и программы</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="wiki"
                        className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium normal-case tracking-normal text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0b63ce] data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-[#0b63ce]/25"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="size-3.5 shrink-0 opacity-80" aria-hidden />
                          <span className="sm:hidden">Wiki</span>
                          <span className="hidden sm:inline">База знаний</span>
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="tests"
                        className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium normal-case tracking-normal text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0b63ce] data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-[#0b63ce]/25"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <ClipboardList className="size-3.5 shrink-0 opacity-80" aria-hidden />
                          <span className="sm:hidden">Тесты</span>
                          <span className="hidden sm:inline">Тесты и аттестация</span>
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="live"
                        className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium normal-case tracking-normal text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#0b63ce] data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-[#0b63ce]/25"
                      >
                        <span className="sm:hidden">Live</span>
                        <span className="hidden sm:inline">Live и календарь</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:ml-auto sm:w-auto sm:max-w-full sm:flex-row sm:items-center sm:justify-end">
                      <Button
                        type="button"
                        variant={favoritesOnly ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'h-9 shrink-0 gap-1.5 rounded-lg px-3 text-[11px] font-semibold',
                          favoritesOnly
                            ? 'bg-[#0b63ce] text-white hover:bg-[#0954b0]'
                            : 'border-slate-200 bg-white'
                        )}
                        aria-pressed={favoritesOnly}
                        onClick={toggleFavoritesOnly}
                      >
                        <Star
                          className={cn(
                            'size-3.5',
                            favoritesOnly && 'fill-amber-200 text-amber-100'
                          )}
                          strokeWidth={favoritesOnly ? 0 : 2}
                          aria-hidden
                        />
                        Избранное
                      </Button>
                      <div className="group relative w-full min-w-0 sm:w-[min(100%,280px)]">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0b63ce]" />
                        <Input
                          placeholder="Поиск…"
                          className="h-9 min-h-9 rounded-lg border border-slate-200 bg-white py-0 pl-9 text-[13px] text-slate-900 shadow-sm transition-all focus:border-[#0b63ce] focus:ring-1 focus:ring-[#0b63ce]/30"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <TabsContent value="courses" className="space-y-4 duration-500 animate-in fade-in">
                  {hasMyCoursesDesk ? (
                    <section
                      id="my-courses-desk"
                      className="scroll-mt-24 space-y-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-slate-200/90 hover:bg-slate-50/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          {showMyCoursesArchiveList ? (
                            <Archive className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                          ) : (
                            <GraduationCap className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                          )}
                          <div className="min-w-0">
                            <h2 className="text-[13px] font-semibold leading-tight text-[#1a2433]">
                              {showMyCoursesArchiveList ? 'Пройденные курсы' : 'Мои курсы в работе'}
                            </h2>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                          {myCoursesCompleted.length > 0 && myCoursesInProgress.length > 0 ? (
                            <div
                              className="flex rounded-lg border border-slate-200 bg-slate-50/90 p-0.5 shadow-inner"
                              role="tablist"
                              aria-label="Мои курсы: в работе или архив"
                            >
                              <button
                                type="button"
                                role="tab"
                                aria-selected={!showMyCoursesArchiveList}
                                className={cn(
                                  'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                                  !showMyCoursesArchiveList
                                    ? 'bg-white text-[#0b63ce] shadow-sm'
                                    : 'text-[#6b7788] hover:text-[#1a2433]'
                                )}
                                onClick={() => setMyCoursesDeskArchive(false)}
                              >
                                В работе
                              </button>
                              <button
                                type="button"
                                role="tab"
                                aria-selected={showMyCoursesArchiveList}
                                className={cn(
                                  'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                                  showMyCoursesArchiveList
                                    ? 'bg-white text-[#0b63ce] shadow-sm'
                                    : 'text-[#6b7788] hover:text-[#1a2433]'
                                )}
                                onClick={() => setMyCoursesDeskArchive(true)}
                              >
                                Архив
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {myCoursesDeskList.length > 0 ? (
                        <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1">
                          <div className="flex w-max max-w-full items-stretch gap-3 md:gap-4">
                            {myCoursesDeskList.map(({ enrollment, course }) => (
                              <CourseCard
                                key={enrollment.courseId}
                                course={course}
                                compact
                                featured={!showMyCoursesArchiveList}
                                showClientRecommendation={clientRecommendedIds.has(course.id)}
                                href={ROUTES.clientAcademyCourse(course.id)}
                                durationLabel={showMyCoursesArchiveList ? 'Завершён' : 'В процессе'}
                                footerProviderLabel={
                                  showMyCoursesArchiveList ? 'Архив' : 'В работе'
                                }
                                footerRight={
                                  <div className="flex w-[76px] flex-col items-end gap-0.5">
                                    <Progress
                                      value={enrollment.progress}
                                      className="h-1 w-full rounded-sm bg-[#dde1e8]"
                                      indicatorClassName={
                                        showMyCoursesArchiveList ? 'bg-emerald-600' : 'bg-[#0b63ce]'
                                      }
                                    />
                                    <span className="text-[9px] font-medium tabular-nums text-[#6b7788]">
                                      {enrollment.progress}%
                                    </span>
                                  </div>
                                }
                                favorite={{
                                  active: isCourseFavorite(course.id),
                                  onToggle: () => toggleCourse(course.id),
                                  ariaLabel: isCourseFavorite(course.id)
                                    ? 'Убрать курс из избранного'
                                    : 'Добавить курс в избранное',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/90 px-4 py-8 text-center">
                          <p className="text-[13px] font-medium text-[#1a2433]">
                            {showMyCoursesArchiveList
                              ? 'В архиве пока пусто'
                              : 'Нет курсов в работе'}
                          </p>
                          {myCoursesCompleted.length > 0 && !showMyCoursesArchiveList ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-3 h-8 gap-1.5 rounded-lg text-[11px] font-semibold"
                              onClick={() => setMyCoursesDeskArchive(true)}
                            >
                              <Archive className="size-3.5 shrink-0" aria-hidden />
                              Открыть архив
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </section>
                  ) : null}

                  <section className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                        <h2 className="text-[13px] font-semibold leading-tight text-[#1a2433]">
                          Траектории обучения
                        </h2>
                      </div>
                      <div
                        className="flex rounded-lg border border-slate-200 bg-slate-50/90 p-0.5 shadow-inner"
                        role="tablist"
                        aria-label="Актуальные или архивные траектории"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={pathsSegment === 'current'}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                            pathsSegment === 'current'
                              ? 'bg-white text-[#0b63ce] shadow-sm'
                              : 'text-[#6b7788] hover:text-[#1a2433]'
                          )}
                          onClick={() => setPathsSegment('current')}
                        >
                          Актуальные
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={pathsSegment === 'archive'}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                            pathsSegment === 'archive'
                              ? 'bg-white text-[#0b63ce] shadow-sm'
                              : 'text-[#6b7788] hover:text-[#1a2433]'
                          )}
                          onClick={() => setPathsSegment('archive')}
                        >
                          Архив
                        </button>
                      </div>
                    </div>
                    <div className="mx-auto grid max-w-[920px] auto-rows-fr gap-3 md:grid-cols-2">
                      {visibleLearningPaths.map((path) => (
                        <LearningPathCard key={path.id} path={path} />
                      ))}
                    </div>
                  </section>

                  {/* All Courses with Filter */}
                  <section
                    id="all-programs"
                    className="scroll-mt-24 space-y-4 rounded-2xl border border-transparent p-2 transition-colors hover:border-slate-200/90 hover:bg-slate-50/50"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="inline-flex max-w-full shrink-0 items-center gap-2">
                        <BookOpen className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                        <h2 className="whitespace-nowrap text-[13px] font-semibold leading-tight text-[#1a2433]">
                          <Link
                            href={`${ROUTES.academyPlatform}?tab=courses#all-programs`}
                            className="rounded-md outline-none ring-offset-2 transition-colors hover:text-[#0b63ce] focus-visible:ring-2 focus-visible:ring-[#0b63ce]/40"
                          >
                            Все программы
                          </Link>
                        </h2>
                      </div>
                      <div
                        className="flex w-full rounded-lg border border-slate-200 bg-slate-50/90 p-0.5 shadow-inner sm:w-auto"
                        role="tablist"
                        aria-label="Каталог программ: актуальные или архив"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={programsSegment === 'current'}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                            programsSegment === 'current'
                              ? 'bg-white text-[#0b63ce] shadow-sm'
                              : 'text-[#6b7788] hover:text-[#1a2433]'
                          )}
                          onClick={() => setProgramsSegment('current')}
                        >
                          Актуальные
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={programsSegment === 'archive'}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                            programsSegment === 'archive'
                              ? 'bg-white text-[#0b63ce] shadow-sm'
                              : 'text-[#6b7788] hover:text-[#1a2433]'
                          )}
                          onClick={() => setProgramsSegment('archive')}
                        >
                          Архив
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-row flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <div className="grid w-full min-w-0 max-w-full flex-1 basis-full grid-cols-2 gap-x-2 gap-y-1 sm:ml-auto sm:max-w-[52rem] sm:basis-auto sm:grid-cols-5">
                        <div className="min-w-0 space-y-0.5">
                          <Label
                            htmlFor="academy-filter-category"
                            className="text-[9px] font-semibold uppercase leading-none tracking-wide text-[#6b7788]"
                          >
                            Категория
                          </Label>
                          <Select value={activeCategory} onValueChange={setActiveCategory}>
                            <SelectTrigger
                              id="academy-filter-category"
                              className="h-7 min-h-7 border-slate-200 bg-white px-2 py-0 text-[11px] font-medium leading-none text-[#1a2433] shadow-sm"
                            >
                              <SelectValue placeholder="Категория" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat} className="text-xs">
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <Label
                            htmlFor="academy-filter-access"
                            className="text-[9px] font-semibold uppercase leading-none tracking-wide text-[#6b7788]"
                          >
                            Доступ
                          </Label>
                          <Select
                            value={accessFilter}
                            onValueChange={(v) => setAccessFilter(v as typeof accessFilter)}
                          >
                            <SelectTrigger
                              id="academy-filter-access"
                              className="h-7 min-h-7 border-slate-200 bg-white px-2 py-0 text-[11px] font-medium leading-none text-[#1a2433] shadow-sm"
                            >
                              <SelectValue placeholder="Доступ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all" className="text-xs">
                                Все
                              </SelectItem>
                              <SelectItem value="free" className="text-xs">
                                Бесплатно
                              </SelectItem>
                              <SelectItem value="paid" className="text-xs">
                                Платно
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <Label
                            htmlFor="academy-filter-outcome"
                            className="text-[9px] font-semibold uppercase leading-none tracking-wide text-[#6b7788]"
                          >
                            Итог
                          </Label>
                          <Select
                            value={outcomeFilter}
                            onValueChange={(v) => setOutcomeFilter(v as typeof outcomeFilter)}
                          >
                            <SelectTrigger
                              id="academy-filter-outcome"
                              className="h-7 min-h-7 border-slate-200 bg-white px-2 py-0 text-[11px] font-medium leading-none text-[#1a2433] shadow-sm"
                            >
                              <SelectValue placeholder="Итог" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all" className="text-xs">
                                Все
                              </SelectItem>
                              <SelectItem value="diploma" className="text-xs">
                                Диплом
                              </SelectItem>
                              <SelectItem value="qualification" className="text-xs">
                                ПК
                              </SelectItem>
                              <SelectItem value="certificate" className="text-xs">
                                Сертификат
                              </SelectItem>
                              <SelectItem value="casual" className="text-xs">
                                Для себя
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <Label
                            htmlFor="academy-filter-org"
                            className="text-[9px] font-semibold uppercase leading-none tracking-wide text-[#6b7788]"
                          >
                            Организация
                          </Label>
                          <p className="line-clamp-2 text-[8px] font-medium leading-snug text-[#8b95a5]">
                            Поставщик курса — любая организация: платформа Syntha, бренд, школа,
                            вуз, партнёр, ассоциация и т.д., не только fashion-бренды.
                          </p>
                          <Select
                            value={providerOrgFilter}
                            onValueChange={(v) => setProviderOrgFilter(v)}
                          >
                            <SelectTrigger
                              id="academy-filter-org"
                              className="h-7 min-h-7 border-slate-200 bg-white px-2 py-0 text-[11px] font-medium leading-none text-[#1a2433] shadow-sm"
                            >
                              <SelectValue placeholder="Организация" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all" className="text-xs">
                                Все
                              </SelectItem>
                              {organizationFilterOptions.map((name) => (
                                <SelectItem key={name} value={name} className="text-xs">
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <Label
                            htmlFor="academy-filter-audience"
                            className="text-[9px] font-semibold uppercase leading-none tracking-wide text-[#6b7788]"
                          >
                            Аудитория
                          </Label>
                          <Select
                            value={audienceKindFilter}
                            onValueChange={(v) =>
                              setAudienceKindFilter(v as typeof audienceKindFilter)
                            }
                          >
                            <SelectTrigger
                              id="academy-filter-audience"
                              className="h-7 min-h-7 border-slate-200 bg-white px-2 py-0 text-[11px] font-medium leading-none text-[#1a2433] shadow-sm"
                            >
                              <SelectValue placeholder="Аудитория" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all" className="text-xs">
                                Все
                              </SelectItem>
                              <SelectItem value="individual" className="text-xs">
                                Для себя
                              </SelectItem>
                              <SelectItem value="professional" className="text-xs">
                                Для профи
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {filteredCourses.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/90 px-4 py-10 text-center">
                        <p className="text-[13px] font-medium text-[#1a2433]">
                          {favoritesOnly
                            ? 'Среди избранного нет курсов с таким запросом и категорией'
                            : 'Подходящих программ не найдено'}
                        </p>
                        <p className="mt-1 text-[12px] text-[#6b7788]">
                          {favoritesOnly
                            ? 'Добавьте курсы через звёздочку на карточке или отключите режим «Избранное».'
                            : 'Попробуйте другой запрос или сбросьте фильтры по категории, аудитории, организации, доступу и итогу.'}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4 h-9 rounded-lg border-slate-200 text-[11px] font-semibold"
                          onClick={() => {
                            if (favoritesOnly) {
                              toggleFavoritesOnly();
                            } else {
                              setSearchQuery('');
                              setActiveCategory('Все');
                              setAccessFilter('all');
                              setOutcomeFilter('all');
                              setProviderOrgFilter('all');
                              setAudienceKindFilter('all');
                            }
                          }}
                        >
                          {favoritesOnly ? 'Показать все программы' : 'Сбросить фильтры'}
                        </Button>
                      </div>
                    ) : (
                      <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1">
                        <div className="flex w-max max-w-full items-stretch gap-3 md:gap-4">
                          {filteredCourses.map((course) => (
                            <CourseCard
                              key={course.id}
                              course={course}
                              compact
                              showClientRecommendation={clientRecommendedIds.has(course.id)}
                              href={ROUTES.clientAcademyCourse(course.id)}
                              showArchiveAccessHints={programsSegment === 'archive'}
                              favorite={{
                                active: isCourseFavorite(course.id),
                                onToggle: () => toggleCourse(course.id),
                                ariaLabel: isCourseFavorite(course.id)
                                  ? 'Убрать курс из избранного'
                                  : 'Добавить курс в избранное',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                </TabsContent>

                <TabsContent value="wiki" className="space-y-4 duration-500 animate-in fade-in">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                        <h2 className="text-[13px] font-semibold leading-tight text-[#1a2433]">
                          База знаний
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
                        <span className="shrink-0 whitespace-nowrap text-[11px] leading-tight text-[#6b7788]">
                          <span className="sm:hidden">
                            {wikiFilteredArticles.length}/{wikiMaterialsPoolCount}
                          </span>
                          <span className="hidden sm:inline">
                            {wikiFilteredArticles.length} из {wikiMaterialsPoolCount} материалов
                          </span>
                        </span>
                        <div
                          className="flex rounded-lg border border-slate-200 bg-slate-50/90 p-0.5 shadow-inner"
                          role="tablist"
                          aria-label="Раздел базы знаний"
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={wikiSegment === 'current'}
                            className={cn(
                              'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                              wikiSegment === 'current'
                                ? 'bg-white text-[#0b63ce] shadow-sm'
                                : 'text-[#6b7788] hover:text-[#1a2433]'
                            )}
                            onClick={() => setWikiSegment('current')}
                          >
                            Актуальные
                          </button>
                          <button
                            type="button"
                            role="tab"
                            aria-selected={wikiSegment === 'archive'}
                            className={cn(
                              'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                              wikiSegment === 'archive'
                                ? 'bg-white text-[#0b63ce] shadow-sm'
                                : 'text-[#6b7788] hover:text-[#1a2433]'
                            )}
                            onClick={() => setWikiSegment('archive')}
                          >
                            Архив
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid w-full max-w-full grid-cols-2 gap-x-2 gap-y-1 sm:ml-auto sm:max-w-[42rem] sm:grid-cols-4">
                      <div className="min-w-0 space-y-0.5">
                        <Label
                          htmlFor="wiki-filter-category"
                          className="text-[9px] font-semibold uppercase leading-none tracking-wide text-[#6b7788]"
                        >
                          Категория
                        </Label>
                        <Select value={wikiCategory} onValueChange={setWikiCategory}>
                          <SelectTrigger
                            id="wiki-filter-category"
                            className="h-7 min-h-7 border-slate-200 bg-white px-2 py-0 text-[11px] font-medium leading-none text-[#1a2433] shadow-sm"
                          >
                            <SelectValue placeholder="Категория" />
                          </SelectTrigger>
                          <SelectContent>
                            {wikiArticleCategories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-xs">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-12">
                    <div className="space-y-3 lg:col-span-3">
                      <Card className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm">
                        <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          <BookOpen className="size-3.5 text-[#0b63ce]" aria-hidden />
                          {wikiSegment === 'archive' ? 'Глоссарий архива' : 'Глоссарий'}
                        </h3>
                        <div className="scrollbar-hide grid max-h-[min(420px,55vh)] grid-cols-1 gap-1.5 overflow-y-auto pr-1">
                          {(wikiSegment === 'archive'
                            ? wikiArchiveGlossary
                            : Object.entries(glossary)
                          ).length === 0 ? (
                            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-2 py-4 text-center text-[11px] leading-snug text-slate-500">
                              {wikiSegment === 'archive'
                                ? 'В архивных материалах пока нет совпадений с глоссарием.'
                                : 'Глоссарий пуст.'}
                            </p>
                          ) : (
                            (wikiSegment === 'archive'
                              ? wikiArchiveGlossary
                              : Object.entries(glossary)
                            ).map(([abbr, info]) => (
                              <div
                                key={abbr}
                                className="rounded-lg border border-slate-100 bg-slate-50/90 p-2.5 transition-colors hover:border-[#0b63ce]/20 hover:bg-white"
                              >
                                <p className="mb-0.5 text-[12px] font-semibold text-[#1a2433]">
                                  {abbr}
                                </p>
                                <p className="mb-1 text-[10px] font-medium leading-tight text-slate-500">
                                  {info.term}
                                </p>
                                <p className="text-[11px] leading-snug text-slate-600">
                                  {info.definition}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>
                      <Card className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-sm">
                        <div className="mb-2 flex items-start gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-[#0b63ce]/10">
                            <HelpCircle className="size-4 text-[#0b63ce]" aria-hidden />
                          </div>
                          <div>
                            <h4 className="text-[13px] font-semibold leading-tight text-[#1a2433]">
                              Нужна помощь?
                            </h4>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-[#6b7788]">
                              Поддержка Syntha поможет с доступами и материалами.
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className={ACADEMY_CTA_PRIMARY_FULL_WIDTH}
                          asChild
                        >
                          <a href="mailto:support@syntha.ai?subject=%D0%97%D0%B0%D0%BF%D1%80%D0%BE%D1%81%20%D0%B0%D0%BD%D0%B0%D0%BB%D0%B8%D0%B7%D0%B0%20%D0%B2%20%D0%B0%D0%BA%D0%B0%D0%B4%D0%B5%D0%BC%D0%B8%D0%B8">
                            Написать в поддержку
                          </a>
                        </Button>
                      </Card>
                    </div>

                    <div className="space-y-3 lg:col-span-9">
                      {wikiFilteredArticles.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-[13px] text-slate-500">
                          <p>
                            {favoritesOnly
                              ? 'В избранном нет статей по текущим фильтрам.'
                              : 'Нет статей по выбранным фильтрам. Поменяйте категорию или поисковый запрос.'}
                          </p>
                          {favoritesOnly ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-4 h-9 rounded-lg border-slate-200 text-[11px] font-semibold text-[#0b63ce]"
                              onClick={toggleFavoritesOnly}
                            >
                              Показать все статьи
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1 lg:mx-0 lg:px-0">
                          <div className="flex w-max max-w-full items-stretch gap-3 md:gap-4">
                            {wikiFilteredArticles.map((article) => (
                              <CourseCard
                                key={article.id}
                                course={articleToCourse(article)}
                                compact
                                href={ROUTES.clientAcademyKnowledgeArticle(article.slug)}
                                durationLabel={format(new Date(article.updatedAt), 'd MMM yyyy', {
                                  locale: ru,
                                })}
                                footerProviderLabel={article.authorName}
                                imageAlt={`Иллюстрация статьи: ${article.title}`}
                                footerRight={
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-1.5 py-0.5 font-medium text-slate-800">
                                    <FileText className="size-3 text-[#0b63ce]" aria-hidden />
                                    Статья
                                  </span>
                                }
                                favorite={{
                                  active: isArticleFavorite(article.id),
                                  onToggle: () => toggleArticle(article.id),
                                  ariaLabel: isArticleFavorite(article.id)
                                    ? 'Убрать статью из избранного'
                                    : 'Добавить статью в избранное',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tests" className="space-y-4 duration-500 animate-in fade-in">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <ClipboardList className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                        <h2 className="text-[13px] font-semibold leading-tight text-[#1a2433]">
                          Тесты и аттестация
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
                        <span className="shrink-0 whitespace-nowrap text-[11px] leading-tight text-[#6b7788]">
                          <span className="sm:hidden">{assessmentsForTestsTab.length}</span>
                          <span className="hidden sm:inline">
                            {assessmentsForTestsTab.length}{' '}
                            {testsSegment === 'archive' ? 'в архиве' : 'активных'}
                          </span>
                        </span>
                        <div
                          className="flex rounded-lg border border-slate-200 bg-slate-50/90 p-0.5 shadow-inner"
                          role="tablist"
                          aria-label="Раздел аттестаций"
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={testsSegment === 'current'}
                            className={cn(
                              'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                              testsSegment === 'current'
                                ? 'bg-white text-[#0b63ce] shadow-sm'
                                : 'text-[#6b7788] hover:text-[#1a2433]'
                            )}
                            onClick={() => setTestsSegment('current')}
                          >
                            Актуальные
                          </button>
                          <button
                            type="button"
                            role="tab"
                            aria-selected={testsSegment === 'archive'}
                            className={cn(
                              'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                              testsSegment === 'archive'
                                ? 'bg-white text-[#0b63ce] shadow-sm'
                                : 'text-[#6b7788] hover:text-[#1a2433]'
                            )}
                            onClick={() => setTestsSegment('archive')}
                          >
                            Архив
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid w-full max-w-full grid-cols-2 gap-x-2 gap-y-1 sm:ml-auto sm:max-w-[42rem] sm:grid-cols-4">
                      <div className="min-w-0 space-y-0.5">
                        <Label
                          htmlFor="tests-filter-topic"
                          className="text-[9px] font-semibold uppercase leading-none tracking-wide text-[#6b7788]"
                        >
                          Тема
                        </Label>
                        <Select
                          value={testsCategory}
                          onValueChange={(v) => setTestsCategory(v as typeof testsCategory)}
                        >
                          <SelectTrigger
                            id="tests-filter-topic"
                            className="h-7 min-h-7 border-slate-200 bg-white px-2 py-0 text-[11px] font-medium leading-none text-[#1a2433] shadow-sm"
                          >
                            <SelectValue placeholder="Тема" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all" className="text-xs">
                              Все
                            </SelectItem>
                            {testsCategoryKeys.map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-xs">
                                {TESTS_CATEGORY_LABEL_RU[cat]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-1">
                    <div className="flex w-max max-w-full items-stretch gap-3 md:gap-4">
                      {assessmentsForTestsTab.length === 0 ? (
                        <div className="w-full min-w-[min(100%,20rem)] rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-[13px] text-slate-500">
                          {testsAssessmentPool.length === 0
                            ? testsSegment === 'archive'
                              ? 'В архиве пока нет завершённых аттестаций.'
                              : 'Нет активных аттестаций.'
                            : 'Нет аттестаций в выбранной теме — выберите «Все» в фильтре.'}
                        </div>
                      ) : (
                        assessmentsForTestsTab.map((assessment) => (
                          <CourseCard
                            key={assessment.id}
                            course={assessmentToCourse(assessment)}
                            compact
                            durationLabel={
                              assessment.timeLimitMinutes != null
                                ? `${assessment.timeLimitMinutes} мин`
                                : 'Без лимита'
                            }
                            footerProviderLabel={`Проход ${assessment.passingScore}%`}
                            footerRight={
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-800">
                                <ClipboardList className="size-3 text-[#0b63ce]" aria-hidden />
                                {assessment.questions.length}
                              </span>
                            }
                            afterFooter={
                              <div className="space-y-2">
                                {assessment.courseId ? (
                                  <Link
                                    href={ROUTES.clientAcademyCourse(assessment.courseId)}
                                    className="block text-center text-[11px] font-semibold text-[#0b63ce] hover:underline"
                                  >
                                    Материалы курса →
                                  </Link>
                                ) : null}
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => startTest(assessment)}
                                  className={ACADEMY_CTA_PRIMARY_FULL_WIDTH}
                                >
                                  Начать аттестацию
                                </Button>
                              </div>
                            }
                          />
                        ))
                      )}
                    </div>
                  </div>
                  <p className="mx-auto max-w-full overflow-x-auto px-2 text-center text-[11px] leading-normal text-[#6b7788]">
                    <span className="inline-block whitespace-nowrap">
                      После прохождения откройте связанный курс для закрепления материала или
                      повторите попытку позже.
                    </span>
                  </p>
                </TabsContent>

                <TabsContent value="live" className="space-y-4 duration-500 animate-in fade-in">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                      <h2 className="text-[13px] font-semibold leading-tight text-[#1a2433]">
                        Live и календарь
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium leading-tight text-[#6b7788]">
                        {liveSegment === 'upcoming' ? upcomingEvents.length : pastEvents.length}{' '}
                        {liveSegment === 'upcoming' ? 'предстоящих' : 'в архиве'}
                      </span>
                      <div
                        className="flex rounded-lg border border-slate-200 bg-slate-50/90 p-0.5 shadow-inner"
                        role="tablist"
                        aria-label="Лента событий"
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={liveSegment === 'upcoming'}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                            liveSegment === 'upcoming'
                              ? 'bg-white text-[#0b63ce] shadow-sm'
                              : 'text-[#6b7788] hover:text-[#1a2433]'
                          )}
                          onClick={() => setLiveSegment('upcoming')}
                        >
                          Предстоящие
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={liveSegment === 'archive'}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors',
                            liveSegment === 'archive'
                              ? 'bg-white text-[#0b63ce] shadow-sm'
                              : 'text-[#6b7788] hover:text-[#1a2433]'
                          )}
                          onClick={() => setLiveSegment('archive')}
                        >
                          Архив
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-8">
                      {liveSegment === 'upcoming' && featuredLiveEvent ? (
                        <section className="space-y-2">
                          <Card className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
                            <div className="flex flex-col sm:flex-row">
                              <div className="relative h-[150px] w-full shrink-0 bg-muted sm:h-auto sm:min-h-[170px] sm:w-[210px]">
                                <Image
                                  src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200"
                                  alt={`Иллюстрация: ${featuredLiveEvent.title}`}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 100vw, 210px"
                                />
                                <button
                                  type="button"
                                  className="absolute right-2 top-2 z-[2] flex size-8 items-center justify-center rounded-md border border-white/35 bg-black/40 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/55"
                                  aria-pressed={isEventFavorite(featuredLiveEvent.id)}
                                  aria-label={
                                    isEventFavorite(featuredLiveEvent.id)
                                      ? 'Убрать событие из избранного'
                                      : 'Добавить событие в избранное'
                                  }
                                  onClick={() => toggleEvent(featuredLiveEvent.id)}
                                >
                                  <Star
                                    className={cn(
                                      'size-4',
                                      isEventFavorite(featuredLiveEvent.id) &&
                                        'fill-amber-300 text-amber-200'
                                    )}
                                    strokeWidth={isEventFavorite(featuredLiveEvent.id) ? 0 : 2}
                                    aria-hidden
                                  />
                                </button>
                              </div>
                              <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
                                <Badge
                                  className={cn(
                                    'mb-2 w-fit rounded-sm border-0 px-2 py-0.5 text-[10px] font-semibold',
                                    featuredLiveEvent.status === 'live'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-amber-100 text-[#7a5200]'
                                  )}
                                >
                                  {featuredLiveEvent.status === 'live' ? 'В эфире' : 'Скоро'} ·{' '}
                                  {academyEventTypeLabel(featuredLiveEvent.type)}
                                </Badge>
                                <h3 className="mb-2 text-[13px] font-semibold leading-snug text-[#1a2433]">
                                  {featuredLiveEvent.title}
                                </h3>
                                <p className="mb-3 text-[11px] leading-relaxed text-[#6b7788]">
                                  {featuredLiveEvent.description}
                                </p>
                                {(knowledgeArticleHrefById(featuredLiveEvent.relatedId) ||
                                  featuredLiveEvent.relatedCourseId) && (
                                  <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
                                    <span className="font-semibold text-[#6b7788]">Материалы:</span>
                                    {knowledgeArticleHrefById(featuredLiveEvent.relatedId) ? (
                                      <Link
                                        href={
                                          knowledgeArticleHrefById(featuredLiveEvent.relatedId)!
                                        }
                                        className="font-semibold text-[#0b63ce] underline-offset-2 hover:underline"
                                      >
                                        Статья в базе знаний
                                      </Link>
                                    ) : null}
                                    {featuredLiveEvent.relatedCourseId ? (
                                      <Link
                                        href={ROUTES.clientAcademyCourse(
                                          featuredLiveEvent.relatedCourseId
                                        )}
                                        className="font-semibold text-[#0b63ce] underline-offset-2 hover:underline"
                                      >
                                        Курс
                                      </Link>
                                    ) : null}
                                  </div>
                                )}
                                <div className="mb-4 flex flex-wrap gap-3 text-[11px] text-[#6b7788]">
                                  <span className="flex items-center gap-1.5">
                                    <CalendarIcon
                                      className="size-4 shrink-0 text-[#0b63ce]"
                                      aria-hidden
                                    />
                                    {format(
                                      new Date(featuredLiveEvent.startTime),
                                      'd MMMM yyyy, HH:mm',
                                      {
                                        locale: ru,
                                      }
                                    )}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Users className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                                    {featuredLiveEvent.hostName}
                                  </span>
                                </div>
                                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                                  <Button
                                    asChild
                                    className="h-9 min-h-9 w-full rounded-lg bg-[#0b63ce] px-3 text-[11px] font-semibold text-white hover:bg-[#0954b0]"
                                  >
                                    <a
                                      href={
                                        featuredLiveEvent.streamUrl ??
                                        `${ROUTES.academyPlatform}?tab=live`
                                      }
                                      target={featuredLiveEvent.streamUrl ? '_blank' : undefined}
                                      rel={
                                        featuredLiveEvent.streamUrl
                                          ? 'noopener noreferrer'
                                          : undefined
                                      }
                                      className="inline-flex h-9 w-full items-center justify-center gap-2"
                                    >
                                      <Video className="size-4 shrink-0" aria-hidden />
                                      <span className="leading-tight">К трансляции</span>
                                    </a>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="inline-flex h-9 min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-[#1a2433] shadow-sm hover:bg-slate-50"
                                    onClick={() =>
                                      downloadAcademyEventIcs(featuredLiveEvent, {
                                        url: featuredLiveEvent.streamUrl,
                                      })
                                    }
                                    aria-label="Скачать событие в формате iCalendar"
                                  >
                                    <Download className="size-4 shrink-0" aria-hidden />
                                    <span className="leading-tight">В календарь (.ics)</span>
                                  </Button>
                                  <Button
                                    asChild
                                    variant="outline"
                                    className="h-9 min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-[#1a2433] shadow-sm hover:bg-slate-50"
                                  >
                                    <Link
                                      href={calendarHrefForRole(viewRole)}
                                      className="inline-flex h-9 w-full items-center justify-center gap-2"
                                    >
                                      <CalendarIcon
                                        className="size-4 shrink-0 text-[#0b63ce]"
                                        aria-hidden
                                      />
                                      <span className="leading-tight">В календаре</span>
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </section>
                      ) : null}

                      {liveSegment === 'upcoming' && !featuredLiveEvent ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/90 px-4 py-8 text-center text-[13px] leading-snug text-[#6b7788]">
                          Нет предстоящих эфиров. Загляните в архив или откройте календарь Syntha.
                        </div>
                      ) : null}

                      <section className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <CalendarIcon className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                            <h2 className="text-[13px] font-semibold leading-tight text-[#1a2433]">
                              {liveSegment === 'upcoming' ? 'Предстоящие события' : 'Архив записей'}
                            </h2>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'space-y-0 rounded-xl border border-slate-200/90 bg-white p-2 shadow-sm',
                            liveSegment === 'upcoming' &&
                              otherUpcomingEvents.length > 1 &&
                              'max-h-[min(360px,50vh)] overflow-y-auto overscroll-y-contain',
                            liveSegment === 'archive' &&
                              pastEvents.length > 1 &&
                              'max-h-[min(360px,50vh)] overflow-y-auto overscroll-y-contain'
                          )}
                        >
                          {liveSegment === 'upcoming' && otherUpcomingEvents.length === 0 ? (
                            <p className="px-2 py-8 text-center text-[13px] leading-snug text-[#6b7788]">
                              Нет других предстоящих событий — откройте календарь Syntha.
                            </p>
                          ) : liveSegment === 'archive' && pastEvents.length === 0 ? (
                            <p className="px-2 py-8 text-center text-[13px] text-[#6b7788]">
                              В архиве пока нет записей.
                            </p>
                          ) : (
                            (liveSegment === 'upcoming' ? otherUpcomingEvents : pastEvents).map(
                              (event) => (
                                <div
                                  key={event.id}
                                  className="flex flex-col gap-2 border-b border-[#e6e9ef] py-2.5 pl-0.5 pr-0.5 transition-colors last:border-0 hover:bg-slate-50/90 sm:flex-row sm:items-start sm:justify-between"
                                >
                                  <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-sm border border-slate-200 bg-[#f7f8fa] text-[#1a2433]">
                                      <span className="text-[13px] font-semibold leading-none">
                                        {format(new Date(event.startTime), 'dd')}
                                      </span>
                                      <span className="mt-0.5 text-[9px] font-medium uppercase text-[#6b7788]">
                                        {format(new Date(event.startTime), 'MMM', { locale: ru })}
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="mb-0.5 flex flex-wrap items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="border-slate-200 text-[10px] font-medium normal-case text-[#6b7788]"
                                        >
                                          {academyEventTypeLabel(event.type)}
                                        </Badge>
                                        <span className="text-[11px] text-[#6b7788]">
                                          {format(new Date(event.startTime), 'HH:mm')} –{' '}
                                          {format(new Date(event.endTime), 'HH:mm')}
                                        </span>
                                      </div>
                                      <p className="truncate text-[13px] font-semibold leading-snug text-[#1a2433]">
                                        {event.title}
                                      </p>
                                      <p className="mt-0.5 text-[11px] text-[#6b7788]">
                                        {event.hostName}
                                      </p>
                                      {(knowledgeArticleHrefById(event.relatedId) ||
                                        event.relatedCourseId) && (
                                        <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                                          {knowledgeArticleHrefById(event.relatedId) ? (
                                            <Link
                                              href={knowledgeArticleHrefById(event.relatedId)!}
                                              className="font-semibold text-[#0b63ce] hover:underline"
                                            >
                                              Статья
                                            </Link>
                                          ) : null}
                                          {event.relatedCourseId ? (
                                            <Link
                                              href={ROUTES.clientAcademyCourse(
                                                event.relatedCourseId
                                              )}
                                              className="font-semibold text-[#0b63ce] hover:underline"
                                            >
                                              Курс
                                            </Link>
                                          ) : null}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:max-w-[280px] sm:self-center">
                                    <button
                                      type="button"
                                      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#0b63ce] shadow-sm hover:bg-slate-50"
                                      aria-pressed={isEventFavorite(event.id)}
                                      aria-label={
                                        isEventFavorite(event.id)
                                          ? 'Убрать из избранного'
                                          : 'В избранное'
                                      }
                                      onClick={() => toggleEvent(event.id)}
                                    >
                                      <Star
                                        className={cn(
                                          'size-4',
                                          isEventFavorite(event.id) &&
                                            'fill-amber-400 text-amber-600'
                                        )}
                                        strokeWidth={isEventFavorite(event.id) ? 0 : 2}
                                        aria-hidden
                                      />
                                    </button>
                                    {liveSegment === 'upcoming' ? (
                                      <>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="inline-flex h-9 min-h-9 min-w-[7.5rem] flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-[#0b63ce] shadow-sm hover:bg-slate-50 sm:min-w-[8.5rem] sm:px-3"
                                          onClick={() =>
                                            downloadAcademyEventIcs(event, { url: event.streamUrl })
                                          }
                                          aria-label="Скачать событие в формате iCalendar"
                                        >
                                          <Download className="size-4 shrink-0" aria-hidden />
                                          <span className="leading-tight">В календарь (.ics)</span>
                                        </Button>
                                        <Button
                                          asChild
                                          variant="outline"
                                          className="h-9 min-h-9 min-w-[7.5rem] flex-1 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-[#0b63ce] shadow-sm hover:bg-slate-50 sm:min-w-[8.5rem] sm:px-3"
                                        >
                                          <Link
                                            href={calendarHrefForRole(viewRole)}
                                            className="inline-flex h-9 w-full items-center justify-center gap-2 px-0.5 text-center leading-tight"
                                          >
                                            <CalendarIcon
                                              className="size-4 shrink-0 text-[#0b63ce]"
                                              aria-hidden
                                            />
                                            <span className="leading-tight">В календаре</span>
                                          </Link>
                                        </Button>
                                      </>
                                    ) : event.recordingUrl ? (
                                      <Button
                                        asChild
                                        className="h-9 shrink-0 rounded-lg bg-[#0b63ce] px-4 text-[11px] font-semibold text-white hover:bg-[#0954b0]"
                                      >
                                        <a
                                          href={event.recordingUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <PlayCircle className="mr-2 size-4" aria-hidden />
                                          Запись
                                        </a>
                                      </Button>
                                    ) : (
                                      <span className="text-[11px] text-[#6b7788]">
                                        Запись скоро
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            )
                          )}
                        </div>
                      </section>
                    </div>

                    <div className="lg:col-span-4">
                      <Card className="space-y-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <ClipboardList className="size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                            <h3 className="text-[13px] font-semibold leading-tight text-[#1a2433]">
                              Практика и закрепление
                            </h3>
                          </div>
                          <Badge className="h-5 shrink-0 border-none bg-[#0b63ce]/10 px-2 text-[10px] font-semibold text-[#0b63ce]">
                            New
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {mockAcademyDeskTasks.map((task) => (
                            <button
                              key={task.id}
                              type="button"
                              onClick={goToTestsTab}
                              className="group block w-full cursor-pointer rounded-xl border border-slate-200/90 bg-white p-3 text-left shadow-sm transition-all hover:border-[#0b63ce]/25 hover:shadow-md"
                            >
                              <div className="mb-3 flex items-start justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7788]">
                                  {task.type}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="h-5 border-[#94a3b8] px-2 text-[9px] font-black uppercase"
                                >
                                  {task.difficulty}
                                </Badge>
                              </div>
                              <h5 className="mb-3 text-[13px] font-semibold leading-snug text-[#1a2433] transition-colors group-hover:text-[#0b63ce]">
                                {task.title}
                              </h5>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[#0b63ce]">
                                  +{task.points} SP
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7788]">
                                  Начать →
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={goToTestsTab}
                          className="mt-3 h-9 w-full rounded-lg bg-[#0b63ce] text-[11px] font-semibold text-white hover:bg-[#0954b0]"
                        >
                          К тестам и кейсам
                        </Button>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div
            className="pointer-events-none fixed inset-0 -z-10 opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
            aria-hidden
          />
        </div>
      </div>

      {/* Assessment Modal */}
      <Dialog open={!!activeAssessment} onOpenChange={() => setActiveAssessment(null)}>
        <DialogContent className="rounded-xl p-4 sm:max-w-2xl">
          {activeAssessment && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0b63ce]">
                    Аттестация: {activeAssessment.title}
                  </p>
                  <h3 className="text-base font-black uppercase tracking-tight">
                    Вопрос {currentQuestionIndex + 1} из {activeAssessment.questions.length}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#6b7788]">
                    Прогресс
                  </p>
                  <p className="text-sm font-black">
                    {Math.round(
                      ((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100
                    )}
                    %
                  </p>
                </div>
              </div>

              <Progress
                value={((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100}
                className="h-2 rounded-full"
              />

              <div className="space-y-4">
                <p className="text-sm font-black uppercase leading-tight tracking-tight">
                  {activeAssessment.questions[currentQuestionIndex].text}
                </p>

                <div className="space-y-3">
                  {activeAssessment.questions[currentQuestionIndex].options.map(
                    (option: string) => (
                      <button
                        key={option}
                        onClick={() =>
                          handleAnswer(activeAssessment.questions[currentQuestionIndex].id, option)
                        }
                        className={cn(
                          'w-full rounded-2xl border-2 p-4 text-left text-xs font-bold uppercase tracking-tight transition-all',
                          answers[activeAssessment.questions[currentQuestionIndex].id] === option
                            ? 'border-[#0b63ce] bg-[#0b63ce]/10 text-[#0b63ce] shadow-lg'
                            : 'border-[#c5ccd6] text-[#5b6675] hover:border-[#94a3b8]'
                        )}
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="ghost"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="text-[10px] font-bold uppercase tracking-widest"
                >
                  Назад
                </Button>
                {currentQuestionIndex === activeAssessment.questions.length - 1 ? (
                  <Button
                    onClick={finishTest}
                    disabled={!answers[activeAssessment.questions[currentQuestionIndex].id]}
                    className="h-12 rounded-2xl bg-[#0b63ce] px-8 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#0954b0]"
                  >
                    Завершить тест
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    disabled={!answers[activeAssessment.questions[currentQuestionIndex].id]}
                    className="h-12 rounded-2xl bg-[#1a2433] px-8 text-[10px] font-bold uppercase tracking-widest text-white"
                  >
                    Следующий вопрос
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Result Modal */}
      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="rounded-xl p-4 text-center sm:max-w-md">
          <div className="space-y-4">
            <div
              className={cn(
                'mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-xl',
                testScore >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              )}
            >
              {testScore >= 80 ? (
                <Check className="h-12 w-12" />
              ) : (
                <CloseIcon className="h-12 w-12" />
              )}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-black uppercase tracking-tight">
                {testScore >= 80 ? 'Поздравляем!' : 'Нужно подтянуть знания'}
              </h3>
              <p className="font-medium text-[#5b6675]">
                {testScore >= 80
                  ? 'Вы успешно прошли аттестацию и подтвердили свои навыки.'
                  : 'К сожалению, вы не набрали достаточное количество баллов для сертификации.'}
              </p>
            </div>
            <div className="rounded-xl bg-[#f7f8fa] p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7788]">
                Ваш результат
              </p>
              <p className="text-base font-black text-[#1a2433]">{testScore}%</p>
            </div>
            <Button
              type="button"
              className="h-10 w-full rounded-2xl bg-[#1a2433] text-[11px] font-bold uppercase tracking-widest"
              onClick={() => {
                setIsResultOpen(false);
                onAcademyTabChange(testScore >= 80 ? 'tests' : 'courses');
                scrollToAcademyTabs();
              }}
            >
              {testScore >= 80 ? 'К аттестациям и сертификатам' : 'К каталогу программ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

function CourseCard({
  course,
  featured,
  compact,
  showClientRecommendation = false,
  href,
  durationLabel,
  footerProviderLabel,
  footerRight,
  afterFooter,
  favorite,
  imageAlt,
  showArchiveAccessHints = false,
}: {
  course: EducationCourse;
  featured?: boolean;
  compact?: boolean;
  /** Подборка под роль клиента или флаг «рекомендуем» в каталоге */
  showClientRecommendation?: boolean;
  /** Страница курса — вся карточка становится ссылкой (не использовать вместе с afterFooter) */
  href?: string;
  /** Подпись у часов вместо course.duration */
  durationLabel?: string;
  /** Левая часть футера вместо course.provider */
  footerProviderLabel?: string;
  /** Правая часть футера вместо блока со студентами */
  footerRight?: ReactNode;
  /** Кнопка под футером (аттестации) */
  afterFooter?: ReactNode;
  /** Избранное поверх обложки (не вкладывать кнопку в ссылку карточки) */
  favorite?: { active: boolean; onToggle: () => void; ariaLabel: string };
  /** Подпись для обложки (a11y) */
  imageAlt?: string;
  /** Подсказки доступа к материалам в архивном сегменте каталога */
  showArchiveAccessHints?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const categoryMap: Record<string, string> = {
    economics: 'Экономика',
    design: 'Дизайн',
    production: 'Производство',
    analytics: 'Аналитика',
    management: 'Менеджмент',
    retail: 'Ритейл',
    legal: 'Право',
  };

  const hasMedia = (course.media?.length ?? 0) > 0;
  const pad = compact ? 'p-2.5' : 'p-4';
  const titleCls = compact
    ? 'text-[13px] font-semibold leading-snug'
    : 'text-base font-semibold leading-snug';

  const card = (
    <Card
      id={href || !course.id ? undefined : `course-${course.id}`}
      className={cn(
        'group flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:border-[#0b63ce]/25',
        compact ? 'h-[448px]' : 'h-full',
        featured && 'ring-1 ring-[#0b63ce]/30',
        href && !compact && 'h-full'
      )}
    >
      <div
        className={cn(
          'relative w-full shrink-0 overflow-hidden bg-[#dde1e8]',
          compact ? 'h-[72px]' : 'aspect-[16/10]'
        )}
      >
        {!imgFailed ? (
          <Image
            src={course.thumbnail}
            alt={imageAlt ?? `Обложка: ${course.title}`}
            fill
            sizes="(max-width:768px) 45vw, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            onError={() => setImgFailed(true)}
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400"
            aria-hidden
          />
        )}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent',
            compact ? 'from-black/25' : 'from-black/50'
          )}
          aria-hidden
        />
        <div className="absolute inset-x-2 top-2 flex flex-col items-start gap-0.5">
          {course.isNew ? (
            <Badge className="rounded-md border-none bg-emerald-600 px-1.5 py-0 text-[8px] font-semibold text-white">
              Новое
            </Badge>
          ) : null}
          {showClientRecommendation ? (
            <Badge className="flex items-center gap-0.5 rounded-md border-none bg-indigo-600 px-1.5 py-0 text-[8px] font-semibold text-white">
              <Target className="size-2.5 shrink-0" aria-hidden />
              Вам
            </Badge>
          ) : null}
        </div>
        {favorite ? (
          <button
            type="button"
            className="pointer-events-auto absolute right-1.5 top-1.5 z-[5] flex size-7 items-center justify-center rounded-md border border-white/35 bg-black/40 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/55"
            aria-pressed={favorite.active}
            aria-label={favorite.ariaLabel}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              favorite.onToggle();
            }}
          >
            <Star
              className={cn('size-3.5', favorite.active && 'fill-amber-300 text-amber-200')}
              strokeWidth={favorite.active ? 0 : 2}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
      <CardHeader className={cn(pad, 'pb-0.5 pt-2')}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="rounded-md border-slate-200 px-1.5 py-0 text-[10px] font-medium normal-case text-slate-600"
          >
            {categoryMap[course.category] || course.category}
          </Badge>
          <div className="flex shrink-0 items-center text-[10px] font-medium text-[#6b7788]">
            <Clock className="mr-1 size-3 text-[#0b63ce]" aria-hidden />
            {durationLabel ?? course.duration}
          </div>
        </div>
        <CardTitle
          className={cn(
            'text-slate-900 transition-colors group-hover:text-[#0b63ce]',
            titleCls,
            compact && 'line-clamp-3 min-h-[3.15rem]'
          )}
        >
          <GlossaryText text={course.title} />
        </CardTitle>
        <div className={cn('flex flex-wrap gap-1', compact ? 'mb-1.5' : 'mb-2')}>
          {courseProviderKindShortLabel(course.providerKind) ? (
            <Badge
              variant="outline"
              className="rounded-md border-slate-200 px-1.5 py-0 text-[9px] font-medium normal-case text-slate-700"
            >
              {courseProviderKindShortLabel(course.providerKind)}
            </Badge>
          ) : null}
          <Badge
            variant="outline"
            className="rounded-md border-violet-200/80 bg-violet-50/70 px-1.5 py-0 text-[9px] font-medium normal-case text-violet-900"
          >
            {courseAudienceKindLabel(course)}
          </Badge>
          {course.archived ? (
            <Badge
              variant="secondary"
              className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0 text-[9px] font-semibold normal-case text-slate-700"
            >
              Архив
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className={cn('flex min-h-0 flex-1 flex-col', pad, 'pt-0')}>
        <p
          className={cn(
            'text-left text-[11px] leading-snug text-[#5b6675]',
            compact ? 'line-clamp-5' : 'line-clamp-4',
            !compact && hasMedia ? 'mb-3' : 'mb-0'
          )}
        >
          <GlossaryText text={course.description} />
        </p>
        {hasMedia ? (
          <div className="mt-auto pt-2">
            {showArchiveAccessHints && course.archived ? (
              <p className="mb-1.5 text-[9px] leading-snug text-slate-600">
                {inferCourseAccess(course) === 'free'
                  ? 'Архив: бесплатный курс — материалы в комплекте открыты.'
                  : 'Архив: платный курс — для доступа к материалам требуется оплата.'}
              </p>
            ) : null}
            {courseOutcomeLabel(course) ? (
              <div className="pb-2">
                <Badge
                  variant="outline"
                  className="rounded-md border-indigo-200/80 bg-indigo-50/80 px-1.5 py-0 text-[9px] font-medium normal-case text-indigo-900"
                >
                  {courseOutcomeLabel(course)}
                </Badge>
              </div>
            ) : null}
            <div
              className={cn(
                courseOutcomeLabel(course) ? 'border-t border-[#e6e9ef] pt-2' : undefined
              )}
            >
              <p className="mb-1 text-[9px] font-medium uppercase tracking-wide text-[#6b7788]">
                В комплекте
              </p>
              <div className="flex flex-col gap-0.5">
                {course.media!.map((m, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-1 rounded-lg border border-slate-100 bg-slate-50 px-1.5 py-0.5"
                    title={m.title}
                  >
                    {m.type === 'video' ? (
                      <Video className="mt-0.5 size-3 shrink-0 text-[#0b63ce]" aria-hidden />
                    ) : (
                      <FileText className="mt-0.5 size-3 shrink-0 text-[#0b63ce]" aria-hidden />
                    )}
                    <span className="min-w-0 flex-1 text-[9px] font-medium leading-snug text-[#1a2433]">
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : courseOutcomeLabel(course) ? (
          <div className="mt-auto pt-2">
            <Badge
              variant="outline"
              className="rounded-md border-indigo-200/80 bg-indigo-50/80 px-1.5 py-0 text-[9px] font-medium normal-case text-indigo-900"
            >
              {courseOutcomeLabel(course)}
            </Badge>
          </div>
        ) : compact ? (
          <div className="flex-1 border-t border-transparent pt-2" aria-hidden />
        ) : null}
      </CardContent>
      <CardFooter className={cn('mt-auto border-t border-[#e6e9ef]', pad, 'py-2')}>
        <div className="flex w-full items-center justify-between gap-2 text-[10px]">
          <span className="truncate font-medium text-[#6b7788]">
            {footerProviderLabel ?? course.provider}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {footerRight == null ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-1.5 py-0.5 font-medium text-slate-800">
                <Users className="size-3 text-[#0b63ce]" aria-hidden />
                {course.studentsCount}
              </span>
            ) : (
              footerRight
            )}
            <Badge
              variant="outline"
              className={cn(
                'shrink-0 rounded-md border-slate-200 px-1.5 py-0 text-[9px] font-semibold normal-case',
                inferCourseAccess(course) === 'free' ? 'text-emerald-800' : 'text-amber-900'
              )}
            >
              {formatCoursePrice(course)}
            </Badge>
          </div>
        </div>
      </CardFooter>
      {afterFooter ? (
        <div
          className={cn(
            'border-t border-[#e6e9ef]',
            compact ? 'px-2.5 pb-2.5 pt-2' : 'px-4 pb-4 pt-2'
          )}
        >
          {afterFooter}
        </div>
      ) : null}
    </Card>
  );

  if (href && !afterFooter) {
    const linkOverlayClass = cn(
      'absolute inset-0 z-0 rounded-xl no-underline outline-none ring-offset-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#0b63ce]/40'
    );
    const wrapClass = cn(
      'relative flex h-full min-h-0 flex-col rounded-xl',
      compact ? 'w-[min(220px,calc(100vw-3rem))] shrink-0' : 'w-full'
    );
    if (favorite) {
      return (
        <div className={wrapClass}>
          <Link
            href={href}
            className={linkOverlayClass}
            aria-label={imageAlt ?? `Открыть: ${course.title}`}
          />
          <div className="pointer-events-none relative z-[1] flex h-full min-h-0 flex-col">
            {card}
          </div>
        </div>
      );
    }
    return (
      <Link
        href={href}
        className={cn(
          'flex h-full min-h-0 flex-col rounded-xl no-underline outline-none ring-offset-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#0b63ce]/40',
          compact ? 'w-[min(220px,calc(100vw-3rem))] shrink-0' : 'w-full'
        )}
      >
        {card}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col',
        compact ? 'w-[min(220px,calc(100vw-3rem))] shrink-0' : 'w-full'
      )}
    >
      {card}
    </div>
  );
}

function LearningPathCard({ path }: { path: LearningPath }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const pathHref = ROUTES.clientAcademyPath(path.id);
  const startCourseHref = pathHref;
  const stepCount = path.courses.length;
  const stepLabel =
    stepCount === 1 ? '1 курс' : stepCount < 5 ? `${stepCount} курса` : `${stepCount} курсов`;

  return (
    <>
      <Card
        id={`path-${path.id}`}
        className="flex h-full max-h-none min-h-0 flex-col rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:border-[#0b63ce]/25 hover:shadow-md"
      >
        <CardHeader className="space-y-1.5 p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-[#0b63ce]/10">
              <TrendingUp className="size-4 text-[#0b63ce]" aria-hidden />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1">
              <Badge className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium normal-case text-slate-600">
                Программа
              </Badge>
              {path.archived ? (
                <Badge className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold normal-case text-amber-900">
                  Архив
                </Badge>
              ) : null}
            </div>
          </div>
          {path.audience ? (
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {path.audience}
            </p>
          ) : null}
          <CardTitle className="text-[14px] font-semibold leading-snug text-slate-900">
            <Link href={pathHref} className="text-slate-900 transition-colors hover:text-[#0b63ce]">
              {path.title}
            </Link>
          </CardTitle>
          <CardDescription className="text-[12px] leading-relaxed text-slate-600">
            {path.description}
          </CardDescription>
          {path.archived ? (
            <p className="text-[10px] leading-snug text-amber-900/90">
              Программа в архиве: материалы можно просматривать; набор неактивен. Для платных шагов
              доступ к материалам — после оплаты; бесплатные шаги остаются открытыми.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <Badge
              variant="secondary"
              className="gap-1 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-medium normal-case text-slate-700"
            >
              <ListOrdered className="size-3 shrink-0" aria-hidden />
              {stepLabel}
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-medium normal-case text-slate-700"
            >
              <Clock className="size-3 shrink-0" aria-hidden />
              {path.totalDuration}
            </Badge>
            {path.level ? (
              <Badge
                variant="outline"
                className="rounded-md px-2 py-0.5 text-[10px] font-medium normal-case"
              >
                {academyLevelLabels[path.level]}
              </Badge>
            ) : null}
            {path.format ? (
              <Badge
                variant="outline"
                className="max-w-[min(100%,11rem)] truncate rounded-md px-2 py-0.5 text-[10px] font-normal normal-case"
                title={path.format}
              >
                {path.format}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="grow space-y-2.5 p-3 pt-0">
          <p className="text-[11px] font-medium text-slate-500">Шаги программы</p>
          <div
            className={cn(
              stepCount > 2 && 'scrollbar-hide max-h-[min(220px,45vh)] overflow-y-auto pr-0.5'
            )}
          >
            <ol className="space-y-2">
              {path.courses.map((courseId, i) => {
                const course = getCourseById(courseId);
                return (
                  <li key={courseId}>
                    <Link
                      href={ROUTES.clientAcademyCourse(courseId)}
                      className="flex gap-2 rounded-md p-0.5 text-[13px] text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-[#0b63ce] hover:underline">
                          {course?.title}
                        </span>
                        {course ? (
                          <span className="mt-0.5 block min-w-0 space-y-0.5 text-slate-500">
                            <span className="block truncate whitespace-nowrap text-[11px] leading-tight">
                              {course.duration}
                            </span>
                            <span className="block truncate whitespace-nowrap text-[11px] leading-tight">
                              {formatCoursePrice(course)}
                              {courseOutcomeLabel(course) ? ` · ${courseOutcomeLabel(course)}` : ''}
                            </span>
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
            <Award className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <p className="text-[11px] font-medium text-slate-500">Результат</p>
              <p className="text-[12px] font-semibold text-emerald-700">{path.outcome}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2 border-t border-slate-100 p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-lg border-slate-200 px-3 text-[11px] font-semibold"
            onClick={() => setAboutOpen(true)}
          >
            О программе
          </Button>
          {path.archived ? (
            <Button
              size="sm"
              type="button"
              disabled
              className="h-7 rounded-lg bg-slate-200 px-4 text-[11px] font-semibold text-slate-500 shadow-none"
              title="Программа в архиве — новые зачисления недоступны"
            >
              Начать путь
            </Button>
          ) : (
            <Button size="sm" className={ACADEMY_CTA_PRIMARY} asChild>
              <Link href={startCourseHref}>Начать путь</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
      <LearningPathAboutDialog path={path} open={aboutOpen} onOpenChange={setAboutOpen} />
    </>
  );
}
