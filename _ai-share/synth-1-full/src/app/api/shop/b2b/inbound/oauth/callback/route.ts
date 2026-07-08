import { NextRequest, NextResponse } from 'next/server';

import {
  buildWorkshop2B2bInboundCalendarStubEvent,
  buildWorkshop2B2bInboundDraftOrderFromOAuth,
  buildWorkshop2B2bOAuthInboundOrderPayload,
  consumeWorkshop2B2bOAuthState,
  exchangeWorkshop2B2bOAuthCode,
  exchangeWorkshop2B2bOAuthCodeStub,
  isWorkshop2B2bOAuthProdLiveReady,
  parseWorkshop2B2bOAuthState,
  resolveWorkshop2B2bOAuthInboundConfig,
  summarizeWorkshop2B2bOAuthInboundChatRu,
} from '@/lib/production/workshop2-b2b-oauth-inbound';
import { appendWorkshop2B2bOAuthCallbackJournal } from '@/lib/production/workshop2-b2b-oauth-rotation-journal';
import { putWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import { persistWorkshop2B2bInboundCalendarTask } from '@/lib/server/workshop2-b2b-inbound-calendar-persist';

/** GET — OAuth callback → draft order + chat b2b_oauth_inbound (fail-closed; live when prod env set). */
export async function GET(req: NextRequest) {
  const code = String(req.nextUrl.searchParams.get('code') ?? '').trim();
  const stateRaw = req.nextUrl.searchParams.get('state');
  const parsedState = parseWorkshop2B2bOAuthState(stateRaw);
  const provider = parsedState.provider;

  if (!code) {
    return NextResponse.json(
      { ok: false, messageRu: 'B2B OAuth callback: отсутствует authorization code.' },
      { status: 400 }
    );
  }

  if (parsedState.valid && parsedState.nonce) {
    const consumed = consumeWorkshop2B2bOAuthState(stateRaw ?? '');
    if (!consumed.valid) {
      return NextResponse.json(
        { ok: false, messageRu: 'B2B OAuth callback: state истёк или недействителен.' },
        { status: 400 }
      );
    }
  }

  const cfg = resolveWorkshop2B2bOAuthInboundConfig(undefined, provider);
  const prodLive = isWorkshop2B2bOAuthProdLiveReady();
  const exchanged =
    cfg.tokenUrl && prodLive
      ? await exchangeWorkshop2B2bOAuthCode({ code, provider })
      : exchangeWorkshop2B2bOAuthCodeStub({ code, provider });

  if (!exchanged.ok) {
    const status = 'httpStatus' in exchanged ? (exchanged.httpStatus ?? 503) : 503;
    return NextResponse.json(
      { ok: false, messageRu: exchanged.messageRu, httpStatus: status },
      { status }
    );
  }

  const externalOrderRef = exchanged.externalOrderRef;
  const live = 'live' in exchanged ? Boolean(exchanged.live) : false;
  const joorOrderId = 'joorOrderId' in exchanged ? exchanged.joorOrderId : undefined;

  const payload = buildWorkshop2B2bOAuthInboundOrderPayload({
    externalOrderRef,
    provider,
    joorOrderId,
  });
  const order = buildWorkshop2B2bInboundDraftOrderFromOAuth(payload);
  const persist = await putWorkshop2B2bOrder(order);
  const calendarStub = buildWorkshop2B2bInboundCalendarStubEvent(order, externalOrderRef);
  const calendarPersist =
    persist.mode !== 'pg_only_blocked'
      ? await persistWorkshop2B2bInboundCalendarTask({ stub: calendarStub, order })
      : { ok: false, mode: 'failed' as const };
  const persistMode = persist.mode === 'pg_only_blocked' ? 'journal_only' : persist.mode;

  appendWorkshop2B2bOAuthCallbackJournal({
    provider,
    externalOrderRef,
    orderId: order.id,
    live,
    joorOrderId,
  });

  void enqueueWorkshop2DomainEvent({
    type: 'b2b.oauth_inbound.received',
    collectionId: order.collectionId ?? 'SS27',
    articleId: order.articleId ?? 'demo-ss27-01',
    payload: {
      externalOrderRef,
      joorOrderId,
      orderId: order.id,
      provider,
      persistMode,
      live,
      chatEvent: 'b2b_oauth_inbound',
      messageRu: summarizeWorkshop2B2bOAuthInboundChatRu({
        externalOrderRef,
        orderId: order.id,
        provider,
        persistMode,
        live,
        joorOrderId,
      }),
    },
    dispatchNow: true,
  }).catch(() => {
    /* best-effort */
  });

  return NextResponse.json({
    ok: true,
    provider,
    live,
    prodLiveReady: prodLive,
    journalOnly: persistMode === 'journal_only',
    orderId: order.id,
    externalOrderRef,
    joorOrderId,
    persistMode,
    calendarStub,
    calendarPersistMode: calendarPersist.mode,
    chatEvent: 'b2b_oauth_inbound',
    messageRu: summarizeWorkshop2B2bOAuthInboundChatRu({
      externalOrderRef,
      orderId: order.id,
      provider,
      persistMode,
      live,
      joorOrderId,
    }),
  });
}
