/**
 * Демо-начальные данные страницы «Профиль бренда».
 * Единственное место для правок сидов без дублирования в page.tsx.
 */
import type { Brand } from '@/lib/types';
import type { AssetTypeId, MediaAssetItem } from '@/components/brand/MediaAssetsViewer';
import type { BrandProfileLegalDataState } from './brand-profile-legal-tab';
import type { BrandProfileCertificateItem } from './brand-profile-certificates-tab';
import type {
  BrandProfileBrandContactsState,
  BrandProfileBrandInfoState,
  BrandProfileContactsState,
} from './brand-profile-brand-tab';

export const BRAND_PROFILE_DEFAULT_SYNTHA_BRAND: Brand = {
  id: 'brand-syntha-default',
  slug: 'syntha',
  name: 'Syntha',
  nameRU: 'Синта',
  description: 'Бренд технологичной одежды.',
  logo: { url: 'https://picsum.photos/seed/syntha/200/200', alt: 'Syntha', hint: 'logo' },
  followers: 15200,
  countryOfOrigin: 'Россия',
  foundedYear: 2022,
  subscriptionTier: 'Elite',
};

export const BRAND_PROFILE_INITIAL_LEGAL = {
  legalName: 'ООО "Синта Фэшн"',
  inn: '7701234567',
  kpp: '770101001',
  ogrn: '1234567890123',
  okpo: '12345678',
  oktmo: '45381000',
  okved: '14.13',
  okvedDesc: 'Производство прочей верхней одежды',
  okfs: '16',
  okopf: '12300',
  legalAddress: '123456, г. Москва, ул. Тверская, д. 1, оф. 100',
  actualAddress: '123456, г. Москва, ул. Тверская, д. 1, оф. 100',
  bankName: 'ПАО Сбербанк',
  bik: '044525225',
  corrAccount: '30101810400000000225',
  paymentAccount: '40702810538000123456',
  ceo: 'Иванов Иван Иванович',
  ceoPosition: 'Генеральный директор',
  foundingDate: '15.03.2022',
  registrationAuthority: 'Межрайонная ИФНС России №46 по г. Москве',
  taxRegime: 'ОСНО',
  authorizedCapital: '10 000 ₽',
  licenses: 'Не требуется',
  powersOfAttorney: 'Ген. доверенность №1 от 15.03.2022',
  insurance: 'ОСАГО, ДМС',
  isVerified: true,
} satisfies BrandProfileLegalDataState;

export const BRAND_PROFILE_INITIAL_CONTACTS = {
  email: 'info@syntha.ru',
  phone: '+7 (495) 123-45-67',
  website: 'https://syntha.ru',
  instagram: '@syntha_official',
  twitter: '@syntha_tech',
  tiktok: '',
  youtube: '',
  supportEmail: 'support@syntha.ru',
  pressEmail: 'press@syntha.ru',
  b2bEmail: 'b2b@syntha.ru',
  isEmailVerified: true,
  isPhoneVerified: true,
  isSocialSync: true,
} satisfies BrandProfileContactsState;

export const BRAND_PROFILE_INITIAL_BRAND_INFO = {
  logos: [
    { id: 'logo-1', url: 'https://picsum.photos/seed/syntha/200/200', isMain: true },
    { id: 'logo-2', url: '', isMain: false },
  ] as { id: string; url: string; isMain: boolean }[],
  storeAddresses: [
    {
      id: 'addr-1',
      name: 'Демо-точка продаж · Москва 1',
      fullAddress: '125009, г. Москва, ул. Тверская, д. 1',
      phone: '+7 (495) 000-00-00',
      site: 'https://example.com',
      yandexMapUrl: 'https://yandex.ru/maps/?pt=37.617644,55.755826&z=17',
      workingHours: {
        mon: '10:00–22:00',
        tue: '10:00–22:00',
        wed: '10:00–22:00',
        thu: '10:00–22:00',
        fri: '10:00–22:00',
        sat: '10:00–22:00',
        sun: '10:00–22:00',
      },
      isSynced: true,
    },
    {
      id: 'addr-2',
      name: 'Галерея',
      fullAddress: '190000, г. Санкт-Петербург, Невский пр., д. 1',
      phone: '+7 (812) 333-00-00',
      site: 'https://example.ru',
      yandexMapUrl: 'https://yandex.ru/maps/?pt=30.360909,59.934280&z=17',
      workingHours: {
        mon: '10:00–21:00',
        tue: '10:00–21:00',
        wed: '10:00–21:00',
        thu: '10:00–21:00',
        fri: '10:00–21:00',
        sat: '10:00–21:00',
        sun: '10:00–20:00',
      },
      isSynced: true,
    },
  ] as {
    id: string;
    name: string;
    fullAddress: string;
    phone: string;
    site: string;
    yandexMapUrl: string;
    workingHours: Record<string, string>;
    isSynced: boolean;
  }[],
  onlineStores: [
    {
      id: 'os-1',
      name: 'Маркетплейс (демо) A',
      productUrl: 'https://example.com/mp-a/syntha-lab',
      parsingEnabled: true,
    },
    {
      id: 'os-2',
      name: 'Маркетплейс (демо) B',
      productUrl: 'https://example.com/mp-b/syntha-lab',
      parsingEnabled: true,
    },
    {
      id: 'os-3',
      name: 'Агрегатор (демо)',
      productUrl: 'https://example.com/search?q=syntha-lab',
      parsingEnabled: false,
    },
  ] as {
    id: string;
    name: string;
    productUrl: string;
    parsingEnabled: boolean;
    platformShopId?: string;
    syncStatus?: 'confirmed' | 'linked' | 'manual';
  }[],
  showroom: {
    hasShowroom: true,
    name: 'Шоурум Syntha Lab',
    address: 'г. Москва, ул. Тверская, д. 1',
    phone: '+7 (495) 123-45-67',
    site: 'https://syntha.ru/showroom',
    yandexMapUrl: 'https://yandex.ru/maps/?pt=37.617644,55.755826&z=17',
    workingHours: {
      mon: '10:00–20:00',
      tue: '10:00–20:00',
      wed: '10:00–20:00',
      thu: '10:00–20:00',
      fri: '10:00–20:00',
      sat: '11:00–18:00',
      sun: 'Выходной',
    } as Record<string, string>,
  },
  portalLogin: 'syntha_brand',
} satisfies BrandProfileBrandInfoState;

export const BRAND_PROFILE_INITIAL_BRAND_CONTACTS = {
  emails: [{ value: 'info@syntha.ru', label: 'Общий' }] as { value: string; label: string }[],
  phones: [{ value: '+7 (495) 123-45-67', label: 'Общий' }] as { value: string; label: string }[],
  telegrams: [{ value: '@syntha_official', label: 'Общий' }] as {
    value: string;
    label: string;
  }[],
  whatsapps: [{ value: '+7 (495) 123-45-67', label: 'B2B' }] as {
    value: string;
    label: string;
  }[],
  externalEmails: [
    { value: 'press@syntha.ru', label: 'Пресса' },
    { value: 'b2b@syntha.ru', label: 'B2B' },
  ] as { value: string; label: string }[],
} satisfies BrandProfileBrandContactsState;

export const BRAND_PROFILE_INITIAL_PRESS_KIT_ASSETS: Record<AssetTypeId, MediaAssetItem[]> = {
  'brand-identity': [
    {
      id: 'bi-1',
      title: 'Logo Primary.svg',
      type: 'image',
      archived: false,
      addedAt: '2026-01-15',
    },
    {
      id: 'bi-2',
      title: 'Logo White.png',
      type: 'image',
      archived: false,
      addedAt: '2026-01-15',
    },
    {
      id: 'bi-3',
      title: 'Brand Colors.pdf',
      type: 'pdf',
      archived: true,
      archivedAt: '2026-02-01',
      addedAt: '2025-12-01',
    },
  ],
  lookbooks: [
    {
      id: 'lb-1',
      title: 'SS26 Main Collection.pdf',
      type: 'pdf',
      archived: false,
      addedAt: '2026-02-10',
    },
    {
      id: 'lb-2',
      title: 'FW25 Archive.pdf',
      type: 'pdf',
      archived: false,
      addedAt: '2025-08-20',
    },
  ],
  'press-releases': [
    {
      id: 'pr-1',
      title: 'SS26 Launch.docx',
      type: 'doc',
      archived: false,
      addedAt: '2026-02-15',
    },
  ],
  'brand-video': [
    {
      id: 'bv-1',
      title: 'Manifesto 2026.mp4',
      type: 'video',
      archived: false,
      addedAt: '2026-01-20',
    },
  ],
  'team-bios': [
    { id: 'tb-1', title: 'CEO Bio.pdf', type: 'pdf', archived: false, addedAt: '2026-01-10' },
  ],
  'store-photos': [
    {
      id: 'sp-1',
      title: 'Moscow Showroom (12).jpg',
      type: 'image',
      archived: false,
      addedAt: '2026-02-01',
    },
  ],
};

export const BRAND_PROFILE_EXPORT_DNA: Record<string, string | string[]> = {
  philosophy:
    'Cyber-Heritage: Сочетание традиционного портновского мастерства с функциональностью будущего',
  history:
    'Syntha — это манифест технологической элегантности. Основанный в 2022 году, бренд фокусируется на создании "умного гардероба", который адаптируется под ритм жизни современного мегаполиса.',
  keywords: ['Адаптивность', 'Минимализм', 'Устойчивость', 'Инновации'],
  values: ['Качество', 'Экологичность', 'Технологичность', 'Честность'],
  mission: 'Создавать одежду, которая адаптируется к жизни современного человека',
  vision: 'Стать лидером в сегменте технологичной одежды в России и СНГ к 2027 году',
  targetAudience: 'Urban Nomads (25-40 лет), ценящие мобильность и качество материалов',
  positioning: 'High-Tech / Silent Luxury',
  ceo: 'Александр Ветров',
  director: 'Елена Морозова',
};

export const BRAND_PROFILE_INITIAL_COMMERCE_TERMS = {
  moq: '30 Units',
  leadTime: '4–6 недель',
  currency: 'USD / RUB',
  shipping: 'EXW / DAP',
  productionCapacity: '5000 units/mo',
  sampleDevelopment: '14 Days',
} satisfies {
  moq: string;
  leadTime: string;
  currency: string;
  shipping: string;
  productionCapacity: string;
  sampleDevelopment: string;
};

export const BRAND_PROFILE_INITIAL_CERTIFICATES: BrandProfileCertificateItem[] = [
  {
    id: 1,
    name: 'ISO 9001:2015',
    type: 'Quality Management',
    certNumber: 'RU.001.ИСО9001.2024',
    issueDate: '15.01.2024',
    expiryDate: '15.01.2027',
    status: 'active' as const,
    file: 'iso-9001.pdf',
    issuingBody: 'Бюро Веритас',
    scope: 'Производство одежды',
    trTs: '',
    notes: '',
  },
  {
    id: 2,
    name: 'GOTS Organic Textile',
    type: 'Sustainability',
    certNumber: 'CU-12345678',
    issueDate: '20.03.2024',
    expiryDate: '01.03.2026',
    status: 'expiring' as const,
    file: 'gots-cert.pdf',
    issuingBody: 'CU GmbH',
    scope: 'Текстиль органический',
    trTs: 'ТР ТС 017/2011',
    notes: 'Срок продления — март 2026',
  },
  {
    id: 3,
    name: 'Oeko-Tex Standard 100',
    type: 'Textile Safety',
    certNumber: 'SH 123456',
    issueDate: '10.05.2024',
    expiryDate: '10.05.2025',
    status: 'expired' as const,
    file: 'oekotex.pdf',
    issuingBody: 'Hohenstein',
    scope: 'Готовая одежда',
    trTs: '',
    notes: 'Требуется обновление',
  },
];

export type BrandProfileChangelogEntry = {
  id: string;
  date: string;
  user: string;
  action: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
};

export const BRAND_PROFILE_INITIAL_CHANGELOG: BrandProfileChangelogEntry[] = [
  {
    id: '1',
    date: '2026-02-17 14:23',
    user: 'Анна К.',
    action: 'Обновила юридический адрес',
    field: 'Юридические данные',
    oldValue: 'ул. Профсоюзная, 57',
    newValue: 'ул. Тверская, 1, оф. 100',
  },
  {
    id: '2',
    date: '2026-02-15 10:15',
    user: 'Игорь Д.',
    action: 'Добавил сертификат GOTS',
    field: 'Сертификаты',
    oldValue: null,
    newValue: 'GOTS Organic Textile',
  },
  {
    id: '3',
    date: '2026-02-14 16:42',
    user: 'Мария С.',
    action: 'Обновила Press Kit',
    field: 'Brand Story',
    oldValue: 'Традиционное мастерство',
    newValue: 'Cyber-Heritage: Сочетание традиций с технологиями',
  },
  {
    id: '4',
    date: '2026-02-12 09:30',
    user: 'Система',
    action: 'Верифицировала юридическое лицо',
    field: 'Юридические данные',
    oldValue: 'Не верифицировано',
    newValue: 'Верифицировано ФНС',
  },
  {
    id: '5',
    date: '2026-02-10 11:20',
    user: 'Петр В.',
    action: 'Добавил контакт B2B отдела',
    field: 'Контакты',
    oldValue: null,
    newValue: 'b2b@syntha.ru',
  },
];
