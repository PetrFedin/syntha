'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import LivePlayer from '@/components/live-player';
import LiveStreamCard from '@/components/live-stream-card';
import type { ImagePlaceholder } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { X, Calendar as CalendarIcon, PlayCircle, Mic, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSameDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import PodcastCard from '@/components/podcast-card';
import { useUIState } from '@/providers/ui-state';
import { StreamDateDisplay } from '@/components/live/stream-date-display';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function LivePage() {
  const { viewRole, user } = useUIState();
  const [isLivePlayerOpen, setIsLivePlayerOpen] = useState(false);

  const role = user?.activeOrganizationId?.includes('org-brand')
    ? 'brand'
    : user?.activeOrganizationId?.includes('org-factory')
      ? 'factory'
      : 'client';
  const [selectedEvent, setSelectedEvent] = useState<ImagePlaceholder | null>(null);
  const [isEventLive, setIsEventLive] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [activeFilters, setActiveFilters] = useState<string[]>(['Все']);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const streamsPerPage = 6;

  const allStreams = useMemo(
    () => [
      ...PlaceHolderImages.filter((img) => img.id.startsWith('live-')),
      ...PlaceHolderImages.filter((img) => img.id.startsWith('upcoming-')),
      ...PlaceHolderImages.filter((img) => img.id.startsWith('story-')),
      ...PlaceHolderImages.filter((img) => img.id.startsWith('podcast-')),
    ],
    []
  );

  const streamCategories = useMemo(() => {
    const categories = new Set(allStreams.map((s) => s.category).filter(Boolean));
    return ['Все', ...Array.from(categories)] as string[];
  }, [allStreams]);

  const allHashtags = useMemo(() => {
    const hashtags = new Set(allStreams.flatMap((s) => s.hashtags || []));
    return Array.from(hashtags);
  }, [allStreams]);

  const filteredStreams = useMemo(() => {
    return allStreams.filter((stream) => {
      const categoryMatch =
        activeFilters.includes('Все') ||
        (stream.category && activeFilters.some((f) => stream.category === f));
      const hashtagMatch =
        selectedHashtags.length === 0 ||
        (stream.hashtags && stream.hashtags.some((h) => selectedHashtags.includes(h)));
      const dateMatch = !date || (stream.date && isSameDay(parseISO(stream.date), date));
      return categoryMatch && hashtagMatch && dateMatch;
    });
  }, [activeFilters, selectedHashtags, date, allStreams]);

  const filteredLiveImages = filteredStreams.filter((s) => s.id.startsWith('live-'));
  const filteredUpcomingStreams = filteredStreams.filter((s) => s.id.startsWith('upcoming-'));
  const filteredPastStreams = filteredStreams.filter((s) => s.id.startsWith('story-'));

  const filteredLivePodcasts = filteredStreams.filter((s) => s.id.startsWith('podcast-live-'));
  const filteredUpcomingPodcasts = filteredStreams.filter((s) =>
    s.id.startsWith('podcast-upcoming-')
  );
  const filteredPastPodcasts = filteredStreams.filter((s) => s.id.startsWith('podcast-past-'));

  const streamDates = useMemo(
    () => allStreams.filter((s) => s.date).map((s) => parseISO(s.date!)),
    [allStreams]
  );

  // Pagination logic
  const indexOfLastStream = currentPage * streamsPerPage;
  const indexOfFirstStream = indexOfLastStream - streamsPerPage;
  const currentPastStreams = filteredPastStreams.slice(indexOfFirstStream, indexOfLastStream);
  const totalPages = Math.ceil(filteredPastStreams.length / streamsPerPage);

  const handleOpenLivePlayer = (event: ImagePlaceholder, isLive: boolean) => {
    setSelectedEvent(event);
    setIsEventLive(isLive);
    setIsLivePlayerOpen(true);
  };

  const toggleHashtag = (hashtag: string) => {
    setSelectedHashtags((prev) =>
      prev.includes(hashtag) ? prev.filter((h) => h !== hashtag) : [...prev, hashtag]
    );
  };

  const toggleFilter = (filter: string) => {
    if (filter === 'Все') {
      setActiveFilters(['Все']);
      return;
    }

    setActiveFilters((prev) => {
      const newFilters = prev.filter((f) => f !== 'Все');
      if (newFilters.includes(filter)) {
        const updated = newFilters.filter((f) => f !== filter);
        return updated.length === 0 ? ['Все'] : updated;
      } else {
        return [...newFilters, filter];
      }
    });
  };

  const DayWithStreams = (day: Date) => {
    const streamsOnDay = allStreams.filter((s) => s.date && isSameDay(parseISO(s.date), day));
    if (streamsOnDay.length === 0) return <div>{day.getDate()}</div>;

    return (
      <Popover>
        <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
          <div className="relative flex h-full w-full items-center justify-center">
            {day.getDate()}
            <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent"></span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-3">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">
                События за {day.toLocaleDateString('ru-RU')}
              </h4>
              <p className="text-sm text-muted-foreground">Нажмите, чтобы посмотреть.</p>
            </div>
            <div className="grid gap-2">
              {streamsOnDay.map((stream) => (
                <button
                  key={stream.id}
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-accent/50"
                  onClick={() => handleOpenLivePlayer(stream, stream.id.startsWith('live-'))}
                >
                  <Image
                    src={stream.imageUrl}
                    width={40}
                    height={40}
                    alt={stream.description}
                    className="rounded-md object-cover"
                  />
                  <span className="truncate text-sm font-medium">{stream.description}</span>
                  <PlayCircle className="ml-auto h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="mt-8 flex items-center justify-center gap-3">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          variant="outline"
        >
          Назад
        </Button>
        <span className="text-sm text-muted-foreground">
          Страница {currentPage} из {totalPages}
        </span>
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Вперед
        </Button>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-16 pb-24 sm:px-6">
        {viewRole === 'b2b' && (
          <div className="grid grid-cols-1 gap-3 duration-500 animate-in slide-in-from-top-4 md:grid-cols-3">
            <Card className="bg-text-primary group relative flex items-center justify-between overflow-hidden rounded-xl border-none p-4 text-white shadow-2xl md:col-span-2">
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform duration-700 group-hover:scale-110">
                <Mic className="h-32 w-32" />
              </div>
              <div className="relative z-10 space-y-4">
                <Badge className="border-none bg-rose-600 px-2 text-[8px] font-black uppercase tracking-widest text-white">
                  Broadcast Control
                </Badge>
                <h3 className="text-base font-black uppercase tracking-tighter">
                  Управление эфирами
                </h3>
                <p className="text-text-muted max-w-md text-sm font-medium italic">
                  {role === 'brand'
                    ? 'Запускайте презентации коллекций и общайтесь с байерами в реальном времени.'
                    : 'Демонстрируйте прозрачность производства и технологические процессы через Live-стримы.'}
                </p>
                <Button
                  asChild
                  className="text-text-primary h-12 rounded-xl bg-white px-8 text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105"
                >
                  <Link href={role === 'brand' ? ROUTES.brand.live : EXTENDED_ROUTES.factory.live}>
                    Открыть Dashboard
                  </Link>
                </Button>
              </div>
            </Card>
            <Card className="bg-accent-primary relative flex flex-col justify-between overflow-hidden rounded-xl border-none p-4 text-white shadow-xl">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="text-accent-primary/40 h-5 w-5" />
                  <span className="text-accent-primary/30 text-[10px] font-black uppercase tracking-widest">
                    B2B Аудитория
                  </span>
                </div>
                <h4 className="text-sm font-black tabular-nums">4.2k</h4>
                <p className="text-accent-primary/30 text-[10px] font-bold uppercase leading-relaxed tracking-widest">
                  Активных байеров в сети
                </p>
              </div>
              <div className="relative z-10 border-t border-white/10 pt-4">
                <p className="text-accent-primary/40 flex items-center gap-2 text-[9px] font-black uppercase">
                  <Zap className="fill-accent-primary/40 h-3 w-3" /> AI Insight: "Вечерние стримы
                  (19:00+) повышают CTR на 24%"
                </p>
              </div>
            </Card>
          </div>
        )}

        <header className="mb-8">
          <h1 className="font-headline text-sm font-bold md:text-sm">Прямые эфиры и Подкасты</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Присоединяйтесь к нашим live-трансляциям, слушайте подкасты, общайтесь со стилистами и
            совершайте покупки в режиме реального времени.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          {streamCategories.map((filter) => (
            <Button
              key={filter}
              variant={activeFilters.includes(filter) ? 'default' : 'secondary'}
              onClick={() => toggleFilter(filter)}
              size="sm"
              className="rounded-full"
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="grid items-start gap-3 lg:grid-cols-4">
          <main className="space-y-6 lg:col-span-3">
            {/* Live Streams Now */}
            {filteredLiveImages.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-bold">Сейчас в эфире</h2>
                <Carousel opts={{ align: 'start' }} className="w-full">
                  <CarouselContent>
                    {filteredLiveImages.map((stream) => (
                      <CarouselItem key={stream.id} className="md:basis-1/2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-full p-1">
                              <LiveStreamCard
                                stream={stream}
                                onPlay={() => handleOpenLivePlayer(stream, true)}
                                isLive={true}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{stream.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {filteredLiveImages.length > 2 && <CarouselPrevious className="hidden sm:flex" />}
                  {filteredLiveImages.length > 2 && <CarouselNext className="hidden sm:flex" />}
                </Carousel>
              </section>
            )}

            {/* Live Podcasts Now */}
            {filteredLivePodcasts.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-bold">Подкасты в прямом эфире</h2>
                <div className="space-y-6">
                  {filteredLivePodcasts.map((podcast) => (
                    <PodcastCard key={podcast.id} podcast={podcast} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Streams */}
            {filteredUpcomingStreams.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-bold">Анонсы трансляций</h2>
                <Carousel opts={{ align: 'start' }} className="w-full">
                  <CarouselContent>
                    {filteredUpcomingStreams.map((stream) => (
                      <CarouselItem key={stream.id} className="md:basis-1/2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="group relative m-1 flex items-center gap-3 rounded-lg border bg-card p-4">
                              <Image
                                src={stream.imageUrl}
                                alt={stream.description}
                                width={100}
                                height={100}
                                className="aspect-square rounded-md object-cover"
                                data-ai-hint={stream.imageHint}
                              />
                              <div className="flex-1">
                                <p className="font-semibold">{stream.description}</p>
                                {stream.date && <StreamDateDisplay date={stream.date} />}
                                <Button variant="secondary" size="sm" className="mt-2">
                                  Напомнить
                                </Button>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{stream.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {filteredUpcomingStreams.length > 2 && (
                    <CarouselPrevious className="hidden sm:flex" />
                  )}
                  {filteredUpcomingStreams.length > 2 && (
                    <CarouselNext className="hidden sm:flex" />
                  )}
                </Carousel>
              </section>
            )}

            {/* Upcoming Podcasts */}
            {filteredUpcomingPodcasts.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-bold">Анонсы подкастов</h2>
                <div className="space-y-6">
                  {filteredUpcomingPodcasts.map((podcast) => (
                    <PodcastCard key={podcast.id} podcast={podcast} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Streams Archive */}
            {currentPastStreams.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-bold">Архив трансляций</h2>

                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {currentPastStreams.map((stream) => (
                      <Tooltip key={stream.id}>
                        <TooltipTrigger asChild>
                          <div>
                            <LiveStreamCard
                              stream={stream}
                              onPlay={() => handleOpenLivePlayer(stream, false)}
                              isLive={false}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{stream.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                  {renderPagination()}
                </>
              </section>
            )}

            {/* Past Podcasts Archive */}
            {filteredPastPodcasts.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-bold">Архив подкастов</h2>
                <div className="space-y-6">
                  {filteredPastPodcasts.map((podcast) => (
                    <PodcastCard key={podcast.id} podcast={podcast} />
                  ))}
                </div>
              </section>
            )}

            {filteredLiveImages.length === 0 &&
              filteredUpcomingStreams.length === 0 &&
              currentPastStreams.length === 0 &&
              filteredLivePodcasts.length === 0 &&
              filteredUpcomingPodcasts.length === 0 &&
              filteredPastPodcasts.length === 0 && (
                <div className="rounded-lg border-2 border-dashed bg-muted/50 py-4 text-center">
                  <h3 className="text-base font-semibold text-muted-foreground">Нет событий</h3>
                  <p className="mt-2 text-muted-foreground">
                    Попробуйте выбрать другую дату или сбросить фильтры.
                  </p>
                </div>
              )}
          </main>

          <aside className="sticky top-24 space-y-6 lg:col-span-1">
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2 pt-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarIcon className="h-4 w-4" /> Календарь
                </CardTitle>
                {date && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDate(undefined)}
                    className="text-xs"
                  >
                    Сбросить
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                  locale={ru}
                  modifiers={{ hasStream: streamDates }}
                  modifiersClassNames={{ hasStream: 'day-with-stream' }}
                  components={{
                    Day: (props) => DayWithStreams(props.date),
                  }}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2 pt-4">
                <CardTitle className="text-base">Фильтр по тегам</CardTitle>
                {selectedHashtags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedHashtags([])}
                    className="text-xs"
                  >
                    Сбросить
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 p-4">
                {allHashtags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedHashtags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleHashtag(tag)}
                    className="rounded-full"
                  >
                    {tag}
                    {selectedHashtags.includes(tag) && <X className="ml-1.5 h-3 w-3" />}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>

        {selectedEvent && (
          <LivePlayer
            event={selectedEvent}
            isOpen={isLivePlayerOpen}
            onOpenChange={setIsLivePlayerOpen}
            isLive={isEventLive}
          />
        )}
      </CabinetPageContent>
    </TooltipProvider>
  );
}
