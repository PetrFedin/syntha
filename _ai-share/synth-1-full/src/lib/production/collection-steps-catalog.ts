import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
/**
 * Каталог этапов коллекции: полный контур от брифа и SKU до ESG.
 * Порядок в COLLECTION_STEPS — единый источник правды: матрица, справка, мини-схема и COLLECTION_BRAND_NARRATIVE_STEP_IDS совпадают с топологией dependsOn.
 * Продуктовая документация (корень репозитория): COLLECTION_CONTROL_UNIFIED_RU.md, COLLECTION_CONTROL_IMPLEMENTATION_MAP_RU.md — держать в синхроне с этим файлом.
 * Разработка коллекции: мини-шкала в карточке SKU — левая часть этапов каталога до якоря `supply-path`, правая от него (`workshop2-collection-metrics.ts`).
 * Матрица «этап каталога → вкладка карточки разработки коллекции» и handoff в серию — `workshop2-core1-stage-routing.ts` (импортирует только этот каталог).
 * Краткая цепочка в подсказке вкладки «Этапы» цеха: `floor-flow.ts` → `PRODUCTION_FLOOR_STEPS[0].hint` (обновлять при изменении порядка этапов).
 * Дорожная карта в переговорах — `COLLECTION_BRAND_GUIDE_STEP_IDS` (может расходиться с матрицей там, где `dependsOn` отражает физику цеха).
 * Профили сценария (reorder, готовый товар и т.д.) — `collection-production-profiles.ts` + поле `productionProfileId` в unified flow.
 */
import type { ProductionFloorTabId } from '@/lib/production/floor-flow';
import { ROUTES } from '@/lib/routes';

export interface CollectionStepCrossLink {
  label: string;
  href: string;
}

export interface CollectionStep {
  id: string;
  title: string;
  description: string;
  area: 'Ассортимент' | 'Финансы' | 'Производство' | 'B2B' | 'Устойчивость';
  mandatory: boolean;
  canSkipForNow: boolean;
  dependsOn: string[];
  href?: string;
  /** Горизонталь: соответствие вкладке «Цех» (floorTab в URL) */
  productionFloorTab?: ProductionFloorTabId;
  /** Если не вкладка цеха — краткий модуль (колонка «Ось UI») */
  externalAxisLabel?: string;
  /** Смежные маршруты (фабрики, RFQ, резерв…) */
  crossLinks?: CollectionStepCrossLink[];
  /** Группа в матрице MVP (вертикальные блоки процесса) */
  phase?: string;
  /** Зависимости: при «не начато» не блокируют следующий этап (опциональный шаг в цепочке) */
  relaxesWhenNotStarted?: boolean;
  /**
   * «В модуль» / ось UI в матрице: только collectionId + целевой URL, без привязки артикула в query.
   * Для этапов «Коллекция и экономика», где контекст — вся коллекция, а не карточка SKU.
   */
  collectionScopedModuleNav?: boolean;
}

export const COLLECTION_STEPS: CollectionStep[] = [
  {
    id: 'brief',
    title: 'Бриф коллекции и цели',
    description:
      'Сезон, выручка и маржа, аудитория, настроение и ограничения — старт для ассортимента и производства.',
    area: 'Ассортимент',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: [],
    /** Хаб коллекции в цеху: при работе из производства уже есть collectionId — не вести на пустую форму «новая коллекция». */
    href: ROUTES.brand.productionFloorTab('workshop'),
    productionFloorTab: 'workshop',
    externalAxisLabel: 'Коллекция в цеху',
    crossLinks: [
      { label: 'Список коллекций', href: ROUTES.brand.collections },
      { label: 'Новая коллекция', href: ROUTES.brand.collectionsNew },
      { label: 'LIVE · схема (цех)', href: ROUTES.brand.productionFloorTab('live') },
      { label: 'Этапы и зависимости', href: ROUTES.brand.productionFloorTab('stages') },
    ],
    phase: 'Коллекция и экономика',
    collectionScopedModuleNav: true,
  },
  {
    id: 'assortment-map',
    title: 'Карта ассортимента (SKU / категории)',
    description:
      'Создание артикулов коллекции: категории, дропы, размерная сетка. Основа для производства всех нужных SKU.',
    area: 'Ассортимент',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: ['brief'],
    href: ROUTES.brand.products,
    externalAxisLabel: 'Продукты · PIM',
    crossLinks: [
      { label: 'Этапы и зависимости', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Коллекции', href: ROUTES.brand.collections },
      { label: 'Хаб коллекции (цех)', href: ROUTES.brand.productionFloorTab('workshop') },
      { label: 'LIVE · схема', href: ROUTES.brand.productionFloorTab('live') },
      { label: 'Себестоимость и маржа', href: ROUTES.brand.budgetActual },
    ],
    phase: 'Коллекция и экономика',
    collectionScopedModuleNav: true,
  },
  {
    id: 'collection-hub',
    title: 'Коллекция в цеху (хаб артикулов)',
    description:
      'Одна точка входа: выбранная коллекция, все артикулы, прогресс и быстрые переходы в производство.',
    area: 'Производство',
    mandatory: false,
    canSkipForNow: true,
    dependsOn: ['assortment-map'],
    href: ROUTES.brand.productionFloorTab('workshop'),
    productionFloorTab: 'workshop',
    crossLinks: [
      { label: 'Матрица этапов', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'LIVE · схема', href: ROUTES.brand.productionFloorTab('live') },
      { label: 'Карта SKU (каталог)', href: ROUTES.brand.products },
    ],
    phase: 'Коллекция и экономика',
    collectionScopedModuleNav: true,
  },
  {
    id: 'costing',
    title: 'Себестоимость и маржа',
    description:
      'Landed cost, опт/розница, маржа по стилям; фиксация и согласование стоимости сырья и условий производства — до выбора фабрики и календаря серии. Переписка, задачи и слоты в календаре с ответственными.',
    area: 'Финансы',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: ['assortment-map'],
    href: ROUTES.brand.budgetActual,
    externalAxisLabel: 'Бюджет · факт',
    crossLinks: [
      { label: 'Прайсинг', href: ROUTES.brand.pricing },
      { label: 'Хаб коллекции', href: ROUTES.brand.productionFloorTab('workshop') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Материалы / закупка', href: ROUTES.brand.materials },
      { label: 'Сообщения (согласования)', href: ROUTES.brand.messages },
      { label: 'Задачи', href: ROUTES.brand.tasks },
      { label: 'Календарь', href: ROUTES.brand.calendar },
    ],
    phase: 'Коллекция и экономика',
    collectionScopedModuleNav: true,
  },
  {
    id: 'materials',
    title: 'Подбор материалов, фурнитуры и поставщиков',
    description:
      'Ткани и подклад, фурнитура, нормы расхода; кандидаты поставщиков, RFQ, сравнение условий — до фиксации в ТЗ и закупке.',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: true,
    dependsOn: ['assortment-map'],
    href: ROUTES.brand.materials,
    externalAxisLabel: 'Материалы · BOM',
    crossLinks: [
      { label: 'Поставщики', href: ROUTES.brand.suppliers },
      { label: 'RFQ', href: ROUTES.brand.suppliersRfq },
      { label: 'Бронь материалов', href: ROUTES.brand.materialsReservation },
      { label: 'Снабжение цеха', href: ROUTES.brand.productionFloorTab('supplies') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Сообщения', href: ROUTES.brand.messages },
      { label: 'Календарь', href: ROUTES.brand.calendar },
    ],
    phase: 'Конструкция · материалы · ТЗ',
  },
  {
    id: 'photo-ref',
    title: 'Референсы модели, скетчи, фото',
    description:
      'Визуальный слой до и вместе с ТЗ: рефы, скетчи, съёмка прототипа, студийные фото — фиксируются до формализации Tech Pack и обновляются по мере согласований. Комментарии и согласование вида — в чатах и задачах; дедлайны — в календаре.',
    area: 'Ассортимент',
    mandatory: false,
    canSkipForNow: true,
    dependsOn: ['materials'],
    href: ROUTES.brand.media,
    externalAxisLabel: 'Медиа',
    crossLinks: [
      { label: 'Контент-хаб', href: ROUTES.brand.contentHub },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Tech Pack', href: ROUTES.brand.productionTechPackStyle('new') },
      { label: 'Сообщения', href: ROUTES.brand.messages },
      { label: 'Задачи', href: ROUTES.brand.tasks },
      { label: 'Календарь', href: ROUTES.brand.calendar },
    ],
    phase: 'Конструкция · материалы · ТЗ',
    relaxesWhenNotStarted: true,
  },
  {
    id: 'tech-pack',
    title: 'ТЗ / Tech Pack: модель, лекала, детали, швы, габариты',
    description:
      'Текстовое ТЗ модели на базе референсов и подобранных материалов: формат лекал и деталей, припуски, швы, габариты, градация — единая база для семпла и серии. Хранение и версии лекал (PLM/интеграции); согласование формулировок — в переписке, задачах и календаре.',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: ['materials', 'photo-ref'],
    href: ROUTES.brand.productionTechPackStyle('new'),
    externalAxisLabel: 'Tech pack',
    crossLinks: [
      { label: 'Медиа · референсы', href: ROUTES.brand.media },
      { label: 'Эталон · fit (цех)', href: ROUTES.brand.productionFloorTab('sample') },
      { label: 'Хаб коллекции', href: ROUTES.brand.productionFloorTab('workshop') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Сообщения', href: ROUTES.brand.messages },
      { label: 'Задачи', href: ROUTES.brand.tasks },
      { label: 'Календарь', href: ROUTES.brand.calendar },
      { label: 'PLM / хранение лекал', href: ROUTES.brand.integrationsErpPlm },
    ],
    phase: 'Конструкция · материалы · ТЗ',
  },
  {
    id: 'gate-all-stakeholders',
    title: 'Согласование всех сторон (дизайн · тех · закупка)',
    description:
      'Формальное «ок» по ТЗ, материалам, фурнитуре и конструктиву от всех сторон: тред в сообщениях, чек-лист задач, встречи/слоты в календаре с назначенными ответственными. Здесь же фиксируется итог для закупки и семпла (MVP: плюс ручной статус этапа).',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: ['tech-pack', 'materials', 'photo-ref'],
    href: ROUTES.brand.processLiveProduction,
    externalAxisLabel: 'LIVE процесс',
    crossLinks: [
      { label: 'LIVE · вкладка цеха', href: ROUTES.brand.productionFloorTab('live') },
      { label: 'LIVE процесс (схема)', href: ROUTES.brand.processLiveProduction },
      { label: 'Хаб коллекции', href: ROUTES.brand.productionFloorTab('workshop') },
      { label: 'Сообщения', href: ROUTES.brand.messages },
      { label: 'Задачи', href: ROUTES.brand.tasks },
      { label: 'Календарь', href: ROUTES.brand.calendar },
      { label: 'Команда · задачи', href: ROUTES.brand.teamTasks },
      { label: 'Матрица этапов', href: ROUTES.brand.productionFloorTab('stages') },
    ],
    phase: 'Согласования и поставка',
  },
  {
    id: 'supply-path',
    title: 'Поставщик · закупка или сток · поставка в цех',
    description:
      'Утверждённый поставщик по номенклатуре: заказ и поставка сырья/фурнитуры либо отбор со стока (VMI), контроль прихода под семпл и серию. Согласования сроков и отгрузок — в сообщениях; задачи закупки; в календаре — ответственные по поставке и приёмке.',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: true,
    dependsOn: ['gate-all-stakeholders'],
    href: ROUTES.brand.materials,
    externalAxisLabel: 'Закупка · сток',
    crossLinks: [
      { label: 'Снабжение цеха', href: ROUTES.brand.productionFloorTab('supplies') },
      { label: 'VMI / запасы', href: ROUTES.brand.vmi },
      { label: 'Склад бренда', href: ROUTES.brand.warehouse },
      { label: 'Поставщики', href: ROUTES.brand.suppliers },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Сообщения', href: ROUTES.brand.messages },
      { label: 'Задачи', href: ROUTES.brand.tasks },
      { label: 'Календарь', href: ROUTES.brand.calendar },
    ],
    phase: 'Согласования и поставка',
  },
  {
    id: 'samples',
    title: 'Отшив семплов, лекала на семпл, отправка и примерки',
    description:
      'Пошив образцов по утверждённому ТЗ, перенос лекал в цех семпла, логистика отправки семплов (к кому и когда). Комментарии по примерке и доработкам — в чатах и fit; сроки и ответственные — в календаре и задачах до Gold Sample.',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: ['tech-pack', 'supply-path'],
    href: ROUTES.brand.productionFloorTab('sample'),
    productionFloorTab: 'sample',
    crossLinks: [
      { label: 'Gold sample', href: ROUTES.brand.productionGoldSample },
      { label: 'Fit / комментарии', href: ROUTES.brand.productionFitComments },
      { label: 'План · PO', href: ROUTES.brand.productionFloorTab('plan') },
      { label: 'Хаб коллекции', href: ROUTES.brand.productionFloorTab('workshop') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Сообщения', href: ROUTES.brand.messages },
      { label: 'Задачи', href: ROUTES.brand.tasks },
      { label: 'Календарь', href: ROUTES.brand.calendar },
      { label: 'Логистика', href: ROUTES.brand.logistics },
    ],
    phase: 'Семплы и B2B',
  },
  {
    id: 'b2b-linesheets',
    title: 'B2B: лукбуки и лайншиты',
    description:
      'Материалы для байеров параллельно с семплами или после эталона — оптовые условия и презентация коллекции.',
    area: 'B2B',
    mandatory: false,
    canSkipForNow: true,
    dependsOn: ['samples'],
    href: ROUTES.brand.b2bLinesheets,
    externalAxisLabel: 'B2B',
    crossLinks: [
      { label: 'Создать linesheet', href: ROUTES.brand.b2bLinesheetsCreate },
      { label: 'Проекты лукбука', href: LEGACY_ROUTES.brand.lookbookProjects },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Хаб коллекции', href: ROUTES.brand.productionFloorTab('workshop') },
      { label: 'Комплектация B2B · склад', href: ROUTES.brand.warehouse },
    ],
    phase: 'Семплы и B2B',
  },
  {
    id: 'production-window',
    title: 'Производство: площадка и сроки процессов',
    description:
      'Выбор фабрики/ателье, мощности и календарь: раскрой, пошив, контрольные точки, готовность партии — до PO. Согласования и назначения ответственных за производство — в сообщениях, задачах и общем календаре платформы (наряду с Gantt цеха).',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: ['samples', 'costing', 'supply-path'],
    href: ROUTES.brand.factories,
    externalAxisLabel: 'Фабрики · план',
    crossLinks: [
      { label: 'LIVE · схема (цех)', href: ROUTES.brand.productionFloorTab('live') },
      { label: 'План · PO', href: ROUTES.brand.productionFloorTab('plan') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Календарь', href: ROUTES.brand.calendar },
      { label: 'Задачи', href: ROUTES.brand.tasks },
      { label: 'Сообщения', href: ROUTES.brand.messages },
      { label: 'Gantt (прямой)', href: ROUTES.brand.productionGantt },
    ],
    phase: 'Производство серии',
  },
  {
    id: 'po',
    title: 'PO и запуск серии в производство',
    description:
      'Формальные заказы по стилям и дропам после согласованных площадки и сроков; загрузка линий и контроль в Gantt.',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: ['production-window'],
    href: ROUTES.brand.productionFloorTab('plan'),
    productionFloorTab: 'plan',
    crossLinks: [
      { label: 'Фабрики', href: ROUTES.brand.factories },
      { label: 'LIVE · схема', href: ROUTES.brand.productionFloorTab('live') },
      { label: 'Операции', href: ROUTES.brand.productionFloorTab('ops') },
      { label: 'Снабжение', href: ROUTES.brand.productionFloorTab('supplies') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Gantt (прямой URL)', href: ROUTES.brand.productionGantt },
    ],
    phase: 'Производство серии',
  },
  {
    id: 'floor-ops',
    title: 'Операции: BOM, сводка PO, аудит',
    description:
      'PO, BOM, QC на уровне операций; переписка с фабрикой и поставщиками, задачи и напоминания — через сообщения, задачи и календарь; сводка и аудит — вкладка «Операции».',
    area: 'Производство',
    mandatory: false,
    canSkipForNow: true,
    dependsOn: ['po'],
    href: ROUTES.brand.productionFloorTab('ops'),
    productionFloorTab: 'ops',
    crossLinks: [
      { label: 'План · PO', href: ROUTES.brand.productionFloorTab('plan') },
      { label: 'Снабжение', href: ROUTES.brand.productionFloorTab('supplies') },
      { label: 'Nesting AI', href: ROUTES.brand.productionFloorTab('nesting') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Операции (полная страница)', href: ROUTES.brand.productionOperations },
      { label: 'Сообщения', href: ROUTES.brand.messages },
      { label: 'Задачи', href: ROUTES.brand.tasks },
      { label: 'Календарь', href: ROUTES.brand.calendar },
    ],
    phase: 'Производство серии',
  },
  {
    id: 'supplies-bind',
    title: 'Снабжение цеха (VMI · бронирование)',
    description: 'Резерв и запасы под подтверждённые PO и даты раскроя. Вкладка «Снабжение».',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: true,
    dependsOn: ['po'],
    href: ROUTES.brand.productionFloorTab('supplies'),
    productionFloorTab: 'supplies',
    crossLinks: [
      { label: 'План · PO', href: ROUTES.brand.productionFloorTab('plan') },
      { label: 'Nesting AI', href: ROUTES.brand.productionFloorTab('nesting') },
      { label: 'Материалы', href: ROUTES.brand.materials },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'VMI (прямой URL)', href: ROUTES.brand.vmi },
    ],
    phase: 'Производство серии',
  },
  {
    id: 'nesting-cut',
    title: 'Nesting AI · раскрой',
    description: 'Раскладка лекал на рулон, маркеры и выход ткани после резервов, до пошива.',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: true,
    dependsOn: ['po', 'supplies-bind'],
    href: ROUTES.brand.productionFloorTab('nesting'),
    productionFloorTab: 'nesting',
    crossLinks: [
      { label: 'Выпуск в цеху', href: ROUTES.brand.productionFloorTab('launch') },
      { label: 'Снабжение', href: ROUTES.brand.productionFloorTab('supplies') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Nesting (полная страница)', href: ROUTES.brand.productionNesting },
    ],
    phase: 'Производство серии',
  },
  {
    id: 'floor-execution',
    title: 'Выпуск в цеху (смены · субподряд)',
    description: 'План/факт смен, видеоэтапы по PO, субподряд раскрой/пошив — вкладка «Выпуск».',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: ['po', 'nesting-cut'],
    href: ROUTES.brand.productionFloorTab('launch'),
    productionFloorTab: 'launch',
    crossLinks: [
      { label: 'Nesting AI', href: ROUTES.brand.productionFloorTab('nesting') },
      { label: 'ОТК', href: ROUTES.brand.productionFloorTab('quality') },
      { label: 'LIVE · схема', href: ROUTES.brand.productionFloorTab('live') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
    ],
    phase: 'Производство серии',
  },
  {
    id: 'qc',
    title: 'ОТК: инспекции и приёмка партий',
    description:
      'Мобильный ОТК и рабочее место QC: чек-листы, дефекты, статусы партий перед складом.',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: true,
    dependsOn: ['floor-execution'],
    href: ROUTES.brand.productionFloorTab('quality'),
    productionFloorTab: 'quality',
    crossLinks: [
      { label: 'Выпуск', href: ROUTES.brand.productionFloorTab('launch') },
      { label: 'Склад цеха', href: ROUTES.brand.productionFloorTab('receipt') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'QC app (прямой URL)', href: ROUTES.brand.productionQcApp },
      { label: 'Рабочее место QC', href: '/brand/quality' },
    ],
    phase: 'Качество · склад · отгрузка',
  },
  {
    id: 'ready-made',
    title: 'Готовый товар и склад бренда',
    description:
      'Входящая приёмка с производства на склад бренда: сверка с PO, качество, остатки по коллекции — до комплектации под опт.',
    area: 'Производство',
    mandatory: true,
    canSkipForNow: false,
    dependsOn: ['qc'],
    href: ROUTES.brand.productionFloorTab('receipt'),
    productionFloorTab: 'receipt',
    crossLinks: [
      { label: 'ОТК', href: ROUTES.brand.productionFloorTab('quality') },
      { label: 'Операции', href: ROUTES.brand.productionFloorTab('ops') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Готовый товар (отдельная страница)', href: ROUTES.brand.productionReadyMade },
    ],
    phase: 'Качество · склад · отгрузка',
  },
  {
    id: 'wholesale-prep',
    title: 'Комплектация под B2B (маркировка · упаковка)',
    description:
      'Подготовка партий к отгрузке байерам/в магазины клиентов: этикетки, короба, паллеты, соответствие заказам B2B по коллекции.',
    area: 'B2B',
    mandatory: true,
    canSkipForNow: true,
    dependsOn: ['ready-made'],
    href: ROUTES.brand.warehouse,
    externalAxisLabel: 'Склад · комплектация',
    crossLinks: [
      { label: 'Склад · вкладка цеха', href: ROUTES.brand.productionFloorTab('receipt') },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Лайншиты', href: ROUTES.brand.b2bLinesheets },
      { label: 'Логистика', href: ROUTES.brand.logistics },
      { label: 'Заказы B2B', href: ROUTES.brand.b2bOrders },
      { label: 'Консолидация', href: ROUTES.brand.logisticsConsolidation },
    ],
    phase: 'Качество · склад · отгрузка',
  },
  {
    id: 'b2b-ship-stores',
    title: 'Отгрузка в магазины клиентов',
    description:
      'Исходящие отгрузки по оптовым заказам: ASN/статусы, маршруты до торговых точек партнёров — граница «производство коллекции → клиент».',
    area: 'B2B',
    mandatory: true,
    canSkipForNow: true,
    dependsOn: ['wholesale-prep'],
    href: LEGACY_ROUTES.brand.b2bShipments,
    externalAxisLabel: 'B2B · отгрузки',
    crossLinks: [
      { label: 'Склад бренда', href: ROUTES.brand.warehouse },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Заказы B2B', href: ROUTES.brand.b2bOrders },
      { label: 'Логистика', href: ROUTES.brand.logistics },
      { label: 'LIVE: B2B', href: ROUTES.brand.processLiveB2b },
      { label: 'LIVE: логистика', href: ROUTES.brand.processLiveLogistics },
    ],
    phase: 'Качество · склад · отгрузка',
  },
  {
    id: 'sustainability',
    title: 'ESG и устойчивость',
    description: 'Сертификаты, комплаенс, паспорт изделия и циркулярность по коллекции.',
    area: 'Устойчивость',
    mandatory: false,
    canSkipForNow: true,
    dependsOn: ['materials', 'po'],
    href: ROUTES.brand.esg,
    externalAxisLabel: 'ESG',
    crossLinks: [
      { label: 'Материалы', href: ROUTES.brand.materials },
      { label: 'Этапы коллекции', href: ROUTES.brand.productionFloorTab('stages') },
      { label: 'Хаб коллекции', href: ROUTES.brand.productionFloorTab('workshop') },
      { label: 'Комплаенс', href: ROUTES.brand.compliance },
      { label: 'Circular hub', href: ROUTES.brand.circularHub },
    ],
    phase: 'Устойчивость',
  },
];

const COLLECTION_STEP_BY_ID_LOOKUP = new Map(COLLECTION_STEPS.map((s) => [s.id, s] as const));

/**
 * Все этапы каталога, от которых транзитивно зависит `stepId` (поле `dependsOn` у этапов).
 * Пример: для `production-window` — полный набор предпосылок до сценария «площадка и сроки серии».
 */
export function getTransitiveDependsOnStepIds(stepId: string): readonly string[] {
  const root = COLLECTION_STEP_BY_ID_LOOKUP.get(stepId);
  if (!root) return [];
  const out = new Set<string>();
  const stack = [...root.dependsOn];
  while (stack.length) {
    const d = stack.pop()!;
    if (out.has(d)) continue;
    out.add(d);
    const s = COLLECTION_STEP_BY_ID_LOOKUP.get(d);
    if (s) stack.push(...s.dependsOn);
  }
  return [...out];
}

/** Id этапов в том же порядке, что и матрица / dependsOn (без отдельного «презентационного» порядка). */
export const COLLECTION_BRAND_NARRATIVE_STEP_IDS: readonly string[] = COLLECTION_STEPS.map(
  (s) => s.id
);

/** Подписи этапов в каноническом порядке каталога (справка, онбординг). */
export function getCollectionBrandNarrativeTitles(): string[] {
  return COLLECTION_STEPS.map((s) => s.title);
}

/**
 * Порядок из гайда бренда: бриф → … → ESG (как в продуктовой дорожной карте и переговорах).
 * Не подменяет `COLLECTION_STEPS`: в матрице и блокировках верен граф `dependsOn` (семплы после ТЗ и поставки; nesting → выпуск → ОТК → склад → комплектация).
 */
export const COLLECTION_BRAND_GUIDE_STEP_IDS: readonly string[] = [
  'brief',
  'assortment-map',
  'collection-hub',
  'costing',
  'materials',
  'samples',
  'supply-path',
  'gate-all-stakeholders',
  'photo-ref',
  'tech-pack',
  'b2b-linesheets',
  'production-window',
  'po',
  'floor-ops',
  'supplies-bind',
  'wholesale-prep',
  'ready-made',
  'qc',
  'floor-execution',
  'nesting-cut',
  'b2b-ship-stores',
  'sustainability',
];

export function getCollectionBrandGuideTitles(): string[] {
  const byId = new Map(COLLECTION_STEPS.map((s) => [s.id, s.title] as const));
  return COLLECTION_BRAND_GUIDE_STEP_IDS.map((id) => byId.get(id) ?? id);
}

/** Мини-схема на вкладке «Коллекция» — сейчас полный контур; порядок = COLLECTION_STEPS (не дублировать вручную). */
export const COLLECTION_VISUAL_CHAIN_IDS: readonly string[] = COLLECTION_STEPS.map((s) => s.id);
