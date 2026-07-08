/**
 * Platform Core UI Density Contract
 *
 * Canonical visual-density rules for the Brand/Shop baseline. This does not
 * create new UI; it gives Cursor and future commits a machine-readable standard
 * for typography, spacing, containers and anti-noise decisions.
 */

export type PlatformCoreDensityToken = {
  token: string;
  value: string;
  usageRu: string;
};

export type PlatformCoreTypographyRole =
  | 'page_title'
  | 'section_title'
  | 'card_title'
  | 'body'
  | 'meta'
  | 'badge'
  | 'button'
  | 'table_header'
  | 'table_cell';

export type PlatformCoreTypographyToken = {
  role: PlatformCoreTypographyRole;
  fontSize: string;
  lineHeight: string;
  fontWeight: 400 | 500 | 600 | 700;
  usageRu: string;
};

export type PlatformCoreContainerToken = {
  role: 'page' | 'section' | 'card' | 'compact_card' | 'panel' | 'table_shell' | 'dialog';
  padding: string;
  radius: string;
  border: string;
  minHeight?: string;
  maxWidth?: string;
  usageRu: string;
};

export const PLATFORM_CORE_SPACING_TOKENS: readonly PlatformCoreDensityToken[] = [
  { token: 'space-1', value: '4px', usageRu: 'микро-разделители, icon gap' },
  { token: 'space-2', value: '8px', usageRu: 'gap внутри строк, badge, compact meta' },
  { token: 'space-3', value: '12px', usageRu: 'плотные карточки и строки таблиц' },
  { token: 'space-4', value: '16px', usageRu: 'стандартный padding карточек и секций' },
  { token: 'space-5', value: '20px', usageRu: 'page/header gap, крупные панели' },
  { token: 'space-6', value: '24px', usageRu: 'разделы страницы, не чаще одного уровня' },
  { token: 'space-8', value: '32px', usageRu: 'крупный page block gap, использовать редко' },
] as const;

export const PLATFORM_CORE_TYPOGRAPHY_TOKENS: readonly PlatformCoreTypographyToken[] = [
  { role: 'page_title', fontSize: '24px', lineHeight: '32px', fontWeight: 600, usageRu: 'один заголовок страницы' },
  { role: 'section_title', fontSize: '18px', lineHeight: '26px', fontWeight: 600, usageRu: 'заголовок смыслового блока' },
  { role: 'card_title', fontSize: '15px', lineHeight: '22px', fontWeight: 600, usageRu: 'заголовок карточки/столпа' },
  { role: 'body', fontSize: '14px', lineHeight: '22px', fontWeight: 400, usageRu: 'основной текст' },
  { role: 'meta', fontSize: '12px', lineHeight: '18px', fontWeight: 500, usageRu: 'подписи, вторичные статусы, даты' },
  { role: 'badge', fontSize: '11px', lineHeight: '16px', fontWeight: 600, usageRu: 'короткие статусы без длинных фраз' },
  { role: 'button', fontSize: '13px', lineHeight: '18px', fontWeight: 600, usageRu: 'кнопки и CTA' },
  { role: 'table_header', fontSize: '12px', lineHeight: '18px', fontWeight: 600, usageRu: 'заголовки таблиц' },
  { role: 'table_cell', fontSize: '13px', lineHeight: '20px', fontWeight: 400, usageRu: 'ячейки таблиц и registry' },
] as const;

export const PLATFORM_CORE_CONTAINER_TOKENS: readonly PlatformCoreContainerToken[] = [
  {
    role: 'page',
    padding: '24px',
    radius: '0',
    border: 'none',
    maxWidth: '1280px',
    usageRu: 'основной workspace контейнер без лишней рамки',
  },
  {
    role: 'section',
    padding: '20px',
    radius: '16px',
    border: '1px solid var(--border-subtle)',
    usageRu: 'крупный смысловой блок внутри страницы',
  },
  {
    role: 'card',
    padding: '16px',
    radius: '14px',
    border: '1px solid var(--border-subtle)',
    minHeight: '112px',
    usageRu: 'обычная карточка столпа/объекта',
  },
  {
    role: 'compact_card',
    padding: '12px',
    radius: '12px',
    border: '1px solid var(--border-subtle)',
    minHeight: '72px',
    usageRu: 'compact KPI, meta или peer strip item',
  },
  {
    role: 'panel',
    padding: '16px',
    radius: '14px',
    border: '1px solid var(--border-muted)',
    usageRu: 'details/timeline/documents panel',
  },
  {
    role: 'table_shell',
    padding: '0',
    radius: '14px',
    border: '1px solid var(--border-subtle)',
    usageRu: 'единая оболочка таблиц и registry',
  },
  {
    role: 'dialog',
    padding: '20px',
    radius: '18px',
    border: '1px solid var(--border-subtle)',
    usageRu: 'modal/drawer без лишних вложенных карточек',
  },
] as const;

export const PLATFORM_CORE_NOISE_RULES = [
  'Один экран — одно главное действие. Остальные действия вторичны или в action menu.',
  'Не показывать две карточки с одним и тем же статусом на одном уровне иерархии.',
  'Не использовать пустые hero-блоки и декоративные баннеры в рабочем кабинете.',
  'Если блок не отвечает на вопрос пользователя или не ведёт к следующему шагу lifecycle — скрыть, объединить или перенести в details.',
  'Не использовать произвольные font-size, padding, radius и min-height вне contract tokens.',
  'Длинные описания заменять на короткий status + next action; детали — в drawer/details.',
  'Empty state обязан содержать причину пустоты и одно следующее действие, иначе это шум.',
] as const;

export function getPlatformCoreTypographyRole(role: PlatformCoreTypographyRole) {
  return PLATFORM_CORE_TYPOGRAPHY_TOKENS.find((token) => token.role === role);
}

export function getPlatformCoreContainerRole(role: PlatformCoreContainerToken['role']) {
  return PLATFORM_CORE_CONTAINER_TOKENS.find((token) => token.role === role);
}
