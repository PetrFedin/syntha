import type { TransactionalSqlPool } from '@/modules/commercial-execution';

export async function runOrderIdempotencyMigration(input: {
  readonly pool: TransactionalSqlPool;
}): Promise<void> {
  const client = await input.pool.connect();
  await client.query('BEGIN');
  try {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      'syntha-order-idempotency-migration-v6',
    ]);
    await client.query(`ALTER TABLE syntha_lifecycle_idempotency
      DROP CONSTRAINT IF EXISTS syntha_lifecycle_idempotency_command_name_check;
    ALTER TABLE syntha_lifecycle_idempotency
      DROP CONSTRAINT IF EXISTS syntha_lifecycle_idempotency_result_entity_type_check;
    ALTER TABLE syntha_lifecycle_idempotency
      ADD CONSTRAINT syntha_lifecycle_idempotency_command_name_check CHECK (
        command_name IN (
          'CREATE_SEASON',
          'CREATE_CAMPAIGN',
          'CREATE_COLLECTION',
          'CREATE_SHOWROOM',
          'PUBLISH_SHOWROOM',
          'GRANT_SHOWROOM_ACCESS',
          'CREATE_SELECTION',
          'CREATE_ORDER_DRAFT',
          'SUBMIT_ORDER',
          'APPROVE_ORDER',
          'REQUEST_ORDER_AMENDMENT',
          'CONFIRM_ORDER',
          'ACCEPT_ORDER_AMENDMENT',
          'COUNTER_ORDER_AMENDMENT',
          'REJECT_ORDER_AMENDMENT'
        )
      );
    ALTER TABLE syntha_lifecycle_idempotency
      ADD CONSTRAINT syntha_lifecycle_idempotency_result_entity_type_check CHECK (
        result_entity_type IS NULL OR result_entity_type IN (
          'SEASON',
          'CAMPAIGN',
          'COLLECTION',
          'SHOWROOM',
          'SHOWROOM_SNAPSHOT',
          'SHOWROOM_ACCESS_GRANT',
          'SELECTION',
          'ORDER',
          'SUBMITTED_ORDER_SNAPSHOT',
          'ORDER_REVIEW',
          'CONFIRMED_ORDER_VERSION',
          'ORDER_AMENDMENT_RESPONSE'
        )
      );`);
    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original migration failure.
    }
    throw error;
  } finally {
    client.release();
  }
}
