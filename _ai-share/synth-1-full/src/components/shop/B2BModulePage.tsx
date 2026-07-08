'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getRelatedLinks } from '@/lib/data/integration-modules';
import type { LucideIcon } from 'lucide-react';

interface B2BModulePageProps {
  title: string;
  description: string;
  moduleId: string;
  icon: LucideIcon;
  phase?: 1 | 2 | 3 | 4;
  children?: React.ReactNode;
  backHref?: string;
}

export function B2BModulePage({
  title,
  description,
  moduleId,
  icon: Icon,
  phase,
  children,
  backHref = ROUTES.shop.home,
}: B2BModulePageProps) {
  const relatedLinks = getRelatedLinks(moduleId).map((l) => ({ label: l.label, href: l.href }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={backHref}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="flex items-center gap-2 text-xl font-bold uppercase">
              <Icon className="h-5 w-5" /> {title}
            </h1>
            {phase && (
              <Badge variant="outline" className="text-[9px]">
                Фаза {phase}
              </Badge>
            )}
          </div>
          <p className="text-text-secondary mt-0.5 text-sm">{description}</p>
        </div>
      </div>
      {children}
      {relatedLinks.length > 0 && (
        <RelatedModulesBlock links={relatedLinks} title="Связанные модули" className="mt-6" />
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bCatalog}>B2B каталог</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bMatrix}>Матрица заказов</Link>
        </Button>
      </div>
    </div>
  );
}
