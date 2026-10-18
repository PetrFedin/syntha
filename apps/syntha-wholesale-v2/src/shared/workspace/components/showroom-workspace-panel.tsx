import { randomUUID } from 'node:crypto';

import Link from 'next/link';

import {
  getCampaignRepository,
  listCampaigns,
} from '@/modules/campaigns';
import {
  getCollectionRepository,
  listCampaignCollections,
  type Collection,
} from '@/modules/collections';
import {
  getShowroomRepository,
  listCollectionShowrooms,
  type Showroom,
  type ShowroomPublicationSnapshot,
} from '@/modules/showroom';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';
import {
  archiveShowroomAction,
  createShowroomAction,
  publishShowroomAction,
  updateShowroomAction,
} from '@/shared/workspace/showroom-actions';
import { Badge, Icon } from '@/shared/ui';

interface ShowroomSearchParams {
  readonly notice?: string;
  readonly collectionId?: string;
  readonly showroomId?: string;
}

interface ShowroomWorkspaceData {
  readonly organisationId: Collection['organisationId'];
  readonly collections: readonly Collection[];
  readonly selectedCollection?: Collection;
  readonly showrooms: readonly Showroom[];
  readonly snapshots: readonly (ShowroomPublicationSnapshot | null)[];
}

type ShowroomWorkspaceLoadResult =
  | Readonly<{ readonly ok: true; readonly data: ShowroomWorkspaceData }>
  | Readonly<{ readonly ok: false; readonly error: unknown }>;

const notices: Readonly<Record<string, string>> = Object.freeze({
  showroom_created: 'Showroom создан как авторитетный draft.',
  showroom_replayed: 'Повторная команда распознана: возвращён исходный Showroom.',
  showroom_updated: 'Draft Showroom обновлён.',
  showroom_published: 'Showroom опубликован, immutable snapshot и outbox event записаны.',
  showroom_publication_replayed: 'Повторная публикация вернула исходный immutable snapshot.',
  showroom_archived: 'Showroom архивирован.',
  showroom_idempotency_conflict: 'Idempotency-Key уже использован для другой команды.',
  showroom_already_exists: 'Showroom с таким кодом уже существует в Collection.',
  showroom_not_found: 'Showroom не найден в активной организации.',
  collection_closed_for_showroom: 'Архивная Collection не принимает новые Showrooms.',
  collection_not_published: 'Сначала переведите Collection в статус PUBLISHED.',
  showroom_version_conflict: 'Showroom уже изменён другой операцией. Обновите страницу.',
  invalid_showroom_input: 'Проверьте код, название, описание, даты и версию.',
  showroom_service_unavailable: 'Showroom service временно недоступен; данные не изменены.',
});

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSearch(
  searchParams: Record<string, string | string[] | undefined>,
): ShowroomSearchParams {
  return Object.freeze({
    notice: first(searchParams.notice),
    collectionId: first(searchParams.collectionId),
    showroomId: first(searchParams.showroomId),
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

function dateInput(value: string): string {
  return value.slice(0, 10);
}

function Notice({ notice }: { readonly notice?: string }) {
  if (!notice) return null;
  const isError = [
    'showroom_idempotency_conflict',
    'showroom_already_exists',
    'showroom_not_found',
    'collection_closed_for_showroom',
    'collection_not_published',
    'showroom_version_conflict',
    'invalid_showroom_input',
    'showroom_service_unavailable',
  ].includes(notice);
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
    <section className="workspaceState" data-testid="showroom-controlled-state">
      <Icon name={apiError?.status === 403 ? 'settings' : 'clock'} size={28} />
      <h2>
        {apiError?.status === 403
          ? 'Недостаточно прав для Showroom'
          : apiError?.status === 401
            ? 'Требуется серверная авторизация'
            : 'Showroom source временно недоступен'}
      </h2>
      <p>
        Страница не показывает demo Showrooms и не открывает mutation forms без разрешённого
        organisation scope.
      </p>
    </section>
  );
}

function SnapshotPanel({ snapshot }: { readonly snapshot: ShowroomPublicationSnapshot }) {
  return (
    <aside className="showroomSnapshot" aria-label="Immutable publication snapshot">
      <div className="sectionHeader">
        <div>
          <p className="sectionEyebrow">Immutable snapshot</p>
          <h3>{snapshot.title}</h3>
        </div>
        <Badge tone="success">v{snapshot.showroomVersion}</Badge>
      </div>
      <p>{snapshot.description || 'Описание не задано.'}</p>
      <dl className="lifecycleMeta">
        <div><dt>Окно</dt><dd>{formatDate(snapshot.opensAt)} — {formatDate(snapshot.closesAt)}</dd></div>
        <div><dt>Опубликовано</dt><dd>{formatDate(snapshot.publishedAt)}</dd></div>
        <div><dt>Snapshot ID</dt><dd>{snapshot.id}</dd></div>
        <div><dt>Автор</dt><dd>{snapshot.publishedByCredentialId}</dd></div>
      </dl>
    </aside>
  );
}

function ShowroomCard({
  showroom,
  snapshot,
  selected,
  parentCollection,
}: {
  readonly showroom: Showroom;
  readonly snapshot: ShowroomPublicationSnapshot | null;
  readonly selected: boolean;
  readonly parentCollection: Collection;
}) {
  return (
    <article className={`lifecycleEntityCard ${selected ? 'lifecycleEntityCard--selected' : ''}`}>
      <div className="lifecycleEntityHeader">
        <div>
          <span>{showroom.code}</span>
          <h3>{showroom.title}</h3>
        </div>
        <Badge tone={showroom.status === 'PUBLISHED' ? 'success' : showroom.status === 'DRAFT' ? 'neutral' : 'warning'}>
          {showroom.status}
        </Badge>
      </div>
      <p className="showroomDescription">{showroom.description || 'Описание не задано.'}</p>
      <dl className="lifecycleMeta">
        <div><dt>Презентация</dt><dd>{formatDate(showroom.opensAt)} — {formatDate(showroom.closesAt)}</dd></div>
        <div><dt>Версия</dt><dd>{showroom.version}</dd></div>
      </dl>

      {showroom.status === 'DRAFT' ? (
        <form action={updateShowroomAction} className="showroomEditForm">
          <input name="collectionId" type="hidden" value={showroom.collectionId} />
          <input name="showroomId" type="hidden" value={showroom.id} />
          <input name="expectedVersion" type="hidden" value={showroom.version} />
          <label><span>Название</span><input name="title" defaultValue={showroom.title} required /></label>
          <label><span>Описание</span><textarea name="description" defaultValue={showroom.description} rows={3} /></label>
          <div className="lifecycleFormRow">
            <label><span>Открытие</span><input name="opensAt" type="date" defaultValue={dateInput(showroom.opensAt)} required /></label>
            <label><span>Закрытие</span><input name="closesAt" type="date" defaultValue={dateInput(showroom.closesAt)} required /></label>
          </div>
          <button className="button button--secondary" type="submit">Сохранить draft</button>
        </form>
      ) : null}

      <div className="lifecycleCardActions">
        <Link
          className="button button--ghost"
          href={`/showroom?collectionId=${encodeURIComponent(showroom.collectionId)}&showroomId=${encodeURIComponent(showroom.id)}`}
        >
          Открыть Showroom
        </Link>
        {showroom.status === 'DRAFT' ? (
          <form action={publishShowroomAction} className="showroomInlineAction">
            <input name="collectionId" type="hidden" value={showroom.collectionId} />
            <input name="showroomId" type="hidden" value={showroom.id} />
            <input name="expectedVersion" type="hidden" value={showroom.version} />
            <input name="idempotencyKey" type="hidden" value={`showroom-publish-ui-${randomUUID()}`} />
            <button
              className="button button--primary"
              disabled={parentCollection.status !== 'PUBLISHED'}
              title={parentCollection.status === 'PUBLISHED' ? undefined : 'Collection должна быть PUBLISHED'}
              type="submit"
            >
              Опубликовать snapshot
            </button>
          </form>
        ) : null}
        {showroom.status !== 'ARCHIVED' ? (
          <form action={archiveShowroomAction} className="showroomInlineAction">
            <input name="collectionId" type="hidden" value={showroom.collectionId} />
            <input name="showroomId" type="hidden" value={showroom.id} />
            <input name="expectedVersion" type="hidden" value={showroom.version} />
            <button className="button button--secondary" type="submit">Архивировать</button>
          </form>
        ) : null}
      </div>
      {snapshot ? <SnapshotPanel snapshot={snapshot} /> : null}
    </article>
  );
}

function CreateShowroomForm({ collection }: { readonly collection: Collection }) {
  return (
    <form action={createShowroomAction} className="lifecycleForm" data-testid="create-showroom-form">
      <input name="collectionId" type="hidden" value={collection.id} />
      <input name="idempotencyKey" type="hidden" value={`showroom-create-ui-${randomUUID()}`} />
      <div className="sectionHeader">
        <div>
          <p className="sectionEyebrow">Collection {collection.code}</p>
          <h2>Создать Showroom</h2>
        </div>
        <Badge tone={collection.status === 'PUBLISHED' ? 'success' : 'neutral'}>{collection.status}</Badge>
      </div>
      <label><span>Код</span><input name="code" placeholder="BUYER-PREVIEW" required /></label>
      <label><span>Название</span><input name="title" placeholder="Buyer Preview" required /></label>
      <label><span>Описание</span><textarea name="description" rows={4} placeholder="Buyer-facing presentation" /></label>
      <div className="lifecycleFormRow">
        <label><span>Открытие</span><input name="opensAt" type="date" required /></label>
        <label><span>Закрытие</span><input name="closesAt" type="date" required /></label>
      </div>
      <button className="button button--primary" type="submit">Создать Showroom</button>
    </form>
  );
}

async function loadCollections(organisationId: Collection['organisationId']) {
  const [campaignRepository, collectionRepository] = await Promise.all([
    getCampaignRepository(),
    getCollectionRepository(),
  ]);
  const campaigns = await listCampaigns(campaignRepository, organisationId);
  const groups = await Promise.all(
    campaigns.map((campaign) =>
      listCampaignCollections({
        repository: collectionRepository,
        organisationId,
        campaignId: campaign.id,
      }),
    ),
  );
  return groups.flat().filter((collection) => collection.status !== 'ARCHIVED');
}

async function loadShowroomWorkspaceData(
  search: ShowroomSearchParams,
): Promise<ShowroomWorkspaceLoadResult> {
  try {
    const access = await requireWorkspaceAccess('read');
    const collections = await loadCollections(access.organisationId);
    const selectedCollection =
      collections.find((collection) => collection.id === search.collectionId) ?? collections[0];
    const repository = await getShowroomRepository();
    const showrooms = selectedCollection
      ? await listCollectionShowrooms({
          repository,
          organisationId: access.organisationId,
          collectionId: selectedCollection.id,
        })
      : [];
    const snapshots = await Promise.all(
      showrooms.map((showroom) =>
        repository.findPublicationSnapshot(access.organisationId, showroom.id),
      ),
    );

    return Object.freeze({
      ok: true,
      data: Object.freeze({
        organisationId: access.organisationId,
        collections,
        selectedCollection,
        showrooms,
        snapshots,
      }),
    });
  } catch (error) {
    return Object.freeze({ ok: false, error });
  }
}

export async function ShowroomWorkspacePanel({
  searchParams,
}: {
  readonly searchParams: Record<string, string | string[] | undefined>;
}) {
  const search = normalizeSearch(searchParams);
  const result = await loadShowroomWorkspaceData(search);

  if (!result.ok) {
    return <AccessState error={result.error} />;
  }

  const {
    organisationId,
    collections,
    selectedCollection,
    showrooms,
    snapshots,
  } = result.data;

  return (
    <section className="lifecycleWorkspace" data-testid="authoritative-showroom-workspace">
      <Notice notice={search.notice} />
      <div className="lifecycleSummary">
        <div><span>Организация</span><strong>{organisationId}</strong></div>
        <div><span>Collections</span><strong>{collections.length}</strong></div>
        <div><span>Showrooms</span><strong>{showrooms.length}</strong></div>
        <Badge tone="success">Snapshot source</Badge>
      </div>
      <div className="lifecycleCampaignSelector" aria-label="Выбор Collection">
        {collections.map((collection) => (
          <Link
            className={`button ${collection.id === selectedCollection?.id ? 'button--primary' : 'button--ghost'}`}
            href={`/showroom?collectionId=${encodeURIComponent(collection.id)}`}
            key={collection.id}
          >
            {collection.code}
          </Link>
        ))}
      </div>
      <div className="lifecycleWorkspaceGrid">
        <div className="lifecycleColumn">
          <div className="sectionHeader">
            <div><p className="sectionEyebrow">Авторитетные презентации</p><h2>Showrooms</h2></div>
          </div>
          {!selectedCollection ? (
            <p className="lifecycleEmpty">Сначала создайте Collection в предыдущей стадии.</p>
          ) : null}
          {selectedCollection && showrooms.length === 0 ? (
            <p className="lifecycleEmpty">В Collection {selectedCollection.code} пока нет Showrooms.</p>
          ) : null}
          <div className="lifecycleEntityList">
            {showrooms.map((showroom, index) => (
              <ShowroomCard
                key={showroom.id}
                showroom={showroom}
                snapshot={snapshots[index] ?? null}
                selected={showroom.id === search.showroomId}
                parentCollection={selectedCollection as Collection}
              />
            ))}
          </div>
        </div>
        {selectedCollection ? (
          <CreateShowroomForm collection={selectedCollection} />
        ) : (
          <aside className="modulePanel"><p>Форма Showroom появится после создания Collection.</p></aside>
        )}
      </div>
    </section>
  );
}
