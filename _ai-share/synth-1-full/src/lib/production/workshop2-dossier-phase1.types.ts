import type {
  Workshop2BomLineCostingHint,
  Workshop2BomLineDeltaDraft,
  Workshop2MaterialAlternativeDraft,
} from '@/lib/production/workshop2-dossier-view-infrastructure';
import type { Workshop2SampleEconomicsDraft } from '@/lib/production/workshop2-sample-economics.types';
import type { Workshop2CeilingJournalEntry } from '@/lib/production/workshop2-ceiling-staging-core';

/**
 * Модель досье фазы 1 разработки коллекции — соответствует schemas/workshop2-dossier-phase1.json.
 */

export type Workshop2Phase1ValueSource = 'handbook_parameter' | 'free_text' | 'numeric';

export type Workshop2Phase1AttributeValue = {
  valueId: string;
  valueSource: Workshop2Phase1ValueSource;
  parameterId?: string;
  handbookEntryId?: string;
  text?: string;
  number?: number;
  displayLabel: string;
};

export type Workshop2Phase1AssignmentKind = 'canonical' | 'custom_proposed';

export type Workshop2Phase1CustomProposed = {
  label: string;
  note?: string;
};

export type Workshop2Phase1AttributeAssignment = {
  assignmentId: string;
  kind: Workshop2Phase1AssignmentKind;
  attributeId?: string;
  customProposed?: Workshop2Phase1CustomProposed;
  values: Workshop2Phase1AttributeValue[];
};

/** Где лежат байты оригинала (кроме сессионного blob: в компоненте). */
export type Workshop2Phase1TechPackByteStorage = 'dataurl' | 'idb' | 'session';

/** Семантика файла (для фильтров и политик). */
export type Workshop2Phase1TechPackSourceKind = 'pdf' | 'image' | 'cad' | 'archive' | 'other';

export type Workshop2Phase1TechPackAttachment = {
  attachmentId: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  /**
   * Data URL; для крупных файлов может отсутствовать — тогда `byteStorage` idb|session
   * и/или `previewThumbnailDataUrl` для списка.
   */
  previewDataUrl?: string;
  revisionNote?: string;
  /**
   * Где хранятся байты; по умолчанию считаем `dataurl`, если задан `previewDataUrl`, иначе
   * устаревшие записи без поля.
   */
  byteStorage?: Workshop2Phase1TechPackByteStorage;
  /**
   * Миниатюра (jpeg data URL, ~2–20 KB) для списка без тянуть полный base64.
   * Для `idb` с изображениями — заполняется на загрузке.
   */
  previewThumbnailDataUrl?: string;
  /** SHA-256, первые 16 hex (аудит / дедуп). */
  contentSha256?: string;
  /** Кто загрузил файл (подпись сессии бренда). */
  uploadedBy?: string;
  /** ISO, время добавления вложения. */
  uploadedAt?: string;
  sourceKind?: Workshop2Phase1TechPackSourceKind;
  /** «К производству» — опциональная ручная отметка (ISO). */
  productionMarkedAt?: string;
  /** S3/объектное хранилище: ключ объекта после успешной выгрузки. */
  remoteObjectKey?: string;
  /**
   * Синхронизация с бэкендом (когда API и облако включены).
   * `local` — только этот браузер / localStorage+IDB; `pending` — в очереди; `synced` — копия в облаке.
   */
  remoteSyncState?: 'local' | 'pending' | 'uploading' | 'synced' | 'failed';
  remoteSyncedAt?: string;
  /** Последняя ошибка upload (сеть/403/валидация). */
  remoteLastError?: string;
  /** Инкремент при повторной заливке того же вложения. */
  remoteContentVersion?: number;
  /**
   * Канон для аудита: после успешного `complete` на сервере — верифицированный объект в хранилище.
   * `local_only` — байты не подтверждены бэкендом (только клиент/LS/IDB).
   */
  canonicalSource?: 'local_only' | 'object_store_verified';
  /** SHA-256 полный (64 hex), зафиксированный при серверной проверке (не путать с 16-hex в UI). */
  integritySha256Full?: string;
  /** ETag S3 после HeadObject/complete. */
  objectStoreEtag?: string;
  /** Когда сервер подтвердил размер+magic+hash. */
  serverIntegrityVerifiedAt?: string;
  /**
   * Неизменяемая отметка «отдали в работу с этим содержимым»; повтор — только новый `attachmentId`/файл.
   */
  productionImmutableSeal?: { at: string; by: string; contentSha256Full: string };
};

/** Канал передачи пакета в сторону фабрики (доменная модель; интеграции подключаются снаружи). */
export type Workshop2FactoryHandoffChannel = 'portal' | 'email' | 'edi' | 'zip_download' | 'other';

export type Workshop2TechPackHandoffStatus =
  | 'draft'
  | 'sent'
  | 'acknowledged'
  | 'accepted'
  | 'rejected'
  | 'amendment_requested';

/** Согласованный пакет tech pack к цеху: кто, когда, ревизия, ответ. */
export type Workshop2TechPackFactoryHandoff = {
  handoffId: string;
  createdAt: string;
  createdBy: string;
  /** Бренд: отметка «передано» (до фиксации пакета). */
  brandDispatchedAt?: string;
  brandDispatchedBy?: string;
  /** Производство: отметка «получено» (до фиксации пакета). */
  factoryReceivedAt?: string;
  factoryReceivedBy?: string;
  packageRevisionLabel: string;
  windowNote?: string;
  contactLabel?: string;
  channel: Workshop2FactoryHandoffChannel;
  status: Workshop2TechPackHandoffStatus;
  sentAt?: string;
  factoryResponseAt?: string;
  /** В демо — произвольная подпись ответа («ОТК фабрики»). */
  factoryResponseBy?: string;
  factoryComment?: string;
  /** Вложения, входящие в эту передачу. */
  attachmentIds: string[];
  /**
   * Снимок проверенных на сервере вложений на момент фиксации передачи (`object_store_verified`).
   * Для аудита: ключ объекта и хеш после `tech-pack/complete`.
   */
  verifiedTechPackAuditAtSend?: {
    attachmentId: string;
    remoteObjectKey?: string;
    integritySha256Full?: string;
    remoteSyncedAt?: string;
    objectStoreEtag?: string;
  }[];
};

/** Режим хранения досье: демо в браузере vs целевой сервер (флаг для UI, не заменяет persist). */
export type Workshop2DossierStorageTarget = 'browser_local' | 'server_target';

export type Workshop2SketchAnnotationType =
  | 'construction'
  | 'material'
  | 'fit'
  | 'finishing'
  | 'hardware'
  | 'labeling'
  | 'qc';

export type Workshop2SketchAnnotationPriority = 'critical' | 'important' | 'note';

export type Workshop2SketchAnnotationStatus = 'new' | 'in_progress' | 'done' | 'rejected';

export type Workshop2SketchAnnotationStage = 'tz' | 'sample' | 'prelaunch' | 'release' | 'qc';

export type Workshop2ProductionTaskStatus = 'new' | 'in_progress' | 'done' | 'blocked';

export type Workshop2ProductionTaskPriority = 'critical' | 'high' | 'normal';

export type Workshop2ProductionTaskStage = 'tz' | 'supply' | 'fit' | 'plan' | 'release' | 'qc';

/** Комментарий / тред у метки (как в документе; упоминания @роль — текстом). */
export type Workshop2SketchPinThreadComment = {
  commentId: string;
  /** ISO-8601 */
  at: string;
  by: string;
  body: string;
  parentCommentId?: string;
  /** Выделенные @упоминания (роли/метки), парсятся из текста в UI. */
  mentions?: string[];
  /** Событие в календаре коллаборации (localStorage), если создали из треда. */
  linkedCalendarEventId?: string;
  /** Заглушка под push/in-app: пометить после сохранения комментария с @упоминаниями. */
  mentionNotifyPending?: boolean;
};

/** Код дефекта MES / ОТК (иерархия L1→L2 через parentCode). */
export type Workshop2MesDefectCodeRow = {
  code: string;
  label: string;
  parentCode?: string;
};

/** Этапы маршрута разработки коллекции (вкладки воркспейса, привязка метки скетча). */
export type Workshop2TzSignoffStageId =
  | 'tz'
  | 'sample'
  | 'supply'
  | 'fit'
  | 'plan'
  | 'release'
  | 'qc';

/** Активные вкладки ТЗ в навигации (4 шт.). */
export type Workshop2TzPanelSectionId =
  | 'general'
  | 'visuals'
  | 'material'
  | 'construction'
  /** Пакет в цех: tech pack, ZIP, фиксация передачи (отдельная вкладка ТЗ «Задание»). */
  | 'assignment';

/** Устаревшие ключи в сохранённых метках (табель мер / упаковка вынесены в конструкцию и материалы). */
export type Workshop2TzPanelSectionKeyStored =
  | Workshop2TzPanelSectionId
  | 'measurements'
  | 'packaging';

/** Что именно берём с референса (решение, не только файл). */
export type Workshop2VisualRefTakeawayAspect =
  | 'silhouette'
  | 'color'
  | 'hardware'
  | 'fit'
  | 'fabric'
  | 'mood'
  | 'other';

/** Структурированный замысел (не только комментарии к картинкам). */
export type Workshop2DesignerIntentBlock = {
  /** Настроение / направление одной строкой. */
  mood?: string;
  /** До 5 тезисов; пустые строки в UI отбрасываются при сохранении. */
  bullets?: string[];
};

/** Чеклист готовности «Визуал» для менеджера (ручные галочки). */
export type Workshop2VisualReadinessChecklist = {
  refsAttached?: boolean;
  sketchWithPins?: boolean;
  floorReferenceReady?: boolean;
  refThreadsResolved?: boolean;
  canonicalArtifactSet?: boolean;
  designerIntentFilled?: boolean;
  versionOrSnapshotRecorded?: boolean;
};

/** Запись в журнале версий визуала (текстово, без бинарного diff). */
export type Workshop2VisualVersionLogEntry = {
  entryId: string;
  /** ISO-8601 */
  at: string;
  by: string;
  /** Подпись версии, напр. v3 или 2026-04-01-handoff */
  versionLabel: string;
  /** Что изменилось относительно предыдущего согласования. */
  changeSummary: string;
};

/** Утверждённые «главные» артефакты для подписи / передачи. */
export type Workshop2CanonicalSketchTarget =
  | { kind: 'master' }
  | { kind: 'sheet'; sheetId: string };

/** Метка на доске «скетч категории» (координаты в процентах подложки). */
export type Workshop2Phase1CategorySketchAnnotation = {
  annotationId: string;
  /** Лист справочника на момент создания; при смене категории метки других листов скрываются. */
  categoryLeafId: string;
  /** 0–100, от левого края подложки. */
  xPct: number;
  /** 0–100, от верхнего края подложки. */
  yPct: number;
  /**
   * Конец линии линейного размера (в процентах подложки). Если заданы оба — на доске рисуется линия
   * от (xPct,yPct) до конца; подпись и число — в `dimensionLabel` / `dimensionValueText`.
   */
  lineEndXPct?: number;
  lineEndYPct?: number;
  /** Что измеряется: рукав, пояс, манжет и т.п. */
  dimensionLabel?: string;
  /** Значение в см/мм и т.д. */
  dimensionValueText?: string;
  text: string;
  annotationType?: Workshop2SketchAnnotationType;
  priority?: Workshop2SketchAnnotationPriority;
  status?: Workshop2SketchAnnotationStatus;
  stage?: Workshop2SketchAnnotationStage;
  owner?: string;
  linkedAttributeId?: string;
  linkedQcZoneId?: string;
  /** `slotId` слота подкатегории (L1/L2/L3), см. `subcategorySketchSlots`. */
  linkedTaskId?: string;
  dueDate?: string;
  /** Фото с цеха / ОТК к метке (data URL; крупные файлы могут не сохраниться в local JSON). */
  proofPhotoDataUrl?: string;
  proofPhotoFileName?: string;
  proofStatus?: 'pending' | 'accepted' | 'rejected';
  /** Раздел ТЗ — открыть одним кликом из карточки метки. */
  linkedTzSectionKey?: Workshop2TzPanelSectionKeyStored;
  /** Этап маршрута SKU (вкладка операционного контура). */
  linkedRouteStageId?: Workshop2TzSignoffStageId;
  /** Ссылка на строку BOM / материал (id строки PIM/PLM или произвольная метка). */
  linkedBomLineRef?: string;
  /** Человекочитаемое описание материала/узла для цеха. */
  linkedMaterialNote?: string;
  /** Код дефекта из справочника `sketchMesDefectCatalog`. */
  mesDefectCode?: string;
  /** Смена / партия отчёта (MES). */
  mesShiftId?: string;
  /** Тред обсуждений у точки. */
  sketchPinComments?: Workshop2SketchPinThreadComment[];
  /** Тред закрыт (решён) — меньше шума в списках. */
  sketchPinThreadResolved?: boolean;
  /** Прочитано до (ISO): комментарии позже считаются «новыми» в UI. */
  sketchPinThreadLastReadAt?: string;
};

/** Черновик строки для посадки / ОТК, собранный из меток скетча. */
export type Workshop2SketchPropagatedDraft = {
  draftId: string;
  kind: 'fit' | 'qc';
  text: string;
  fromAnnotationId: string;
  createdAt: string;
};

/** Запись аудита изменений master-меток (для споров с фабрикой и внутреннего контроля). */
export type Workshop2SketchAnnotationAuditEntry = {
  entryId: string;
  /** ISO-8601 */
  at: string;
  /** ФИО / метка пользователя из паспорта артикула */
  by: string;
  annotationId: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'bom_link' | 'revision_snapshot';
  summary: string;
};

/** Реквизиты комплаенса / передачи в цех (ссылки и версии, без вложений). */
export type Workshop2CategorySketchCompliance = {
  /** Утверждённый референс (URL или внутренний id). */
  approvedReferenceUrl?: string;
  /** Версия комплекта лекал / Tech pack. */
  patternPackVersion?: string;
  /** Акт / протокол приёмки образца. */
  sampleAcceptanceActRef?: string;
};

/** Зафиксированная ревизия master-меток (PLM-лайт: снимок меток + комплаенс). */
export type Workshop2SketchRevisionSnapshot = {
  snapshotId: string;
  at: string;
  by: string;
  revisionLabel: string;
  leafId: string;
  annotations: Workshop2Phase1CategorySketchAnnotation[];
  complianceCopy?: Workshop2CategorySketchCompliance;
};

/** Детализация задач для производства по уровню подкатегории (L1 / L2 / L3). */
export type Workshop2Phase1ProductionTaskDetail = {
  /** Что нужно сделать при пошиве */
  whatToDo: string;
  /** Что улучшить относительно референса / прошлой партии */
  improve: string;
  /** Что изменить в конструкции / материале */
  change: string;
  /** На что обратить внимание (КБ, швы, фурнитура…) */
  watchAttention: string;
  owner?: string;
  priority?: Workshop2ProductionTaskPriority;
  status?: Workshop2ProductionTaskStatus;
  acceptanceCriteria?: string;
  linkedStage?: Workshop2ProductionTaskStage;
  inheritedFromLevel?: 1 | 2;
  overrideReason?: string;
  linkedAnnotationIds?: string[];
};

/**
 * Скетч модели по уровню каталога: отдельная подложка и метки + текстовые задачи для цеха.
 * Сводка габаритов/атрибутов подставляется из досье артикула кнопкой «Обновить сводку».
 */
export type Workshop2Phase1SubcategorySketchSlot = {
  slotId: string;
  /** 1 = ур.1 каталога, 2 = ур.2, 3 = ур.3 (лист) */
  level: 1 | 2 | 3;
  imageDataUrl?: string;
  imageFileName?: string;
  annotations: Workshop2Phase1CategorySketchAnnotation[];
  productionTasks: Workshop2Phase1ProductionTaskDetail;
  /** Снимок выбранных атрибутов и мерок на момент обновления */
  attributesDimensionsSnapshot?: string;
  attributesDimensionsSnapshotUpdatedAt?: string;
};

/** Назначение доп. скетч-листа (подсказка в UI, не жёсткая схема). */
export type Workshop2SketchSheetViewKind =
  | 'front'
  | 'back'
  | 'side'
  | 'detail'
  | 'flat'
  | 'photo'
  | 'other';

/** Статус листа в цех / согласованиях (отдельно от подписи всего ТЗ). */
export type Workshop2SketchSheetWorkflowStatus = 'draft' | 'review' | 'approved';

/** Чеклист готовности листа (ручные галочки). */
export type Workshop2SketchSheetChecklist = {
  substrateConfirmed?: boolean;
  qcPinsConfirmed?: boolean;
  workshopTaskConfirmed?: boolean;
};

/** Ориентация поля доски скетча (превью и миниатюры). */
export type Workshop2SketchBoardOrientation = 'landscape' | 'portrait';

/**
 * Мини-карточка материала (смотка / фото образца) на подложке скетча.
 * Координаты в процентах от поля доски (как у меток).
 */
export type Workshop2SketchMaterialCard = {
  cardId: string;
  xPct: number;
  yPct: number;
  /** Ширина карточки в % ширины поля доски; высота по соотношению изображения. */
  widthPct?: number;
  imageDataUrl?: string;
  imageFileName?: string;
  caption?: string;
  /** Строка BOM / материал — как у метки скетча. */
  linkedBomLineRef?: string;
};

/**
 * Дополнительный скетч-лист: своя подложка (файл) и метки.
 * Независим от master-полей `categorySketchImage*` / `categorySketchAnnotations`.
 */
export type Workshop2Phase1SketchSheet = {
  sheetId: string;
  title?: string;
  /** Один артикул — одна сцена: тот же id на листах анфас/спина/деталь. */
  sceneId?: string;
  viewKind?: Workshop2SketchSheetViewKind;
  imageDataUrl?: string;
  imageFileName?: string;
  /** Альбомная или книжная доска для подложки и превью. */
  boardOrientation?: Workshop2SketchBoardOrientation;
  annotations: Workshop2Phase1CategorySketchAnnotation[];
  /** Короткая задача цеха по этому виду (не дубль меток). */
  workshopTaskNote?: string;
  /** Обсуждение листа (не привязано к точке). */
  sheetComment?: string;
  sheetWorkflowStatus?: Workshop2SketchSheetWorkflowStatus;
  sheetChecklist?: Workshop2SketchSheetChecklist;
  /**
   * Видео-референс движения/посадки: пока URL (без своего CDN).
   * При API медиа: заменить на `referenceMotionMediaId` или подписанный URL из бэкенда.
   */
  referenceMotionVideoUrl?: string;
  referenceMotionVideoNote?: string;
  /** Карточки подобранных материалов на этом листе (поверх подложки). */
  materialCards?: Workshop2SketchMaterialCard[];
};

/**
 * Шаблон набора меток (в досье артикула): структура точек без подложки;
 * при применении id и привязки к атрибутам пересоздаются.
 */
export type Workshop2SketchPinTemplate = {
  templateId: string;
  name: string;
  createdAt: string;
  viewKind?: Workshop2SketchSheetViewKind;
  annotations: Workshop2Phase1CategorySketchAnnotation[];
};

/** Снимок меток до крупной правки (без data URL подложек — только аннотации). */
export type Workshop2SketchLabelsSnapshot = {
  snapshotId: string;
  at: string;
  by: string;
  label?: string;
  masterAnnotations?: Workshop2Phase1CategorySketchAnnotation[];
  sheets?: {
    sheetId: string;
    title?: string;
    viewKind?: Workshop2SketchSheetViewKind;
    annotations: Workshop2Phase1CategorySketchAnnotation[];
  }[];
};

/** Реакция к комментарию к референсу: не более одной на участника (лайк или дизлайк). */
export type Workshop2VisualRefCommentReactionType = 'like' | 'dislike';

export type Workshop2VisualRefCommentReaction = {
  by: string;
  type: Workshop2VisualRefCommentReactionType;
};

export type Workshop2VisualRefComment = {
  commentId: string;
  by: string;
  /** ISO-8601 */
  at: string;
  text: string;
  /** Явное закрытие треда по рефу (для чеклиста «комментарии закрыты»). */
  resolved?: boolean;
  reactions?: Workshop2VisualRefCommentReaction[];
};

/** Визуальные референсы (фото, короткое видео + текст) до согласования ТЗ. */
export type Workshop2Phase1VisualReference = {
  refId: string;
  title: string;
  description?: string;
  externalUrl?: string;
  fileName?: string;
  mimeType?: string;
  /** Data URL; для крупных файлов может отсутствовать из‑за лимита localStorage. */
  previewDataUrl?: string;
  /** Обсуждение по референсу (мессенджер + реакции). */
  comments?: Workshop2VisualRefComment[];
  /** Смыслы, которые забираем с этого рефа (решение команды). */
  takeawayAspects?: Workshop2VisualRefTakeawayAspect[];
  takeawayNote?: string;
};

/** Что показывать в превью «визуал паспорта» на карточке артикула. */
export type Workshop2PassportVisualSource = 'sketch' | 'reference' | 'generated';

/** Ячейка мин–макс в досье; `nominal` — одно значение для артикула/бирки поверх допуска. */
export type Workshop2Phase1DimensionRangeCell = {
  min: string;
  max: string;
  nominal?: string;
};

/** Режим цепочки: один переключатель → условная обязательность полей приёмки сэмпла (не второй каталог). */
export type Workshop2SampleProductionChainMode =
  | 'rf_sewn'
  | 'rf_import_materials'
  | 'import_finished'
  | 'eaeu_mixed'
  | 'non_eaeu';

/**
 * Финальный слой после образца, перед отгрузкой в коллекцию (этап «приёмка сэмпла» на вкладке Fit).
 * В паспорте ТЗ для цеха — ориентир по группе и основному коду ТН ВЭД; расширенные коды и обоснование из каталога — вкладка ТЗ «Задание»; здесь — утверждённые реквизиты под отгрузку.
 */
/** Жёсткость целевой даты образца / пилота. */
export type Workshop2PassportDeadlineCriticality = 'hard' | 'flexible' | 'tbd';

/** Кто ведёт карточку ТЗ на шаге 1 (не оргструктура). */
export type Workshop2PassportArticleCardOwnerRole =
  | 'designer'
  | 'product'
  | 'technologist'
  | 'shared';

/**
 * План запуска: производственная схема и канал.
 * Расширенный список + поле «свой текст» (`plannedLaunchCustomNote`) при необходимости.
 */
export type Workshop2PassportPlannedLaunchType =
  | 'undecided'
  | 'own_floor'
  | 'cmt'
  | 'mixed'
  | 'domestic_partner'
  | 'nearshore_partner'
  | 'far_east_partner'
  | 'ecom_d2c_first'
  | 'wholesale_preorder'
  | 'dropship_fulfillment'
  | 'made_to_order_mto'
  | 'import_rtw'
  | 'pilot_line_only'
  | 'other_catalogued';

/**
 * Сроки, объём и запуск (паспорт, шаг 1): якоря для оценки срока и объёма;
 * тип запуска и регион пошива — подсказка снабжению, не замена материалам и финальному комплаенсу.
 */
export type Workshop2PassportProductionBrief = {
  /** Целевая дата готовности образца или пилотной партии (ISO date YYYY-MM-DD). */
  targetSampleOrPilotDate?: string;
  /** Конец окна дат (необязательно; если задано вместе с `targetSampleOrPilotDate` — диапазон). */
  targetSampleOrPilotDateEnd?: string;
  /** Ориентир по MOQ (текст); в UI не показывается, поле оставлено для старых досье. */
  moqTargetNote?: string;
  /** Сколько образцов: не больше стольких размеров из справочника; сумма «Кол-во, шт» в табеле не выше этого числа. */
  moqTargetMaxPieces?: number;
  deadlineCriticality?: Workshop2PassportDeadlineCriticality;
  articleCardOwnerRole?: Workshop2PassportArticleCardOwnerRole;
  articleCardOwnerName?: string;
  plannedLaunchType?: Workshop2PassportPlannedLaunchType;
  /** Уточнение к выбранному типу запуска (свой вариант, партнёр, регион и т.д.). */
  plannedLaunchCustomNote?: string;
  /** Регион пошива / тип цеха — продуктовое правило, не дубль страны происхождения. */
  sewingRegionPlanNote?: string;
  /** Субъекты РФ (ISO 3166-2, коды вида RU-MOW), мультивыбор. */
  sewingRfSubjectIsoCodes?: string[];
  /** Предприятия / партнёры из внутреннего справочника (id), мультивыбор. */
  sewingEnterprisePartnerIds?: string[];
  /** Партнёр или предприятие вне справочника — свободный текст. */
  sewingEnterprisesCustomNote?: string;
  /** Окно первой отгрузки / выхода в продажу (ориентир для плана и SLA). */
  passportFirstShipWindowNote?: string;
  /** Жёсткие ограничения для снабжения и производства (MOQ, сроки, сертификация узла и т.п.). */
  passportSupplyOrProductionConstraintNote?: string;
  /** GTIN / EAN для маркировки и экспорта (Honest Sign, DPP). */
  gtin?: string;
  /** ID заказа маркировки (Честный ЗНАК / MES bridge). */
  markingOrderId?: string;
  /** Транспортная и индивидуальная упаковка (коробки, полибеги, штрихкоды и т.д.) */
  packagingAndLabelingNote?: string;
  /** Весогабаритные характеристики (расчетный вес, габариты упаковки и т.д.) */
  weightAndDimensionsNote?: string;
  /**
   * Целевые даты ответа по ролям на этапе ТЗ (YYYY-MM-DD): напоминание для команды, не блокирует сохранение.
   */
  tzRoleResponseDue?: {
    designer?: string;
    technologist?: string;
    manager?: string;
  };
  /** Шаблон T&A из lifecycle handbook (assembler / create-article). */
  lifecycleTaTemplateId?: string;
  /** Slug B2C витрины для showroom / runway link. */
  b2cProductSlug?: string;
  /** Требуется маркировка (Честный ЗНАК) для артикула. */
  markingRequired?: boolean;
  /** Зеркало costingRub из BOM rollup (Wave 10 RU). */
  costingRub?: Workshop2PassportCostingRubMirror;
  /** Целевой FOB из паспорта (руб), если нет BOM rollup. */
  targetFob?: number;
  /** Целевая маржа % для delta band в costing. */
  targetMarginPct?: number;
  /** SKU из паспорта (factory TZ preview). */
  sku?: string;
  /** Розничная цена (MSRP) для B2B/linesheet. */
  targetRetailPrice?: string | number;
};

export type Workshop2PassportCostingRubMirror = {
  estimatedFobRub: number;
  materialsRub: number;
  trimsRub: number;
  operationsRub: number;
  syncedAt: string;
  source: 'bom_rollup' | 'passport_target_fob';
};

/** Черновик снабжения по материалу в секции «Материалы» (локально, до API каталога партнёра). */
export type Workshop2MaterialSourcingDraft = {
  supplierDisplayName?: string;
  supplierPartnerSlug?: string;
  fabricDescription?: string;
  priceNote?: string;
  priceDate?: string;
  photoDataUrls?: string[];
  catalogPickNote?: string;
};

export type Workshop2SampleIntakeReworkIteration = {
  id: string;
  date: string;
  comment: string;
  status: 'returned_to_factory' | 'received_back';
};

export type Workshop2SampleIntakeRelease = {
  /** Для режимов пошива в РФ — явное подтверждение. */
  sewnInRussiaConfirmed?: boolean;
  /** Фактическое происхождение товара после фиксации сырья на образце. */
  countryOfOriginActual?: string;
  /** ТН ВЭД под отгрузку (финал). */
  finalTnvedCode?: string;
  /** Декларация / сертификат — реквизиты после испытаний. */
  declarationOrCertificateRef?: string;
  /** EAN / GTIN или код партии. */
  eanOrBatchCode?: string;
  /** Маркировка, ЧЗ, прослеживаемость — итог. */
  markingTraceabilityNote?: string;
  /** ТР ТС / ЕАЭС — реквизит или ссылка. */
  technicalRegulationRef?: string;
  /** ОКПД2 / отраслевой код. */
  okpd2Note?: string;
  /** Итоговый состав, если менялся на образце. */
  actualCompositionNote?: string;
  /** История доработок образца. */
  reworkHistory?: Workshop2SampleIntakeReworkIteration[];
};

/** true/undefined = участие/подпись на этапе; false = снято (для ТЗ — подпись этого уровня не обязательна). */
export type Workshop2TzPerRoleStageFlags = Partial<Record<Workshop2TzSignoffStageId, boolean>>;

/** Доп. роль с ответственным (без отдельной кнопки цифровой подписи в ТЗ). */
export type Workshop2TzSignatoryExtraRow = {
  rowId: string;
  roleTitle: string;
  assigneeDisplayLabel?: string;
  signStages?: Workshop2TzPerRoleStageFlags;
};

/** Закрепление уровней цифровой подписи ТЗ за исполнителями (ФИО как в профиле / списке команды). */
export type Workshop2TzSignatoryBindings = {
  designerDisplayLabel?: string;
  technologistDisplayLabel?: string;
  managerDisplayLabel?: string;
  designerSignStages?: Workshop2TzPerRoleStageFlags;
  technologistSignStages?: Workshop2TzPerRoleStageFlags;
  managerSignStages?: Workshop2TzPerRoleStageFlags;
  extraAssigneeRows?: Workshop2TzSignatoryExtraRow[];
};

/** Метаданные последнего «финального» экспорта спецификации (один файл по артикулу). */
export type Workshop2FinalTzDocumentExportMeta = {
  exportedAt: string;
  exportedBy: string;
  format: 'html' | 'pdf';
  dossierUpdatedAtSnapshot: string;
  articleSkuSnapshot?: string;
  articleNameSnapshot?: string;
  pathLabelSnapshot?: string;
};

/** Физический тип полотна бирки (составник / care label). */
export type Workshop2CompositionLabelPhysicalKind =
  | 'satin'
  | 'nylon'
  | 'jacquard'
  | 'polyester'
  | 'cotton'
  | 'other';

/** Раскладка печати бирки по листам / сегментам. */
export type Workshop2CompositionLabelSheetLayout = 'single' | 'two_sheets' | 'three_sheets';

/** Пресет гарнитуры для макета бирки (экранный черновик и ТТ для типографии). */
export type Workshop2CompositionLabelFontPreset =
  | ''
  | 'system_sans'
  | 'system_serif'
  | 'condensed'
  | 'custom';

/** Строка конструктора «волокно + доля» (карточка товара / ERP). */
export type Workshop2CompositionLabelFiberRow = {
  fiberId: string;
  percent: number;
};

/** Язык подписей волокон и страны в черновике конструктора. */
export type Workshop2CompositionLabelConstructorLanguage = 'ru' | 'en' | 'bilingual';

/** Объект на макете бирки в визуальном редакторе (позиции в % от габарита бирки). */
export type Workshop2CompositionLabelLayoutElementKind = 'text' | 'logo' | 'careStrip';

export type Workshop2CompositionLabelLayoutElement = {
  elementId: string;
  kind: Workshop2CompositionLabelLayoutElementKind;
  /** Порядок отрисовки (больше — выше). */
  zIndex?: number;
  /** 0–100, левый верх элемента. */
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  rotationDeg?: number;
  /** Для `text`: кегль в px на превью (масштаб с биркой). */
  fontSizePx?: number;
  fontWeight?: 'normal' | 'bold';
  /** Для `text`: выравнивание многострочного блока. */
  textAlign?: 'left' | 'center' | 'right';
  /** 0–100, непрозрачность блока на превью. */
  opacityPct?: number;
};

/**
 * Спецификация бирки состава и ухода: размеры, материал бирки, что берётся из ТЗ, что дописывается вручную.
 */
export type Workshop2CompositionLabelSpec = {
  /** Ширина бирки, мм (печать / заказ у поставщика бирок). */
  labelWidthMm?: string;
  /** Высота (или длина развёрнутой бирки), мм. */
  labelHeightMm?: string;
  /** Припуск печати, мм (подсказка для подрядчика). */
  labelBleedMm?: string;
  /** Внутреннее «безопасное» поле от обреза, мм. */
  labelSafeInsetMm?: string;
  /** Выбранный пресет габаритов из справочника (пусто = только ручные мм). */
  labelSizePresetId?: string;
  /** Сатин / нейлон / жаккард — влияет на ощущение и долговечность. */
  physicalMaterial?: Workshop2CompositionLabelPhysicalKind | '' | undefined;
  /** Уточнение полотна или свой вариант (справа от фильтра типа). */
  physicalMaterialNote?: string;
  /** Сырьевой состав в % — из полей ТЗ (mat / composition). */
  includeFiberCompositionFromTz?: boolean;
  /** Рекомендации по уходу (значки стирки, глажки…) — из полей ТЗ. */
  includeCareSymbolsFromTz?: boolean;
  /** Производитель / составитель рядом с составом — из паспорта (бренд, реквизиты при наличии в ТЗ). */
  includeManufacturerFromTz?: boolean;
  /** Доп. обязательные строки (юридический адрес, рег. знак, артикул на бирке…). */
  extraLegalLines?: string;
  /** Произвольные примечания технолога к финальному тексту бирки. */
  technologistNotes?: string;
  /** Показать в черновике условный контур припусков / габаритов печати. */
  showTrimBleedInDraft?: boolean;
  /** Условные метки реза (углы) на черновике — для согласования с типографией. */
  showTrimMarksOnDraft?: boolean;
  /** Плейсхолдер маркировки EAC на черновике (не заменяет юр. макет). */
  showEacPlaceholderOnDraft?: boolean;
  /** Печать части текста на обороте бирки. */
  printOnReverse?: boolean;
  /** Сколько логических листов/сегментов в раскладке. */
  sheetLayout?: Workshop2CompositionLabelSheetLayout | '' | undefined;
  /** Как расположить блоки, SKU, логотип на 2–3 листах; где сгиб. */
  layoutPlacementNotes?: string;
  /** Текст бренда / ИНН / адрес на лицевой стороне (если не хватает полей ТЗ). */
  brandFaceLines?: string;
  /** Позиция и размер логотипа на бирке. */
  brandLogoPlacementNote?: string;
  /** Гарнитура для макета. */
  typographyFontPreset?: Workshop2CompositionLabelFontPreset | undefined;
  /** Если preset === custom — название шрифта для подрядчика. */
  typographyCustomFontName?: string;
  /** Кегль основного текста, pt. */
  typographyBodyPt?: string;
  /** Межстрочный интервал основного текста, % от кегля (напр. 130). */
  typographyLineHeightPct?: string;
  /** Межбуквенный интервал, em (напр. 0.02; 0 = по умолчанию). */
  typographyLetterSpacingEm?: string;
  /** Цветность печати — подсказка цеху/типографии. */
  printColorMode?: '' | 'bw' | 'cmyk' | 'spot' | 'other';
  /** Целевое разрешение растра / LPI, подсказка (напр. 300 DPI). */
  printDpiNote?: string;
  /** Жирное начертание блока состава в макете. */
  typographyBoldFiberBlock?: boolean;
  /** Жирное начертание блока ухода в макете. */
  typographyBoldCareBlock?: boolean;
  /** Явно отмеченные знаки ухода (дополнение к авто из ТЗ). */
  careSymbolIds?: string[];
  /** Плотность сетки знаков ухода на черновике. */
  careSymbolsLayoutDensity?: 'tight' | 'normal' | 'loose';
  /** Доп. текст по уходу / обслуживанию (ручной), кроме полей ТЗ. */
  careInstructionsSupplement?: string;
  /** Текст для оборота (если включена печать на обороте). */
  reverseFaceLines?: string;
  /** Вынести составник отдельным пунктом в задание цеха / пакет передачи. */
  includeInFactoryAssignment?: boolean;
  /** Логотип на макете (data URL, локально в досье). */
  compositionLabelLogoDataUrl?: string;
  /** Ручной текст на макете; если заполнен — подменяет авто-черновик в превью. */
  draftTextManual?: string;
  /** Блок А: состав из справочника волокон + % (автоматизация панели конструктора). */
  constructorFiberRows?: Workshop2CompositionLabelFiberRow[];
  /** Язык строк состава / страны в конструкторе (мультиязычный экспорт). */
  constructorDisplayLanguage?: Workshop2CompositionLabelConstructorLanguage;
  /** Блок В: страна изготовления (пресет подписи). */
  labelOriginPresetId?: string;
  /** Размер изделия на бирке (часто дублирует размерник). */
  labelGarmentSizeText?: string;
  /** Артикул на бирке. */
  labelArticleSkuText?: string;
  /** Текст штрих-кода (EAN-13 и т.п.) или подпись под кодом. */
  labelBarcodeText?: string;
  /** URL для QR внизу бирки (лендинг, карточка, маркировка). */
  labelQrUrl?: string;
  /** Размещение блоков на макете (визуальный редактор оформления). */
  layoutElements?: Workshop2CompositionLabelLayoutElement[];
};

export type Workshop2ProductionNodeKind =
  | 'body'
  | 'front'
  | 'back'
  | 'sleeve'
  | 'collar'
  | 'hood'
  | 'pocket'
  | 'closure'
  | 'lining'
  | 'hem'
  | 'cuff'
  | 'belt'
  | 'hardware'
  | 'label'
  | 'packaging'
  | 'other';

export type Workshop2ProductionNodeStatus = 'empty' | 'draft' | 'ready' | 'approved';

export type Workshop2ProductionNode = {
  id: string;
  parentId?: string;
  kind: Workshop2ProductionNodeKind;
  label: string;
  isRequired?: boolean;
  sortOrder?: number;
  sourceAttributeIds?: string[];
  sketchAnnotationIds?: string[];
  description?: string;
  notApplicable?: boolean;
  notApplicableReason?: string;
  status?: Workshop2ProductionNodeStatus;
  comment?: string;
};

export type Workshop2ProductionMaterialRole =
  | 'main'
  | 'lining'
  | 'interlining'
  | 'insulation'
  | 'contrast'
  | 'trim'
  | 'thread'
  | 'label'
  | 'packaging'
  | 'other';

export type Workshop2ProductionMaterialLine = {
  id: string;
  nodeId: string;
  role: Workshop2ProductionMaterialRole;
  materialName: string;
  compositionText?: string;
  percentage?: number;
  gsm?: number;
  color?: string;
  supplier?: string;
  article?: string;
  unit?: 'm' | 'm2' | 'kg' | 'pcs' | 'set';
  consumption?: number;
  sourceAssignmentId?: string;
  isPrimary?: boolean;
  comment?: string;
  yieldPerUnit?: number;
  yieldUnit?: string;
  unitCostNet?: number;
  landedCost?: number;
  currency?: string;
  supplyType?: 'brand' | 'factory';
  substitutes?: (string | { id: string; name: string })[];
};

export type Workshop2ProductionTrimLine = {
  id: string;
  nodeId: string;
  trimType:
    | 'button'
    | 'zipper'
    | 'snap'
    | 'hook'
    | 'cord'
    | 'elastic'
    | 'buckle'
    | 'label'
    | 'other';
  name: string;
  size?: string;
  color?: string;
  quantity?: number;
  placement?: string;
  supplier?: string;
  article?: string;
  unitCostNet?: number;
  comment?: string;
  supplyType?: 'brand' | 'factory';
  substitutes?: (string | { id: string; name: string })[];
};

export type Workshop2ProductionOperation = {
  id: string;
  nodeId: string;
  name?: string;
  operationType:
    | 'seam'
    | 'edge_finish'
    | 'pressing'
    | 'fusing'
    | 'quilting'
    | 'topstitch'
    | 'bar_tack'
    | 'buttonhole'
    | 'attachment'
    | 'other';
  seamType?: string;
  processingMethod?: string;
  machineType?: string;
  stitchesPerCm?: number;
  thread?: string;
  costPerUnit?: number;
  sash?: number;
  comment?: string;
};

export type Workshop2ProductionMeasurement = {
  id: string;
  nodeId?: string;
  code: string;
  label: string;
  size: string;
  valueCm?: number;
  tolerancePlusCm?: number;
  toleranceMinusCm?: number;
  comment?: string;
};

export type Workshop2GradingRow = {
  id: string;
  pointName: string;
  baseMeasurement: number;
  increments: Record<string, number>;
  /** Шаг автоматического приращения для всех размеров (+/- см). */
  gradingStep?: number;
  /** Защита строки: не меняется из табеля и не перезаписывается авто-градацией, пока снята галочка. */
  gradingFrozen?: boolean;
};

/** Audit entry for smart grading apply (persisted in dossier). */
export type Workshop2GradingApplyRecord = {
  id: string;
  appliedAt: string;
  appliedFrom?: string;
  sizeCount: number;
  ruleCount: number;
  addedRuleCount?: number;
  categoryLeafId?: string;
};

export type Workshop2PlmOutboxAudit = {
  auditedAt: string;
  pending: number;
  awaitingAck: number;
  failed: number;
  autoAckEnabled: boolean;
  tone: 'ok' | 'pending' | 'awaiting_ack' | 'failed';
};

/** Строка техпоследовательности (умная маршрутизация), хранится в досье для экспорта и повторного открытия. */
export type Workshop2SmartRoutingOperation = {
  id: string;
  category: string;
  name: string;
  equipment: string;
  /** Нормативное время операции, мин (SASH). */
  sash: number;
};

export type Workshop2ProductionModel = {
  version: 1;
  generatedFromCategoryKey?: string;
  generatedAt?: string;
  nodes: Workshop2ProductionNode[];
  materialLines: Workshop2ProductionMaterialLine[];
  trimLines: Workshop2ProductionTrimLine[];
  operations: Workshop2ProductionOperation[];
  measurements: Workshop2ProductionMeasurement[];
  notesForFactory?: string;
  /** Eco / certification hints from BOM (optional). */
  ecoAttributes?: Record<string, unknown>;

  /** Плановая или фактическая логистика */
  logisticsCost?: number;
  /** Рассчитанная фактическая себестоимость (Actual COGS) */
  actualCogs?: number;
};

export type Workshop2ProductionPreflightIssue = {
  id: string;
  severity: 'blocker' | 'warning' | 'info';
  section:
    | 'passport'
    | 'visuals'
    | 'materials'
    | 'construction'
    | 'measurements'
    | 'sketch'
    | 'label'
    | 'attachments'
    | 'handoff';
  nodeId?: string;
  label: string;
  detail: string;
  anchor?: string;
  fixHint?: string;
};

export type Workshop2ProductionPreflightSnapshot = {
  score: number;
  blockers: Workshop2ProductionPreflightIssue[];
  warnings: Workshop2ProductionPreflightIssue[];
  info: Workshop2ProductionPreflightIssue[];
  issues: Workshop2ProductionPreflightIssue[];
  canExportDraft: boolean;
  canSendToFactory: boolean;
  updatedAt: string;
};

export type Workshop2ProductionTzExportMeta = {
  exportedAt: string;
  exportedBy?: string;
  status: 'draft' | 'ready_for_factory';
  score: number;
  blockersCount: number;
  warningsCount: number;
  dossierUpdatedAtSnapshot?: string;
};

/** Метаданные последнего factory pack export (6 листов ole_globirds). */
export type Workshop2FactoryPackExportMeta = {
  exportedAt: string;
  exportedBy?: string;
  format: 'html' | 'pdf' | 'server_snapshot';
  snapshotId?: string;
  sheetsReady: number;
  sheetsTotal: number;
  qtyBridged: boolean;
  dossierUpdatedAtSnapshot?: string;
  articleSkuSnapshot?: string;
};

export type Workshop2VendorBid = {
  id: string;
  vendorId: string;
  vendorName: string;
  cmtPrice: number;
  currency: string;
  leadTimeDays: number;
  moq: number;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
};

export type Workshop2TaMilestone = {
  id: string;
  title: string;
  targetDate: string;
  actualDate: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
};

export type Workshop2RoutingStep = {
  stepNo: number;
  name: string;
  category?: string;
  equipment?: string;
  sashMin?: number;
  partnerLabel?: string;
  regionCode?: string;
  source: 'smart_routing' | 'production_model' | 'sewing_plan';
};

export type Workshop2SewingPlan = {
  partnerId?: string;
  partnerLabel?: string;
  partnerName?: string;
  regionCode?: string;
  operationsNote?: string;
};

export type Workshop2PomTemplateSuggestion = {
  leafId: string;
  suggestedAt: string;
  preMergeAvailable?: boolean;
  templateId?: string;
};

export type Workshop2ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

/** Параметры раскладки на заказе образца. */
export type Workshop2NestingRequest = {
  fabricWidthCm?: number;
  efficiencyPct?: number;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
  simulationYieldPct?: number;
  simulationNote?: string;
};

/** Размер → кол-во шт на заказе образца. */
export type Workshop2SampleOrderSizes = Record<string, number>;

export type Workshop2CategoryBinding = {
  categoryLeafId: string;
  [key: string]: unknown;
};

export type Workshop2ArticleFormMirror = {
  mirroredAt?: string;
  categoryLeafId?: string;
  sku?: string;
  formState?: string;
  canSubmit?: boolean;
  errorCount?: number;
  warningCount?: number;
  blockerSampleOrder?: boolean;
  hintRu?: string;
};

/** Journal mirror for «Честный ЗНАК» marking orders. */
export type Workshop2MarkingHonestSignMirror = {
  mirroredAt: string;
  markingRequired: boolean;
  gtin: string | null;
  markingOrderId: string | null;
  status: 'draft' | 'journal_only' | 'pending_external' | 'registered' | (string & {});
  journalOnly: boolean;
  actor?: string;
  hintRu?: string;
};

export type Workshop2SampleWorkflowState = {
  activeSampleOrderId?: string;
  floorStatusLabel?: string;
  lastSyncedAt?: string;
  lastFloorTab?: string;
  [key: string]: unknown;
};

export type Workshop2GoldSampleStatus = {
  status: 'pending' | 'approved' | 'rejected' | (string & {});
  approvedAt?: string;
  approvedBy?: string;
  linkedSampleOrderId?: string;
};

export type Workshop2InternalWmsMirror = {
  reserveDeficitCount?: number;
  [key: string]: unknown;
};

export type Workshop2BomCostingSnapshot = {
  computedAt: string;
  materialsTotal: number;
  trimsTotal: number;
  operationsTotal: number;
  estimatedFob: number;
  currency: string;
  targetFob?: number;
  deltaBand: 'on_target' | 'over' | 'under' | 'no_target';
  deltaPct?: number;
};

/** Hub onboarding state persisted in PG dossier (primary SoT). */
export type Workshop2HubOnboardingState = {
  done: boolean;
  workspaceOpened: boolean;
  role: 'designer' | 'technologist' | 'manager';
  source: 'dossier' | 'browser_storage';
  completedAt?: string;
};

export type Workshop2CutTicketStatus = 'draft' | 'issued' | 'cut' | 'cancelled';

export type Workshop2CutTicket = {
  id: string;
  ticketNo: string;
  qty: number;
  status: Workshop2CutTicketStatus;
  createdAt: string;
};

export type Workshop2FabricRoll = {
  id: string;
  rollLot: string;
  lengthM?: number;
  status: string;
  createdAt: string;
};

export type Workshop2GarmentDyeOp = {
  id: string;
  colorwayLabel: string;
  process: string;
  status: string;
  createdAt: string;
};

export type Workshop2MatchmakerPersistedResult = {
  recommendedContractorId?: string;
  recommendedLabel?: string;
  confidence?: number;
  rationale?: string;
  syncedAt: string;
  raw?: Record<string, unknown>;
};

export type Workshop2ArticleDevelopmentPathStep =
  | 'sample_order'
  | 'wms_reserve'
  | 'movement_in_transit'
  | 'movement_received'
  | 'gold_approved'
  | 'intake_ready';

export type Workshop2ArticleDevelopmentStateMirror = {
  mirroredAt: string;
  lastActor: string;
  steps: Workshop2ArticleDevelopmentPathStep[];
  sample: {
    hasOrder: boolean;
    orderId?: string;
    orderStatus?: string;
    movementStatus?: 'created' | 'in_transit' | 'received';
    movementLogEntries: number;
    movementState?: string;
  };
  wms: {
    enabled: boolean;
    syncStatus?: string;
    reservedQty?: number;
    reserveDeficitCount?: number;
    itemCount?: number;
    lastSampleReserveOrderId?: string;
  };
  gold: {
    status?: string;
    approved: boolean;
  };
  intake: {
    state: 'blocked' | 'partial' | 'ready';
    missingCount: number;
    chainMode?: string;
    chainModeLabel?: string;
    barcodeFilled: boolean;
  };
  readiness: {
    tzOverallPct: number;
    preflightScore: number;
    handoffReady: boolean;
    vaultFileCount: number;
  };
  criticalPathReady: boolean;
  hintRu?: string;
};

export type Workshop2EdoSignoffMirror = {
  mirroredAt: string;
  provider: string;
  edoStatus: 'draft' | 'pending' | 'signed' | 'rejected' | 'error';
  requestId: string | null;
  signedAt: string | null;
  blockerHandoff: boolean;
  hintRu?: string;
  statusLabelRu?: string;
};

export type Workshop2SupplierQcSnapshot = {
  snapshotAt: string;
  supplierId: string;
  totalBatches: number;
  passRate: number;
  failed: number;
  source: string;
  blockerSampleOrder: boolean;
  blockerHandoff: boolean;
  hintRu?: string;
};

export type Workshop2SupplyBundleMirror = {
  mirroredAt: string;
  supplyBomSyncAt?: string;
  lineCount: number;
  linesWithQty: number;
  unlinkedLineCount: number;
  plannedPoQty: number;
  bomMaterialLineCount: number;
  state: string;
  blockerSampleOrder: boolean;
  hintRu?: string;
};

export type Workshop2QcAqlInspectionRecord = {
  id: string;
  recordedAt: string;
  recordedBy?: string;
  orderQty: number;
  qtySource: 'sample_order' | 'batch' | 'manual' | (string & {});
  aqlLevel: string;
  sampleSize: number;
  criticalFound: number;
  majorFound: number;
  minorFound: number;
  majorRejectLimit: number;
  minorRejectLimit: number;
  isFail: boolean;
  batchId?: string;
};

export type Workshop2VaultPanelMirror = {
  mirroredAt: string;
  totalDocs: number;
  withStoragePath: number;
  minVaultRequired: number;
  handoffVaultOk: boolean;
  backendMode: 'server' | 'local';
  state: string;
  blockerHandoff: boolean;
  s3PresignGuard?: string;
  virusScanPendingCount?: number;
  virusScanFailedCount?: number;
  orphanPresignCount?: number;
  pgIndexedOk?: boolean;
  heroPreviewUrl?: string;
  hintRu?: string;
};

export type Workshop2SustainabilityLcaSnapshot = {
  snapshotAt: string;
  ecoScore?: number;
  recycledContentPct?: number;
  carbonFootprintKg?: number;
  materialLineCount?: number;
  registryStub?: boolean;
  source?: string;
  certifiedSource?: string;
  certificationBody?: string;
  certificationRef?: string;
  certifiedAt?: string;
  carbonRollupAt?: string;
  carbonRollupEngine?: string;
  carbonThresholdWarnings?: string[];
};

export type Workshop2SustainabilityCarbonRollupMirror = {
  computedAt: string;
  engine: 'heuristic_bom_v1';
  carbonFootprintKg: number;
  recycledContentPct: number;
  ecoScore: number;
  materialLineCount: number;
  thresholdWarnings: string[];
  warnings: string[];
  hintRu: string;
};

export type Workshop2DppExportValidation = {
  validatedAt: string;
  state: 'ready' | 'blocked';
  hintRu?: string;
  schemaState?: string;
  issueCount?: number;
  previewAvailable?: boolean;
};

export type Workshop2OverviewPersistedSnapshot = {
  persistedAt: string;
  tzOverallPct: number;
  readyForHandoff: boolean;
  blockerCount: number;
  warningCount: number;
  primaryTab: string;
  primaryLabel: string;
  source: string;
};

export type Workshop2SupplyRiskPersistedSnapshot = {
  predictedDays: number;
  riskLevel: string;
  rationale: string;
  risks?: unknown[];
  computedAt: string;
  source: 'dossier_bom';
};

export type Workshop2SupplyRiskMirror = {
  mirroredAt: string;
  engineKind: string;
  riskLevel: string;
  predictedDays: number;
  blockerHandoff: boolean;
  hintRu?: string;
};

export type Workshop2PlmTransportJournalMirror = {
  mirroredAt: string;
  lastActor: string;
  transportKind: 'outbox_journal' | 'live_partner' | 'staging_contract';
  webhookConfigured: boolean;
  partnerAckRecorded: boolean;
  partnerAckId: string | null;
  ackAt: string | null;
  stagingContractMode: boolean;
  lastReceiptAt?: string;
  journal: Workshop2CeilingJournalEntry[];
  hintRu?: string;
};

export type Workshop2PlmManualPartnerAckMirror = {
  mirroredAt: string;
  lastActor: string;
  manualPartnerAckId: string | null;
  labeledAs: 'manual_ack_id';
  replayExportReady: boolean;
  journalRowCount: number;
  hintRu: string;
};

export type Workshop2PurchaseOrderErpMirror = {
  mirroredAt: string;
  poCount: number;
  fakeSyncedCount: number;
  errorCount: number;
  pendingCount: number;
  erpConfigured: boolean;
  erpSyncMode: 'journal_only' | 'live_factory_erp';
  serverWorkflowEnabled: boolean;
  blockerSampleOrder: boolean;
  blockerHandoff: boolean;
  hintRu?: string;
  lastCreateErpAttempt?: {
    at: string;
    outcome: 'success' | 'failed' | 'journal_only' | 'skipped';
    erpExternalId?: string | null;
    error?: string;
  };
};

export type Workshop2CadVaultLinkMirror = {
  mirroredAt: string;
  vaultCadCount: number;
  vaultMeasureCount: number;
  vaultReady: boolean;
  proprietaryDemoOnly: boolean;
  cadIngestPath: 'vault_cad_ingest' | 'demo_zprj' | 'none';
  serverWorkflowEnabled: boolean;
  blockerSampleOrder: boolean;
  blockerHandoff: boolean;
  hintRu?: string;
};

export type Workshop2CadPomImportMeta = {
  lastImportedAt: string;
  importedCellCount: number;
  sizeKeys: string[];
};

export type Workshop2ArticleSkuValidationMirror = {
  mirroredAt: string;
  sku: string;
  available: boolean;
  source: string;
  blockerSampleOrder: boolean;
  blockerHandoff: boolean;
  hintRu?: string;
};

export type Workshop2PlanPoBundleSnapshot = {
  snapshotAt: string;
  poLineCount: number;
  totalQty: number;
  allClosed: boolean;
  supplierIds: string[];
  blockerHandoff: boolean;
  blockerSampleOrder: boolean;
  hintRu?: string;
};

export type Workshop2Fit3dReadiness = {
  validatedAt: string;
  state: 'blocked' | 'placeholder' | 'vault';
  cadVersionId?: string;
  waived?: boolean;
  viewerEnabled: boolean;
  hintRu?: string;
};

export type Workshop2PomTemplateApplyRecord = {
  id: string;
  appliedAt: string;
  categoryLeafId: string;
  mode: 'replace' | 'merge';
  templateLabel: string;
  addedMeasurementCount: number;
  totalMeasurements: number;
};

export type Workshop2DppRegistryDraftMirror = {
  draftedAt: string;
  mirroredAt: string;
  lastActor: string;
  passportId: string;
  registryId: null;
  scheme: string;
  exportReady: boolean;
  stagingMode: 'none' | 'configured' | 'posted' | 'failed';
  stagingUrl?: string;
  stagingHttpStatus?: number;
  stagingError?: string;
  partnerAckRecorded: boolean;
  partnerAckId: string | null;
  ackAt: string | null;
  stagingContractMode: boolean;
  journal: Workshop2CeilingJournalEntry[];
  hintRu?: string;
};

export type Workshop2NestingStagingMirror = {
  mirroredAt: string;
  lastActor: string;
  lastSource?: 'external_api' | 'local_heuristic';
  partnerAckRecorded: boolean;
  partnerAckId: string | null;
  ackAt: string | null;
  stagingContractMode: boolean;
  journal: Workshop2CeilingJournalEntry[];
  hintRu?: string;
};

export type Workshop2ShowroomPublishMode = 'pg_journal' | 'live_webhook';

export type Workshop2ShowroomB2bMirror = {
  mirroredAt: string;
  publishMode: Workshop2ShowroomPublishMode;
  pgPublished: boolean;
  campaignName?: string;
  lastPublishAt?: string;
  publishJournalCount: number;
  liveWebhookConfigured: boolean;
  liveWebhookAckSimulated: false;
  hintRu?: string;
};

export type Workshop2FactoryErpAuditEntry = {
  at: string;
  poId: string;
  status: string;
  erpExternalId?: string | null;
  displayCode: string;
  event: 'mirror_sync' | 'ui_label';
};

export type Workshop2FactoryErpAuditMirror = {
  mirroredAt: string;
  entries: Workshop2FactoryErpAuditEntry[];
  blocksFakeSyncedUi: boolean;
  journalOnly: boolean;
  hintRu?: string;
};

export type Workshop2FactoryErpManualAckMirror = {
  mirroredAt: string;
  lastActor: string;
  manualErpOrderId: string | null;
  source: 'user_manual' | 'po_row';
  poWithErpIdCount: number;
  manualEntryCount: number;
  auditExportReady: boolean;
  hintRu: string;
};

export type Workshop2FactoryErpStagingMirror = {
  mirroredAt: string;
  lastActor: string;
  stagingUrl?: string;
  erpOrderIdAckInPg: boolean;
  partnerAckRecorded: boolean;
  partnerAckId: string | null;
  ackAt: string | null;
  stagingContractMode: boolean;
  journal: Workshop2CeilingJournalEntry[];
  hintRu?: string;
};

/** Generic PG mirror blob persisted in dossier JSON. */
export type Workshop2DossierPgMirror = Record<string, unknown>;

export type Workshop2FitCommentPin = {
  xPct: number;
  yPct: number;
  sketchAttachmentId?: string;
};

export type Workshop2FitCommentLogEntry = {
  commentId: string;
  text: string;
  author: string;
  at: string;
  vaultAttachmentId?: string;
  pin?: Workshop2FitCommentPin;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
};

/** Статус заказа образца (PG `workshop2_sample_orders.status`). */
export type Workshop2SampleOrderStatus =
  | 'draft'
  | 'sent'
  | 'in_progress'
  | 'received'
  | 'approved'
  | 'cancelled';

export type Workshop2ChangeRequest = {
  id: string;
  description: string;
  status: Workshop2ChangeRequestStatus;
  requestedBy: string;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
  targetNode?: string;
  decidedBy?: string;
  decidedAt?: string;
};

export type Workshop2DossierPhase1 = {
  schemaVersion: 1;
  /** Внутренняя числовая версия ТЗ (увеличивается при публикации новых эталонов/ревизий) */
  dossierVersion?: number;
  /** Текстовый ярлык текущей версии (например, "v1", "v2 - Fit corrections") */
  dossierVersionLabel?: string;
  /** Снимки состояния ТЗ при создании новых версий */
  versionHistorySnapshots?: {
    version: number;
    label: string;
    at: string;
    by: string;
    snapshot: any;
  }[];
  optionalNote?: string;
  updatedAt?: string;
  updatedBy?: string;
  /** SKU артикула (инвентарь / UAT seed). */
  sku?: string;
  /** Лист справочника категории (handbook leafId). */
  categoryLeafId?: string;
  /** Рабочая аудитория для brand-flow; может жить отдельно от leafId, если handbook snapshot еще не разведен по сегментам. */
  selectedAudienceId?: string;
  /** Модель унисекс (паспорт артикула). Без поля или false = нет. */
  isUnisex?: boolean;
  /** Сроки, объём, запуск, владелец ТЗ — см. `Workshop2PassportProductionBrief`. */
  passportProductionBrief?: Workshop2PassportProductionBrief;
  /** Фото/поставщик/ткань и задел под каталог партнёров (материалы ТЗ). */
  materialSourcingDraft?: Workshop2MaterialSourcingDraft;
  assignments: Workshop2Phase1AttributeAssignment[];
  /** До 5 файлов tech pack / лекал (дополнительно к ссылке и ревизии в атрибуте). */
  techPackAttachments?: Workshop2Phase1TechPackAttachment[];
  /** Передачи пакета tech pack на сторону производства (канал, статус, ответ). */
  techPackFactoryHandoffs?: Workshop2TechPackFactoryHandoff[];
  /**
   * Целевой режим хранения (подсказка UI). Реальный persist по-прежнему localStorage, пока нет API досье.
   */
  dossierStorageTarget?: Workshop2DossierStorageTarget;
  /** Локальная заметка о конфликте вкладок / ручном merge (не серверный CRDT). */
  collaborationMergeNote?: string;
  /** Референсы: описание + ссылка и/или вложение. */
  visualReferences?: Workshop2Phase1VisualReference[];
  /** Главное фото модели среди референсов (refId). */
  canonicalMainPhotoRefId?: string;
  /** Главный скетч для согласования: master или конкретный лист. */
  canonicalMainSketchTarget?: Workshop2CanonicalSketchTarget;
  /** Текущая подпись версии визуала (v1, v2…). */
  currentVisualVersionLabel?: string;
  /** Журнал «что изменилось» между версиями. */
  visualVersionLog?: Workshop2VisualVersionLogEntry[];
  /** Замысел: тезисы + mood. */
  designerIntent?: Workshop2DesignerIntentBlock;
  /** Чеклист готовности раздела «Визуал» (менеджер). */
  visualReadinessChecklist?: Workshop2VisualReadinessChecklist;
  /** Источник картинки в боковом превью паспорта (карточка SKU). */
  passportVisualSource?: Workshop2PassportVisualSource;
  /** Сгенерированные изображения (AI / рендер); при `passportVisualSource === 'generated'`. */
  passportGeneratedImageDataUrls?: string[];
  /** Своя подложка вместо типового скетча по категории (data URL). */
  categorySketchImageDataUrl?: string;
  categorySketchImageFileName?: string;
  /** Ориентация поля общей доски скетча (превью и миниатюра в ленте). */
  categorySketchBoardOrientation?: Workshop2SketchBoardOrientation;
  /** Комментарии вокруг/на скетче для текущей категории. */
  categorySketchAnnotations?: Workshop2Phase1CategorySketchAnnotation[];
  /** Карточки материалов на общей доске скетча (смотки поверх подложки). */
  categorySketchMaterialCards?: Workshop2SketchMaterialCard[];
  /**
   * Полупрозрачное наложение для сравнения с эталоном (фото прошлой партии / референс).
   * Рисуется поверх подложки master-скетча с прозрачностью `categorySketchCompareOverlayOpacityPct`.
   */
  categorySketchCompareOverlayDataUrl?: string | null;
  categorySketchCompareOverlayFileName?: string | null;
  /** 15–100, по умолчанию в UI ~45. */
  categorySketchCompareOverlayOpacityPct?: number;
  /** Масштаб слоя эталона, % (40–200), 100 = как подложка. */
  categorySketchCompareOverlayScalePct?: number;
  /** Смещение эталона по X/Y в % ширины/высоты поля (-40…40), для совмещения опор. */
  categorySketchCompareOffsetXPct?: number;
  categorySketchCompareOffsetYPct?: number;
  /**
   * Черновики из меток (кнопка «Протянуть в посадку / ОТК»): копируйте в чек-листы или вкладку Fit/QC.
   */
  sketchPropagatedDrafts?: Workshop2SketchPropagatedDraft[];
  /** Ревизия скетча для передачи (A, B, COL26-03…). */
  categorySketchRevisionLabel?: string;
  /** Не вносить изменения в master-метки до даты без согласования (YYYY-MM-DD). */
  categorySketchFreezeUntilDate?: string;
  /** Кто утвердил скетч для производства и когда. */
  categorySketchProductionApproved?: Workshop2DossierSignoffMeta;
  /** Комплаенс: референс, версия лекал, акт образца. */
  categorySketchCompliance?: Workshop2CategorySketchCompliance;
  /** Ограничения брендбука (палитра, силуэт, запреты) — в промпт ИИ и для подсказки цеху. */
  sketchBrandbookConstraints?: string;
  /** Журнал изменений master-меток (последние записи; длина режется в UI). */
  sketchMasterAnnotationAuditLog?: Workshop2SketchAnnotationAuditEntry[];
  /** Снимки ревизий master-скетча (не подменяют текущие метки — архив для PLM). */
  categorySketchRevisionSnapshots?: Workshop2SketchRevisionSnapshot[];
  /**
   * Идентификатор «сцены» артикула: общий для master и листов (виды как в 3D — front/back/detail).
   * Листы могут дублировать в `Workshop2Phase1SketchSheet.sceneId`.
   */
  categorySketchSceneId?: string;
  /** Вид master-подложки в рамках сцены (анфас, спина…). */
  categorySketchSceneView?: Workshop2SketchSheetViewKind;
  /** Справочник кодов дефектов MES; в UI дополняется дефолтами. */
  sketchMesDefectCatalog?: Workshop2MesDefectCodeRow[];
  brandNotes?: string;
  /**
   * Комментарии к атрибутам (в том числе к отложенным полям).
   * Ранее хранились в localStorage, теперь персистятся в досье.
   * Ключ — id атрибута или синтетический ключ (w2-construction-cad).
   */
  attrComments?: Record<
    string,
    import('@/components/brand/production/workshop2-phase1-dossier-panel-attr-comments-dialog').Workshop2AttrComment[]
  >;
  /**
   * Отложенные атрибуты (галочка "Позже").
   * Ранее хранились в localStorage, теперь в досье.
   */
  deferredAttrIds?: string[];
  fillNowAttrIds?: string[];
  pomTemplateSuggested?: Workshop2PomTemplateSuggestion;
  sewingPlan?: Workshop2SewingPlan;
  routingSteps?: Workshop2RoutingStep[];
  routingStepsPersistedAt?: string;
  isVerifiedByDesigner?: boolean;
  isVerifiedByTechnologist?: boolean;
  isVerifiedByManager?: boolean;
  /** Кто и когда отметил «Проверено дизайнером» (правый блок). */
  designerSignoff?: Workshop2DossierSignoffMeta;
  /** Кто и когда отметил «Проверено технологом». */
  technologistSignoff?: Workshop2DossierSignoffMeta;
  /** Менеджер (цифровая подпись). */
  managerSignoff?: Workshop2DossierSignoffMeta;
  /**
   * Цифровые подписи ТЗ для доп. ролей из паспорта (участие на этапе «ТЗ»).
   * Ключ — `rowId` из `tzSignatoryBindings.extraAssigneeRows`.
   */
  extraTzSignoffsByRowId?: Record<string, Workshop2DossierSignoffMeta>;
  /**
   * Закрепление подписей ТЗ за конкретными людьми (выбор при создании артикула).
   * Подпись уровня разрешена только если `updatedByLabel` совпадает с указанным ФИО (и есть право роли).
   */
  tzSignatoryBindings?: Workshop2TzSignatoryBindings;
  /** Галочки по секциям: бренд / технолог + метка времени. */
  sectionSignoffs?: Workshop2DossierSectionSignoffs;
  /** Напоминания по подтверждению секций (время/счётчик/дедлайн per role). */
  sectionSignoffReminders?: Workshop2SectionSignoffReminders;
  /**
   * Последний экспорт единого документа «Итоговое ТЗ» (HTML / печать в PDF).
   * `dossierUpdatedAtSnapshot` сравнивают с текущим `updatedAt`, чтобы показать «документ устарел после правок».
   */
  finalTzDocumentLastExport?: Workshop2FinalTzDocumentExportMeta;
  /** Журнал проставления/снятия подтверждений ТЗ (глобальные и по секциям). */
  tzActionLog?: Workshop2TzActionLogEntry[];
  /** Выбранная шкала базового размера; если нет — из правил каталога по L1. */
  sampleSizeScaleId?: string;
  /** Явно выбранный базовый размер (метка из шкалы или свой текст). */
  sampleBaseSizeLabel?: string;
  /** @deprecated см. sampleBasePerSizeDimensions */
  sampleBaseDimensionOverrides?: Record<string, string>;
  /** Количество шт по строке базового размера (ключ — parameterId размера). Сумма ≤ moqTargetMaxPieces при заданном лимите образцов. */
  sampleBasePerSizePieceQty?: Record<string, number>;
  /** Габариты по каждому выбранному размеру: parameterId → (подпись мерки → значение см). */
  sampleBasePerSizeDimensions?: Record<string, Record<string, string>>;
  /** Режим ввода мин–макс по выбранным меркам (блок «Базовый размер»). */
  sampleBaseDimensionRangeMode?: boolean;
  /** Ключи мерок (как в sampleBasePerSizeDimensions), для которых показываются поля мин/макс. */
  sampleBaseDimensionRangeKeys?: string[];
  /** Явные мин/макс и опционально номинал для артикула; в sampleBasePerSizeDimensions — строка «min–макс». */
  sampleBasePerSizeDimensionRanges?: Record<
    string,
    Record<string, Workshop2Phase1DimensionRangeCell>
  >;
  /** Доп. мерки (значения в sampleBasePerSizeDimensions под ключом `__extra:${id}`). */
  sampleBaseExtraDimensions?: { id: string; label: string }[];
  /** Скрытые стандартные мерки (ключ — исходная подпись из справочника по листу). */
  sampleBaseHiddenDimensionKeys?: string[];
  /** Подписи стандартных мерок в таблице (ключ — исходная подпись из справочника). */
  sampleBaseDimensionLabelOverrides?: Record<string, string>;
  /** Допуски по меркам (± см) */
  sampleBaseDimensionTolerances?: Record<string, { plus?: number; minus?: number }>;
  /**
   * Три слота скетчей по ур.1 / ур.2 / ур.3 каталога: детализация производственных задач
   * и опциональная сводка габаритов + атрибутов карточки артикула.
   */
  subcategorySketchSlots?: Workshop2Phase1SubcategorySketchSlot[];

  /**
   * Дополнительные скетч-листы (анфас, спина, деталь, фото…): загрузка и метки.
   * Старые `subcategorySketchSlots` сохраняются в JSON, в UI не показываются.
   */
  sketchSheets?: Workshop2Phase1SketchSheet[];

  /** История снимков меток скетча (ограничить длину в UI/нормализации). */
  sketchLabelSnapshots?: Workshop2SketchLabelsSnapshot[];

  /** Сохранённые наборы меток для повторного применения (master / листы). */
  sketchPinTemplates?: Workshop2SketchPinTemplate[];

  /** Цепочка производства / происхождения — задаёт акценты при приёмке сэмпла. */
  sampleProductionChainMode?: Workshop2SampleProductionChainMode;
  /** Обязательные финальные поля для кнопки «Принять сэмпл в коллекцию» (вкладка Fit). */
  sampleIntakeRelease?: Workshop2SampleIntakeRelease;

  gradingRules?: Workshop2GradingRow[];
  gradingApplyLog?: Workshop2GradingApplyRecord[];
  gradingSizes?: string[];
  /** Сохранённая цепочка операций из блока «Умная маршрутизация» (конструктив). */
  smartRoutingSequence?: Workshop2SmartRoutingOperation[];

  /**
   * Черновик плановой экономики образца (COGS + сроки): вкладка «Снабжение».
   * Не смешивается с % готовности паспорта «Общее»; условия поставки из ТЗ — только ссылка/заметка, без дубля Incoterms.
   */
  sampleEconomicsDraft?: Workshop2SampleEconomicsDraft;
  pomTemplateApplyLog?: Workshop2PomTemplateApplyRecord[];
  articleSkuValidationMirror?: Workshop2ArticleSkuValidationMirror;
  planPoBundleSnapshot?: Workshop2PlanPoBundleSnapshot;
  fit3dReadiness?: Workshop2Fit3dReadiness;
  dppExportValidation?: Workshop2DppExportValidation;
  overviewPersistedSnapshot?: Workshop2OverviewPersistedSnapshot;
  supplyRiskSnapshot?: Workshop2SupplyRiskPersistedSnapshot;
  supplyRiskMirror?: Workshop2SupplyRiskMirror;

  /**
   * Бирка состава / care label: габариты, материал бирки и что тянуть из ТЗ vs вручную для финального текста.
   * Основной ввод — вкладка «Материалы»; при передаче в цех согласовать с блоком «Отправка».
   */
  compositionLabelSpec?: Workshop2CompositionLabelSpec;
  /** Выбранные construction note presets для factory pack sketch sheets. */
  techPackConstructionNotePresetIds?: string[];
  /** Производственная карта изделия: узлы, материалы, операции, мерки, контроль. */
  productionModel?: Workshop2ProductionModel;
  /** Снимок последнего производственного pre-flight. */
  productionPreflightLastSnapshot?: Workshop2ProductionPreflightSnapshot;
  /** Последняя сборка итогового производственного ТЗ. */
  productionTzLastExport?: Workshop2ProductionTzExportMeta;
  /** Последний factory pack export (6 листов). */
  factoryPackLastExport?: Workshop2FactoryPackExportMeta;

  /** Альтернативы материала / узла BOM (персистентно в досье до API). */
  materialAlternativeDrafts?: Workshop2MaterialAlternativeDraft[];
  /** Дельта BOM по строкам (ТЗ / образец / серия). */
  bomLineDeltaDrafts?: Workshop2BomLineDeltaDraft[];
  /** Costing-подсказки по lineRef (`mergeCostingHintsByLineRef` в UI). */
  bomLineCostingHints?: Workshop2BomLineCostingHint[];
  /**
   * Чеклист «комплаенс и сырьё» в хабе материалов (ключи — `stepId` из `W2_MATERIAL_COMPLIANCE_FLOW_STEPS`).
   * Сохраняется в досье вместе с общим persist (localStorage).
   */
  materialComplianceChecklist?: Record<string, boolean>;

  // --- Lifecycle & approvals ---

  /** Текущее состояние жизненного цикла досье. */
  lifecycleState?: Workshop2DossierLifecycleState;
  /** История ревизий и переходов между состояниями. */
  revisions?: Workshop2DossierRevision[];
  /** Запросы на изменение (CR). */
  changeRequests?: Workshop2ChangeRequest[];
  /** Записи согласований по секциям. */
  approvalRecords?: Workshop2DossierApprovalRecord[];
  /** Краткие метаданные снимков финального экспорта ТЗ (лента истории). */
  finalExportSnapshots?: Workshop2FinalExportSnapshotMeta[];
  /** Полные снимки финального экспорта (state snapshot + context). */
  finalExportSnapshotRecords?: Workshop2FinalExportSnapshotRecord[];

  /** Тендерная площадка: ставки фабрик. */
  bids?: Workshop2VendorBid[];

  /** Time & Action Calendar: этапы производства после выбора подрядчика. */
  taMilestones?: Workshop2TaMilestone[];
  taMilestonesPersistedAt?: string;
  taMilestonesPersistSource?: 'dossier_refresh' | 'workspace_bundle';
  taMilestonesMirror?: Workshop2DossierPgMirror;
  matchmakerResult?: Workshop2MatchmakerPersistedResult;

  /** Gold sample approval state (fit / floor bridge). */
  goldSampleStatus?: Workshop2GoldSampleStatus;

  /** Производственная стратегия */
  productionStrategy?: 'fpp' | 'cmt' | 'hybrid' | 'blank_customization';
  /** Wave 22: маршрут собран из DEMO-шаблона (gate в production). */
  smartRoutingFromDemo?: boolean;
  /** Настройки B2B-интеграции (оптовые продажи и предзаказ) */
  b2bIntegrationDraft?: {
    isLive?: boolean;
    wholesalePrice?: string;
    msrp?: string;
    moq?: string;
    startDate?: string;
    endDate?: string;
    lastSyncAt?: string;
    campaignId?: string;
    lastMarketplaceOrderId?: string;
    lastMarketplaceProvider?: string;
    qtyBreaks?: Array<{ minQty: number; priceRub: number }>;
    linesheetVersion?: number;
    linesheetSupersedesId?: string;
    buyerSampleRequested?: boolean;
    buyerSampleRequestedAt?: string;
  };

  /** Единое хранилище (Vault) для документов */
  vaultDocuments?: {
    id: string;
    type: 'contract' | 'invoice' | 'certificate';
    title: string;
    fileUrl?: string;
    amount?: number;
    uploadedAt?: string;
    storagePath?: string;
  }[];

  /** PG / hub mirrors and extension fields (persisted in dossier JSON). */
  hubOnboardingState?: Workshop2HubOnboardingState;
  cutTickets?: Workshop2CutTicket[];
  fabricRolls?: Workshop2FabricRoll[];
  garmentDyeOps?: Workshop2GarmentDyeOp[];
  hubPgOverlayAt?: string;
  hubPgOverlayMeta?: Workshop2DossierPgMirror;
  vaultSnapshotVersion?: number;
  vaultSnapshotAt?: string;
  vaultSnapshotBy?: string;
  bomCostingSnapshot?: Workshop2BomCostingSnapshot;
  /** Краткая заметка о плане пошива (паспорт / identity gate). */
  passportSewingPlanNote?: string;
  /** Снимок SKU для release strip (PG mirror fallback). */
  articleSkuSnapshot?: string;
  /** Зеркало B2B showroom publish (linesheet gate). */
  showroomPublishMirror?: Workshop2DossierPgMirror;
  bomMatSyncAt?: string;
  dossierLayoutPreference?: 'full' | 'dense';
  dossierLayoutPersistedAt?: string;
  categoryBindings?: Workshop2CategoryBinding[];
  articleFormMirror?: Workshop2ArticleFormMirror;
  finalTzDocumentExportMeta?: Workshop2FinalTzDocumentExportMeta;
  edoSignoffMirror?: Workshop2EdoSignoffMirror;
  markingHonestSignMirror?: Workshop2MarkingHonestSignMirror;
  sampleWorkflow?: Workshop2SampleWorkflowState;
  dppRegistryDraftMirror?: Workshop2DppRegistryDraftMirror;
  factoryErpSync?: Workshop2DossierPgMirror;
  factoryErpStagingMirror?: Workshop2FactoryErpStagingMirror;
  factoryErpAuditMirror?: Workshop2FactoryErpAuditMirror;
  factoryErpManualAckMirror?: Workshop2FactoryErpManualAckMirror;
  fitComments?: Workshop2FitCommentLogEntry[];
  fitCommentsMirror?: Workshop2DossierPgMirror;
  fit3dStagingMirror?: Workshop2DossierPgMirror;
  articleDevelopmentStateMirror?: Workshop2ArticleDevelopmentStateMirror;
  assemblyPreviewMirror?: Workshop2DossierPgMirror;
  assignmentSignoffMirror?: Workshop2DossierPgMirror;
  backendHealthMirror?: Workshop2DossierPgMirror;
  bomNodesMirror?: Workshop2DossierPgMirror;
  categoryMergeMirror?: Workshop2DossierPgMirror;
  changeRequestMirror?: Workshop2DossierPgMirror;
  documentsIndexMirror?: Workshop2DossierPgMirror;
  dossierLayoutMirror?: Workshop2DossierPgMirror;
  factoryHandoffBundleMirror?: Workshop2DossierPgMirror;
  fitSessions?: Array<{ id?: string; cadVersionId?: string }>;
  fitSessionsMirror?: Workshop2DossierPgMirror;
  floorBridgeMirror?: Workshop2DossierPgMirror;
  gradingApplyMirror?: Workshop2DossierPgMirror;
  handoffPdfMirror?: Workshop2DossierPgMirror;
  hubActivityMirror?: Workshop2DossierPgMirror;
  hubCollectionRollupMirror?: Workshop2DossierPgMirror;
  hubFilterMirror?: Workshop2DossierPgMirror;
  hubInventoryMirror?: Workshop2DossierPgMirror;
  hubOnboardingMirror?: Workshop2DossierPgMirror;
  infopickMatrixMirror?: Workshop2DossierPgMirror;
  inspectorReportMirror?: Workshop2DossierPgMirror;
  labDipMirror?: Workshop2DossierPgMirror;
  /** Lab dip status keyed by colorway palette code. */
  colorLabDipStatuses?: Record<string, 'pending' | 'approved' | 'rejected'>;
  colorLabDipSyncedAt?: string;
  /** PG-backed physical material test logs (S3 dossier journal). */
  materialPhysicalTestLogs?: Array<{
    id: string;
    materialId: string;
    testCategory: 'shrinkage' | 'pilling' | 'colorfastness';
    resultValue: string;
    isPass: boolean;
    testedAt: string;
    notes?: string;
  }>;
  materialPhysicalTestMirror?: Workshop2DossierPgMirror;
  /** Supplier alt material approvals keyed by primary::alternative. */
  supplierAltMaterialApprovals?: Record<string, 'pending' | 'approved' | 'rejected'>;
  supplierAltMaterialApprovalsSyncedAt?: string;
  /** PG-backed fit session records (S3 — replaces in-memory fit-sessions API). */
  fitGoldSessions?: Array<{
    id: string;
    articleId?: string;
    sampleType: 'proto' | 'sms' | 'pps' | 'top';
    status: 'pending' | 'approved' | 'rework' | 'approved_with_comments';
    dateStr: string;
    measurementsDelta: Record<string, number>;
    comments: Array<{
      id: string;
      targetAnchor: string;
      text: string;
      photoUrls: string[];
      by?: string;
      at?: string;
    }>;
    cadVersionId?: string | null;
    photoVaultDocumentId?: string;
    aiFitAnalysis?: {
      wrinklesDetected: string[];
      recommendations: string[];
    };
    createdAt?: string;
  }>;
  colorMasterLabDipMirror?: {
    syncedAt: string;
    source: 'runtime' | 'static';
    linkCount: number;
    pendingCount: number;
    links: Array<{
      colorwayLabel: string;
      colorCode: string | null;
      hex: string | null;
      labDipStatus: 'pending' | 'approved' | 'rejected' | 'missing';
      linked: boolean;
    }>;
  };
  logisticsShipmentMirror?: Workshop2DossierPgMirror;
  matchmakerMirror?: Workshop2DossierPgMirror;
  nestingStagingMirror?: Workshop2NestingStagingMirror;
  /** Снимок параметров раскладки на заказе образца (wave 18). */
  nestingRequestSnapshot?: Workshop2NestingRequest;
  nestingSnapshotPersistedAt?: string;
  operationalTzMirror?: Workshop2DossierPgMirror;
  overviewMirror?: Workshop2DossierPgMirror;
  planTaMirror?: Workshop2DossierPgMirror;
  plmOutboxAudit?: Workshop2PlmOutboxAudit;
  plmOutboxMirror?: Workshop2DossierPgMirror;
  plmTransportJournalMirror?: Workshop2PlmTransportJournalMirror;
  plmManualPartnerAckMirror?: Workshop2PlmManualPartnerAckMirror;
  pomTableMirror?: Workshop2DossierPgMirror;
  purchaseOrderErpMirror?: Workshop2PurchaseOrderErpMirror;
  qcAqlMirror?: Workshop2DossierPgMirror;
  qcAqlInspectionLog?: Workshop2QcAqlInspectionRecord[];
  qcPanelMirror?: Workshop2DossierPgMirror;
  readinessPulseMirror?: Workshop2DossierPgMirror;
  referencesMirror?: Workshop2DossierPgMirror;
  relatedSectionsMirror?: Workshop2DossierPgMirror;
  releaseRoutingMirror?: Workshop2DossierPgMirror;
  rndLifecycleMirror?: Workshop2DossierPgMirror;
  setupHealthMirror?: Workshop2DossierPgMirror;
  signoffStagesProgressMirror?: Workshop2DossierPgMirror;
  sketchCoverageMirror?: Workshop2DossierPgMirror;
  smartRoutingMirror?: Workshop2DossierPgMirror;
  sseRealtimeMirror?: Workshop2DossierPgMirror;
  supplierQcSnapshot?: Workshop2SupplierQcSnapshot;
  supplyBundleMirror?: Workshop2SupplyBundleMirror;
  showroomB2bMirror?: Workshop2ShowroomB2bMirror;
  sustainabilityLcaSnapshot?: Workshop2SustainabilityLcaSnapshot;
  sustainabilityCarbonRollupMirror?: Workshop2SustainabilityCarbonRollupMirror;
  vaultPanelMirror?: Workshop2VaultPanelMirror;
  supplyOpsMirror?: Workshop2DossierPgMirror;
  sustainabilityStagingMirror?: Workshop2DossierPgMirror;
  techPackVisualMirror?: Workshop2DossierPgMirror;
  cadVaultLinkMirror?: Workshop2CadVaultLinkMirror;
  cadPomImport?: Workshop2CadPomImportMeta;
  vendorBidsMirror?: Workshop2DossierPgMirror;
  visualReferencesMirror?: Workshop2DossierPgMirror;
  internalWmsMirror?: Workshop2InternalWmsMirror;
  stockWmsLedger?: Workshop2DossierPgMirror;
  bomRequisitionByLineRef?: Record<
    string,
    { id?: string; materialLabel?: string; [key: string]: unknown }
  >;
};

export type Workshop2DossierSignoffMeta = {
  by: string;
  /** Предприятие / бренд, где числится подписант (рядом с ФИО в журнале и UI). */
  byOrganization?: string;
  /** ISO-8601 */
  at: string;
  /** Демо-отпечаток цифровой подписи (не КЭП). */
  signatureDigest?: string;
};

/** Ключи совпадают с секциями ТЗ · досье. */
export type Workshop2DossierSectionSignoffs = Partial<
  Record<
    'general' | 'visuals' | 'material' | 'construction' | 'assignment' | 'b2b_sales',
    {
      brand?: Workshop2DossierSignoffMeta;
      tech?: Workshop2DossierSignoffMeta;
    }
  >
>;

/** Напоминание по подтверждению секции ТЗ для конкретной стороны (бренд / технолог). */
export type Workshop2SectionSignoffReminder = {
  /** ISO-8601 */
  lastNotifiedAt?: string;
  notifyCount?: number;
  /** ISO-8601 (плановый срок ответа). */
  dueAt?: string;
};

/** Reminders per section/side: кто и сколько раз получил запрос подтверждения. */
export type Workshop2SectionSignoffReminders = Partial<
  Record<
    'general' | 'visuals' | 'material' | 'construction' | 'assignment' | 'b2b_sales',
    {
      brand?: Workshop2SectionSignoffReminder;
      tech?: Workshop2SectionSignoffReminder;
    }
  >
>;

/** Секции ТЗ, по которым пишется журнал (совпадает с ключами sectionSignoffs). */
export type Workshop2TzSignoffSectionKey = keyof Workshop2DossierSectionSignoffs;

export type Workshop2TzActionLogPayload =
  | { type: 'tz_global_signoff'; role: 'designer' | 'technologist' | 'manager'; set: boolean }
  | { type: 'tz_extra_signoff'; rowId: string; roleTitle: string; set: boolean }
  | {
      type: 'section_signoff';
      section: Workshop2TzSignoffSectionKey;
      role: 'brand' | 'tech';
      set: boolean;
      /** Предприятие в записи подписи / снятой строке — для текста в журнале. */
      signerOrganization?: string;
    }
  /** Изменения данных ТЗ / карточки при сохранении или сразу после правки артикула (SKU, ветка). */
  | { type: 'dossier_edit'; summaries: string[] }
  /** Сохранён снимок меток скетча / листов. */
  | {
      type: 'sketch_labels_snapshot';
      label?: string;
      masterPins: number;
      sheetPinsTotal: number;
    }
  /** Восстановление меток из сохранённого снимка. */
  | {
      type: 'sketch_labels_restore';
      label?: string;
      snapshotAt: string;
    }
  /** Целостность tech pack: печать к производству / подтверждение сервером. */
  | { type: 'tech_pack_integrity'; summary: string }
  /** Исходящая передача пакета к фабрике. */
  | { type: 'tech_pack_handoff'; handoffId: string; detail: string }
  /** Ответ/статус со стороны производства (имитация B2B-порта). */
  | { type: 'tech_pack_factory_response'; handoffId: string; detail: string }
  /** Единый документ «Итоговое ТЗ» (скачивание HTML или печать в PDF из браузера). */
  | {
      type: 'final_tz_spec_export';
      format: 'html' | 'pdf';
      dossierUpdatedAtSnapshot: string;
      pathLabel?: string;
    }
  /** Factory pack · 6 листов ole_globirds (browser или PG snapshot). */
  | {
      type: 'factory_pack_export';
      format: 'html' | 'pdf' | 'server_snapshot';
      snapshotId?: string;
      sheetsReady: number;
      sheetsTotal: number;
      qtyBridged: boolean;
      releaseGateReady: boolean;
      dossierUpdatedAtSnapshot: string;
    };

export type Workshop2TzActionLogEntry = {
  entryId: string;
  /** ISO-8601 */
  at: string;
  by: string;
  action: Workshop2TzActionLogPayload;
};

export type Workshop2DossierLifecycleState =
  | 'draft'
  | 'handoff_ready'
  | 'sent_to_production'
  | 'accepted'
  | 'rework_requested';

export type Workshop2DossierRevision = {
  revisionId: string;
  state: Workshop2DossierLifecycleState;
  changedAt: string;
  changedBy: string;
  comment?: string;
};

export type Workshop2DossierApprovalRecord = {
  approvalId: string;
  role: 'designer' | 'technologist' | 'brand_manager' | 'production_lead';
  decision: 'approved' | 'rejected' | 'rework';
  at: string;
  by: string;
  comment?: string;
  section?: string;
};

/**
 * Снимок метаданных экспорта «Итоговое ТЗ» (для истории и диффов).
 */
export type Workshop2FinalExportSnapshotMeta = {
  snapshotId: string;
  createdAt: string;
  createdBy: string;
  dossierVersion: number;
  dossierUpdatedAtSnapshot?: string;
  lifecycleState?: Workshop2DossierLifecycleState;
};

/**
 * Полная запись снимка экспорта: метаданные + зафиксированное состояние досье.
 */
export type Workshop2FinalExportSnapshotRecord = Workshop2FinalExportSnapshotMeta & {
  dossierSnapshot: Workshop2DossierPhase1;
  exportContextSnapshot?: Record<string, unknown>;
};
