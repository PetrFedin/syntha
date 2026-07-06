import type { Workshop2FinalTzSpecExportContext } from '@/lib/production/workshop2-final-tz-spec-export';
import {
  buildWorkshop2FinalExportHtmlFromSnapshotOnServer,
  createWorkshop2FinalExportSnapshotOnServer,
} from '@/lib/production/workshop2-server-dossier-client';
import { downloadWorkshop2TechPackHtmlFile } from '@/lib/production/workshop2-techpack-export-sheets';

export type Workshop2FactoryPackServerExportResult =
  | { ok: true; snapshotId: string; html: string }
  | {
      ok: false;
      reason:
        | 'not_found'
        | 'version_conflict'
        | 'snapshot_not_found'
        | 'snapshot_context_missing'
        | 'invalid_server_response'
        | 'network_or_server_error'
        | `http_${number}`;
    };

type Workshop2FactoryPackServerExportFailureReason = Extract<
  Workshop2FactoryPackServerExportResult,
  { ok: false }
>['reason'];

export function workshop2FactoryPackServerExportFailureRu(
  reason: Workshop2FactoryPackServerExportFailureReason
): string {
  switch (reason) {
    case 'not_found':
      return 'Досье не найдено на сервере — сохраните артикул в PG.';
    case 'version_conflict':
      return 'Конфликт версии досье — обновите страницу и повторите.';
    case 'snapshot_not_found':
      return 'Снимок экспорта не найден.';
    case 'snapshot_context_missing':
      return 'Контекст снимка неполный.';
    case 'invalid_server_response':
      return 'Некорректный ответ сервера.';
    case 'network_or_server_error':
      return 'Сеть или сервер недоступны.';
    default:
      return `Ошибка экспорта (${reason}).`;
  }
}

/** Immutable snapshot на сервере → factory pack HTML → скачивание. */
export async function exportWorkshop2FactoryPackViaServerSnapshot(input: {
  collectionId: string;
  articleId: string;
  actorLabel: string;
  exportContext: Omit<Workshop2FinalTzSpecExportContext, 'measurementsLeaf'>;
  articleSku: string;
  download?: boolean;
}): Promise<Workshop2FactoryPackServerExportResult> {
  const snap = await createWorkshop2FinalExportSnapshotOnServer({
    collectionId: input.collectionId,
    articleId: input.articleId,
    actorLabel: input.actorLabel,
    exportContext: input.exportContext,
  });
  if (!snap.ok) return { ok: false, reason: snap.reason };

  const doc = await buildWorkshop2FinalExportHtmlFromSnapshotOnServer({
    collectionId: input.collectionId,
    articleId: input.articleId,
    snapshotId: snap.data.snapshotId,
    format: 'factory_pack',
  });
  if (!doc.ok) return { ok: false, reason: doc.reason };

  if (input.download !== false) {
    downloadWorkshop2TechPackHtmlFile(doc.html, input.articleSku);
  }

  return { ok: true, snapshotId: snap.data.snapshotId, html: doc.html };
}
