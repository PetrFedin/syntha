import type {
  SqlExecutor,
  TransactionalSqlClient,
} from '@/modules/commercial-execution';

import {
  LifecycleIdempotencyConflict,
  LifecycleIdempotencyInProgress,
  LifecycleIdempotencyResultMissing,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
  type LifecycleResultEntityType,
} from '../domain/lifecycle-create-command';

interface IdempotencyRow {
  readonly fingerprint: string;
  readonly actorCredentialId: string;
  readonly status: 'IN_PROGRESS' | 'COMPLETED';
  readonly resultEntityType: LifecycleResultEntityType | null;
  readonly resultEntityId: string | null;
}

const selection = `SELECT
  fingerprint,
  actor_credential_id AS "actorCredentialId",
  status,
  result_entity_type AS "resultEntityType",
  result_entity_id AS "resultEntityId"
FROM syntha_lifecycle_idempotency
WHERE organisation_id = $1 AND command_name = $2 AND idempotency_key = $3`;

function validateRecord(
  row: IdempotencyRow,
  command: LifecycleCreateCommand,
): void {
  if (
    row.fingerprint !== command.fingerprint ||
    row.actorCredentialId !== command.actorCredentialId
  ) {
    throw new LifecycleIdempotencyConflict();
  }
}

export async function findLifecycleCreateReplay<Entity>(input: {
  readonly executor: SqlExecutor;
  readonly command: LifecycleCreateCommand;
  readonly expectedEntityType: LifecycleResultEntityType;
  readonly loadEntity: (executor: SqlExecutor, id: string) => Promise<Entity | null>;
}): Promise<Entity | null> {
  const result = await input.executor.query<IdempotencyRow>(selection, [
    input.command.organisationId,
    input.command.commandName,
    input.command.idempotencyKey,
  ]);
  const row = result.rows[0];
  if (!row) return null;
  validateRecord(row, input.command);
  if (row.status !== 'COMPLETED') throw new LifecycleIdempotencyInProgress();
  if (
    row.resultEntityType !== input.expectedEntityType ||
    !row.resultEntityId
  ) {
    throw new LifecycleIdempotencyConflict('Idempotency result type does not match command');
  }
  const entity = await input.loadEntity(input.executor, row.resultEntityId);
  if (!entity) throw new LifecycleIdempotencyResultMissing(row.resultEntityId);
  return entity;
}

export async function executeLifecycleCreate<Entity>(input: {
  readonly client: TransactionalSqlClient;
  readonly command: LifecycleCreateCommand;
  readonly resultEntityType: LifecycleResultEntityType;
  readonly resultEntityId: string;
  readonly createEntity: () => Promise<Entity>;
  readonly loadEntity: (executor: SqlExecutor, id: string) => Promise<Entity | null>;
}): Promise<LifecycleCreateResult<Entity>> {
  const inserted = await input.client.query(
    `INSERT INTO syntha_lifecycle_idempotency
       (organisation_id, command_name, idempotency_key, fingerprint,
        actor_credential_id, status, created_at)
     VALUES ($1, $2, $3, $4, $5, 'IN_PROGRESS', $6::timestamptz)
     ON CONFLICT (organisation_id, command_name, idempotency_key) DO NOTHING`,
    [
      input.command.organisationId,
      input.command.commandName,
      input.command.idempotencyKey,
      input.command.fingerprint,
      input.command.actorCredentialId,
      input.command.requestedAt,
    ],
  );

  const locked = await input.client.query<IdempotencyRow>(
    `${selection} FOR UPDATE`,
    [
      input.command.organisationId,
      input.command.commandName,
      input.command.idempotencyKey,
    ],
  );
  const row = locked.rows[0];
  if (!row) {
    throw new LifecycleIdempotencyConflict('Idempotency reservation was not created');
  }
  validateRecord(row, input.command);

  if (inserted.rowCount === 0) {
    if (row.status !== 'COMPLETED') throw new LifecycleIdempotencyInProgress();
    if (
      row.resultEntityType !== input.resultEntityType ||
      !row.resultEntityId
    ) {
      throw new LifecycleIdempotencyConflict('Idempotency result type does not match command');
    }
    const replay = await input.loadEntity(input.client, row.resultEntityId);
    if (!replay) throw new LifecycleIdempotencyResultMissing(row.resultEntityId);
    return Object.freeze({ entity: replay, replayed: true });
  }

  const entity = await input.createEntity();
  const completed = await input.client.query(
    `UPDATE syntha_lifecycle_idempotency
     SET status = 'COMPLETED',
         result_entity_type = $1,
         result_entity_id = $2,
         completed_at = $3::timestamptz
     WHERE organisation_id = $4
       AND command_name = $5
       AND idempotency_key = $6
       AND status = 'IN_PROGRESS'`,
    [
      input.resultEntityType,
      input.resultEntityId,
      input.command.requestedAt,
      input.command.organisationId,
      input.command.commandName,
      input.command.idempotencyKey,
    ],
  );
  if (completed.rowCount !== 1) {
    throw new LifecycleIdempotencyConflict('Idempotency command could not be completed');
  }
  return Object.freeze({ entity, replayed: false });
}
