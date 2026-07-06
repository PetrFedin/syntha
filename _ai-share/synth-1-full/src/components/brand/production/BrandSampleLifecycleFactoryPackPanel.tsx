'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WORKSHOP2_TECHPACK_EXPORT_SHEETS } from '@/lib/production/workshop2-techpack-export-sheets';
import { BrandWorkshop2TechPackCrossLinksStrip } from '@/components/brand/production/BrandWorkshop2TechPackCrossLinksStrip';
import {
  brandTechPackExportHubHref,
  buildBrandTechPackExportSession,
} from '@/lib/production/workshop2-techpack-export-session';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

export function BrandSampleLifecycleFactoryPackPanel({
  collectionId,
  articleId,
}: {
  collectionId: string;
  articleId?: string;
}) {
  const demoArticle = articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const session = buildBrandTechPackExportSession({
    articleId: demoArticle,
    collectionId,
  });

  return (
    <Card data-testid="brand-sample-lifecycle-factory-pack-panel">
      <CardHeader>
        <CardTitle className="text-base">Фабричный пакет · экспорт листов</CardTitle>
        <CardDescription className="text-xs leading-snug">
          Столп development → handoff: 6 print-листов поверх Workshop 2 dossier (не второй PLM).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ol className="list-decimal space-y-1 pl-5 text-xs text-text-secondary">
          {WORKSHOP2_TECHPACK_EXPORT_SHEETS.map((s) => (
            <li key={s.id}>
              {s.sheetNo}. {s.titleRu} — {s.summaryRu}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 text-xs">
          <Link
            href={session.dossierAssignmentHref}
            className="text-primary underline-offset-2 hover:underline"
            data-testid="brand-sample-factory-pack-dossier-link"
          >
            Preview в досье · {demoArticle}
          </Link>
          <Link
            href={session.releaseGateHref}
            className="text-primary underline-offset-2 hover:underline"
            data-testid="brand-sample-factory-pack-release-link"
          >
            Release gate
          </Link>
        </div>
        <BrandWorkshop2TechPackCrossLinksStrip links={session.crossLinks} compact />
        <p className="text-text-muted text-[11px]">
          Hub:{' '}
          <Link href={brandTechPackExportHubHref(collectionId)} className="underline">
            {brandTechPackExportHubHref(collectionId)}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
