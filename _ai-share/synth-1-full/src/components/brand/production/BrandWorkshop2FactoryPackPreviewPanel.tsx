'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Dispatch, SetStateAction } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildWorkshop2TechPackFactoryDocumentHtml,
  buildWorkshop2TechPackSheetHtml,
  downloadWorkshop2TechPackHtmlFile,
  summarizeWorkshop2TechPackExportReadiness,
  WORKSHOP2_TECHPACK_EXPORT_SHEETS,
  type Workshop2TechPackExportSheetId,
} from '@/lib/production/workshop2-techpack-export-sheets';
import { buildWorkshop2TechPackExportOptions } from '@/lib/production/workshop2-techpack-export-options';
import { assessWorkshop2TechPackReleaseGate } from '@/lib/production/workshop2-techpack-release-gate';
import {
  exportWorkshop2FactoryPackViaServerSnapshot,
  workshop2FactoryPackServerExportFailureRu,
} from '@/lib/production/workshop2-factory-pack-server-export';
import { stampDossierAfterFactoryPackExport } from '@/components/brand/production/workshop2-phase1-dossier-panel-stamp-factory-pack-export';
import { getWorkingOrderVersionsForOrder } from '@/lib/b2b/working-order-store';
import { fetchWorkshop2CartSession } from '@/lib/b2b/workshop2-cart-bridge';
import type { TechPackMatrixCartLine } from '@/lib/production/workshop2-techpack-qty-bridge';
import type { Workshop2FinalTzSpecExportContext } from '@/lib/production/workshop2-final-tz-spec-export';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { buildBrandTechPackExportSession } from '@/lib/production/workshop2-techpack-export-session';
import { BrandWorkshop2TechPackCrossLinksStrip } from '@/components/brand/production/BrandWorkshop2TechPackCrossLinksStrip';
import { Workshop2TechPackConstructionNotesPanel } from '@/components/brand/production/Workshop2TechPackConstructionNotesPanel';
import { cn } from '@/lib/utils';

export type BrandWorkshop2FactoryPackPreviewPanelProps = {
  dossier: Workshop2DossierPhase1;
  exportContext: Workshop2FinalTzSpecExportContext;
  articleId: string;
  collectionId?: string;
  skuDraft?: string;
  orderId?: string;
  setDossier?: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  updatedByLabel?: string;
  tzWriteDisabled?: boolean;
  compact?: boolean;
  onExportNotice?: (message: string) => void;
};

export function BrandWorkshop2FactoryPackPreviewPanel({
  dossier,
  exportContext,
  articleId,
  collectionId,
  skuDraft,
  orderId,
  setDossier,
  updatedByLabel = 'Export',
  tzWriteDisabled = false,
  compact = false,
  onExportNotice,
}: BrandWorkshop2FactoryPackPreviewPanelProps) {
  const [activeSheetId, setActiveSheetId] = useState<Workshop2TechPackExportSheetId>('cover');
  const [cartLines, setCartLines] = useState<TechPackMatrixCartLine[] | undefined>();
  const [serverExportBusy, setServerExportBusy] = useState(false);
  const session = useMemo(
    () =>
      buildBrandTechPackExportSession({
        articleId,
        collectionId,
        sku: skuDraft ?? exportContext.articleSku,
        orderId,
      }),
    [articleId, collectionId, skuDraft, exportContext.articleSku, orderId]
  );
  const workingOrderRows = useMemo(() => {
    if (typeof window === 'undefined' || !session.orderId) return undefined;
    const versions = getWorkingOrderVersionsForOrder(session.orderId);
    const confirmed =
      versions.find((v) => v.status === 'confirmed') ??
      versions.find((v) => v.status === 'pending_review') ??
      versions[0];
    return confirmed?.rows;
  }, [session.orderId]);

  useEffect(() => {
    let cancelled = false;
    void fetchWorkshop2CartSession().then((res) => {
      if (cancelled || !res.ok || !res.lines?.length) return;
      setCartLines(
        res.lines.map((l) => ({
          collectionId: l.collectionId,
          articleId: l.articleId,
          colorCode: l.colorCode,
          size: l.size,
          qty: l.qty,
        }))
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const exportOptions = useMemo(
    () =>
      buildWorkshop2TechPackExportOptions({
        dossier,
        articleSku: skuDraft ?? exportContext.articleSku,
        articleId,
        collectionId: session.collectionId,
        workingOrderRows,
        cartLines,
        matrixHref: session.matrixQtyHref,
      }),
    [
      dossier,
      skuDraft,
      exportContext.articleSku,
      articleId,
      session.collectionId,
      workingOrderRows,
      cartLines,
      session.matrixQtyHref,
    ]
  );
  const releaseGate = useMemo(
    () =>
      assessWorkshop2TechPackReleaseGate({
        dossier,
        ctx: exportContext,
        exportOptions,
      }),
    [dossier, exportContext, exportOptions]
  );
  const readiness = useMemo(
    () => summarizeWorkshop2TechPackExportReadiness(dossier, exportContext),
    [dossier, exportContext]
  );
  const sheetHtml = useMemo(
    () => buildWorkshop2TechPackSheetHtml(activeSheetId, dossier, exportContext, exportOptions),
    [activeSheetId, dossier, exportContext, exportOptions]
  );
  const fullPackHtml = useMemo(
    () => buildWorkshop2TechPackFactoryDocumentHtml(dossier, exportContext, exportOptions),
    [dossier, exportContext, exportOptions]
  );

  const serverExportContext = useMemo(() => {
    const {
      measurementsLeaf: _leaf,
      exportLanguage,
      ...rest
    } = exportContext;
    return { ...rest, exportLanguage };
  }, [exportContext]);

  const handleServerSnapshotExport = async () => {
    if (!collectionId?.trim()) {
      onExportNotice?.('Укажите collectionId для PG snapshot.');
      return;
    }
    setServerExportBusy(true);
    try {
      const res = await exportWorkshop2FactoryPackViaServerSnapshot({
        collectionId,
        articleId,
        actorLabel: updatedByLabel,
        exportContext: serverExportContext,
        articleSku: exportContext.articleSku,
      });
      if (!res.ok) {
        onExportNotice?.(workshop2FactoryPackServerExportFailureRu(res.reason));
        return;
      }
      if (!tzWriteDisabled && setDossier) {
        const stamped = stampDossierAfterFactoryPackExport({
          dossier,
          format: 'server_snapshot',
          updatedByLabel,
          skuDraft: exportContext.articleSku,
          snapshotId: res.snapshotId,
          releaseGate,
        });
        setDossier(stamped);
      }
      onExportNotice?.(
        `Снимок фабричного пакета ${res.snapshotId.slice(0, 8)}… — HTML скачан${
          tzWriteDisabled ? ' (метка в досье недоступна без production:edit)' : ''
        }.`
      );
    } finally {
      setServerExportBusy(false);
    }
  };

  const lastExport = dossier.factoryPackLastExport;

  return (
    <Card data-testid="brand-workshop2-factory-pack-preview">
      <CardHeader className={cn(compact && 'pb-2')}>
        <CardTitle className="text-base">Preview · factory pack</CardTitle>
        <CardDescription className="text-xs leading-snug">
          6 export-листов ole_globirds поверх dossier SoT — sketch pins, labels, colorways, POM +
          qty. Не отдельный PLM.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" data-testid="brand-factory-pack-readiness">
            {readiness.sheetsReady}/{readiness.sheetsTotal} листов ready
          </Badge>
          <Badge
            variant={releaseGate.ready ? 'default' : 'secondary'}
            className={releaseGate.ready ? 'bg-emerald-600' : ''}
            data-testid="brand-factory-pack-release-gate"
          >
            {releaseGate.ready ? 'Release gate · OK' : 'Release gate · blocked'}
          </Badge>
          {lastExport ? (
            <Badge variant="outline" className="text-[10px]" data-testid="brand-factory-pack-last-export">
              Export {lastExport.sheetsReady}/{lastExport.sheetsTotal}
              {lastExport.snapshotId ? ` · ${lastExport.snapshotId.slice(0, 8)}…` : ''}
            </Badge>
          ) : null}
          {!releaseGate.ready && !compact ? (
            <Link
              href={session.releaseGateHref}
              className="text-primary text-[11px] underline-offset-2 hover:underline"
            >
              Launch readiness
            </Link>
          ) : null}
        </div>

        {!compact ? (
          <BrandWorkshop2TechPackCrossLinksStrip links={session.crossLinks} />
        ) : null}

        <Workshop2TechPackConstructionNotesPanel
          dossier={dossier}
          setDossier={setDossier}
          readOnly={!setDossier}
        />

        {exportOptions.qtyBridgeNote ? (
          <p className="text-text-muted text-[11px]" data-testid="brand-factory-pack-qty-bridge-note">
            {exportOptions.qtyBridgeNote}
            {exportOptions.qtyByColorSize?.length
              ? ` · ${exportOptions.qtyByColorSize.length} строк color×size`
              : ''}
          </p>
        ) : null}

        <div
          className="flex flex-wrap gap-1"
          role="tablist"
          aria-label="Листы фабричного пакета"
        >
          {WORKSHOP2_TECHPACK_EXPORT_SHEETS.map((sheet) => {
            const row = readiness.rows.find((r) => r.id === sheet.id);
            return (
              <Button
                key={sheet.id}
                type="button"
                size="sm"
                variant={activeSheetId === sheet.id ? 'default' : 'outline'}
                className="h-7 text-[11px]"
                data-testid={`brand-factory-pack-sheet-${sheet.id}`}
                onClick={() => setActiveSheetId(sheet.id)}
              >
                {sheet.sheetNo}. {sheet.titleRu}
                {row && !row.ok ? ' ·' : ''}
              </Button>
            );
          })}
        </div>

        {readiness.rows.find((r) => r.id === activeSheetId && !r.ok)?.missingRu.length ? (
          <p className="text-amber-800 text-[11px]">
            Не хватает:{' '}
            {readiness.rows.find((r) => r.id === activeSheetId)?.missingRu.join(', ')}
          </p>
        ) : null}

        <iframe
          title={`Лист фабричного пакета ${activeSheetId}`}
          className="border-border-default h-[min(360px,45vh)] w-full rounded-md border bg-white"
          srcDoc={sheetHtml}
          data-testid="brand-factory-pack-preview-iframe"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs"
            data-testid="brand-factory-pack-download-all"
            onClick={() =>
              downloadWorkshop2TechPackHtmlFile(fullPackHtml, exportContext.articleSku)
            }
          >
            Скачать фабричный пакет (6 листов)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="text-xs"
            disabled={serverExportBusy || !collectionId}
            data-testid="brand-factory-pack-server-snapshot-export"
            onClick={() => void handleServerSnapshotExport()}
          >
            {serverExportBusy ? 'Снимок…' : 'Снимок PG + скачать'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
