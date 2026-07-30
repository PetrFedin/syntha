import { randomUUID } from 'node:crypto';

import {
  getOrderAmendmentResponseRepository,
  getOrderReviewRepository,
  type OrderAmendmentResponse,
  type OrderReview,
  type RevisedOrderVersion,
} from '@/modules/orders';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';
import { Badge, Icon } from '@/shared/ui';
import {
  acceptOrderAmendmentAction,
  counterOrderAmendmentAction,
  rejectOrderAmendmentAction,
} from '@/shared/workspace/order-amendment-response-actions';

interface NegotiationData {
  readonly organisationId: string;
  readonly buyerReviews: readonly OrderReview[];
  readonly buyerResponses: readonly OrderAmendmentResponse[];
  readonly sellerResponses: readonly OrderAmendmentResponse[];
  readonly buyerRevised: readonly RevisedOrderVersion[];
  readonly sellerRevised: readonly RevisedOrderVersion[];
}

type NegotiationLoadResult =
  | Readonly<{ readonly ok: true; readonly data: NegotiationData }>
  | Readonly<{ readonly ok: false; readonly error: unknown }>;

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

async function loadNegotiationData(): Promise<NegotiationLoadResult> {
  try {
    const access = await requireWorkspaceAccess('read');
    const [reviewRepository, responseRepository] = await Promise.all([
      getOrderReviewRepository(),
      getOrderAmendmentResponseRepository(),
    ]);
    const [
      buyerReviews,
      buyerResponses,
      sellerResponses,
      buyerRevised,
      sellerRevised,
    ] = await Promise.all([
      reviewRepository.listReviewsForBuyer(access.organisationId),
      responseRepository.listResponsesForBuyer(access.organisationId),
      responseRepository.listResponsesForSeller(access.organisationId),
      responseRepository.listRevisedForBuyer(access.organisationId),
      responseRepository.listRevisedForSeller(access.organisationId),
    ]);
    return Object.freeze({
      ok: true,
      data: Object.freeze({
        organisationId: access.organisationId,
        buyerReviews,
        buyerResponses,
        sellerResponses,
        buyerRevised,
        sellerRevised,
      }),
    });
  } catch (error) {
    return Object.freeze({ ok: false, error });
  }
}

function ControlledState({ error }: { readonly error: unknown }) {
  const apiError = error instanceof CommercialApiError ? error : null;
  return (
    <section className="workspaceState" data-testid="amendment-response-controlled-state">
      <Icon name={apiError?.status === 403 ? 'settings' : 'clock'} size={28} />
      <h2>Buyer response недоступен</h2>
      <p>
        Для просмотра и фиксации ответа требуется разрешённый organisation scope.
        Исходные Submitted Order и seller amendment request остаются неизменными.
      </p>
    </section>
  );
}

function ResponseForms({ review }: { readonly review: OrderReview }) {
  const change = review.amendmentRequest?.lineChanges[0];
  const sizeChange = change?.sizeQuantities?.[0];
  if (!review.amendmentRequest) return null;
  return (
    <article className="lifecycleEntityCard" data-testid="buyer-amendment-response-card">
      <div className="lifecycleEntityHeader">
        <div><span>{review.id}</span><h3>{review.orderId}</h3></div>
        <Badge tone="accent">ACTION REQUIRED</Badge>
      </div>
      <p><strong>{review.amendmentRequest.reason}</strong></p>
      <dl className="lifecycleMeta">
        <div><dt>Snapshot</dt><dd>{review.submittedOrderSnapshotId}</dd></div>
        <div><dt>Seller</dt><dd>{review.sellerOrganisationId}</dd></div>
        <div><dt>Review version</dt><dd>{review.version}</dd></div>
        <div><dt>Changed lines</dt><dd>{review.amendmentRequest.lineChanges.length}</dd></div>
      </dl>
      <form action={acceptOrderAmendmentAction} className="showroomInlineAction" data-testid="accept-amendment-form">
        <input name="reviewId" type="hidden" value={review.id} />
        <input name="expectedReviewVersion" type="hidden" value={review.version} />
        <input name="idempotencyKey" type="hidden" value={`accept-amendment-ui-${randomUUID()}`} />
        <button className="button button--primary" type="submit">Принять изменения</button>
      </form>
      <form action={rejectOrderAmendmentAction} className="lifecycleForm" data-testid="reject-amendment-form">
        <input name="reviewId" type="hidden" value={review.id} />
        <input name="expectedReviewVersion" type="hidden" value={review.version} />
        <input name="idempotencyKey" type="hidden" value={`reject-amendment-ui-${randomUUID()}`} />
        <label>
          <span>Причина отказа</span>
          <input name="reason" required defaultValue="Сохраняем исходные коммерческие условия" />
        </label>
        <button className="button button--secondary" type="submit">Отклонить изменения</button>
      </form>
      {change && sizeChange ? (
        <form action={counterOrderAmendmentAction} className="lifecycleForm" data-testid="counter-amendment-form">
          <input name="reviewId" type="hidden" value={review.id} />
          <input name="expectedReviewVersion" type="hidden" value={review.version} />
          <input name="idempotencyKey" type="hidden" value={`counter-amendment-ui-${randomUUID()}`} />
          <input name="lineId" type="hidden" value={change.lineId} />
          <div className="lifecycleFormRow">
            <label><span>Причина counter</span><input name="reason" required defaultValue="Предлагаем встречные условия" /></label>
            <label><span>Размер</span><input name="size" required defaultValue={sizeChange.size} /></label>
            <label><span>Количество</span><input name="quantity" type="number" min={0} required defaultValue={sizeChange.quantity} /></label>
          </div>
          <div className="lifecycleFormRow">
            <label><span>Unit price, minor</span><input name="unitPriceMinor" type="number" min={0} required defaultValue={change.unitPriceMinor ?? 0} /></label>
            <label><span>Discount, bps</span><input name="discountBasisPoints" type="number" min={0} max={10000} required defaultValue={change.discountBasisPoints ?? 0} /></label>
            <label><span>Tax, bps</span><input name="taxBasisPoints" type="number" min={0} max={10000} required defaultValue={change.taxBasisPoints ?? 0} /></label>
          </div>
          <button className="button button--secondary" type="submit">Отправить counterproposal</button>
        </form>
      ) : null}
    </article>
  );
}

function ResponseCard({
  response,
  perspective,
}: {
  readonly response: OrderAmendmentResponse;
  readonly perspective: 'buyer' | 'seller';
}) {
  return (
    <article className="lifecycleEntityCard" data-testid={`${perspective}-amendment-response-card`}>
      <div className="lifecycleEntityHeader">
        <div><span>{response.id}</span><h3>{response.orderId}</h3></div>
        <Badge tone={response.decision === 'REJECTED' ? 'neutral' : 'success'}>
          {response.decision}
        </Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Review</dt><dd>{response.orderReviewId}</dd></div>
        <div><dt>Snapshot</dt><dd>{response.submittedOrderSnapshotId}</dd></div>
        <div><dt>Version</dt><dd>{response.version}</dd></div>
        <div><dt>Revised version</dt><dd>{response.revisedOrderVersionId ?? '—'}</dd></div>
      </dl>
      {response.reason ? <p>{response.reason}</p> : null}
    </article>
  );
}

function RevisedCard({
  revised,
  perspective,
}: {
  readonly revised: RevisedOrderVersion;
  readonly perspective: 'buyer' | 'seller';
}) {
  return (
    <article className="lifecycleEntityCard" data-testid={`${perspective}-revised-order-card`}>
      <div className="lifecycleEntityHeader">
        <div><span>{revised.id}</span><h3>{revised.orderId}</h3></div>
        <Badge tone="success">REVISED {revised.revisionKind}</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Response</dt><dd>{revised.orderAmendmentResponseId}</dd></div>
        <div><dt>Source version</dt><dd>{revised.sourceOrderVersion}</dd></div>
        <div><dt>Quantity</dt><dd>{revised.totals.quantity}</dd></div>
        <div><dt>Total</dt><dd>{formatMoney(revised.totals.totalMinor, revised.currency)}</dd></div>
      </dl>
    </article>
  );
}

export async function OrderAmendmentResponseWorkspacePanel() {
  const result = await loadNegotiationData();
  if (!result.ok) return <ControlledState error={result.error} />;
  const {
    organisationId,
    buyerReviews,
    buyerResponses,
    sellerResponses,
    buyerRevised,
    sellerRevised,
  } = result.data;
  const answeredReviewIds = new Set(buyerResponses.map((response) => response.orderReviewId));
  const actionableReviews = buyerReviews.filter(
    (review) =>
      review.status === 'AMENDMENT_REQUESTED' &&
      !answeredReviewIds.has(review.id),
  );
  return (
    <section className="lifecycleWorkspace" data-testid="authoritative-amendment-response">
      <div className="lifecycleSummary">
        <div><span>Active organisation</span><strong>{organisationId}</strong></div>
        <div><span>Action required</span><strong>{actionableReviews.length}</strong></div>
        <div><span>Buyer responses</span><strong>{buyerResponses.length}</strong></div>
        <div><span>Seller-visible responses</span><strong>{sellerResponses.length}</strong></div>
        <div><span>Revised versions</span><strong>{buyerRevised.length + sellerRevised.length}</strong></div>
        <Badge tone="accent">Immutable negotiation lineage</Badge>
      </div>
      <article className="modulePanel">
        <p className="sectionEyebrow">Amendment comparison</p>
        <h2>Buyer response создаёт новый факт, а не переписывает Order</h2>
        <p>
          Accept и counter создают immutable Revised Order. Reject фиксирует решение без новой версии.
          Submitted Order и seller request остаются источниками истории.
        </p>
      </article>
      <div className="sectionHeader"><div><p className="sectionEyebrow">Buyer actions</p><h2>Ответить на amendment request</h2></div></div>
      {actionableReviews.length === 0 ? <p className="lifecycleEmpty">Нет amendment requests без ответа.</p> : null}
      <div className="lifecycleEntityList">
        {actionableReviews.map((review) => <ResponseForms key={review.id} review={review} />)}
      </div>
      <div className="lifecycleWorkspaceGrid">
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Buyer history</p><h2>Зафиксированные ответы</h2></div></div>
          <div className="lifecycleEntityList">
            {buyerResponses.map((response) => <ResponseCard key={response.id} response={response} perspective="buyer" />)}
            {buyerRevised.map((revised) => <RevisedCard key={revised.id} revised={revised} perspective="buyer" />)}
          </div>
        </div>
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Seller history</p><h2>Полученные ответы и revisions</h2></div></div>
          <div className="lifecycleEntityList">
            {sellerResponses.map((response) => <ResponseCard key={response.id} response={response} perspective="seller" />)}
            {sellerRevised.map((revised) => <RevisedCard key={revised.id} revised={revised} perspective="seller" />)}
          </div>
        </div>
      </div>
    </section>
  );
}
