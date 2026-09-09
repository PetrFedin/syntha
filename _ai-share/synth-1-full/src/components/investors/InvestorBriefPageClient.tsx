'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Factory,
  FileCheck2,
  GitBranch,
  Layers3,
  Link2,
  MessageSquareText,
  PackageCheck,
  PanelsTopLeft,
  QrCode,
  ScanSearch,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  resolveCanonicalInvestorUrl,
  resolveInvestorContactUrl,
} from '@/lib/investors/investor-brief-route';

const roles: Array<{ icon: LucideIcon; name: string; role: string; text: string }> = [
  {
    icon: Shirt,
    name: 'Brand',
    role: 'Бренд',
    text: 'Разработка коллекции, образцы, коммерческая готовность, заказ и контроль исполнения.',
  },
  {
    icon: Store,
    name: 'Shop',
    role: 'Магазин / байер',
    text: 'Ассортимент, B2B-выбор, матрица, checkout, заказ и прозрачный статус исполнения.',
  },
  {
    icon: Factory,
    name: 'Manufacturer',
    role: 'Производитель',
    text: 'Производственный заказ, готовность мощностей, качество, выпуск и передача следующему участнику.',
  },
  {
    icon: PackageCheck,
    name: 'Supplier',
    role: 'Поставщик',
    text: 'Материалы, RFQ, подтверждение поставки, сроки и связанная коммуникация по заказу.',
  },
];

const pillars = [
  ['01', 'Development', 'Разработка', 'Артикул, данные продукта, BOM/costing и подготовка к следующему gate.'],
  ['02', 'Sample collection', 'Образцы', 'Sample order, измерения, QC/AQL, документы и решение о готовности.'],
  ['03', 'Collection order', 'Заказ коллекции', 'Матрица, B2B checkout, registry, коммерческие условия и подтверждение.'],
  ['04', 'Order production', 'Производство заказа', 'PO, capacity, материалы, производство, shipment и контроль исключений.'],
  ['05', 'Comms', 'Коммуникации', 'Контекстные сообщения, календарь, документы, события, SLA и эскалации.'],
] as const;

const goldenPath: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Shirt, title: 'Артикул', text: 'Единая карточка продукта и контекст разработки.' },
  { icon: Layers3, title: 'Коллекция', text: 'Ассортимент объединяется в управляемый сезонный контур.' },
  { icon: ShoppingBag, title: 'Заказ', text: 'Матрица и коммерческое решение превращаются в заказ.' },
  { icon: Factory, title: 'Производство', text: 'PO, capacity, статус выполнения и контроль качества.' },
  { icon: Boxes, title: 'Поставщик', text: 'Материалы, sourcing/RFQ и обязательства поставщика.' },
  { icon: Truck, title: 'Отгрузка', text: 'Shipment и передача факта следующему участнику цепочки.' },
  { icon: FileCheck2, title: 'Закрытие', text: 'Документы, события и финальный статус сохраняют историю.' },
];

const operationalLayer: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: CircleDollarSign,
    title: 'BOM & Costing',
    text: 'Спецификация материалов и стоимостной контекст на уровне артикула.',
  },
  {
    icon: ScanSearch,
    title: 'RFQ / Sourcing',
    text: 'Запрос условий и связанный read layer по поставщикам и материалам.',
  },
  {
    icon: ClipboardCheck,
    title: 'QC / AQL',
    text: 'Контроль качества и дефекты остаются частью product/order lineage.',
  },
  {
    icon: FileCheck2,
    title: 'Documents',
    text: 'Документы доступны в контексте артикула, handoff и заказа.',
  },
  {
    icon: BadgeCheck,
    title: 'DPP',
    text: 'Контур Digital Product Passport подключён как отдельный gateway/read layer.',
  },
  {
    icon: Building2,
    title: 'Capacity',
    text: 'Производственная доступность связывается с заказом и площадкой.',
  },
  {
    icon: Truck,
    title: 'Shipment',
    text: 'Отгрузка не теряется после handoff и остаётся частью сквозной цепочки.',
  },
  {
    icon: MessageSquareText,
    title: 'Entity Comms',
    text: 'Коммуникация привязывается к артикулу или заказу, а не живёт отдельно от процесса.',
  },
  {
    icon: ShieldCheck,
    title: 'Exception / SLA',
    text: 'Исключения и просрочки формируют отдельный управляемый контур.',
  },
];

const architecture = [
  ['Experience', 'Next.js 15 / App Router', 'Публичные поверхности, кабинеты ролей и Platform Core hub.'],
  ['API & BFF', 'FastAPI + Next BFF', 'REST endpoints, Pydantic contracts, сервисный слой и интеграционные границы.'],
  ['Domain', 'Services + repositories', 'Showroom, wholesale, orders, production, rule engine и tenant-aware repositories.'],
  ['Data', 'PostgreSQL + Redis', 'Persistent state, cache/queues и фильтрация по organization_id.'],
  ['Trust', 'JWT + RBAC', 'Ролевой доступ, permission checks, rate limits и стандартные ответы API.'],
  ['AI layer', 'LLM + CLIP/FAISS + agents', 'LLM routing, visual similarity, агенты и feedback loop как платформенные возможности.'],
] as const;

const investmentLogic: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: GitBranch,
    title: 'Связанный операционный граф',
    text: 'Артикул, коллекция, заказ, производство, поставка, документы и коммуникации существуют как одна цепочка, а не как независимые приложения.',
  },
  {
    icon: Users,
    title: 'Один процесс для четырёх сторон',
    text: 'Brand, Shop, Manufacturer и Supplier работают с разными представлениями одного контекста и передают факт следующей роли.',
  },
  {
    icon: BrainCircuit,
    title: 'AI поверх структурированного контекста',
    text: 'Платформенный AI получает основу из доменных данных, визуального поиска и истории процессов, а не заменяет источник истины.',
  },
  {
    icon: Link2,
    title: 'Расширяемая интеграционная граница',
    text: 'Marketplace, payments, C1C/CRPT и другие внешние системы подключаются через интеграции, сохраняя доменную модель Syntha.',
  },
];

const confirmed = [
  '`/platform` hub и hub matrix',
  'readiness audit по ролям и столпам',
  'manufacturer PO cockpit',
  'supplier procurement cockpit',
  'Platform Core gateways для BOM, RFQ, QC, documents, DPP, capacity, shipment и comms',
];

const hardening = [
  'cross-role golden E2E',
  'Brand / Shop collection-order cockpits',
  'строгая навигация и сокращение legacy-шумов',
  'SSE-покрытие критических read paths',
  'action contracts для оставшихся переходов и side effects',
];

function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      {lead ? <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{lead}</p> : null}
    </div>
  );
}

function StatusList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function InvestorBriefPageClient() {
  const [runtimeOrigin, setRuntimeOrigin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRuntimeOrigin(window.location.origin);
  }, []);

  const canonicalUrl = useMemo(
    () => resolveCanonicalInvestorUrl(process.env.NEXT_PUBLIC_INVESTORS_URL, runtimeOrigin),
    [runtimeOrigin]
  );
  const contactUrl = useMemo(
    () => resolveInvestorContactUrl(process.env.NEXT_PUBLIC_INVESTOR_CONTACT_URL),
    []
  );

  const copyCanonicalUrl = async () => {
    if (!canonicalUrl || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="#top" className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">
            <Image
              src="/brand/syntha-wordmark-dark.png"
              alt="Syntha"
              width={126}
              height={34}
              priority
              className="h-auto w-[108px] sm:w-[126px]"
            />
          </a>
          <nav aria-label="Разделы презентации" className="hidden items-center gap-5 lg:flex">
            <a className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950" href="#platform">Платформа</a>
            <a className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950" href="#process">Процесс</a>
            <a className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950" href="#architecture">Архитектура</a>
            <a className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950" href="#status">Статус</a>
          </nav>
          <Link
            href="/platform"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            Открыть Platform Core
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main id="top">
        <section className="border-b border-slate-800 bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200">
                <PanelsTopLeft className="h-4 w-4 text-sky-400" aria-hidden="true" />
                SYNTHA · FASHION OS · PLATFORM CORE
              </div>
              <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.04]">
                От артикула до закрытия заказа — одна операционная среда fashion-бизнеса
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Syntha связывает бренд, магазин, производителя и поставщика в сквозной процесс разработки коллекции, заказа, производства, поставки и коммуникаций.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/platform"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-sky-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Посмотреть Platform Core
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {contactUrl ? (
                  <a
                    href={contactUrl}
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-600 px-6 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-400 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Обсудить партнёрство
                  </a>
                ) : null}
              </div>
              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800 sm:grid-cols-4">
                {[
                  ['4', 'роли'],
                  ['5', 'столпов'],
                  ['1', 'сквозной контекст'],
                  ['E2E', 'целевой принцип'],
                ].map(([value, label]) => (
                  <div key={label} className="bg-slate-950 px-4 py-4">
                    <p className="font-mono text-xl font-semibold text-white">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-black/20 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Cross-role chain</p>
                    <p className="mt-1 text-sm font-semibold text-white">Единый lifecycle коллекции и заказа</p>
                  </div>
                  <GitBranch className="h-6 w-6 text-sky-400" aria-hidden="true" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {roles.map(({ icon: Icon, name, role }) => (
                    <div key={name} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950 text-sky-300">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-mono text-xs font-semibold text-slate-200">{name}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-300">
                    {['Артикул', 'Коллекция', 'Заказ', 'Производство', 'Поставщик', 'Отгрузка', 'Закрытие'].map((step, index, all) => (
                      <span key={step} className="inline-flex items-center gap-2">
                        <span className="rounded-md border border-slate-800 px-2 py-1.5">{step}</span>
                        {index < all.length - 1 ? <ChevronRight className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" /> : null}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-900/70 bg-sky-950/50 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden="true" />
                  <p className="text-xs leading-5 text-slate-300">
                    Chat, calendar, documents, events и exceptions работают как слой над общей цепочкой, а не как отдельная история проекта.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="ПРОБЛЕМА"
              title="Fashion-процесс ломается не в одной функции — он ломается на передачах между функциями"
              lead="Syntha строится не как ещё один изолированный PLM-экран. Фокус Platform Core — сохранить связь между продуктом, коммерческим решением, производством, поставкой и коммуникацией через роли."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ['Разные роли', 'Каждый участник видит свой рабочий контур, но должен передавать проверяемый факт следующему.'],
                ['Разные системы', 'Каталог, заказ, производство, документы и коммуникации требуют общего идентификатора и lineage.'],
                ['Разные состояния', 'Данные разработки и факт исполнения нельзя подменять одной универсальной карточкой или статусом.'],
                ['Разные исключения', 'Просрочка, дефект, нехватка материала или изменение заказа должны возвращаться в управляемый процесс.'],
              ].map(([title, text]) => (
                <article key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <p className="text-base font-semibold text-slate-950">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="scroll-mt-24 border-b border-slate-200 bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="ПЛАТФОРМА"
              title="4 роли × 5 столпов — один Platform Core"
              lead="Роли не объединяются в один перегруженный интерфейс. Syntha сохраняет общий процесс, но даёт Brand, Shop, Manufacturer и Supplier собственный рабочий контур."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {roles.map(({ icon: Icon, name, role, text }) => (
                <article key={name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-wider text-sky-700">{name}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">{role}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <p className="text-sm font-semibold text-slate-950">Пять столпов Platform Core</p>
                <p className="mt-1 text-xs text-slate-500">Каноническая продуктовая модель текущего Platform Core.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {pillars.map(([index, key, title, text]) => (
                  <div key={key} className="grid gap-3 px-5 py-5 sm:grid-cols-[64px_180px_1fr] sm:items-start sm:px-6">
                    <span className="font-mono text-sm font-semibold text-sky-700">{index}</span>
                    <div>
                      <p className="font-mono text-xs font-semibold text-slate-500">{key}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{title}</p>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-24 border-b border-slate-200 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="END-TO-END"
              title="Golden path: от артикула до закрытия"
              lead="Цель — не просто показать статусы. Один orderId / PO / thread должен проходить цепочку ролей и сохранять связанный контекст на каждом handoff."
            />
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {goldenPath.map(({ icon: Icon, title, text }, index) => (
                <article key={title} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm ring-1 ring-slate-200">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
                </article>
              ))}
            </div>

            <div className="mt-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Операционный слой</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {operationalLayer.map(({ icon: Icon, title, text }) => (
                  <article key={title} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-950 py-16 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-400">PRODUCT / INVESTMENT THESIS</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Почему Syntha может быть платформенным слоем, а не набором модулей</h2>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                Ниже — продуктовая логика архитектуры. Это не оценка рынка, не valuation и не обещание финансового результата.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {investmentLogic.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-950 text-sky-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="architecture" className="scroll-mt-24 border-b border-slate-200 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="АРХИТЕКТУРА"
              title="Операционный контекст, данные, доверие и AI разделены по слоям"
              lead="Текущая архитектура Syntha сочетает Next.js и FastAPI с PostgreSQL, Redis, multitenancy/RBAC и отдельным AI-контуром."
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                {architecture.map(([layer, technology, text], index) => (
                  <div key={layer} className="grid gap-3 border-b border-slate-200 px-5 py-5 last:border-b-0 sm:grid-cols-[110px_190px_1fr] sm:px-6">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-700">{String(index + 1).padStart(2, '0')} · {layer}</span>
                    <span className="text-sm font-semibold text-slate-950">{technology}</span>
                    <span className="text-sm leading-6 text-slate-600">{text}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <Sparkles className="h-6 w-6 text-sky-700" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">AI — слой, а не источник истины</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    В архитектуре предусмотрены LLM client/router, prompt builder, embeddings, visual similarity, агенты и feedback loop. Публичная страница не приписывает этим компонентам неподтверждённый бизнес-эффект.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <ShieldCheck className="h-6 w-6 text-sky-700" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">Мультитенантность и роли</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Репозитории используют organization_id как tenant boundary; доступ строится через JWT, UserRole и permission checks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="status" className="scroll-mt-24 border-b border-slate-200 bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="СТАТУС"
              title="Показываем продукт без смешивания реализованного и следующего этапа"
              lead="Внутренний deep-audit различает готовые элементы, частично закрытые контуры и следующие задачи. Публичная страница сохраняет эту границу."
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <article className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Подтверждено в source
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">Существенное ядро уже есть</h3>
                <StatusList items={confirmed} />
              </article>

              <article className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  <GitBranch className="h-4 w-4" aria-hidden="true" />
                  Hardening
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">Сквозная квалификация продолжается</h3>
                <StatusList items={hardening} />
              </article>

              <article className="rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Claims boundary
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">Не подменяем доказательства маркетингом</h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  На этой странице нет выдуманных TAM/SAM/SOM, ROI, выручки, клиентских цифр, сроков внедрения или процентов эффективности. Такие показатели должны появляться только после отдельной верификации.
                </p>
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs leading-5 text-slate-600">
                    Cross-role golden E2E в текущем аудите имеет статус hardening, поэтому презентация не называет его полностью закрытым production-контуром.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-200/50 sm:p-10 lg:grid-cols-[1fr_320px] lg:items-center lg:p-12">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-400">QR / SHARE</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">Один публичный адрес для встречи, презентации и следующего разговора</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  QR строится локально из canonical URL. UTM-параметры и hash не становятся частью постоянного кода, поэтому аналитику кампаний можно менять без изменения QR identity.
                </p>
                {canonicalUrl ? (
                  <div className="mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Canonical URL</p>
                    <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-200">{canonicalUrl}</p>
                  </div>
                ) : null}
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/platform"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-sky-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Открыть Platform Core
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  {canonicalUrl ? (
                    <button
                      type="button"
                      onClick={copyCanonicalUrl}
                      className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-slate-600 px-6 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-400 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="flex min-h-[268px] items-center justify-center rounded-2xl bg-white p-6 text-slate-950">
                {canonicalUrl ? (
                  <div className="text-center">
                    <QRCodeSVG
                      value={canonicalUrl}
                      size={204}
                      level="M"
                      bgColor="#FFFFFF"
                      fgColor="#0F172A"
                      title="QR-код публичной страницы Syntha"
                    />
                    <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                      <QrCode className="h-4 w-4" aria-hidden="true" />
                      Syntha / investors
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                    <p className="mt-3 text-sm text-slate-500">QR появится после определения публичного origin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-slate-950">Syntha · Fashion OS</p>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
              Публичный product brief основан на текущем source of truth Syntha / Platform Core. Он не является финансовым прогнозом, оценкой компании или заявлением о неподтверждённом production-эффекте.
            </p>
          </div>
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-sky-700 transition-colors hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 lg:self-auto"
          >
            Platform Core
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
