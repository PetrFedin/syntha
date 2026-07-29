import { randomUUID } from 'node:crypto';

import Link from 'next/link';

import { getCampaignRepository, listCampaigns } from '@/modules/campaigns';
import { getCollectionRepository, listCampaignCollections } from '@/modules/collections';
import type { OrganisationId } from '@/modules/organisations';
import {
  getSelectionRepository,
  type Selection,
  type ShowroomAccessGrant,
} from '@/modules/selection';
import {
  getShowroomRepository,
  listCollectionShowrooms,
  type Showroom,
} from '@/modules/showroom';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';
import { Badge, Icon } from '@/shared/ui';
import {
  addSelectionItemAction,
  archiveSelectionAction,
  createSelectionAction,
  grantShowroomAccessAction,
  markSelectionReadyAction,
  revokeShowroomAccessAction,
  setSelectionBudgetAction,
  setSelectionSizeCurveAction,
} from '@/shared/workspace/selection-actions';

interface SelectionSearchParams {
  readonly notice?: string;
  readonly selectionId?: string;
}

interface SelectionWorkspaceData {
  readonly organisationId: OrganisationId;
  readonly publishedShowrooms: readonly Showroom[];
  readonly sellerGrants: readonly ShowroomAccessGrant[];
  readonly buyerGrants: readonly ShowroomAccessGrant[];
  readonly selections: readonly Selection[];
}

type SelectionWorkspaceLoadResult =
  | Readonly<{ readonly ok: true; readonly data: SelectionWorkspaceData }>
  | Readonly<{ readonly ok: false; readonly error: unknown }>;

const notices: Readonly<Record<string, string>> = Object.freeze({
  selection_access_granted: 'Доступ покупателю выдан на immutable Showroom snapshot.',
  selection_access_replayed: 'Повторная команда вернула исходный access grant.',
  selection_access_revoked: 'Доступ покупателя отозван.',
  selection_created: 'Приватный Selection создан.',
  selection_replayed: 'Повторная команда вернула исходный Selection.',
  selection_budget_updated: 'Бюджет Selection обновлён.',
  selection_item_added: 'Товар добавлен в shortlist.',
  selection_size_curve_updated: 'Размерная кривая сохранена.',
  selection_ready: 'Selection переведён в READY.',
  selection_archived: 'Selection архивирован.',
  selection_idempotency_conflict: 'Idempotency-Key уже использован для другой команды.',
  selection_access_exists: 'Активный доступ для этого покупателя уже существует.',
  selection_access_not_found: 'Access grant не найден в текущем seller scope.',
  selection_showroom_not_published: 'Сначала опубликуйте Showroom.',
  selection_showroom_unavailable: 'Showroom или immutable snapshot недоступен.',
  selection_access_version_conflict: 'Access grant уже изменён другой операцией.',
  selection_exists: 'Для этого доступа уже существует Selection.',
  selection_not_found: 'Selection не найден в текущем buyer scope.',
  selection_version_conflict: 'Selection уже изменён другой операцией. Обновите страницу.',
  selection_mutation_blocked_revoked: 'Доступ отозван; изменения Selection заблокированы.',
  invalid_selection_input: 'Проверьте организацию, бюджет, товар и размерную кривую.',
  selection_service_unavailable: 'Selection service временно недоступен; данные не изменены.',
});

const errorNotices = new Set([
  'selection_idempotency_conflict',
  'selection_access_exists',
  'selection_access_not_found',
  'selection_showroom_not_published',
  'selection_showroom_unavailable',
  'selection_access_version_conflict',
  'selection_exists',
  'selection_not_found',
  'selection_version_conflict',
  'selection_mutation_blocked_revoked',
  'invalid_selection_input',
  'selection_service_unavailable',
]);

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSearch(
  searchParams: Record<string, string | string[] | undefined>,
): SelectionSearchParams {
  return Object.freeze({
    notice: first(searchParams.notice),
    selectionId: first(searchParams.selectionId),
  });
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value / 100);
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
    <section className="workspaceState" data-testid="selection-controlled-state">
      <Icon name={apiError?.status === 403 ? 'settings' : 'clock'} size={28} />
      <h2>
        {apiError?.status === 403
          ? 'Недостаточно прав для Selection'
          : apiError?.status === 401
            ? 'Требуется серверная авторизация'
            : 'Selection source временно недоступен'}
      </h2>
      <p>
        Без разрешённого organisation scope система не показывает доступы, бюджеты,
        shortlist и размерные кривые.
      </p>
    </section>
  );
}

async function loadPublishedShowrooms(organisationId: OrganisationId) {
  const [campaignRepository, collectionRepository, showroomRepository] = await Promise.all([
    getCampaignRepository(),
    getCollectionRepository(),
    getShowroomRepository(),
  ]);
  const campaigns = await listCampaigns(campaignRepository, organisationId);
  const collections = (
    await Promise.all(
      campaigns.map((campaign) =>
        listCampaignCollections({
          repository: collectionRepository,
          organisationId,
          campaignId: campaign.id,
        }),
      ),
    )
  ).flat();
  const showrooms = (
    await Promise.all(
      collections.map((collection) =>
        listCollectionShowrooms({
          repository: showroomRepository,
          organisationId,
          collectionId: collection.id,
        }),
      ),
    )
  ).flat();
  return Object.freeze(showrooms.filter((showroom) => showroom.status === 'PUBLISHED'));
}

async function loadSelectionWorkspaceData(): Promise<SelectionWorkspaceLoadResult> {
  try {
    const access = await requireWorkspaceAccess('read');
    const repository = await getSelectionRepository();
    const [publishedShowrooms, sellerGrants, buyerGrants, selections] = await Promise.all([
      loadPublishedShowrooms(access.organisationId),
      repository.listGrantsForSeller(access.organisationId),
      repository.listGrantsForBuyer(access.organisationId),
      repository.listSelections(access.organisationId),
    ]);
    return Object.freeze({
      ok: true,
      data: Object.freeze({
        organisationId: access.organisationId,
        publishedShowrooms,
        sellerGrants,
        buyerGrants,
        selections,
      }),
    });
  } catch (error) {
    return Object.freeze({ ok: false, error });
  }
}

function SellerShowroomCard({ showroom }: { readonly showroom: Showroom }) {
  return (
    <article className="lifecycleEntityCard">
      <div className="lifecycleEntityHeader">
        <div><span>{showroom.code}</span><h3>{showroom.title}</h3></div>
        <Badge tone="success">PUBLISHED</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Showroom ID</dt><dd>{showroom.id}</dd></div>
        <div><dt>Версия</dt><dd>{showroom.version}</dd></div>
      </dl>
      <form action={grantShowroomAccessAction} className="lifecycleForm">
        <input name="showroomId" type="hidden" value={showroom.id} />
        <input name="idempotencyKey" type="hidden" value={`showroom-access-ui-${randomUUID()}`} />
        <label>
          <span>Buyer organisation ID</span>
          <input name="buyerOrganisationId" placeholder="SHOP-ORGANISATION-ID" required />
        </label>
        <button className="button button--primary" type="submit">Выдать доступ</button>
      </form>
    </article>
  );
}

function SellerGrantCard({ grant }: { readonly grant: ShowroomAccessGrant }) {
  return (
    <article className="lifecycleEntityCard">
      <div className="lifecycleEntityHeader">
        <div><span>{grant.id}</span><h3>{grant.buyerOrganisationId}</h3></div>
        <Badge tone={grant.status === 'ACTIVE' ? 'success' : 'warning'}>{grant.status}</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Showroom</dt><dd>{grant.showroomId}</dd></div>
        <div><dt>Snapshot</dt><dd>{grant.showroomSnapshotId}</dd></div>
        <div><dt>Выдан</dt><dd>{formatDate(grant.grantedAt)}</dd></div>
        <div><dt>Версия</dt><dd>{grant.version}</dd></div>
      </dl>
      {grant.status === 'ACTIVE' ? (
        <form action={revokeShowroomAccessAction} className="showroomInlineAction">
          <input name="grantId" type="hidden" value={grant.id} />
          <input name="expectedVersion" type="hidden" value={grant.version} />
          <button className="button button--secondary" type="submit">Отозвать доступ</button>
        </form>
      ) : null}
    </article>
  );
}

function BuyerGrantCard({
  grant,
  selection,
}: {
  readonly grant: ShowroomAccessGrant;
  readonly selection?: Selection;
}) {
  return (
    <article className="lifecycleEntityCard">
      <div className="lifecycleEntityHeader">
        <div><span>Seller {grant.sellerOrganisationId}</span><h3>Snapshot access</h3></div>
        <Badge tone={grant.status === 'ACTIVE' ? 'success' : 'warning'}>{grant.status}</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Showroom</dt><dd>{grant.showroomId}</dd></div>
        <div><dt>Immutable snapshot</dt><dd>{grant.showroomSnapshotId}</dd></div>
      </dl>
      {selection ? (
        <Link className="button button--ghost" href={`/selections?selectionId=${selection.id}`}>
          Открыть {selection.title}
        </Link>
      ) : grant.status === 'ACTIVE' ? (
        <form action={createSelectionAction} className="lifecycleForm">
          <input name="grantId" type="hidden" value={grant.id} />
          <input name="idempotencyKey" type="hidden" value={`selection-create-ui-${randomUUID()}`} />
          <label><span>Название Selection</span><input name="title" defaultValue="Main Buy" required /></label>
          <div className="lifecycleFormRow">
            <label><span>Валюта</span><input name="currency" defaultValue="EUR" maxLength={3} required /></label>
            <label><span>Бюджет, minor units</span><input name="budgetMinor" type="number" min={0} defaultValue={0} /></label>
          </div>
          <button className="button button--primary" type="submit">Создать Selection</button>
        </form>
      ) : (
        <p className="lifecycleEmpty">Доступ отозван до создания Selection.</p>
      )}
    </article>
  );
}

function SelectionCard({
  selection,
  selected,
  grant,
}: {
  readonly selection: Selection;
  readonly selected: boolean;
  readonly grant?: ShowroomAccessGrant;
}) {
  const editable = selection.status === 'DRAFT' && grant?.status === 'ACTIVE';
  return (
    <article className={`lifecycleEntityCard ${selected ? 'lifecycleEntityCard--selected' : ''}`}>
      <div className="lifecycleEntityHeader">
        <div><span>{selection.showroomSnapshotId}</span><h3>{selection.title}</h3></div>
        <Badge tone={selection.status === 'READY' ? 'success' : selection.status === 'DRAFT' ? 'neutral' : 'warning'}>
          {selection.status}
        </Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Budget</dt><dd>{formatMoney(selection.budgetMinor, selection.currency)}</dd></div>
        <div><dt>Shortlist</dt><dd>{selection.items.length}</dd></div>
        <div><dt>Версия</dt><dd>{selection.version}</dd></div>
        <div><dt>Seller</dt><dd>{selection.sellerOrganisationId}</dd></div>
      </dl>

      {editable ? (
        <form action={setSelectionBudgetAction} className="lifecycleForm">
          <input name="selectionId" type="hidden" value={selection.id} />
          <input name="expectedVersion" type="hidden" value={selection.version} />
          <div className="lifecycleFormRow">
            <label><span>Валюта</span><input name="currency" defaultValue={selection.currency} maxLength={3} /></label>
            <label><span>Бюджет, minor units</span><input name="budgetMinor" type="number" min={0} defaultValue={selection.budgetMinor} required /></label>
          </div>
          <button className="button button--secondary" type="submit">Обновить бюджет</button>
        </form>
      ) : null}

      <div className="lifecycleEntityList">
        {selection.items.map((item) => (
          <article className="modulePanel" key={item.id}>
            <div className="lifecycleEntityHeader">
              <div><span>#{item.position}</span><h3>{item.productReference}</h3></div>
              <Badge tone="neutral">{item.quantityIntent} units</Badge>
            </div>
            <p>{item.variantReference || 'Базовый вариант'} · {item.note || 'Без заметки'}</p>
            <p>
              {item.sizeCurve.length
                ? item.sizeCurve.map((entry) => `${entry.size}:${entry.quantity}`).join(' · ')
                : 'Размерная кривая не задана'}
            </p>
            {editable ? (
              <form action={setSelectionSizeCurveAction} className="lifecycleForm">
                <input name="selectionId" type="hidden" value={selection.id} />
                <input name="itemId" type="hidden" value={item.id} />
                <input name="expectedVersion" type="hidden" value={selection.version} />
                <label>
                  <span>Размерная кривая</span>
                  <input
                    name="sizeCurve"
                    defaultValue={item.sizeCurve.map((entry) => `${entry.size}:${entry.quantity}`).join(',')}
                    placeholder="XS:1,S:2,M:3,L:2"
                    required
                  />
                </label>
                <label><span>Заметка</span><input name="note" defaultValue={item.note} /></label>
                <button className="button button--secondary" type="submit">Сохранить кривую</button>
              </form>
            ) : null}
          </article>
        ))}
      </div>

      {editable ? (
        <form action={addSelectionItemAction} className="lifecycleForm" data-testid="add-selection-item-form">
          <input name="selectionId" type="hidden" value={selection.id} />
          <input name="expectedVersion" type="hidden" value={selection.version} />
          <div className="lifecycleFormRow">
            <label><span>Product reference</span><input name="productReference" placeholder="SKU-001" required /></label>
            <label><span>Variant</span><input name="variantReference" placeholder="BLACK" /></label>
          </div>
          <div className="lifecycleFormRow">
            <label><span>Quantity intent</span><input name="quantityIntent" type="number" min={0} defaultValue={0} /></label>
            <label><span>Заметка</span><input name="note" placeholder="Window story" /></label>
          </div>
          <button className="button button--primary" type="submit">Добавить в shortlist</button>
        </form>
      ) : null}

      <div className="lifecycleCardActions">
        <Link className="button button--ghost" href={`/selections?selectionId=${selection.id}`}>
          Открыть Selection
        </Link>
        {editable && selection.items.length > 0 ? (
          <form action={markSelectionReadyAction} className="showroomInlineAction">
            <input name="selectionId" type="hidden" value={selection.id} />
            <input name="expectedVersion" type="hidden" value={selection.version} />
            <button className="button button--primary" type="submit">Перевести в READY</button>
          </form>
        ) : null}
        {selection.status !== 'ARCHIVED' && grant?.status === 'ACTIVE' ? (
          <form action={archiveSelectionAction} className="showroomInlineAction">
            <input name="selectionId" type="hidden" value={selection.id} />
            <input name="expectedVersion" type="hidden" value={selection.version} />
            <button className="button button--secondary" type="submit">Архивировать</button>
          </form>
        ) : null}
      </div>
    </article>
  );
}

export async function SelectionWorkspacePanel({
  searchParams,
}: {
  readonly searchParams: Record<string, string | string[] | undefined>;
}) {
  const search = normalizeSearch(searchParams);
  const result = await loadSelectionWorkspaceData();
  if (!result.ok) return <AccessState error={result.error} />;

  const { organisationId, publishedShowrooms, sellerGrants, buyerGrants, selections } = result.data;
  const selectionByGrant = new Map(
    selections.map((selection) => [selection.showroomAccessGrantId, selection]),
  );
  const buyerGrantById = new Map(buyerGrants.map((grant) => [grant.id, grant]));

  return (
    <section className="lifecycleWorkspace" data-testid="authoritative-selection-workspace">
      <Notice notice={search.notice} />
      <div className="lifecycleSummary">
        <div><span>Active organisation</span><strong>{organisationId}</strong></div>
        <div><span>Published Showrooms</span><strong>{publishedShowrooms.length}</strong></div>
        <div><span>Buyer grants</span><strong>{buyerGrants.length}</strong></div>
        <div><span>Selections</span><strong>{selections.length}</strong></div>
        <Badge tone="success">Private buyer source</Badge>
      </div>

      <article className="modulePanel">
        <p className="sectionEyebrow">Privacy boundary</p>
        <h2>Brand видит grant, Shop видит свой Selection</h2>
        <p>
          Бюджет, заметки, shortlist и размерные кривые читаются только в buyer organisation scope.
          Seller-проекция содержит только факт доступа и immutable snapshot reference.
        </p>
      </article>

      <div className="lifecycleWorkspaceGrid">
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Seller control</p><h2>Выдать доступ</h2></div></div>
          {publishedShowrooms.length === 0 ? (
            <p className="lifecycleEmpty">В текущей организации нет опубликованных Showrooms.</p>
          ) : null}
          <div className="lifecycleEntityList">
            {publishedShowrooms.map((showroom) => <SellerShowroomCard key={showroom.id} showroom={showroom} />)}
          </div>
          <div className="sectionHeader"><div><p className="sectionEyebrow">Issued access</p><h2>Выданные grants</h2></div></div>
          <div className="lifecycleEntityList">
            {sellerGrants.map((grant) => <SellerGrantCard key={grant.id} grant={grant} />)}
          </div>
        </div>

        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Buyer workspace</p><h2>Доступные snapshots</h2></div></div>
          {buyerGrants.length === 0 ? (
            <p className="lifecycleEmpty">Текущей организации ещё не выдан доступ к Showroom.</p>
          ) : null}
          <div className="lifecycleEntityList">
            {buyerGrants.map((grant) => (
              <BuyerGrantCard
                key={grant.id}
                grant={grant}
                selection={selectionByGrant.get(grant.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="sectionHeader"><div><p className="sectionEyebrow">Buyer-private planning</p><h2>Selections</h2></div></div>
      <div className="lifecycleEntityList">
        {selections.map((selection) => (
          <SelectionCard
            key={selection.id}
            selection={selection}
            selected={selection.id === search.selectionId}
            grant={buyerGrantById.get(selection.showroomAccessGrantId)}
          />
        ))}
      </div>
    </section>
  );
}
