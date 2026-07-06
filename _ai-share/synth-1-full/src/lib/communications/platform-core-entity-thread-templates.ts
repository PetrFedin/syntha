export type PlatformCoreEntityThreadKind =
  | 'bom'
  | 'sample'
  | 'qc'
  | 'rfq'
  | 'dossier'
  | 'handoff';

export type PlatformCoreEntityThreadTemplate = {
  id: string;
  labelRu: string;
  threadKind: PlatformCoreEntityThreadKind;
  buildBody: (ctx: {
    orderId?: string;
    collectionId?: string;
    articleId?: string;
    threadKind?: string;
  }) => string;
};

export const PLATFORM_CORE_ENTITY_THREAD_TEMPLATES: PlatformCoreEntityThreadTemplate[] = [
  {
    id: 'bom-rfq',
    labelRu: 'Запрос по BOM',
    threadKind: 'bom',
    buildBody: ({ articleId, collectionId }) =>
      `По артикулу ${articleId ?? '—'} (${collectionId ?? 'коллекция'}): уточните строку BOM и срок поставки материала.`,
  },
  {
    id: 'sample-round',
    labelRu: 'Раунд образца',
    threadKind: 'sample',
    buildBody: ({ articleId }) =>
      `Образец по артикулу ${articleId ?? '—'}: прошу зафиксировать комментарии fit и следующий раунд.`,
  },
  {
    id: 'qc-gate',
    labelRu: 'QC gate',
    threadKind: 'qc',
    buildBody: ({ orderId, articleId }) =>
      `QC по ${articleId ? `артикулу ${articleId}` : 'заказу'}${orderId ? ` · ${orderId}` : ''}: нужен чеклист AQL перед отгрузкой.`,
  },
  {
    id: 'centric-rfq',
    labelRu: 'Centric RFQ',
    threadKind: 'rfq',
    buildBody: ({ articleId, collectionId }) =>
      `RFQ по ${articleId ?? 'артикулу'} (${collectionId ?? 'коллекция'}): прошу quote и lead time.`,
  },
  {
    id: 'dossier-tz',
    labelRu: 'Уточнить досье',
    threadKind: 'dossier',
    buildBody: ({ articleId, collectionId }) =>
      `Досье ${articleId ?? '—'} (${collectionId ?? 'коллекция'}): нужны правки ТЗ перед передачей в цех.`,
  },
  {
    id: 'handoff-po',
    labelRu: 'Handoff PO',
    threadKind: 'handoff',
    buildBody: ({ orderId }) =>
      `Передача в производство по заказу ${orderId ?? '—'}: подтвердите очередь PO и сроки.`,
  },
];

export function resolvePlatformCoreEntityThreadTemplates(input: {
  threadKind?: PlatformCoreEntityThreadKind | string | null;
}): PlatformCoreEntityThreadTemplate[] {
  const kind = input.threadKind?.trim();
  if (!kind) return PLATFORM_CORE_ENTITY_THREAD_TEMPLATES;
  return PLATFORM_CORE_ENTITY_THREAD_TEMPLATES.filter((t) => t.threadKind === kind);
}
