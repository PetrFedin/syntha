import { randomUUID } from 'node:crypto';

import {
  getOrderRepository,
  type CommercialOrder,
  type SubmittedOrderSnapshot,
} from '@/modules/orders';
import {
  getSelectionRepository,
  type Selection,
} from '@/modules/selection';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';
import { Badge, Icon } from '@/shared/ui';
import {
  createOrderDraftAction,
  setOrderLineQuantityAction,
  setOrderLineTermsAction,
  submitOrderAction,
} from '@/shared/workspace/order-actions';

interface OrderWorkspaceSearch {
  readonly notice?: string;
  readonly orderId?: string;
}

interface OrderWorkspaceData {
  readonly organisationId: string;
  readonly readySelections: readonly Selection[];
  readonly orders: readonly CommercialOrder[];
  readonly buyerSnapshots: readonly SubmittedOrderSnapshot[];
  readonly sellerSnapshots: readonly SubmittedOrderSnapshot[];
}

type OrderWorkspaceLoadResult =
  | Readonly<{ readonly ok: true; readonly data: OrderWorkspaceData }>
  | Readonly<{ readonly ok: false; readonly error: unknown }>;

const notices: Readonly<Record<string, string>> = Object.freeze({
  order_draft_created: 'Draft Order создан из READY Selection.',
  order_draft_replayed: 'Повторная команда вернула исходный Draft Order.',
  order_terms_updated: 'Коммерческие условия строки пересчитаны.',
  order_quantity_updated: 'Размерное количество обновлено.',
  order_submitted: 'Order отправлен и зафиксирован immutable snapshot.',
  order_submit_replayed: 'Повторная отправка вернула исходный submitted snapshot.',
  order_idempotency_conflict: 'Idempotency-Key уже использован для другой Order команды.',
  order_selection_not_found: 'READY Selection не найден в buyer scope.',
  order_selection_not_ready: 'Order можно создать только из READY Selection.',
  order_access_revoked: 'Доступ к Showroom отозван; Order mutation заблокирована.',
  order_exists: 'Для этого Selection уже существует Order.',
  order_not_found: 'Order не найден в buyer scope.',
  order_version_conflict: 'Order уже изменён другой операцией. Обновите страницу.',
  invalid_order_input: 'Проверьте количества, цену, discount и tax basis points.',
  order_service_unavailable: 'Order service временно недоступен; данные не изменены.',
});

const errorNotices = new Set([
  'order_idempotency_conflict',
  'order_selection_not_found',
  'order_selection_not_ready',
  'order_access_revoked',
  'order_exists',
  'order_not_found',
  'order_version_conflict',
  'invalid_order_input',
  'order_service_unavailable',
]);

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSearch(
  searchParams: Record<string, string | string[] | undefined>,
): OrderWorkspaceSearch {
  return Object.freeze({
    notice: first(searchParams.notice),
    orderId: first(searchParams.orderId),
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
    <section className="workspaceState" data-testid="order-controlled-state">
      <Icon name={apiError?.status === 403 ? 'settings' : 'clock'} size={28} />
      <h2>
        {apiError?.status === 403
          ? 'Недостаточно прав для Orders'
          : apiError?.status === 401
            ? 'Требуется серверная авторизация'
            : 'Order source временно недоступен'}
      </h2>
      <p>
        Без разрешённого organisation scope система не показывает Draft Orders,
        цены, скидки, налоги и submitted commercial contracts.
      </p>
    </section>
  );
}

async function loadOrderWorkspaceData(): Promise<OrderWorkspaceLoadResult> {
  try {
    const access = await requireWorkspaceAccess('read');
    const [repository, selectionRepository] = await Promise.all([
      getOrderRepository(),
      getSelectionRepository(),
    ]);
    const [selections, orders, buyerSnapshots, sellerSnapshots] = await Promise.all([
      selectionRepository.listSelections(access.organisationId),
      repository.listBuyerOrders(access.organisationId),
      repository.listSubmittedSnapshotsForBuyer(access.organisationId),
      repository.listSubmittedSnapshotsForSeller(access.organisationId),
    ]);
    const orderSelectionIds = new Set(orders.map((order) => order.selectionId));
    return Object.freeze({
      ok: true,
      data: Object.freeze({
        organisationId: access.organisationId,
        readySelections: Object.freeze(
          selections.filter(
            (selection) =>
              selection.status === 'READY' && !orderSelectionIds.has(selection.id),
          ),
        ),
        orders,
        buyerSnapshots,
        sellerSnapshots,
      }),
    });
  } catch (error) {
    return Object.freeze({ ok: false, error });
  }
}

function ReadySelectionCard({ selection }: { readonly selection: Selection }) {
  return (
    <article className="lifecycleEntityCard">
      <div className="lifecycleEntityHeader">
        <div>
          <span>{selection.showroomSnapshotId}</span>
          <h3>{selection.title}</h3>
        </div>
        <Badge tone="success">READY</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Selection ID</dt><dd>{selection.id}</dd></div>
        <div><dt>Shortlist</dt><dd>{selection.items.length}</dd></div>
        <div><dt>Quantity intent</dt><dd>{selection.items.reduce((sum, item) => sum + item.quantityIntent, 0)}</dd></div>
        <div><dt>Currency</dt><dd>{selection.currency}</dd></div>
      </dl>
      <form action={createOrderDraftAction} className="showroomInlineAction">
        <input name="selectionId" type="hidden" value={selection.id} />
        <input name="idempotencyKey" type="hidden" value={`order-draft-ui-${randomUUID()}`} />
        <button className="button button--primary" type="submit">Создать Draft Order</button>
      </form>
    </article>
  );
}

function OrderLineEditor({
  order,
  line,
}: {
  readonly order: CommercialOrder;
  readonly line: CommercialOrder['lines'][number];
}) {
  const editable = order.status === 'DRAFT';
  return (
    <article className="modulePanel" data-testid="order-line-card">
      <div className="lifecycleEntityHeader">
        <div>
          <span>{line.variantReference ?? 'BASE'}</span>
          <h3>{line.productReference}</h3>
        </div>
        <Badge tone="neutral">{line.totalQuantity} units</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Unit price</dt><dd>{formatMoney(line.unitPriceMinor, order.currency)}</dd></div>
        <div><dt>Discount</dt><dd>{line.discountBasisPoints / 100}%</dd></div>
        <div><dt>Tax</dt><dd>{line.taxBasisPoints / 100}%</dd></div>
        <div><dt>Line total</dt><dd>{formatMoney(line.totals.totalMinor, order.currency)}</dd></div>
      </dl>
      {editable ? (
        <form action={setOrderLineTermsAction} className="lifecycleForm" data-testid="order-terms-form">
          <input name="orderId" type="hidden" value={order.id} />
          <input name="lineId" type="hidden" value={line.id} />
          <input name="expectedVersion" type="hidden" value={order.version} />
          <div className="lifecycleFormRow">
            <label><span>Unit price, minor</span><input name="unitPriceMinor" type="number" min={0} defaultValue={line.unitPriceMinor} required /></label>
            <label><span>Discount, bps</span><input name="discountBasisPoints" type="number" min={0} max={10000} defaultValue={line.discountBasisPoints} required /></label>
            <label><span>Tax, bps</span><input name="taxBasisPoints" type="number" min={0} max={10000} defaultValue={line.taxBasisPoints} required /></label>
          </div>
          <button className="button button--secondary" type="submit">Пересчитать строку</button>
        </form>
      ) : null}
      <div className="lifecycleEntityList">
        {line.sizeQuantities.map((entry) => (
          <form action={setOrderLineQuantityAction} className="lifecycleFormRow" key={entry.size}>
            <input name="orderId" type="hidden" value={order.id} />
            <input name="lineId" type="hidden" value={line.id} />
            <input name="expectedVersion" type="hidden" value={order.version} />
            <input name="size" type="hidden" value={entry.size} />
            <label>
              <span>{entry.size}</span>
              <input name="quantity" type="number" min={0} defaultValue={entry.quantity} required disabled={!editable} />
            </label>
            {editable ? <button className="button button--ghost" type="submit">Обновить</button> : null}
          </form>
        ))}
      </div>
    </article>
  );
}

function DraftOrderCard({
  order,
  selected,
}: {
  readonly order: CommercialOrder;
  readonly selected: boolean;
}) {
  const canSubmit =
    order.status === 'DRAFT' &&
    order.totals.quantity > 0 &&
    order.lines.filter((line) => line.totalQuantity > 0).every((line) => line.unitPriceMinor > 0);
  return (
    <article className={`lifecycleEntityCard ${selected ? 'lifecycleEntityCard--selected' : ''}`} data-testid="draft-order-card">
      <div className="lifecycleEntityHeader">
        <div><span>{order.selectionId}</span><h3>{order.id}</h3></div>
        <Badge tone={order.status === 'SUBMITTED' ? 'success' : 'neutral'}>{order.status}</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Quantity</dt><dd>{order.totals.quantity}</dd></div>
        <div><dt>Gross</dt><dd>{formatMoney(order.totals.grossMinor, order.currency)}</dd></div>
        <div><dt>Discount</dt><dd>{formatMoney(order.totals.discountMinor, order.currency)}</dd></div>
        <div><dt>Tax</dt><dd>{formatMoney(order.totals.taxMinor, order.currency)}</dd></div>
        <div><dt>Total</dt><dd>{formatMoney(order.totals.totalMinor, order.currency)}</dd></div>
        <div><dt>Version</dt><dd>{order.version}</dd></div>
      </dl>
      <div className="lifecycleEntityList">
        {order.lines.map((line) => <OrderLineEditor key={line.id} order={order} line={line} />)}
      </div>
      {order.status === 'DRAFT' ? (
        <form action={submitOrderAction} className="showroomInlineAction" data-testid="submit-order-form">
          <input name="orderId" type="hidden" value={order.id} />
          <input name="expectedVersion" type="hidden" value={order.version} />
          <input name="idempotencyKey" type="hidden" value={`submit-order-ui-${randomUUID()}`} />
          <button className="button button--primary" type="submit" disabled={!canSubmit}>
            Submit immutable Order
          </button>
        </form>
      ) : null}
    </article>
  );
}

function SnapshotCard({
  snapshot,
  perspective,
}: {
  readonly snapshot: SubmittedOrderSnapshot;
  readonly perspective: 'buyer' | 'seller';
}) {
  return (
    <article className="lifecycleEntityCard" data-testid={`${perspective}-submitted-order-card`}>
      <div className="lifecycleEntityHeader">
        <div><span>{snapshot.id}</span><h3>{snapshot.orderId}</h3></div>
        <Badge tone="success">SUBMITTED</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Buyer</dt><dd>{snapshot.buyerOrganisationId}</dd></div>
        <div><dt>Seller</dt><dd>{snapshot.sellerOrganisationId}</dd></div>
        <div><dt>Snapshot source</dt><dd>{snapshot.showroomSnapshotId}</dd></div>
        <div><dt>Quantity</dt><dd>{snapshot.totals.quantity}</dd></div>
        <div><dt>Total</dt><dd>{formatMoney(snapshot.totals.totalMinor, snapshot.currency)}</dd></div>
        <div><dt>Submitted</dt><dd>{formatDate(snapshot.submittedAt)}</dd></div>
      </dl>
      <div className="lifecycleEntityList">
        {snapshot.lines.map((line) => (
          <div className="modulePanel" key={line.id}>
            <strong>{line.productReference}</strong>
            <p>{line.sizeQuantities.map((entry) => `${entry.size}:${entry.quantity}`).join(' · ')}</p>
            <p>{formatMoney(line.totals.totalMinor, snapshot.currency)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export async function OrderWorkspacePanel({
  mode,
  searchParams,
}: {
  readonly mode: 'builder' | 'submitted';
  readonly searchParams: Record<string, string | string[] | undefined>;
}) {
  const search = normalizeSearch(searchParams);
  const result = await loadOrderWorkspaceData();
  if (!result.ok) return <AccessState error={result.error} />;
  const { organisationId, readySelections, orders, buyerSnapshots, sellerSnapshots } = result.data;

  return (
    <section className="lifecycleWorkspace" data-testid={mode === 'builder' ? 'authoritative-order-builder' : 'authoritative-orders-workspace'}>
      <Notice notice={search.notice} />
      <div className="lifecycleSummary">
        <div><span>Active organisation</span><strong>{organisationId}</strong></div>
        <div><span>READY Selections</span><strong>{readySelections.length}</strong></div>
        <div><span>Buyer Orders</span><strong>{orders.length}</strong></div>
        <div><span>Submitted received</span><strong>{sellerSnapshots.length}</strong></div>
        <Badge tone="success">Integer commercial source</Badge>
      </div>

      {mode === 'builder' ? (
        <>
          <article className="modulePanel">
            <p className="sectionEyebrow">Order boundary</p>
            <h2>Draft остаётся приватным до submit</h2>
            <p>
              Product, variant и допустимые размеры наследуются из READY Selection.
              Цена, discount, tax и totals считаются только в minor units.
            </p>
          </article>
          <div className="sectionHeader"><div><p className="sectionEyebrow">Source</p><h2>READY Selections без Order</h2></div></div>
          {readySelections.length === 0 ? <p className="lifecycleEmpty">Нет READY Selections, ожидающих Order.</p> : null}
          <div className="lifecycleEntityList">
            {readySelections.map((selection) => <ReadySelectionCard key={selection.id} selection={selection} />)}
          </div>
          <div className="sectionHeader"><div><p className="sectionEyebrow">Buyer-private</p><h2>Draft Orders</h2></div></div>
          <div className="lifecycleEntityList">
            {orders.map((order) => (
              <DraftOrderCard key={order.id} order={order} selected={order.id === search.orderId} />
            ))}
          </div>
        </>
      ) : (
        <div className="lifecycleWorkspaceGrid">
          <div className="lifecycleColumn">
            <div className="sectionHeader"><div><p className="sectionEyebrow">Buyer contracts</p><h2>Отправленные Orders</h2></div></div>
            <div className="lifecycleEntityList">
              {buyerSnapshots.map((snapshot) => <SnapshotCard key={snapshot.id} snapshot={snapshot} perspective="buyer" />)}
            </div>
          </div>
          <div className="lifecycleColumn">
            <div className="sectionHeader"><div><p className="sectionEyebrow">Seller inbox</p><h2>Полученные contracts</h2></div></div>
            <div className="lifecycleEntityList">
              {sellerSnapshots.map((snapshot) => <SnapshotCard key={snapshot.id} snapshot={snapshot} perspective="seller" />)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
