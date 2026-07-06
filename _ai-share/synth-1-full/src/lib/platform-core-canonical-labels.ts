/**
 * Канон подписей Platform Core: русский UI, латинские аббревиатуры с расшифровкой.
 */

import { isPlatformCoreExtendedRolesEnabled } from '@/lib/platform-core-article-spine';

export const PLATFORM_CORE_CABINET_TITLE = 'Мой кабинет';
export const PLATFORM_CORE_CABINET_LEAD =
  'Пять столпов цепочки — одна структура у всех ролей.';

/** Hub / header — тот же тон, что «Роли · быстрый вход». */
export const PLATFORM_CORE_HUB_TITLE = 'SYNTHA · Platform Core';

/** Хлебная крошка «назад на главную» — без слова Hub. */
export const PLATFORM_CORE_HOME_CRUMB = 'Platform';

/** Полоска 3 шагов на главной (без производства). */
export const PLATFORM_CORE_CHAIN_STRIP_TITLE = 'Операционная цепочка';

/** Блок аудита на главной. */
export const PLATFORM_CORE_AUDIT_SECTION_TITLE = 'Оценка готовности';
export const PLATFORM_CORE_AUDIT_SECTION_LEAD_EXTENDED =
  'Честные оценки по ролям, столпам и разделам · live при PG, иначе статическая база аудита.';
export const PLATFORM_CORE_AUDIT_SECTION_LEAD_BASELINE =
  'Бренд и магазин · оценки по столпам и разделам · связи shop↔brand по цепочке · live при PG, иначе статическая база аудита.';

/** Подзаголовок audit-блока: two-role baseline vs 4 роли с extended flag. */
export function platformCoreAuditSectionLead(): string {
  return isPlatformCoreExtendedRolesEnabled()
    ? PLATFORM_CORE_AUDIT_SECTION_LEAD_EXTENDED
    : PLATFORM_CORE_AUDIT_SECTION_LEAD_BASELINE;
}

/** Заголовок блока sidebar в core вместо «Основной контур · ядра 1–3». */
export const PLATFORM_CORE_SIDEBAR_CLUSTER_LABEL = 'Цепочка · 5 столпов';

/** Цех разработки — не «сезон SS27», а хранилище разработки артикулов. */
export const W2_WORKSPACE_SHORT = 'Цех разработки';
export const W2_WORKSPACE_LABEL = 'Цех разработки · артикулы';
export const W2_WORKSPACE_LEAD =
  'Наброски, техзадание и досье всех артикулов — для коллекций и индивидуального пошива. Сезон появляется при сборке коллекции в лайншитах.';

export const LINESHEETS_LABEL = 'Лайншиты · коллекции';
export const LINESHEETS_LEAD =
  'Отработанные артикулы; бренд собирает коллекции и открывает их для витрины и оптовых заказов магазинов.';

export const SHOWROOM_BRAND_LABEL = 'Витрина бренда';
export const SHOWROOM_BRAND_LEAD =
  'Единая витрина: внутри — создаваемые коллекции из опубликованных артикулов.';

/** Столп 1 бренда — как в hub `development`. */
export const BRAND_DEVELOPMENT_GROUP_LABEL = 'Разработка';

/** Entity-label столпа development в hub/cabinet — артикулы, без сезона коллекции. */
export const DEVELOPMENT_PILLAR_ENTITY_LABEL = 'Разработка · артикулы';

/** Столп 4 бренда / цеха — как в hub `order_production`. */
export const BRAND_PRODUCTION_GROUP_LABEL = 'Производство';
export const MFR_PRODUCTION_GROUP_LABEL = 'Производство';

/** Столп 5 — везде одинаково. */
export const COMMS_GROUP_LABEL = 'Связь';

/** Столп 2 бренда в core: лайншиты + витрина, без legacy PIM «Товары/Коллекции». */
export const BRAND_PIM_GROUP_LABEL = 'Коллекция и витрина';

export const RETAILERS_LABEL = 'Ритейлеры';

/** Столп 3 бренда / магазина в core — как в hub `collection_order`. */
export const BRAND_B2B_GROUP_LABEL = 'Оптовые заказы';
export const SHOP_B2B_GROUP_LABEL = 'Оптовые заказы';

/** Столп 2+3 магазина в core: витрина и матрица, без side-path планирования. */
export const SHOP_PIM_GROUP_LABEL = 'Витрина и заказ';
export const SHOP_PARTNERS_GROUP_LABEL = 'Партнёры брендов';

/** Столп поставщика в core: BOM и закупка под PO. */
export const SUPPLIER_PIM_GROUP_LABEL = 'Материалы и закупка';

export const SHOWROOM_SHOP_LABEL = 'Витрина · коллекции брендов';
export const SHOWROOM_SHOP_LEAD =
  'Коллекции, которые бренд открыл для вашей аудитории; внутри — матрица размеров и полноценный оптовый заказ.';

export const MATRIX_ORDER_LABEL = 'Матрица заказа';
export const MY_CABINET_LABEL = 'Мой кабинет';

/** Подписи empty-bridge панелей (без «mini-workspace» / investor-жаргона). */
export const B2B_TO_PO_WORKSPACE_LABEL = 'Оптовый заказ → производственный заказ';
export const BRAND_COLLECTION_BRIDGE_LABEL = 'Коллекция у бренда';
export const PRODUCTION_HANDOFF_QUEUE_RU = 'В очереди передачи в производство';
export const PRODUCTION_HANDOFF_PENDING_RU = 'Ожидает передачи в производство';
export const PRODUCTION_HANDOFF_DONE_RU = 'Передан в производство';
export const PRODUCTION_HANDOFF_AWAITING_BRAND_RU =
  'Ожидает подтверждения бренда для передачи в цех';
export const PRODUCTION_HANDOFF_QUEUE_LINK_RU = 'Очередь передачи в производство';
export const SHOP_CORE_CHAIN_SECTION_TITLE = 'Основная цепочка опта';

export const SHOP_B2B_CHECKOUT_LEAD =
  'Подтверждение оптового заказа: позиции из корзины сохраняются в базе данных цепочки.';

/** Честный статус: резерв склада — после подтверждения брендом и передачи в цех, не при checkout. */
export { PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU as SHOP_B2B_CHECKOUT_INVENTORY_HOLD_RU } from '@/lib/platform-core-wms-reserve-copy';

/** Канонический календарь магазина в Platform Core — `/shop/b2b/calendar`. */
export const SHOP_CANONICAL_CALENDAR_LAYERS = 'orders,logistics';

/** Аббревиатуры: EN + перевод (для tooltip). */
export const PLATFORM_CORE_TERM_TIPS: Record<
  string,
  { en: string; ru: string; labelRu: string }
> = {
  W2: {
    en: 'Workshop 2 — article development workspace',
    ru: 'Цех разработки — разработка артикулов и хранилище досье',
    labelRu: 'W2',
  },
  B2B: {
    en: 'Business-to-business wholesale',
    ru: 'Оптовые заказы между брендом и магазином',
    labelRu: 'B2B',
  },
  PO: {
    en: 'Production Order',
    ru: 'Производственный заказ — партия в цехе после передачи',
    labelRu: 'PO',
  },
  BOM: {
    en: 'Bill of Materials',
    ru: 'Спецификация материалов и фурнитуры',
    labelRu: 'BOM',
  },
  RFQ: {
    en: 'Request for Quotation',
    ru: 'Запрос цены у поставщика',
    labelRu: 'RFQ',
  },
  Handoff: {
    en: 'Brand confirms order → factory PO queue',
    ru: 'Передача подтверждённого заказа в производство',
    labelRu: 'Передача',
  },
  PG: {
    en: 'PostgreSQL — live chain data',
    ru: 'PostgreSQL — живая цепочка после загрузки данных',
    labelRu: 'PG',
  },
};
