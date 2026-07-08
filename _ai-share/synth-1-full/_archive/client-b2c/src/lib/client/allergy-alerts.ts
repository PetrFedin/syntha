/**
 * Allergy & Material Alerts — фильтры и предупреждения по составу ткани.
 * Связи: каталог, Digital Passport, клиент. Инфра под API.
 */

export interface MaterialAlert {
  id: string;
  /** Название материала/аллергена (шерсть, латекс, никель и т.д.) */
  name: string;
  /** Код для сопоставления с составом товара */
  code?: string;
  severity: 'avoid' | 'caution';
}

export interface ProductCompositionCheck {
  productId: string;
  composition: string; // сырой текст состава
  materials: { name: string; percent?: number }[];
  /** Есть ли пересечение с ограничениями пользователя */
  hasAlert: boolean;
  alertMaterials?: string[];
}

export const ALLERGY_ALERTS_API = {
  list: '/api/v1/client/allergy-alerts',
  save: '/api/v1/client/allergy-alerts',
  checkProduct: '/api/v1/client/allergy-alerts/check',
} as const;
