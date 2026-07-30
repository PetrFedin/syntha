import { randomUUID } from 'node:crypto';

import {
  getOrderRepository,
  getOrderReviewRepository,
  type ConfirmedOrderVersion,
  type OrderReview,
  type SubmittedOrderSnapshot,
} from '@/modules/orders';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';
import { Badge, Icon } from '@/shared/ui';
import {
  approveSubmittedOrderAction,
  confirmApprovedOrderAction,
  requestOrderAmendmentAction,
} from '@/shared/workspace/order-review-actions';

interface ConfirmationSearch {
  readonly notice?: string;
  readonly reviewId?: string;
}

interface ConfirmationData {
  readonly organisationId: string;
  readonly sellerSnapshots: readonly SubmittedOrderSnapshot[];
  readonly buyerSnapshots: readonly SubmittedOrderSnapshot[];
  readonly sellerReviews: readonly OrderReview[];
  readonly buyerReviews: readonly OrderReview[];
  readonly sellerConfirmed: readonly ConfirmedOrderVersion[];
  readonly buyerConfirmed: readonly ConfirmedOrderVersion[];
}

type ConfirmationLoadResult =
  | Readonly<{ readonly ok: true; readonly data: ConfirmationData }>
  | Readonly<{ readonly ok: false; readonly error: unknown }>;

const notices: Readonly<Record<string, string>> = Object.freeze({
  order_approved: 'Submitted Order одобрен продавцом.',
  order_approval_replayed: 'Повторная команда вернула исходное одобрение.',
  order_amendment_requested: 'Запрос на изменение отправлен покупателю.',
  order_amendment_replayed: 'Повторная команда вернула исходный запрос изменений.',
  order_confirmed: 'Создана неизменяемая подтверждённая версия заказа.',
  order_confirmation_replayed: 'Повторная команда вернула исходную подтверждённую версию.',
  review_idempotency_conflict: 'Idempotency-Key уже использован для другой команды.',
  review_source_not_found: 'Submitted Order не найден в seller scope.',
  review_not_found: 'Order review не найден.',
  review_exists: 'Для этого Submitted Order решение уже зафиксировано.',
  review_version_conflict: 'Review уже изменён другой операцией. Обновите страницу.',
  invalid_review_input: 'Проверьте причину, строку, размер и предложенные значения.',
  review_service_unavailable: 'Confirmation service временно недоступен; данные не изменены.',
});

const errorNotices = new Set([
  'review_idempotency_conflict',
  'review_source_not_found',
  'review_not_found',
  'review_exists',
  'review_version_conflict',
  'invalid_review_input',
  'review_service_unavailable',
]);

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSearch(
  searchParams: Record<string, string | string[] | undefined>,
): ConfirmationSearch {
  return Object.freeze({
    notice: first(searchParams.notice),
    reviewId: first(searchParams.reviewId),
  });
}

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function Notice({ notice }: { readonly notice?: string }) {
  if (!notice) return null;
  const isError = errorNotices.has(notice);
  return (
    <div className={`lifecycleNotice ${isError ? 'lifecycleNotice--error' : ''}`} role="status">
      <Icon name={isError ? 'help' : 'check'} size={18} />
      <span>{notices[notice] ?? notice}</span>
    </div>
  );
}

function AccessState({ error }: { readonly error: unknown }) {
  const apiError = error instanceof CommercialApiError ? error : null;
  return (
    <section className="workspaceState" data-testid="confirmation-controlled-state">
      <Icon name={apiError?.status === 403 ? 'settings' : 'clock'} size={28} />
      <h2>
        {apiError?.status === 403
          ? 'Недостаточно прав для подтверждения заказов'
          : apiError?.status === 401
            ? 'Требуется серверная авторизация'
            : 'Confirmation source временно недоступен'}
      </h2>
      <p>
        Без разрешённого organisation scope система не показывает коммерческие решения,
        amendment requests и подтверждённые версии.
      </p>
    </section>
  );
}

async function loadConfirmationData(): Promise<ConfirmationLoadResult> {
  try {
    const access = await requireWorkspaceAccess('read');
    const [orderRepository, reviewRepository] = await Promise.all([
      getOrderRepository(),
      getOrderReviewRepository(),
    ]);
    const [
      sellerSnapshots,
      buyerSnapshots,
      sellerReviews,
      buyerReviews,
      sellerConfirmed,
      buyerConfirmed,
    ] = await Promise.all([
      orderRepository.listSubmittedSnapshotsForSeller(access.organisationId),
      orderRepository.listSubmittedSnapshotsForBuyer(access.organisationId),
      reviewRepository.listReviewsForSeller(access.organisationId),
      reviewRepository.listReviewsForBuyer(access.organisationId),
      reviewRepository.listConfirmedForSeller(access.organisationId),
      reviewRepository.listConfirmedForBuyer(access.organisationId),
    ]);
    return Object.freeze({
      ok: true,
      data: Object.freeze({
        organisationId: access.organisationId,
        sellerSnapshots,
        buyerSnapshots,
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

function SnapshotDecisionCard({
  snapshot,
}: {
  readonly snapshot: SubmittedOrderSnapshot;
}) {
  const firstLine = snapshot.lines[0];
  const firstSize = firstLine?.sizeQuantities[0];
  return (
    <article className="lifecycleEntityCard" data-testid="pending-order-review-card">
      <div className="lifecycleEntityHeader">
        <div>
          <span>{snapshot.id}</span>
          <h3>{snapshot.orderId}</h3>
        </div>
        <Badge tone="neutral">PENDING REVIEW</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Buyer</dt><dd>{snapshot.buyerOrganisationId}</dd></div>
        <div><dt>Quantity</dt><dd>{snapshot.totals.quantity}</dd></div>
        <div><dt>Total</dt><dd>{formatMoney(snapshot.totals.totalMinor, snapshot.currency)}</dd></div>
        <div><dt>Submitted</dt><dd>{formatDate(snapshot.submittedAt)}</dd></div>
      </dl>
      <form action={approveSubmittedOrderAction} className="showroomInlineAction" data-testid="approve-order-form">
        <input name="snapshotId" type="hidden" value={snapshot.id} />
        <input name="expectedVersion" type="hidden" value="0" />
        <input name="idempotencyKey" type="hidden" value={`approve-order-ui-${randomUUID()}`} />
        <button className="button button--primary" type="submit">Одобрить Order</button>
      </form>
      {firstLine && firstSize ? (
        <form action={requestOrderAmendmentAction} className="lifecycleForm" data-testid="request-amendment-form">
          <input name="snapshotId" type="hidden" value={snapshot.id} />
          <input name="expectedVersion" type="hidden" value="0" />
          <input name="idempotencyKey" type="hidden" value={`amend-order-ui-${randomUUID()}`} />
          <input name="lineId" type="hidden" value={firstLine.id} />
          <div className="lifecycleFormRow">
            <label>
              <span>Причина изменения</span>
              <input name="reason" required defaultValue="Скорректировать количество и условия" />
            </label>
            <label>
              <span>Размер</span>
              <select name="size" defaultValue={firstSize.size}>
                {firstLine.sizeQuantities.map((entry) => (
                  <option key={entry.size} value={entry.size}>{entry.size}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Предложенное количество</span>
              <input name="quantity" type="number" min={0} required defaultValue={firstSize.quantity} />
            </label>
          </div>
          <div className="lifecycleFormRow">
            <label><span>Unit price, minor</span><input name="unitPriceMinor" type="number" min={0} defaultValue={firstLine.unitPriceMinor} /></label>
            <label><span>Discount, bps</span><input name="discountBasisPoints" type="number" min={0} max={10000} defaultValue={firstLine.discountBasisPoints} /></label>
            <label><span>Tax, bps</span><input name="taxBasisPoints" type="number" min={0} max={10000} defaultValue={firstLine.taxBasisPoints} /></label>
          </div>
          <button className="button button--secondary" type="submit">Запросить изменение</button>
        </form>
      ) : null}
    </article>
  );
}

function ReviewCard({
  review,
  selected,
  sellerView,
}: {
  readonly review: OrderReview;
  readonly selected: boolean;
  readonly sellerView: boolean;
}) {
  return (
    <article
      className={`lifecycleEntityCard ${selected ? 'lifecycleEntityCard--selected' : ''}`}
      data-testid={`${sellerView ? 'seller' : 'buyer'}-order-review-card`}
    >
      <div className="lifecycleEntityHeader">
        <div><span>{review.id}</span><h3>{review.orderId}</h3></div>
        <Badge tone={review.status === 'AMENDMENT_REQUESTED' ? 'accent' : 'success'}>
          {review.status}
        </Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Submitted snapshot</dt><dd>{review.submittedOrderSnapshotId}</dd></div>
        <div><dt>Buyer</dt><dd>{review.buyerOrganisationId}</dd></div>
        <div><dt>Seller</dt><dd>{review.sellerOrganisationId}</dd></div>
        <div><dt>Version</dt><dd>{review.version}</dd></div>
      </dl>
      {review.approval ? (
        <p>Approved by <strong>{review.approval.approvedByCredentialId}</strong> · {formatDate(review.approval.approvedAt)}</p>
      ) : null}
      {review.amendmentRequest ? (
        <div className="modulePanel" data-testid="amendment-request-detail">
          <strong>{review.amendmentRequest.reason}</strong>
          {review.amendmentRequest.lineChanges.map((change) => (
            <p key={change.lineId}>
              {change.lineId}: {change.sizeQuantities?.map((entry) => `${entry.size}:${entry.quantity}`).join(' · ') ?? 'commercial terms'}
            </p>
          ))}
        </div>
      ) : null}
      {sellerView && review.status === 'APPROVED' ? (
        <form action={confirmApprovedOrderAction} className="showroomInlineAction" data-testid="confirm-order-form">
          <input name="reviewId" type="hidden" value={review.id} />
          <input name="expectedVersion" type="hidden" value={review.version} />
          <input name="idempotencyKey" type="hidden" value={`confirm-order-ui-${randomUUID()}`} />
          <button className="button button--primary" type="submit">Создать confirmed version</button>
        </form>
      ) : null}
    </article>
  );
}

function ConfirmedCard({
  version,
  perspective,
}: {
  readonly version: ConfirmedOrderVersion;
  readonly perspective: 'buyer' | 'seller';
}) {
  return (
    <article className="lifecycleEntityCard" data-testid={`${perspective}-confirmed-order-card`}>
      <div className="lifecycleEntityHeader">
        <div><span>{version.id}</span><h3>{version.orderId}</h3></div>
        <Badge tone="success">CONFIRMED</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Source snapshot</dt><dd>{version.submittedOrderSnapshotId}</dd></div>
        <div><dt>Source version</dt><dd>{version.sourceOrderVersion}</dd></div>
        <div><dt>Quantity</dt><dd>{version.totals.quantity}</dd></div>
        <div><dt>Total</dt><dd>{formatMoney(version.totals.totalMinor, version.currency)}</dd></div>
        <div><dt>Approved by</dt><dd>{version.approvedByCredentialId}</dd></div>
        <div><dt>Confirmed</dt><dd>{formatDate(version.confirmedAt)}</dd></div>
      </dl>
    </article>
  );
}

export async function OrderConfirmationWorkspacePanel({
  searchParams,
}: {
  readonly searchParams: Record<string, string | string[] | undefined>;
}) {
  const search = normalizeSearch(searchParams);
  const result = await loadConfirmationData();
  if (!result.ok) return <AccessState error={result.error} />;
  const {
    organisationId,
    sellerSnapshots,
    sellerReviews,
    buyerReviews,
    sellerConfirmed,
    buyerConfirmed,
  } = result.data;
  const reviewedSnapshotIds = new Set(
    sellerReviews.map((review) => review.submittedOrderSnapshotId),
  );
  const pendingSellerSnapshots = sellerSnapshots.filter(
    (snapshot) => !reviewedSnapshotIds.has(snapshot.id),
  );

  return (
    <section className="lifecycleWorkspace" data-testid="authoritative-order-confirmation">
      <Notice notice={search.notice} />
      <div className="lifecycleSummary">
        <div><span>Active organisation</span><strong>{organisationId}</strong></div>
        <div><span>Awaiting seller review</span><strong>{pendingSellerSnapshots.length}</strong></div>
        <div><span>Seller decisions</span><strong>{sellerReviews.length}</strong></div>
        <div><span>Buyer decisions</span><strong>{buyerReviews.length}</strong></div>
        <div><span>Confirmed versions</span><strong>{sellerConfirmed.length + buyerConfirmed.length}</strong></div>
        <Badge tone="success">Immutable source contract</Badge>
      </div>

      <article className="modulePanel">
        <p className="sectionEyebrow">Confirmation boundary</p>
        <h2>Решение не изменяет submitted contract</h2>
        <p>
          Approval и amendment request ссылаются на один immutable Submitted Order.
          Confirm создаёт новую неизменяемую версию и сохраняет исходный snapshot.
        </p>
      </article>

      <div className="sectionHeader"><div><p className="sectionEyebrow">Seller queue</p><h2>Ожидают решения</h2></div></div>
      {pendingSellerSnapshots.length === 0 ? <p className="lifecycleEmpty">Нет Submitted Orders без seller decision.</p> : null}
      <div className="lifecycleEntityList">
        {pendingSellerSnapshots.map((snapshot) => (
          <SnapshotDecisionCard key={snapshot.id} snapshot={snapshot} />
        ))}
      </div>

      <div className="lifecycleWorkspaceGrid">
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Seller decisions</p><h2>Approval и amendments</h2></div></div>
          <div className="lifecycleEntityList">
            {sellerReviews.map((review) => (
              <ReviewCard key={review.id} review={review} selected={review.id === search.reviewId} sellerView />
            ))}
          </div>
        </div>
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Buyer inbox</p><h2>Решения продавца</h2></div></div>
          <div className="lifecycleEntityList">
            {buyerReviews.map((review) => (
              <ReviewCard key={review.id} review={review} selected={review.id === search.reviewId} sellerView={false} />
            ))}
          </div>
        </div>
      </div>

      <div className="lifecycleWorkspaceGrid">
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Seller contracts</p><h2>Confirmed versions</h2></div></div>
          <div className="lifecycleEntityList">
            {sellerConfirmed.map((version) => (
              <ConfirmedCard key={version.id} version={version} perspective="seller" />
            ))}
          </div>
        </div>
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Buyer contracts</p><h2>Подтверждённые заказы</h2></div></div>
          <div className="lifecycleEntityList">
            {buyerConfirmed.map((version) => (
              <ConfirmedCard key={version.id} version={version} perspective="buyer" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
