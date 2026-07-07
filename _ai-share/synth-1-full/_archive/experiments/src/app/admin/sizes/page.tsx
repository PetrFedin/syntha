'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Info,
  Footprints,
  Shirt,
  ShoppingBag,
  LandPlot,
  Briefcase,
  Backpack,
} from 'lucide-react';
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
import dynamic from 'next/dynamic';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

import { sizeChartDataShirts } from '@/lib/sizes';
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
} from '@/lib/accessory-sizes';
import { Skeleton } from '@/components/ui/skeleton';

const FitGuideDialog = dynamic(() =>
  import('@/components/admin/fit-guide-dialog').then((mod) => mod.FitGuideDialog)
);
const FitGuideOuterwearDialog = dynamic(() =>
  import('@/components/admin/fit-guide-outerwear-dialog').then((mod) => mod.FitGuideOuterwearDialog)
);
const FitGuideSuitsDialog = dynamic(() =>
  import('@/components/admin/fit-guide-suits-dialog').then((mod) => mod.FitGuideSuitsDialog)
);
const FitGuideSkirtsDialog = dynamic(() =>
  import('@/components/admin/fit-guide-skirts-dialog').then((mod) => mod.FitGuideSkirtsDialog)
);
const FitGuideShirtsDialog = dynamic(() =>
  import('@/components/admin/fit-guide-shirts-dialog').then((mod) => mod.FitGuideShirtsDialog)
);
const FitGuideTopsDialog = dynamic(() =>
  import('@/components/admin/fit-guide-tops-dialog').then((mod) => mod.FitGuideTopsDialog)
);
const FitGuideJeansDialog = dynamic(() =>
  import('@/components/admin/fit-guide-jeans-dialog').then((mod) => mod.FitGuideJeansDialog)
);
const FitGuideTrousersDialog = dynamic(() =>
  import('@/components/admin/fit-guide-trousers-dialog').then((mod) => mod.FitGuideTrousersDialog)
);
const FitGuideKnitwearDialog = dynamic(() =>
  import('@/components/admin/fit-guide-knitwear-dialog').then((mod) => mod.FitGuideKnitwearDialog)
);
const FitGuideLingerieDialog = dynamic(() =>
  import('@/components/admin/fit-guide-lingerie-dialog').then((mod) => mod.FitGuideLingerieDialog)
);
const FitGuideSportswearDialog = dynamic(() =>
  import('@/components/admin/fit-guide-sportswear-dialog').then(
    (mod) => mod.FitGuideSportswearDialog
  )
);
const FitGuideBeachwearDialog = dynamic(() =>
  import('@/components/admin/fit-guide-beachwear-dialog').then((mod) => mod.FitGuideBeachwearDialog)
);
const FitGuideMaternityDialog = dynamic(() =>
  import('@/components/admin/fit-guide-maternity-dialog').then((mod) => mod.FitGuideMaternityDialog)
);
const FitGuideAdaptiveDialog = dynamic(() =>
  import('@/components/admin/fit-guide-adaptive-dialog').then((mod) => mod.FitGuideAdaptiveDialog)
);
const FitGuideShoesDialog = dynamic(() =>
  import('@/components/admin/fit-guide-shoes-dialog').then((mod) => mod.FitGuideShoesDialog)
);
const FitGuideBootsDialog = dynamic(() =>
  import('@/components/admin/fit-guide-boots-dialog').then((mod) => mod.FitGuideBootsDialog)
);
const FitGuideFlatsDialog = dynamic(() =>
  import('@/components/admin/fit-guide-flats-dialog').then((mod) => mod.FitGuideFlatsDialog)
);
const FitGuideSandalsDialog = dynamic(() =>
  import('@/components/admin/fit-guide-sandals-dialog').then((mod) => mod.FitGuideSandalsDialog)
);
const FitGuideSneakersDialog = dynamic(() =>
  import('@/components/admin/fit-guide-sneakers-dialog').then((mod) => mod.FitGuideSneakersDialog)
);
const FitGuideHomeShoesDialog = dynamic(() =>
  import('@/components/admin/fit-guide-home-shoes-dialog').then(
    (mod) => mod.FitGuideHomeShoesDialog
  )
);
const FitGuideBagsDialog = dynamic(() =>
  import('@/components/admin/fit-guide-bags-dialog').then((mod) => mod.FitGuideBagsDialog)
);
const FitGuideAccessoriesDialog = dynamic(() =>
  import('@/components/admin/fit-guide-accessories-dialog').then(
    (mod) => mod.FitGuideAccessoriesDialog
  )
);
const FitGuideMiscDialog = dynamic(() =>
  import('@/components/admin/fit-guide-misc-dialog').then((mod) => mod.FitGuideMiscDialog)
);

type BagType =
  | 'Mini / Micro'
  | 'Clutch'
  | 'Crossbody'
  | 'Satchel'
  | 'Tote'
  | 'Shopper'
  | 'Hobo'
  | 'Bucket'
  | 'Backpack'
  | 'Brief / Office'
  | 'Belt / Waist Bag'
  | 'Sling / Cross-sling Bag'
  | 'Travel / Weekender / Duffel'
  | 'Cabin / Suitcase (жёсткий)'
  | 'Vanity / Cosmetic Case'
  | 'Laptop / Tech Bag'
  | 'Gym / Sport Bag';
type AccessoryType =
  | 'Головные уборы'
  | 'Перчатки'
  | 'Ремни'
  | 'Шарфы, палантины, платки'
  | 'Очки'
  | 'Кольца'
  | 'Часы'
  | 'Носки и чулки'
  | 'Кошельки'
  | 'Зонты';

const headerDescriptions: Record<string, { title: string; tooltip: string }> = {
  IT: { title: 'IT', tooltip: 'Итальянский размер' },
  FR: { title: 'FR', tooltip: 'Французский размер' },
  EU: { title: 'EU', tooltip: 'Европейский размер' },
  US: { title: 'US', tooltip: 'Американский размер' },
  UK: { title: 'UK', tooltip: 'Британский размер' },
  RU: { title: 'RU', tooltip: 'Российский размер' },
  JP: { title: 'JP', tooltip: 'Японский размер' },
  Alpha: { title: 'Alpha', tooltip: 'Буквенное обозначение' },
  height: { title: 'Рост', tooltip: 'Рекомендуемый рост (см)' },
  bust: { title: 'Грудь', tooltip: 'Обхват груди (см)' },
  underbust: { title: 'Под грудью', tooltip: 'Обхват под грудью (см)' },
  waist: { title: 'Талия', tooltip: 'Обхват талии (см)' },
  hips: { title: 'Бёдра', tooltip: 'Обхват бёдер (см)' },
  heightBust: { title: 'Выс. груди', tooltip: 'Высота груди (см)' },
  back: { title: 'Дл. спины', tooltip: 'Длина спины до талии (см)' },
  length: { title: 'Длина', tooltip: 'Длина изделия (см)' },
  shoulder: { title: 'Плечи', tooltip: 'Ширина плеч (см)' },
  sleeve: { title: 'Рукав', tooltip: 'Длина рукава (см)' },
  armCircumference: { title: 'Обх. руки', tooltip: 'Обхват руки (см)' },
  rise: { title: 'Посадка', tooltip: 'Высота посадки (rise) (см)' },
  inseam: { title: 'Вн. шов', tooltip: 'Внутренняя длина ноги (inseam) (см)' },
  thighCircumference: { title: 'Обх. бедра', tooltip: 'Обхват бедра на 20 см ниже (см)' },
  kneeWidth: { title: 'Колено', tooltip: 'Ширина в колене (см)' },
  braSizeEU: { title: 'Размер EU (бельё)', tooltip: 'Диапазон бельевых размеров (EU)' },
  braSizeUKUS: { title: 'Размер UK/US (бельё)', tooltip: 'Диапазон бельевых размеров (UK/US)' },
  difference: { title: 'Разница', tooltip: 'Разница между обхватом груди и под грудью (см)' },
  cupEU: { title: 'Cup (EU)', tooltip: 'Европейский размер чашки' },
  cupUKUS: { title: 'Cup (UK/US)', tooltip: 'Английский/американский размер чашки' },
  cupRU: { title: 'Cup (RU)', tooltip: 'Российский размер чашки' },
  hipHeight: { title: 'Выс. бедра', tooltip: 'Высота бедра (см)' },
  seatingAllowance: { title: 'Допуск (сидя)', tooltip: 'Допуск для сидячего положения (см)' },
  footLength: { title: 'Дл. стопы', tooltip: 'Длина стопы (см)' },
  width: { title: 'Ширина', tooltip: 'Ширина стопы (мм)' },
  fullness: { title: 'Полнота', tooltip: 'Полнота стопы' },
  heel: { title: 'Каблук', tooltip: 'Высота каблука (мм)' },
  drop: { title: 'Перепад', tooltip: 'Перепад высоты между пяткой и носком (мм)' },
  sole: { title: 'Подошва', tooltip: 'Толщина подошвы (мм)' },
  weight: { title: 'Вес', tooltip: 'Вес (г)' },
  arch: { title: 'Свод стопы', tooltip: 'Тип свода стопы' },
  fit: { title: 'Посадка', tooltip: 'Тип посадки' },
  comfortIndex: { title: 'Комфорт', tooltip: 'Индекс комфорта' },
  flexIndex: { title: 'Гибкость', tooltip: 'Индекс гибкости' },
  shaftHeight: { title: 'Выс. голенища', tooltip: 'Высота голенища (см)' },
  shaftGirth: { title: 'Обх. голенища', tooltip: 'Обхват голенища (см)' },
  bellyAllowance: { title: 'Допуск живот', tooltip: 'Допуск для живота (см)' },
  comment: { title: 'Комментарий', tooltip: 'Комментарий' },
  type: { title: 'Тип', tooltip: 'Тип изделия' },
  usableHeight: { title: 'Высота', tooltip: 'Высота полезная (до застёжки) (см)' },
  openingWidth: { title: 'Вход', tooltip: 'Ширина входа / горловины (см)' },
  bottomLength: { title: 'Дл. дна', tooltip: 'Длина дна (см)' },
  bottomWidth: { title: 'Шир. дна', tooltip: 'Ширина дна (см)' },
  handleDrop: { title: 'Выс. ручки', tooltip: 'Высота ручки (handle drop) (см)' },
  strapLength: { title: 'Дл. ремня', tooltip: 'Длина ремня / пояса (мин–макс) (см)' },
  strapStep: { title: 'Шаг рег.', tooltip: 'Шаг регулировки (см)' },
  strapWidth: { title: 'Шир. ремня', tooltip: 'Ширина ремня / пояса (см)' },
  strapThickness: { title: 'Толщ. ремня', tooltip: 'Толщина ремня (мм)' },
  fastenerDistance: { title: 'Крепления', tooltip: 'Расстояние между креплениями (см)' },
  internalCompartments: { title: 'Внутр. отсеки', tooltip: 'Внутренние отсеки (Ш×В×Г, см)' },
  laptopCompartment: { title: 'Отсек ноутбук', tooltip: 'Отсек под ноутбук (Ш×В×Г, см)' },
  sideFolds: { title: 'Бок. складки', tooltip: 'Боковые складки / расширение (см)' },
  drawstringPerimeter: { title: 'Периметр', tooltip: 'Периметр кулиски (откр.–затян.) (см)' },
  bottomDiameter: { title: 'Ø дна', tooltip: 'Диаметр дна (если круглый) (см)' },
  weightPair: { title: 'Вес пары (г)', tooltip: 'Вес пары' },
  lensWidth: { title: 'Шир. линзы', tooltip: 'Ширина линзы (мм)' },
  lensHeight: { title: 'Выс. линзы', tooltip: 'Высота линзы (мм)' },
  bridgeWidth: { title: 'Перемычка', tooltip: 'Ширина перемычки (мм)' },
  templeLength: { title: 'Дл. дужки', tooltip: 'Длина дужки (мм)' },
  frameWidth: { title: 'Шир. оправы', tooltip: 'Ширина оправы (мм)' },
  diameter: { title: 'Диаметр', tooltip: 'Диаметр (мм)' },
  circumference: { title: 'Окружность', tooltip: 'Окружность (мм)' },
  caseDiameter: { title: 'Ø корпуса', tooltip: 'Диаметр корпуса (мм)' },
  caseThickness: { title: 'Толщина', tooltip: 'Толщина корпуса (мм)' },
  strapLength_watch: { title: 'Дл. ремня', tooltip: 'Длина ремня (мм)' },
  strapWidth_watch: { title: 'Шир. ремня', tooltip: 'Ширина ремня (мм)' },
  shaftLength: { title: 'Дл. голенища', tooltip: 'Длина голенища (см)' },
  thickness: { title: 'Толщина', tooltip: 'Толщина (den/мм)' },
  domeDiameter: { title: 'Ø купола', tooltip: 'Диаметр купола (см)' },
  ribs: { title: 'Спицы', tooltip: 'Количество спиц (шт.)' },
  depth: { title: 'Глубина', tooltip: 'Глубина (см)' },
  leatherThickness: { title: 'Толщ. кожи', tooltip: 'Толщина кожи (мм)' },
  holes: { title: 'Отверстия', tooltip: 'Количество отверстий (шт.)' },
  firstHoleDistance: { title: 'До 1-го отв.', tooltip: 'Расстояние до первого отверстия (см)' },
  cuff: { title: 'Манжета', tooltip: 'Ширина манжеты (см)' },
  gloveLength: { title: 'Дл. перчатки', tooltip: 'Длина перчатки (см)' },
  palmCircumference: { title: 'Обх. ладони', tooltip: 'Окружность ладони (см)' },
  headCircumference: { title: 'Обх. головы', tooltip: 'Обхват головы (см)' },
  domeDepth: { title: 'Глуб. купола', tooltip: 'Глубина купола (см)' },
  crownDiameter: { title: 'Ø тульи', tooltip: 'Диаметр тульи (см)' },
  brimWidth: { title: 'Шир. полей', tooltip: 'Ширина полей (см)' },
};

const menClothingCategories = [
  { title: 'Мужская верхняя одежда', data: [], dialog: 'outerwear' },
  { title: 'Мужские костюмы и пиджаки', data: [], dialog: 'suits' },
  { title: 'Мужские рубашки', data: [], dialog: 'shirts' },
  { title: 'Мужские футболки и поло', data: [], dialog: 'tops' },
  { title: 'Мужские джинсы', data: [], dialog: 'jeans' },
  { title: 'Мужские брюки', data: [], dialog: 'trousers' },
  { title: 'Мужской трикотаж', data: [], dialog: 'knitwear' },
  { title: 'Мужское нижнее бельё и домашняя одежда', data: [], dialog: 'lingerie' },
  { title: 'Мужская спортивная одежда', data: [], dialog: 'sportswear' },
];

const accessoriesCategories = [
  {
    title: '👒 Головные уборы',
    data: sizeChartDataHats,
    dialog: 'accessories',
    accessoryKey: 'Головные уборы',
  },
  {
    title: '🧤 Перчатки',
    data: sizeChartDataGloves,
    dialog: 'accessories',
    accessoryKey: 'Перчатки',
  },
  { title: '🧢 Ремни', data: sizeChartDataBelts, dialog: 'accessories', accessoryKey: 'Ремни' },
  {
    title: '🧣 Шарфы, палантины, платки',
    data: sizeChartDataScarves,
    dialog: 'accessories',
    accessoryKey: 'Шарфы, палантины, платки',
  },
  {
    title: '🕶 Очки',
    data: sizeChartDataGlasses,
    dialog: 'accessories',
    accessoryKey: 'Очки (оптика и солнцезащита)',
  },
  {
    title: '💍 Кольца',
    data: sizeChartDataRings,
    dialog: 'accessories',
    accessoryKey: 'Украшения (кольца, браслеты, цепи, серьги)',
  },
  { title: '⌚ Часы', data: sizeChartDataWatches, dialog: 'accessories', accessoryKey: 'Часы' },
  {
    title: '🧦 Носки и чулки',
    data: sizeChartDataSocks,
    dialog: 'accessories',
    accessoryKey: 'Носки и чулки',
  },
  {
    title: '👜 Кошельки',
    data: sizeChartDataWallets,
    dialog: 'accessories',
    accessoryKey: 'Кошельки и кардхолдеры',
  },
  { title: '☂️ Зонты', data: sizeChartDataUmbrellas, dialog: 'accessories', accessoryKey: 'Зонты' },
];

const miscCategories = [
  {
    title: '🧴 Косметички / несессеры',
    dialog: 'misc',
    miscKey: 'Косметички / несессеры / travel-поуч',
  },
  { title: '🧳 Чемоданы / дорожные сумки', dialog: 'misc', miscKey: 'Чемоданы / дорожные сумки' },
];

const menShoesCategories = [
  { title: 'Мужские кроссовки и кеды', data: [], dialog: 'sneakers' },
  { title: 'Мужские ботинки и сапоги', data: [], dialog: 'boots' },
  { title: 'Мужские туфли и лоферы', data: [], dialog: 'shoes' },
];

const getHeaders = (data: any[]): string[] => {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
};

export default function SizesPage() {
  const [activeTab, setActiveTab] = useState('women');
  const [activeSection, setActiveSection] = useState('clothing');
  const [sizeChartDataOuterwear, setSizeChartDataOuterwear] = useState<any[]>([]);
  const [sizeChartDataSuits, setSizeChartDataSuits] = useState<any[]>([]);
  const [sizeChartDataDresses, setSizeChartDataDresses] = useState<any[]>([]);
  const [sizeChartDataTops, setSizeChartDataTops] = useState<any[]>([]);
  const [sizeChartDataJeans, setSizeChartDataJeans] = useState<any[]>([]);
  const [sizeChartDataSkirts, setSizeChartDataSkirts] = useState<any[]>([]);
  const [sizeChartDataTrousers, setSizeChartDataTrousers] = useState<any[]>([]);
  const [sizeChartDataKnitwear, setSizeChartDataKnitwear] = useState<any[]>([]);
  const [sizeChartDataLingerie, setSizeChartDataLingerie] = useState<any[]>([]);
  const [sizeChartDataSportswear, setSizeChartDataSportswear] = useState<any[]>([]);
  const [sizeChartDataBeachwear, setSizeChartDataBeachwear] = useState<any[]>([]);
  const [sizeChartDataMaternity, setSizeChartDataMaternity] = useState<any[]>([]);
  const [sizeChartDataAdaptive, setSizeChartDataAdaptive] = useState<any[]>([]);
  const [sizeChartDataShoes, setSizeChartDataShoes] = useState<any[]>([]);
  const [sizeChartDataBoots, setSizeChartDataBoots] = useState<any[]>([]);
  const [sizeChartDataFlats, setSizeChartDataFlats] = useState<any[]>([]);
  const [sizeChartDataSandals, setSizeChartDataSandals] = useState<any[]>([]);
  const [sizeChartDataSneakers, setSizeChartDataSneakers] = useState<any[]>([]);
  const [sizeChartDataHomeShoes, setSizeChartDataHomeShoes] = useState<any[]>([]);
  const [sizeChartDataBags, setSizeChartDataBags] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState({
    outerwear: true,
    suits: true,
    dresses: true,
    tops: true,
    jeans: true,
    skirts: true,
    trousers: true,
    knitwear: true,
    lingerie: true,
    sportswear: true,
    beachwear: true,
    maternity: true,
    adaptive: true,
    shoes: true,
    boots: true,
    flats: true,
    sandals: true,
    sneakers: true,
    homeshoes: true,
    bags: true,
  });

  // Dialog states
  const [dialogStates, setDialogStates] = useState<Record<string, boolean>>({});
  const [selectedBagType, setSelectedBagType] = useState<BagType | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryType | null>(null);
  const [selectedMiscCategory, setSelectedMiscCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (
      url: string,
      setData: (data: any[]) => void,
      key: keyof typeof isLoading
    ) => {
      setIsLoading((prev) => ({ ...prev, [key]: true }));
      try {
        const response = await fetch(url);
        const data = (await response.json()) as any[];
        setData(data);
      } catch (error) {
        console.error(`Failed to fetch ${key} size data`, error);
      } finally {
        setIsLoading((prev) => ({ ...prev, [key]: false }));
      }
    };
    fetchData('/data/size-chart-outerwear.json', setSizeChartDataOuterwear, 'outerwear');
    fetchData('/data/size-chart-suits.json', setSizeChartDataSuits, 'suits');
    fetchData('/data/size-chart-dresses.json', setSizeChartDataDresses, 'dresses');
    fetchData('/data/size-chart-tops.json', setSizeChartDataTops, 'tops');
    fetchData('/data/size-chart-jeans.json', setSizeChartDataJeans, 'jeans');
    fetchData('/data/size-chart-skirts.json', setSizeChartDataSkirts, 'skirts');
    fetchData('/data/size-chart-trousers.json', setSizeChartDataTrousers, 'trousers');
    fetchData('/data/size-chart-knitwear.json', setSizeChartDataKnitwear, 'knitwear');
    fetchData('/data/size-chart-lingerie.json', setSizeChartDataLingerie, 'lingerie');
    fetchData('/data/size-chart-sportswear.json', setSizeChartDataSportswear, 'sportswear');
    fetchData('/data/size-chart-beachwear.json', setSizeChartDataBeachwear, 'beachwear');
    fetchData('/data/size-chart-maternity.json', setSizeChartDataMaternity, 'maternity');
    fetchData('/data/size-chart-adaptive.json', setSizeChartDataAdaptive, 'adaptive');
    fetchData('/data/size-chart-shoes.json', setSizeChartDataShoes, 'shoes');
    fetchData('/data/size-chart-boots.json', setSizeChartDataBoots, 'boots');
    fetchData('/data/size-chart-flats.json', setSizeChartDataFlats, 'flats');
    fetchData('/data/size-chart-sandals.json', setSizeChartDataSandals, 'sandals');
    fetchData('/data/size-chart-sneakers.json', setSizeChartDataSneakers, 'sneakers');
    fetchData('/data/size-chart-home-shoes.json', setSizeChartDataHomeShoes, 'homeshoes');
    fetchData('/data/size-chart-bags.json', setSizeChartDataBags, 'bags');
  }, []);

  const openDialog = (dialogKey: string, miscKey?: string, type?: string) => {
    if (type === 'bags' && miscKey) {
      setSelectedBagType(miscKey as BagType);
    } else if (type === 'accessories' && miscKey) {
      setSelectedAccessory(miscKey as AccessoryType);
    } else if (type === 'misc' && miscKey) {
      setSelectedMiscCategory(miscKey);
    }
    setDialogStates((prev) => ({ ...prev, [dialogKey]: true }));
  };

  const closeDialog = (dialogKey: string) => {
    setDialogStates((prev) => ({ ...prev, [dialogKey]: false }));
  };

  const womenClothingCategories = [
    {
      title: 'Женская верхняя одежда',
      data: sizeChartDataOuterwear,
      dialog: 'outerwear',
      loading: isLoading.outerwear,
    },
    {
      title: 'Женские костюмы и жакеты',
      data: sizeChartDataSuits,
      dialog: 'suits',
      loading: isLoading.suits,
    },
    {
      title: 'Женские платья и сарафаны',
      data: sizeChartDataDresses,
      dialog: 'dresses',
      loading: isLoading.dresses,
    },
    {
      title: 'Женские юбки',
      data: sizeChartDataSkirts,
      dialog: 'skirts',
      loading: isLoading.skirts,
    },
    { title: 'Женские рубашки и блузы', data: sizeChartDataShirts, dialog: 'shirts' },
    {
      title: 'Женские топы и футболки',
      data: sizeChartDataTops,
      dialog: 'tops',
      loading: isLoading.tops,
    },
    {
      title: 'Женские джинсы',
      data: sizeChartDataJeans,
      dialog: 'jeans',
      loading: isLoading.jeans,
    },
    {
      title: 'Женские брюки',
      data: sizeChartDataTrousers,
      dialog: 'trousers',
      loading: isLoading.trousers,
    },
    {
      title: 'Женский трикотаж',
      data: sizeChartDataKnitwear,
      dialog: 'knitwear',
      loading: isLoading.knitwear,
    },
    {
      title: 'Женское нижнее бельё и домашняя одежда',
      data: sizeChartDataLingerie,
      dialog: 'lingerie',
      loading: isLoading.lingerie,
    },
    {
      title: 'Женская спортивная одежда',
      data: sizeChartDataSportswear,
      dialog: 'sportswear',
      loading: isLoading.sportswear,
    },
    {
      title: 'Женская пляжная мода',
      data: sizeChartDataBeachwear,
      dialog: 'beachwear',
      loading: isLoading.beachwear,
    },
    {
      title: 'Женская одежда для беременных',
      data: sizeChartDataMaternity,
      dialog: 'maternity',
      loading: isLoading.maternity,
    },
    {
      title: '♿ Женская одежда для ограниченной подвижности',
      data: sizeChartDataAdaptive,
      dialog: 'adaptive',
      loading: isLoading.adaptive,
    },
  ];

  const womenShoesCategories = [
    {
      title: 'Женские туфли и лодочки',
      data: sizeChartDataShoes,
      dialog: 'shoes',
      loading: isLoading.shoes,
    },
    {
      title: 'Женские ботильоны и сапоги',
      data: sizeChartDataBoots,
      dialog: 'boots',
      loading: isLoading.boots,
    },
    {
      title: 'Женские балетки, лоферы и мюли',
      data: sizeChartDataFlats,
      dialog: 'flats',
      loading: isLoading.flats,
    },
    {
      title: 'Женские сандалии и босоножки',
      data: sizeChartDataSandals,
      dialog: 'sandals',
      loading: isLoading.sandals,
    },
    {
      title: 'Женские кроссовки и спортивная обувь',
      data: sizeChartDataSneakers,
      dialog: 'sneakers',
      loading: isLoading.sneakers,
    },
    {
      title: 'Женская домашняя и медицинская обувь',
      data: sizeChartDataHomeShoes,
      dialog: 'homeshoes',
      loading: isLoading.homeshoes,
    },
  ];

  const bagsCategories = [
    { title: 'Сумки', data: sizeChartDataBags, dialog: 'bags', loading: isLoading.bags },
  ];

  const renderCategoryCard = (cat: any, audience: 'women' | 'men') => {
    const headers = getHeaders(cat.data);
    const dialogKey = cat.dialog;

    const handleTitleClick = () => {
      if (cat.dialog) {
        openDialog(dialogKey);
      }
    };

    return (
      <Card key={cat.title}>
        <CardHeader>
          <button className="w-fit" onClick={handleTitleClick}>
            <CardTitle className="flex cursor-pointer items-center gap-2 hover:text-accent">
              {cat.title} <Info className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </button>
        </CardHeader>
        {cat.loading ? (
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        ) : cat.data && cat.data.length > 0 ? (
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {headerDescriptions[header]?.title || header}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{headerDescriptions[header]?.tooltip || header}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cat.data.map((row: any, rowIndex: number) => (
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
        ) : (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Данные для этой категории будут добавлены позже.
            </p>
          </CardContent>
        )}
      </Card>
    );
  };

  const renderBagCategoryCard = (audience: 'women' | 'men') => {
    const cat = bagsCategories[0];
    const headers = getHeaders(cat.data);

    const unisexBagTypes = [
      'Tote',
      'Shopper',
      'Backpack',
      'Brief / Office',
      'Belt / Waist Bag',
      'Sling / Cross-sling Bag',
      'Travel / Weekender / Duffel',
      'Laptop / Tech Bag',
      'Gym / Sport Bag',
    ];

    const bagsToShow =
      audience === 'men'
        ? cat.data.filter((row: any) => unisexBagTypes.includes(row.type))
        : cat.data;

    return (
      <Card key={cat.title}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Сумки</CardTitle>
        </CardHeader>
        {cat.loading ? (
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        ) : (
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => {
                    const headerInfo = headerDescriptions[header];
                    return (
                      <TableHead key={header}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>{headerInfo?.title || header}</TooltipTrigger>
                            <TooltipContent>
                              <p>{headerInfo?.tooltip || header}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bagsToShow.map((row: any, rowIndex: number) => (
                  <TableRow key={rowIndex}>
                    {headers.map((header) => (
                      <TableCell key={header} className="text-xs">
                        {header === 'type' ? (
                          <button
                            className="text-left font-medium underline hover:text-accent"
                            onClick={() => openDialog('bags', row['type'], 'bags')}
                          >
                            {row[header]}
                          </button>
                        ) : (
                          row[header]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    );
  };

  const renderContentForSection = (section: string, audience: 'women' | 'men') => {
    let categoriesToRender: any[] = [];

    if (audience === 'women') {
      switch (section) {
        case 'clothing':
          categoriesToRender = womenClothingCategories;
          break;
        case 'shoes':
          categoriesToRender = womenShoesCategories;
          break;
        case 'bags':
          return renderBagCategoryCard(audience);
        case 'accessories':
          categoriesToRender = accessoriesCategories;
          break;
        case 'misc':
          categoriesToRender = miscCategories;
          break;
        default:
          return null;
      }
    } else {
      // men
      switch (section) {
        case 'clothing':
          categoriesToRender = menClothingCategories;
          break;
        case 'shoes':
          categoriesToRender = menShoesCategories;
          break;
        case 'bags':
          return renderBagCategoryCard(audience);
        case 'accessories':
          categoriesToRender = accessoriesCategories;
          break;
        case 'misc':
          categoriesToRender = miscCategories;
          break;
        default:
          return null;
      }
    }

    return categoriesToRender.map((cat) => {
      if (cat.data) {
        return renderCategoryCard(cat, audience);
      }
      // For accessory and misc categories that don't have direct data but open a dialog
      return (
        <Card key={cat.title}>
          <CardHeader>
            <button
              className="w-fit"
              onClick={() => openDialog(cat.dialog, cat.accessoryKey || cat.miscKey, section)}
            >
              <CardTitle className="flex cursor-pointer items-center gap-2 hover:text-accent">
                {cat.title} <Info className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </button>
          </CardHeader>
        </Card>
      );
    });
  };

  const renderWomenContent = () => (
    <div className="space-y-6">
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'mb-4 h-auto min-w-0')}>
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
          <TabsTrigger
            value="misc"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Прочее
          </TabsTrigger>
        </TabsList>
        <TabsContent value="clothing" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('clothing', 'women')}
        </TabsContent>
        <TabsContent value="shoes" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('shoes', 'women')}
        </TabsContent>
        <TabsContent value="bags" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('bags', 'women')}
        </TabsContent>
        <TabsContent value="accessories" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('accessories', 'women')}
        </TabsContent>
        <TabsContent value="misc" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('misc', 'women')}
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderMenContent = () => (
    <div className="space-y-6">
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        {/* cabinetSurface v1 */}
        <TabsList className={cn(cabinetSurface.tabsList, 'mb-4 h-auto min-w-0')}>
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
          <TabsTrigger
            value="misc"
            className={cn(
              cabinetSurface.tabsTrigger,
              'text-xs font-semibold normal-case tracking-normal'
            )}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Прочее
          </TabsTrigger>
        </TabsList>
        <TabsContent value="clothing" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('clothing', 'men')}
        </TabsContent>
        <TabsContent value="shoes" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('shoes', 'men')}
        </TabsContent>
        <TabsContent value="bags" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('bags', 'men')}
        </TabsContent>
        <TabsContent value="accessories" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('accessories', 'men')}
        </TabsContent>
        <TabsContent value="misc" className={cabinetSurface.cabinetProfileTabPanel}>
          {renderContentForSection('misc', 'men')}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <>
      <CabinetPageContent maxWidth="full" className="space-y-4">
        <div className="flex items-center justify-between">
          <header>
            <h1 className="font-headline text-base font-bold">Справочник размеров</h1>
            <p className="text-muted-foreground">Управление размерными сетками и параметрами.</p>
          </header>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить таблицу
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* cabinetSurface v1 */}
          <TabsList className={cn(cabinetSurface.tabsList, 'min-w-0 max-w-md')}>
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
          </TabsList>

          <TabsContent value="women" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-6')}>
            {renderWomenContent()}
          </TabsContent>

          <TabsContent value="men" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-6')}>
            {renderMenContent()}
          </TabsContent>
          <TabsContent value="kids" className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-6')}>
            <Card>
              <CardHeader>
                <CardTitle>Детские размеры</CardTitle>
                <CardDescription>
                  Раздел для детских размерных сеток находится в разработке.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </CabinetPageContent>

      {/* Clothing Dialogs */}
      {dialogStates['outerwear'] && (
        <FitGuideOuterwearDialog
          isOpen={dialogStates['outerwear']}
          onOpenChange={() => closeDialog('outerwear')}
          audience={activeTab as 'women' | 'men'}
        />
      )}
      {dialogStates['suits'] && (
        <FitGuideSuitsDialog
          isOpen={dialogStates['suits']}
          onOpenChange={() => closeDialog('suits')}
          audience={activeTab as 'women' | 'men'}
        />
      )}
      {dialogStates['dresses'] && (
        <FitGuideDialog
          isOpen={dialogStates['dresses']}
          onOpenChange={() => closeDialog('dresses')}
        />
      )}
      {dialogStates['skirts'] && (
        <FitGuideSkirtsDialog
          isOpen={dialogStates['skirts']}
          onOpenChange={() => closeDialog('skirts')}
        />
      )}
      {dialogStates['shirts'] && (
        <FitGuideShirtsDialog
          isOpen={dialogStates['shirts']}
          onOpenChange={() => closeDialog('shirts')}
          audience={activeTab as 'women' | 'men'}
        />
      )}
      {dialogStates['tops'] && (
        <FitGuideTopsDialog
          isOpen={dialogStates['tops']}
          onOpenChange={() => closeDialog('tops')}
          audience={activeTab as 'women' | 'men'}
        />
      )}
      {dialogStates['jeans'] && (
        <FitGuideJeansDialog
          isOpen={dialogStates['jeans']}
          onOpenChange={() => closeDialog('jeans')}
          audience={activeTab as 'women' | 'men'}
        />
      )}
      {dialogStates['trousers'] && (
        <FitGuideTrousersDialog
          isOpen={dialogStates['trousers']}
          onOpenChange={() => closeDialog('trousers')}
          audience={activeTab as 'women' | 'men'}
        />
      )}
      {dialogStates['knitwear'] && (
        <FitGuideKnitwearDialog
          isOpen={dialogStates['knitwear']}
          onOpenChange={() => closeDialog('knitwear')}
          audience={activeTab as 'women' | 'men'}
        />
      )}
      {dialogStates['lingerie'] && (
        <FitGuideLingerieDialog
          isOpen={dialogStates['lingerie']}
          onOpenChange={() => closeDialog('lingerie')}
        />
      )}
      {dialogStates['sportswear'] && (
        <FitGuideSportswearDialog
          isOpen={dialogStates['sportswear']}
          onOpenChange={() => closeDialog('sportswear')}
        />
      )}
      {dialogStates['beachwear'] && (
        <FitGuideBeachwearDialog
          isOpen={dialogStates['beachwear']}
          onOpenChange={() => closeDialog('beachwear')}
        />
      )}
      {dialogStates['maternity'] && (
        <FitGuideMaternityDialog
          isOpen={dialogStates['maternity']}
          onOpenChange={() => closeDialog('maternity')}
        />
      )}
      {dialogStates['adaptive'] && (
        <FitGuideAdaptiveDialog
          isOpen={dialogStates['adaptive']}
          onOpenChange={() => closeDialog('adaptive')}
        />
      )}

      {/* Shoes Dialogs */}
      {dialogStates['shoes'] && (
        <FitGuideShoesDialog
          isOpen={dialogStates['shoes']}
          onOpenChange={() => closeDialog('shoes')}
        />
      )}
      {dialogStates['boots'] && (
        <FitGuideBootsDialog
          isOpen={dialogStates['boots']}
          onOpenChange={() => closeDialog('boots')}
        />
      )}
      {dialogStates['flats'] && (
        <FitGuideFlatsDialog
          isOpen={dialogStates['flats']}
          onOpenChange={() => closeDialog('flats')}
        />
      )}
      {dialogStates['sandals'] && (
        <FitGuideSandalsDialog
          isOpen={dialogStates['sandals']}
          onOpenChange={() => closeDialog('sandals')}
        />
      )}
      {dialogStates['sneakers'] && (
        <FitGuideSneakersDialog
          isOpen={dialogStates['sneakers']}
          onOpenChange={() => closeDialog('sneakers')}
          audience={activeTab as 'women' | 'men'}
        />
      )}
      {dialogStates['homeshoes'] && (
        <FitGuideHomeShoesDialog
          isOpen={dialogStates['homeshoes']}
          onOpenChange={() => closeDialog('homeshoes')}
        />
      )}

      {/* Other Dialogs */}
      {dialogStates['bags'] && (
        <FitGuideBagsDialog
          isOpen={dialogStates['bags']}
          onOpenChange={() => closeDialog('bags')}
          selectedBagType={selectedBagType}
        />
      )}
      {dialogStates['accessories'] && (
        <FitGuideAccessoriesDialog
          isOpen={dialogStates['accessories']}
          onOpenChange={() => closeDialog('accessories')}
          selectedAccessory={selectedAccessory}
        />
      )}
      {dialogStates['misc'] && (
        <FitGuideMiscDialog
          isOpen={dialogStates['misc']}
          onOpenChange={() => closeDialog('misc')}
          selectedCategory={selectedMiscCategory}
        />
      )}
    </>
  );
}
