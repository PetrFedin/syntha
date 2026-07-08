'use client';

import React from 'react';
import Image from 'next/image';
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
  MapPin,
  Check,
  Instagram,
  Send,
  Youtube,
  Eye,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MediaTabProps {
  displayName: string;
  mediaPeriod: string;
  setMediaPeriod: (period: 'week' | 'month' | 'year' | 'all') => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  activeMediaTab: string;
  setActiveMediaTab: (tab: string) => void;
  filteredMediaData: any;
  storyImages: any[];
  handleOpenStory: (story: any, data: any[]) => void;
  setSelectedEvent: (event: any) => void;
  setIsLivePlayerOpen: (open: boolean) => void;
  setIsLiveReminderOpen: (open: boolean) => void;
  handleEventRegistration: (id: number, type: string) => void;
  registeredEvents: number[];
  setSelectedBlog: (blog: any) => void;
  setSelectedSocial: (post: any) => void;
  setSelectedStoryVideo: (vid: any) => void;
  setSelectedMention: (mention: any) => void;
  setSelectedPress: (press: any) => void;
  setIsPressKitOpen: (open: boolean) => void;
  toast: any;
  setB2bPartnerStatus: (status: 'none' | 'pending' | 'friend' | 'active' | 'spot') => void;
}

export function MediaTab({
  displayName,
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
  setIsLiveReminderOpen,
  handleEventRegistration,
  registeredEvents,
  setSelectedBlog,
  setSelectedSocial,
  setSelectedStoryVideo,
  setSelectedMention,
  setSelectedPress,
  setIsPressKitOpen,
  toast,
  setB2bPartnerStatus,
}: MediaTabProps) {
  const handleB2bRegistration = () => {
    setB2bPartnerStatus('pending');
    toast({
      title: 'Заявка отправлена',
      description: `Бренд ${displayName} рассмотрит ваш запрос в течение 48 часов.`,
    });
  };

  const handlePressKitDownload = () => {
    toast({
      title: 'Скачивание Press Kit',
      description: `Архив с материалами бренда ${displayName} подготовлен.`,
    });
  };

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
              onClick={handlePressKitDownload}
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
                onClick={() => setMediaPeriod(p.value as any)}
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

      {/* Media Content Grid */}
      <div className="space-y-4">
        {[
          {
            title: 'Live & Предстоящее',
            id: 'live',
            data: filteredMediaData?.live || [],
            type: 'live',
          },
          { title: 'Сториз', id: 'stories', data: storyImages || [], type: 'stories' },
          {
            title: 'Отметки покупателей',
            id: 'mentions',
            data: filteredMediaData?.customerMentions || [],
            type: 'mentions',
          },
          { title: 'Соцсети', id: 'social', data: filteredMediaData?.social || [], type: 'social' },
          {
            title: 'Блог и Новости',
            id: 'blog',
            data: filteredMediaData?.blog || [],
            type: 'blog',
          },
          {
            title: 'События и Показы',
            id: 'events',
            data: filteredMediaData?.events || [],
            type: 'events',
          },
          {
            title: 'За кулисами (BTS)',
            id: 'bts',
            data: filteredMediaData?.bts || [],
            type: 'blog',
          },
          {
            title: 'Подкасты бренда',
            id: 'podcasts',
            data: filteredMediaData?.podcasts || [],
            type: 'blog',
          },
          { title: 'Видео', id: 'video', data: filteredMediaData?.video || [], type: 'video' },
          {
            title: 'Пресса о нас',
            id: 'press',
            data: filteredMediaData?.press || [],
            type: 'press',
          },
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
                    {section.data?.length || 0}{' '}
                    {(section.data?.length || 0) === 1 ? 'публикация' : 'публикаций'}
                  </p>
                </div>
                {(section.data?.length || 0) > 3 && (
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
                  (section.data as any[]).map((item, i) => (
                    <div key={item.id || `live-${i}`} className="w-[340px] shrink-0 snap-start">
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
                              <div className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE NOW
                            </Badge>
                          ) : (
                            <Badge className="flex items-center gap-1.5 border-none bg-accent px-3 py-1.5 text-[8px] text-white">
                              <Calendar className="h-3 w-3" /> PLANNED
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-8 left-8 right-8">
                          <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            {item.date}
                          </span>
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
                            className={cn(
                              'mt-4 h-10 w-full rounded-xl text-[10px] font-black uppercase tracking-widest',
                              item.status === 'live'
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-white text-black hover:bg-white/90'
                            )}
                          >
                            {item.status === 'live' ? 'Смотреть' : 'Напомнить'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {section.type === 'events' &&
                  (section.data as any[]).map((item, i) => (
                    <div key={item.id || `event-${i}`} className="w-[340px] shrink-0 snap-start">
                      <div className="group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl shadow-lg">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute left-6 top-4">
                          <Badge className="border-none bg-white/20 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="absolute bottom-8 left-8 right-8">
                          <div className="mb-2 flex items-center gap-3 text-white/70">
                            <Calendar className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                              {item.date}
                            </span>
                          </div>
                          <h4 className="mb-1 line-clamp-1 text-base font-black uppercase leading-tight tracking-tight text-white">
                            {item.title}
                          </h4>
                          <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-white/60">
                            <MapPin className="h-2.5 w-2.5" /> {item.location}
                          </p>
                          <Button
                            onClick={() => handleEventRegistration(item.id, item.type)}
                            className={cn(
                              'mt-4 h-10 w-full rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg',
                              registeredEvents.includes(item.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-black'
                            )}
                          >
                            {registeredEvents.includes(item.id) ? (
                              <span className="flex items-center gap-2">
                                <Check className="h-3.5 w-3.5" />{' '}
                                {item.type === 'Мероприятие' ? 'Вы записаны' : 'Запрос отправлен'}
                              </span>
                            ) : item.type === 'Мероприятие' ? (
                              'Записаться'
                            ) : item.type === 'Fashion Show' ? (
                              'Получить приглашение'
                            ) : (
                              'Хочу посетить'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                {section.type === 'live_archive' &&
                  (section.data as any[]).map((item, i) => (
                    <div key={item.id || `archive-${i}`} className="w-[300px] shrink-0 snap-start">
                      <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-muted/20 shadow-md">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md group-hover:scale-110">
                            <PlayCircle className="h-6 w-6 fill-current" />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-4 right-4">
                          <p className="text-xs font-black uppercase leading-tight tracking-tight text-white">
                            {item.title}
                          </p>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">
                              {item.date}
                            </p>
                            <Badge className="border-none bg-accent/80 text-[8px] font-black text-white">
                              {item.items} товаров
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {section.type === 'blog' &&
                  (section.data as any[]).map((item, i) => (
                    <div key={item.id || `blog-${i}`} className="w-[340px] shrink-0 snap-start">
                      <Card
                        className="group h-full cursor-pointer overflow-hidden rounded-xl border-none shadow-md hover:shadow-xl active:scale-[0.98]"
                        onClick={() => setSelectedBlog(item)}
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110"
                          />
                          <Badge className="absolute left-4 top-4 rounded-full border-none bg-accent px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-white">
                            {item.type}
                          </Badge>
                        </div>
                        <CardContent className="bg-white p-4">
                          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            {item.date}
                          </p>
                          <h3 className="line-clamp-2 text-sm font-black uppercase leading-tight transition-colors group-hover:text-accent">
                            {item.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                {section.type === 'stories' &&
                  (section.data as any[]).map((story, i) => (
                    <div key={i} className="w-[240px] shrink-0 snap-start">
                      <div
                        className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-xl shadow-lg"
                        onClick={() => handleOpenStory(story, section.data as any[])}
                      >
                        <Image
                          src={story.imageUrl}
                          alt="Story"
                          fill
                          className="object-cover group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md group-hover:scale-110">
                          <PlayCircle className="h-5 w-5" />
                        </div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <Badge className="mb-2 border-none bg-red-500 px-1.5 py-0.5 text-[7px] text-white">
                            STORIES
                          </Badge>
                          <p className="line-clamp-2 text-base font-black uppercase leading-tight text-white">
                            {story.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                {section.type === 'social' &&
                  (section.data as any[]).map((post, i) => (
                    <div key={post.id || `post-${i}`} className="w-[280px] shrink-0 snap-start">
                      <Card
                        className="group h-full cursor-pointer overflow-hidden rounded-xl border-none bg-muted/5 shadow-md active:scale-[0.98]"
                        onClick={() => setSelectedSocial(post)}
                      >
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={post.imageUrl}
                            alt="Social"
                            fill
                            className="object-cover group-hover:scale-105"
                          />
                          <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md">
                            {post.platform === 'instagram' && (
                              <Instagram className="text-accent-primary h-3.5 w-3.5" />
                            )}
                            {post.platform === 'telegram' && (
                              <Send className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            {post.platform === 'youtube' && (
                              <Youtube className="h-3.5 w-3.5 text-red-600" />
                            )}
                          </div>
                        </div>
                        <CardContent className="p-3">
                          {post.text && (
                            <p className="mb-3 line-clamp-2 text-xs font-medium text-foreground/80">
                              {post.text}
                            </p>
                          )}
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-3 text-muted-foreground">
                              {post.likes && (
                                <div className="flex items-center gap-1.5 text-[10px] font-black">
                                  <Heart className="h-3 w-3" /> {post.likes}
                                </div>
                              )}
                              {post.views && (
                                <div className="flex items-center gap-1.5 text-[10px] font-black">
                                  <Eye className="h-3 w-3" /> {post.views}
                                </div>
                              )}
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                              {post.date}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                {section.type === 'video' &&
                  (section.data as any[]).map((vid, i) => (
                    <div key={vid.id || `vid-${i}`} className="w-[340px] shrink-0 snap-start">
                      <div
                        className="group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl shadow-lg active:scale-[0.98]"
                        onClick={() => setSelectedStoryVideo(vid)}
                      >
                        <Image
                          src={vid.imageUrl}
                          alt={vid.title}
                          fill
                          className="object-cover group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-90 items-center justify-center rounded-full bg-accent text-white shadow-xl group-hover:scale-100">
                          <PlayCircle className="h-8 w-8 fill-current" />
                        </div>
                        <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                          <div>
                            <div className="mb-1.5 flex items-center gap-2">
                              <Badge className="border-none bg-blue-500 px-1.5 py-0.5 text-[7px]">
                                {vid.type}
                              </Badge>
                              <span className="text-[9px] font-black uppercase tracking-widest text-white">
                                {vid.duration}
                              </span>
                            </div>
                            <h4 className="line-clamp-1 text-sm font-black uppercase leading-tight text-white">
                              {vid.title}
                            </h4>
                          </div>
                          <span className="mb-1 text-[8px] font-bold uppercase tracking-widest text-white/60">
                            {vid.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                {section.type === 'mentions' &&
                  (section.data as any[]).map((mention, i) => (
                    <div
                      key={mention.id || `mention-${i}`}
                      className="w-[280px] shrink-0 snap-start"
                    >
                      <Card
                        className="group h-full cursor-pointer overflow-hidden rounded-xl border-none bg-white p-1.5 shadow-md hover:shadow-xl active:scale-[0.98]"
                        onClick={() => setSelectedMention(mention)}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-[1.75rem]">
                          <Image
                            src={mention.imageUrl}
                            alt="Mention"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 p-1 pr-3 shadow-md backdrop-blur-md">
                            <div className="h-6 w-6 overflow-hidden rounded-full border-2 border-accent">
                              <Image src={mention.avatar} alt="user" width={24} height={24} />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-tight">
                              @{mention.user}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3">
                          <p className="line-clamp-1 flex-1 px-1 text-[10px] font-bold italic leading-relaxed text-muted-foreground">
                            "{mention.text}"
                          </p>
                          <span className="ml-2 shrink-0 text-[7px] font-bold uppercase tracking-tighter text-muted-foreground/60">
                            {mention.date}
                          </span>
                        </div>
                      </Card>
                    </div>
                  ))}

                {section.type === 'press' &&
                  (section.data as any[]).map((article, i) => (
                    <div key={article.id || `press-${i}`} className="w-[320px] shrink-0 snap-start">
                      <Card
                        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-muted/20 bg-white shadow-sm hover:border-accent/20 hover:shadow-lg active:scale-[0.98]"
                        onClick={() => setSelectedPress(article)}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-muted/10">
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover opacity-80 group-hover:opacity-100"
                          />
                          {article.logoUrl && (
                            <div className="absolute bottom-3 left-4 flex h-5 w-20 items-center justify-center rounded-md bg-white/90 px-2 backdrop-blur-md">
                              <img
                                src={article.logoUrl}
                                alt={article.name}
                                className="max-h-3 object-contain grayscale"
                              />
                            </div>
                          )}
                        </div>
                        <CardContent className="flex flex-1 flex-col justify-between p-3">
                          <div>
                            <p className="mb-1.5 text-[8px] font-bold uppercase tracking-widest text-accent">
                              {article.name} • {article.date}
                            </p>
                            <h4 className="line-clamp-2 text-base font-black uppercase leading-snug transition-colors group-hover:text-accent">
                              {article.title}
                            </h4>
                          </div>
                          <Button
                            variant="link"
                            className="mt-4 h-auto self-start p-0 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-accent"
                          >
                            Открыть <ArrowRight className="ml-1 h-2.5 w-2.5" />
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
              </div>
            </section>
          ))}
      </div>
    </TabsContent>
  );
}
