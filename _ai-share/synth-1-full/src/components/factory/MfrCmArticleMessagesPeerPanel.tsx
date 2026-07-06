'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { parseWorkspaceThreadContext } from '@/lib/communications/syntha-overlay-context';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ManufacturerArticleAttachTzPeerStrip } from '@/components/factory/ManufacturerArticleAttachTzPeerStrip';
import { PlatformCoreArticleChatContextStrip } from '@/components/platform/PlatformCoreArticleChatContextStrip';

function MfrCmArticleMessagesPeerPanelInner() {
  const searchParams = useSearchParams();
  if (!isPlatformCoreMode()) return null;

  const contextType = searchParams.get('contextType')?.trim() || '';
  const w2 = parseWorkspaceThreadContext(searchParams);
  const collectionId =
    w2.collectionId ||
    searchParams.get('collection')?.trim() ||
    PLATFORM_CORE_DEMO.collectionId;
  const articleId =
    w2.articleId ||
    searchParams.get('article')?.trim() ||
    searchParams.get('articleId')?.trim() ||
    (contextType !== 'b2b_order' ? PLATFORM_CORE_DEMO.demoArticleId : '');

  const articleContextActive =
    contextType === 'workshop2_article' ||
    Boolean(w2.collectionId && w2.articleId) ||
    (contextType !== 'b2b_order' && Boolean(articleId));

  if (!articleContextActive || !collectionId || !articleId) return null;

  return (
    <div className="space-y-2" data-testid="mfr-cm-article-messages-peer-panel">
      <PlatformCoreArticleChatContextStrip variant="manufacturer" />
      <ManufacturerArticleAttachTzPeerStrip collectionId={collectionId} articleId={articleId} />
    </div>
  );
}

/** Factory messages · article context strip + attach TZ when W2 article thread open. */
export function MfrCmArticleMessagesPeerPanel() {
  return (
    <Suspense fallback={null}>
      <MfrCmArticleMessagesPeerPanelInner />
    </Suspense>
  );
}
