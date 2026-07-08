'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, ClipboardList, MessageSquare, StickyNote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES, brandCalendarB2bOrderContextHref, brandMessagesB2bOrderContextHref, brandMessagesWorkshop2ArticleContextHref, shopCalendarB2bOrderContextHref, shopMessagesB2bOrderContextHref, shopMessagesWorkshop2ArticleContextHref } from '@/lib/platform-core-routes';
import { factoryCalendarB2bOrderContextHref, factoryMessagesB2bOrderContextHref, factoryMessagesRoleHref, factoryMessagesWorkshop2ArticleContextHref, factorySupplierCalendarB2bOrderContextHref, factorySupplierMessagesB2bOrderContextHref, factorySupplierMessagesWorkshop2ArticleContextHref } from '@/lib/platform-core-extended-routes';
import {
  factoryHandoffQueueHrefForDemo,
  getPlatformCoreDemo,
  isPlatformCoreEmptyChainCollection,
} from '@/lib/platform-core-hub-matrix';
import { resolvePlatformCoreCabinetOrderId } from '@/lib/platform-core-spine-active-order-fallback';
import { useShopCoreBuyerId } from '@/hooks/use-shop-core-buyer-id';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { usePgCommunicationsUnread } from '@/lib/platform-core-ports/communications/use-pg-communications-unread';
import { usePgContextualActorId } from '@/hooks/use-pg-contextual-actor-id';
import { pgContextualThreadsApiPath } from '@/lib/platform-core-ports/brand/brand-pg-contextual-chat-client';
import { usePlatformCoreCommsThreadsSource } from '@/hooks/use-platform-core-comms-threads-source';
import { PLATFORM_CORE_MESSAGES_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import type { PgContextualThreadsCabinet } from '@/lib/platform-core-ports/legacy/server/pg-contextual-message-threads-handler';
import { CommsCabinetSplitLayout } from '@/components/platform/CommsCabinetSplitLayout';
import { CommsCabinetSplitProvider } from '@/components/platform/CommsCabinetSplitProvider';
import { CommsCabinetThreadPreview } from '@/components/platform/CommsCabinetThreadPreview';
import { CommsCabinetBottomBar, CommsCabinetNav } from '@/components/platform/CommsCabinetNav';
import { CommsPillarThreadStrip } from '@/components/platform/CommsPillarThreadStrip';
import { CommsSectionGroupsPicker } from '@/components/platform/CommsSectionGroupsPicker';
import { CommsSectionContextAutoThread } from '@/components/platform/CommsSectionContextAutoThread';
import { CommsNotificationCenterStrip } from '@/components/platform/CommsNotificationCenterStrip';
import { BrandCmCabinetSpinePeerStrip } from '@/components/platform/BrandCmCabinetSpinePeerStrip';
import { SupplierMaterialQuoteCard } from '@/components/platform/SupplierMaterialQuoteCard';
import { SupplierCommsBrandPushStrip } from '@/components/factory/supplier/SupplierCommsBrandPushStrip';
import { SupplierCommsChainMaterialsPushStrip } from '@/components/factory/supplier/SupplierCommsChainMaterialsPushStrip';
import { SupplierCommsCrmPeerStrip } from '@/components/factory/supplier/SupplierCommsCrmPeerStrip';
import { SupCmCabinetSpinePeerStrip } from '@/components/factory/supplier/SupCmCabinetSpinePeerStrip';
import { MfrCmCabinetSpinePeerStrip } from '@/components/factory/MfrCmCabinetSpinePeerStrip';
import { SupplierArticleDevQuoteHonestStrip } from '@/components/factory/supplier/SupplierArticleDevQuoteHonestStrip';
import { ManufacturerUnifiedPoInboxStrip } from '@/components/factory/ManufacturerUnifiedPoInboxStrip';
import { ManufacturerArticleAttachTzPeerStrip } from '@/components/factory/ManufacturerArticleAttachTzPeerStrip';
import { PlatformCoreRegistryStreamHealthStrip } from '@/components/platform/PlatformCoreRegistryStreamHealthStrip';
import { PlatformCoreChainStatusRefreshBadge } from '@/components/platform/PlatformCoreChainStatusRefreshBadge';
import { ShopCmCabinetSpinePeerStrip } from '@/components/platform/ShopCmCabinetSpinePeerStrip';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';
import { usePillarSnapshot } from '@/hooks/use-pillar-snapshot';
import {
  pickCommsSnapshot,
  pickOrderProductionSnapshot,
} from '@/lib/platform-core-pillar-snapshot.types';
import {
  formatWholesaleOrderDisplayId,
  isIntegrationImportedWholesaleOrderId,
  wholesaleOrderKindLabelRu,
} from '@/lib/integrations/spine/integration-ui-utils';
import { usePlatformCoreChainStatusPushEnabled } from '@/hooks/use-platform-core-chain-status-push-enabled';
import { usePlatformCoreChainStatusPoll } from '@/hooks/use-platform-core-chain-status-poll';
import { usePlatformCoreAuditUi } from '@/hooks/use-platform-core-audit-ui';
import { shouldSuppressHubCabinetChainStatusBadge } from '@/lib/platform-core-ports/platform/wave-yt-hub-noise-pass2';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { PillarInsightHeader } from '@/components/platform/PillarInsightPrimitives';
import { PlatformCorePillarInsightSkeleton } from '@/components/platform/PlatformCorePillarInsightSkeleton';
import { cn } from '@/lib/utils';
import {
  isPlatformCoreCommsNotesSection,
  listPlatformCoreNotes,
  platformCoreCommsNotesHref,
} from '@/lib/platform-core-notes';
import { CommsPlatformNotesPanel } from '@/components/platform/CommsPlatformNotesPanel';

/**
 * Comms pillar card — единая точка чата/календаря/групп (канон: platform-core-comms-canon.ts).
 * Deep-link из других столпов — context strip only, не дублирующие разделы.
 */
type Props = {
  variant: 'brand' | 'shop' | 'manufacturer' | 'supplier';
  /** @deprecated Hub всегда compact; prop сохранён для совместимости API. */
  compact?: boolean;
  minimalChrome?: boolean;
};

const linkClass =
  'border-border-subtle hover:bg-bg-surface2 inline-flex min-h-11 items-center gap-1 rounded-md border px-3 py-2 text-[13px] font-medium md:min-h-0 md:px-2 md:py-1 md:text-[11px]';

export function CommsPillarCardExtended({
  variant,
  compact = false,
  minimalChrome = false,
}: Props) {
  const demo = usePlatformCoreDemoContext();
  const searchParams = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  const notesView = isPlatformCoreCommsNotesSection(sectionFromUrl, variant);
  const notesHref = platformCoreCommsNotesHref(variant, demo);
  const { demoOrderId: fallbackOrderId, collectionId, demoArticleId, factoryId } = demo;
  const w2Fallback = fallbackOrderId.startsWith('__') ? '' : fallbackOrderId;
  const { buyerId } = useShopCoreBuyerId();
  const emptyChain = isPlatformCoreEmptyChainCollection(collectionId);
  const commsRoleKey =
    variant === 'manufacturer' ? 'manufacturer' : variant === 'supplier' ? 'supplier' : variant;
  const [notesOpenCount, setNotesOpenCount] = useState(0);
  useEffect(() => {
    const reload = () => {
      setNotesOpenCount(
        listPlatformCoreNotes(collectionId, commsRoleKey).filter((n) => n.status === 'open').length
      );
    };
    reload();
    window.addEventListener('platform-core-notes-changed', reload);
    return () => window.removeEventListener('platform-core-notes-changed', reload);
  }, [collectionId, commsRoleKey]);
  const showNavStrips = compact && !minimalChrome;
  const spineResolveFrom =
    variant === 'shop'
      ? (['w2_registry', 'allocation', 'operational'] as const)
      : variant === 'brand'
        ? (['w2_registry', 'handoff', 'allocation', 'operational'] as const)
        : (['w2_registry', 'handoff', 'allocation'] as const);
  const { activeOrderId: orderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: w2Fallback,
    collectionId,
    resolveFrom: spineResolveFrom,
    actorRole: variant === 'shop' ? 'shop' : variant === 'brand' ? 'brand' : undefined,
    factoryId: variant === 'manufacturer' || variant === 'supplier' ? factoryId : undefined,
    buyerId: variant === 'shop' ? buyerId : undefined,
    enabled: !emptyChain,
  });
  const canonicalDemoOrderId = getPlatformCoreDemo(collectionId).demoOrderId;
  const cabinetOrderId = resolvePlatformCoreCabinetOrderId(orderId, canonicalDemoOrderId);
  const isFactory = variant === 'manufacturer' || variant === 'supplier';
  const pgCabinet: PgContextualThreadsCabinet =
    variant === 'shop' ? 'shop' : variant === 'brand' ? 'brand' : 'factory';
  const {
    totalUnread: pgUnreadTotal,
    sseConnected: commsSseLive,
    unreadByChat,
    threads,
  } = usePgCommunicationsUnread(pgCabinet, !emptyChain);
  const readerId = usePgContextualActorId(pgCabinet);
  const threadsSource = usePlatformCoreCommsThreadsSource(pgContextualThreadsApiPath(pgCabinet));
  const commsMemoryBlocked = !emptyChain && threadsSource === 'memory';
  const auditUi = usePlatformCoreAuditUi();
  const suppressChainBadge = shouldSuppressHubCabinetChainStatusBadge({ compact, auditUi });
  const chainPushEnabled = usePlatformCoreChainStatusPushEnabled(variant);
  const chainPollOrderIds = cabinetOrderId.trim() ? [cabinetOrderId] : [];
  const { sseConnected: chainSseConnected, tick: chainPollTick } = usePlatformCoreChainStatusPoll(
    chainPushEnabled && chainPollOrderIds.length > 0,
    chainPollOrderIds
  );

  const { snapshot, loading: snapshotLoading } = usePillarSnapshot({
    collectionId,
    pillarId: 'comms',
    roleId: variant,
    wholesaleOrderId: orderId || undefined,
    factoryId: isFactory ? factoryId : undefined,
    enabled: !emptyChain,
  });
  const comms = pickCommsSnapshot(snapshot);
  const { snapshot: supplierOpSnapshot } = usePillarSnapshot({
    collectionId,
    pillarId: 'order_production',
    roleId: 'supplier',
    wholesaleOrderId: cabinetOrderId || undefined,
    factoryId,
    enabled: variant === 'supplier' && !emptyChain && Boolean(cabinetOrderId.trim()),
    reloadNonce: chainPollTick,
  });
  const supplierOp = pickOrderProductionSnapshot(supplierOpSnapshot);
  const supplierChainSteps = supplierOp?.chainSteps ?? [];
  const supplierMaterialsSuppliedDone =
    supplierChainSteps.find((s) => s.id === 'materials_supplied')?.done === true;
  const supplierProductionPoDone =
    supplierChainSteps.find((s) => s.id === 'production_po')?.done === true;
  const supplierMaterialsPending =
    supplierProductionPoDone && !supplierMaterialsSuppliedDone && Boolean(cabinetOrderId.trim());
  const threadCount = emptyChain ? 0 : (comms?.commsThreadCount ?? null);
  const calendarEventCount = emptyChain ? 0 : (comms?.calendarEventCount ?? null);
  const deliveryWindowCount = comms?.deliveryWindowCount ?? 0;

  const messagesHref = (() => {
    if (variant === 'shop') return shopMessagesB2bOrderContextHref(cabinetOrderId);
    if (variant === 'brand') return brandMessagesB2bOrderContextHref(cabinetOrderId);
    if (variant === 'supplier') return factorySupplierMessagesB2bOrderContextHref(cabinetOrderId);
    return factoryMessagesB2bOrderContextHref(cabinetOrderId, { role: 'manufacturer' });
  })();
  const calendarHref = (() => {
    if (variant === 'shop') return shopCalendarB2bOrderContextHref(cabinetOrderId);
    if (variant === 'brand') return brandCalendarB2bOrderContextHref(cabinetOrderId);
    if (variant === 'supplier') return factorySupplierCalendarB2bOrderContextHref(cabinetOrderId);
    return factoryCalendarB2bOrderContextHref(cabinetOrderId);
  })();
  const poHref = factoryHandoffQueueHrefForDemo({ ...demo, demoOrderId: cabinetOrderId });
  const inboxAllHref =
    variant === 'shop'
      ? ROUTES.shop.messages
      : variant === 'brand'
        ? ROUTES.brand.messages
        : factoryMessagesRoleHref(variant === 'supplier' ? 'supplier' : 'manufacturer');
  const articleChatHref = (() => {
    if (variant === 'brand') {
      return brandMessagesWorkshop2ArticleContextHref(collectionId, demoArticleId);
    }
    if (variant === 'shop') {
      return shopMessagesWorkshop2ArticleContextHref(collectionId, demoArticleId);
    }
    if (variant === 'supplier') {
      return factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, demoArticleId);
    }
    return factoryMessagesWorkshop2ArticleContextHref(collectionId, demoArticleId, {
      role: 'manufacturer',
    });
  })();

  const unreadSuffix = pgUnreadTotal > 0 ? ` · ${pgUnreadTotal} непрочит.` : '';
  const spineActive = isIntegrationImportedWholesaleOrderId(orderId);
  const statusLine = emptyChain
    ? 'Нет тредов.'
    : compact
      ? null
      : threadCount != null
        ? `${threadCount} тредов · ${calendarEventCount ?? 0} календарь${unreadSuffix}`
        : `Чат · календарь${unreadSuffix}`;

  const unreadBadge =
    pgUnreadTotal > 0 ? (
      <span
        data-testid="comms-pillar-unread-badge"
        className="bg-accent-primary ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
      >
        {pgUnreadTotal}
      </span>
    ) : null;

  const orderChatTestId =
    variant === 'brand'
      ? 'brand-cm-order-chat-link'
      : variant === 'shop'
        ? 'shop-cm-order-chat-link'
        : variant === 'supplier'
          ? 'sup-cm-order-chat-link'
          : 'mfr-cm-order-chat-link';
  const articleChatTestId =
    variant === 'brand'
      ? 'brand-cm-article-chat-link'
      : variant === 'shop'
        ? 'shop-cm-article-chat-link'
        : variant === 'supplier'
          ? 'sup-cm-article-chat-link'
          : 'mfr-cm-article-chat-link';
  const calendarTestId =
    variant === 'brand'
      ? 'brand-cm-calendar-link'
      : variant === 'shop'
        ? 'shop-cm-calendar-link'
        : variant === 'supplier'
          ? 'sup-cm-calendar-link'
          : 'mfr-cm-calendar-link';

  const notesTestId =
    variant === 'brand'
      ? 'brand-cm-notes-link'
      : variant === 'shop'
        ? 'shop-cm-notes-link'
        : variant === 'supplier'
          ? 'sup-cm-notes-link'
          : 'mfr-cm-notes-link';

  const notesNavBadge =
    notesOpenCount > 0 ? (
      <span
        className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-white"
        data-testid="comms-pillar-notes-open-badge"
      >
        {notesOpenCount}
      </span>
    ) : null;

  const commsNavTabs = [
    {
      href: messagesHref,
      label: 'Чат',
      testId: orderChatTestId,
      icon: MessageSquare,
      badge: unreadBadge,
    },
    {
      href: calendarHref,
      label: 'Календарь',
      testId: calendarTestId,
      icon: Calendar,
    },
    {
      href: notesHref,
      label: 'Заметки',
      testId: notesTestId,
      icon: StickyNote,
      badge: notesNavBadge,
    },
  ];

  const commsBottomTabs = commsNavTabs;

  const notesPanel = (
    <CommsPlatformNotesPanel
      variant={variant}
      collectionId={collectionId}
      orderId={cabinetOrderId || undefined}
    />
  );

  const threadStrip = (
    <CommsPillarThreadStrip
      variant={variant}
      collectionId={collectionId}
      orderId={cabinetOrderId}
      disabled={emptyChain || commsMemoryBlocked}
      compact={compact}
      minimalChrome={minimalChrome}
    />
  );

  if (compact && snapshotLoading && !comms && !emptyChain) {
    return (
      <PlatformCorePillarInsightSkeleton testId={`${variant}-comms-pillar-insight-skeleton`} />
    );
  }

  return (
    <Card
      data-testid="comms-pillar-card"
      className={cn(compact ? hubGadget.pillarCard : 'border-sky-200/50')}
    >
      <CardContent className={cn(compact ? hubGadget.pillarBody : 'space-y-2 p-3 text-xs')}>
        {minimalChrome && compact && !emptyChain ? (
          <CommsCabinetSplitProvider>
            <CommsCabinetSplitLayout
              tabs={commsNavTabs}
              bottomTabs={commsBottomTabs}
              threadStrip={threadStrip}
              mainPanel={notesView ? notesPanel : undefined}
              threadPreview={
                notesView ? null : (
                  <CommsCabinetThreadPreview
                    variant={variant}
                    collectionId={collectionId}
                    orderId={cabinetOrderId}
                    disabled={emptyChain || commsMemoryBlocked}
                  />
                )
              }
              groupsPanel={null}
              notificationsPanel={null}
            />
          </CommsCabinetSplitProvider>
        ) : null}
        {compact && !minimalChrome ? (
          <PillarInsightHeader
            icon={MessageSquare}
            title="Связь"
            subtitle="Чат, календарь и заметки по заказу."
          />
        ) : null}
        {compact && !emptyChain && cabinetOrderId && !minimalChrome && !suppressChainBadge ? (
          <PlatformCoreChainStatusRefreshBadge
            sseConnected={chainSseConnected}
            enabled={chainPushEnabled}
            variant="dot"
            sseTestId="comms-pillar-sse-live-badge"
            pollTestId={
              variant === 'brand'
                ? 'brand-cm-cabinet-poll-badge'
                : variant === 'shop'
                  ? 'shop-cm-cabinet-poll-badge'
                  : variant === 'manufacturer'
                    ? 'mfr-cm-cabinet-poll-badge'
                    : 'sup-cm-cabinet-poll-badge'
            }
          />
        ) : null}
        {statusLine ? (
          <p className={compact ? hubGadget.muted : 'text-text-secondary'}>{statusLine}</p>
        ) : null}
        {commsMemoryBlocked ? (
          <p
            className="rounded-md border border-amber-200 bg-amber-50/90 p-2 text-[11px] leading-relaxed text-amber-950"
            data-testid={`comms-pillar-fail-closed-${variant}`}
            role="alert"
          >
            <span className="font-semibold">Сообщения недоступны.</span>{' '}
            {PLATFORM_CORE_MESSAGES_UNAVAILABLE_RU}
          </p>
        ) : null}
        {!compact && spineActive ? (
          <Badge variant="outline" className="font-mono text-[9px]">
            {wholesaleOrderKindLabelRu(orderId)} · {formatWholesaleOrderDisplayId(orderId)}
          </Badge>
        ) : null}
        {!compact && spineActive && deliveryWindowCount > 0 ? (
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-[9px] text-sky-900"
            data-testid="comms-pillar-delivery-window-badge"
          >
            Окна поставки · {deliveryWindowCount}
          </Badge>
        ) : null}
        {!compact && !emptyChain ? (
          <PlatformCoreChainStatusRefreshBadge
            sseConnected={chainSseConnected}
            enabled={chainPushEnabled}
            sseTestId="comms-pillar-sse-live-badge"
            pollTestId={
              variant === 'brand'
                ? 'brand-cm-cabinet-poll-badge'
                : variant === 'shop'
                  ? 'shop-cm-cabinet-poll-badge'
                  : variant === 'manufacturer'
                    ? 'mfr-cm-cabinet-poll-badge'
                    : 'sup-cm-cabinet-poll-badge'
            }
          />
        ) : null}
        {!minimalChrome && notesView ? notesPanel : null}
        {!minimalChrome ? threadStrip : null}
        {!commsMemoryBlocked && !minimalChrome ? (
          <CommsSectionGroupsPicker
            variant={variant}
            collectionId={collectionId}
            orderId={orderId}
            disabled={emptyChain}
            unreadByChat={unreadByChat}
            threads={threads}
            readerId={readerId}
          />
        ) : null}
        {!commsMemoryBlocked && !minimalChrome ? (
          <CommsSectionContextAutoThread
            variant={variant}
            collectionId={collectionId}
            orderId={orderId}
            disabled={emptyChain || !orderId}
            readerId={readerId}
          />
        ) : null}
        {!compact && !emptyChain && orderId && !commsMemoryBlocked ? (
          <CommsNotificationCenterStrip
            variant={variant}
            collectionId={collectionId}
            orderId={orderId}
          />
        ) : null}
        {compact && !emptyChain && orderId && !commsMemoryBlocked && !minimalChrome ? (
          <CommsNotificationCenterStrip
            variant={variant}
            collectionId={collectionId}
            orderId={orderId}
            compact
          />
        ) : null}
        {variant === 'supplier' && !emptyChain && orderId && !minimalChrome ? (
          <SupplierMaterialQuoteCard orderId={orderId} />
        ) : null}
        {variant === 'supplier' && !emptyChain && orderId && !minimalChrome ? (
          <SupplierCommsBrandPushStrip
            collectionId={collectionId}
            articleId={demoArticleId}
            orderId={orderId}
          />
        ) : null}
        {variant === 'supplier' && !emptyChain && cabinetOrderId && !minimalChrome ? (
          <SupplierCommsChainMaterialsPushStrip
            orderId={cabinetOrderId}
            materialsDone={supplierMaterialsSuppliedDone}
            materialsPending={supplierMaterialsPending}
            handedOff={supplierProductionPoDone}
            sseConnected={chainSseConnected}
            refreshTick={chainPollTick}
          />
        ) : null}
        {variant === 'supplier' && !emptyChain && !minimalChrome ? (
          <SupplierCommsCrmPeerStrip collectionId={collectionId} orderId={orderId || undefined} />
        ) : null}
        {variant === 'supplier' && !emptyChain && !minimalChrome && auditUi ? (
          <SupplierArticleDevQuoteHonestStrip />
        ) : null}
        {variant === 'manufacturer' && !emptyChain && !minimalChrome ? (
          <ManufacturerUnifiedPoInboxStrip compact={compact} />
        ) : null}
        {variant === 'manufacturer' && !emptyChain && !minimalChrome ? (
          <ManufacturerArticleAttachTzPeerStrip
            collectionId={collectionId}
            articleId={demoArticleId}
          />
        ) : null}
        {(variant === 'brand' || variant === 'shop') &&
        !emptyChain &&
        !minimalChrome &&
        (!compact || auditUi) ? (
          <PlatformCoreRegistryStreamHealthStrip
            variant={variant}
            orderId={orderId}
            testIdPrefix={variant === 'brand' ? 'brand-cm-cabinet' : 'shop-cm-cabinet'}
          />
        ) : null}
        {showNavStrips && variant === 'brand' && !emptyChain ? (
          <BrandCmCabinetSpinePeerStrip
            collectionId={collectionId}
            orderId={orderId || undefined}
          />
        ) : null}
        {showNavStrips && variant === 'shop' && !emptyChain ? (
          <ShopCmCabinetSpinePeerStrip collectionId={collectionId} orderId={orderId || undefined} />
        ) : null}
        {showNavStrips && variant === 'supplier' && !emptyChain ? (
          <SupCmCabinetSpinePeerStrip
            collectionId={collectionId}
            articleId={demoArticleId}
            orderId={orderId || undefined}
            factoryId={factoryId}
          />
        ) : null}
        {showNavStrips && variant === 'manufacturer' && !emptyChain ? (
          <MfrCmCabinetSpinePeerStrip
            collectionId={collectionId}
            orderId={orderId || undefined}
            factoryId={factoryId}
            articleId={demoArticleId}
          />
        ) : null}
        {!minimalChrome ? (
          <div className={hubGadget.ctaRow}>
            {compact ? (
              <>
                <Link
                  href={messagesHref}
                  className={hubGadget.ctaLink}
                  data-testid={orderChatTestId}
                >
                  <MessageSquare className="h-3 w-3" aria-hidden />
                  Чат
                </Link>
                <Link
                  href={calendarHref}
                  className={hubGadget.ctaLink}
                  data-testid={calendarTestId}
                  data-audit-legacy="comms-pillar-calendar"
                >
                  <Calendar className="h-3 w-3" aria-hidden />
                  Календарь
                  {calendarEventCount != null && calendarEventCount > 0 ? (
                    <span
                      className="ml-0.5 font-mono text-[10px] tabular-nums opacity-80"
                      data-testid={`${calendarTestId.replace('-link', '')}-events-count`}
                    >
                      ·{calendarEventCount}
                    </span>
                  ) : null}
                </Link>
                <Link href={notesHref} className={hubGadget.ctaLink} data-testid={notesTestId}>
                  <StickyNote className="h-3 w-3" aria-hidden />
                  Заметки
                  {notesOpenCount > 0 ? (
                    <span className="ml-0.5 font-mono text-[10px] tabular-nums opacity-80">
                      ·{notesOpenCount}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href={inboxAllHref}
                  data-testid="comms-pillar-inbox-all"
                  className={hubGadget.ctaLink}
                >
                  Все сообщения
                  {unreadBadge}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={messagesHref}
                  className={hubGadget.ctaLink}
                  data-testid={orderChatTestId}
                >
                  <MessageSquare className="h-3 w-3" aria-hidden />
                  Чат
                </Link>
                <Link
                  href={calendarHref}
                  className={hubGadget.ctaLink}
                  data-testid={calendarTestId}
                  data-audit-legacy="comms-pillar-calendar"
                >
                  <Calendar className="h-3 w-3" aria-hidden />
                  Календарь
                  {calendarEventCount != null && calendarEventCount > 0 ? (
                    <span
                      className="ml-0.5 font-mono text-[9px] tabular-nums opacity-80"
                      data-testid={`${calendarTestId.replace('-link', '')}-events-count`}
                    >
                      ·{calendarEventCount}
                    </span>
                  ) : null}
                </Link>
                <Link href={notesHref} className={linkClass} data-testid={notesTestId}>
                  <StickyNote className="h-3 w-3" aria-hidden />
                  Заметки
                </Link>
                {!compact && !emptyChain ? (
                  <Link
                    href={articleChatHref}
                    data-testid={articleChatTestId}
                    data-audit-legacy="comms-pillar-article-chat-compact"
                    className={linkClass}
                  >
                    <MessageSquare className="h-3 w-3" aria-hidden />
                    Чат · артикул
                  </Link>
                ) : null}
                {!compact && variant === 'manufacturer' ? (
                  <Link
                    href={factorySupplierMessagesB2bOrderContextHref(orderId)}
                    data-testid="comms-pillar-supplier-thread-compact"
                    className={linkClass}
                  >
                    Поставщик
                  </Link>
                ) : null}
                {!compact && isFactory ? (
                  <Link
                    href={poHref}
                    data-testid="comms-pillar-handoff-queue-compact"
                    className={linkClass}
                  >
                    <ClipboardList className="h-3 w-3" aria-hidden />
                    Очередь передачи
                  </Link>
                ) : null}
                {!compact ? (
                  <Link
                    href={inboxAllHref}
                    data-testid="comms-pillar-inbox-all"
                    className={linkClass}
                  >
                    Все треды
                    {unreadBadge}
                  </Link>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
