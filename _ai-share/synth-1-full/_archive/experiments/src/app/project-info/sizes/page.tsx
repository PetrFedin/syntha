'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { PRODUCTION_PARAMS_BY_CATEGORY } from '@/lib/data/production-params';
import { sizeChartDataShirtsMen, sizeChartDataShirtsWomen } from '@/lib/sizes';
import {
  sizeChartDataHats,
  sizeChartDataGloves,
  sizeChartDataBelts,
  sizeChartDataScarves,
  sizeChartDataGlasses,
  sizeChartDataRings,
  sizeChartDataWatches,
  sizeChartDataSocks,
  sizeChartDataWallets,
  sizeChartDataUmbrellas,
  sizeChartDataHeadwearWomen,
  sizeChartDataHeadwearMen,
  sizeChartDataFurWomen,
  sizeChartDataFurMen,
  sizeChartDataAccessoriesSummaryWomen,
  sizeChartDataAccessoriesSummaryMen,
  sizeChartDataHeadwearWomenStyleGuide,
} from '@/lib/accessory-sizes';
import {
  menAccessoriesCoverageRows,
  menApparelCoverageRows,
  menBagsCoverageRows,
  womenAccessoriesCoverageRows,
  womenApparelCoverageRows,
  womenBagsCoverageRows,
} from '@/lib/apparel-bags-accessories-coverage';
import { menFootwearCoverageRows, womenFootwearCoverageRows } from '@/lib/footwear-size-coverage';
import { buildKidsHandbookCoverageRows } from '@/lib/kids-handbook-coverage';
import {
  loadCatalogAudienceFlagMap,
  type CatalogAudienceFlags,
} from '@/lib/project-info/category-catalog-audience-flags';
import { sizeChartBagsHeaderOverlay, sizeChartHeaderDescriptions } from '@/lib/size-chart-headers';
import {
  kidsAccessoryChartBlocks,
  sizeChartDataKidsApparelBoys,
  sizeChartDataKidsApparelGirls,
  sizeChartDataKidsBags,
  sizeChartDataKidsBottomsBoys,
  sizeChartDataKidsBottomsGirls,
  sizeChartDataKidsDressesGirls,
  sizeChartDataKidsKnitSportBoys,
  sizeChartDataKidsKnitSportGirls,
  sizeChartDataKidsNewbornApparel,
  sizeChartDataKidsNewbornBodysuitsTops,
  sizeChartDataKidsNewbornBottoms,
  sizeChartDataKidsNewbornOuterwear,
  sizeChartDataKidsOuterwearBoys,
  sizeChartDataKidsOuterwearGirls,
  sizeChartDataKidsShirtsTopsBoys,
  sizeChartDataKidsShirtsTopsGirls,
  sizeChartDataKidsShoes,
  sizeChartDataKidsSkirtsGirls,
  sizeChartDataKidsSuitsBoys,
  sizeChartDataKidsSuitsGirls,
  sizeChartDataKidsUnderwearPajamasBeachBoys,
  sizeChartDataKidsUnderwearPajamasBeachGirls,
  sizeChartDataNewbornAccessories,
  sizeChartDataNewbornBags,
  sizeChartDataNewbornHeadwear,
  sizeChartDataNewbornShoes,
} from '@/lib/kids-sizes';
import {
  sizeChartDataBeautyCare,
  sizeChartDataBeautyCosmetics,
  sizeChartDataBeautyPerfume,
  sizeChartDataHomeDecor,
  sizeChartDataHomeGadgets,
  sizeChartDataHomePets,
  sizeChartDataHomeTextileAdult,
} from '@/lib/lifestyle-beauty-sizes';
import { rfTzBeautyCareBullets, rfTzHomeLifestyleBullets } from '@/lib/rf-tz-checklists';
import { Baby, Footprints, LandPlot, Shirt, ShoppingBag } from 'lucide-react';

const headerDescriptions = sizeChartHeaderDescriptions;

function getHeaders(data: Record<string, string>[]): string[] {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
}

function SizeChartTable({
  data,
  title,
  loading,
  headerOverlay,
}: {
  data: Record<string, string>[];
  title: string;
  loading?: boolean;
  /** Подписи колонок поверх общего словаря (например сумки: height ≠ «Рост»). */
  headerOverlay?: Record<string, { title: string; tooltip: string }>;
}) {
  const headers = getHeaders(data);
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }
  if (headers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {headerOverlay?.[header]?.title ??
                          headerDescriptions[header]?.title ??
                          header}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {headerOverlay?.[header]?.tooltip ??
                            headerDescriptions[header]?.tooltip ??
                            header}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header) => (
                  <TableCell key={header} className="text-xs">
                    {row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ProductionParamsTable({
  label,
  sizeScales,
  wide,
}: {
  label: string;
  sizeScales: { id: string; label: string; sizes: string[]; rule: string }[];
  /** Шире колонки шкал (дом, косметика, детская обувь). */
  wide?: boolean;
}) {
  const maxRows = Math.max(...sizeScales.map((s) => s.sizes.length), 1);
  const scaleCols = sizeScales.map((s) => ({ id: s.id, label: s.label, sizes: s.sizes }));
  const colHead = wide ? 'min-w-[11rem] max-w-[20rem] whitespace-normal' : '';
  const colCell = wide ? 'min-w-[10rem] max-w-[20rem] align-top' : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">№</TableHead>
              {scaleCols.map((s) => (
                <TableHead key={s.id} className={colHead}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">
                        {s.label} ({s.id})
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Размерная шкала {s.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: maxRows }, (_, i) => (
              <TableRow key={i}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                {scaleCols.map((col) => (
                  <TableCell key={col.id} className={`text-xs ${colCell}`}>
                    {col.sizes[i] ?? '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/** Одни и те же числовые ряды для мужской и женской вкладки (различия по полу — в блоках «Головные уборы / мех» из production-params). */
const accessoryCategories = [
  { title: 'Головные уборы', data: sizeChartDataHats },
  { title: 'Перчатки', data: sizeChartDataGloves },
  { title: 'Ремни', data: sizeChartDataBelts },
  { title: 'Шарфы, палантины, платки', data: sizeChartDataScarves },
  { title: 'Очки', data: sizeChartDataGlasses },
  { title: 'Кольца', data: sizeChartDataRings },
  { title: 'Часы', data: sizeChartDataWatches },
  { title: 'Носки и чулки', data: sizeChartDataSocks },
  { title: 'Кошельки', data: sizeChartDataWallets },
  { title: 'Зонты', data: sizeChartDataUmbrellas },
];

const getCat = (id: string) => PRODUCTION_PARAMS_BY_CATEGORY.find((c) => c.catL1Id === id)!;

function CategoryMetadataCard({ catId }: { catId: string }) {
  const p = PRODUCTION_PARAMS_BY_CATEGORY.find((c) => c.catL1Id === catId);
  if (!p) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{p.label} — атрибуты для ТЗ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-medium text-foreground">Габариты и мерки</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {p.dimensions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Материалы</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {p.materialTypes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Фурнитура и комплектация</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            {p.trims.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Этапы</p>
          <p className="text-muted-foreground">{p.fittingStages.join(' → ')}</p>
        </div>
        {p.deliveryNotes ? (
          <div>
            <p className="font-medium text-foreground">Доставка и упаковка</p>
            <p className="text-muted-foreground">{p.deliveryNotes}</p>
          </div>
        ) : null}
        {p.taxNotes ? (
          <div className="rounded-md border border-amber-200/80 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="font-medium text-foreground">РФ и ЕАЭС</p>
            <p className="mt-1 text-muted-foreground">{p.taxNotes}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RfTzChecklistCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function LifestyleSizesSection() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Взрослая и универсальная линия по справочнику «Дом и стиль жизни» и «Красота и уход». Раздел
        «Детские» — только одежда, обувь, сумки и аксессуары.
      </p>
      <Tabs defaultValue="home" className="space-y-6">
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
          <TabsTrigger
            value="home"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Дом и стиль жизни
          </TabsTrigger>
          <TabsTrigger
            value="beauty"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Красота и уход
          </TabsTrigger>
        </TabsList>
        <TabsContent value="home" className={cabinetSurface.cabinetProfileTabPanel}>
          <SizeChartTable
            data={sizeChartDataHomeTextileAdult}
            title="Текстиль дома — типовые габариты (см)"
          />
          <SizeChartTable data={sizeChartDataHomeDecor} title="Декор и хранение" />
          <SizeChartTable
            data={sizeChartDataHomePets}
            title="Питомцы — одежда, лежанки, переноски, поводки"
          />
          <SizeChartTable data={sizeChartDataHomeGadgets} title="Lifestyle-гаджеты" />
          <ProductionParamsTable
            label="Дом и стиль жизни — размерные шкалы"
            sizeScales={getCat('home-lifestyle').sizeScales}
            wide
          />
          <CategoryMetadataCard catId="home-lifestyle" />
          <RfTzChecklistCard
            title="Чеклист ТЗ для РФ: дом и текстиль"
            bullets={rfTzHomeLifestyleBullets}
          />
        </TabsContent>
        <TabsContent value="beauty" className={cabinetSurface.cabinetProfileTabPanel}>
          <SizeChartTable data={sizeChartDataBeautyPerfume} title="Парфюмерия" />
          <SizeChartTable data={sizeChartDataBeautyCosmetics} title="Косметика" />
          <SizeChartTable data={sizeChartDataBeautyCare} title="Уход за телом" />
          <ProductionParamsTable
            label="Красота и уход — шкалы объёма, массы и габаритов тары"
            sizeScales={getCat('beauty-care').sizeScales}
            wide
          />
          <CategoryMetadataCard catId="beauty-care" />
          <RfTzChecklistCard
            title="Чеклист ТЗ для РФ: косметика и уход"
            bullets={rfTzBeautyCareBullets}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Подписи колонок для детских сумок (length ≠ «длина изделия» одежды). */
const kidsBagsHeaderOverlay: Record<string, { title: string; tooltip: string }> = {
  length: { title: 'Длина', tooltip: 'Габарит по длине корпуса / пакета, см' },
  height: { title: 'Высота', tooltip: 'Высота корпуса, см (не рост ребёнка)' },
  width: { title: 'Ширина', tooltip: 'см' },
  depth: { title: 'Глубина', tooltip: 'см' },
  strapLength: { title: 'Длина лямок', tooltip: 'Регулируемый диапазон, см' },
  handleDrop: { title: 'Ручка', tooltip: 'Падение ручки или «—»' },
  weight: { title: 'Вес', tooltip: 'Масса, г' },
  comment: { title: 'Примечание', tooltip: 'Доп. к ТЗ' },
  productType: { title: 'Тип', tooltip: 'Тип сумки / ранца' },
};

const accessoriesSummaryHeaderOverlay: Record<string, { title: string; tooltip: string }> = {
  headCm: { title: 'Голова (ориентир)', tooltip: 'Типичный обхват для шапок, см' },
  palmCm: { title: 'Ладонь', tooltip: 'Ориентир для перчаток, см' },
  beltLengthCm: { title: 'Ремень', tooltip: 'Типичная длина ремня, см' },
  sockEU: { title: 'Носки EU', tooltip: 'Ориентир по размеру стельки' },
  ringEU: { title: 'Кольцо EU', tooltip: 'Размер кольца EU' },
  watchCaseMm: { title: 'Часы', tooltip: 'Диаметр корпуса, мм' },
};

const headwearChartHeaderOverlay: Record<string, { title: string; tooltip: string }> = {
  weight: { title: 'Вес', tooltip: 'Масса изделия (г)' },
};

const catalogCoverageHeaderOverlay: Record<string, { title: string; tooltip: string }> = {
  catalogGroup: { title: 'Группы каталога', tooltip: 'Разделы L1 › L2 (и др. примечания)' },
  catalogLeaves: { title: 'Листы / подтипы', tooltip: 'L3 и примеры номенклатуры' },
  sizeTableTitle: { title: 'Таблица ниже', tooltip: 'Заголовок числового блока на странице' },
  fetchKey: {
    title: 'Ключ данных',
    tooltip: 'Файл /data/size-chart-*.json, TS-модуль или id Цеха',
  },
  notes: { title: 'Примечания', tooltip: 'Источник сетки и уточнения к ТЗ' },
};

function catalogCoverageAsRows(
  rows: {
    catalogGroup: string;
    catalogLeaves: string;
    sizeTableTitle: string;
    fetchKey: string;
    notes: string;
  }[]
): Record<string, string>[] {
  return rows.map((r) => ({
    catalogGroup: r.catalogGroup,
    catalogLeaves: r.catalogLeaves,
    sizeTableTitle: r.sizeTableTitle,
    fetchKey: r.fetchKey,
    notes: r.notes,
  }));
}

type KidsAudience = 'boys' | 'girls' | 'newborn';

function asSizeRows<T extends Record<string, unknown>>(rows: T[]): Record<string, string>[] {
  return rows.map((r) => {
    const o: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) {
      o[k] = v == null ? '' : String(v);
    }
    return o;
  });
}

function kidsClothingCoverageTitle(audience: KidsAudience): string {
  if (audience === 'boys') return 'Сводка: группы каталога одежды → числовые таблицы (мальчики)';
  if (audience === 'girls') return 'Сводка: группы каталога одежды → числовые таблицы (девочки)';
  return 'Сводка: группы каталога одежды → числовые таблицы (новорождённые, 0–12 м)';
}

/** Сводка каталога → числовые таблицы; без блока шкал Цеха. */
function KidsClothingStacked({
  audience,
  apparelTitle,
  summaryData,
  coverageRows,
}: {
  audience: KidsAudience;
  apparelTitle: string;
  summaryData: Record<string, string>[];
  coverageRows: Record<string, string>[];
}) {
  if (audience === 'newborn') {
    return (
      <div className="space-y-6">
        <SizeChartTable
          data={coverageRows}
          title={kidsClothingCoverageTitle(audience)}
          headerOverlay={catalogCoverageHeaderOverlay}
        />
        <SizeChartTable data={summaryData} title={apparelTitle} />
        <SizeChartTable
          data={asSizeRows(sizeChartDataKidsNewbornOuterwear)}
          title="Верхняя одежда — габариты (0–12 м)"
        />
        <SizeChartTable
          data={asSizeRows(sizeChartDataKidsNewbornBodysuitsTops)}
          title="Боди, распашонки, верх — габариты (0–12 м)"
        />
        <SizeChartTable
          data={asSizeRows(sizeChartDataKidsNewbornBottoms)}
          title="Ползунки, брюки — габариты (0–12 м)"
        />
      </div>
    );
  }

  if (audience === 'boys') {
    return (
      <div className="space-y-6">
        <SizeChartTable
          data={coverageRows}
          title={kidsClothingCoverageTitle(audience)}
          headerOverlay={catalogCoverageHeaderOverlay}
        />
        <SizeChartTable data={summaryData} title={apparelTitle} />
        <SizeChartTable
          data={asSizeRows(sizeChartDataKidsOuterwearBoys)}
          title="Верхняя одежда (мальчики)"
        />
        <SizeChartTable
          data={asSizeRows(sizeChartDataKidsSuitsBoys)}
          title="Костюмы и жакеты (мальчики)"
        />
        <SizeChartTable
          data={asSizeRows(sizeChartDataKidsShirtsTopsBoys)}
          title="Рубашки, поло, футболки (мальчики)"
        />
        <SizeChartTable
          data={asSizeRows(sizeChartDataKidsBottomsBoys)}
          title="Брюки, джинсы, шорты (мальчики)"
        />
        <SizeChartTable
          data={asSizeRows(sizeChartDataKidsKnitSportBoys)}
          title="Трикотаж и спорт (мальчики)"
        />
        <SizeChartTable
          data={asSizeRows(sizeChartDataKidsUnderwearPajamasBeachBoys)}
          title="Нижнее бельё, пижамы, пляж (мальчики)"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SizeChartTable
        data={coverageRows}
        title={kidsClothingCoverageTitle(audience)}
        headerOverlay={catalogCoverageHeaderOverlay}
      />
      <SizeChartTable data={summaryData} title={apparelTitle} />
      <SizeChartTable
        data={asSizeRows(sizeChartDataKidsOuterwearGirls)}
        title="Верхняя одежда (девочки)"
      />
      <SizeChartTable
        data={asSizeRows(sizeChartDataKidsSuitsGirls)}
        title="Костюмы и жакеты (девочки)"
      />
      <SizeChartTable
        data={asSizeRows(sizeChartDataKidsDressesGirls)}
        title="Платья и сарафаны (девочки)"
      />
      <SizeChartTable data={asSizeRows(sizeChartDataKidsSkirtsGirls)} title="Юбки (девочки)" />
      <SizeChartTable
        data={asSizeRows(sizeChartDataKidsShirtsTopsGirls)}
        title="Рубашки, поло, футболки (девочки)"
      />
      <SizeChartTable
        data={asSizeRows(sizeChartDataKidsBottomsGirls)}
        title="Брюки, джинсы, шорты (девочки)"
      />
      <SizeChartTable
        data={asSizeRows(sizeChartDataKidsKnitSportGirls)}
        title="Трикотаж и спорт (девочки)"
      />
      <SizeChartTable
        data={asSizeRows(sizeChartDataKidsUnderwearPajamasBeachGirls)}
        title="Нижнее бельё, пижамы, пляж (девочки)"
      />
    </div>
  );
}

function KidsInnerTabs({
  audience,
  flagMap,
}: {
  audience: KidsAudience;
  flagMap: Record<string, CatalogAudienceFlags>;
}) {
  const isNb = audience === 'newborn';
  const hbAudience = audience;
  const clothingCov = useMemo(
    () => catalogCoverageAsRows(buildKidsHandbookCoverageRows(hbAudience, 'clothing', flagMap)),
    [hbAudience, flagMap]
  );
  const shoesCov = useMemo(
    () => catalogCoverageAsRows(buildKidsHandbookCoverageRows(hbAudience, 'shoes', flagMap)),
    [hbAudience, flagMap]
  );
  const bagsCov = useMemo(
    () => catalogCoverageAsRows(buildKidsHandbookCoverageRows(hbAudience, 'bags', flagMap)),
    [hbAudience, flagMap]
  );
  const accCov = useMemo(
    () => catalogCoverageAsRows(buildKidsHandbookCoverageRows(hbAudience, 'accessories', flagMap)),
    [hbAudience, flagMap]
  );

  const apparelTitle =
    audience === 'boys'
      ? 'Одежда (мальчики)'
      : audience === 'girls'
        ? 'Одежда (девочки)'
        : 'Одежда (новорождённые, 0–12 м)';
  const apparelData = isNb
    ? sizeChartDataKidsNewbornApparel
    : audience === 'girls'
      ? sizeChartDataKidsApparelGirls
      : sizeChartDataKidsApparelBoys;

  return (
    <Tabs defaultValue="clothing" className="space-y-6">
      {/* cabinetSurface v1 */}
      <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
        <TabsTrigger
          value="clothing"
          className={cn(
            cabinetSurface.tabsTrigger,
            'text-xs font-semibold normal-case tracking-normal'
          )}
        >
          <Shirt className="mr-2 h-4 w-4" />
          Одежда
        </TabsTrigger>
        <TabsTrigger
          value="shoes"
          className={cn(
            cabinetSurface.tabsTrigger,
            'text-xs font-semibold normal-case tracking-normal'
          )}
        >
          <Footprints className="mr-2 h-4 w-4" />
          Обувь
        </TabsTrigger>
        <TabsTrigger
          value="bags"
          className={cn(
            cabinetSurface.tabsTrigger,
            'text-xs font-semibold normal-case tracking-normal'
          )}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Сумки
        </TabsTrigger>
        <TabsTrigger
          value="accessories"
          className={cn(
            cabinetSurface.tabsTrigger,
            'text-xs font-semibold normal-case tracking-normal'
          )}
        >
          <LandPlot className="mr-2 h-4 w-4" />
          Аксессуары
        </TabsTrigger>
      </TabsList>
      <TabsContent value="clothing" className={cabinetSurface.cabinetProfileTabPanel}>
        <KidsClothingStacked
          audience={audience}
          apparelTitle={apparelTitle}
          summaryData={asSizeRows(apparelData as unknown as Record<string, unknown>[])}
          coverageRows={clothingCov}
        />
        {!isNb ? (
          <p className="text-xs text-muted-foreground">
            Обувь, сумки, головные уборы и прочие аксессуары — одна сетка на мальчиков и девочек
            (отличается только одежда по бёдрам и нижним меркам).
          </p>
        ) : null}
      </TabsContent>
      <TabsContent value="shoes" className={cabinetSurface.cabinetProfileTabPanel}>
        <SizeChartTable
          data={shoesCov}
          title={
            audience === 'boys'
              ? 'Сводка: группы каталога обуви → числовые таблицы (мальчики)'
              : audience === 'girls'
                ? 'Сводка: группы каталога обуви → числовые таблицы (девочки)'
                : 'Сводка: группы каталога обуви → числовые таблицы (новорождённые)'
          }
          headerOverlay={catalogCoverageHeaderOverlay}
        />
        <p className="text-xs text-muted-foreground">
          {isNb
            ? 'Пинетки и EU 16–19 — отдельная таблица; кроссовки, ботинки, сандалии для малышей используют ту же длину стопы (мм), что и общая детская EU-сетка ниже.'
            : 'Длина стопы по EU в таблице ниже одна для мальчиков и девочек; в каталоге различаются линейки моделей и полнота (в ТЗ).'}
        </p>
        {isNb ? (
          <>
            <SizeChartTable
              data={asSizeRows(sizeChartDataNewbornShoes as unknown as Record<string, unknown>[])}
              title="Пинетки и первая обувь (0–12 м)"
            />
            <SizeChartTable
              data={sizeChartDataKidsShoes}
              title="Обувь для малышей (EU 18–35): кроссовки, ботинки, сандалии и др. — та же сетка длины стопы"
            />
          </>
        ) : (
          <SizeChartTable data={sizeChartDataKidsShoes} title="Обувь (детская) — EU" />
        )}
        <ProductionParamsTable
          label="Обувь (детская) — размерные шкалы и габаритные мерки"
          sizeScales={getCat('kids-shoes').sizeScales}
          wide
        />
        <CategoryMetadataCard catId="kids-shoes" />
      </TabsContent>
      <TabsContent value="bags" className={cabinetSurface.cabinetProfileTabPanel}>
        <SizeChartTable
          data={bagsCov}
          title={
            audience === 'boys'
              ? 'Сводка: группы каталога сумок → числовые таблицы (мальчики)'
              : audience === 'girls'
                ? 'Сводка: группы каталога сумок → числовые таблицы (девочки)'
                : 'Сводка: группы каталога сумок → числовые таблицы (новорождённые и старшие дети)'
          }
          headerOverlay={catalogCoverageHeaderOverlay}
        />
        {isNb ? (
          <SizeChartTable
            data={asSizeRows(sizeChartDataNewbornBags as unknown as Record<string, unknown>[])}
            title="Сумки у коляски / для ухода (0–12 м) — габариты"
            headerOverlay={kidsBagsHeaderOverlay}
          />
        ) : null}
        <SizeChartTable
          data={sizeChartDataKidsBags}
          title={isNb ? 'Ранцы и рюкзаки (от дошкольного возраста)' : 'Сумки и ранцы (детские)'}
          headerOverlay={kidsBagsHeaderOverlay}
        />
      </TabsContent>
      <TabsContent value="accessories" className={cabinetSurface.cabinetProfileTabPanel}>
        <SizeChartTable
          data={accCov}
          title={
            audience === 'boys'
              ? 'Сводка: группы каталога аксессуаров и головных уборов → таблицы (мальчики)'
              : audience === 'girls'
                ? 'Сводка: группы каталога аксессуаров и головных уборов → таблицы (девочки)'
                : 'Сводка: группы каталога аксессуаров и головных уборов → таблицы (новорождённые)'
          }
          headerOverlay={catalogCoverageHeaderOverlay}
        />
        {kidsAccessoryChartBlocks.map(({ title, data }) => (
          <SizeChartTable key={title} data={[...data]} title={title} />
        ))}
        {isNb ? (
          <>
            <SizeChartTable
              data={asSizeRows(
                sizeChartDataNewbornHeadwear as unknown as Record<string, unknown>[]
              )}
              title="Шапочки (новорождённые) — ориентир обхвата головы"
            />
            <SizeChartTable
              data={sizeChartDataNewbornAccessories}
              title="Аксессуары для новорождённых — габариты и параметры (newborn-accessories)"
            />
            <p className="text-xs text-muted-foreground">
              Универсальные «детские» шапки/перчатки ниже — с XS (≈9–12 м); для 0–9 м ориентируйтесь
              на таблицу обхвата выше.
            </p>
          </>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}

function KidsSizesSection() {
  const [audience, setAudience] = useState<KidsAudience>('boys');
  const [flagMap, setFlagMap] = useState<Record<string, CatalogAudienceFlags>>(
    loadCatalogAudienceFlagMap
  );
  useEffect(() => {
    setFlagMap(loadCatalogAudienceFlagMap());
  }, []);

  return (
    <div className="space-y-4">
      <Tabs
        value={audience}
        onValueChange={(v) => setAudience(v as KidsAudience)}
        className="space-y-6"
      >
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
          <TabsTrigger
            value="boys"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Мальчики
          </TabsTrigger>
          <TabsTrigger
            value="girls"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Девочки
          </TabsTrigger>
          <TabsTrigger
            value="newborn"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            <Baby className="mr-2 h-4 w-4" />
            Новорождённые
          </TabsTrigger>
        </TabsList>
        <TabsContent value="boys" className={cabinetSurface.cabinetProfileTabPanel}>
          <KidsInnerTabs audience="boys" flagMap={flagMap} />
        </TabsContent>
        <TabsContent value="girls" className={cabinetSurface.cabinetProfileTabPanel}>
          <KidsInnerTabs audience="girls" flagMap={flagMap} />
        </TabsContent>
        <TabsContent value="newborn" className={cabinetSurface.cabinetProfileTabPanel}>
          <KidsInnerTabs audience="newborn" flagMap={flagMap} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const womenClothingKeys = [
  'outerwear',
  'suits',
  'dresses',
  'skirts',
  'shirts',
  'tops',
  'jeans',
  'trousers',
  'knitwear',
  'lingerie',
  'sportswear',
  'beachwear',
  'maternity',
  'adaptive',
];
const menClothingKeys = [
  'outerwear',
  'suits',
  'shirts',
  'tops',
  'jeans',
  'trousers',
  'knitwear',
  'lingerie',
  'sportswear',
];
const womenShoesKeys = ['shoes', 'boots', 'flats', 'sandals', 'sneakers', 'homeshoes'];
const menShoesKeys = ['sneakers', 'boots', 'shoes', 'sandals', 'homeshoes'];

const womenClothingTitles: Record<string, string> = {
  outerwear: 'Женская верхняя одежда',
  suits: 'Женские костюмы и жакеты',
  dresses: 'Женские платья и сарафаны',
  skirts: 'Женские юбки',
  shirts: 'Женские рубашки и блузы',
  tops: 'Женские топы и футболки',
  jeans: 'Женские джинсы',
  trousers: 'Женские брюки',
  knitwear: 'Женский трикотаж',
  lingerie: 'Женское нижнее бельё и домашняя одежда',
  sportswear: 'Женская спортивная одежда',
  beachwear: 'Женская пляжная мода',
  maternity: 'Женская одежда для беременных',
  adaptive: '♿ Женская одежда для ограниченной подвижности',
};

const menClothingTitles: Record<string, string> = {
  outerwear: 'Мужская верхняя одежда',
  suits: 'Мужские костюмы и пиджаки',
  shirts: 'Мужские рубашки',
  tops: 'Мужские футболки и поло',
  jeans: 'Мужские джинсы',
  trousers: 'Мужские брюки',
  knitwear: 'Мужской трикотаж',
  lingerie: 'Мужское нижнее бельё и домашняя одежда',
  sportswear: 'Мужская спортивная одежда',
};

const womenShoesTitles: Record<string, string> = {
  shoes: 'Женские туфли и лодочки',
  boots: 'Женские ботильоны и сапоги',
  flats: 'Женские балетки, лоферы, мюли, эспадрильи и сабо',
  sandals: 'Женские сандалии и босоножки',
  sneakers: 'Женские кроссовки, кеды, слипоны и спортивная обувь',
  homeshoes: 'Женская домашняя и медицинская обувь',
};

const menShoesTitles: Record<string, string> = {
  sneakers: 'Мужские кроссовки, кеды и слипоны',
  boots: 'Мужские ботинки, сапоги, угги и унты',
  shoes: 'Мужские туфли, лоферы, мокасины и эспадрильи',
  sandals: 'Мужские сандалии и шлёпанцы',
  homeshoes: 'Мужская домашняя обувь',
};

function sizeChartJsonFileSlug(key: string): string {
  return key === 'homeshoes' ? 'home-shoes' : key;
}

/** Ключи state → файл slug (отдельные таблицы для мужской линии). */
function sizeChartSlugForFetchKey(key: string): string {
  switch (key) {
    case 'outerwearMen':
      return 'outerwear-men';
    case 'suitsMen':
      return 'suits-men';
    case 'topsMen':
      return 'tops-men';
    case 'jeansMen':
      return 'jeans-men';
    case 'trousersMen':
      return 'trousers-men';
    case 'knitwearMen':
      return 'knitwear-men';
    case 'sportswearMen':
      return 'sportswear-men';
    default:
      return sizeChartJsonFileSlug(key);
  }
}

const menSplitChartStateKeys = [
  'outerwearMen',
  'suitsMen',
  'topsMen',
  'jeansMen',
  'trousersMen',
  'knitwearMen',
  'sportswearMen',
] as const;

export default function SizesPage() {
  const [chartData, setChartData] = useState<Record<string, Record<string, string>[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const keys = [
      ...new Set([
        ...womenClothingKeys,
        ...menClothingKeys,
        ...womenShoesKeys,
        ...menShoesKeys,
        'bags',
        ...menSplitChartStateKeys,
      ]),
    ];
    const fetchChart = async (key: string) => {
      setLoading((prev) => ({ ...prev, [key]: true }));
      try {
        const slug = sizeChartSlugForFetchKey(key);
        const res = await fetch(`/data/size-chart-${slug}.json`);
        if (res.ok) {
          const data = (await res.json()) as Record<string, string>[];
          setChartData((prev) => ({ ...prev, [key]: data }));
        }
      } catch {
        // нет данных — используем production params
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }));
      }
    };
    keys.forEach(fetchChart);
  }, []);

  const renderClothingSection = (gender: 'women' | 'men') => {
    const keys = gender === 'women' ? womenClothingKeys : menClothingKeys;
    const titles = gender === 'women' ? womenClothingTitles : menClothingTitles;
    const fallbackCat = getCat(gender === 'women' ? 'women-apparel' : 'men-apparel');

    return (
      <div className="space-y-6">
        <SizeChartTable
          data={catalogCoverageAsRows(
            gender === 'women' ? womenApparelCoverageRows : menApparelCoverageRows
          )}
          title={
            gender === 'women'
              ? 'Сводка: группы каталога одежды → числовые таблицы (женские)'
              : 'Сводка: группы каталога одежды → числовые таблицы (мужские)'
          }
          headerOverlay={catalogCoverageHeaderOverlay}
        />
        {keys.map((key) => {
          if (key === 'shirts') {
            const shirtData = gender === 'men' ? sizeChartDataShirtsMen : sizeChartDataShirtsWomen;
            return <SizeChartTable key={key} data={shirtData} title={titles[key]} />;
          }
          const menChartDataKey: Partial<Record<string, string>> = {
            outerwear: 'outerwearMen',
            suits: 'suitsMen',
            tops: 'topsMen',
            jeans: 'jeansMen',
            trousers: 'trousersMen',
            knitwear: 'knitwearMen',
            sportswear: 'sportswearMen',
          };
          const chartKey = gender === 'men' ? (menChartDataKey[key] ?? key) : key;
          const data = chartData[chartKey];
          const isLoading = loading[chartKey];
          if (isLoading) {
            return <SizeChartTable key={key} data={[]} title={titles[key]} loading />;
          }
          if (data && data.length > 0) {
            return <SizeChartTable key={key} data={data} title={titles[key]} />;
          }
          return (
            <ProductionParamsTable
              key={key}
              label={titles[key]}
              sizeScales={fallbackCat.sizeScales}
            />
          );
        })}
      </div>
    );
  };

  const renderShoesSection = (gender: 'women' | 'men') => {
    const keys = gender === 'women' ? womenShoesKeys : menShoesKeys;
    const titles = gender === 'women' ? womenShoesTitles : menShoesTitles;
    const fallbackCat = getCat(gender === 'women' ? 'women-shoes' : 'men-shoes');

    return (
      <div className="space-y-6">
        <SizeChartTable
          data={catalogCoverageAsRows(
            gender === 'women' ? womenFootwearCoverageRows : menFootwearCoverageRows
          )}
          title={
            gender === 'women'
              ? 'Сводка: группы каталога обуви → числовые таблицы (женские)'
              : 'Сводка: группы каталога обуви → числовые таблицы (мужские)'
          }
          headerOverlay={catalogCoverageHeaderOverlay}
        />
        {keys.map((key) => {
          const data = chartData[key];
          if (data && data.length > 0) {
            return (
              <SizeChartTable key={key} data={data} title={titles[key]} loading={loading[key]} />
            );
          }
          return (
            <ProductionParamsTable
              key={key}
              label={titles[key]}
              sizeScales={fallbackCat.sizeScales}
            />
          );
        })}
      </div>
    );
  };

  return (
    <CabinetPageContent maxWidth="5xl" className="px-4 py-6 pb-16 pb-24 sm:px-6">
      <header className="mb-8">
        <h1 className="font-headline text-sm font-bold md:text-base">Размерные сетки</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Полные таблицы размерных сеток по гендеру и категориям. Вкладки «Женские» и «Мужские» — по
          колонкам аудитории <strong>Ж</strong> и <strong>М</strong> справочника категорий;
          «Детские» — сегментам <strong>Мл</strong>, <strong>Дв</strong>, <strong>Нв</strong>.
        </p>
      </header>

      <Tabs defaultValue="women" className="space-y-6">
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
          <TabsTrigger
            value="women"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Женские
          </TabsTrigger>
          <TabsTrigger
            value="men"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Мужские
          </TabsTrigger>
          <TabsTrigger
            value="kids"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Детские
          </TabsTrigger>
          <TabsTrigger
            value="lifestyle"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            Дом · Красота
          </TabsTrigger>
        </TabsList>

        {/* ЖЕНСКИЕ */}
        <TabsContent value="women" className={cabinetSurface.cabinetProfileTabPanel}>
          <Tabs defaultValue="clothing" className="space-y-6">
            {/* cabinetSurface v1 */}
            <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
              <TabsTrigger
                value="clothing"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                <Shirt className="mr-2 h-4 w-4" />
                Одежда
              </TabsTrigger>
              <TabsTrigger
                value="shoes"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                <Footprints className="mr-2 h-4 w-4" />
                Обувь
              </TabsTrigger>
              <TabsTrigger
                value="bags"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Сумки
              </TabsTrigger>
              <TabsTrigger
                value="accessories"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                <LandPlot className="mr-2 h-4 w-4" />
                Аксессуары
              </TabsTrigger>
            </TabsList>
            <TabsContent value="clothing" className={cabinetSurface.cabinetProfileTabPanel}>
              {renderClothingSection('women')}
            </TabsContent>
            <TabsContent value="shoes" className={cabinetSurface.cabinetProfileTabPanel}>
              {renderShoesSection('women')}
            </TabsContent>
            <TabsContent value="bags" className={cabinetSurface.cabinetProfileTabPanel}>
              <SizeChartTable
                data={catalogCoverageAsRows(womenBagsCoverageRows)}
                title="Сводка: группы каталога сумок → числовые таблицы (женские)"
                headerOverlay={catalogCoverageHeaderOverlay}
              />
              {chartData.bags && chartData.bags.length > 0 ? (
                <SizeChartTable
                  data={chartData.bags}
                  title="Женские сумки"
                  loading={loading.bags}
                  headerOverlay={sizeChartBagsHeaderOverlay}
                />
              ) : (
                <ProductionParamsTable
                  label="Женские сумки"
                  sizeScales={getCat('women-bags').sizeScales}
                />
              )}
            </TabsContent>
            <TabsContent value="accessories" className={cabinetSurface.cabinetProfileTabPanel}>
              <p className="text-xs text-muted-foreground">
                Базовые таблицы ниже совпадают с мужской вкладкой; женские головные уборы, мех и
                сводная по Alpha — отдельными блоками, затем шкалы Цеха.
              </p>
              <SizeChartTable
                data={catalogCoverageAsRows(womenAccessoriesCoverageRows)}
                title="Сводка: группы каталога аксессуаров и головных уборов → таблицы (женские)"
                headerOverlay={catalogCoverageHeaderOverlay}
              />
              {accessoryCategories.map(({ title, data }) => (
                <SizeChartTable key={title} data={data} title={title} />
              ))}
              <SizeChartTable
                data={asSizeRows(sizeChartDataAccessoriesSummaryWomen)}
                title="Аксессуары (женские) — сводная Alpha → ориентиры"
                headerOverlay={accessoriesSummaryHeaderOverlay}
              />
              <SizeChartTable
                data={asSizeRows(sizeChartDataHeadwearWomen)}
                title="Головные уборы (женские) — габариты по размеру"
                headerOverlay={headwearChartHeaderOverlay}
              />
              <SizeChartTable
                data={asSizeRows(
                  sizeChartDataHeadwearWomenStyleGuide as unknown as Record<string, unknown>[]
                )}
                title="Головные уборы (женские) — фасоны: доп. габариты к таблице размеров"
                headerOverlay={headwearChartHeaderOverlay}
              />
              <SizeChartTable
                data={asSizeRows(sizeChartDataFurWomen)}
                title="Меховые изделия (женские) — типовые мерки, см"
              />
              <ProductionParamsTable
                label="Женские головные уборы"
                sizeScales={getCat('women-headwear').sizeScales}
              />
              <CategoryMetadataCard catId="women-headwear" />
              <ProductionParamsTable
                label="Женские меховые изделия"
                sizeScales={getCat('women-fur').sizeScales}
              />
              <CategoryMetadataCard catId="women-fur" />
              <ProductionParamsTable
                label="Женские аксессуары"
                sizeScales={getCat('women-accessories').sizeScales}
              />
              <CategoryMetadataCard catId="women-accessories" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* МУЖСКИЕ */}
        <TabsContent value="men" className={cabinetSurface.cabinetProfileTabPanel}>
          <Tabs defaultValue="clothing" className="space-y-6">
            {/* cabinetSurface v1 */}
            <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
              <TabsTrigger
                value="clothing"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                <Shirt className="mr-2 h-4 w-4" />
                Одежда
              </TabsTrigger>
              <TabsTrigger
                value="shoes"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                <Footprints className="mr-2 h-4 w-4" />
                Обувь
              </TabsTrigger>
              <TabsTrigger
                value="bags"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Сумки
              </TabsTrigger>
              <TabsTrigger
                value="accessories"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                <LandPlot className="mr-2 h-4 w-4" />
                Аксессуары
              </TabsTrigger>
            </TabsList>
            <TabsContent value="clothing" className={cabinetSurface.cabinetProfileTabPanel}>
              {renderClothingSection('men')}
            </TabsContent>
            <TabsContent value="shoes" className={cabinetSurface.cabinetProfileTabPanel}>
              {renderShoesSection('men')}
            </TabsContent>
            <TabsContent value="bags" className={cabinetSurface.cabinetProfileTabPanel}>
              <SizeChartTable
                data={catalogCoverageAsRows(menBagsCoverageRows)}
                title="Сводка: группы каталога сумок → числовые таблицы (мужские)"
                headerOverlay={catalogCoverageHeaderOverlay}
              />
              {chartData.bags && chartData.bags.length > 0 ? (
                <SizeChartTable
                  data={chartData.bags}
                  title="Мужские сумки"
                  loading={loading.bags}
                  headerOverlay={sizeChartBagsHeaderOverlay}
                />
              ) : (
                <ProductionParamsTable
                  label="Мужские сумки"
                  sizeScales={getCat('men-bags').sizeScales}
                />
              )}
            </TabsContent>
            <TabsContent value="accessories" className={cabinetSurface.cabinetProfileTabPanel}>
              <p className="text-xs text-muted-foreground">
                Базовые таблицы совпадают с женской вкладкой; мужские шапки, мех и сводная Alpha —
                ниже, затем шкалы Цеха.
              </p>
              <SizeChartTable
                data={catalogCoverageAsRows(menAccessoriesCoverageRows)}
                title="Сводка: группы каталога аксессуаров и головных уборов → таблицы (мужские)"
                headerOverlay={catalogCoverageHeaderOverlay}
              />
              {accessoryCategories.map(({ title, data }) => (
                <SizeChartTable key={title} data={data} title={title} />
              ))}
              <SizeChartTable
                data={asSizeRows(sizeChartDataAccessoriesSummaryMen)}
                title="Аксессуары (мужские) — сводная Alpha → ориентиры"
                headerOverlay={accessoriesSummaryHeaderOverlay}
              />
              <SizeChartTable
                data={asSizeRows(sizeChartDataHeadwearMen)}
                title="Головные уборы (мужские) — габариты по размеру"
                headerOverlay={headwearChartHeaderOverlay}
              />
              <SizeChartTable
                data={asSizeRows(sizeChartDataFurMen)}
                title="Меховые изделия (мужские) — типовые мерки, см"
              />
              <ProductionParamsTable
                label="Мужские головные уборы"
                sizeScales={getCat('men-headwear').sizeScales}
              />
              <CategoryMetadataCard catId="men-headwear" />
              <ProductionParamsTable
                label="Мужские меховые изделия"
                sizeScales={getCat('men-fur').sizeScales}
              />
              <CategoryMetadataCard catId="men-fur" />
              <ProductionParamsTable
                label="Мужские аксессуары"
                sizeScales={getCat('men-accessories').sizeScales}
              />
              <CategoryMetadataCard catId="men-accessories" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ДЕТСКИЕ */}
        <TabsContent value="kids" className={cabinetSurface.cabinetProfileTabPanel}>
          <KidsSizesSection />
        </TabsContent>

        <TabsContent value="lifestyle" className={cabinetSurface.cabinetProfileTabPanel}>
          <LifestyleSizesSection />
        </TabsContent>
      </Tabs>
    </CabinetPageContent>
  );
}
