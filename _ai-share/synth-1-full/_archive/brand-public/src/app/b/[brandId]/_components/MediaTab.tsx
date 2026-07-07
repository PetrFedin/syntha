import React from 'react';
import {
  BookText,
  Calendar,
  Radio,
  PlayCircle,
  Users,
  Rss,
  Newspaper,
  Video,
  Globe,
  ArrowRight,
  Send,
  Instagram,
  Youtube,
  Quote,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Clock,
  Heart,
  Plus,
  MapPin,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MediaTabProps {
  mediaPeriod: string;
  setMediaPeriod: (period: any) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  activeMediaTab: string;
  setActiveMediaTab: (tab: string) => void;
  filteredMediaData: any;
  storyImages: any[];
  handleOpenStory: (image: any, list: any[]) => void;
  setSelectedEvent: (event: any) => void;
  setIsLivePlayerOpen: (open: boolean) => void;
  setIsPressKitOpen: (open: boolean) => void;
  setIsLiveReminderOpen: (open: boolean) => void;
  setSelectedStoryVideo: (video: any) => void;
  setSelectedMention: (mention: any) => void;
  setSelectedSocial: (social: any) => void;
  setSelectedBlog: (blog: any) => void;
  setSelectedPress: (press: any) => void;
}

export function MediaTab({
  mediaPeriod,
  setMediaPeriod,
  selectedDate,
  setSelectedDate,
  activeMediaTab,
  setActiveMediaTab,
  filteredMediaData,
  storyImages,
  handleOpenStory,
  setSelectedEvent,
  setIsLivePlayerOpen,
  setIsPressKitOpen,
  setIsLiveReminderOpen,
  setSelectedStoryVideo,
  setSelectedMention,
  setSelectedSocial,
  setSelectedBlog,
  setSelectedPress,
}: MediaTabProps) {
  return (
    <TabsContent
      value="media"
      className="space-y-6 pt-4 duration-700 animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Media Header & Filters */}
      <div className="flex flex-col items-start justify-between gap-3 border-b pb-8 md:flex-row md:items-center">
        <div className="space-y-1">
          <h2 className="text-sm font-black uppercase tracking-tighter">Медиа-центр</h2>
          <p className="font-medium text-muted-foreground">
            Все события, новости и публикации в одном месте
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-auto">
          <div className="flex w-full rounded-xl border bg-muted/50 p-1 shadow-sm sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest text-accent transition-all hover:bg-accent hover:text-white"
              onClick={() => setIsPressKitOpen(true)}
            >
              <BookText className="mr-2 h-3.5 w-3.5" /> Press Kit
            </Button>
            <div className="mx-1 h-4 w-px self-center bg-muted-foreground/20" />
            {[
              { label: 'Неделя', value: 'week' },
              { label: 'Месяц', value: 'month' },
              { label: 'Год', value: 'year' },
              { label: 'Все', value: 'all' },
            ].map((p) => (
              <Button
                key={p.value}
                variant={mediaPeriod === p.value ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'h-8 flex-1 rounded-lg px-4 text-[10px] font-black uppercase transition-all sm:flex-none',
                  mediaPeriod === p.value
                    ? 'bg-black text-white shadow-md'
                    : 'text-muted-foreground'
                )}
                onClick={() => setMediaPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 rounded-lg px-3 transition-all',
                    selectedDate ? 'text-accent' : 'text-muted-foreground'
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden rounded-3xl border-none p-0 shadow-2xl"
                align="end"
              >
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={ru}
                  className="p-3"
                />
                {selectedDate && (
                  <div className="border-t border-muted/10 bg-muted/20 p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Выбрано: {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-[8px] font-black uppercase tracking-widest hover:text-red-500"
                      onClick={() => setSelectedDate(undefined)}
                    >
                      Сбросить дату
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Media Sub-navigation */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {[
          { label: 'Все', value: 'all' },
          {
            label: 'Live',
            value: 'live',
            icon: <Radio className="mr-2 h-3.5 w-3.5 animate-pulse text-red-500" />,
          },
          { label: 'Сториз', value: 'stories', icon: <PlayCircle className="mr-2 h-3.5 w-3.5" /> },
          { label: 'Отметки', value: 'mentions', icon: <Users className="mr-2 h-3.5 w-3.5" /> },
          { label: 'Соцсети', value: 'social', icon: <Rss className="mr-2 h-3.5 w-3.5" /> },
          {
            label: 'Блог и Новости',
            value: 'blog',
            icon: <Newspaper className="mr-2 h-3.5 w-3.5" />,
          },
          { label: 'События', value: 'events', icon: <Calendar className="mr-2 h-3.5 w-3.5" /> },
          { label: 'Видео', value: 'video', icon: <Video className="mr-2 h-3.5 w-3.5" /> },
          { label: 'Пресса', value: 'press', icon: <Globe className="mr-2 h-3.5 w-3.5" /> },
          { label: 'BTS', value: 'bts', icon: <Video className="mr-2 h-3.5 w-3.5" /> },
          { label: 'Подкасты', value: 'podcasts', icon: <Radio className="mr-2 h-3.5 w-3.5" /> },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={activeMediaTab === tab.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-9 shrink-0 rounded-full px-6 text-[11px] font-black uppercase tracking-wider transition-all',
              activeMediaTab === tab.value
                ? 'border-black bg-black text-white shadow-lg shadow-black/20'
                : 'hover:bg-muted'
            )}
            onClick={() => setActiveMediaTab(tab.value)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Media Content Grid - Horizontal Sections */}
      <div className="space-y-4">
        {[
          { title: 'Live & Предстоящее', id: 'live', data: filteredMediaData.live, type: 'live' },
          { title: 'Сториз', id: 'stories', data: storyImages, type: 'stories' },
          {
            title: 'Отметки покупателей',
            id: 'mentions',
            data: filteredMediaData.customerMentions,
            type: 'mentions',
          },
          { title: 'Соцсети', id: 'social', data: filteredMediaData.social, type: 'social' },
          { title: 'Блог и Новости', id: 'blog', data: filteredMediaData.blog, type: 'blog' },
          {
            title: 'События и Показы',
            id: 'events',
            data: filteredMediaData.events,
            type: 'events',
          },
          {
            title: 'За кулисами (BTS)',
            id: 'bts',
            data: [
              {
                id: 1,
                title: 'Создание коллекции SS24',
                type: 'Видео',
                imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
              },
              {
                id: 2,
                title: 'Бэкстейдж со съемок в Арктике',
                type: 'Фото',
                imageUrl: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&q=80',
              },
            ],
            type: 'blog',
          },
          {
            title: 'Подкасты бренда',
            id: 'podcasts',
            data: [
              {
                id: 1,
                title: 'Эпизод 1: Устойчивая мода сегодня',
                type: 'Аудио',
                imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80',
              },
              {
                id: 2,
                title: 'Эпизод 2: Технологии в дизайне',
                type: 'Аудио',
                imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
              },
            ],
            type: 'blog',
          },
          { title: 'Видео', id: 'video', data: filteredMediaData.video, type: 'video' },
          { title: 'Пресса о нас', id: 'press', data: filteredMediaData.press, type: 'press' },
          {
            title: 'Архив Live-эфиров',
            id: 'live_archive',
            data: [
              {
                id: 1,
                title: 'Презентация Arctic Minimal',
                date: '12 Дек 2023',
                items: 5,
                imageUrl: 'https://images.unsplash.com/photo-1441998852351-768a7f108b4e?w=800&q=80',
              },
              {
                id: 2,
                title: 'Как носить меринос: Гид',
                date: '05 Дек 2023',
                items: 3,
                imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
              },
            ],
            type: 'live_archive',
          },
        ]
          .filter((section) => activeMediaTab === 'all' || activeMediaTab === section.id)
          .map((section) => (
            <section
              key={section.id}
              className="duration-500 animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="mb-8 flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-tight">
                    {section.id === 'live' && (
                      <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    )}
                    {section.title}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {section.data.length} {section.data.length === 1 ? 'публикация' : 'публикаций'}
                  </p>
                </div>
                {section.data.length > 3 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-2"
                      onClick={() => {
                        const el = document.getElementById(`scroll-${section.id}`);
                        if (el) el.scrollBy({ left: -400, behavior: 'smooth' });
                      }}
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-2"
                      onClick={() => {
                        const el = document.getElementById(`scroll-${section.id}`);
                        if (el) el.scrollBy({ left: 400, behavior: 'smooth' });
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div
                id={`scroll-${section.id}`}
                className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-8"
              >
                {section.type === 'live' &&
                  (section.data as any[]).map((item) => (
                    <div key={item.id} className="w-[340px] shrink-0 snap-start">
                      <div className="group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl shadow-lg">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        <div className="absolute left-6 top-4 flex items-center gap-2">
                          {item.status === 'live' ? (
                            <Badge className="flex animate-pulse items-center gap-1.5 border-none bg-red-500 px-3 py-1.5 text-white">
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              LIVE NOW
                            </Badge>
                          ) : (
                            <Badge className="flex items-center gap-1.5 border-none bg-accent px-3 py-1.5 text-[8px] text-white">
                              <Calendar className="h-3 w-3" />
                              PLANNED
                            </Badge>
                          )}
                        </div>

                        <div className="absolute bottom-8 left-8 right-8">
                          <div className="mb-2 flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                              {item.date}
                            </span>
                          </div>
                          <h4 className="line-clamp-1 text-base font-black uppercase leading-tight tracking-tight text-white">
                            {item.title}
                          </h4>
                          <Button
                            onClick={() => {
                              if (item.status === 'live') {
                                setSelectedEvent(item);
                                setIsLivePlayerOpen(true);
                              } else {
                                setIsLiveReminderOpen(true);
                              }
                            }}
                            variant="secondary"
                            className="mt-4 h-10 w-full rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-accent hover:text-white"
                          >
                            {item.status === 'live' ? 'Смотреть эфир' : 'Напомнить об эфире'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {section.type === 'stories' &&
                  (section.data as any[]).map((item) => (
                    <div key={item.id} className="w-[200px] shrink-0 snap-start">
                      <div
                        onClick={() => handleOpenStory(item, section.data)}
                        className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-xl border-2 border-transparent shadow-lg transition-all hover:border-accent"
                      >
                        <Image
                          src={item.url}
                          alt="Story"
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-[8px] font-black uppercase tracking-widest text-white opacity-60">
                            Story
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                {section.type === 'mentions' &&
                  (section.data as any[]).map((item) => (
                    <div key={item.id} className="w-[300px] shrink-0 snap-start">
                      <Card className="group overflow-hidden rounded-xl border-muted/20 shadow-sm transition-all duration-500 hover:shadow-xl">
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt="Mention"
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-6 left-6 right-6 h-9 translate-y-4 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                            onClick={() => setSelectedMention(item)}
                          >
                            Смотреть пост
                          </Button>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 overflow-hidden rounded-full border border-muted/20">
                              <Image src={item.avatar} alt={item.user} width={32} height={32} />
                            </div>
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-tight">
                                @{item.user}
                              </p>
                              <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                                {item.date}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                {section.type === 'social' &&
                  (section.data as any[]).map((item) => (
                    <div key={item.id} className="w-[320px] shrink-0 snap-start">
                      <Card className="group flex h-full flex-col overflow-hidden rounded-xl border-muted/20 shadow-sm transition-all duration-500 hover:shadow-xl">
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt="Social"
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/20 text-white backdrop-blur-md">
                            {item.platform === 'instagram' && <Instagram className="h-4 w-4" />}
                            {item.platform === 'telegram' && <Send className="h-4 w-4" />}
                            {item.platform === 'youtube' && <Youtube className="h-4 w-4" />}
                          </div>
                        </div>
                        <CardContent className="flex flex-1 flex-col justify-between p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase tracking-widest text-accent">
                                {item.platform}
                              </span>
                              <span className="text-[9px] font-bold uppercase text-muted-foreground">
                                {item.date}
                              </span>
                            </div>
                            <p className="line-clamp-3 text-xs font-medium leading-relaxed">
                              {item.text || item.title}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-muted/10 pt-4">
                            <div className="flex items-center gap-3">
                              {item.likes && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <ThumbsUp className="h-3 w-3" />
                                  <span className="text-[10px] font-black">{item.likes}</span>
                                </div>
                              )}
                              {item.views && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Radio className="h-3 w-3" />
                                  <span className="text-[10px] font-black">{item.views}</span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 rounded-lg px-3 text-[9px] font-black uppercase tracking-widest hover:text-accent"
                              onClick={() => setSelectedSocial(item)}
                            >
                              Открыть
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                {section.type === 'blog' &&
                  (section.data as any[]).map((item) => (
                    <div key={item.id} className="w-[380px] shrink-0 snap-start">
                      <Card className="group flex h-full flex-col overflow-hidden rounded-xl border-muted/20 shadow-sm transition-all duration-500 hover:shadow-xl">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute left-6 top-4">
                            <Badge className="border-none bg-white/90 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-black backdrop-blur-md">
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="flex flex-1 flex-col justify-between p-4">
                          <div className="space-y-4">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                              {item.date}
                            </span>
                            <h4 className="text-base font-black uppercase leading-tight tracking-tighter transition-colors group-hover:text-accent">
                              {item.title}
                            </h4>
                          </div>
                          <Button
                            variant="outline"
                            className="group/btn mt-6 h-10 w-full rounded-xl border-muted-foreground/10 text-[10px] font-black uppercase tracking-widest transition-all hover:border-accent hover:bg-accent hover:text-white"
                            onClick={() => setSelectedBlog(item)}
                          >
                            Читать полностью{' '}
                            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                {section.type === 'events' &&
                  (section.data as any[]).map((item) => (
                    <div key={item.id} className="w-[400px] shrink-0 snap-start">
                      <Card className="group overflow-hidden rounded-xl border-muted/20 shadow-sm transition-all duration-500 hover:shadow-xl">
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          <div className="absolute left-6 top-4">
                            <Badge className="border-none bg-accent px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-white">
                              {item.type}
                            </Badge>
                          </div>
                          <div className="absolute bottom-8 left-8 right-8 text-white">
                            <div className="mb-2 flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-accent" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {item.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-accent" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {item.location}
                                </span>
                              </div>
                            </div>
                            <h4 className="text-sm font-black uppercase leading-tight tracking-tighter">
                              {item.title}
                            </h4>
                          </div>
                        </div>
                        <CardContent className="bg-white p-4">
                          <div className="flex gap-3">
                            <Button
                              className="h-11 flex-1 rounded-xl bg-black text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-accent"
                              onClick={() => {
                                // handleEventRegistration(item.id, item.type)
                              }}
                            >
                              Записаться
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-11 w-11 rounded-xl border-muted-foreground/10 transition-all hover:bg-muted"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                {section.type === 'video' &&
                  (section.data as any[]).map((item) => (
                    <div key={item.id} className="w-[420px] shrink-0 snap-start">
                      <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl shadow-lg">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:bg-accent">
                            <PlayCircle className="h-8 w-8 fill-current" />
                          </div>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="mb-2 flex items-center justify-between">
                            <Badge className="border-none bg-white/90 px-2 py-1 text-[8px] font-black uppercase text-black">
                              {item.type}
                            </Badge>
                            <span className="rounded-lg bg-black/40 px-2 py-1 text-[10px] font-black text-white backdrop-blur-md">
                              {item.duration}
                            </span>
                          </div>
                          <h4 className="line-clamp-1 text-sm font-black uppercase tracking-tight text-white">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}

                {section.type === 'press' &&
                  (section.data as any[]).map((item) => (
                    <div key={item.id} className="w-[320px] shrink-0 snap-start">
                      <Card className="group flex h-full flex-col overflow-hidden rounded-xl border-muted/20 shadow-sm transition-all duration-500 hover:shadow-xl">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          {item.logoUrl && (
                            <div className="absolute left-6 top-4 flex h-8 w-24 items-center justify-center rounded-lg bg-white/90 p-2 backdrop-blur-md">
                              <img
                                src={item.logoUrl}
                                alt={item.name}
                                className="h-full object-contain"
                              />
                            </div>
                          )}
                        </div>
                        <CardContent className="flex flex-1 flex-col justify-between p-4">
                          <div className="space-y-3">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                              {item.date}
                            </span>
                            <h4 className="line-clamp-2 text-base font-black uppercase leading-tight tracking-tight">
                              {item.title}
                            </h4>
                          </div>
                          <Button
                            variant="ghost"
                            className="group/btn mt-4 h-9 w-full rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-accent/5 hover:text-accent"
                            onClick={() => setSelectedPress(item)}
                          >
                            Читать статью <ExternalLink className="ml-2 h-3 w-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                {section.type === 'live_archive' &&
                  (section.data as any[]).map((item) => (
                    <div key={item.id} className="w-[340px] shrink-0 snap-start">
                      <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl shadow-lg">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md">
                            <PlayCircle className="h-6 w-6 fill-current" />
                          </div>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white opacity-60">
                              {item.date}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white">
                              {item.items} товаров
                            </span>
                          </div>
                          <h4 className="line-clamp-1 text-base font-black uppercase tracking-tight text-white">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}
      </div>
    </TabsContent>
  );
}
