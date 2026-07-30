import type { OrganisationId } from '@/modules/organisations';

export type CampaignId = string & { readonly __brand: 'CampaignId' };
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

export interface Campaign {
  readonly id: CampaignId;
  readonly organisationId: OrganisationId;
  readonly seasonId: string;
  readonly code: string;
  readonly name: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: CampaignStatus;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

export class CampaignDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CampaignDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new CampaignDomainError(`${label} must not be empty`);
  return normalized;
}

export function campaignId(value: string): CampaignId {
  return requiredText(value, 'Campaign id') as CampaignId;
}

export function createCampaign(input: {
  readonly id: string;
  readonly organisationId: OrganisationId;
  readonly seasonId: string;
  readonly code: string;
  readonly name: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly ownerCredentialId: string;
  readonly now: Date;
}): Campaign {
  if (input.startsAt.getTime() >= input.endsAt.getTime()) {
    throw new CampaignDomainError('Campaign start must be before campaign end');
  }
  const timestamp = input.now.toISOString();
  return Object.freeze({
    id: campaignId(input.id),
    organisationId: input.organisationId,
    seasonId: requiredText(input.seasonId, 'Season id'),
    code: requiredText(input.code, 'Campaign code').toUpperCase(),
    name: requiredText(input.name, 'Campaign name'),
    startsAt: input.startsAt.toISOString(),
    endsAt: input.endsAt.toISOString(),
    status: 'DRAFT' as const,
    ownerCredentialId: requiredText(input.ownerCredentialId, 'Owner credential id'),
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
  });
}

const transitions: Readonly<Record<CampaignStatus, readonly CampaignStatus[]>> = Object.freeze({
  DRAFT: ['ACTIVE', 'ARCHIVED'],
  ACTIVE: ['CLOSED'],
  CLOSED: ['ARCHIVED'],
  ARCHIVED: [],
});

export function reviseCampaign(
  campaign: Campaign,
  input: {
    readonly name?: string;
    readonly startsAt?: Date;
    readonly endsAt?: Date;
    readonly status?: CampaignStatus;
    readonly now: Date;
  },
): Campaign {
  const startsAt = input.startsAt ?? new Date(campaign.startsAt);
  const endsAt = input.endsAt ?? new Date(campaign.endsAt);
  if (startsAt.getTime() >= endsAt.getTime()) {
    throw new CampaignDomainError('Campaign start must be before campaign end');
  }
  const status = input.status ?? campaign.status;
  if (status !== campaign.status && !transitions[campaign.status].includes(status)) {
    throw new CampaignDomainError(`Campaign transition ${campaign.status} -> ${status} is not allowed`);
  }
  return Object.freeze({
    ...campaign,
    name: input.name === undefined ? campaign.name : requiredText(input.name, 'Campaign name'),
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    status,
    updatedAt: input.now.toISOString(),
    version: campaign.version + 1,
  });
}
