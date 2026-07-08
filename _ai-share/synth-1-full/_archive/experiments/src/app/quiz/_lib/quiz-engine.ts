import { ParamKey, NormVec, SegmentInfo, StyleArchetype } from './types';

export const SEGMENTS: SegmentInfo[] = [
  {
    id: 1,
    code: 'S1',
    name: 'Ultra-Mass Market',
    description: 'Супер-массовый, ультра-дешёвый, максимальные объёмы и постоянные скидки.',
  },
  {
    id: 2,
    code: 'S2',
    name: 'Mass Market',
    description:
      'Классический масс-маркет: широкий ассортимент, частые распродажи, базовые материалы.',
  },
  {
    id: 3,
    code: 'S3',
    name: 'Upper Mass Market',
    description: 'Чуть лучшее качество и визуал, чем у масс-маркета, но всё ещё массовый сегмент.',
  },
  {
    id: 4,
    code: 'S4',
    name: 'Value Essentials',
    description: 'Умные базовые вещи: функционально, качественно, без лишнего модного шума.',
  },
  {
    id: 5,
    code: 'S5',
    name: 'Mass Premium / Affordable Premium',
    description: 'Промежуточный сегмент между массом и премиумом.',
  },
  {
    id: 6,
    code: 'S6',
    name: 'Trend-led Fast Contemporary',
    description: 'Быстро меняющиеся коллекции, трендовые модели, частые дропы.',
  },
  {
    id: 7,
    code: 'S7',
    name: 'Urban Contemporary',
    description: 'Городской современный стиль, сильный digital и визуальная айдентика.',
  },
  {
    id: 8,
    code: 'S8',
    name: 'Contemporary',
    description: 'Современный дизайн, хорошее качество и баланс цены.',
  },
  {
    id: 9,
    code: 'S9',
    name: 'Upper Contemporary',
    description: 'Шаг к доступному люксу: лучшее качество, устойчивость, визуал.',
  },
  {
    id: 10,
    code: 'S10',
    name: 'Designer Contemporary',
    description: 'Авторские коллекции, креативный дизайн, капсулы.',
  },
  {
    id: 11,
    code: 'S11',
    name: 'Avant-Garde / Experimental',
    description: 'Концептуальные, экспериментальные бренды, сильный креатив.',
  },
  {
    id: 12,
    code: 'S12',
    name: 'Streetwear',
    description: 'Уличная культура, коллаборации, лимитированные дропы.',
  },
  {
    id: 13,
    code: 'S13',
    name: 'Sport Lifestyle',
    description: 'Между спортом и лайфстайлом, технологичные ткани и функциональность.',
  },
  {
    id: 14,
    code: 'S14',
    name: 'Athleisure Premium',
    description: 'Премиальный athleisure, спорт + премиальные материалы.',
  },
  {
    id: 15,
    code: 'S15',
    name: 'Techwear / Urban Premium',
    description: 'Технологичная городская одежда, мембраны, функциональные детали.',
  },
  {
    id: 16,
    code: 'S16',
    name: 'Structured Heritage',
    description: 'Классический heritage с акцентом на костюмы и структуру.',
  },
  {
    id: 17,
    code: 'S17',
    name: 'Casual Heritage / Utility',
    description: 'Утилитарный, рабочий heritage (workwear, casual).',
  },
  {
    id: 18,
    code: 'S18',
    name: 'Heritage Luxury',
    description: 'Исторические luxury-бренды с сильным ремеслом.',
  },
  {
    id: 19,
    code: 'S19',
    name: 'Accessible Luxury',
    description: 'Доступный люкс, высокое качество, но ещё не haute couture.',
  },
  {
    id: 20,
    code: 'S20',
    name: 'Luxury / Ultra-Luxury / Couture',
    description: 'Высший люкc, couture, эксклюзивные бутики и отсутствие скидок.',
  },
];

export const DIR: Record<ParamKey, 1 | -1 | 0> = {
  price_index: 1,
  production_volume: -1,
  assortment_width: 0,
  materials_quality: 1,
  craftsmanship_level: 1,
  tech_fabrics: 0,
  category_focus: 0,
  discount_intensity: -1,
  d2c_share: 1,
  retail_presence: 1,
  boutique_presence: 1,
  heritage_age: 1,
  innovation_design: 1,
  visual_identity: 1,
  export_share: 1,
  sustainability: 1,
  collab_frequency: 0,
  audience_income: 1,
  digital_maturity: 1,
  price_stability: 1,
};

export const BPI_W: Record<ParamKey, number> = {
  price_index: 0.14,
  materials_quality: 0.12,
  craftsmanship_level: 0.12,
  price_stability: 0.08,
  discount_intensity: 0.08,
  boutique_presence: 0.08,
  retail_presence: 0.06,
  heritage_age: 0.06,
  visual_identity: 0.06,
  innovation_design: 0.05,
  sustainability: 0.05,
  export_share: 0.04,
  d2c_share: 0.04,
  production_volume: 0.02,
  assortment_width: 0,
  tech_fabrics: 0,
  category_focus: 0,
  collab_frequency: 0,
  audience_income: 0,
  digital_maturity: 0,
};

export const calcBPI = (norm: NormVec): number => {
  let s = 0;
  (Object.keys(BPI_W) as ParamKey[]).forEach((key) => {
    const w = BPI_W[key];
    if (!w) return;
    const val = DIR[key] === -1 ? 1 - norm[key] : norm[key];
    s += w * val;
  });
  return Math.round(100 * s);
};

/** Соответствие индексу BPI (0–100) одному из 20 сегментов шкалы. */
export const segmentFromBpi = (bpi: number): SegmentInfo => {
  const clamped = Math.max(0, Math.min(100, bpi));
  const idx = Math.min(SEGMENTS.length - 1, Math.floor((clamped / 100) * SEGMENTS.length));
  return SEGMENTS[idx];
};

const effectiveNorm = (key: ParamKey, norm: NormVec): number => {
  const n = norm[key];
  return DIR[key] === -1 ? 1 - n : n;
};

const contribution = (key: ParamKey, norm: NormVec): number => {
  const w = BPI_W[key];
  if (!w) return 0;
  return w * effectiveNorm(key, norm);
};

const UPGRADE_TIP: Record<ParamKey, string> = {
  price_index: 'Поднять средний чек и ценовое позиционирование',
  materials_quality: 'Усилить качество материалов и прозрачность составов',
  craftsmanship_level: 'Инвестировать в ремесло, отделку и контроль качества',
  price_stability: 'Снизить зависимость от глубоких скидок и стабилизировать цену',
  discount_intensity: 'Сократить частоту и глубину промо (сохранить маржу и премиум-сигнал)',
  boutique_presence: 'Развивать премиум-ритейл и бутики / партнёров сегмента',
  retail_presence: 'Укрепить присутствие в сильных розничных точках',
  heritage_age: 'Усилить storytelling наследия и доказательства происхождения',
  visual_identity: 'Свести айдентику к единому узнаваемому стилю и контенту',
  innovation_design: 'Добавить дизайнерские инициативы и капсулы с креативом',
  sustainability: 'Систематизировать ESG и коммуникацию устойчивости',
  export_share: 'Нарастить экспорт и дистрибуцию в целевых рынках',
  d2c_share: 'Развивать D2C и прямой контакт с клиентом',
  production_volume: 'Сместить микс к меньшим партиям и эксклюзивности',
  assortment_width: 'Сузить ассортимент под ядро аудитории',
  tech_fabrics: 'Внедрить технологичные материалы и функциональность',
  category_focus: 'Усилить фокус в ключевых категориях',
  collab_frequency: 'Использовать коллаборации и дропы для роста узнаваемости',
  audience_income: 'Сместить продукт и цену под более платёжеспособную аудиторию',
  digital_maturity: 'Усилить digital, данные и персонализацию',
};

export const inferStyleArchetype = (norm: NormVec): StyleArchetype => {
  const scores: { id: StyleArchetype; v: number }[] = [
    {
      id: 'techwear',
      v: norm.tech_fabrics * 0.45 + norm.innovation_design * 0.3 + norm.visual_identity * 0.2,
    },
    {
      id: 'street',
      v: norm.collab_frequency * 0.4 + norm.innovation_design * 0.35 + norm.visual_identity * 0.2,
    },
    {
      id: 'sport',
      v: norm.tech_fabrics * 0.5 + norm.category_focus * 0.2,
    },
    {
      id: 'heritage',
      v: norm.heritage_age * 0.5 + norm.craftsmanship_level * 0.35,
    },
    {
      id: 'luxury',
      v:
        norm.price_index * 0.3 +
        norm.boutique_presence * 0.25 +
        norm.materials_quality * 0.25 +
        norm.craftsmanship_level * 0.2,
    },
    {
      id: 'contemporary',
      v: norm.innovation_design * 0.35 + norm.visual_identity * 0.2 + norm.digital_maturity * 0.25,
    },
  ];
  scores.sort((a, b) => b.v - a.v);
  const top = scores[0];
  if (!top || top.v < 0.22) return 'none';
  return top.id;
};

export const buildUpgradeTips = (norm: NormVec, target: SegmentInfo | null): string[] => {
  const tips: string[] = [];
  if (target) {
    tips.push(`Ориентир роста: сегмент «${target.name}» — ${target.description}`);
  }
  const keys = (Object.keys(BPI_W) as ParamKey[]).filter((k) => BPI_W[k] > 0);
  const ranked = keys
    .map((key) => ({
      key,
      c: contribution(key, norm),
      max: BPI_W[key]! * 1,
    }))
    .sort((a, b) => a.c / a.max - b.c / b.max);
  const weakest = ranked.slice(0, 4);
  for (const w of weakest) {
    const line = UPGRADE_TIP[w.key];
    if (line && !tips.includes(line)) tips.push(line);
  }
  return tips.slice(0, 6);
};

export const getUpgradeTargetSegment = (current: SegmentInfo): SegmentInfo | null => {
  const map: Record<number, number> = {
    1: 3,
    2: 3,
    3: 8,
    4: 8,
    5: 8,
    6: 9,
    7: 9,
    8: 9,
    9: 19,
    10: 19,
    11: 19,
    12: 14,
    13: 14,
    14: 19,
    15: 19,
    16: 18,
    17: 18,
    18: 20,
    19: 20,
    20: 20,
  };
  const targetId = map[current.id as number];
  return SEGMENTS.find((s) => s.id === targetId) || null;
};
