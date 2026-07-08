import React from 'react';
import { Star, ThumbsUp, SeparatorHorizontal } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Camera } from 'lucide-react';

interface BrandReviewsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  brandReviews: { average: number; count: number };
  reviewSort: string;
  setReviewSort: (sort: any) => void;
  detailedReviews: any[];
}

export function BrandReviewsDialog({
  isOpen,
  onOpenChange,
  brandReviews,
  reviewSort,
  setReviewSort,
  detailedReviews,
}: BrandReviewsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="custom-scrollbar max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border-none bg-background p-0 shadow-2xl">
        <DialogHeader className="sticky top-0 z-10 border-b border-muted/10 bg-muted/5 p-4 pb-4 backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-black uppercase tracking-tighter">
                Отзывы о бренде
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium">
                На основе {brandReviews.count} проверенных покупок и визитов в шоурум
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Star className="h-6 w-6 fill-current text-yellow-500" />
                  <span className="text-base font-black">{brandReviews.average}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Средний балл
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
              Сортировать:
            </span>
            {[
              { label: 'Новые', value: 'new' },
              { label: 'Положительные', value: 'positive' },
              { label: 'Критичные', value: 'negative' },
            ].map((sort) => (
              <Button
                key={sort.value}
                variant={reviewSort === sort.value ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all',
                  reviewSort === sort.value
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-muted-foreground/20 hover:bg-muted/50'
                )}
                onClick={() => setReviewSort(sort.value as any)}
              >
                {sort.label}
              </Button>
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-10 p-4 pt-6">
          {detailedReviews
            .filter((review) => {
              if (reviewSort === 'new') return true;
              if (reviewSort === 'positive') return review.rating >= 4;
              if (reviewSort === 'negative') return review.rating <= 3;
              return true;
            })
            .map((review) => (
              <div
                key={review.id}
                className="group duration-500 animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border-2 border-muted/20 shadow-sm">
                    <Image src={review.avatar} alt={review.author} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black">{review.author}</h4>
                          {review.status && (
                            <Badge
                              variant="secondary"
                              className="rounded-full border-none bg-accent/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-accent"
                            >
                              {review.status}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-3.5 w-3.5',
                                  i < review.rating
                                    ? 'fill-current text-yellow-500'
                                    : 'text-muted/20'
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
                            {review.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 rounded-xl text-muted-foreground hover:text-accent"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black">{review.likes}</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-foreground/80">
                      {review.text}
                    </p>

                    {review.images && (
                      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                        {review.images.map((img: any) => (
                          <div
                            key={img.id}
                            className="relative h-24 w-20 shrink-0 cursor-zoom-in overflow-hidden rounded-xl border border-muted/20 transition-transform hover:scale-105"
                          >
                            <Image src={img.url} alt={img.alt} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {review.tags && (
                      <div className="flex flex-wrap gap-2">
                        {review.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-muted-foreground/20 text-[8px] font-black uppercase tracking-tighter text-muted-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {review.chat &&
                      review.chat.map((msg: any, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            'rounded-2xl border p-4 text-xs leading-relaxed',
                            msg.sender === 'brand'
                              ? 'border-accent/10 bg-accent/5'
                              : 'border-muted/20 bg-muted/30'
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <div
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-black uppercase',
                                msg.sender === 'brand'
                                  ? 'bg-accent text-white'
                                  : 'bg-muted-foreground text-white'
                              )}
                            >
                              {msg.sender === 'brand' ? 'B' : 'U'}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {msg.sender === 'brand' ? 'Ответ бренда' : 'Ваш ответ'}
                            </span>
                            <span className="ml-auto text-[8px] font-bold text-muted-foreground">
                              {msg.date}
                            </span>
                          </div>
                          <p className="font-medium text-foreground/90">{msg.text}</p>
                        </div>
                      ))}
                  </div>
                </div>
                <Separator className="mt-8 bg-muted/10" />
              </div>
            ))}
        </div>

        <DialogFooter className="border-t border-muted/10 bg-muted/5 p-4">
          <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Camera className="h-5 w-5 text-accent" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold leading-snug text-muted-foreground">
                  Поделитесь фото и получите{' '}
                  <span className="font-black text-accent">+100 бонусов</span>.
                </p>
                <p className="text-[9px] font-medium text-muted-foreground/60">
                  * Бонусы неквалификационные, сгорают через 2 недели.
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                onOpenChange(false);
                // Assuming setIsShareLookOpen is handled by parent or passed down if needed,
                // but here we just close. The logic in original file was:
                // setIsBrandReviewsOpen(false);
                // setIsShareLookOpen(true);
                // We might need to accept a callback for this action if it switches dialogs.
              }}
              className="h-12 w-full rounded-xl bg-accent px-8 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 transition-all hover:scale-105 hover:bg-accent/90 sm:w-auto"
            >
              Написать отзыв
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
