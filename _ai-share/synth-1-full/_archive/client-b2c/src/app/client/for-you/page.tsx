'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { UserStyleArchetypeBlock } from '@/components/client/user-style-archetype-block';
import { ROUTES } from '@/lib/routes';
import { products } from '@/lib/products';
import {
  fetchForYouFeed,
  getForYouTransport,
  loadForYouPreferences,
  saveForYouPreferences,
  type ForYouFeedItem,
} from '@/lib/platform/for-you';
import type { ForYouPreferencesV1 } from '@/lib/platform/types';
import { loadStyleQuizProfile } from '@/lib/fashion/style-quiz-store';
import { reorderForYouFeedByQuiz } from '@/lib/fashion/style-quiz-score';
import { ArrowLeft, Sparkles, Ruler, RefreshCw, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClientForYouPage() {
  const { toast } = useToast();
  const transport = getForYouTransport();
  const [prefs, setPrefs] = useState<ForYouPreferencesV1 | null>(null);
  const [items, setItems] = useState<ForYouFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandsLine, setBrandsLine] = useState('');
  const [quizBoost, setQuizBoost] = useState(false);

  useEffect(() => {
    const p = loadForYouPreferences();
    setPrefs(p);
    setBrandsLine(p.brandHints.join(', '));
  }, []);

  useEffect(() => {
    if (!prefs) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let feed = await fetchForYouFeed(transport, products, prefs);
        if (transport === 'local') {
          const quiz = loadStyleQuizProfile();
          if (quiz) {
            feed = reorderForYouFeedByQuiz(feed, products, quiz);
            if (!cancelled) setQuizBoost(true);
          } else if (!cancelled) setQuizBoost(false);
        } else if (!cancelled) setQuizBoost(false);
        if (!cancelled) setItems(feed);
      } catch (e) {
        if (!cancelled) {
          toast({
            title: 'Лента «Для вас»',
            description: e instanceof Error ? e.message : 'Ошибка загрузки',
            variant: 'destructive',
          });
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prefs, transport]);

  const applyPrefs = () => {
    if (!prefs) return;
    const hints = brandsLine
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const next: ForYouPreferencesV1 = {
      ...prefs,
      brandHints: hints.length ? hints : prefs.brandHints,
    };
    saveForYouPreferences(next);
    setPrefs(next);
    toast({ title: 'Предпочтения сохранены' });
  };

  if (!prefs) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 text-sm text-muted-foreground">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-6 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.client.home}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold">
              <Sparkles className="h-6 w-6" />
              Для вас
              {quizBoost && (
                <Badge variant="outline" className="gap-1 text-[10px] font-normal">
                  <Wand2 className="h-3 w-3" />
                  Квиз стиля
                </Badge>
              )}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Локально — смещение по размеру и брендам; при сохранённом{' '}
              <Link href={ROUTES.client.styleQuiz} className="underline underline-offset-2">
                квизе стиля
              </Link>{' '}
              порядок дополнительно ранжируется. API: POST{' '}
              <code className="rounded bg-muted px-1 text-[10px]">/v1/client/for-you</code>.
            </p>
          </div>
        </div>
        <PlatformDataBanner />
      </div>

      <UserStyleArchetypeBlock />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Сигналы (демо-профиль)</CardTitle>
          <CardDescription>
            Хранится в localStorage; позже подтянется из CRM / заказов.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Ruler className="h-3 w-3" />
              Частый размер
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="size">Размер</Label>
              <Input
                id="size"
                value={prefs.sizeHint}
                onChange={(e) => setPrefs({ ...prefs, sizeHint: e.target.value })}
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brands">Бренды (через запятую)</Label>
              <Input
                id="brands"
                value={brandsLine}
                onChange={(e) => setBrandsLine(e.target.value)}
                placeholder="Syntha Lab, ЦУМ, Lamoda"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={applyPrefs}>
              Сохранить и обновить ленту
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const p = loadForYouPreferences();
                setPrefs(p);
                setBrandsLine(p.brandHints.join(', '));
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Сбросить из storage
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Похоже на ваши покупки</CardTitle>
          <CardDescription>{loading ? 'Загрузка…' : `${items.length} позиций`}</CardDescription>
        </CardHeader>
        <CardContent>
          {!loading && items.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Каталог пуст или API вернул пустой ответ. Проверьте демо-данные или базовый URL API.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((p) => (
                <Link
                  key={p.productId}
                  href={`/products/${p.slug}`}
                  className="group overflow-hidden rounded-lg border"
                >
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="space-y-1 p-2">
                    <p className="line-clamp-2 text-xs font-medium group-hover:text-primary">
                      {p.name}
                    </p>
                    {p.reasonTag && (
                      <p className="text-[10px] text-muted-foreground">{p.reasonTag}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
