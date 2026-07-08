'use client';

import { useState } from 'react';
import CompetitiveAnalysis from '@/components/project-info/competitive-analysis';
import {
  DigitalFashionLabDialog,
  MarketRoomDialog,
  ClientCommunitySpaceDialog,
  IntelligenceAnalyticsLayerDialog,
  CoreInfraTrustLayerDialog,
  B2bB2cDialog,
  PhygitalDialog,
  AiPersonalizationDialog,
  EsgEcosystemDialog,
  ApiLayerDialog,
  PremiumUxDialog,
  GrowthPlatformDialog,
  KeyIdeaCard,
  CycleIntegrationDialog,
  AiInfraDialog,
  FinancialSustainabilityDialog,
} from '@/components/project-info';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BrainCircuit,
  Briefcase,
  DollarSign,
  Gem,
  GitBranch,
  Globe,
  Handshake,
  Lightbulb,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  BarChart2,
  CircleDollarSign,
  Info,
  CheckCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Timeline,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineItem,
  TimelineTitle,
  TimelineDescription,
  TimelineBody,
} from '@/components/ui/timeline';

import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';

const monetizationData = [
  {
    flow: '1. Комиссия с продаж (B2C)',
    mechanic: '10–20% с заказа (мин. 99 ₽)',
    description:
      'Продажи digital/физических товаров через клиентское приложение Syntha. Средний чек — 18 000 ₽, комиссия ~1 800–3 600 ₽.',
    comments: 'Аналог Lamoda/Farfetch. Возможна скидка 1–2 п.п. для Brand PRO.',
  },
  {
    flow: '2. Комиссия с B2B заказов (Market Room)',
    mechanic: '2–5% от ордера (мин. 9 900 ₽)',
    description:
      'Онлайн-заказы байеров и сетей. Средний ордер ~700 000 ₽ → комиссия 14 000–35 000 ₽.',
    comments: 'Аналог JOOR/NuOrder. Основной доход в баинговые сезоны.',
  },
  {
    flow: '3. Подписка Brand PRO',
    mechanic: '35 000 ₽/мес',
    description:
      'Аналитика интереса, AI Copywriter, Merch Advisor, витрины, 5 сидов, до 10 000 ассетов.',
    comments: '200 брендов × 35 000 ₽ = 7 млн ₽/мес.',
  },
  {
    flow: '4. Подписка Shop+ (ритейлеры / байеры)',
    mechanic: '14 000 ₽/мес',
    description: 'Ордер-листы, Data Insights, ERP-интеграции, RFM-анализ.',
    comments: '300 магазинов × 14 000 ₽ = 4,2 млн ₽/мес.',
  },
  {
    flow: '5. Подписка Creator+ (стилисты / креаторы)',
    mechanic: '4 900 ₽/мес',
    description: 'AI Stylist, Look Generator, 100 рендеров/мес.',
    comments: '1 000 пользователей = 4,9 млн ₽/мес.',
  },
  {
    flow: '6. Продвижение коллекций (B2C)',
    mechanic: '2 000–5 000 ₽ / кампания',
    description: 'Размещение в ленте, баннерах и подборках.',
    comments: '500 кампаний/мес × 3 000 ₽ = 1,5 млн ₽.',
  },
  {
    flow: '7. Продвижение B2B (Highlight)',
    mechanic: '10 000 ₽/нед',
    description: 'Приоритет в Market Room, рассылки байерам.',
    comments: '100 брендов × 10 000 ₽ = 1 млн ₽/мес.',
  },
  {
    flow: '8. AI-сервисы (Usage-based)',
    mechanic: 'от 1,5 ₽ / вызов API',
    description: 'Look Generator, Trend Engine, Merch Advisor, Copywriter.',
    comments: '1 млн вызовов/мес = 1,5 млн ₽.',
  },
  {
    flow: '9. Data Insights (B2B)',
    mechanic: '29 000–300 000 ₽',
    description: 'Отчёты по трендам и категориям, кастомная аналитика.',
    comments: '20 отчётов/мес = 2 млн ₽.',
  },
  {
    flow: '10. Digital Showrooms / VR-залы',
    mechanic: '50 000–150 000 ₽ / сезон',
    description: 'Аренда виртуальных павильонов брендами.',
    comments: '30 × 100 000 ₽ = 3 млн ₽/сезон.',
  },
  {
    flow: '11. NFT / Digital Twin паспорта',
    mechanic: '300–1 000 ₽ / вещь',
    description: 'Цифровой паспорт изделия с provenance и правами.',
    comments: '10 000 NFT = 3–10 млн ₽.',
  },
  {
    flow: '12. Комиссия с подписок и дропов',
    mechanic: '10–15%',
    description: 'Digital-дропы, платные капсулы, предметы.',
    comments: 'При 10 млн ₽/мес — 1,2 млн ₽ комиссии.',
  },
  {
    flow: '13. White-label решения',
    mechanic: '150 000–300 000 ₽ / лицензия',
    description: 'Собственная витрина бренда/ритейлера.',
    comments: '50 клиентов × 200 000 ₽ = 10 млн ₽/год.',
  },
  {
    flow: '14. Consulting / AI Fashion Lab',
    mechanic: '300 000–1,5 млн ₽ / проект',
    description: 'Индивидуальные исследования, кастомные AI-модели.',
    comments: '10 проектов/год = 5–10 млн ₽.',
  },
  {
    flow: '15. API Licensing (white-label)',
    mechanic: '20 000–200 000 ₽ / мес',
    description: 'Доступ к AI Stylist / Trend Engine по API.',
    comments: '20 клиентов × 100 000 ₽ = 2 млн ₽/мес.',
  },
];
const subscriptionTiersData = [
  {
    plan: 'Brand FREE',
    audience: 'начинающие бренды',
    price: '0 ₽',
    features: 'до 20 SKU, 1 коллекция',
  },
  {
    plan: 'Brand PRO',
    audience: 'активные бренды',
    price: '35 000 ₽',
    features: 'до 10 000 ассетов, 5 сидов, аналитика, AI Copywriter',
  },
  {
    plan: 'Brand ELITE',
    audience: 'крупные дома',
    price: '75 000 ₽',
    features: '30 000 ассетов, VR-зал, сниженные комиссии',
  },
  {
    plan: 'Shop BASIC',
    audience: 'бутики/байеры',
    price: '9 900 ₽',
    features: 'до 3 брендов, базовая аналитика',
  },
  {
    plan: 'Shop+',
    audience: 'сети/ритейлеры',
    price: '14 000 ₽',
    features: '10 брендов, white-label, ERP-интеграция',
  },
  {
    plan: 'Creator+',
    audience: 'стилисты/креаторы',
    price: '4 900 ₽',
    features: 'AI Stylist, Look Generator, 100 рендеров',
  },
];
const aiApiPricingData = [
  {
    service: 'AI Stylist / Look Generator',
    price: '1,5 ₽ / вызов',
    comments: 'подбор образа или капсулы',
  },
  { service: 'Trend API', price: '10 ₽ / запрос', comments: 'анализ трендов по категории' },
  { service: 'Copywriter', price: '30 ₽ / описание', comments: 'текст карточки товара' },
  { service: 'Visual Generator', price: '100 ₽ / рендер', comments: 'изображение до 1024×1024 px' },
  {
    service: 'Merch Advisor / Insights',
    price: '200 ₽ / SKU',
    comments: 'AI-анализ продаж и ассортимента',
  },
  { service: 'Forecasting', price: '300 ₽ / SKU', comments: 'прогноз спроса' },
  {
    service: 'AR-MAU пакет',
    price: 'от 9 900 ₽/мес',
    comments: 'до 100 000 активных пользователей',
  },
];
const transactionFeesData = [
  { type: 'B2C комиссия', details: '10–15% (мин. 99 ₽)', note: 'от категории товара' },
  { type: 'B2B комиссия', details: '2–5% (мин. 9 900 ₽)', note: 'от суммы ордера' },
  {
    type: 'Вывод средств (payout)',
    details: '0,5–1% (мин. 49 ₽)',
    note: 'покрытие платёжных расходов',
  },
  { type: 'Экспресс-выплата (T+1)', details: '+0,5%', note: 'опция, иначе стандарт T+7' },
  { type: 'Chargeback / арбитраж', details: '590 ₽ / кейс', note: 'с проигравшей стороны' },
  { type: 'Escrow сервис (B2B)', details: '0,5–1% сделки', note: 'защита обеих сторон' },
];
const dataInsightsData = [
  {
    Пакет: 'Insight Basic',
    Стоимость: '29 000 ₽/мес',
    Содержание: 'просмотры, вовлечённость, конверсии',
  },
  {
    Пакет: 'Insight Pro',
    Стоимость: '100 000–300 000 ₽',
    Содержание: 'отчёты по категориям, регионам, сегментам',
  },
  {
    Пакет: 'Custom Study',
    Стоимость: '500 000–2 000 000 ₽',
    Содержание: 'глубокий анализ трендов и прогнозов',
  },
  {
    Пакет: 'Data Co-op',
    Стоимость: '–30% скидка',
    Содержание: 'обмен обезличенными данными участников',
  },
];
const additionalStreamsData = [
  {
    item: 'VR-шоурумы / Digital павильоны',
    price: '50 000–150 000 ₽ / сезон',
    description: 'виртуальные залы, showroom в метавселенной',
  },
  {
    item: 'Промо / баннеры (аукцион)',
    price: 'CPM 120–240 ₽ / CPC 12–24 ₽',
    description: 'реклама в ленте и Market Room',
  },
  {
    item: 'Пакет “Премьера коллекции”',
    price: '49 000 ₽',
    description: 'Featured + рассылка + Live Room',
  },
  { item: 'Event-комиссии', price: '10–15%', description: 'Fashion Weeks, Capsule Show, pop-up' },
  {
    item: 'Академия SYNTHA',
    price: '9 900–29 000 ₽ / курс',
    description: 'курсы по AI и fashion-tech',
  },
  {
    item: 'Affiliate-программа',
    price: '10% комиссии',
    description: 'партнёрские реферальные выплаты',
  },
  {
    item: 'Сертификация “Syntha-ready”',
    price: '49 000 ₽',
    description: 'проверка ассетов и 3D-качества',
  },
  {
    item: 'Обучение / аккредитация',
    price: '19 000 ₽ / слот',
    description: 'обучение команд брендов',
  },
  {
    item: 'Премиум SLA / Support+',
    price: '+25–40% к тарифу',
    description: 'персональный менеджер и 99,9% аптайм',
  },
];
const annualForecastData = [
  { flow: 'Комиссии (B2C + B2B)', monthly: '≈ 8–10 млн ₽', annual: '≈ 110 млн ₽' },
  { flow: 'Подписки (Brand, Shop, Creator)', monthly: '≈ 18–20 млн ₽', annual: '≈ 220 млн ₽' },
  { flow: 'Продвижение / реклама', monthly: '≈ 3–4 млн ₽', annual: '≈ 45 млн ₽' },
  { flow: 'AI / API usage', monthly: '≈ 2,5–3,5 млн ₽', annual: '≈ 36 млн ₽' },
  { flow: 'Data Insights / аналитика', monthly: '≈ 2–3 млн ₽', annual: '≈ 30 млн ₽' },
  { flow: 'White-label / консалтинг / сертификация', monthly: '≈ 2–3 млн ₽', annual: '≈ 30 млн ₽' },
];
const financialIncentivesData = [
  { mechanism: 'Годовая предоплата', description: '–17% (2 мес бесплатно)' },
  { mechanism: 'Bundle PRO + Ads + Insights', description: '–20% при комплексной покупке' },
  { mechanism: 'Refer-a-Brand', description: '–30% на 1 мес за приведённого клиента' },
  { mechanism: 'Trial 30 дней', description: 'переход с FREE на PRO' },
  { mechanism: 'ELITE Loyalty', description: 'каждые 10 млн ₽ GMV → –1 п.п. комиссии' },
  { mechanism: 'Data Co-op скидка', description: '–30% за участие в обмене данными' },
];
const revenueStructureData = [
  { source: 'Комиссии + Подписки (Core Platform)', share: '≈70%' },
  { source: 'AI / Data / API (Intelligence Layer)', share: '≈20%' },
  { source: 'VR / NFT / Events / Академия', share: '≈10%' },
];
const scalingScenariosData = [
  {
    scenario: 'Base (2027)',
    drivers: '150 брендов, 300 байеров, 2 000 B2C продаж/мес',
    revenue: '~380 млн ₽',
  },
  {
    scenario: 'Pro (2028)',
    drivers: '300 брендов, 800 байеров, 5 000 продаж/мес',
    revenue: '~650 млн ₽',
  },
  {
    scenario: 'Enterprise (2029)',
    drivers: '500 брендов, 1 500 байеров, 10 000 продаж/мес + API',
    revenue: '~1 млрд ₽',
  },
];

const unitEconomicsData = [
  {
    Показатель: 'Средний доход / месяц (ARPU)',
    'Бренд (B2B)': '₽35 000',
    'Магазин (B2B)': '₽22 000',
    'Клиент (B2C)': '₽450',
    Комментарий: 'Подписки, транзакционные комиссии, аналитика',
  },
  {
    Показатель: 'CAC (стоимость привлечения)',
    'Бренд (B2B)': '₽12 000',
    'Магазин (B2B)': '₽9 000',
    'Клиент (B2C)': '₽350',
    Комментарий: 'Digital-реклама, B2B outreach, performance',
  },
  {
    Показатель: 'LTV (жизненный цикл клиента)',
    'Бренд (B2B)': '₽420 000',
    'Магазин (B2B)': '₽264 000',
    'Клиент (B2C)': '₽6 000',
    Комментарий: '12–18 мес. удержания',
  },
  {
    Показатель: 'Маржинальность сервиса',
    'Бренд (B2B)': '65%',
    'Магазин (B2B)': '70%',
    'Клиент (B2C)': '55%',
    Комментарий: 'После комиссий платёжных шлюзов и хранения',
  },
  {
    Показатель: 'Средняя комиссия с продаж (GMV Fee)',
    'Бренд (B2B)': '10–15%',
    'Магазин (B2B)': '3–5%',
    'Клиент (B2C)': '—',
    Комментарий: 'В зависимости от категории',
  },
  {
    Показатель: 'Подписка (PRO / Enterprise)',
    'Бренд (B2B)': '₽49 000 / ₽149 000',
    'Магазин (B2B)': '₽29 000 / ₽99 000',
    'Клиент (B2C)': '₽490 / ₽1 490',
    Комментарий: 'Месячная плата за премиум-функции',
  },
  {
    Показатель: 'Cost to Serve (инфра + AI)',
    'Бренд (B2B)': '₽6 500',
    'Магазин (B2B)': '₽4 200',
    'Клиент (B2C)': '₽70',
    Комментарий: 'Хостинг, Firestore, Genkit API usage',
  },
  {
    Показатель: 'Payback Period (окупаемость)',
    'Бренд (B2B)': '~3 мес.',
    'Магазин (B2B)': '~2,5 мес.',
    'Клиент (B2C)': '~1,5 мес.',
    Комментарий: 'При сохранении ARPU и текущих CAC',
  },
  {
    Показатель: 'Retention 6 мес.',
    'Бренд (B2B)': '82%',
    'Магазин (B2B)': '88%',
    'Клиент (B2C)': '63%',
    Комментарий: 'B2B сегменты удерживаются стабильнее',
  },
  {
    Показатель: 'Churn (отток)',
    'Бренд (B2B)': '18%',
    'Магазин (B2B)': '12%',
    'Клиент (B2C)': '37%',
    Комментарий: 'Снижается при внедрении лояльности и AI-стилиста',
  },
];
const growthScenariosData = [
  {
    Пакет: 'Base',
    'Для кого': 'Стартап-бренды, малые бутики',
    'Месячная подписка': '₽0 – ₽9 900',
    Включено: 'Размещение, базовая аналитика, каталог',
    'Ориентир MRR на 1 клиента': '₽9 900',
    'Growth-фактор': '1×',
  },
  {
    Пакет: 'Pro',
    'Для кого': 'Средние бренды / сети',
    'Месячная подписка': '₽49 000',
    Включено: 'Расширенная аналитика, AI-рекомендации, B2B-linesheets, стримы',
    'Ориентир MRR на 1 клиента': '₽49 000',
    'Growth-фактор': '2.8×',
  },
  {
    Пакет: 'Enterprise',
    'Для кого': 'Группы брендов, дистрибьюторы',
    'Месячная подписка': '₽149 000',
    Включено: 'SaaS-интеграции (ERP, CRM), white-label, API, ESG-модуль',
    'Ориентир MRR на 1 клиента': '₽149 000',
    'Growth-фактор': '5×',
  },
];
const revenueForecastData = [
  {
    Период: 'Год 1',
    'Активных брендов': 120,
    'Активных магазинов': 180,
    'Активных клиентов': 25000,
    'Средний MRR (₽)': 22000,
    'Прогноз выручки / мес (₽)': '≈ 14,5 млн',
    'LTV совокупный (₽)': '96 млн',
  },
  {
    Период: 'Год 2',
    'Активных брендов': 420,
    'Активных магазинов': 600,
    'Активных клиентов': 95000,
    'Средний MRR (₽)': 31000,
    'Прогноз выручки / мес (₽)': '≈ 51 млн',
    'LTV совокупный (₽)': '410 млн',
  },
  {
    Период: 'Год 3',
    'Активных брендов': 1200,
    'Активных магазинов': 1200,
    'Активных клиентов': 280000,
    'Средний MRR (₽)': 47000,
    'Прогноз выручки / мес (₽)': '≈ 141 млн',
    'LTV совокупный (₽)': '1,2 млрд',
  },
];
const financialScenariosData = [
  {
    Сценарий: 'Conservative',
    'ARPU (₽)': 25000,
    'Активные платные пользователи': 400,
    'MRR (₽/мес)': '10 000 000',
    'ARR (₽/год)': '120 000 000',
  },
  {
    Сценарий: 'Balanced (реалистичный)',
    'ARPU (₽)': 35000,
    'Активные платные пользователи': 800,
    'MRR (₽/мес)': '28 000 000',
    'ARR (₽/год)': '336 000 000',
  },
  {
    Сценарий: 'Aggressive (рост 3×)',
    'ARPU (₽)': 45000,
    'Активные платные пользователи': 1600,
    'MRR (₽/мес)': '72 000 000',
    'ARR (₽/год)': '864 000 000',
  },
];
const monetizationModelData = [
  {
    Раздел: 'Digital Fashion Lab',
    'Механика монетизации': 'Платные AI-рендеры, дизайн-ассистент',
    'Ориентир дохода': '₽10–15 млн/год',
    Формат: 'Usage-based',
  },
  {
    Раздел: 'Market Room (B2B)',
    'Механика монетизации': 'Подписки + комиссии с ордеров',
    'Ориентир дохода': '₽60–80 млн/год',
    Формат: 'SaaS + Transactional',
  },
  {
    Раздел: 'Client Space (B2C)',
    'Механика монетизации': 'Комиссия с продаж + Premium',
    'Ориентир дохода': '₽40–50 млн/год',
    Формат: 'Marketplace',
  },
  {
    Раздел: 'Analytics & Intelligence',
    'Механика монетизации': 'Продажа отчётов и API',
    'Ориентир дохода': '₽15–20 млн/год',
    Формат: 'Data-as-a-Service',
  },
  {
    Раздел: 'Media / Streams / AR',
    'Механика монетизации': 'Реклама, featured-витрины',
    'Ориентир дохода': '₽20–30 млн/год',
    Формат: 'AdTech',
  },
  {
    Раздел: 'Sustainability / ESG',
    'Механика монетизации': 'Eco-бонусы, offset-комиссии',
    'Ориентир дохода': '₽5–10 млн/год',
    Формат: 'Impact revenue',
  },
];
const kpiData = [
  { Показатель: 'CAC Payback', Значение: '2,5 месяца', Комментарий: 'высокая маржа B2B' },
  {
    Показатель: 'Gross Margin',
    Значение: '65%',
    Комментарий: 'при Firestore + AI Usage Optimization',
  },
  { Показатель: 'LTV:CAC Ratio', Значение: '8.5×', Комментарий: 'устойчивый рост' },
  {
    Показатель: 'Churn Rate (средн.)',
    Значение: '15%',
    Комментарий: 'снижается за счёт интеграций',
  },
  { Показатель: 'ROI на 3 год', Значение: '320%', Комментарий: 'после масштабирования' },
  {
    Показатель: 'Breakeven point',
    Значение: '14–16 месяцев',
    Комментарий: 'при достижении 300+ брендов',
  },
];

const aiCoreData = [
  {
    agent: 'AI Stylist',
    func: 'Персональные образы, подбор капсул, компаньоны к SKU, анализ гардероба клиента',
    tech: 'Embeddings (pgvector / Qdrant) + Genkit как промпт-оркестратор; taste-векторы в Firestore / PostgreSQL; inference через FastAPI / Uvicorn',
  },
  {
    agent: 'AI Trend Analyst',
    func: 'Анализ трендов, соцсетей и сезонных паттернов; nowcast интереса по категориям',
    tech: 'Событийный поток + парсеры (Instagram, Pinterest, Telegram, TikTok); агрегаты в BigQuery / DuckDB; модели в Vertex AI или локально (Python + sklearn)',
  },
  {
    agent: 'AI Merchandising Advisor',
    func: 'Оптимизация ассортимента, цен и спроса; прогноз margin / sell-through',
    tech: 'Фичи из витрин dbt / Parquet; ML-модели (LightGBM, Logistic Regression); бизнес-правила и эвристики по ценовым диапазонам',
  },
  {
    agent: 'AI Copywriter',
    func: 'Описания товаров, кампании, баннеры, e-mail-контент',
    tech: 'Gemini / GPT-4 через API-провайдеров; бренд-гайд + product facts в контексте; контроль длины, тона и языка',
  },
  {
    agent: 'AI Sustainability Scorer',
    func: 'Эко-оценка брендов и коллекций; расчёт углеродного следа и доли цифровых прототипов',
    tech: 'Python API к внутренним метрикам + ESG-базы партнёров (Sustainable Apparel Coalition, Fashion Transparency Index); собственные весовые формулы',
  },
  {
    agent: 'AI Visual Generator',
    func: 'Генерация fashion-луков, рекламных визуалов и lookbook-сцен',
    tech: 'Stable Diffusion / Runway / Replicate через очереди (Celery / Redis); контроль seed / prompt; пост-обработка в Pillow / FFmpeg',
  },
  {
    agent: 'AI Concierge',
    func: 'Диалоговый ассистент клиента: подбор образов, Q&A, навигация по витрине',
    tech: 'Gemini / Dialogflow CX или RAG на FastAPI + embeddings; taste-персонализация и history-контекст',
  },
  {
    agent: 'AI Fraud Monitor',
    func: 'Поведенческая биометрия, защита аккаунтов, антифрод-скоринг',
    tech: 'Логи событий → Vertex anomaly detection или PyOD / IsolationForest; правила блокировок / алертов',
  },
  {
    agent: 'AI Demand Forecaster',
    func: 'Прогноз спроса и sell-through по SKU / категории / региону',
    tech: 'Временные ряды (Prophet, LightGBM, XGBoost), тренды продаж, маркетинговые события; обучается на истории B2B и B2C',
  },
  {
    agent: 'AI Creative Director',
    func: 'Автоматическая генерация концепций кампаний, moodboard’ов, сценографии',
    tech: 'Genkit + GPT-4 + SDXL; анализ бренд-ДНК, цветовых палитр и исторических кампаний; предлагает стили и визуальные концепты',
  },
];

const architectureData = [
  {
    level: 'AI & Data Layer',
    modules:
      'AI Stylist, Trend Engine, Merchandising Advisor, Visual Generator, Sustainability Scorer, AI Demand Forecast, Price Optimizer, Sentiment Parser',
    functionality:
      'Подбор образов и капсул, краткосрочные тренд-сигналы, рекомендации по ассортименту и ценообразованию, генерация контента, анализ тональности отзывов, ESG/eco scoring.',
  },
  {
    level: 'Business Layer',
    modules:
      'Brand Console, Shop Console, B2B Hub, Linesheet Builder, Contract Manager, Payments & Invoicing, Tax/VAT Handler',
    functionality:
      'Управление коллекциями, Digital Showroom, ордер-листы, коммерческие условия, e-contracts, генерация счетов, учёт НДС/долей платформы, интеграция с ERP.',
  },
  {
    level: 'Experience Layer (B2C UX)',
    modules:
      'Client App, AR Viewer, Virtual Rail, Live Room, Video Shopping, Smart Calendar, Wishlist & Closet, Smart Checkout, Syntha Pay (BNPL)',
    functionality:
      'Покупка, предзаказ, AR-примерка, рейл коллекций, стримы, AI-гардероб, бонусная система, отложенные платежи, покупка “одним свайпом”.',
  },
  {
    level: 'Community Layer (Social & Creators)',
    modules:
      'Looks Feed, Moodboards, Challenges, Subscriptions, Influencer Hub, Collaboration Space, UGC Moderation',
    functionality:
      'Публикации образов, мудборды, AI-подсказки, челленджи, подписки на бренды/амбассадоров, геймификация, коллаборации брендов и клиентов.',
  },
  {
    level: 'Operational Layer (Admin & Ops)',
    modules:
      'Admin Console, Security Hub, Monitoring & SLA, Audit Log, Compliance Center (GDPR, 152-ФЗ)',
    functionality:
      'Управление ролями (RBAC/ABAC), модерация контента, антифрод, аудит, SLA-мониторинг, резервное копирование, соответствие законам.',
  },
  {
    level: 'Revenue Layer (Monetization)',
    modules: 'Subscriptions, Commissions, Data Insights, Media Placements, API Access, Ad Manager',
    functionality:
      'Подписки брендов/магазинов, комиссии, продажа аналитики, платные витрины, API-доступ, спонсорские интеграции.',
  },
  {
    level: 'API & Integration Layer',
    modules: 'SDKs, GraphQL / REST, Webhooks, Integration Bus, Partner Portal',
    functionality:
      'Интеграции ERP/CRM (1С, SAP, Odoo), логистики, платёжных шлюзов, видео/CDN, AI-провайдеров; внешние партнёрские подключения.',
  },
  {
    level: 'Intelligence Layer',
    modules: 'Analytics Engine, ML Pipelines, BigQuery / Vertex AI / Looker',
    functionality:
      'Централизованный анализ данных, тренды продаж и поведения, машинное обучение, прогнозирование спроса, визуальные дашборды.',
  },
  {
    level: 'Core Infrastructure & Trust Layer',
    modules:
      'Auth / Roles, Storage / CDN, Firestore / Cloud Run / Genkit, Audit Ledger (blockchain / append-only)',
    functionality:
      'Аутентификация, хранение, безопасность, масштабируемость, контроль доступа, журнал действий, стабильность и отказоустойчивость.',
  },
];

const navLinks = [
  { value: 'overview', label: 'О проекте', icon: Globe },
  { value: 'analysis', label: 'Конкурентный анализ', icon: BarChart2 },
  { value: 'monetization', label: 'Монетизация', icon: DollarSign },
  { value: 'finance', label: 'Финансовый модуль', icon: CircleDollarSign },
  { value: 'roadmap', label: 'Дорожная карта', icon: GitBranch },
  { value: 'cost', label: 'Стоимость разработки', icon: CircleDollarSign },
  { value: 'security', label: 'Безопасность', icon: Shield },
  { value: 'phygital', label: 'Phygital', icon: Sparkles },
  { value: 'growth', label: 'Growth & Loyalty', icon: TrendingUp },
];

const roadmapData = [
  {
    title: 'Этап 1: MVP (3-4 месяца)',
    description: 'Запуск базовой B2B2C-платформы для проверки ключевых гипотез.',
    features: [
      'Digital Fashion Laboratory для брендов (3D, AI-рендеры)',
      'Market Room (B2B) с лайншитами и матрицей заказа',
      'B2C-витрина с каталогом, карточкой товара (3D) и чекаутом',
      'Базовые профили для всех ролей (бренд, магазин, клиент)',
      'Ядро AI для генерации контента и простых рекомендаций',
    ],
  },
  {
    title: 'Этап 2: Pro-версия (4-6 месяцев)',
    description: 'Расширение функционала для коммерциализации и повышения вовлеченности.',
    features: [
      'Запуск подписок Brand PRO и Shop+ с расширенной аналитикой',
      'Внедрение AI-инструментов: Merchandising Advisor, Trend Forecaster',
      'AR-примерка для клиентов',
      'Социальный функционал: лукбуки, лайки, подписки',
      'Инструменты для Live Shopping и ведения блога',
    ],
  },
  {
    title: 'Этап 3: Enterprise & Ecosystem (6-8 месяцев)',
    description: 'Масштабирование до индустриального стандарта.',
    features: [
      'API для интеграций с ERP/CRM',
      'White-label решения для брендов и ритейлеров',
      'Phygital-интеграции (NFT, "умные" зеркала)',
      'Развитый ESG-модуль с отчетностью',
      'Система геймификации и программа лояльности',
    ],
  },
];

export default function ProjectInfoPage() {
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isMarketRoomOpen, setIsMarketRoomOpen] = useState(false);
  const [isCommunitySpaceOpen, setIsCommunitySpaceOpen] = useState(false);
  const [isIntelligenceLayerOpen, setIsIntelligenceLayerOpen] = useState(false);
  const [isCoreInfraOpen, setIsCoreInfraOpen] = useState(false);
  const [isB2bB2cOpen, setIsB2bB2cOpen] = useState(false);
  const [isPhygitalOpen, setIsPhygitalOpen] = useState(false);
  const [isAiPersonalizationOpen, setIsAiPersonalizationOpen] = useState(false);
  const [isEsgOpen, setIsEsgOpen] = useState(false);
  const [isApiLayerOpen, setIsApiLayerOpen] = useState(false);
  const [isPremiumUxOpen, setIsPremiumUxOpen] = useState(false);
  const [isGrowthPlatformOpen, setIsGrowthPlatformOpen] = useState(false);
  const [isCycleIntegrationOpen, setIsCycleIntegrationOpen] = useState(false);
  const [isAiInfraOpen, setIsAiInfraOpen] = useState(false);
  const [isFinancialSustainabilityOpen, setIsFinancialSustainabilityOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-sm font-bold md:text-sm">О проекте</h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm text-muted-foreground">
          Здесь собрана вся подробная информация, документация и технические детали о проекте
          Syntha.
        </p>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        {/* cabinetSurface v1 */}
        <TabsList
          className={cn(
            cabinetSurface.tabsList,
            'grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-9'
          )}
        >
          {navLinks.map((link) => (
            <TabsTrigger
              key={link.value}
              value={link.value}
              className={cn(
                cabinetSurface.tabsTrigger,
                'text-xs font-semibold normal-case tracking-normal'
              )}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lightbulb className="h-6 w-6 text-accent" />
                  Концепция
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Syntha — это B2B2C-платформа, которая объединяет бренды, ритейлеров и покупателей
                  в единую интеллектуальную экосистему. Мы помогаем брендам создавать и продавать
                  цифровые и физические коллекции, ритейлерам — эффективно закупать и управлять
                  ассортиментом, а клиентам — получать персонализированный и технологичный опыт
                  шопинга.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-accent" /> О проекте
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Syntha — это цифровая лаборатория моды и маркетплейс нового поколения. Платформа
                  объединяет бренды, дизайнеров, байеров, магазины и конечных клиентов в единую
                  экосистему, управляемую искусственным интеллектом. Вместо классической витрины,
                  каждая коллекция на Syntha — это «живой» организм: она создаётся, презентуется,
                  продаётся и анализируется в одном месте, а пользователи получают
                  персонализированный, интерактивный опыт.
                </p>
                <p className="font-semibold text-foreground">
                  Миссия Syntha — сделать моду умной, устойчивой и персонализированной. Это не
                  просто маркетплейс — это платформа данных, контента и взаимодействий, где AI,
                  phygital и аналитика соединены в единую материю.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  🧬 Syntha — расшифровка и смысл имени
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold">🔹 Этимология</h4>
                  <p className="mt-1 text-muted-foreground">
                    Название Syntha происходит от корня synthesis — «синтез», «соединение»,
                    «создание целого из частей».
                  </p>
                  <p className="text-muted-foreground">
                    В основе — идея собрать разрозненную индустрию моды в единую систему данных,
                    креатива и взаимодействий.
                  </p>
                  <p className="mt-2">
                    <span className="font-bold">Syntha</span> = Synthesis of Intelligence, Fashion &
                    Data. (Синтез интеллекта, моды и данных.)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">🔹 Концептуальная расшифровка</h4>
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Буква</TableHead>
                        <TableHead>Смысл</TableHead>
                        <TableHead>Комментарий</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>S</TableCell>
                        <TableCell>System — система, структура</TableCell>
                        <TableCell className="text-muted-foreground">
                          Syntha выстраивает порядок из хаоса модных данных.
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Y</TableCell>
                        <TableCell>You — человек, создатель</TableCell>
                        <TableCell className="text-muted-foreground">
                          Центр системы — не алгоритм, а человек.
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>N</TableCell>
                        <TableCell>Network — сеть взаимодействий</TableCell>
                        <TableCell className="text-muted-foreground">
                          Объединяет дизайнеров, бренды, байеров и клиентов.
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>T</TableCell>
                        <TableCell>Technology / Transparency</TableCell>
                        <TableCell className="text-muted-foreground">
                          Технология и прозрачность — основа доверия к данным.
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>H</TableCell>
                        <TableCell>Humanity / Harmony</TableCell>
                        <TableCell className="text-muted-foreground">
                          Сохраняет вкус, чувство и баланс между креативом и машиной.
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>A</TableCell>
                        <TableCell>AI & Artistry — интеллект и творчество</TableCell>
                        <TableCell className="text-muted-foreground">
                          Искусственный интеллект усиливает искусство, а не заменяет его.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <p className="mt-2 font-semibold">
                    💡 SYNTHA = System + You + Network + Technology + Humanity + AI.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">🔹 Философская формула</h4>
                  <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">
                    Syntha — это синтез креатива и интеллекта.
                    <br />
                    Она соединяет искусство, науку и рынок в едином цифровом ритме —<br />
                    где данные становятся вдохновением, а вдохновение превращается в управляемый
                    процесс.
                  </blockquote>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-accent" /> Концепция: пять измерений Syntha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <button
                      onClick={() => setIsLabOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Digital Fashion Laboratory
                    </button>{' '}
                    — пространство для брендов и дизайнеров: 3D-конструктор коллекций, AI-рендеры,
                    digital-lookbooks, совместные капсулы.
                  </li>
                  <li>
                    <button
                      onClick={() => setIsMarketRoomOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Market Room
                    </button>{' '}
                    — B2B-площадка нового поколения для закупок, линий, ордер-листов, контрактов,
                    аналитики и livestream-закупок.
                  </li>
                  <li>
                    <button
                      onClick={() => setIsCommunitySpaceOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Client & Community Space
                    </button>{' '}
                    — омниканальное приложение для клиентов, где доступны персональные ленты,
                    AI-стилист, AR-примерка, бонусная экономика и social-луки.
                  </li>
                  <li>
                    <button
                      onClick={() => setIsIntelligenceLayerOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Intelligence & Analytics Layer
                    </button>{' '}
                    — интеллектуальный слой, объединяющий данные брендов, магазинов и клиентов,
                    превращая их в прогнозы, инсайты и автоматические решения на базе AI.
                  </li>
                  <li>
                    <button
                      onClick={() => setIsCoreInfraOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Core Infrastructure & Trust Layer
                    </button>{' '}
                    — технологический и этический фундамент Syntha, обеспечивающий безопасность,
                    масштабируемость и доверие между всеми участниками экосистемы.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <GitBranch className="h-6 w-6 text-accent" /> Архитектура платформы Syntha
                </CardTitle>
                <CardDescription>Полная, расширенная архитектура Syntha</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Уровень</TableHead>
                      <TableHead>Модули / Компоненты</TableHead>
                      <TableHead>Функциональность / Примечание</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {architectureData.map((row) => (
                      <TableRow key={row.level}>
                        <TableCell className="font-medium">{row.level}</TableCell>
                        <TableCell>{row.modules}</TableCell>
                        <TableCell className="text-muted-foreground">{row.functionality}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-accent" /> AI-ядро платформы SYNTHA
                </CardTitle>
                <CardDescription>финальная структура</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Агент</TableHead>
                      <TableHead>Функция</TableHead>
                      <TableHead>Используемые технологии (реалистично)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiCoreData.map((agent) => (
                      <TableRow key={agent.agent}>
                        <TableCell className="font-medium">{agent.agent}</TableCell>
                        <TableCell className="text-muted-foreground">{agent.func}</TableCell>
                        <TableCell className="text-muted-foreground">{agent.tech}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Info className="h-6 w-6 text-accent" /> Уникальные преимущества Syntha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                  <li>
                    <button
                      onClick={() => setIsB2bB2cOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Полное слияние B2B и B2C в одной системе.
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsPhygitalOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Phygital-взаимодействие между коллекциями, контентом и продажами.
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsAiPersonalizationOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      AI-персонализация для всех уровней: бренды, магазины, покупатели.
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsEsgOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      ESG-экосистема и реальные метрики устойчивости.
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsApiLayerOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Универсальный API-слой и SDK для партнёров.
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsPremiumUxOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Премиальный UX / UI и эстетика digital luxury fashion.
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsGrowthPlatformOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Платформа роста — от стартапа до индустриального стандарта.
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsCycleIntegrationOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Интеграция всего модного цикла: Create → Present → Sell → Analyze
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsAiInfraOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Собственная AI-инфраструктура и explainable-интеллект
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsFinancialSustainabilityOpen(true)}
                      className="text-left font-semibold text-foreground hover:underline"
                    >
                      Финансовая и стратегическая устойчивость
                    </button>
                  </li>
                </ol>
              </CardContent>
            </Card>
            <KeyIdeaCard />
          </div>
        </TabsContent>
        <TabsContent value="analysis" className="mt-6">
          <CompetitiveAnalysis />
        </TabsContent>
        <TabsContent value="monetization" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-accent" /> Монетизация платформы SYNTHA
              </CardTitle>
              <CardDescription className="pt-2 text-base text-muted-foreground">
                Syntha объединяет четыре уровня дохода, создавая сбалансированную бизнес-модель:
              </CardDescription>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                <li>
                  <b>Платформа (B2C/B2B):</b> комиссии и подписки
                </li>
                <li>
                  <b>AI & API:</b> платные генерации, аналитика, персонализация
                </li>
                <li>
                  <b>Контент и продвижение:</b> реклама, дропы, VR-витрины
                </li>
                <li>
                  <b>Data & Enterprise:</b> отчёты, white-label, консалтинг
                </li>
              </ul>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🧭 I. Основные источники дохода</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[220px]">Поток</TableHead>
                        <TableHead className="min-w-[150px]">Механика</TableHead>
                        <TableHead className="min-w-[300px]">Описание и диапазон цен (₽)</TableHead>
                        <TableHead className="min-w-[300px]">Комментарии и потенциал</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monetizationData.map((row) => (
                        <TableRow key={row.flow}>
                          <TableCell className="font-medium">{row.flow}</TableCell>
                          <TableCell>{row.mechanic}</TableCell>
                          <TableCell>{row.description}</TableCell>
                          <TableCell className="text-muted-foreground">{row.comments}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">💵 II. Подписки (ежемесячно, ₽)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>План</TableHead>
                        <TableHead>Для кого</TableHead>
                        <TableHead>Стоимость</TableHead>
                        <TableHead>Лимиты и преимущества</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptionTiersData.map((row) => (
                        <TableRow key={row.plan}>
                          <TableCell className="font-medium">{row.plan}</TableCell>
                          <TableCell>{row.audience}</TableCell>
                          <TableCell>{row.price}</TableCell>
                          <TableCell className="text-muted-foreground">{row.features}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Дополнительно:</p>
                    <ul className="mt-1 list-disc pl-5">
                      <li>Доп. сид: +990 ₽/мес</li>
                      <li>Доп. live-ивент: +4 900 ₽</li>
                      <li>Хранение &gt;10 TB: +1 900 ₽/TB</li>
                      <li>Годовая оплата = –17% (2 мес бесплатно)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">⚙️ III. AI & API тарификация</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Сервис</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Комментарий</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiApiPricingData.map((row) => (
                        <TableRow key={row.service}>
                          <TableCell className="font-medium">{row.service}</TableCell>
                          <TableCell>{row.price}</TableCell>
                          <TableCell className="text-muted-foreground">{row.comments}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📈 IV. Комиссии и транзакции</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Тип</TableHead>
                        <TableHead>Ставка / условие</TableHead>
                        <TableHead>Примечание</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionFeesData.map((row) => (
                        <TableRow key={row.type}>
                          <TableCell className="font-medium">{row.type}</TableCell>
                          <TableCell>{row.details}</TableCell>
                          <TableCell className="text-muted-foreground">{row.note}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📊 V. Data Insights & Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Пакет</TableHead>
                        <TableHead>Стоимость</TableHead>
                        <TableHead>Содержание</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataInsightsData.map((row) => (
                        <TableRow key={row.Пакет}>
                          <TableCell className="font-medium">{row.Пакет}</TableCell>
                          <TableCell>{row.Стоимость}</TableCell>
                          <TableCell className="text-muted-foreground">{row.Содержание}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🧩 VI. Дополнительные источники</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Источник</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Описание</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {additionalStreamsData.map((row) => (
                        <TableRow key={row.item}>
                          <TableCell className="font-medium">{row.item}</TableCell>
                          <TableCell>{row.price}</TableCell>
                          <TableCell className="text-muted-foreground">{row.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    📅 VII. Финансовый прогноз (реалистичный mix)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Поток</TableHead>
                        <TableHead>Месячный доход</TableHead>
                        <TableHead>Годовой прогноз (₽)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {annualForecastData.map((row) => (
                        <TableRow key={row.flow}>
                          <TableCell className="font-medium">{row.flow}</TableCell>
                          <TableCell>{row.monthly}</TableCell>
                          <TableCell>{row.annual}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm font-semibold">💡 Итоговая выручка:</p>
                    <p className="text-base font-bold">
                      👉 ~36–43 млн ₽ / мес → ≈ 430–520 млн ₽ / год (≈ $4,5–5,5 млн)
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      (без учёта VR/NFT/event-партнёрств и Академии).
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🧱 VIII. Финансовые стимулы и апсейлы</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Механизм</TableHead>
                        <TableHead>Описание</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialIncentivesData.map((row) => (
                        <TableRow key={row.mechanism}>
                          <TableCell className="font-medium">{row.mechanism}</TableCell>
                          <TableCell className="text-muted-foreground">{row.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">💎 IX. Итоговая структура выручки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {revenueStructureData.map((row) => (
                      <li key={row.source} className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{row.source}</span>
                        <span className="text-muted-foreground">{row.share}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🚀 X. Потенциал масштабирования</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Сценарий</TableHead>
                        <TableHead>Ключевые драйверы роста</TableHead>
                        <TableHead>Выручка (год)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scalingScenariosData.map((row) => (
                        <TableRow key={row.scenario}>
                          <TableCell className="font-medium">{row.scenario}</TableCell>
                          <TableCell className="text-muted-foreground">{row.drivers}</TableCell>
                          <TableCell>{row.revenue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="finance" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CircleDollarSign className="h-6 w-6 text-accent" />
                  Финансовый модуль SYNTHA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    1. Таблица юнит-экономики (на 1 бренд / магазин / клиента)
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Показатель</TableHead>
                        <TableHead>Бренд (B2B)</TableHead>
                        <TableHead>Магазин (B2B)</TableHead>
                        <TableHead>Клиент (B2C)</TableHead>
                        <TableHead>Комментарий</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unitEconomicsData.map((row) => (
                        <TableRow key={row.Показатель}>
                          <TableCell className="font-medium">{row.Показатель}</TableCell>
                          <TableCell>{row['Бренд (B2B)']}</TableCell>
                          <TableCell>{row['Магазин (B2B)']}</TableCell>
                          <TableCell>{row['Клиент (B2C)']}</TableCell>
                          <TableCell className="text-muted-foreground">{row.Комментарий}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    2. Сценарии роста и тарифные модели
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Пакет</TableHead>
                        <TableHead>Для кого</TableHead>
                        <TableHead>Месячная подписка</TableHead>
                        <TableHead>Включено</TableHead>
                        <TableHead>Ориентир MRR на 1 клиента</TableHead>
                        <TableHead>Growth-фактор</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {growthScenariosData.map((row) => (
                        <TableRow key={row.Пакет}>
                          <TableCell className="font-medium">{row.Пакет}</TableCell>
                          <TableCell>{row['Для кого']}</TableCell>
                          <TableCell>{row['Месячная подписка']}</TableCell>
                          <TableCell>{row.Включено}</TableCell>
                          <TableCell>{row['Ориентир MRR на 1 клиента']}</TableCell>
                          <TableCell>{row['Growth-фактор']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      Дополнительные источники выручки:
                    </p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>Комиссии с B2C-продаж (10–15%).</li>
                      <li>Платные AI-сервисы (рендеры, отчёты, персонализация).</li>
                      <li>Data Insights (продажа агрегированных данных брендам).</li>
                      <li>Рекламные размещения / featured витрины.</li>
                      <li>White-label лицензии платформы (SaaS / SDK).</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    3. Прогноз MRR / LTV / Gross Revenue (3-летний сценарий)
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Период</TableHead>
                        <TableHead>Активных брендов</TableHead>
                        <TableHead>Активных магазинов</TableHead>
                        <TableHead>Активных клиентов</TableHead>
                        <TableHead>Средний MRR (₽)</TableHead>
                        <TableHead>Прогноз выручки / мес (₽)</TableHead>
                        <TableHead>LTV совокупный (₽)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueForecastData.map((row) => (
                        <TableRow key={row.Период}>
                          <TableCell className="font-medium">{row.Период}</TableCell>
                          <TableCell>{row['Активных брендов']}</TableCell>
                          <TableCell>{row['Активных магазинов']}</TableCell>
                          <TableCell>{row['Активных клиентов']}</TableCell>
                          <TableCell>{row['Средний MRR (₽)']}</TableCell>
                          <TableCell>{row['Прогноз выручки / мес (₽)']}</TableCell>
                          <TableCell>{row['LTV совокупный (₽)']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">💹 Итоговая динамика:</p>
                    <ul className="mt-2 list-disc pl-5">
                      <li>
                        <b>CAGR (средний рост) MRR</b> — ≈ 160% / год
                      </li>
                      <li>
                        <b>Gross Margin</b> — 62–68%, при масштабировании AI и Firestore.
                      </li>
                      <li>
                        <b>LTV:CAC</b> — от 7× (B2B) до 17× (B2C).
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">4. Финансовые сценарии (упрощённо)</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Сценарий</TableHead>
                        <TableHead>ARPU (₽)</TableHead>
                        <TableHead>Активные платные пользователи</TableHead>
                        <TableHead>MRR (₽/мес)</TableHead>
                        <TableHead>ARR (₽/год)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialScenariosData.map((row) => (
                        <TableRow key={row.Сценарий}>
                          <TableCell className="font-medium">{row.Сценарий}</TableCell>
                          <TableCell>{row['ARPU (₽)']}</TableCell>
                          <TableCell>{row['Активные платные пользователи']}</TableCell>
                          <TableCell>{row['MRR (₽/мес)']}</TableCell>
                          <TableCell>{row['ARR (₽/год)']}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    5. Финансовая модель монетизации (разделы платформы)
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Раздел</TableHead>
                        <TableHead>Механика монетизации</TableHead>
                        <TableHead>Ориентир дохода</TableHead>
                        <TableHead>Формат</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monetizationModelData.map((row) => (
                        <TableRow key={row.Раздел}>
                          <TableCell className="font-medium">{row.Раздел}</TableCell>
                          <TableCell>{row['Механика монетизации']}</TableCell>
                          <TableCell>{row['Ориентир дохода']}</TableCell>
                          <TableCell>{row.Формат}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">6. Ключевые финансовые KPI</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Показатель</TableHead>
                        <TableHead>Значение</TableHead>
                        <TableHead>Комментарий</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpiData.map((row) => (
                        <TableRow key={row.Показатель}>
                          <TableCell className="font-medium">{row.Показатель}</TableCell>
                          <TableCell>{row.Значение}</TableCell>
                          <TableCell className="text-muted-foreground">{row.Комментарий}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="roadmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <GitBranch className="h-6 w-6 text-accent" /> Дорожная карта
              </CardTitle>
              <CardDescription>
                Пошаговая стратегия развития платформы Syntha, от MVP до полномасштабной экосистемы.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {roadmapData.map((stage, index) => (
                  <Card key={index} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-base">{stage.title}</CardTitle>
                      <CardDescription>{stage.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                        {stage.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2">
                            <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cost" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CircleDollarSign className="h-6 w-6 text-accent" /> Стоимость разработки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Раздел в разработке.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-accent" /> Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Раздел в разработке.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="phygital" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-accent" /> Phygital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Раздел в разработке.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="growth" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-accent" /> Growth & Loyalty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Раздел в разработке.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <DigitalFashionLabDialog isOpen={isLabOpen} onOpenChange={setIsLabOpen} />
      <MarketRoomDialog isOpen={isMarketRoomOpen} onOpenChange={setIsMarketRoomOpen} />
      <ClientCommunitySpaceDialog
        isOpen={isCommunitySpaceOpen}
        onOpenChange={setIsCommunitySpaceOpen}
      />
      <IntelligenceAnalyticsLayerDialog
        isOpen={isIntelligenceLayerOpen}
        onOpenChange={setIsIntelligenceLayerOpen}
      />
      <CoreInfraTrustLayerDialog isOpen={isCoreInfraOpen} onOpenChange={setIsCoreInfraOpen} />
      <B2bB2cDialog isOpen={isB2bB2cOpen} onOpenChange={setIsB2bB2cOpen} />
      <PhygitalDialog isOpen={isPhygitalOpen} onOpenChange={setIsPhygitalOpen} />
      <AiPersonalizationDialog
        isOpen={isAiPersonalizationOpen}
        onOpenChange={setIsAiPersonalizationOpen}
      />
      <EsgEcosystemDialog isOpen={isEsgOpen} onOpenChange={setIsEsgOpen} />
      <ApiLayerDialog isOpen={isApiLayerOpen} onOpenChange={setIsApiLayerOpen} />
      <PremiumUxDialog isOpen={isPremiumUxOpen} onOpenChange={setIsPremiumUxOpen} />
      <GrowthPlatformDialog isOpen={isGrowthPlatformOpen} onOpenChange={setIsGrowthPlatformOpen} />
      <CycleIntegrationDialog
        isOpen={isCycleIntegrationOpen}
        onOpenChange={setIsCycleIntegrationOpen}
      />
      <AiInfraDialog isOpen={isAiInfraOpen} onOpenChange={setIsAiInfraOpen} />
      <FinancialSustainabilityDialog
        isOpen={isFinancialSustainabilityOpen}
        onOpenChange={setIsFinancialSustainabilityOpen}
      />
    </div>
  );
}
