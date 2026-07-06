import { notFound } from 'next/navigation';
import {
  buildWorkshop2FinalTzExportContextFromDossier,
  buildWorkshop2FinalTzSpecDocumentHtml,
} from '@/lib/production/workshop2-final-tz-spec-export';
import { buildWorkshop2TechPackFactoryDocumentHtml } from '@/lib/production/workshop2-techpack-export-sheets';
import { buildWorkshop2TechPackExportOptions } from '@/lib/production/workshop2-techpack-export-options';
import { Workshop2InteractiveFactoryPortal } from '@/components/brand/production/Workshop2InteractiveFactoryPortal';
import { FactoryDossierCoreChrome } from '@/components/platform/FactoryDossierCoreChrome';
import { resolveFactoryDossierWithMeta } from '@/lib/production/workshop2-resolve-factory-dossier';

export default async function FactoryDossierPortalPage(props: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await props.params;

  if (!articleId) return notFound();

  const resolved = await resolveFactoryDossierWithMeta(articleId);
  if (!resolved) return notFound();

  const dossier = resolved.dossier;
  const collectionId = resolved.collectionId;

  const exportContext = buildWorkshop2FinalTzExportContextFromDossier(dossier, {
    articleId,
    exportLanguage: 'ru_en',
  });
  const exportOptions = buildWorkshop2TechPackExportOptions({
    dossier,
    articleSku: exportContext.articleSku,
    articleId,
  });
  const htmlContent = buildWorkshop2FinalTzSpecDocumentHtml(dossier, exportContext);
  const factoryPackHtml = buildWorkshop2TechPackFactoryDocumentHtml(
    dossier,
    exportContext,
    exportOptions
  );

  return (
    <FactoryDossierCoreChrome
      articleId={articleId}
      exportArticleSku={exportContext.articleSku}
      dossierSource={resolved.source}
      dossierCollectionId={collectionId}
    >
      <Workshop2InteractiveFactoryPortal
        htmlContent={htmlContent}
        factoryPackHtml={factoryPackHtml}
        articleId={articleId}
        collectionId={collectionId}
      />
    </FactoryDossierCoreChrome>
  );
}
