'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Link2 } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { getLookbookProjects, getWatermarkedPdfUrl } from '@/lib/b2b/lookbook-projects-store';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

/** JOOR/Colect: шаринг лукбука/лайншита — ссылка с истечением срока, опционально пароль. */
export default function LookbookSharePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState(14);
  const [withPassword, setWithPassword] = useState(false);
  const [sharePassword, setSharePassword] = useState('');

  const projects = getLookbookProjects();
  const project = id ? projects.find((p) => p.id === id) : null;

  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}${ROUTES.shop.b2bLookbookShare}?id=${id}`
      : '';

  const handleCopy = useCallback(() => {
    if (typeof navigator !== 'undefined' && shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareLink]);

  return (
    <CabinetPageContent maxWidth="xl" className="space-y-6">
      <ShopB2bContentHeader
        backHref={ROUTES.shop.b2bShowroom}
        lead="Ссылка на просмотр лукбука: срок действия и пароль (опционально)."
      />

      {project ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{project.name}</CardTitle>
            <CardDescription>
              {project.brandName} · доступ до{' '}
              {new Date(project.visibleUntil).toLocaleDateString('ru-RU')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ссылка для шаринга</Label>
              <div className="flex gap-2">
                <Input readOnly value={shareLink} className="rounded-lg font-mono text-xs" />
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0 rounded-lg"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-text-secondary text-[10px]">
                Получатель откроет лукбук по этой ссылке (до даты видимости проекта).
              </p>
            </div>

            <div className="space-y-2">
              <Label>Срок действия ссылки (дней)</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value) || 14)}
                className="w-24 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="withPassword"
                checked={withPassword}
                onChange={(e) => setWithPassword(e.target.checked)}
                className="border-border-default rounded"
              />
              <Label htmlFor="withPassword" className="text-sm font-medium">
                Защитить паролем
              </Label>
            </div>
            {withPassword && (
              <div className="space-y-2">
                <Label>Пароль для доступа</Label>
                <Input
                  type="password"
                  placeholder="Необязательно"
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button asChild>
                <a
                  href={getWatermarkedPdfUrl(project.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Скачать лайншит (PDF)
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href={ROUTES.shop.b2bShowroom}>Виртуальный шоурум</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Link2 className="text-text-muted mx-auto mb-3 block h-12 w-12" />
            <p className="text-text-secondary font-medium">
              Выберите лукбук в виртуальном шоуруме или в разделе «Лукбуки», затем нажмите
              «Поделиться лайншитом».
            </p>
            <Button className="mt-4 rounded-xl" asChild>
              <Link href={ROUTES.shop.b2bShowroom}>Открыть виртуальный шоурум</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bLookbooks}>Лукбуки</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.home}>Кабинет магазина</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Шоурум, лукбуки, заказы"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
