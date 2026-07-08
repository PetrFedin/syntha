import type { ProductAudience } from '@/lib/types';

export type AudienceFilter =
  | 'Все'
  | 'Взрослые - Женщины'
  | 'Взрослые - Мужчины'
  | 'Взрослые - Унисекс'
  | 'Дети - Девочки'
  | 'Дети - Мальчики'
  | 'Дети - Новорожденные'
  | 'Дети - Унисекс'
  | 'Non-Fashion';

export const audienceAttributeMap: Record<AudienceFilter, string[]> = {
  Все: [
    'fit',
    'length',
    'sleeveLength',
    'collar',
    'fastening',
    'waist',
    'pockets',
    'stitching',
    'decor',
    'hardware',
    'fabricTexture',
    'pattern',
  ],
  'Взрослые - Женщины': [
    'fit',
    'length',
    'sleeveLength',
    'collar',
    'fastening',
    'waist',
    'pockets',
    'stitching',
    'decor',
    'hardware',
    'fabricTexture',
    'pattern',
    'backDetails',
    'hemType',
    'drapery',
  ],
  'Взрослые - Мужчины': [
    'fit',
    'length',
    'sleeveLength',
    'collar',
    'fastening',
    'waist',
    'pockets',
    'stitching',
    'hardware',
    'fabricTexture',
    'pattern',
    'shoulder',
    'seam',
  ],
  'Взрослые - Унисекс': [
    'fit',
    'length',
    'sleeveLength',
    'collar',
    'fastening',
    'waist',
    'pockets',
    'stitching',
    'decor',
    'hardware',
    'fabricTexture',
    'pattern',
  ],
  'Дети - Девочки': [
    'fit',
    'length',
    'sleeveLength',
    'fastening',
    'waist',
    'pockets',
    'stitching',
    'decor',
    'hardware',
    'fabricTexture',
    'pattern',
    'transformation',
  ],
  'Дети - Мальчики': [
    'fit',
    'length',
    'sleeveLength',
    'fastening',
    'waist',
    'pockets',
    'stitching',
    'decor',
    'hardware',
    'fabricTexture',
    'pattern',
    'transformation',
  ],
  'Дети - Новорожденные': ['fabricTexture', 'pattern', 'fastening', 'transformation'],
  'Дети - Унисекс': [
    'fit',
    'length',
    'sleeveLength',
    'fastening',
    'waist',
    'pockets',
    'stitching',
    'decor',
    'hardware',
    'fabricTexture',
    'pattern',
    'transformation',
  ],
  'Non-Fashion': [
    'fabricTexture',
    'decor',
    'hardware',
    'pattern',
    'processingTech',
    'stitching',
    'lining',
    'combination',
  ],
};

export const audienceCategoryMap: Record<AudienceFilter, string[]> = {
  Все: ['Одежда', 'Обувь', 'Сумки', 'Аксессуары', 'Beauty & Grooming', 'Home & Lifestyle'],
  'Взрослые - Женщины': ['Одежда', 'Обувь', 'Сумки', 'Аксессуары'],
  'Взрослые - Мужчины': ['Одежда', 'Обувь', 'Сумки', 'Аксессуары'],
  'Взрослые - Унисекс': ['Одежда', 'Обувь', 'Сумки', 'Аксессуары'],
  'Дети - Девочки': ['Одежда', 'Обувь', 'Сумки', 'Аксессуары'],
  'Дети - Мальчики': ['Одежда', 'Обувь', 'Сумки', 'Аксессуары'],
  'Дети - Новорожденные': ['Одежда', 'Аксессуары'],
  'Дети - Унисекс': ['Одежда', 'Обувь', 'Сумки', 'Аксессуары'],
  'Non-Fashion': ['Beauty & Grooming', 'Home & Lifestyle'],
};

export const categoryAttributeMap: Record<string, string[]> = {
  Одежда: [
    'fit',
    'length',
    'sleeveLength',
    'collar',
    'fastening',
    'waist',
    'pockets',
    'stitching',
    'decor',
    'hardware',
    'fabricTexture',
    'pattern',
    'backDetails',
    'hemType',
    'transformation',
  ],
  Обувь: ['heel', 'sole', 'arch', 'comfortIndex', 'flexIndex', 'weightPair', 'footLength', 'width'],
  Сумки: [
    'bottomLength',
    'bottomWidth',
    'handleDrop',
    'strapLength',
    'strapWidth',
    'internalCompartments',
    'laptopCompartment',
    'hardware',
    'fabricTexture',
  ],
  Аксессуары: [
    'headCircumference',
    'domeDiameter',
    'ribs',
    'lensWidth',
    'frameWidth',
    'caseDiameter',
    'strapWidth_watch',
    'hardware',
    'fabricTexture',
  ],
  'Beauty & Grooming': ['processingTech', 'fabricTexture', 'pattern'],
  'Home & Lifestyle': ['fabricTexture', 'stitching', 'lining', 'combination', 'depth'],
};

export const chartMap: Record<string, string> = {
  Одежда: 'tops',
  Платья: 'dresses',
  Брюки: 'trousers',
  Джинсы: 'jeans',
  'Верхняя одежда': 'outerwear',
  Трикотаж: 'knitwear',
  Юбки: 'skirts',
  'Спортивная одежда': 'sportswear',
  Костюмы: 'suits',
  Белье: 'lingerie',
  Обувь: 'shoes',
  Кроссовки: 'sneakers',
  Ботинки: 'boots',
  Сандалии: 'sandals',
  Сумки: 'bags',
};

export const loadReferenceData = async () => {
  const [catRes, colRes, attrRes] = await Promise.all([
    fetch('/data/categories.json'),
    fetch('/data/colors.json'),
    fetch('/data/attribute-data.json'),
  ]);
  return {
    categories: await catRes.json(),
    colors: await colRes.json(),
    attributes: await attrRes.json(),
  };
};

export const loadSizeChart = async (filterCategory: string[], activeAudience: string[]) => {
  let chartKey: string | undefined;
  for (let i = filterCategory.length - 1; i >= 0; i--) {
    const cat = filterCategory[i];
    if (chartMap[cat]) {
      chartKey = chartMap[cat];
      break;
    }
    const fuzzyMatch = Object.entries(chartMap).find(
      ([k]) => cat.includes(k) || k.includes(cat)
    )?.[1];
    if (fuzzyMatch) {
      chartKey = fuzzyMatch;
      break;
    }
  }

  if (chartKey) {
    const res = await fetch(`/data/size-chart-${chartKey}.json`);
    if (res.ok) return await res.json();
  }
  return [];
};
