import React from 'react';
import { Camera, Edit2, Plus, X, ShoppingBag, Trophy, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ShareLookDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  purchasedProducts: any[];
  toast: any;
  displayName: string;
}

export function ShareLookDialog({
  isOpen,
  onOpenChange,
  user,
  purchasedProducts,
  toast,
  displayName,
}: ShareLookDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="custom-scrollbar max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl border-none bg-background p-0 shadow-2xl">
        <DialogHeader className="sticky top-0 z-10 border-b border-muted/10 bg-muted/5 p-4 pb-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
              <Camera className="h-6 w-6 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-tighter">
                Поделиться образом
              </DialogTitle>
              <DialogDescription className="text-sm font-medium">
                Вдохновляйте других и получайте бонусы от {displayName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-4">
          {/* Step 0: User Bio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                0. О себе (обязательно)
              </Label>
              <Link
                href="/u/settings"
                className="flex items-center gap-1 text-[9px] font-bold text-accent hover:underline"
              >
                <Edit2 className="h-2.5 w-2.5" /> Редактировать в профиле
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="ml-1 text-[8px] font-black uppercase text-muted-foreground/60">
                      Никнейм
                    </span>
                    <Input
                      defaultValue={user?.nickname || ''}
                      placeholder="@nickname"
                      readOnly={!!user?.nickname}
                      className={cn(
                        'h-10 rounded-xl bg-muted/5 text-xs font-bold',
                        !user?.nickname && 'border-red-500/50'
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="ml-1 text-[8px] font-black uppercase text-muted-foreground/60">
                      Имя
                    </span>
                    <Input
                      defaultValue={user?.displayName || ''}
                      placeholder="Ваше имя"
                      readOnly={!!user?.displayName}
                      className={cn(
                        'h-10 rounded-xl bg-muted/5 text-xs font-bold',
                        !user?.displayName && 'border-red-500/50'
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="ml-1 text-[8px] font-black uppercase text-muted-foreground/60">
                      Соцсети
                    </span>
                    <Input
                      defaultValue={
                        user?.socials?.instagram?.value || user?.socials?.telegram?.value || ''
                      }
                      placeholder="@ник или ссылка (Instagram / Telegram)"
                      readOnly={
                        !!(user?.socials?.instagram?.value || user?.socials?.telegram?.value)
                      }
                      className={cn(
                        'h-10 rounded-xl bg-muted/5 text-xs font-bold',
                        !(user?.socials?.instagram?.value || user?.socials?.telegram?.value) &&
                          'border-red-500/50'
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="ml-1 text-[8px] font-black uppercase text-muted-foreground/60">
                      Должность
                    </span>
                    <Input
                      defaultValue={user?.lifestyle?.occupation || ''}
                      placeholder="Напр: Стилист"
                      readOnly={!!user?.lifestyle?.occupation}
                      className={cn(
                        'h-10 rounded-xl bg-muted/5 text-xs font-bold',
                        !user?.lifestyle?.occupation && 'border-red-500/50'
                      )}
                    />
                  </div>
                </div>
                {(!user?.nickname || !user?.displayName || !user?.lifestyle?.occupation) && (
                  <p className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase text-red-500/80">
                    <AlertCircle className="h-3 w-3" /> Пожалуйста, заполните пустые поля в личном
                    кабинете
                  </p>
                )}
              </div>
              <textarea
                className="h-24 w-full resize-none rounded-2xl border-2 border-muted/20 bg-muted/5 p-4 text-sm font-medium transition-all focus:border-accent/40 focus:ring-0"
                placeholder="Напишите кратко о вашем стиле и почему вы выбрали этот образ..."
                required
              ></textarea>
            </div>
          </div>

          {/* Step 1: Upload Photo */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              1. Загрузите фото образа
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="group flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-muted/20 transition-all hover:border-accent/40 hover:bg-accent/5">
                <Plus className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-accent" />
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-accent">
                  Добавить фото
                </span>
              </div>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-muted/20 bg-muted/10">
                <Image
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80"
                  alt="Preview"
                  fill
                  className="object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <X className="h-5 w-5 cursor-pointer text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Select Products (Only purchased) */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              2. Отметьте купленные товары
            </Label>
            {(purchasedProducts || []).length > 0 ? (
              <div className="space-y-2">
                {(purchasedProducts || []).map((p) => (
                  <div
                    key={p.id}
                    className="group flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-50/30 p-3"
                  >
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={p.images[0]?.url || ''}
                        alt="Product"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-black uppercase">{p.name}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="border-green-200 bg-white text-[7px] font-black uppercase text-green-600"
                        >
                          Куплено на платформе
                        </Badge>
                        <span className="text-[8px] font-bold uppercase text-muted-foreground">
                          {p.category}
                        </span>
                      </div>
                    </div>
                    <Checkbox
                      defaultChecked
                      className="h-5 w-5 rounded-full border-2 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 rounded-2xl border-2 border-dashed border-muted/20 p-4 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground opacity-20" />
                <p className="text-[10px] font-black uppercase text-muted-foreground">
                  У вас пока нет покупок этого бренда
                </p>
                <p className="mx-auto max-w-[200px] text-[9px] font-medium text-muted-foreground/60">
                  Только верифицированные покупатели могут делиться образами.
                </p>
              </div>
            )}
          </div>

          {/* Step 3: Write Review */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              3. Ваш комментарий
            </Label>
            <textarea
              className="h-32 w-full resize-none rounded-3xl border-2 border-muted/20 bg-muted/5 p-4 text-sm font-medium transition-all focus:border-accent/40 focus:ring-0"
              placeholder="Расскажите о вашем образе, качестве изделий или дайте совет по стилю..."
            ></textarea>
          </div>

          {/* Reward Info */}
          <div className="flex items-center gap-3 rounded-xl border border-accent/10 bg-accent/5 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-accent">
                Награда за публикацию
              </p>
              <p className="mt-0.5 text-[10px] font-bold leading-snug text-muted-foreground">
                Вы получите <span className="font-black text-foreground">50 бонусов</span> и статус{' '}
                <span className="font-black text-foreground">Trendsetter</span> в вашем профиле
                после модерации.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 pt-0">
          <div className="w-full space-y-3">
            <p className="text-center text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/60">
              После публикации ваш образ будет отправлен бренду на согласование
            </p>
            <Button
              className="active:scale-0.98 h-10 w-full rounded-2xl bg-black text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-slate-900"
              onClick={() => {
                onOpenChange(false);
                toast({
                  title: 'Отправлено на согласование!',
                  description: 'Ваш образ появится в ленте после подтверждения брендом.',
                });
              }}
            >
              Отправить на модерацию
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
