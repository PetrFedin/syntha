import { randomUUID } from 'node:crypto';

import {
  getOrderAmendmentResponseRepository,
  getRevisedOrderReviewRepository,
  type RevisedConfirmedOrderVersion,
  type RevisedOrderReview,
  type RevisedOrderVersion,
} from '@/modules/orders';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';
import { Badge, Icon } from '@/shared/ui';
import {
  approveRevisedOrderAction,
  confirmRevisedOrderAction,
  requestRevisedOrderAmendmentAction,
} from '@/shared/workspace/revised-order-review-actions';

interface RevisedReviewData {
  readonly organisationId: string;
  readonly sellerRevised: readonly RevisedOrderVersion[];
  readonly sellerReviews: readonly RevisedOrderReview[];
  readonly buyerReviews: readonly RevisedOrderReview[];
  readonly sellerConfirmed: readonly RevisedConfirmedOrderVersion[];
  readonly buyerConfirmed: readonly RevisedConfirmedOrderVersion[];
}

type LoadResult =
  | Readonly<{ readonly ok: true; readonly data: RevisedReviewData }>
  | Readonly<{ readonly ok: false; readonly error: unknown }>;

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

async function loadData(): Promise<LoadResult> {
  try {
    const access = await requireWorkspaceAccess('read');
    const [responseRepository, reviewRepository] = await Promise.all([
      getOrderAmendmentResponseRepository(),
      getRevisedOrderReviewRepository(),
    ]);
    const [sellerRevised, sellerReviews, buyerReviews, sellerConfirmed, buyerConfirmed] =
      await Promise.all([
        responseRepository.listRevisedForSeller(access.organisationId),
        reviewRepository.listReviewsForSeller(access.organisationId),
        reviewRepository.listReviewsForBuyer(access.organisationId),
        reviewRepository.listConfirmedForSeller(access.organisationId),
        reviewRepository.listConfirmedForBuyer(access.organisationId),
      ]);
    return Object.freeze({
      ok: true,
      data: Object.freeze({
        organisationId: access.organisationId,
        sellerRevised,
        sellerReviews,
        buyerReviews,
        sellerConfirmed,
        buyerConfirmed,
      }),
    });
  } catch (error) {
    return Object.freeze({ ok: false, error });
  }
}

function ControlledState({ error }: { readonly error: unknown }) {
  const apiError = error instanceof CommercialApiError ? error : null;
  return (
    <section className="workspaceState" data-testid="revised-review-controlled-state">
      <Icon name={apiError?.status === 403 ? 'settings' : 'clock'} size={28} />
      <h2>Seller re-review недоступен</h2>
      <p>
        Для повторного согласования требуется разрешённый organisation scope.
        Revised Order и все предшествующие факты остаются неизменными.
      </p>
    </section>
  );
}

function SourceCard({ revised }: { readonly revised: RevisedOrderVersion }) {
  const firstLine = revised.lines[0];
  const firstSize = firstLine?.sizeQuantities[0];
  return (
    <article className="lifecycleEntityCard" data-testid="seller-revised-review-source-card">
      <div className="lifecycleEntityHeader">
        <div><span>{revised.id}</span><h3>{revised.orderId}</h3></div>
        <Badge tone="accent">RE-REVIEW REQUIRED</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Buyer response</dt><dd>{revised.orderAmendmentResponseId}</dd></div>
        <div><dt>Revision kind</dt><dd>{revised.revisionKind}</dd></div>
        <div><dt>Quantity</dt><dd>{revised.totals.quantity}</dd></div>
        <div><dt>Total</dt><dd>{formatMoney(revised.totals.totalMinor, revised.currency)}</dd></div>
      </dl>
      <form action={approveRevisedOrderAction} className="showroomInlineAction" data-testid="approve-revised-order-form">
        <input name="versionId" type="hidden" value={revised.id} />
        <input name="expectedVersion" type="hidden" value="0" />
        <input name="idempotencyKey" type="hidden" value={`approve-revised-ui-${randomUUID()}`} />
        <button className="button button--primary" type="submit">Одобрить Revised Order</button>
      </form>
      {firstLine && firstSize ? (
        <form action={requestRevisedOrderAmendmentAction} className="lifecycleForm" data-testid="request-revised-amendment-form">
          <input name="versionId" type="hidden" value={revised.id} />
          <input name="expectedVersion" type="hidden" value="0" />
          <input name="idempotencyKey" type="hidden" value={`request-revised-ui-${randomUUID()}`} />
          <input name="lineId" type="hidden" value={firstLine.id} />
          <div className="lifecycleFormRow">
            <label><span>Причина</span><input name="reason" required defaultValue="Требуется ещё одна корректировка" /></label>
            <label><span>Размер</span><input name="size" required defaultValue={firstSize.size} /></label>
            <label><span>Количество</span><input name="quantity" type="number" min={0} required defaultValue={firstSize.quantity} /></label>
          </div>
          <button className="button button--secondary" type="submit">Запросить следующую revision</button>
        </form>
      ) : null}
    </article>
  );
}

function ReviewCard({
  review,
  perspective,
}: {
  readonly review: RevisedOrderReview;
  readonly perspective: 'buyer' | 'seller';
}) {
  return (
    <article className="lifecycleEntityCard" data-testid={`${perspective}-revised-order-review-card`}>
      <div className="lifecycleEntityHeader">
        <div><span>{review.id}</span><h3>{review.revisedOrderVersionId}</h3></div>
        <Badge tone={review.status === 'AMENDMENT_REQUESTED' ? 'neutral' : 'success'}>
          {review.status}
        </Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Order</dt><dd>{review.orderId}</dd></div>
        <div><dt>Response</dt><dd>{review.orderAmendmentResponseId}</dd></div>
        <div><dt>Version</dt><dd>{review.version}</dd></div>
        <div><dt>Confirmed</dt><dd>{review.confirmedOrderVersionId ?? '—'}</dd></div>
      </dl>
      {review.amendmentRequest ? <p>{review.amendmentRequest.reason}</p> : null}
      {perspective === 'seller' && review.status === 'APPROVED' ? (
        <form action={confirmRevisedOrderAction} className="showroomInlineAction" data-testid="confirm-revised-order-form">
          <input name="reviewId" type="hidden" value={review.id} />
          <input name="expectedVersion" type="hidden" value={review.version} />
          <input name="idempotencyKey" type="hidden" value={`confirm-revised-ui-${randomUUID()}`} />
          <button className="button button--primary" type="submit">Зафиксировать Confirmed Order</button>
        </form>
      ) : null}
    </article>
  );
}

function ConfirmedCard({
  confirmed,
  perspective,
}: {
  readonly confirmed: RevisedConfirmedOrderVersion;
  readonly perspective: 'buyer' | 'seller';
}) {
  return (
    <article className="lifecycleEntityCard" data-testid={`${perspective}-revised-confirmed-order-card`}>
      <div className="lifecycleEntityHeader">
        <div><span>{confirmed.id}</span><h3>{confirmed.orderId}</h3></div>
        <Badge tone="success">CONFIRMED REVISION</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Revised Order</dt><dd>{confirmed.revisedOrderVersionId}</dd></div>
        <div><dt>Review</dt><dd>{confirmed.revisedOrderReviewId}</dd></div>
        <div><dt>Quantity</dt><dd>{confirmed.totals.quantity}</dd></div>
        <div><dt>Total</dt><dd>{formatMoney(confirmed.totals.totalMinor, confirmed.currency)}</dd></div>
      </dl>
    </article>
  );
}

export async function RevisedOrderReviewWorkspacePanel() {
  const result = await loadData();
  if (!result.ok) return <ControlledState error={result.error} />;
  const {
    organisationId,
    sellerRevised,
    sellerReviews,
    buyerReviews,
    sellerConfirmed,
    buyerConfirmed,
  } = result.data;
  const reviewedVersionIds = new Set(sellerReviews.map((review) => review.revisedOrderVersionId));
  const actionable = sellerRevised.filter((revised) => !reviewedVersionIds.has(revised.id));
  return (
    <section className="lifecycleWorkspace" data-testid="authoritative-revised-order-review">
      <div className="lifecycleSummary">
        <div><span>Active organisation</span><strong>{organisationId}</strong></div>
        <div><span>Seller actions</span><strong>{actionable.length}</strong></div>
        <div><span>Seller reviews</span><strong>{sellerReviews.length}</strong></div>
        <div><span>Buyer-visible reviews</span><strong>{buyerReviews.length}</strong></div>
        <div><span>Confirmed revisions</span><strong>{sellerConfirmed.length + buyerConfirmed.length}</strong></div>
        <Badge tone="accent">Production gate</Badge>
      </div>
      <article className="modulePanel">
        <p className="sectionEyebrow">Seller re-review</p>
        <h2>Production начинается только от подтверждённой revision</h2>
        <p>
          Одобрение и дополнительный amendment остаются взаимоисключающими.
          Confirmation создаёт отдельную immutable версию с полной lineage.
        </p>
      </article>
      <div className="sectionHeader"><div><p className="sectionEyebrow">Seller actions</p><h2>Проверить Revised Order</h2></div></div>
      {actionable.length === 0 ? <p className="lifecycleEmpty">Нет новых Revised Orders для повторной проверки.</p> : null}
      <div className="lifecycleEntityList">
        {actionable.map((revised) => <SourceCard key={revised.id} revised={revised} />)}
      </div>
      <div className="lifecycleWorkspaceGrid">
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Seller history</p><h2>Re-review и confirmation</h2></div></div>
          <div className="lifecycleEntityList">
            {sellerReviews.map((review) => <ReviewCard key={review.id} review={review} perspective="seller" />)}
            {sellerConfirmed.map((confirmed) => <ConfirmedCard key={confirmed.id} confirmed={confirmed} perspective="seller" />)}
          </div>
        </div>
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Buyer history</p><h2>Решения по revision</h2></div></div>
          <div className="lifecycleEntityList">
            {buyerReviews.map((review) => <ReviewCard key={review.id} review={review} perspective="buyer" />)}
            {buyerConfirmed.map((confirmed) => <ConfirmedCard key={confirmed.id} confirmed={confirmed} perspective="buyer" />)}
          </div>
        </div>
      </div>
    </section>
  );
}
