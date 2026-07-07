'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { use, useState, useEffect } from 'react';
import { looks } from '@/lib/looks';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Send, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Product } from '@/lib/types';

const mockComments = [
  {
    id: 1,
    author: 'Елена П.',
    avatar: 'https://picsum.photos/seed/rev1/40/40',
    text: 'Какой стильный образ! Обожаю это сочетание.',
  },
  {
    id: 2,
    author: 'Иван К.',
    avatar: 'https://picsum.photos/seed/rev2/40/40',
    text: 'Очень круто! Где можно купить эту куртку?',
  },
];

export default function LookPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const look = looks.find((p) => p.id === params.id);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/data/products.json');
        const products = (await response.json()) as Product[];
        setRelatedProducts(products.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch products for look page:', error);
      }
    }
    fetchProducts();
  }, []);

  if (!look) {
    notFound();
  }

  const relatedLooks = looks.filter((l) => l.id !== look.id).slice(0, 3);

  return (
    <CabinetPageContent maxWidth="5xl" className="px-4 py-6 pb-16 pb-24 sm:px-6">
      <div className="grid gap-3 lg:grid-cols-3 lg:gap-3">
        {/* Main Content */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={look.imageUrl}
                  alt={look.description}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Комментарии</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar data-ai-hint="person face">
                    <AvatarImage src={comment.avatar} alt={comment.author} />
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{comment.author}</p>
                    <p className="mt-1 text-sm text-foreground/90">{comment.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader>
              {look.author && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12" data-ai-hint="person face">
                    <AvatarImage src={look.author.avatarUrl} alt={look.author.name} />
                    <AvatarFallback>{look.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-0.5">
                    <p className="text-sm font-semibold">{look.author.name}</p>
                    <p className="text-muted-foreground">{look.author.handle}</p>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm">{look.description}</p>
              <div className="-ml-2 flex items-center">
                <Button variant="ghost">
                  <Heart className="mr-2 h-4 w-4" /> {look.likesCount.toLocaleString('ru-RU')}
                </Button>
                <Button variant="ghost">
                  <MessageCircle className="mr-2 h-4 w-4" />{' '}
                  {look.commentsCount.toLocaleString('ru-RU')}
                </Button>
                <Button variant="ghost">
                  <Send className="mr-2 h-4 w-4" /> Поделиться
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Товары в образе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedProducts.map((product) => (
                <div key={product.id} className="flex gap-3">
                  <div className="relative h-20 w-12 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold hover:text-accent">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <Button size="icon" variant="secondary" className="shrink-0">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Похожие образы</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {relatedLooks.map((relatedLook) => (
                <Link
                  key={relatedLook.id}
                  href={`/looks/${relatedLook.id}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-md"
                >
                  <Image
                    src={relatedLook.imageUrl}
                    alt={relatedLook.description}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-80"
                  />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </CabinetPageContent>
  );
}
