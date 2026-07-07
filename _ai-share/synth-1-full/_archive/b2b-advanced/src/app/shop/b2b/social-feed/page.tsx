'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle } from 'lucide-react';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

/** Лента брендов: новости коллекций, посты, подписка (демо — только Syntha Lab и Nordic Wool). */
const MOCK_POSTS = [
  {
    id: '1',
    brand: 'Syntha Lab',
    text: 'FW26: дроп 2 уже в шоуруме. Откройте каталог и оформите предзаказ до 20 марта.',
    time: '2 ч назад',
    likes: 12,
    comments: 3,
  },
  {
    id: '2',
    brand: 'Nordic Wool',
    text: 'Новая линейка базового трикотажа — доступна для заказа в матрице. MOQ от 6 шт по артикулу.',
    time: '5 ч назад',
    likes: 8,
    comments: 1,
  },
  {
    id: '3',
    brand: 'Syntha Lab',
    text: 'Видео-презентация коллекции SS26: слоты на следующей неделе. Запись через Видео-консультацию.',
    time: '1 дн назад',
    likes: 24,
    comments: 5,
  },
];

export default function SocialFeedPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bSocialFeed} />;
  }

  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});

  return (
    <CabinetPageContent maxWidth="2xl" className="space-y-6">
      <ShopB2bContentHeader lead="Новости коллекций и активность ваших брендов: подписка, лайки и комментарии." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Лента</CardTitle>
          <CardDescription>
            Посты брендов, с которыми вы работаете. Уведомления о новых дропах и условиях заказа.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {MOCK_POSTS.map((post) => (
            <div
              key={post.id}
              className="border-border-default hover:border-border-default rounded-xl border p-4 transition-colors"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-semibold">{post.brand}</span>
                <span className="text-text-muted text-xs">{post.time}</span>
              </div>
              <p className="text-text-secondary mb-3 text-sm">{post.text}</p>
              <div className="text-text-secondary flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" /> {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> {post.comments}
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link href={ROUTES.shop.b2bMatrix}>В матрицу заказа</Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mb-6 flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bPartners}>Мои бренды</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bTradeShows}>Выставки</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Партнёры, выставки, заказы"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
