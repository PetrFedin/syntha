import { randomUUID } from 'node:crypto';

import Link from 'next/link';

import {
  getCampaignRepository,
  listCampaigns,
  type Campaign,
  type CampaignStatus,
} from '@/modules/campaigns';
import {
  getCollectionRepository,
  listCampaignCollections,
  type Collection,
  type CollectionStatus,
} from '@/modules/collections';
import {
  getSeasonRepository,
  listOrganisationSeasons,
  type Season,
  type SeasonStatus,
} from '@/modules/seasons';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';
import { Badge, Icon } from '@/shared/ui';
import {
  changeSeasonStatusAction,
  createCampaignAction,
  createCollectionAction,
  createSeasonAction,
  updateCampaignStatusAction,
  updateCollectionStatusAction,
} from '@/shared/workspace/lifecycle-actions';

interface LifecycleSearchParams {
  readonly notice?: string;
  readonly seasonId?: string;
  readonly campaignId?: string;
  readonly collectionId?: string;
}

const noticeText: Readonly<Record<string, string>> = Object.freeze({
  season_created: 'Сезон создан и записан в авторитетный контур.',
  season_replayed: 'Повторная команда распознана: возвращён исходный сезон.',
  season_updated: 'Статус сезона обновлён.',
  campaign_created: 'Кампания создана внутри выбранного сезона.',
  campaign_replayed: 'Повторная команда распознана: возвращена исходная кампания.',
  campaign_updated: 'Статус кампании обновлён.',
  collection_created: 'Коллекция создана внутри выбранной кампании.',
  collection_replayed: 'Повторная команда распознана: возвращена исходная коллекция.',
  collection_updated: 'Статус коллекции обновлён.',
  idempotency_conflict: 'Этот Idempotency-Key уже использован для другой команды.',
  season_already_exists: 'Сезон с таким кодом уже существует.',
  campaign_already_exists: 'Кампания с таким кодом уже существует.',
  collection_already_exists: 'Коллекция с таким кодом уже существует.',
  season_not_found: 'Сезон не найден в активной организации.',
  campaign_not_found: 'Кампания не найдена в активной организации.',
  collection_not_found: 'Коллекция не найдена в активной организации.',
  season_closed: 'Закрытый или архивный сезон не принимает новые кампании.',
  campaign_closed: 'Закрытая или архивная кампания не принимает новые коллекции.',
  version_conflict: 'Запись уже изменена другой операцией. Обновите страницу и повторите действие.',
  invalid_input: 'Проверьте обязательные поля, даты, валюту и переход статуса.',
  service_unavailable: 'Сервис временно недоступен. Данные не были изменены.',
});

const seasonTransitions: Readonly<Record<SeasonStatus, readonly SeasonStatus[]>> = Object.freeze({
  PLANNING: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['CLOSED'],
  CLOSED: ['ARCHIVED'],
  ARCHIVED: [],
});
const campaignTransitions: Readonly<Record<CampaignStatus, readonly CampaignStatus[]>> = Object.freeze({
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['CLOSED'],
  CLOSED: ['ARCHIVED'],
  ARCHIVED: [],
});
const collectionTransitions: Readonly<Record<CollectionStatus, readonly CollectionStatus[]>> = Object.freeze({
  DRAFT: ['READY', 'ARCHIVED'],
  READY: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: [],
});

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeLifecycleSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): LifecycleSearchParams {
  return Object.freeze({
    notice: first(searchParams.notice),
    seasonId: first(searchParams.seasonId),
    campaignId: first(searchParams.campaignId),
    collectionId: first(searchParams.collectionId),
  });
}

function toneForStatus(status: string): 'neutral' | 'accent' | 'success' | 'warning' {
  if (status === 'ACTIVE' || status === 'PUBLISHED') return 'success';
  if (status === 'PLANNING' || status === 'DRAFT') return 'neutral';
  if (status === 'READY') return 'accent';
  return 'warning';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function Notice({ notice }: { readonly notice?: string }) {
  if (!notice) return null;
  const isError = [
    'idempotency_conflict',
    'season_already_exists',
    'campaign_already_exists',
    'collection_already_exists',
    'season_not_found',
    'campaign_not_found',
    'collection_not_found',
    'season_closed',
    'campaign_closed',
    'version_conflict',
    'invalid_input',
    'service_unavailable',
  ].includes(notice);
  return (
    <div className={`lifecycleNotice ${isError ? 'lifecycleNotice--error' : ''}`} role="status">
      <Icon name={isError ? 'help' : 'check'} size={18} />
      <span>{noticeText[notice] ?? notice}</span>
    </div>
  );
}

function AccessState({ error }: { readonly error: unknown }) {
  const apiError = error instanceof CommercialApiError ? error : null;
  const forbidden = apiError?.status === 403;
  const unavailable = !apiError || apiError.status >= 500;
  return (
    <section className="workspaceState" data-testid="lifecycle-controlled-state">
      <Icon name={unavailable ? 'clock' : 'settings'} size={28} />
      <h2>
        {unavailable
          ? 'Авторитетный lifecycle временно недоступен'
          : forbidden
            ? 'Недостаточно прав организации'
            : 'Требуется серверная авторизация'}
      </h2>
      <p>
        {unavailable
          ? 'Страница не подменяет production-данные fixtures. Подключение к PostgreSQL или authorization runtime недоступно.'
          : forbidden
            ? 'Текущая credential не имеет разрешения read для выбранной организации.'
            : 'Передайте действующую server credential и x-syntha-organization-id через защищённый gateway.'}
      </p>
    </section>
  );
}

function StatusForm({
  action,
  entity,
  parent,
  options,
}: {
  readonly action: (formData: FormData) => Promise<never>;
  readonly entity: { readonly id: string; readonly version: number };
  readonly parent?: { readonly name: 'seasonId' | 'campaignId'; readonly value: string };
  readonly options: readonly string[];
}) {
  if (options.length === 0) return <span className="lifecycleTerminal">Финальный статус</span>;
  return (
    <form action={action} className="lifecycleStatusForm">
      <input name={parent?.name} type="hidden" value={parent?.value ?? ''} />
      <input
        name={parent?.name === 'seasonId' ? 'campaignId' : parent?.name === 'campaignId' ? 'collectionId' : 'seasonId'}
        type="hidden"
        value={entity.id}
      />
      <input name="expectedVersion" type="hidden" value={entity.version} />
      <label>
        <span>Следующий статус</span>
        <select name="status" defaultValue={options[0]}>
          {options.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <button className="button button--secondary" type="submit">Применить</button>
    </form>
  );
}

function SeasonCard({ season, selected }: { readonly season: Season; readonly selected: boolean }) {
  return (
    <article className={`lifecycleEntityCard ${selected ? 'lifecycleEntityCard--selected' : ''}`}>
      <div className="lifecycleEntityHeader">
        <div>
          <span>{season.code}</span>
          <h3>{season.name}</h3>
        </div>
        <Badge tone={toneForStatus(season.status)}>{season.status}</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Период</dt><dd>{formatDate(season.startsAt)} — {formatDate(season.endsAt)}</dd></div>
        <div><dt>Версия</dt><dd>{season.version}</dd></div>
      </dl>
      <div className="lifecycleCardActions">
        <Link className="button button--ghost" href={`/campaigns?seasonId=${encodeURIComponent(season.id)}`}>
          Выбрать сезон
        </Link>
        <StatusForm action={changeSeasonStatusAction} entity={season} options={seasonTransitions[season.status]} />
      </div>
    </article>
  );
}

function CampaignCard({
  campaign,
  selected,
}: {
  readonly campaign: Campaign;
  readonly selected: boolean;
}) {
  return (
    <article className={`lifecycleEntityCard ${selected ? 'lifecycleEntityCard--selected' : ''}`}>
      <div className="lifecycleEntityHeader">
        <div>
          <span>{campaign.code}</span>
          <h3>{campaign.name}</h3>
        </div>
        <Badge tone={toneForStatus(campaign.status)}>{campaign.status}</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Продажи</dt><dd>{formatDate(campaign.startsAt)} — {formatDate(campaign.endsAt)}</dd></div>
        <div><dt>Версия</dt><dd>{campaign.version}</dd></div>
      </dl>
      <div className="lifecycleCardActions">
        <Link
          className="button button--ghost"
          href={`/collections?campaignId=${encodeURIComponent(campaign.id)}`}
        >
          Открыть коллекции
        </Link>
        <StatusForm
          action={updateCampaignStatusAction}
          entity={campaign}
          parent={{ name: 'seasonId', value: campaign.seasonId }}
          options={campaignTransitions[campaign.status]}
        />
      </div>
    </article>
  );
}

function CollectionCard({
  collection,
  selected,
}: {
  readonly collection: Collection;
  readonly selected: boolean;
}) {
  return (
    <article className={`lifecycleEntityCard ${selected ? 'lifecycleEntityCard--selected' : ''}`}>
      <div className="lifecycleEntityHeader">
        <div>
          <span>{collection.code} · {collection.currency}</span>
          <h3>{collection.name}</h3>
        </div>
        <Badge tone={toneForStatus(collection.status)}>{collection.status}</Badge>
      </div>
      <dl className="lifecycleMeta">
        <div><dt>Обновлено</dt><dd>{formatDate(collection.updatedAt)}</dd></div>
        <div><dt>Версия</dt><dd>{collection.version}</dd></div>
      </dl>
      <StatusForm
        action={updateCollectionStatusAction}
        entity={collection}
        parent={{ name: 'campaignId', value: collection.campaignId }}
        options={collectionTransitions[collection.status]}
      />
    </article>
  );
}

function CreateSeasonForm() {
  return (
    <form action={createSeasonAction} className="lifecycleForm">
      <input name="idempotencyKey" type="hidden" value={`season-ui-${randomUUID()}`} />
      <div className="sectionHeader"><div><p className="sectionEyebrow">Новый контекст</p><h2>Создать сезон</h2></div></div>
      <label><span>Код</span><input name="code" placeholder="FW27" required /></label>
      <label><span>Название</span><input name="name" placeholder="Fall Winter 2027" required /></label>
      <div className="lifecycleFormRow">
        <label><span>Начало</span><input name="startsAt" type="date" required /></label>
        <label><span>Окончание</span><input name="endsAt" type="date" required /></label>
      </div>
      <button className="button button--primary" type="submit">Создать сезон</button>
    </form>
  );
}

function CreateCampaignForm({ season }: { readonly season: Season }) {
  return (
    <form action={createCampaignAction} className="lifecycleForm">
      <input name="idempotencyKey" type="hidden" value={`campaign-ui-${randomUUID()}`} />
      <input name="seasonId" type="hidden" value={season.id} />
      <div className="sectionHeader"><div><p className="sectionEyebrow">Сезон {season.code}</p><h2>Создать кампанию</h2></div></div>
      <label><span>Код</span><input name="code" placeholder={`${season.code}-MAIN`} required /></label>
      <label><span>Название</span><input name="name" placeholder="Основная кампания" required /></label>
      <div className="lifecycleFormRow">
        <label><span>Начало продаж</span><input name="startsAt" type="date" required /></label>
        <label><span>Окончание продаж</span><input name="endsAt" type="date" required /></label>
      </div>
      <button className="button button--primary" type="submit">Создать кампанию</button>
    </form>
  );
}

function CreateCollectionForm({ campaign }: { readonly campaign: Campaign }) {
  return (
    <form action={createCollectionAction} className="lifecycleForm">
      <input name="idempotencyKey" type="hidden" value={`collection-ui-${randomUUID()}`} />
      <input name="campaignId" type="hidden" value={campaign.id} />
      <div className="sectionHeader"><div><p className="sectionEyebrow">Кампания {campaign.code}</p><h2>Создать коллекцию</h2></div></div>
      <label><span>Код</span><input name="code" placeholder="MAIN-LINE" required /></label>
      <label><span>Название</span><input name="name" placeholder="Основная линия" required /></label>
      <label><span>Валюта ISO</span><input name="currency" maxLength={3} placeholder="EUR" required /></label>
      <button className="button button--primary" type="submit">Создать коллекцию</button>
    </form>
  );
}

async function CampaignWorkspace({ search }: { readonly search: LifecycleSearchParams }) {
  const access = await requireWorkspaceAccess('read');
  const [seasonRepository, campaignRepository] = await Promise.all([
    getSeasonRepository(),
    getCampaignRepository(),
  ]);
  const [seasons, campaigns] = await Promise.all([
    listOrganisationSeasons(seasonRepository, access.organisationId),
    listCampaigns(campaignRepository, access.organisationId),
  ]);
  const selectedSeason = seasons.find((season) => season.id === search.seasonId) ?? seasons[0];
  const visibleCampaigns = selectedSeason
    ? campaigns.filter((campaign) => campaign.seasonId === selectedSeason.id)
    : [];

  return (
    <section className="lifecycleWorkspace" data-testid="authoritative-campaign-workspace">
      <Notice notice={search.notice} />
      <div className="lifecycleSummary">
        <div><span>Организация</span><strong>{access.organisationId}</strong></div>
        <div><span>Сезоны</span><strong>{seasons.length}</strong></div>
        <div><span>Кампании</span><strong>{campaigns.length}</strong></div>
        <Badge tone="success">PostgreSQL source</Badge>
      </div>
      <div className="lifecycleWorkspaceGrid">
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Авторитетные записи</p><h2>Сезоны</h2></div></div>
          {seasons.length === 0 ? <p className="lifecycleEmpty">Сезонов пока нет. Создайте первый коммерческий период.</p> : null}
          <div className="lifecycleEntityList">
            {seasons.map((season) => <SeasonCard key={season.id} season={season} selected={season.id === selectedSeason?.id} />)}
          </div>
        </div>
        <CreateSeasonForm />
      </div>
      <div className="lifecycleWorkspaceGrid">
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Выбранный сезон</p><h2>Кампании</h2></div></div>
          {!selectedSeason ? <p className="lifecycleEmpty">Сначала создайте сезон.</p> : null}
          {selectedSeason && visibleCampaigns.length === 0 ? <p className="lifecycleEmpty">В сезоне {selectedSeason.code} пока нет кампаний.</p> : null}
          <div className="lifecycleEntityList">
            {visibleCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} selected={campaign.id === search.campaignId} />)}
          </div>
        </div>
        {selectedSeason ? <CreateCampaignForm season={selectedSeason} /> : <aside className="modulePanel"><p>Форма кампании появится после создания сезона.</p></aside>}
      </div>
    </section>
  );
}

async function CollectionWorkspace({ search }: { readonly search: LifecycleSearchParams }) {
  const access = await requireWorkspaceAccess('read');
  const [campaignRepository, collectionRepository] = await Promise.all([
    getCampaignRepository(),
    getCollectionRepository(),
  ]);
  const campaigns = await listCampaigns(campaignRepository, access.organisationId);
  const selectedCampaign = campaigns.find((campaign) => campaign.id === search.campaignId) ?? campaigns[0];
  const collections = selectedCampaign
    ? await listCampaignCollections({
        repository: collectionRepository,
        organisationId: access.organisationId,
        campaignId: selectedCampaign.id,
      })
    : [];

  return (
    <section className="lifecycleWorkspace" data-testid="authoritative-collection-workspace">
      <Notice notice={search.notice} />
      <div className="lifecycleSummary">
        <div><span>Организация</span><strong>{access.organisationId}</strong></div>
        <div><span>Кампании</span><strong>{campaigns.length}</strong></div>
        <div><span>Коллекции</span><strong>{collections.length}</strong></div>
        <Badge tone="success">PostgreSQL source</Badge>
      </div>
      <div className="lifecycleCampaignSelector" aria-label="Выбор кампании">
        {campaigns.map((campaign) => (
          <Link
            className={`button ${campaign.id === selectedCampaign?.id ? 'button--primary' : 'button--ghost'}`}
            href={`/collections?campaignId=${encodeURIComponent(campaign.id)}`}
            key={campaign.id}
          >
            {campaign.code}
          </Link>
        ))}
      </div>
      <div className="lifecycleWorkspaceGrid">
        <div className="lifecycleColumn">
          <div className="sectionHeader"><div><p className="sectionEyebrow">Авторитетные записи</p><h2>Коллекции</h2></div></div>
          {!selectedCampaign ? <p className="lifecycleEmpty">Сначала создайте кампанию в разделе «Кампании».</p> : null}
          {selectedCampaign && collections.length === 0 ? <p className="lifecycleEmpty">В кампании {selectedCampaign.code} пока нет коллекций.</p> : null}
          <div className="lifecycleEntityList">
            {collections.map((collection) => <CollectionCard key={collection.id} collection={collection} selected={collection.id === search.collectionId} />)}
          </div>
        </div>
        {selectedCampaign ? <CreateCollectionForm campaign={selectedCampaign} /> : <aside className="modulePanel"><p>Форма коллекции появится после создания кампании.</p></aside>}
      </div>
    </section>
  );
}

export async function LifecycleWorkspacePanel({
  section,
  searchParams,
}: {
  readonly section: 'campaigns' | 'collections';
  readonly searchParams: Record<string, string | string[] | undefined>;
}) {
  const search = normalizeLifecycleSearchParams(searchParams);
  try {
    return section === 'campaigns'
      ? await CampaignWorkspace({ search })
      : await CollectionWorkspace({ search });
  } catch (error) {
    return <AccessState error={error} />;
  }
}
