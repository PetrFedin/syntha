'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Edit,
  Crown as CrownIcon,
  Copy,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Plus,
  Palette,
  Instagram,
  Trophy,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function ProfileHeader({ user }: { user: any }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(user.photoURL || null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [prefs, setPrefs] = useState({
    avatarBorder: true,
    avatarShape: 'rounded',
    headerTheme: 'photo',
  });
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const planCloseTimer = useRef<number | null>(null);

  // Instagram sync UI is available by default in MVP
  const hasVerifiedInstagram = !!user?.instagramVerified;
  const [instagramEnabled, setInstagramEnabled] = useState(hasVerifiedInstagram);

  const openPlan = () => {
    if (planCloseTimer.current) window.clearTimeout(planCloseTimer.current);
    setIsPlanOpen(true);
  };
  const scheduleClosePlan = () => {
    if (planCloseTimer.current) window.clearTimeout(planCloseTimer.current);
    // Give time to move cursor between trigger and popover (prevents flicker)
    planCloseTimer.current = window.setTimeout(() => setIsPlanOpen(false), 300);
  };

  const planLabel =
    user?.loyaltyPlan === 'premium'
      ? 'Premium'
      : user?.loyaltyPlan === 'comfort'
        ? 'Comfort'
        : user?.loyaltyPlan === 'start'
          ? 'Start'
          : 'Base';
  const endDateRaw: string | undefined = user?.subscription?.endDate;
  const endDateFormatted = endDateRaw
    ? format(new Date(endDateRaw), 'd MMMM yyyy', { locale: ru })
    : '—';
  const offer = user?.subscription?.renewalOffer;

  const copyPromo = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: 'Скопировано', description: 'Промокод скопирован в буфер обмена.' });
    } catch {
      toast({ title: 'Не удалось скопировать', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setInstagramEnabled(hasVerifiedInstagram);
  }, [hasVerifiedInstagram]);

  const DEFAULT_PROFILE_PHOTO =
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1200&auto=format&fit=crop';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedAvatar = localStorage.getItem('syntha_profile_avatar');
    const storedHeader = localStorage.getItem('syntha_profile_header');
    const storedPrefs = localStorage.getItem('syntha_profile_prefs');
    const storedPhotos = localStorage.getItem('syntha_profile_photos');
    const storedMain = localStorage.getItem('syntha_profile_main');

    if (storedAvatar) {
      setAvatarImage(storedAvatar);
    } else {
      setAvatarImage(DEFAULT_PROFILE_PHOTO);
    }

    if (storedHeader) setHeaderImage(storedHeader);
    if (storedPrefs) {
      try {
        const parsed = JSON.parse(storedPrefs) as Partial<{
          avatarBorder: boolean;
          avatarShape: string;
          headerTheme: string;
        }>;
        setPrefs((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
    if (storedPhotos) {
      try {
        const parsed = JSON.parse(storedPhotos) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPhotos(parsed.filter((x): x is string => typeof x === 'string'));
        }
      } catch {}
    }
    if (storedMain) setMainPhotoIndex(parseInt(storedMain, 10) || 0);
  }, []);

  // If auth user.photoURL arrives after first render, use it as default avatar
  // (only when user hasn't customized avatar via localStorage/photos yet).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedAvatar = localStorage.getItem('syntha_profile_avatar');
    if (!storedAvatar && photos.length === 0 && !avatarImage && user?.photoURL) {
      setAvatarImage(user.photoURL);
    }
  }, [user?.photoURL, avatarImage, photos.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (avatarImage) localStorage.setItem('syntha_profile_avatar', avatarImage);
    if (headerImage) localStorage.setItem('syntha_profile_header', headerImage);
    localStorage.setItem('syntha_profile_prefs', JSON.stringify(prefs));
    if (photos.length > 0) {
      localStorage.setItem('syntha_profile_photos', JSON.stringify(photos));
      localStorage.setItem('syntha_profile_main', mainPhotoIndex.toString());
    }
    // Notify other UI parts (e.g. top-right avatar) to refresh immediately.
    window.dispatchEvent(new Event('syntha_profile_avatar_updated'));
  }, [avatarImage, headerImage, prefs, photos, mainPhotoIndex]);

  const readAsDataUrl = (file: File, setter: (val: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
        if (setter === setAvatarImage) {
          setPhotos((prev) => [...prev, reader.result as string]);
          setMainPhotoIndex(photos.length);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const headerThemeClasses =
    headerImage || prefs.headerTheme === 'photo'
      ? 'bg-text-primary'
      : prefs.headerTheme === 'dark'
        ? 'bg-text-primary'
        : prefs.headerTheme === 'light'
          ? 'bg-bg-surface'
          : prefs.headerTheme === 'blue'
            ? 'bg-accent-primary'
            : 'bg-gradient-to-br from-text-primary via-text-primary/90 to-text-primary';

  const currentAvatar =
    photos.length > 0 ? photos[mainPhotoIndex] : avatarImage || DEFAULT_PROFILE_PHOTO;

  return (
    <div
      className={cn('relative h-32 w-full shrink-0 overflow-hidden md:h-40', headerThemeClasses)}
    >
      {headerImage ? (
        <Image
          src={headerImage}
          alt="Profile Background"
          fill
          className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <Image
          src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=3540&auto=format&fit=crop"
          alt=""
          fill
          className="object-cover opacity-40 grayscale transition-all duration-1000 group-hover:grayscale-0"
          unoptimized
        />
      )}
      <div className="from-text-primary via-text-primary/40 absolute inset-0 bg-gradient-to-t to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-4">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-end">
          <div
            className="group/avatar relative cursor-pointer"
            onClick={() => {
              if (photos.length > 0) {
                setViewerIndex(mainPhotoIndex);
                setIsViewerOpen(true);
              }
            }}
          >
            <Avatar
              className={cn(
                'h-20 w-24 shadow-2xl transition-all duration-500 group-hover/avatar:scale-105 md:h-28 md:w-28',
                prefs.avatarBorder ? 'shadow-xl ring-4 ring-white' : 'ring-0',
                prefs.avatarShape === 'circle'
                  ? 'rounded-full'
                  : prefs.avatarShape === 'square'
                    ? 'rounded-none'
                    : 'rounded-xl'
              )}
              data-ai-hint="person face"
            >
              <AvatarImage
                src={currentAvatar || user.photoURL || DEFAULT_PROFILE_PHOTO}
                className="object-cover"
              />
              <AvatarFallback className="bg-bg-surface2 text-text-muted text-base font-black md:text-sm">
                {user.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {photos.length > 1 && (
              <div className="bg-accent-primary text-text-inverse absolute -bottom-1 -right-1 flex h-4 items-center justify-center rounded-full border-2 border-white px-1.5 text-[8px] font-bold shadow-lg">
                {photos.length}
              </div>
            )}
          </div>

          <div className="mb-1 min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <h1 className="truncate font-headline text-xl font-bold uppercase tracking-tight text-white drop-shadow-md md:text-3xl">
                {user.displayName || 'Пользователь'}
              </h1>
              {user.loyaltyPlan && (
                <Popover open={isPlanOpen} onOpenChange={setIsPlanOpen}>
                  <PopoverTrigger asChild>
                    <Link
                      href="/loyalty"
                      className="inline-flex"
                      onPointerEnter={openPlan}
                      onPointerLeave={scheduleClosePlan}
                    >
                      <Badge
                        variant="outline"
                        className="h-4 cursor-pointer gap-1 border-white/20 bg-white/10 px-1.5 text-[8px] font-bold uppercase tracking-widest text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20"
                      >
                        <CrownIcon className="h-2.5 w-2.5 text-amber-400" />
                        {planLabel}
                      </Badge>
                    </Link>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={6}
                    className="border-border-subtle bg-bg-surface w-72 overflow-hidden rounded-xl p-0 shadow-2xl"
                    onPointerEnter={openPlan}
                    onPointerLeave={scheduleClosePlan}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="bg-text-primary text-text-inverse p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-accent-primary text-[10px] font-bold uppercase leading-none tracking-widest">
                            Профиль подписки
                          </div>
                          <div className="text-base font-bold uppercase tracking-tight">
                            {planLabel} активен
                          </div>
                          <div className="text-text-inverse/50 text-[9px] font-bold uppercase tracking-widest">
                            Действует до: {endDateFormatted}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          asChild
                          className="bg-bg-surface text-text-primary hover:bg-bg-surface2 h-7 rounded-lg border-none px-3 text-[9px] font-bold uppercase shadow-lg transition-all"
                        >
                          <Link href="/loyalty?renew=1">Продлить</Link>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      {offer && (
                        <div className="border-border-subtle bg-accent-primary/10 space-y-2.5 rounded-xl border p-3">
                          {offer.type === 'promo' && (
                            <>
                              <div className="text-text-secondary text-[9px] font-bold uppercase leading-none tracking-widest">
                                Бонус продления:{' '}
                                <span className="text-accent-primary">
                                  -{offer.discountPercent}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="border-border-subtle bg-bg-surface text-text-primary flex-1 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm">
                                  {offer.code}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-accent-primary hover:bg-bg-surface2 border-border-subtle h-8 w-8 rounded-lg border"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    copyPromo(offer.code);
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              {offer.expiresAt && (
                                <div className="text-text-muted text-[8px] font-bold uppercase tracking-[0.15em] opacity-60">
                                  Validity:{' '}
                                  {format(new Date(offer.expiresAt), 'dd MMM yyyy', { locale: ru })}
                                </div>
                              )}
                            </>
                          )}

                          {offer.type === 'email' && (
                            <>
                              <div className="text-text-secondary text-[9px] font-bold uppercase tracking-widest">
                                Unique strategic offer available
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-border-subtle text-accent-primary hover:bg-bg-surface2 h-8 w-full rounded-lg text-[9px] font-bold uppercase"
                              >
                                <Link href={ROUTES.client.profileOffersRenewal}>
                                  <Mail className="mr-1.5 h-3.5 w-3.5" /> View Proposal
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              {user.nickname && (
                <div className="text-[10px] font-bold uppercase leading-none tracking-widest text-white/60">
                  @{user.nickname}
                </div>
              )}
              <p className="text-[9px] font-bold uppercase leading-none tracking-widest text-white/40">
                ID: {user.email?.split('@')[0] || 'anonymous'}
              </p>
            </div>
            {user.loyaltyPoints && (
              <div className="mt-2.5 flex h-6 w-fit items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 shadow-lg backdrop-blur-md">
                <Trophy className="h-3 w-3 text-amber-400 shadow-sm" />
                <span className="text-[10px] font-bold uppercase tabular-nums leading-none tracking-widest text-white">
                  {user.loyaltyPoints.toLocaleString('ru-RU')}{' '}
                  <span className="text-[8px] opacity-60">points</span>
                </span>
              </div>
            )}
          </div>

          <div className="mb-1 flex shrink-0 gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/20"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Photo Viewer Dialog */}
      {isViewerOpen && (
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-3xl overflow-hidden border-none bg-black/95 p-0">
            <DialogTitle className="sr-only">Просмотр фото профиля</DialogTitle>
            <div className="relative flex h-[80vh] w-full items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 z-10 text-white hover:bg-white/20"
                onClick={() => setIsViewerOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>

              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={() =>
                      setViewerIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
                    }
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={() =>
                      setViewerIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
                    }
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              <div className="relative flex h-full w-full items-center justify-center p-4">
                <Image
                  src={photos[viewerIndex]}
                  alt={`Фото ${viewerIndex + 1}`}
                  className="max-h-full max-w-full rounded-sm object-contain shadow-2xl"
                  fill
                  unoptimized
                />
              </div>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 p-2">
                {photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-all',
                      idx === viewerIndex ? 'w-4 bg-white' : 'bg-white/30'
                    )}
                  />
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Настройка профиля</DialogTitle>
              <DialogDescription>
                Управление визуальным оформлением вашего аккаунта.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="grid gap-3 py-2">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Фотографии профиля
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="group relative h-20 w-20 overflow-hidden rounded-lg border"
                      >
                        <Image src={photo} alt="" fill className="object-cover" unoptimized />
                        {idx === mainPhotoIndex && (
                          <div className="absolute inset-0 flex items-center justify-center border-2 border-accent bg-accent/10">
                            <Badge className="h-3 px-1 text-[8px]">Main</Badge>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            className="rounded-full bg-white p-1 text-black hover:bg-accent"
                            onClick={() => setMainPhotoIndex(idx)}
                            title="Сделать основным"
                          >
                            <Camera className="h-3 w-3" />
                          </button>
                          <button
                            className="rounded-full bg-white p-1 text-black hover:bg-red-500 hover:text-white"
                            onClick={() => {
                              const newPhotos = photos.filter((_, i) => i !== idx);
                              setPhotos(newPhotos);
                              if (mainPhotoIndex >= newPhotos.length)
                                setMainPhotoIndex(Math.max(0, newPhotos.length - 1));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 transition-colors hover:border-accent hover:bg-accent/5">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <span className="mt-1 text-[10px] text-muted-foreground">Добавить</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          readAsDataUrl(file, setAvatarImage);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Фон шапки
                  </Label>
                  <div className="group relative h-28 overflow-hidden rounded-lg border">
                    {headerImage ? (
                      <Image src={headerImage} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="bg-bg-surface2 flex h-full w-full items-center justify-center text-sm italic text-muted-foreground">
                        Фоновое изображение не выбрано
                      </div>
                    )}
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm">
                        Загрузить новый фон
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          readAsDataUrl(file, setHeaderImage);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Рамка аватара</Label>
                    <Switch
                      checked={prefs.avatarBorder}
                      onCheckedChange={(value) =>
                        setPrefs((prev) => ({ ...prev, avatarBorder: !!value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Форма аватара
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'circle', label: 'Kруг' },
                        { value: 'rounded', label: 'Скруглённая' },
                        { value: 'square', label: 'Квадрат' },
                      ].map((shape) => {
                        const isActive = prefs.avatarShape === shape.value;
                        return (
                          <button
                            key={shape.value}
                            type="button"
                            className={cn(
                              'flex items-center justify-center rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all',
                              isActive
                                ? 'border-accent bg-accent/10 text-accent-foreground ring-2 ring-accent/20'
                                : 'border-border-default text-text-secondary hover:border-accent hover:text-accent-foreground'
                            )}
                            style={{ fontFeatureSettings: "'liga' 0" }}
                            onClick={() =>
                              setPrefs((prev) => ({ ...prev, avatarShape: shape.value as any }))
                            }
                          >
                            {shape.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Цвет темы шапки
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'photo', label: 'Фото' },
                        { value: 'dark', label: 'Тёмная' },
                        { value: 'light', label: 'Светлая' },
                        { value: 'blue', label: 'Синяя' },
                      ].map((theme) => {
                        const isActive = prefs.headerTheme === theme.value;
                        return (
                          <button
                            key={theme.value}
                            type="button"
                            className={cn(
                              'flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] transition-all',
                              isActive
                                ? 'border-accent bg-accent/10 text-accent-foreground ring-2 ring-accent/20'
                                : 'border-border-default text-text-secondary hover:border-accent hover:text-accent-foreground'
                            )}
                            style={{ fontFeatureSettings: "'liga' 0" }}
                            onClick={() =>
                              setPrefs((prev) => ({ ...prev, headerTheme: theme.value as any }))
                            }
                          >
                            {theme.value === 'photo' && <Palette className="h-3.5 w-3.5" />}
                            {theme.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2 font-bold">
                        <Instagram className="text-accent-primary h-4 w-4" />
                        Синхронизация Instagram
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Импортировать фото и истории
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          'px-3 text-[10px] font-bold uppercase tracking-widest',
                          'border-border-default hover:bg-accent-primary/10 hover:text-accent-primary'
                        )}
                        onClick={() => {
                          setInstagramEnabled(true);
                          toast({
                            title: 'Instagram',
                            description: 'Синхронизация фото запущена (MVP).',
                          });
                          // Keep base avatar; just add to gallery for demo
                          const igPhoto = DEFAULT_PROFILE_PHOTO;
                          setPhotos((prev) => (prev.includes(igPhoto) ? prev : [igPhoto, ...prev]));
                          setMainPhotoIndex(0);
                        }}
                      >
                        Фото
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          'px-3 text-[10px] font-bold uppercase tracking-widest',
                          'border-border-default hover:bg-accent-primary/10 hover:text-accent-primary'
                        )}
                        onClick={() => {
                          setInstagramEnabled(true);
                          toast({
                            title: 'Instagram',
                            description: 'Синхронизация сториз запущена (MVP).',
                          });
                        }}
                      >
                        Сториз
                      </Button>
                    </div>
                  </div>
                  {instagramEnabled && (
                    <div className="text-[10px] font-semibold text-green-600">Подключено</div>
                  )}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Закрыть
              </Button>
              <Button
                size="sm"
                onClick={() => setIsEditing(false)}
                className="bg-accent text-accent-foreground"
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
