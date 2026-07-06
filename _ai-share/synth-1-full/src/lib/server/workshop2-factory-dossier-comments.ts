import 'server-only';

import { WAVE_XN_MFR_DOSSIER_COMMENT_PREFIX } from '@/lib/platform/wave-xn-mfr-dossier-comments';
import type { Workshop2FitCommentLogEntry } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  getWorkshop2ServerDossierRecord,
  getWorkshop2ServerDossierStoreMode,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';

export type FactoryDossierCommentRecord = {
  commentId: string;
  text: string;
  author: string;
  at: string;
  sectionKey?: string;
};

const FACTORY_COMMENT_PREFIX = WAVE_XN_MFR_DOSSIER_COMMENT_PREFIX;
const FACTORY_COMMENT_LEGACY_PREFIX = 'mfr-tz-comment-';

function isFactoryTzComment(entry: Workshop2FitCommentLogEntry): boolean {
  return (
    entry.commentId.startsWith(FACTORY_COMMENT_PREFIX) ||
    entry.commentId.startsWith(FACTORY_COMMENT_LEGACY_PREFIX) ||
    entry.author.toLowerCase().includes('factory') ||
    entry.author.toLowerCase().includes('manufacturer') ||
    entry.author.toLowerCase().includes('цех')
  );
}

export async function listFactoryDossierComments(input: {
  collectionId: string;
  articleId: string;
  limit?: number;
}): Promise<{
  ok: boolean;
  comments: FactoryDossierCommentRecord[];
  storageMode: string;
  messageRu: string;
}> {
  const record = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  const storageMode = getWorkshop2ServerDossierStoreMode();
  if (!record) {
    return {
      ok: true,
      comments: [],
      storageMode,
      messageRu: 'Досье не найдено — комментарии пусты.',
    };
  }
  const limit = Math.min(Math.max(input.limit ?? 24, 1), 100);
  const comments = (record.dossier.fitComments ?? [])
    .filter(isFactoryTzComment)
    .slice(-limit)
    .reverse()
    .map((c) => ({
      commentId: c.commentId,
      text: c.text,
      author: c.author,
      at: c.at,
      sectionKey: c.attributeKey,
    }));
  return {
    ok: true,
    comments,
    storageMode,
    messageRu:
      comments.length > 0
        ? `${comments.length} коммент. цеха (read-only ТЗ).`
        : 'Комментариев цеха пока нет.',
  };
}

/** Comment-only: append fitComments + PG journal event, без правки полей ТЗ. */
export async function appendFactoryDossierComment(input: {
  collectionId: string;
  articleId: string;
  text: string;
  actor: string;
  sectionKey?: string;
}): Promise<{
  ok: boolean;
  comment?: FactoryDossierCommentRecord;
  storageMode?: string;
  messageRu?: string;
}> {
  const text = input.text.trim();
  if (!text) {
    return { ok: false, messageRu: 'Текст комментария обязателен.' };
  }

  const record = await getWorkshop2ServerDossierRecord(input.collectionId, input.articleId);
  if (!record) {
    return { ok: false, messageRu: 'Досье не найдено — ТЗ read-only, комментарий не записан.' };
  }

  const at = new Date().toISOString();
  const commentId = `${FACTORY_COMMENT_PREFIX}${Date.now().toString(36)}`;
  const entry: Workshop2FitCommentLogEntry = {
    commentId,
    text: text.slice(0, 2000),
    author: input.actor.slice(0, 120),
    at,
    ...(input.sectionKey?.trim() ? { attributeKey: input.sectionKey.trim() } : {}),
  };

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: input.collectionId,
    articleId: input.articleId,
    dossier: {
      ...record.dossier,
      fitComments: [...(record.dossier.fitComments ?? []), entry],
    },
    baseVersion: record.version,
    updatedBy: input.actor,
    txMeta: {
      eventType: 'manufacturer.dossier_comment',
      eventPayload: {
        commentId,
        sectionKey: input.sectionKey ?? null,
        previewRu: text.slice(0, 120),
      },
    },
  });

  if (!saved.ok) {
    return { ok: false, messageRu: 'Конфликт версии досье — обновите страницу.' };
  }

  return {
    ok: true,
    comment: {
      commentId,
      text: entry.text,
      author: entry.author,
      at,
      sectionKey: input.sectionKey,
    },
    storageMode: getWorkshop2ServerDossierStoreMode(),
    messageRu: 'Комментарий цеха сохранён (journal PG).',
  };
}

/** @deprecated use listFactoryDossierComments */
export const listManufacturerDossierComments = listFactoryDossierComments;

/** @deprecated use appendFactoryDossierComment */
export const appendManufacturerDossierComment = appendFactoryDossierComment;

export type ManufacturerDossierCommentRecord = FactoryDossierCommentRecord;
