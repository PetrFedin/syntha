export const commercialEntityTypes = [
  'organisation',
  'season',
  'campaign',
  'collection',
  'showroom',
  'selection',
  'order-draft',
  'order',
  'confirmation',
  'deal',
] as const;

export type CommercialEntityType = (typeof commercialEntityTypes)[number];

export interface CommercialEntityReference {
  readonly type: CommercialEntityType;
  readonly id: string;
}

export interface CommercialContext {
  readonly organisationId?: string;
  readonly seasonId?: string;
  readonly campaignId?: string;
  readonly collectionId?: string;
  readonly showroomId?: string;
  readonly selectionId?: string;
  readonly orderDraftId?: string;
  readonly orderId?: string;
  readonly confirmationId?: string;
  readonly dealId?: string;
}

export type CommercialContextPath = readonly CommercialEntityReference[];

export interface CommercialContextValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

const entityContextKeys = {
  organisation: 'organisationId',
  season: 'seasonId',
  campaign: 'campaignId',
  collection: 'collectionId',
  showroom: 'showroomId',
  selection: 'selectionId',
  'order-draft': 'orderDraftId',
  order: 'orderId',
  confirmation: 'confirmationId',
  deal: 'dealId',
} as const satisfies Record<CommercialEntityType, keyof CommercialContext>;

export function getRequiredParentContext(
  entityType: CommercialEntityType,
): CommercialEntityType | undefined {
  const index = commercialEntityTypes.indexOf(entityType);
  return index > 0 ? commercialEntityTypes[index - 1] : undefined;
}

export function getNextLifecycleEntity(
  entityType: CommercialEntityType,
): CommercialEntityType | undefined {
  const index = commercialEntityTypes.indexOf(entityType);
  return index < commercialEntityTypes.length - 1
    ? commercialEntityTypes[index + 1]
    : undefined;
}

export function getPreviousLifecycleEntity(
  entityType: CommercialEntityType,
): CommercialEntityType | undefined {
  return getRequiredParentContext(entityType);
}

export function validateCommercialContext(
  context: CommercialContext,
): CommercialContextValidation {
  const errors: string[] = [];

  commercialEntityTypes.forEach((entityType, index) => {
    const key = entityContextKeys[entityType];
    const id = context[key];

    if (id !== undefined && id.trim().length === 0) {
      errors.push(`${key} cannot be empty`);
    }

    if (id && index > 0) {
      const parentType = commercialEntityTypes[index - 1];
      const parentKey = entityContextKeys[parentType];
      if (!context[parentKey]) {
        errors.push(`${key} requires ${parentKey}`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

export function buildCommercialContextPath(
  context: CommercialContext,
): CommercialContextPath {
  const validation = validateCommercialContext(context);

  if (!validation.valid) {
    throw new Error(`Invalid commercial context: ${validation.errors.join('; ')}`);
  }

  return commercialEntityTypes.flatMap((type) => {
    const id = context[entityContextKeys[type]];
    return id ? [{ type, id }] : [];
  });
}

export function getCommercialContextKey(
  entityType: CommercialEntityType,
): keyof CommercialContext {
  return entityContextKeys[entityType];
}
