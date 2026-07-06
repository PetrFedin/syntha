'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  buildManufacturerHandoffQueueSession,
  manufacturerHandoffFeatureHref,
} from '@/lib/production/manufacturer-handoff-queue';
import {
  BRAND_DOSSIER_DIFF_VIEWER_PEER_LABEL_RU,
  FACTORY_DOSSIER_COMMENTS_API_PATH,
  MFR_DEV_DOSSIER_ANNOTATION_BRAND_DIFF_LINK_TESTID,
  MFR_DEV_DOSSIER_ANNOTATION_PANEL_ANCHOR,
  MFR_DEV_DOSSIER_ANNOTATION_PANEL_TESTID,
  MFR_DEV_DOSSIER_ANNOTATION_PEER_STRIP_TESTID,
  buildMfrDossierCommentsPeerHrefs,
} from '@/lib/production/mfr-dossier-comments-wave-xn';
import {
  WAVE_XN_MFR_DOSSIER_ANNOTATION_EMPTY_TESTID,
  WAVE_XN_MFR_DOSSIER_ANNOTATION_INPUT_TESTID,
  WAVE_XN_MFR_DOSSIER_ANNOTATION_LIST_TESTID,
  WAVE_XN_MFR_DOSSIER_ANNOTATION_SUBMIT_TESTID,
  WAVE_XN_MFR_DOSSIER_COMMENT_EMPTY_RU,
  WAVE_XN_MFR_DOSSIER_COMMENT_SAVED_RU,
  WAVE_XN_MFR_DOSSIER_INPUT_PLACEHOLDER_RU,
  WAVE_XN_MFR_DOSSIER_PEER_ARTICLE_CHAT_RU,
  WAVE_XN_MFR_DOSSIER_PEER_HANDOFF_RU,
  WAVE_XN_MFR_DOSSIER_READ_ONLY_HINT_RU,
  WAVE_XN_MFR_DOSSIER_SUBMIT_BUSY_RU,
  WAVE_XN_MFR_DOSSIER_SUBMIT_LABEL_RU,
} from '@/lib/platform/wave-xn-mfr-dossier-comments';
import { factoryMessagesWorkshop2ArticleContextHref } from '@/lib/routes';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Comment = {
  commentId: string;
  text: string;
  author: string;
  at: string;
  sectionKey?: string;
};

type Props = {
  collectionId: string;
  articleId: string;
  factoryId?: string;
  orderId?: string;
};

/** Wave XN · comment-only annotation panel (read-only ТЗ, PG journal). */
export function ManufacturerDevDossierAnnotationPanel({
  collectionId,
  articleId,
  factoryId = 'fact-1',
  orderId,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [messageRu, setMessageRu] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const peers = buildMfrDossierCommentsPeerHrefs({ collectionId, articleId });

  const loadComments = useCallback(async () => {
    const qs = new URLSearchParams({ collectionId, articleId });
    const res = await fetch(`${FACTORY_DOSSIER_COMMENTS_API_PATH}?${qs.toString()}`, {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    });
    const json = (await res.json()) as {
      comments?: Comment[];
      messageRu?: string;
    };
    setComments(json.comments ?? []);
    setMessageRu(json.messageRu ?? null);
    setLoaded(true);
  }, [collectionId, articleId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const res = await fetch(FACTORY_DOSSIER_COMMENTS_API_PATH, {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId, articleId, text: trimmed }),
      });
      const json = (await res.json()) as { ok?: boolean; messageRu?: string };
      if (json.ok) {
        setText('');
        setMessageRu(json.messageRu ?? WAVE_XN_MFR_DOSSIER_COMMENT_SAVED_RU);
        await loadComments();
      } else {
        setMessageRu(json.messageRu ?? 'Не удалось сохранить комментарий.');
      }
    } finally {
      setBusy(false);
    }
  };

  const session = buildManufacturerHandoffQueueSession({
    factoryId,
    collectionId,
    orderId,
  });
  const handoffHref = orderId
    ? session.handoffHref
    : manufacturerHandoffFeatureHref('handoff', { factoryId, collectionId });
  const chatHref = factoryMessagesWorkshop2ArticleContextHref(collectionId, articleId, {
    role: 'manufacturer',
  });

  return (
    <div
      id={MFR_DEV_DOSSIER_ANNOTATION_PANEL_ANCHOR}
      className="border-border-subtle space-y-2 rounded-lg border bg-white/80 p-3"
      data-testid={MFR_DEV_DOSSIER_ANNOTATION_PANEL_TESTID}
    >
      <div className={hubGadget.goldenPath} data-testid={MFR_DEV_DOSSIER_ANNOTATION_PEER_STRIP_TESTID}>
        <Link
          href={peers.brandDiffViewerHref}
          data-testid={MFR_DEV_DOSSIER_ANNOTATION_BRAND_DIFF_LINK_TESTID}
          className={hubGadget.goldenLink}
        >
          {BRAND_DOSSIER_DIFF_VIEWER_PEER_LABEL_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link href={handoffHref} data-testid="mfr-dev-dossier-annotation-handoff-link" className={hubGadget.goldenLink}>
          {WAVE_XN_MFR_DOSSIER_PEER_HANDOFF_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link href={chatHref} data-testid="mfr-dev-dossier-annotation-chat-link" className={hubGadget.goldenLink}>
          {WAVE_XN_MFR_DOSSIER_PEER_ARTICLE_CHAT_RU}
        </Link>
      </div>
      <p className="text-text-muted text-[10px]">
        {WAVE_XN_MFR_DOSSIER_READ_ONLY_HINT_RU}
        {messageRu ? ` · ${messageRu}` : ''}
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={WAVE_XN_MFR_DOSSIER_INPUT_PLACEHOLDER_RU}
        className="min-h-[72px] text-xs"
        data-testid={WAVE_XN_MFR_DOSSIER_ANNOTATION_INPUT_TESTID}
        disabled={busy}
      />
      <Button
        type="button"
        size="sm"
        className="h-8 text-[10px] font-bold"
        disabled={busy || !text.trim()}
        data-testid={WAVE_XN_MFR_DOSSIER_ANNOTATION_SUBMIT_TESTID}
        onClick={() => void submit()}
      >
        <MessageSquarePlus className="mr-1 h-3.5 w-3.5" aria-hidden />
        {busy ? WAVE_XN_MFR_DOSSIER_SUBMIT_BUSY_RU : WAVE_XN_MFR_DOSSIER_SUBMIT_LABEL_RU}
      </Button>
      {loaded && comments.length > 0 ? (
        <ul className="space-y-1.5" data-testid={WAVE_XN_MFR_DOSSIER_ANNOTATION_LIST_TESTID}>
          {comments.map((c) => (
            <li
              key={c.commentId}
              className="border-border-subtle rounded border px-2 py-1.5 text-[10px]"
              data-testid={`mfr-dev-dossier-annotation-item-${c.commentId}`}
            >
              <p className="text-text-primary whitespace-pre-wrap">{c.text}</p>
              <p className="text-text-muted mt-0.5">
                {c.author} · {new Date(c.at).toLocaleString('ru-RU')}
              </p>
            </li>
          ))}
        </ul>
      ) : loaded ? (
        <p className="text-text-muted text-[10px]" data-testid={WAVE_XN_MFR_DOSSIER_ANNOTATION_EMPTY_TESTID}>
          {WAVE_XN_MFR_DOSSIER_COMMENT_EMPTY_RU}
        </p>
      ) : null}
    </div>
  );
}
