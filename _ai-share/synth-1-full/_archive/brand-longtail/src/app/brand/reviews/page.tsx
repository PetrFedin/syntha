'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Loader2,
  Bot,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { products } from '@/lib/products';
import type { Product, ProductReview } from '@/lib/types';
import type { SummarizeProductReviewsOutput } from '@/lib/ai-client/types';
import { summarizeProductReviewsClient } from '@/lib/ai-client/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';

const mockReviews: ProductReview[] = [
  {
    id: 1,
    productId: '1',
    author: 'Елена П.',
    avatar: 'https://picsum.photos/seed/rev1/40/40',
    rating: 5,
    date: '2 недели назад',
    text: 'Абсолютно обожаю этот свитер! Он такой мягкий и уютный. Качество на высоте, стоит каждого рубля. Очень рекомендую.',
    color: 'Черный',
    images: [
      {
        id: 'rev1-1',
        url: 'https://images.unsplash.com/photo-1552044022-b53f602b7a3d?w=800',
        alt: 'Review image',
      },
    ],
  },
  {
    id: 2,
    productId: '1',
    author: 'Иван К.',
    avatar: 'https://picsum.photos/seed/rev2/40/40',
    rating: 4,
    date: '3 недели назад',
    text: 'Хороший свитер. Немного колется, но в целом очень теплый и стильный. Цвет соответствует фото. Размер подошел идеально.',
    color: 'Серый',
  },
  {
    id: 3,
    productId: '2',
    author: 'Мария С.',
    avatar: 'https://picsum.photos/seed/rev3/40/40',
    rating: 5,
    date: '1 месяц назад',
    text: 'Идеальные брюки для офиса. Сидят отлично, ткань не мнется. Буду брать еще в другом цвете!',
    color: 'Черный',
  },
  {
    id: 4,
    productId: '1',
    author: 'Алексей Г.',
    avatar: 'https://picsum.photos/seed/rev4/40/40',
    rating: 3,
    date: '1 месяц назад',
    text: 'Свитер неплохой, но ожидал большего за такую цену. После стирки немного сел. В целом, носить можно, но не вау.',
    color: 'Темно-синий',
    images: [
      {
        id: 'rev4-1',
        url: 'https://images.unsplash.com/photo-1616852365365-22b7d422b821?w=800',
        alt: 'Review image 2',
      },
      {
        id: 'rev4-2',
        url: 'https://images.unsplash.com/photo-1618338949885-3c4033b4ee3f?w=800',
        alt: 'Review image 3',
      },
    ],
  },
];

function RespondToReviewDialog({
  review,
  isOpen,
  onOpenChange,
}: {
  review: ProductReview;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSend = () => {
    toast({
      title: 'Ответ отправлен (симуляция)',
      description: 'Ваш ответ будет виден клиенту в его профиле.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ответить на отзыв от {review.author}</DialogTitle>
          <DialogDescription>Ваш ответ будет отправлен как приватное сообщение.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-sm text-muted-foreground">{review.text}</CardContent>
          </Card>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите ваш ответ..."
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSend} disabled={!message.trim()}>
            Отправить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BrandReviewsPage() {
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<SummarizeProductReviewsOutput | null>(null);
  const [activeResponseReview, setActiveResponseReview] = useState<ProductReview | null>(null);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(null);
    try {
      const result = await summarizeProductReviewsClient({
        reviews: mockReviews.map((r) => ({ text: r.text, rating: r.rating })),
      });
      setSummary(result);
    } catch (error) {
      console.error('Ошибка анализа отзывов:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка анализа',
        description: 'Не удалось проанализировать отзывы. Попробуйте снова.',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const getSentimentBadge = (sentiment: SummarizeProductReviewsOutput['sentiment']) => {
    switch (sentiment) {
      case 'В основном положительные':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Позитивные</Badge>;
      case 'Смешанные':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Смешанные</Badge>
        );
      case 'В основном отрицательные':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Негативные</Badge>;
    }
  };

  return (
    <>
      <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
        <SectionInfoCard
          title="Отзывы клиентов"
          description="Обратная связь, AI-анализ, ответы. Связь с Products и Quality (репутация бренда)."
          icon={Star}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          badges={
            <>
              <Badge variant="outline" className="text-[9px]">
                Products
              </Badge>
              <Badge variant="outline" className="text-[9px]">
                Quality
              </Badge>
              <Button variant="outline" size="sm" className="ml-1 h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.products}>
                  <Package className="mr-1 h-3 w-3" /> Products
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
                <Link href={ROUTES.brand.quality}>
                  <ShieldCheck className="mr-1 h-3 w-3" /> Quality
                </Link>
              </Button>
            </>
          }
        />
        <header>
          <h1 className="font-headline text-base font-bold">Отзывы клиентов</h1>
          <p className="text-muted-foreground">
            Анализируйте обратную связь и отвечайте вашим покупателям.
          </p>
        </header>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot /> AI-анализ отзывов
              </CardTitle>
              <CardDescription>Сводка по всем отзывам на ваши товары.</CardDescription>
            </div>
            <Button onClick={handleSummarize} disabled={isSummarizing}>
              {isSummarizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Проанализировать
            </Button>
          </CardHeader>
          {isSummarizing && (
            <CardContent className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          )}
          {summary && (
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="flex items-center gap-2 font-semibold">
                  Общая оценка: {getSentimentBadge(summary.sentiment)}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">{summary.summary}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 font-semibold text-green-600">
                    <ThumbsUp className="h-4 w-4" /> Плюсы
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {summary.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 font-semibold text-red-600">
                    <ThumbsDown className="h-4 w-4" /> Минусы
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {summary.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Все отзывы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mockReviews.map((review) => {
              const product = products.find((p) => p.id === review.productId);
              return (
                <div key={review.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={review.avatar} alt={review.author} />
                      <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="font-semibold">{review.author}</p>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                      {product && (
                        <p className="mt-1 text-xs text-muted-foreground">Товар: {product.name}</p>
                      )}
                      <p className="mt-2 text-sm text-foreground/90">{review.text}</p>
                      {review.images && (
                        <div className="mt-2 flex gap-2">
                          {review.images.map((img) => (
                            <div
                              key={img.id}
                              className="relative h-20 w-20 overflow-hidden rounded-md"
                            >
                              <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                className="cursor-pointer object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pl-14">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveResponseReview(review)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" /> Ответить
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </CabinetPageContent>

      {activeResponseReview && (
        <RespondToReviewDialog
          review={activeResponseReview}
          isOpen={!!activeResponseReview}
          onOpenChange={(open) => {
            if (!open) setActiveResponseReview(null);
          }}
        />
      )}
    </>
  );
}
