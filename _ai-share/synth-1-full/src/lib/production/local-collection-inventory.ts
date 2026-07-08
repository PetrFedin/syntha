/**
 * Локальные черновики коллекций и артикулов (localStorage) — демо без API.
 * Слой данных можно заменить на ProductionDataPort без смены контракта UI.
 */

import {
  findHandbookLeafById,
  getHandbookCategoryLeaves,
  resolveHandbookLeafId,
} from '@/lib/production/category-catalog';
import {
  PLATFORM_CORE_W2_HYDRATE_COLLECTION_IDS,
  PLATFORM_CORE_DEMO_PRESETS,
} from '@/lib/platform-core-demo-context';
import type { Workshop2TzSignatoryBindings } from '@/lib/production/workshop2-dossier-phase1.types';
import { normalizeWorkshopTzSignatoryBindings } from '@/lib/production/workshop2-tz-signatory-options';
import {
  shouldMirrorPgClientStoreToLocalStorage,
  shouldUseLocalStorageClientFallbackInCore,
} from '@/lib/production/workshop2-pg-read-path-policy';

export const LOCAL_COLLECTION_INVENTORY_STORAGE_KEY = 'synth.brand.localCollectionInventory.v1';

export type Workshop2ArticleOrigin = 'new' | 'base';

export type LocalOrderLine = Record<string, unknown> & {
  id: string;
  sku: string;
  name: string;
  season: string;
  orderedQuantity: number;
  price: number;
  deliveryWindowId: string;
  categoryLeafId: string;
  productionSiteId: string;
  productionSiteLabel: string;
  fabricSuppliers: string[];
  fabricMainFromBrandStock: boolean;
  investorDemo?: boolean;
  lineStatus?: string;
  /** Разработка коллекции: создан с нуля или скопирован из базы артикулов. */
  articleOrigin?: Workshop2ArticleOrigin;
  workshopComment?: string;
  workshopAttachments?: { name: string; dataUrl: string }[];
  /** Кто добавил строку в разработке коллекции (аудит). */
  createdInWorkshop2By?: string;
  createdInWorkshop2At?: string;
  /** ISO последнего изменения строки в разработке коллекции (состав коллекции, метаданные). */
  updatedInWorkshop2At?: string;
  /** Внутренний 6-значный номер артикула (от 100000), уникальный в локальном инвентаре. */
  internalArticleCode?: string;
  /** Аудитория / unisex для assembleWorkshop2ArticleFromTaxonomy. */
  workshopAudienceId?: string;
  workshopIsUnisex?: boolean;
  /** Закрепление подписантов ТЗ (копируется в досье при создании). */
  workshopTzSignatoryBindings?: Workshop2TzSignatoryBindings;
  /** Article spine: полное производство vs закупка/импорт образца. */
  articleCreationMode?: 'full_production' | 'buy_or_import';
};

export type UserCollectionRow = {
  id: string;
  name: string;
  createdAt: string;
  description?: string;
  /** Для справки: кто создал коллекцию в UI (email или имя). */
  createdBy?: string;
  /** ISO-время последнего изменения состава (артикулы) в UI. */
  updatedAt?: string;
  /** ISO-время переноса в архив (только для записей в archivedUserCollections). */
  archivedAt?: string;
  /** Опциональная мета коллекции (разработка коллекции). */
  targetSeason?: string;
  targetChannel?: string;
  dropDeadlineIso?: string;
  teamNote?: string;
  /** Hex цвета метки панели артикулов, напр. #6366f1 */
  panelAccentHex?: string;
};

/** Демо-коллекция цеха 2 (не из userCollections) — архивируется отдельным флагом. */
export const WORKSHOP2_SYSTEM_COLLECTION_ID = 'SS27';

export type LocalCollectionInventory = {
  v: 1;
  articlesByCollection: Record<string, LocalOrderLine[]>;
  userCollections: UserCollectionRow[];
  /** Пользовательские коллекции, убранные в архив (локально). */
  archivedUserCollections: UserCollectionRow[];
  /** Обложки карточек коллекций в разработке коллекции: id коллекции → data URL (локально). */
  collectionCovers?: Record<string, string>;
  /** Системные коллекции (SS27), убранные в архив. */
  archivedSystemCollectionIds?: string[];
  /** Порядок карточек активных коллекций. Закрепление и новая коллекция — в начало; снятие гвоздика позицию не меняет. */
  workshop2ActiveOrder?: string[];
  /** Закрепление вверху списка (гвоздик). */
  workshop2Pinned?: Record<string, boolean>;
  /** Поля карточки демо-коллекции SS27 (не в userCollections). */
  /** Следующий свободный внутренний номер артикула (после максимального среди выданных кодов). */
  workshop2NextInternalArticleSeq?: number;
  workshop2Ss27Meta?: {
    /** Подпись на карточке; если нет — показывается код SS27. */
    displayName?: string;
    description?: string;
    teamNote?: string;
    targetSeason?: string;
    targetChannel?: string;
    dropDeadlineIso?: string;
    panelAccentHex?: string;
  };
};

export function emptyLocalCollectionInventory(): LocalCollectionInventory {
  return {
    v: 1,
    articlesByCollection: {},
    userCollections: [],
    archivedUserCollections: [],
    collectionCovers: {},
    archivedSystemCollectionIds: [],
  };
}

const INTERNAL_ARTICLE_CODE_MIN = 100000;

/** Минимальный допустимый внутренний номер артикула (шесть цифр, в т.ч. для подсказки в UI). */
export const WORKSHOP2_INTERNAL_ARTICLE_CODE_MIN = INTERNAL_ARTICLE_CODE_MIN;

export function isWorkshop2InternalArticleCodeValid(v: unknown): v is string {
  return isValidInternalArticleCode(v);
}

/** Пример формата, когда номер ещё не записан в данные. */
export function formatWorkshop2InternalArticleCodePlaceholder(): string {
  return String(INTERNAL_ARTICLE_CODE_MIN).padStart(6, '0');
}

function isValidInternalArticleCode(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{6}$/.test(v)) return false;
  const n = parseInt(v, 10);
  return n >= INTERNAL_ARTICLE_CODE_MIN;
}

/**
 * Выдаёт всем строкам без кода внутренний 6-значный номер (от 100000), обновляет счётчик.
 * При изменении данных сохраняет инвентарь в localStorage.
 */
export function migrateWorkshop2InternalArticleCodes(inv: LocalCollectionInventory): {
  inventory: LocalCollectionInventory;
  mutated: boolean;
} {
  let nextAssign =
    typeof inv.workshop2NextInternalArticleSeq === 'number' &&
    inv.workshop2NextInternalArticleSeq >= INTERNAL_ARTICLE_CODE_MIN
      ? inv.workshop2NextInternalArticleSeq
      : INTERNAL_ARTICLE_CODE_MIN;
  let maxExisting = INTERNAL_ARTICLE_CODE_MIN - 1;
  for (const lines of Object.values(inv.articlesByCollection)) {
    for (const line of lines) {
      const c = (line as LocalOrderLine).internalArticleCode;
      if (isValidInternalArticleCode(c)) maxExisting = Math.max(maxExisting, parseInt(c, 10));
    }
  }
  nextAssign = Math.max(nextAssign, maxExisting + 1);

  let mutated = false;
  const nextArticles: Record<string, LocalOrderLine[]> = {};
  for (const [key, lines] of Object.entries(inv.articlesByCollection)) {
    nextArticles[key] = lines.map((line) => {
      if (isValidInternalArticleCode((line as LocalOrderLine).internalArticleCode)) return line;
      const code = String(nextAssign).padStart(6, '0');
      nextAssign += 1;
      mutated = true;
      return { ...line, internalArticleCode: code };
    });
  }
  return {
    inventory: {
      ...inv,
      articlesByCollection: nextArticles,
      workshop2NextInternalArticleSeq: nextAssign,
    },
    mutated,
  };
}

function takeNextInternalArticleCode(
  inv: LocalCollectionInventory
): [string, LocalCollectionInventory] {
  let seq =
    typeof inv.workshop2NextInternalArticleSeq === 'number' &&
    inv.workshop2NextInternalArticleSeq >= INTERNAL_ARTICLE_CODE_MIN
      ? inv.workshop2NextInternalArticleSeq
      : INTERNAL_ARTICLE_CODE_MIN;
  let maxExisting = INTERNAL_ARTICLE_CODE_MIN - 1;
  for (const lines of Object.values(inv.articlesByCollection)) {
    for (const line of lines) {
      const c = (line as LocalOrderLine).internalArticleCode;
      if (isValidInternalArticleCode(c)) maxExisting = Math.max(maxExisting, parseInt(c, 10));
    }
  }
  seq = Math.max(seq, maxExisting + 1);
  const code = String(seq).padStart(6, '0');
  return [code, { ...inv, workshop2NextInternalArticleSeq: seq + 1 }];
}

export function loadLocalCollectionInventory(): LocalCollectionInventory {
  if (typeof window === 'undefined') return emptyLocalCollectionInventory();
  if (!shouldUseLocalStorageClientFallbackInCore()) return emptyLocalCollectionInventory();
  try {
    const raw = localStorage.getItem(LOCAL_COLLECTION_INVENTORY_STORAGE_KEY);
    if (!raw) return emptyLocalCollectionInventory();
    const p = JSON.parse(raw) as LocalCollectionInventory;
    if (
      p?.v !== 1 ||
      typeof p.articlesByCollection !== 'object' ||
      p.articlesByCollection === null
    ) {
      return emptyLocalCollectionInventory();
    }
    const base: LocalCollectionInventory = {
      v: 1,
      articlesByCollection: p.articlesByCollection,
      userCollections: Array.isArray(p.userCollections) ? p.userCollections : [],
      archivedUserCollections: Array.isArray(p.archivedUserCollections)
        ? p.archivedUserCollections
        : [],
      collectionCovers:
        typeof p.collectionCovers === 'object' && p.collectionCovers !== null
          ? p.collectionCovers
          : {},
      archivedSystemCollectionIds: Array.isArray(p.archivedSystemCollectionIds)
        ? p.archivedSystemCollectionIds
        : [],
      workshop2ActiveOrder: Array.isArray(p.workshop2ActiveOrder)
        ? p.workshop2ActiveOrder.filter((x): x is string => typeof x === 'string')
        : undefined,
      workshop2Pinned:
        typeof p.workshop2Pinned === 'object' &&
        p.workshop2Pinned !== null &&
        !Array.isArray(p.workshop2Pinned)
          ? (p.workshop2Pinned as Record<string, boolean>)
          : undefined,
      workshop2NextInternalArticleSeq:
        typeof (p as { workshop2NextInternalArticleSeq?: unknown })
          .workshop2NextInternalArticleSeq === 'number' &&
        (p as { workshop2NextInternalArticleSeq: number }).workshop2NextInternalArticleSeq >=
          INTERNAL_ARTICLE_CODE_MIN
          ? (p as { workshop2NextInternalArticleSeq: number }).workshop2NextInternalArticleSeq
          : undefined,
      workshop2Ss27Meta: (() => {
        const m = (p as { workshop2Ss27Meta?: unknown }).workshop2Ss27Meta;
        if (typeof m !== 'object' || m === null || Array.isArray(m)) return undefined;
        const rec = m as Record<string, unknown>;
        const pick = (k: string) => (typeof rec[k] === 'string' ? (rec[k] as string) : undefined);
        const out: NonNullable<LocalCollectionInventory['workshop2Ss27Meta']> = {};
        const dn = pick('displayName');
        const desc = pick('description');
        const tn = pick('teamNote');
        const ts = pick('targetSeason');
        const ch = pick('targetChannel');
        const ddl = pick('dropDeadlineIso');
        const accent = pick('panelAccentHex');
        if (dn) out.displayName = dn;
        if (desc) out.description = desc;
        if (tn) out.teamNote = tn;
        if (ts) out.targetSeason = ts;
        if (ch) out.targetChannel = ch;
        if (ddl) out.dropDeadlineIso = ddl;
        if (accent) out.panelAccentHex = accent;
        return Object.keys(out).length ? out : undefined;
      })(),
    };
    const { inventory, mutated } = migrateWorkshop2InternalArticleCodes(base);
    if (mutated) saveLocalCollectionInventory(inventory);
    return inventory;
  } catch {
    return emptyLocalCollectionInventory();
  }
}

export function saveLocalCollectionInventory(data: LocalCollectionInventory): void {
  if (typeof window === 'undefined') return;
  if (!shouldMirrorPgClientStoreToLocalStorage()) return;
  try {
    localStorage.setItem(LOCAL_COLLECTION_INVENTORY_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

/** Ключ для записи артикулов: пустой query → общий пул «по умолчанию». */
export function storageKeyForCollectionId(collectionIdFromQuery: string): string {
  const t = collectionIdFromQuery.trim();
  return t || '__default__';
}

/** Активные коллекции в порядке по умолчанию: SS27 (если не в архиве), затем пользовательские по дате создания. */
export function defaultWorkshop2ActiveIds(inv: LocalCollectionInventory): string[] {
  const ids: string[] = [];
  const sysArchived = (inv.archivedSystemCollectionIds ?? []).includes(
    WORKSHOP2_SYSTEM_COLLECTION_ID
  );
  if (!sysArchived) ids.push(WORKSHOP2_SYSTEM_COLLECTION_ID);
  const userSorted = [...inv.userCollections].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  for (const uc of userSorted) ids.push(uc.id);
  return ids;
}

/** Слить сохранённый порядок с актуальным набором id (новые id в конце в порядке defaultIds). */
export function mergeWorkshop2ActiveOrder(
  inv: LocalCollectionInventory,
  activeIdsDefaultOrder: string[]
): string[] {
  const valid = new Set(activeIdsDefaultOrder);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of inv.workshop2ActiveOrder ?? []) {
    if (valid.has(id) && !seen.has(id)) {
      out.push(id);
      seen.add(id);
    }
  }
  for (const id of activeIdsDefaultOrder) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}

/** Новая коллекция — в начало списка (перед остальными). */
export function prependWorkshop2CollectionToOrder(
  inv: LocalCollectionInventory,
  newCollectionId: string
): LocalCollectionInventory {
  const id = newCollectionId.trim();
  const merged = mergeWorkshop2ActiveOrder(inv, defaultWorkshop2ActiveIds(inv));
  const rest = merged.filter((x) => x !== id);
  return { ...inv, workshop2ActiveOrder: [id, ...rest] };
}

/**
 * Вкл/выкл гвоздик: при включении коллекция переносится на первое место;
 * при выключении порядок не меняется.
 */
export function setWorkshop2CollectionPinned(
  inv: LocalCollectionInventory,
  collectionId: string,
  pinned: boolean
): LocalCollectionInventory {
  const id = collectionId.trim();
  const merged = mergeWorkshop2ActiveOrder(inv, defaultWorkshop2ActiveIds(inv));
  const pins = { ...(inv.workshop2Pinned ?? {}) };
  if (pinned) {
    pins[id] = true;
    const rest = merged.filter((x) => x !== id);
    return { ...inv, workshop2Pinned: pins, workshop2ActiveOrder: [id, ...rest] };
  }
  delete pins[id];
  return { ...inv, workshop2Pinned: pins, workshop2ActiveOrder: merged };
}

function stripWorkshop2OrderAndPin(
  inv: LocalCollectionInventory,
  collectionId: string
): LocalCollectionInventory {
  const id = collectionId.trim();
  const order = (inv.workshop2ActiveOrder ?? []).filter((x) => x !== id);
  const pins = { ...(inv.workshop2Pinned ?? {}) };
  delete pins[id];
  return { ...inv, workshop2ActiveOrder: order, workshop2Pinned: pins };
}

/** Восстановленная коллекция — в конец активного порядка. */
export function appendWorkshop2RestoredToActiveOrder(
  inv: LocalCollectionInventory,
  collectionId: string
): LocalCollectionInventory {
  const id = collectionId.trim();
  const order = [...(inv.workshop2ActiveOrder ?? [])].filter((x) => x !== id);
  order.push(id);
  return { ...inv, workshop2ActiveOrder: order };
}

function slugifyCollectionId(raw: string): string {
  const s = raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 48);
  return s || `COL-${Date.now().toString(36).toUpperCase()}`;
}

export function buildLocalDraftArticle(
  collectionIdFromQuery: string,
  skuCode: string,
  displayName?: string,
  opts?: { investorDemo?: boolean }
): LocalOrderLine {
  const trimmed = collectionIdFromQuery.trim();
  const season = trimmed || 'LOCAL';
  const sku =
    skuCode
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '-')
      .replace(/[^A-Z0-9._-]/g, '') || `SKU-${Date.now()}`;
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    sku,
    name: displayName?.trim() || `Новый артикул · ${sku}`,
    season,
    orderedQuantity: 100,
    price: 18_000,
    deliveryWindowId: 'drop1',
    categoryLeafId: 'women-midi',
    productionSiteId: 'fab-rf-ivanovo',
    productionSiteLabel: 'Фабрика · Иваново (РФ)',
    fabricSuppliers: [],
    fabricMainFromBrandStock: false,
    lineStatus: 'open',
    ...(opts?.investorDemo ? { investorDemo: true } : {}),
  };
}

export function registerUserCollection(
  inv: LocalCollectionInventory,
  rawId: string,
  name: string,
  opts?: {
    description?: string;
    createdBy?: string;
    coverDataUrl?: string;
    targetSeason?: string;
    targetChannel?: string;
    dropDeadlineIso?: string;
    teamNote?: string;
    panelAccentHex?: string;
  }
): { inventory: LocalCollectionInventory; id: string } {
  const id = slugifyCollectionId(rawId);
  const desc = opts?.description?.trim();
  const by = opts?.createdBy?.trim();
  const ts = opts?.targetSeason?.trim();
  const ch = opts?.targetChannel?.trim();
  const ddl = opts?.dropDeadlineIso?.trim();
  const tn = opts?.teamNote?.trim();
  const accent = opts?.panelAccentHex?.trim();
  const row: UserCollectionRow = {
    id,
    name: name.trim() || id,
    createdAt: new Date().toISOString(),
    ...(desc ? { description: desc } : {}),
    ...(by ? { createdBy: by } : {}),
    ...(ts ? { targetSeason: ts } : {}),
    ...(ch ? { targetChannel: ch } : {}),
    ...(ddl ? { dropDeadlineIso: ddl } : {}),
    ...(tn ? { teamNote: tn } : {}),
    ...(accent ? { panelAccentHex: accent } : {}),
  };
  const userCollections = [...inv.userCollections.filter((c) => c.id !== id), row];
  const archivedUserCollections = (inv.archivedUserCollections ?? []).filter((c) => c.id !== id);
  const collectionCovers = { ...(inv.collectionCovers ?? {}) };
  const cover = opts?.coverDataUrl?.trim();
  if (cover) collectionCovers[id] = cover.slice(0, 2_500_000);
  const next = { ...inv, userCollections, archivedUserCollections, collectionCovers };
  return { inventory: prependWorkshop2CollectionToOrder(next, id), id };
}

/** Регистрирует FW27 и др. golden-path коллекции в localStorage перед PG hydrate. */
export function ensureWorkshop2PlatformCoreCollectionInInventory(
  inv: LocalCollectionInventory,
  collectionId: string,
  createdBy: string
): LocalCollectionInventory {
  const cid = collectionId.trim();
  if (!cid || cid === WORKSHOP2_SYSTEM_COLLECTION_ID) return inv;
  if (!PLATFORM_CORE_W2_HYDRATE_COLLECTION_IDS.includes(cid)) return inv;
  if (inv.userCollections.some((c) => c.id === cid)) return inv;
  const preset = PLATFORM_CORE_DEMO_PRESETS[cid];
  const displayName = preset?.collectionId ?? cid;
  return registerUserCollection(inv, cid, displayName, {
    createdBy,
    description: 'Platform Core · PostgreSQL',
    targetSeason: cid,
  }).inventory;
}

export type Workshop2UserCollectionUpdate = {
  name: string;
  description?: string;
  targetSeason?: string;
  targetChannel?: string;
  dropDeadlineIso?: string;
  teamNote?: string;
  /** Задать цвет метки; пустая строка — снять. */
  panelAccentHex?: string;
  /** Новая обложка; `null` — не менять; `''` после trim — удалить обложку. */
  coverDataUrl?: string | null;
};

function patchUserCollectionRow(
  row: UserCollectionRow,
  patch: Workshop2UserCollectionUpdate
): UserCollectionRow {
  const now = new Date().toISOString();
  const name = patch.name.trim() || row.name;
  const next: UserCollectionRow = { ...row, name, updatedAt: now };

  const desc = patch.description?.trim();
  if (patch.description !== undefined) {
    if (desc) next.description = desc;
    else delete next.description;
  }

  const opt = (
    key: 'targetSeason' | 'targetChannel' | 'dropDeadlineIso' | 'teamNote',
    val: string | undefined
  ) => {
    if (val === undefined) return;
    const t = val.trim();
    if (t) (next as Record<string, string>)[key] = t;
    else delete (next as Record<string, unknown>)[key];
  };
  opt('targetSeason', patch.targetSeason);
  opt('targetChannel', patch.targetChannel);
  opt('dropDeadlineIso', patch.dropDeadlineIso);
  opt('teamNote', patch.teamNote);

  if (patch.panelAccentHex !== undefined) {
    const a = patch.panelAccentHex.trim();
    if (a) next.panelAccentHex = a;
    else delete next.panelAccentHex;
  }

  return next;
}

/** Обновить пользовательскую коллекцию (активную или в архиве). Код id не меняется. */
export function updateWorkshop2UserCollection(
  inv: LocalCollectionInventory,
  collectionId: string,
  patch: Workshop2UserCollectionUpdate
): LocalCollectionInventory | null {
  const id = collectionId.trim();
  const activeIdx = inv.userCollections.findIndex((c) => c.id === id);
  const applyCovers = (base: LocalCollectionInventory): LocalCollectionInventory => {
    if (patch.coverDataUrl === undefined) return base;
    const covers = { ...(base.collectionCovers ?? {}) };
    const c = patch.coverDataUrl?.trim();
    if (!c) delete covers[id];
    else covers[id] = c.slice(0, 2_500_000);
    return { ...base, collectionCovers: covers };
  };

  if (activeIdx >= 0) {
    const userCollections = [...inv.userCollections];
    userCollections[activeIdx] = patchUserCollectionRow(userCollections[activeIdx], patch);
    return applyCovers({ ...inv, userCollections });
  }
  const arch = inv.archivedUserCollections ?? [];
  const archIdx = arch.findIndex((c) => c.id === id);
  if (archIdx >= 0) {
    const archivedUserCollections = [...arch];
    archivedUserCollections[archIdx] = patchUserCollectionRow(
      archivedUserCollections[archIdx],
      patch
    );
    return applyCovers({ ...inv, archivedUserCollections });
  }
  return null;
}

export type Workshop2Ss27MetaPatch = {
  displayName?: string;
  description?: string;
  teamNote?: string;
  targetSeason?: string;
  targetChannel?: string;
  dropDeadlineIso?: string;
  /** Задать цвет метки; пустая строка — снять. */
  panelAccentHex?: string;
  /** Как у пользовательских коллекций: undefined — не менять; '' — убрать обложку. */
  coverDataUrl?: string | null;
};

/** Локальные поля карточки демо-коллекции SS27 (не userCollections). */
export function updateWorkshop2Ss27Meta(
  inv: LocalCollectionInventory,
  patch: Workshop2Ss27MetaPatch
): LocalCollectionInventory {
  const id = WORKSHOP2_SYSTEM_COLLECTION_ID;
  let next: LocalCollectionInventory = { ...inv };

  if (patch.coverDataUrl !== undefined) {
    const covers = { ...(next.collectionCovers ?? {}) };
    const c = patch.coverDataUrl === null ? '' : String(patch.coverDataUrl).trim();
    if (!c) delete covers[id];
    else covers[id] = c.slice(0, 2_500_000);
    next = { ...next, collectionCovers: covers };
  }

  const base = { ...(next.workshop2Ss27Meta ?? {}) };

  if (patch.displayName !== undefined) {
    const d = patch.displayName.trim();
    if (!d || d === id) delete base.displayName;
    else base.displayName = d;
  }
  if (patch.description !== undefined) {
    const d = patch.description.trim();
    if (d) base.description = d;
    else delete base.description;
  }
  if (patch.teamNote !== undefined) {
    const t = patch.teamNote.trim();
    if (t) base.teamNote = t;
    else delete base.teamNote;
  }
  const optStr = (
    key: keyof NonNullable<LocalCollectionInventory['workshop2Ss27Meta']>,
    val: string | undefined
  ) => {
    if (val === undefined) return;
    const t = val.trim();
    if (t) (base as Record<string, string>)[key as string] = t;
    else delete (base as Record<string, unknown>)[key as string];
  };
  optStr('targetSeason', patch.targetSeason);
  optStr('targetChannel', patch.targetChannel);
  optStr('dropDeadlineIso', patch.dropDeadlineIso);

  if (patch.panelAccentHex !== undefined) {
    const a = patch.panelAccentHex.trim();
    if (a) base.panelAccentHex = a;
    else delete base.panelAccentHex;
  }

  const workshop2Ss27Meta = Object.keys(base).length ? base : undefined;
  return { ...next, workshop2Ss27Meta };
}

/** Нормализация кода SKU для сравнения дублей (как при создании черновика). */
export function normalizeLocalSkuCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9._-]/g, '');
}

export type Workshop2ArticleCommit =
  | { kind: 'clone'; source: LocalOrderLine; tzSignatoryBindings?: Workshop2TzSignatoryBindings }
  | {
      kind: 'new';
      sku: string;
      categoryLeafId: string;
      name?: string;
      comment?: string;
      audienceId?: string;
      isUnisex?: boolean;
      attachments?: { name: string; dataUrl: string }[];
      tzSignatoryBindings?: Workshop2TzSignatoryBindings;
    };

export type ApplyWorkshop2ArticleResult =
  | { ok: true; inventory: LocalCollectionInventory; newArticleId: string }
  | { ok: false; reason: 'duplicate_sku' };

/** Есть ли в коллекции артикул с тем же нормализованным SKU. */
export function collectionHasNormalizedSku(
  inv: LocalCollectionInventory,
  collectionId: string,
  sku: string
): boolean {
  const key = storageKeyForCollectionId(collectionId);
  const n = normalizeLocalSkuCode(sku);
  if (!n) return false;
  const prev = inv.articlesByCollection[key] ?? [];
  return prev.some((l) => normalizeLocalSkuCode(l.sku) === n);
}

/** Уникальные артикулы по SKU для выбора «из базы» (все коллекции + сиды). */
export function listWorkshop2ArticlePickerLines(
  inv: LocalCollectionInventory,
  seedLines: LocalOrderLine[]
): LocalOrderLine[] {
  const bySku = new Map<string, LocalOrderLine>();
  const put = (line: LocalOrderLine) => {
    const k = normalizeLocalSkuCode(line.sku);
    if (k) bySku.set(k, line);
  };
  for (const lines of Object.values(inv.articlesByCollection)) {
    for (const line of lines) put(line as LocalOrderLine);
  }
  for (const line of seedLines) put(line);
  return Array.from(bySku.values()).sort((a, b) => a.sku.localeCompare(b.sku, 'ru'));
}

function buildWorkshop2NewArticleLine(
  collectionId: string,
  commit: Extract<Workshop2ArticleCommit, { kind: 'new' }>,
  createdBy: string
): LocalOrderLine {
  const canonicalLeaf = resolveHandbookLeafId(commit.categoryLeafId.trim());
  const leaf = findHandbookLeafById(canonicalLeaf) ?? getHandbookCategoryLeaves()[0];
  if (!leaf) throw new Error('handbook');
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const sku =
    normalizeLocalSkuCode(commit.sku) || `W2-${Date.now().toString(36).toUpperCase().slice(-10)}`;
  const season = collectionId.trim() || 'LOCAL';
  const tzB = normalizeWorkshopTzSignatoryBindings(commit.tzSignatoryBindings);
  return {
    id,
    sku,
    name: commit.name?.trim() || `Артикул · ${sku}`,
    season,
    orderedQuantity: 100,
    price: 18_000,
    deliveryWindowId: 'drop1',
    categoryLeafId: leaf.leafId,
    productionSiteId: 'fab-rf-ivanovo',
    productionSiteLabel: 'Фабрика · Иваново (РФ)',
    fabricSuppliers: [],
    fabricMainFromBrandStock: false,
    lineStatus: 'open',
    articleOrigin: 'new',
    workshopComment: commit.comment?.trim() || undefined,
    workshopAttachments: commit.attachments?.length ? commit.attachments : undefined,
    createdInWorkshop2By: createdBy,
    createdInWorkshop2At: new Date().toISOString(),
    ...(commit.audienceId?.trim()
      ? { workshopAudienceId: commit.audienceId.trim(), workshopIsUnisex: commit.isUnisex === true }
      : {}),
    ...(tzB ? { workshopTzSignatoryBindings: tzB } : {}),
    articleCreationMode: 'full_production',
  };
}

/**
 * Пометить локальные строки разработки коллекции как изменённые (кроме id из exceptLineIds) —
 * чтобы в UI чередовались «создан» / «изменён» после смены состава.
 */
export function touchWorkshop2LinesOnCompositionChange(
  inv: LocalCollectionInventory,
  collectionKey: string,
  exceptLineIds: ReadonlySet<string>
): LocalCollectionInventory {
  const list = inv.articlesByCollection[collectionKey];
  if (!list?.length) return inv;
  const now = new Date().toISOString();
  let changed = false;
  const next = list.map((line) => {
    if (exceptLineIds.has(line.id)) return line;
    if (!line.createdInWorkshop2At) return line;
    changed = true;
    return { ...line, updatedInWorkshop2At: now };
  });
  if (!changed) return inv;
  return {
    ...inv,
    articlesByCollection: { ...inv.articlesByCollection, [collectionKey]: next },
  };
}

/** Внутренний commit без touch соседних строк (для массового импорта). */
function applyWorkshop2ArticleCommitInner(
  inv: LocalCollectionInventory,
  collectionId: string,
  commit: Workshop2ArticleCommit,
  createdBy: string
): ApplyWorkshop2ArticleResult {
  const key = storageKeyForCollectionId(collectionId);
  const prev = inv.articlesByCollection[key] ?? [];
  let line: LocalOrderLine;
  let invSeq: LocalCollectionInventory;

  if (commit.kind === 'clone') {
    const skuNorm = normalizeLocalSkuCode(commit.source.sku);
    if (!skuNorm || prev.some((l) => normalizeLocalSkuCode(l.sku) === skuNorm)) {
      return { ok: false, reason: 'duplicate_sku' };
    }
    const [internalCode, invAfterSeq] = takeNextInternalArticleCode(inv);
    invSeq = invAfterSeq;
    const src = commit.source;
    const srcRec = { ...(src as Record<string, unknown>) };
    delete srcRec.internalArticleCode;
    delete srcRec.workshopTzSignatoryBindings;
    const rawCloneBindings =
      commit.tzSignatoryBindings !== undefined
        ? commit.tzSignatoryBindings
        : (src as LocalOrderLine).workshopTzSignatoryBindings;
    const cloneBindings = normalizeWorkshopTzSignatoryBindings(rawCloneBindings);
    line = {
      ...srcRec,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      sku: src.sku,
      articleOrigin: 'base',
      createdInWorkshop2By: createdBy,
      createdInWorkshop2At: new Date().toISOString(),
      updatedInWorkshop2At: undefined,
      internalArticleCode: internalCode,
      ...(cloneBindings ? { workshopTzSignatoryBindings: cloneBindings } : {}),
    } as LocalOrderLine;
    {
      const norm = findHandbookLeafById(String(line.categoryLeafId ?? ''));
      if (norm) line = { ...line, categoryLeafId: norm.leafId };
    }
  } else {
    const rawNorm = normalizeLocalSkuCode(commit.sku);
    if (rawNorm && prev.some((l) => normalizeLocalSkuCode(l.sku) === rawNorm)) {
      return { ok: false, reason: 'duplicate_sku' };
    }
    line = buildWorkshop2NewArticleLine(collectionId, commit, createdBy);
    const finalNorm = normalizeLocalSkuCode(line.sku);
    if (prev.some((l) => normalizeLocalSkuCode(l.sku) === finalNorm)) {
      return { ok: false, reason: 'duplicate_sku' };
    }
    const [internalCode, invAfterSeq] = takeNextInternalArticleCode(inv);
    invSeq = invAfterSeq;
    line = { ...line, internalArticleCode: internalCode };
  }
  const cid = collectionId.trim();
  let nextInv: LocalCollectionInventory = {
    ...invSeq,
    articlesByCollection: {
      ...invSeq.articlesByCollection,
      [key]: [...prev, line],
    },
  };
  const ucIdx = nextInv.userCollections.findIndex((c) => c.id === cid);
  if (ucIdx >= 0) {
    const now = new Date().toISOString();
    const userCollections = [...nextInv.userCollections];
    userCollections[ucIdx] = { ...userCollections[ucIdx], updatedAt: now };
    nextInv = { ...nextInv, userCollections };
  }
  return { ok: true, inventory: nextInv, newArticleId: line.id };
}

/** Добавить артикул в коллекцию в разработке (новый или клон из базы). */
export function applyWorkshop2ArticleCommit(
  inv: LocalCollectionInventory,
  collectionId: string,
  commit: Workshop2ArticleCommit,
  createdBy: string
): ApplyWorkshop2ArticleResult {
  const r = applyWorkshop2ArticleCommitInner(inv, collectionId, commit, createdBy);
  if (!r.ok || !r.newArticleId) return r;
  const key = storageKeyForCollectionId(collectionId);
  return {
    ...r,
    inventory: touchWorkshop2LinesOnCompositionChange(r.inventory, key, new Set([r.newArticleId])),
  };
}

/** Массовое добавление новых артикулов (один дефолтный leaf каталога). */
export function applyWorkshop2BulkNewArticles(
  inv: LocalCollectionInventory,
  collectionId: string,
  rows: { sku: string; name?: string }[],
  categoryLeafId: string,
  createdBy: string
): { inventory: LocalCollectionInventory; added: number; skippedDuplicates: number } {
  let next = inv;
  let added = 0;
  let skippedDuplicates = 0;
  const addedIds: string[] = [];
  for (const row of rows) {
    const r = applyWorkshop2ArticleCommitInner(
      next,
      collectionId,
      {
        kind: 'new',
        sku: row.sku,
        categoryLeafId,
        name: row.name?.trim() || undefined,
      },
      createdBy
    );
    if (!r.ok) {
      skippedDuplicates += 1;
      continue;
    }
    next = r.inventory;
    added += 1;
    if (r.newArticleId) addedIds.push(r.newArticleId);
  }
  const key = storageKeyForCollectionId(collectionId);
  next = touchWorkshop2LinesOnCompositionChange(next, key, new Set(addedIds));
  return { inventory: next, added, skippedDuplicates };
}

/** PG hydrate: добавить опубликованные артикулы с каноническим articleId из PostgreSQL. */
export function applyWorkshop2PgPublishedArticleRows(
  inv: LocalCollectionInventory,
  collectionId: string,
  rows: { articleId: string; sku?: string; name?: string }[],
  categoryLeafId: string,
  createdBy: string
): {
  inventory: LocalCollectionInventory;
  added: number;
  skippedDuplicates: number;
  addedArticleIds: string[];
} {
  const key = storageKeyForCollectionId(collectionId);
  let next = inv;
  let added = 0;
  let skippedDuplicates = 0;
  const addedArticleIds: string[] = [];
  const canonicalLeaf = resolveHandbookLeafId(categoryLeafId.trim());
  const leaf = findHandbookLeafById(canonicalLeaf) ?? getHandbookCategoryLeaves()[0];
  if (!leaf) {
    return { inventory: inv, added: 0, skippedDuplicates: rows.length, addedArticleIds: [] };
  }

  for (const row of rows) {
    const articleId = row.articleId.trim();
    if (!articleId) {
      skippedDuplicates += 1;
      continue;
    }
    const prev = next.articlesByCollection[key] ?? [];
    const skuNorm = normalizeLocalSkuCode(row.sku?.trim() || articleId);
    if (
      prev.some((l) => l.id === articleId || (skuNorm && normalizeLocalSkuCode(l.sku) === skuNorm))
    ) {
      skippedDuplicates += 1;
      continue;
    }
    const sku =
      skuNorm ||
      normalizeLocalSkuCode(articleId) ||
      `W2-${Date.now().toString(36).toUpperCase().slice(-10)}`;
    const season = collectionId.trim() || 'LOCAL';
    const [internalCode, invAfterSeq] = takeNextInternalArticleCode(next);
    next = invAfterSeq;
    const line: LocalOrderLine = {
      id: articleId,
      sku,
      name: row.name?.trim() || `Артикул · ${sku}`,
      season,
      orderedQuantity: 100,
      price: 18_000,
      deliveryWindowId: 'drop1',
      categoryLeafId: leaf.leafId,
      productionSiteId: 'fab-rf-ivanovo',
      productionSiteLabel: 'Фабрика · Иваново (РФ)',
      fabricSuppliers: [],
      fabricMainFromBrandStock: false,
      lineStatus: 'open',
      articleOrigin: 'new',
      createdInWorkshop2By: createdBy,
      createdInWorkshop2At: new Date().toISOString(),
      internalArticleCode: internalCode,
    };
    next = {
      ...next,
      articlesByCollection: {
        ...next.articlesByCollection,
        [key]: [...prev, line],
      },
    };
    added += 1;
    addedArticleIds.push(articleId);
  }

  const cid = collectionId.trim();
  const ucIdx = next.userCollections.findIndex((c) => c.id === cid);
  if (ucIdx >= 0 && addedArticleIds.length > 0) {
    const now = new Date().toISOString();
    const userCollections = [...next.userCollections];
    userCollections[ucIdx] = { ...userCollections[ucIdx], updatedAt: now };
    next = { ...next, userCollections };
  }

  next = touchWorkshop2LinesOnCompositionChange(next, key, new Set(addedArticleIds));
  return { inventory: next, added, skippedDuplicates, addedArticleIds };
}

/** Wave 8b · UI-only поля, разрешённые при PG-authoritative inventory. */
export function isUiOnlyWorkshop2LinePatch(patch: Workshop2ArticleLinePatch): boolean {
  const keys = Object.keys(patch) as (keyof Workshop2ArticleLinePatch)[];
  return keys.length > 0 && keys.every((k) => k === 'articleCreationMode');
}

export type Workshop2ArticleLinePatch = {
  workshopComment?: string;
  name?: string;
  sku?: string;
  categoryLeafId?: string;
  workshopAttachments?: { name: string; dataUrl: string }[];
  workshopTags?: string[];
  workshopLineSeason?: string;
  /** `null` — снять закрепление подписантов в строке инвентаря. */
  workshopTzSignatoryBindings?: Workshop2TzSignatoryBindings | null;
  articleCreationMode?: 'full_production' | 'buy_or_import';
};

/** Обновить поля строки артикула в разработке коллекции (имя, комментарий, категория, вложения). */
export function patchWorkshop2ArticleLine(
  inv: LocalCollectionInventory,
  collectionId: string,
  articleId: string,
  patch: Workshop2ArticleLinePatch
): LocalCollectionInventory | null {
  const key = storageKeyForCollectionId(collectionId);
  const list = inv.articlesByCollection[key];
  if (!list?.length) return null;
  const idx = list.findIndex((l) => l.id === articleId);
  if (idx < 0) return null;
  const line = list[idx]!;
  const now = new Date().toISOString();
  const leaf =
    patch.categoryLeafId !== undefined
      ? findHandbookLeafById(patch.categoryLeafId.trim())
      : undefined;
  const nextLine: LocalOrderLine = {
    ...line,
    ...(patch.sku !== undefined && { sku: patch.sku.trim() || line.sku }),
    ...(patch.name !== undefined && { name: patch.name.trim() || line.name }),
    ...(patch.workshopComment !== undefined && {
      workshopComment: patch.workshopComment.trim() || undefined,
    }),
    ...(leaf ? { categoryLeafId: leaf.leafId } : {}),
    updatedInWorkshop2At: now,
  };
  if (patch.workshopAttachments !== undefined) {
    if (patch.workshopAttachments.length > 0) {
      nextLine.workshopAttachments = patch.workshopAttachments.map((a) => ({
        name: a.name,
        dataUrl: a.dataUrl,
      }));
    } else {
      delete nextLine.workshopAttachments;
    }
  }

  if (patch.workshopTags !== undefined) {
    if (patch.workshopTags.length > 0) nextLine.workshopTags = [...patch.workshopTags];
    else delete nextLine.workshopTags;
  }
  if (patch.workshopLineSeason !== undefined) {
    const s = patch.workshopLineSeason.trim();
    if (s) nextLine.workshopLineSeason = s;
    else delete nextLine.workshopLineSeason;
  }
  if (patch.articleCreationMode !== undefined) {
    nextLine.articleCreationMode = patch.articleCreationMode;
  }

  if (patch.workshopTzSignatoryBindings !== undefined) {
    if (patch.workshopTzSignatoryBindings === null) {
      delete nextLine.workshopTzSignatoryBindings;
    } else {
      const n = normalizeWorkshopTzSignatoryBindings(patch.workshopTzSignatoryBindings);
      if (n) nextLine.workshopTzSignatoryBindings = n;
      else delete nextLine.workshopTzSignatoryBindings;
    }
  }
  const nextList = [...list];
  nextList[idx] = nextLine;
  let nextInv: LocalCollectionInventory = {
    ...inv,
    articlesByCollection: { ...inv.articlesByCollection, [key]: nextList },
  };
  const cid = collectionId.trim();
  const ucIdx = nextInv.userCollections.findIndex((c) => c.id === cid);
  if (ucIdx >= 0) {
    const userCollections = [...nextInv.userCollections];
    userCollections[ucIdx] = { ...userCollections[ucIdx], updatedAt: now };
    nextInv = { ...nextInv, userCollections };
  }
  const archIdx = (nextInv.archivedUserCollections ?? []).findIndex((c) => c.id === cid);
  if (archIdx >= 0) {
    const archivedUserCollections = [...(nextInv.archivedUserCollections ?? [])];
    archivedUserCollections[archIdx] = {
      ...archivedUserCollections[archIdx],
      updatedAt: now,
    };
    nextInv = { ...nextInv, archivedUserCollections };
  }
  return nextInv;
}

export function removeArticleFromInventory(
  inv: LocalCollectionInventory,
  collectionKey: string,
  articleId: string,
  collectionIdForUserTouch?: string
): LocalCollectionInventory {
  const list = inv.articlesByCollection[collectionKey] ?? [];
  const nextList = list.filter((a) => a.id !== articleId);
  const articlesByCollection = { ...inv.articlesByCollection };
  if (nextList.length === 0) delete articlesByCollection[collectionKey];
  else articlesByCollection[collectionKey] = nextList;
  let nextInv: LocalCollectionInventory = { ...inv, articlesByCollection };
  if (nextList.length > 0) {
    nextInv = touchWorkshop2LinesOnCompositionChange(nextInv, collectionKey, new Set());
  }
  const touchId = collectionIdForUserTouch?.trim();
  if (touchId) {
    const ucIdx = nextInv.userCollections.findIndex((c) => c.id === touchId);
    if (ucIdx >= 0) {
      const now = new Date().toISOString();
      const userCollections = [...nextInv.userCollections];
      userCollections[ucIdx] = { ...userCollections[ucIdx], updatedAt: now };
      nextInv = { ...nextInv, userCollections };
    }
  }
  return nextInv;
}

export function removeUserCollectionFromInventory(
  inv: LocalCollectionInventory,
  collectionId: string
): LocalCollectionInventory {
  const id = collectionId.trim();
  const { [id]: _removed, ...restArticles } = inv.articlesByCollection;
  const userCollections = inv.userCollections.filter((c) => c.id !== id);
  const archivedUserCollections = (inv.archivedUserCollections ?? []).filter((c) => c.id !== id);
  const archivedSystemCollectionIds = (inv.archivedSystemCollectionIds ?? []).filter(
    (x) => x !== id
  );
  return {
    ...inv,
    articlesByCollection: restArticles,
    userCollections,
    archivedUserCollections,
    archivedSystemCollectionIds,
  };
}

/** Перенос пользовательской коллекции в архив (статьи по ключу id сохраняются для восстановления). */
export function archiveUserCollection(
  inv: LocalCollectionInventory,
  collectionId: string
): LocalCollectionInventory | null {
  const id = collectionId.trim();
  const row = inv.userCollections.find((c) => c.id === id);
  if (!row) return null;
  const userCollections = inv.userCollections.filter((c) => c.id !== id);
  const prevArch = inv.archivedUserCollections ?? [];
  const archivedUserCollections = [
    { ...row, archivedAt: new Date().toISOString() },
    ...prevArch.filter((c) => c.id !== id),
  ];
  return { ...inv, userCollections, archivedUserCollections };
}

/** Вернуть коллекцию из архива в активные. */
export function restoreUserCollectionFromArchive(
  inv: LocalCollectionInventory,
  collectionId: string
): LocalCollectionInventory | null {
  const id = collectionId.trim();
  const archived = inv.archivedUserCollections ?? [];
  const row = archived.find((c) => c.id === id);
  if (!row) return null;
  const { archivedAt: _a, ...rest } = row;
  const archivedUserCollections = archived.filter((c) => c.id !== id);
  const userCollections = [...inv.userCollections.filter((c) => c.id !== id), rest];
  return { ...inv, userCollections, archivedUserCollections };
}

/** Архив: пользовательская коллекция или системная SS27. */
export function archiveWorkshop2Collection(
  inv: LocalCollectionInventory,
  collectionId: string
): LocalCollectionInventory | null {
  const id = collectionId.trim();
  if (id === WORKSHOP2_SYSTEM_COLLECTION_ID) {
    const prev = inv.archivedSystemCollectionIds ?? [];
    if (prev.includes(id)) return inv;
    const next = { ...inv, archivedSystemCollectionIds: [id, ...prev.filter((x) => x !== id)] };
    return stripWorkshop2OrderAndPin(next, id);
  }
  const userArchived = archiveUserCollection(inv, id);
  return userArchived ? stripWorkshop2OrderAndPin(userArchived, id) : null;
}

/** Восстановить из архива (пользовательская или SS27). */
export function restoreWorkshop2Collection(
  inv: LocalCollectionInventory,
  collectionId: string
): LocalCollectionInventory | null {
  const id = collectionId.trim();
  if (id === WORKSHOP2_SYSTEM_COLLECTION_ID) {
    const archivedSystemCollectionIds = (inv.archivedSystemCollectionIds ?? []).filter(
      (x) => x !== id
    );
    return appendWorkshop2RestoredToActiveOrder({ ...inv, archivedSystemCollectionIds }, id);
  }
  const restored = restoreUserCollectionFromArchive(inv, id);
  return restored ? appendWorkshop2RestoredToActiveOrder(restored, id) : null;
}

export function parseInventoryImportJson(raw: string): LocalCollectionInventory | null {
  try {
    const p = JSON.parse(raw) as LocalCollectionInventory;
    if (p?.v !== 1 || typeof p.articlesByCollection !== 'object' || p.articlesByCollection === null)
      return null;
    return {
      v: 1,
      articlesByCollection: p.articlesByCollection,
      userCollections: Array.isArray(p.userCollections) ? p.userCollections : [],
      archivedUserCollections: Array.isArray(p.archivedUserCollections)
        ? p.archivedUserCollections
        : [],
      collectionCovers:
        typeof p.collectionCovers === 'object' && p.collectionCovers !== null
          ? p.collectionCovers
          : {},
      archivedSystemCollectionIds: Array.isArray(p.archivedSystemCollectionIds)
        ? p.archivedSystemCollectionIds
        : [],
      workshop2ActiveOrder: Array.isArray(p.workshop2ActiveOrder)
        ? p.workshop2ActiveOrder.filter((x): x is string => typeof x === 'string')
        : undefined,
      workshop2Pinned:
        typeof p.workshop2Pinned === 'object' &&
        p.workshop2Pinned !== null &&
        !Array.isArray(p.workshop2Pinned)
          ? (p.workshop2Pinned as Record<string, boolean>)
          : undefined,
    };
  } catch {
    return null;
  }
}

export function mergeImportInventories(
  base: LocalCollectionInventory,
  incoming: LocalCollectionInventory
): LocalCollectionInventory {
  const articlesByCollection = { ...base.articlesByCollection };
  for (const [k, rows] of Object.entries(incoming.articlesByCollection)) {
    if (!Array.isArray(rows)) continue;
    const prev = articlesByCollection[k] ?? [];
    const byId = new Map(prev.map((a) => [a.id, a]));
    for (const row of rows) {
      if (row && typeof row.id === 'string') byId.set(row.id, row as LocalOrderLine);
    }
    articlesByCollection[k] = Array.from(byId.values());
  }
  const uc = new Map(base.userCollections.map((c) => [c.id, c]));
  for (const c of incoming.userCollections) uc.set(c.id, c);
  const ar = new Map((base.archivedUserCollections ?? []).map((c) => [c.id, c]));
  for (const c of incoming.archivedUserCollections ?? []) ar.set(c.id, c);
  const collectionCovers = {
    ...(base.collectionCovers ?? {}),
    ...(incoming.collectionCovers ?? {}),
  };
  const sys = new Set([
    ...(base.archivedSystemCollectionIds ?? []),
    ...(incoming.archivedSystemCollectionIds ?? []),
  ]);
  const workshop2Pinned = {
    ...(base.workshop2Pinned ?? {}),
    ...(incoming.workshop2Pinned ?? {}),
  };
  return {
    v: 1,
    articlesByCollection,
    userCollections: Array.from(uc.values()),
    archivedUserCollections: Array.from(ar.values()),
    collectionCovers,
    archivedSystemCollectionIds: Array.from(sys),
    workshop2ActiveOrder: incoming.workshop2ActiveOrder ?? base.workshop2ActiveOrder,
    workshop2Pinned,
  };
}

export function exportInventoryJson(inv: LocalCollectionInventory): string {
  return JSON.stringify(inv, null, 2);
}
