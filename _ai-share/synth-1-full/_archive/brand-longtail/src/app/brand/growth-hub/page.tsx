'use client';

import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { getGrowthPlatformCrossLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { Rocket, Users, Megaphone } from 'lucide-react';

const consumer = [
  {
    href: ROUTES.client.visualSearch,
    title: 'Визуальный поиск',
    desc: 'Фото → похожие в каталоге',
  },
  { href: ROUTES.client.capsules, title: 'Капсулы / луки', desc: '3 вещи = образ' },
  { href: ROUTES.client.forYou, title: 'Персональная лента', desc: 'Размеры, бренды, похожие' },
  { href: ROUTES.client.colorStudio, title: 'Цвет и сочетания', desc: 'Эвристики палитры' },
  { href: ROUTES.client.fitAdvisor, title: 'Посадка и размер', desc: 'SKU + голоса + профиль' },
  {
    href: ROUTES.client.outfitBuilder,
    title: 'Конструктор образа',
    desc: 'Слоты, таксономия, пробелы',
  },
  {
    href: ROUTES.shop.b2bSizeFinder,
    title: 'Подбор размера + сетка',
    desc: 'B2B; на PDP — фидбек посадки',
  },
  { href: ROUTES.client.passport, title: 'Digital Passport', desc: 'Происхождение, цепочка' },
  { href: ROUTES.client.sustainabilityExplorer, title: 'Eco-каталог', desc: 'Фильтр по скорингу' },
  { href: ROUTES.client.inspirationBoard, title: 'Доска вдохновения', desc: 'Пины, экспорт JSON' },
  { href: ROUTES.client.sizeCompare, title: 'Сравнение SKU', desc: 'Размеры и состав' },
  { href: ROUTES.client.seasonAtlas, title: 'Сезонный атлас', desc: 'Корзины сезона' },
  { href: ROUTES.client.categoryAtlas, title: 'Атлас категорий', desc: 'Ветки из данных SKU' },
  { href: ROUTES.client.priceWatch, title: 'Слежение за ценой', desc: 'Снимок vs каталог' },
  { href: ROUTES.client.sizeConverter, title: 'Конвертер размеров', desc: 'Одежда и обувь' },
  { href: ROUTES.client.skuAlternatives, title: 'Похожие SKU', desc: 'Смежные артикулы' },
  { href: ROUTES.client.careSymbols, title: 'Пиктограммы ухода', desc: 'Справочник для поддержки' },
  { href: ROUTES.client.waitlist, title: 'Лист ожидания', desc: 'Упущенный спрос' },
  { href: ROUTES.client.fitProfile, title: 'Мой Fit Profile', desc: 'Мерки для авто-подбора' },
];

const partners = [
  {
    href: ROUTES.brand.fabricPassportRollup,
    title: 'Состав и уход (CSV)',
    desc: 'Выгрузка для PIM / МП',
  },
  { href: ROUTES.brand.attributeHealth, title: 'Здоровье атрибутов', desc: 'Пробелы по SKU' },
  { href: ROUTES.brand.launchReadiness, title: 'Готовность к запуску', desc: 'Чек-лист дропа' },
  {
    href: ROUTES.brand.mediaGalleryHealth,
    title: 'Медиа галерея SKU',
    desc: 'Кадры и мета ширины',
  },
  { href: ROUTES.brand.assortmentMix, title: 'Микс ассортимента', desc: 'Доли категорий' },
  { href: ROUTES.brand.packRules, title: 'MOQ и короба', desc: 'B2B-поля SKU' },
  { href: ROUTES.brand.categoryPricing, title: 'Цены по категориям', desc: 'min/max/медиана, CSV' },
  { href: ROUTES.brand.colorwayCoverage, title: 'Цветовые ряды', desc: 'SKU на color' },
  { href: ROUTES.brand.tradeCodes, title: 'ТН ВЭД и ЕАС', desc: 'Покрытие по SKU' },
  { href: ROUTES.brand.bundles, title: 'Бандлы и сеты', desc: 'Buy the Look / Bundle pricing' },
  { href: ROUTES.brand.demandForecast, title: 'Упущенный спрос', desc: 'Анализ Waitlist' },
  { href: ROUTES.brand.linesheet, title: 'Оптовый лайншит', desc: 'Wholesale B2B Catalog' },
  { href: ROUTES.brand.linesheet, title: 'Оптовый лайншит', desc: 'Wholesale B2B Catalog' },
  { href: ROUTES.brand.salesVelocity, title: 'Скорость продаж', desc: 'Анализ Sell-through' },
  { href: ROUTES.brand.lcaReport, title: 'Эко-след (LCA)', desc: 'Environmental Footprint' },
  { href: ROUTES.brand.assetRights, title: 'Права и кредиты (DAM)', desc: 'Talent & Usage Rights' },
  { href: ROUTES.brand.wholesalePreorder, title: 'Предзаказ (B2B PO)', desc: 'Matrix Order Entry' },
  {
    href: ROUTES.brand.inventoryBalance,
    title: 'Балансировка остатков',
    desc: 'Stock Transfer proposals',
  },
  { href: ROUTES.brand.b2bFinance, title: 'B2B Финансы', desc: 'Credit Limits & Payment Terms' },
  {
    href: ROUTES.brand.assortmentOverlap,
    title: 'Пересечение SKU',
    desc: 'Cannibalization analysis',
  },
  {
    href: ROUTES.brand.assortmentHealth,
    title: 'Здоровье ассортимента',
    desc: 'Catalog-wide health index',
  },
  {
    href: ROUTES.brand.supplierScorecard,
    title: 'KPI поставщиков',
    desc: 'Compliance & Performance',
  },
  {
    href: ROUTES.brand.marginSimulator,
    title: 'Калькулятор маржи',
    desc: 'Markup & Profit simulator',
  },
  {
    href: ROUTES.brand.returnIntelligence,
    title: 'Аналитика возвратов',
    desc: 'Return reasons & Fit sentiment',
  },
  {
    href: ROUTES.brand.markdownPredict,
    title: 'Markdown стратегия',
    desc: 'Price optimization & Liquidation',
  },
  {
    href: ROUTES.brand.showroomAppointments,
    title: 'Календарь байеров',
    desc: 'Showroom & virtual visits',
  },
  {
    href: ROUTES.brand.digitalTwinTesting,
    title: 'A/B тесты дизайна',
    desc: 'Virtual Twin pre-launch testing',
  },
  {
    href: ROUTES.brand.assortmentMixPlanner,
    title: 'OTB Планирование',
    desc: 'Collection category balance',
  },
  { href: ROUTES.brand.replenishment, title: 'План подсортировки', desc: 'Smart Restock planning' },
  {
    href: ROUTES.brand.assetCompliance,
    title: 'QA Контента (МП)',
    desc: 'Asset Compliance for WB/Ozon',
  },
  {
    href: ROUTES.brand.campaignVersions,
    title: 'B2B Кампании',
    desc: 'Catalog tiers & Early Bird access',
  },
  {
    href: ROUTES.brand.collectionLca,
    title: 'Сводный LCA-отчет',
    desc: 'Sustainability Rollup dashboard',
  },
  {
    href: ROUTES.brand.assortmentGaps,
    title: 'Анализ пробелов (Gaps)',
    desc: 'Category-level gap discovery',
  },
  {
    href: ROUTES.brand.priceLadder,
    title: 'Ценовая лестница',
    desc: 'Price architecture visualization',
  },
  {
    href: ROUTES.brand.visualGrid,
    title: 'Визуальная сетка (Merch)',
    desc: 'AI-optimized storefront layout',
  },
  {
    href: ROUTES.brand.assortmentOverlap,
    title: 'Анализ нахлеста (Overlap)',
    desc: 'Detect SKU cannibalization risk',
  },
  {
    href: ROUTES.brand.marketplaceMapping,
    title: 'Маркетплейсы (Sync)',
    desc: 'WB/Ozon SKU Mapping Tool',
  },
  {
    href: ROUTES.brand.marketplaceHealth,
    title: 'Здоровье карточек (MP)',
    desc: 'Buybox & Buyback analytics',
  },
  {
    href: ROUTES.brand.showroomPlanner,
    title: 'B2B Шоурумы',
    desc: 'Manage wholesale appointments',
  },
  {
    href: ROUTES.brand.showroomSession('SH-2026-01'),
    title: 'Live Сессия',
    desc: 'Interactive B2B presenter',
  },
  {
    href: ROUTES.brand.regionalDemand,
    title: 'Карта спроса (Heatmap)',
    desc: 'Regional RF demand analytics',
  },
  {
    href: ROUTES.brand.lineSheetGenerator,
    title: 'Генератор Line Sheets',
    desc: 'Automatic B2B catalog creation',
  },
  {
    href: ROUTES.brand.assortmentHealth,
    title: 'Здоровье ассортимента',
    desc: 'Assortment balance scorecard',
  },
  {
    href: ROUTES.brand.visibilityIndex,
    title: 'Видимость в поиске',
    desc: 'WB/Ozon SEO Rank Tracker',
  },
  {
    href: ROUTES.brand.regionalDemand,
    title: 'Карта спроса (Heatmap)',
    desc: 'Regional RF demand analytics',
  },
  {
    href: ROUTES.brand.cisSourcing,
    title: 'Локальный сорсинг (СНГ)',
    desc: 'RF/CIS Supplier Registry',
  },
  { href: ROUTES.brand.b2bCampaigns, title: 'B2B Кампании', desc: 'Marketing campaign versioning' },
  {
    href: ROUTES.brand.localCompliance,
    title: 'Compliance & ЭДО (РФ)',
    desc: 'Honest Mark & Russian Legal Ops',
  },
  {
    href: ROUTES.brand.weatherTraffic,
    title: 'Трафик и Погода',
    desc: 'Weather impact on retail footfall',
  },
  { href: ROUTES.brand.factoryQc, title: 'Контроль ОТК', desc: 'Factory QC Portal & Check-lists' },
  {
    href: ROUTES.brand.partnerAssortmentMatrix,
    title: 'Матрица ассортимента',
    desc: 'Канал × размер × цвет, статусы',
  },
  {
    href: ROUTES.brand.partnerMarkdownPredict,
    title: 'Распродажа / markdown',
    desc: 'Правила и заготовка ML',
  },
  {
    href: ROUTES.brand.damContentRights,
    title: 'DAM и права',
    desc: 'Lookbook, watermark, лицензии',
  },
  { href: ROUTES.brand.factoryPortal, title: 'Портал фабрики', desc: 'Образцы, QC, tech pack' },
  {
    href: ROUTES.brand.marketplaceCardHealth,
    title: 'Карточки на МП',
    desc: 'Ошибки атрибутов, регионы',
  },
  {
    href: ROUTES.brand.showroomPlanner,
    title: 'B2B Showroom Look-to-Order',
    desc: 'Draft wholesale orders from visual looks',
  },
  { href: '#', title: 'RFID Inventory Hub', desc: 'Real-time retail store stock sync' },
  { href: '#', title: 'Supplier QC ОТК', desc: 'Batch inspection reports & pass rates' },
  { href: '#', title: 'National Price Ladder', desc: 'Price architecture across RU regions' },
];

const wow = [
  { href: ROUTES.brand.aiTools, title: 'AI: копирайт под канал', desc: 'WB / Ozon / Instagram' },
  { href: ROUTES.brand.showroom, title: 'Виртуальный шоурум', desc: '3D-сцена, trade shows' },
  { href: ROUTES.brand.integrations, title: 'Интеграции', desc: 'Выгрузки и мониторинг' },
];

const operations = [
  { href: '#', title: 'B2B Quality Claims', desc: 'Управление претензиями по браку' },
  { href: '#', title: 'Regional Demand Map', desc: 'Прогноз спроса по регионам РФ' },
  { href: '#', title: 'VIP Appointment Hub', desc: 'Записи на примерки и стилистов' },
  { href: '#', title: 'Store Capacity AI', desc: 'Мониторинг загрузки залов' },
];

const compliance = [
  { href: '#', title: 'Honest Mark (KIZ)', desc: 'Честный Знак: КИЗы и статусы' },
  { href: '#', title: 'EDO Tracker (Diadoc)', desc: 'ЭДО: подписание УПД и актов' },
  { href: '#', title: 'EAC Certification Hub', desc: 'Сертификаты соответствия ТР ТС' },
  { href: '#', title: 'Customs GDT Archive', desc: 'Архив ГТД и таможенных деклараций' },
];

const fintech = [
  { href: '#', title: 'B2B Factoring', desc: 'Факторинг: лимиты и заявки' },
  { href: '#', title: 'Credit Limit Monitor', desc: 'Мониторинг дебиторской задолженности' },
  { href: '#', title: 'Payment Milestones', desc: 'Графики платежей (30/70, 50/50)' },
  { href: '#', title: 'Financial Audit Logs', desc: 'Логи финансовых изменений партнера' },
];

const admin = [
  { href: '#', title: 'Platform Infrastructure', desc: 'CIS, EDO, API connectivity health' },
  { href: '#', title: 'User Role Governance', desc: 'Access control for Store/Brand/Supplier' },
  { href: '#', title: 'Regional Logistix Admin', desc: 'Cross-border EAEU routing rules' },
  { href: '#', title: 'Financial Audit Logs', desc: 'Credit limit changes & PO history' },
];

const store = [
  { href: '#', title: 'RFID Inventory Sync', desc: 'Мгновенная сверка остатков в зале' },
  { href: '#', title: 'In-Store Clienteling', desc: 'Профиль стиля клиента для продавца' },
  { href: '#', title: 'Assortment Clash Detection', desc: 'Анализ конкуренции в радиусе 2.5км' },
  { href: '#', title: 'Staff Shift Optimizer', desc: 'AI-планирование графиков по трафику' },
  { href: '#', title: 'Fitting Room Queue', desc: 'Цифровая очередь в примерочные' },
  { href: '#', title: 'Repair & Atelier Hub', desc: 'Управление ремонтом и подгонкой' },
  { href: '#', title: 'Staff Training Hub', desc: 'Обучающие материалы по артикулам' },
  { href: '#', title: 'Click & Collect Ops', desc: 'Управление выдачей интернет-заказов' },
  { href: '#', title: 'VM Planogram Check', desc: 'Фотоотчеты и стандарты выкладки' },
  { href: '#', title: 'Store Clustering (Tier A-C)', desc: 'Группировка магазинов для аллокации' },
];

const sustainability = [
  { href: '#', title: 'Material Traceability', desc: 'Прослеживаемость сырья (Ledger)' },
  { href: '#', title: 'ESG Order Scorecard', desc: 'Эко-скоринг оптовых заказов' },
  { href: '#', title: 'Take-back & Recycling', desc: 'Возврат и переработка изделий' },
  { href: '#', title: 'LCA Batch Reports', desc: 'Поартикульные эко-паспорта' },
];

const production = [
  { href: '#', title: 'Material Reservation', desc: 'Бронирование ткани под коллекции' },
  { href: '#', title: 'Factory Capacity Plan', desc: 'Загрузка линий и свободные слоты' },
  { href: '#', title: 'Lead Time Estimator', desc: 'Прогноз сроков производства (SLA)' },
  { href: '#', title: 'Supplier QC ОТК', desc: 'Приемка партий и дефектные акты' },
  { href: '#', title: 'B2B Tech Pack Hub', desc: 'Техкарты и лекала для фабрик' },
];

const distribution = [
  { href: '#', title: 'Regional Stock Balance', desc: 'Ребалансировка между филиалами' },
  { href: '#', title: 'Regional Hub Reservation', desc: 'Резервы стока в опорных хабах' },
  { href: '#', title: 'Delivery Windows (SLA)', desc: 'Графики отгрузки дистрибьютора' },
  { href: '#', title: 'Logistics Routing', desc: 'Оптимизация middle-mile маршрутов' },
  { href: '#', title: 'Pre-Order Allocation', desc: 'Аллокация стока для VIP-байеров' },
  { href: '#', title: 'EAEU Customs Calc', desc: 'Расчет пошлин и логистики СНГ' },
  {
    href: '#',
    title: 'Local Courier Dispatch',
    desc: 'Управление последней милей (CDEK/Boxberry)',
  },
  { href: '#', title: 'Stock Swap Tracking', desc: 'Трекинг перемещений между магазинами' },
  { href: '#', title: 'Ship-to-Store Splitter', desc: 'Распределение заказа по точкам' },
  { href: '#', title: 'EAEU Export Estimator', desc: 'Расчет налогов и пошлин ЕАЭС' },
];

const b2b_advanced = [
  { href: '#', title: 'Tiered Price Matrix', desc: 'Ступенчатые цены от объема заказа' },
  { href: '#', title: 'Order KPI Simulator', desc: 'Прогноз Sell-through и маржи заказа' },
  { href: '#', title: 'Partner Credit Scoring', desc: 'Оценка надежности и лимитов' },
  { href: '#', title: 'Wholesale Contract Gen', desc: 'Авто-генерация договоров поставки' },
  { href: '#', title: 'Buyer Presence Live', desc: 'Кто из партнеров в онлайне в B2B' },
  { href: '#', title: 'Showroom Collab Hub', desc: 'Общие заметки Бренд-Магазин-Дистрибьютор' },
  { href: '#', title: 'Partner Perk Program', desc: 'Привилегии за объем предзаказа' },
  { href: '#', title: '3D Virtual Sample Fitting', desc: 'B2B-примерочная для байеров' },
  { href: '#', title: 'Assortment Capsule Integrity', desc: 'Проверка целостности капсул заказа' },
  { href: '#', title: 'Wholesale Order Lifecycle', desc: 'Трекинг PO: производство и логистика' },
  { href: '#', title: 'B2B Multi-Currency Settlement', desc: 'Взаиморасчеты (RUB/CNY/KZT)' },
  { href: '#', title: 'Showroom Resource Sync', desc: 'Управление загрузкой персонала и залов' },
  { href: '#', title: 'Regional Demand Heatmap', desc: 'Визуализация спроса для предзаказов' },
  { href: '#', title: 'AI Smart Reorder Hub', desc: 'Авто-рекомендации по дозаказам B2B' },
  { href: '#', title: 'Live Sample Inventory', desc: 'QR/NFC трекинг образцов в шоуруме' },
];

function LinkGrid({ items }: { items: { href: string; title: string; desc: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((x) => (
        <Link key={x.href} href={x.href}>
          <Card className="h-full transition-colors hover:border-violet-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{x.title}</CardTitle>
              <CardDescription className="text-xs">{x.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="font-mono text-[10px] text-muted-foreground">{x.href}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function BrandGrowthHubPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-6 pb-24">
      <SectionInfoCard
        title="Платформа: рост и вау-сценарии"
        description="Единая точка входа: клиентские фичи (B2C/байер), инструменты партнёров и демо для маркетинга."
        icon={Rocket}
        iconBg="bg-violet-100"
        iconColor="text-violet-700"
      />

      <Tabs defaultValue="consumer">
        <TabsList className={cn(cabinetSurface.tabsList, 'h-auto gap-1 shadow-inner')}>
          <TabsTrigger value="consumer" className="gap-1 text-xs">
            <Users className="h-3.5 w-3.5" />
            Клиенты
          </TabsTrigger>
          <TabsTrigger value="partners" className="text-xs">
            Партнёры
          </TabsTrigger>
          <TabsTrigger value="store" className="text-xs">
            Магазины
          </TabsTrigger>
          <TabsTrigger value="production" className="text-xs">
            Производство
          </TabsTrigger>
          <TabsTrigger value="sustainability" className="text-xs">
            Экология
          </TabsTrigger>
          <TabsTrigger value="distribution" className="text-xs">
            Дистрибуция
          </TabsTrigger>
          <TabsTrigger value="b2b_advanced" className="text-xs">
            B2B Pro
          </TabsTrigger>
          <TabsTrigger value="operations" className="text-xs">
            Операции & CRM
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs">
            Комплаенс
          </TabsTrigger>
          <TabsTrigger value="fintech" className="text-xs">
            Финтех
          </TabsTrigger>
          <TabsTrigger value="admin" className="text-xs">
            Админ
          </TabsTrigger>
          <TabsTrigger value="wow" className="gap-1 text-xs">
            <Megaphone className="h-3.5 w-3.5" />
            Демо
          </TabsTrigger>
        </TabsList>
        <TabsContent value="consumer" className="mt-4">
          <LinkGrid items={consumer} />
        </TabsContent>
        <TabsContent value="partners" className="mt-4">
          <LinkGrid items={partners} />
        </TabsContent>
        <TabsContent value="store" className="mt-4">
          <LinkGrid items={store} />
        </TabsContent>
        <TabsContent value="production" className="mt-4">
          <LinkGrid items={production} />
        </TabsContent>
        <TabsContent value="sustainability" className="mt-4">
          <LinkGrid items={sustainability} />
        </TabsContent>
        <TabsContent value="distribution" className="mt-4">
          <LinkGrid items={distribution} />
        </TabsContent>
        <TabsContent value="b2b_advanced" className="mt-4">
          <LinkGrid items={b2b_advanced} />
        </TabsContent>
        <TabsContent value="operations" className="mt-4">
          <LinkGrid items={operations} />
        </TabsContent>
        <TabsContent value="compliance" className="mt-4">
          <LinkGrid items={compliance} />
        </TabsContent>
        <TabsContent value="fintech" className="mt-4">
          <LinkGrid items={fintech} />
        </TabsContent>
        <TabsContent value="admin" className="mt-4">
          <LinkGrid items={admin} />
        </TabsContent>
        <TabsContent value="wow" className="mt-4">
          <LinkGrid items={wow} />
        </TabsContent>
      </Tabs>

      <RelatedModulesBlock
        links={getGrowthPlatformCrossLinks()}
        title="Связанные разделы"
        className="mt-2"
      />
    </div>
  );
}
