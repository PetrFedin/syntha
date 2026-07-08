'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { getIntegrationsLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';

export default function SSOPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-6 px-4 py-6 pb-24 sm:px-6">
      <SectionInfoCard
        title="SSO — единый вход"
        description={
          <>
            Корпоративная аутентификация. <AcronymWithTooltip abbr="SSO" />, SAML 2.0, OIDC.
            Подключение к корпоративному IdP (Azure AD, Okta, Keycloak).
          </>
        }
        icon={Lock}
        iconBg="bg-bg-surface2"
        iconColor="text-text-secondary"
        badges={
          <>
            <Badge variant="outline" className="text-[9px]">
              SAML
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              OIDC
            </Badge>
            <Button variant="outline" size="sm" className="h-7 text-[9px]" asChild>
              <Link href={ROUTES.brand.integrations}>Интеграции</Link>
            </Button>
          </>
        }
      />
      <h1 className="text-2xl font-bold uppercase">Единый вход (SSO)</h1>
      <Card className="border-border-subtle rounded-xl border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Корпоративный вход
          </CardTitle>
          <CardDescription>Настройте вход через корпоративный IdP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-text-secondary text-[11px]">
              Поддерживаемые провайдеры: Azure AD, Okta, Google Workspace, Keycloak
            </p>
            <Button size="sm" variant="outline">
              Настроить <AcronymWithTooltip abbr="SSO" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={getIntegrationsLinks()} />
    </CabinetPageContent>
  );
}
