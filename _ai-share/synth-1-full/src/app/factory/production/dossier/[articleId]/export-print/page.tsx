import { notFound } from 'next/navigation';
import {
  buildWorkshop2FinalTzExportContextFromDossier,
  buildWorkshop2FinalTzSpecDocumentHtml,
} from '@/lib/production/workshop2-final-tz-spec-export';
import { MfrOpDossierExportPrintRouteClient } from '@/components/factory/MfrOpDossierExportPrintRouteClient';
import { factoryProductionDossierContextHref } from '@/lib/routes';
import { getPlatformCoreDemoByArticleId } from '@/lib/platform-core-hub-matrix';
import { resolveFactoryDossier } from '@/lib/production/workshop2-resolve-factory-dossier';

export default async function FactoryDossierExportPrintPage(props: {
  params: Promise<{ articleId: string }>;
  searchParams: Promise<{ collection?: string; order?: string; autoPrint?: string }>;
}) {
  const { articleId } = await props.params;
  const searchParams = await props.searchParams;

  if (!articleId) return notFound();

  const dossier = await resolveFactoryDossier(articleId);
  if (!dossier) return notFound();

  const demo = getPlatformCoreDemoByArticleId(articleId);
  const collectionId = searchParams.collection?.trim() || demo.collectionId;
  const orderId = searchParams.order?.trim() || undefined;
  const autoPrint = searchParams.autoPrint === '1';

  const exportContext = buildWorkshop2FinalTzExportContextFromDossier(dossier, {
    articleId,
    exportLanguage: 'ru_en',
  });
  const htmlContent = buildWorkshop2FinalTzSpecDocumentHtml(dossier, exportContext);

  const backHref = factoryProductionDossierContextHref(articleId, {
    collectionId,
    orderId,
  });

  return (
    <MfrOpDossierExportPrintRouteClient
      htmlContent={htmlContent}
      backHref={backHref}
      autoPrint={autoPrint}
    />
  );
}
