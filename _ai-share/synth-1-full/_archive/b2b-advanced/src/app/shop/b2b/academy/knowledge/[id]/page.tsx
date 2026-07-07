'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { ArrowLeft } from 'lucide-react';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { getKnowledgeArticle } from '@/lib/academy/brand-academy-data';
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/academy/brand-academy-data';

export default function ShopKnowledgeArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');
  const article = getKnowledgeArticle(id);

  if (!article) {
    return (
      <CabinetPageContent maxWidth="2xl" className="space-y-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-text-secondary mt-4">Статья не найдена</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href={ROUTES.shop.b2bAcademy}>В академию</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  return (
    <CabinetPageContent maxWidth="2xl" className="space-y-6">
      <ShopB2bContentHeader
        backHref={ROUTES.shop.b2bAcademy}
        lead={
          <>
            <span className="font-medium">{article.title}</span>
            <span className="text-text-secondary mt-1 block text-sm">
              {KNOWLEDGE_CATEGORY_LABELS[article.category] ?? article.category}
            </span>
          </>
        }
      />

      <Card className="border-border-subtle rounded-xl border">
        <CardContent className="space-y-4 pt-6">
          <div className="flex gap-2">
            <Badge variant="outline">
              {KNOWLEDGE_CATEGORY_LABELS[article.category] ?? article.category}
            </Badge>
            <span className="text-text-secondary text-[11px]">Обновлено {article.updatedAt}</span>
          </div>
          <p className="text-text-primary leading-relaxed">{article.excerpt}</p>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[9px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href={ROUTES.shop.b2bAcademy}>← К списку</Link>
      </Button>
    </CabinetPageContent>
  );
}
