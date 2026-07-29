import { createHash } from 'node:crypto';

import type { OrganisationId } from '@/modules/organisations';

export type LifecycleCreateCommandName =
  | 'CREATE_SEASON'
  | 'CREATE_CAMPAIGN'
  | 'CREATE_COLLECTION'
  | 'CREATE_SHOWROOM'
  | 'PUBLISH_SHOWROOM'
  | 'GRANT_SHOWROOM_ACCESS'
  | 'CREATE_SELECTION'
  | 'CREATE_ORDER_DRAFT'
  | 'SUBMIT_ORDER';

export type LifecycleResultEntityType =
  | 'SEASON'
  | 'CAMPAIGN'
  | 'COLLECTION'
  | 'SHOWROOM'
  | 'SHOWROOM_SNAPSHOT'
  | 'SHOWROOM_ACCESS_GRANT'
  | 'SELECTION'
  | 'ORDER'
  | 'SUBMITTED_ORDER_SNAPSHOT';

export interface LifecycleCreateCommand {
  readonly organisationId: OrganisationId;
  readonly commandName: LifecycleCreateCommandName;
  readonly idempotencyKey: string;
  readonly fingerprint: string;
  readonly actorCredentialId: string;
  readonly requestedAt: string;
}

export interface LifecycleCreateResult<Entity> {
  readonly entity: Entity;
  readonly replayed: boolean;
}

export class LifecycleIdempotencyConflict extends Error {
  constructor(message = 'Idempotency key was already used for another command') {
    super(message);
    this.name = 'LifecycleIdempotencyConflict';
  }
}

export class LifecycleIdempotencyInProgress extends Error {
  constructor() {
    super('The idempotent command is still in progress');
    this.name = 'LifecycleIdempotencyInProgress';
  }
}

export class LifecycleIdempotencyResultMissing extends Error {
  constructor(entityId: string) {
    super(`The idempotent command result ${entityId} is missing`);
    this.name = 'LifecycleIdempotencyResultMissing';
  }
}

export function lifecycleIdempotencyKey(value: string): string {
  const normalized = value.trim();
  if (normalized.length < 8 || normalized.length > 128) {
    throw new LifecycleIdempotencyConflict(
      'Idempotency key must contain between 8 and 128 characters',
    );
  }
  if (!/^[A-Za-z0-9._:-]+$/.test(normalized)) {
    throw new LifecycleIdempotencyConflict(
      'Idempotency key contains unsupported characters',
    );
  }
  return normalized;
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .map((key) => [key, canonicalize(record[key])]),
  );
}

export function fingerprintLifecyclePayload(value: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(value)), 'utf8')
    .digest('hex');
}

export function lifecycleCreateCommand(input: {
  readonly organisationId: OrganisationId;
  readonly commandName: LifecycleCreateCommandName;
  readonly idempotencyKey: string;
  readonly payload: unknown;
  readonly actorCredentialId: string;
  readonly requestedAt: Date;
}): LifecycleCreateCommand {
  const actorCredentialId = input.actorCredentialId.trim();
  if (!actorCredentialId) {
    throw new LifecycleIdempotencyConflict('Actor credential id is required');
  }
  return Object.freeze({
    organisationId: input.organisationId,
    commandName: input.commandName,
    idempotencyKey: lifecycleIdempotencyKey(input.idempotencyKey),
    fingerprint: fingerprintLifecyclePayload(input.payload),
    actorCredentialId,
    requestedAt: input.requestedAt.toISOString(),
  });
}
