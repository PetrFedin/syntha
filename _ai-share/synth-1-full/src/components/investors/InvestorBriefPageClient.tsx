'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowRight,
  Boxes,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Database,
  Factory,
  FileCheck2,
  GitBranch,
  Layers3,
  Link2,
  LockKeyhole,
  MessageSquareText,
  PackageCheck,
  PanelsTopLeft,
  QrCode,
  ScanSearch,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  resolveCanonicalInvestorUrl,
  resolveInvestorContactUrl,
} from '@/lib/investors/investor-brief-route';

const roles: Array<{ icon: LucideIcon; name: string; key: string; text: string }> = [
  {
    icon: Shirt,
    name: 'Бренд',
    key: 'Brand',
    text: 'Управляет разработкой коллекции, образцами, коммерческой готовностью и исполнением заказа.',
  },
  {
    icon: Store,
    name: 'Магазин / байер',
    key: 'Shop',
    text: 'Формирует ассортимент, собирает матрицу, размещает заказ и видит его фактический статус.',
  },
  {
    icon: Factory,
    name: 'Производитель',
    key: 'Manufacturer',
    text: 'Работает с производственным заказом, мощностями, материалами, качеством и выпуском.',
  },
  {
    icon: PackageCheck,
    name: 'Поставщик',
    key: 'Supplier',
    text: 'Получает потребность в материалах, подтверждает условия, сроки и исполнение поставки.',
  },
];

const pillars = [
  ['01', 'Разработка продукта', 'Карточка артикула, спецификация, стоимость и подготовка к следующему этапу.'],
  ['02', 'Образцы', 'Заказ образца, измерения, качество, документы и решение о готовности.'],
  ['03', 'Заказ коллекции', 'Матрица, выбор байера, коммерческие условия и подтверждение заказа.'],
  ['04', 'Производство заказа', 'Производственный заказ, мощности, материалы, выпуск, качество и отгрузка.'],
  ['05', 'Коммуникации', 'Сообщения, календарь, документы, события, сроки и эскалации в контексте процесса.'],
] as const;

const journey: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Shirt, title: 'Артикул', text: 'Единая карточка продукта и контекст разработки.' },
  { icon: Layers3, title: 'Коллекция', text: 'Ассортимент объединяется в управляемый сезонный контур.' },
  { icon: ShoppingBag, title: 'Заказ', text: 'Коммерческое решение превращается в подтверждённый заказ.' },
  { icon: Factory, title: 'Производство', text: 'Мощности, материалы, выпуск и контроль качества.' },
  { icon: Boxes, title: 'Поставщик', text: 'Условия, материалы и обязательства связаны с заказом.' },
  { icon: Truck, title: 'Отгрузка', text: 'Факт поставки передаётся следующему участнику цепочки.' },
  { icon: FileCheck2, title: 'Закрытие', text: 'Документы, решения и финальный статус сохраняют историю.' },
];

const businessValue: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Link2,
    title: 'Единый операционный контекст',
    text: 'Продукт, заказ, производство, поставка, документы и коммуникации остаются связанными между собой.',
  },
  {
    icon: GitBranch,
    title: 'Контролируемые передачи между ролями',
    text: 'Следующий участник получает не пересказ в письме, а связанный факт и состояние процесса.',
  },
  {
    icon: ScanSearch,
    title: 'Прозрачность отклонений',
    text: 'Просрочка, дефект, нехватка материала или изменение заказа возвращаются в управляемый контур.',
  },
  {
    icon: FileCheck2,
    title: 'Трассируемая история решений',
    text: 'Документы, статусы и действия сохраняются рядом с объектом, к которому они относятся.',
  },
  {
    icon: Users,
    title: 'Рабочее место для каждой стороны',
    text: 'У ролей разные интерфейсы и задачи, но они работают с общей моделью процесса и данных.',
  },
  {
    icon: BrainCircuit,
    title: 'Основа для прикладного AI',
    text: 'Искусственный интеллект получает структурированный контекст и помогает поверх данных, а не заменяет их.',
  },
];

const operations: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: CircleDollarSign,
    title: 'BOM и расчёт стоимости',
    text: 'BOM — спецификация материалов; стоимость и состав остаются связаны с артикулом.',
  },
  {
    icon: ScanSearch,
    title: 'RFQ и выбор поставщика',
    text: 'RFQ — запрос коммерческих условий по материалам и поставщикам.',
  },
  {
    icon: ClipboardCheck,
    title: 'QC / AQL и качество',
    text: 'Контроль качества, приёмочный уровень качества и дефекты входят в историю продукта и заказа.',
  },
  {
    icon: FileCheck2,
    title: 'Документы',
    text: 'Документы доступны в контексте артикула, заказа и передачи между участниками.',
  },
  {
    icon: ShieldCheck,
    title: 'DPP',
    text: 'DPP — цифровой паспорт продукта как отдельный связанный контур данных.',
  },
  {
    icon: Building2,
    title: 'Производственные мощности',
    text: 'Доступная мощность связывается с заказом и производственной площадкой.',
  },
  {
    icon: Truck,
    title: 'Отгрузка',
    text: 'Статус и факт отгрузки продолжают сквозную историю исполнения заказа.',
  },
  {
    icon: MessageSquareText,
    title: 'Контекстные коммуникации',
    text: 'Сообщения привязаны к продукту или заказу и не отделены от операционного процесса.',
  },
  {
    icon: Clock3,
    title: 'Сроки и исключения',
    text: 'Просрочки и исключения выделяются в самостоятельный контур контроля и эскалации.',
  },
];

const platformLogic: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: GitBranch,
    title: 'Связанный операционный граф',
    text: 'Артикул, коллекция, заказ, производство, поставка, документы и коммуникации образуют одну цепочку.',
  },
  {
    icon: Users,
    title: 'Один процесс для четырёх сторон',
    text: 'Бренд, магазин, производитель и поставщик используют разные представления одного бизнес-контекста.',
  },
  {
    icon: BrainCircuit,
    title: 'AI поверх структурированных данных',
    text: 'Модели получают контекст из доменных данных, визуального поиска и истории процесса.',
  },
  {
    icon: Link2,
    title: 'Расширяемая интеграционная граница',
    text: 'Внешние системы подключаются через интеграции и API, сохраняя единую доменную модель Syntha.',
  },
];

const architecture = [
  ['Интерфейс', 'Next.js 15 / App Router', 'Публичные поверхности, кабинеты ролей и Platform Core.'],
  ['Сервисный слой', 'FastAPI + Next BFF', 'API, контракты данных, сервисы и интеграционные границы.'],
  ['Данные', 'PostgreSQL + Redis', 'Постоянные данные, кеш и tenant-aware хранение по организациям.'],
  ['Доступ', 'JWT + RBAC', 'JWT-аутентификация и RBAC — ролевая модель прав доступа.'],
  ['AI-контур', 'LLM + CLIP / FAISS + agents', 'Языковые модели, визуальное сходство, агенты и обратная связь.'],
] as const;

const implemented = [
  'платформенное ядро `/platform` и матрица ролей × процессов',
  'рабочие контуры производителя и поставщика',
  'контуры BOM, RFQ, QC, документов и DPP',
  'контуры мощностей, отгрузки и контекстных коммуникаций',
  'проверка готовности по ролям и ключевым процессам',
];

const hardening = [
  'полная сквозная квалификация маршрута через все четыре роли',
  'контуры заказа коллекции для бренда и магазина',
  'усиление навигации и сокращение legacy-слоя',
  'обновление критических данных в реальном времени',
  'формализация оставшихся действий и побочных эффектов',
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

function StatusList({
  items,
  tone,
}: {
  items: readonly string[];
  tone: 'done' | 'progress';
}) {
  const done = tone === 'done';

  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
          <span
            className={
              done
                ? 'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700'
                : 'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700'
            }
          >
            {done ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
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
          <a
            href="#top"
            aria-label="Syntha — к началу страницы"
            className="inline-flex items-center rounded-md text-lg font-bold tracking-[0.22em] text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            SYNTHA
          </a>
          <nav aria-label="Разделы презентации" className="hidden items-center gap-5 lg:flex">
            <a className="text-sm font-medium text-slate-600 hover:text-slate-950" href="#platform">
              Платформа
            </a>
            <a className="text-sm font-medium text-slate-600 hover:text-slate-950" href="#process">
              Сквозной процесс
            </a>
            <a className="text-sm font-medium text-slate-600 hover:text-slate-950" href="#architecture">
              Архитектура
            </a>
            <a className="text-sm font-medium text-slate-600 hover:text-slate-950" href="#status">
              Готовность
            </a>
          </nav>
          <Link
            href="/platform"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            Открыть платформу
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main id="top">
        <section className="border-b border-slate-800 bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200">
                <PanelsTopLeft className="h-4 w-4 text-sky-400" aria-hidden="true" />
                SYNTHA · FASHION OS
              </div>
              <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.04]">
                От артикула до закрытия заказа — одна операционная среда fashion-бизнеса
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Syntha связывает бренд, магазин, производителя и поставщика в единый процесс разработки
                коллекции, заказа, производства, поставки и контроля исполнения.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/platform"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-sky-700 px-6 text-sm font-semibold text-white hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Посмотреть платформу
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {contactUrl ? (
                  <a
                    href={contactUrl}
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-600 px-6 text-sm font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Обсудить партнёрство
                  </a>
                ) : null}
              </div>
              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800 sm:grid-cols-4">
                {[
                  ['4', 'роли'],
                  ['5', 'сквозных контуров'],
                  ['1', 'модель данных'],
                  ['E2E', 'принцип работы'],
                ].map(([value, label]) => (
                  <div key={label} className="bg-slate-950 px-4 py-4">
                    <p className="font-mono text-xl font-semibold text-white">{value}</p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-black/20 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Сквозная цепочка ролей
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Единый жизненный цикл коллекции и заказа
                  </p>
                </div>
                <GitBranch className="h-6 w-6 text-sky-400" aria-hidden="true" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {roles.map(({ icon: Icon, name, key }) => (
                  <div key={key} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950 text-sky-300">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{name}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-500">{key}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-300">
                  {journey.map((step, index) => (
                    <span key={step.title} className="inline-flex items-center gap-2">
                      <span className="rounded-md border border-slate-800 px-2 py-1.5">{step.title}</span>
                      {index < journey.length - 1 ? <span className="text-slate-600">→</span> : null}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-900/70 bg-sky-950/50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden="true" />
                <p className="text-xs leading-5 text-slate-300">
                  Коммуникации, календарь, документы, события и исключения работают поверх общей цепочки,
                  а не как отдельные несвязанные инструменты.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="ЗАЧЕМ НУЖНА SYNTHA"
              title="Основной разрыв возникает не внутри функции, а между участниками процесса"
              lead="Каталог, заказ, производство, поставка, документы и коммуникации часто живут в разных контурах. Syntha сохраняет связь между ними и передаёт контекст вместе с процессом."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                ['Разные роли', 'Каждый участник работает в своём контуре, но передаёт проверяемый факт следующему.'],
                ['Разные системы', 'Объекты связываются едиными идентификаторами и общей историей изменений.'],
                ['Разные состояния', 'План, согласование и фактическое исполнение не подменяют друг друга.'],
                ['Разные исключения', 'Просрочка, дефект или изменение возвращаются в управляемый процесс.'],
              ].map(([title, text]) => (
                <article key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <p className="text-base font-semibold text-slate-950">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="ЦЕННОСТЬ ДЛЯ БИЗНЕСА"
              title="Что меняется, когда процесс и данные становятся едиными"
              lead="Без неподтверждённых процентов и обещаний: ценность платформы определяется конкретными механизмами управления, которые она создаёт."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {businessValue.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="scroll-mt-24 border-b border-slate-200 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="КОМУ ПРЕДНАЗНАЧЕНА ПЛАТФОРМА"
              title="Четыре стороны одной fashion-цепочки"
              lead="Syntha не сводит всех пользователей к одному перегруженному интерфейсу. Каждая сторона получает своё рабочее представление, оставаясь в общем процессе."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {roles.map(({ icon: Icon, name, key, text }) => (
                <article key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-wider text-sky-700">
                    {key}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">{name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <p className="text-sm font-semibold text-slate-950">Пять сквозных контуров Platform Core</p>
                <p className="mt-1 text-xs text-slate-500">Каноническая продуктовая модель текущего ядра Syntha.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {pillars.map(([index, title, text]) => (
                  <div
                    key={index}
                    className="grid gap-3 px-5 py-5 sm:grid-cols-[64px_210px_1fr] sm:items-start sm:px-6"
                  >
                    <span className="font-mono text-sm font-semibold text-sky-700">{index}</span>
                    <p className="text-sm font-semibold text-slate-950">{title}</p>
                    <p className="text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="process" className="scroll-mt-24 border-b border-slate-200 bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="СКВОЗНОЙ ПРОЦЕСС"
              title="От артикула до закрытия — один маршрут данных и решений"
              lead="Цель — не просто показать статусы. Связанный заказ, производственный заказ и коммуникация должны проходить цепочку ролей без потери контекста на каждой передаче."
            />
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {journey.map(({ icon: Icon, title, text }, index) => (
                <article key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-slate-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
                </article>
              ))}
            </div>

            <div className="mt-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Функциональный слой
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {operations.map(({ icon: Icon, title, text }) => (
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
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-400">
                ПЛАТФОРМЕННАЯ ЛОГИКА
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Почему Syntha может масштабироваться как единая операционная платформа
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                Это описание продуктовой архитектуры, а не оценка рынка, стоимости компании или обещание
                финансового результата.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {platformLogic.map(({ icon: Icon, title, text }) => (
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
              eyebrow="ТЕХНОЛОГИЧЕСКАЯ ОСНОВА"
              title="Операционный контекст, данные, доступ и AI разделены по слоям"
              lead="Архитектура Syntha сочетает Next.js и FastAPI с PostgreSQL, Redis, ролевой моделью доступа и отдельным AI-контуром."
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                {architecture.map(([layer, technology, text], index) => (
                  <div
                    key={layer}
                    className="grid gap-3 border-b border-slate-200 px-5 py-5 last:border-b-0 sm:grid-cols-[130px_200px_1fr] sm:px-6"
                  >
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-700">
                      {String(index + 1).padStart(2, '0')} · {layer}
                    </span>
                    <span className="text-sm font-semibold text-slate-950">{technology}</span>
                    <span className="text-sm leading-6 text-slate-600">{text}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <BrainCircuit className="h-6 w-6 text-sky-700" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">AI — прикладной слой над данными</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    В архитектуре предусмотрены языковые модели, маршрутизация запросов, embeddings,
                    визуальный поиск, агенты и обратная связь. Источником истины остаются доменные данные и
                    факты процесса.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <LockKeyhole className="h-6 w-6 text-sky-700" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">Организации и роли</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Данные разделяются по организациям; доступ строится через JWT и RBAC — ролевую модель
                    прав.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <Database className="h-6 w-6 text-sky-700" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">Единая доменная модель</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Интеграции расширяют платформу через API, не создавая параллельный источник истины для
                    ключевых объектов процесса.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="status" className="scroll-mt-24 border-b border-slate-200 bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="ТЕКУЩАЯ СТЕПЕНЬ ГОТОВНОСТИ"
              title="Реализованное отделено от того, что проходит промышленное усиление"
              lead="Публичная презентация не выдаёт план развития за уже завершённую функциональность. Ниже зафиксирована текущая граница продукта по внутреннему аудиту."
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <article className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Реализовано
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">Существенное ядро уже в коде</h3>
                <StatusList items={implemented} tone="done" />
              </article>

              <article className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  Промышленное усиление
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  Сквозная квалификация продолжается
                </h3>
                <StatusList items={hardening} tone="progress" />
              </article>

              <article className="rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Принцип доказательности
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  Бизнес-эффект публикуется только после проверки
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  На странице намеренно нет неподтверждённых размеров рынка, ROI, выручки, числа клиентов,
                  сроков внедрения или процентов эффективности. Такие показатели должны появляться только
                  после отдельной верификации.
                </p>
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs leading-5 text-slate-600">
                    Полный межролевой сценарий пока проходит сквозную квалификацию, поэтому презентация не
                    называет весь контур окончательно промышленно подтверждённым.
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
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-400">QR · ПУБЛИЧНАЯ ССЫЛКА</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Один адрес для встречи, презентации и следующего разговора
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  QR формируется внутри платформы из постоянного адреса страницы. Метки аналитики можно
                  менять отдельно, не меняя сам QR-код.
                </p>
                {canonicalUrl ? (
                  <div className="mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Постоянная ссылка
                    </p>
                    <p
                      data-testid="investors-canonical-url"
                      className="mt-2 break-all font-mono text-xs leading-5 text-slate-200"
                    >
                      {canonicalUrl}
                    </p>
                  </div>
                ) : null}
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/platform"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-sky-700 px-6 text-sm font-semibold text-white hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Открыть платформу
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  {canonicalUrl ? (
                    <button
                      type="button"
                      onClick={copyCanonicalUrl}
                      className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-slate-600 px-6 text-sm font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
                    </button>
                  ) : null}
                  {contactUrl ? (
                    <a
                      href={contactUrl}
                      className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-600 px-6 text-sm font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      Связаться
                    </a>
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
                      Syntha · Fashion OS
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
                    <p className="mt-3 text-sm text-slate-500">
                      QR появится после определения публичного адреса.
                    </p>
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
              Публичный обзор основан на текущей архитектуре и внутреннем аудите Syntha. Финансовые
              показатели и оценки рынка публикуются только после отдельной проверки источников и расчётов.
            </p>
          </div>
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-sky-700 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 lg:self-auto"
          >
            Открыть платформу
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
