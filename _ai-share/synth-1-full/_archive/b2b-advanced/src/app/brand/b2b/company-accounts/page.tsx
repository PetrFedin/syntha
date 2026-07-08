'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCompanyAccounts, ROLE_LABELS } from '@/lib/b2b/company-accounts';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getB2BLinks } from '@/lib/data/entity-links';
import { Building2, ArrowLeft, Users } from 'lucide-react';

export default function CompanyAccountsPage() {
  const accounts = getCompanyAccounts();

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.brand.retailers}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-tight">
            <Building2 className="h-6 w-6" /> Company Accounts
          </h1>
          <p className="text-text-secondary mt-0.5 text-sm">
            Одно юрлицо, несколько пользователей: директор, байер, бухгалтер.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Корпоративные аккаунты</CardTitle>
          <CardDescription>
            Shopify Plus B2B style. Группа клиентов и Net terms на уровне компании.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-text-secondary py-8 text-center text-sm">
              <Users className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p>Нет company accounts. Создайте при добавлении партнёра.</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={ROUTES.brand.retailers}>Партнёры</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className="border-border-default flex items-start justify-between rounded-xl border p-4"
                >
                  <div>
                    <p className="font-medium">{a.legalName}</p>
                    {a.inn && <p className="text-text-secondary text-xs">ИНН {a.inn}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {a.users.map((u) => (
                        <Badge key={u.id} variant="outline" className="text-[9px]">
                          {u.name} · {ROLE_LABELS[u.role]}
                          {u.isPrimary && ' · Primary'}
                        </Badge>
                      ))}
                    </div>
                    {a.customerGroupId && (
                      <Badge variant="secondary" className="mt-2 text-[9px]">
                        Группа: {a.customerGroupId}
                      </Badge>
                    )}
                  </div>
                  {a.vatExempt && (
                    <Badge variant="outline" className="text-[9px]">
                      Без НДС
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.customerGroups}>Группы клиентов</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.brand.retailers}>Партнёры</Link>
        </Button>
      </div>
      <RelatedModulesBlock links={getB2BLinks()} title="B2B" />
    </CabinetPageContent>
  );
}
