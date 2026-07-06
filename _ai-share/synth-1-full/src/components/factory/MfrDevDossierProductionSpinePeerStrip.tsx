'use client';

import Link from 'next/link';
import { manufacturerHandoffFeatureHref } from '@/lib/production/manufacturer-handoff-queue';
import { factoryMessagesWorkshop2ArticleContextHref } from '@/lib/routes';
import { ROUTES } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';
import { cn } from '@/lib/utils';

type Props = {
  factoryId: string;
  collectionId: string;
  articleId: string;
};

/** Mfr dev dossier · sample queue + techpack + QC + article chat peers. */
export function MfrDevDossierProductionSpinePeerStrip({ factoryId, collectionId, articleId }: Props) {
  const sampleQueueHref = `${ROUTES.factory.production}#sample-queue`;
  const techpackHref = manufacturerHandoffFeatureHref('techpack-ack', {
    factoryId,
    collectionId,
    articleId,
  });
  const qcHref = manufacturerHandoffFeatureHref('qc-gate', { factoryId, collectionId });
  const handoffHref = manufacturerHandoffFeatureHref('handoff', { factoryId, collectionId });
  const articleChatHref = factoryMessagesWorkshop2ArticleContextHref(collectionId, articleId, {
    role: 'manufacturer',
  });

  return (
    <div
      className={cn(hubGadget.goldenPath, hubCabinet.workspaceTableScroll, 'max-md:flex-nowrap')}
      data-testid="mfr-dev-dossier-production-spine-peer-strip"
    >
      <Link href={sampleQueueHref} data-testid="mfr-dev-dossier-sample-queue-link" className={hubGadget.goldenLink}>
        Очередь образцов
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={techpackHref} data-testid="mfr-dev-dossier-techpack-ack-link" className={hubGadget.goldenLink}>
        Подтверждение техпака
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={qcHref} data-testid="mfr-dev-dossier-qc-gate-link" className={hubGadget.goldenLink}>
        Гейт КК
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={handoffHref} data-testid="mfr-dev-dossier-handoff-link" className={hubGadget.goldenLink}>
        Передача
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link href={articleChatHref} data-testid="mfr-dev-dossier-article-chat-link" className={hubGadget.goldenLink}>
        Чат по артикулу
      </Link>
    </div>
  );
}
