import { invariant } from '../core/errors.mjs';

export function createPostgresProductSpecificationStore({ pool } = {}) {
  invariant(pool && typeof pool.connect === 'function' && typeof pool.query === 'function', 'POSTGRES_POOL_REQUIRED', 'PostgreSQL pool is required');
  return Object.freeze({
    async transaction(work) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await work(view(client));
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async snapshot() {
      const [materials, revisions, boms] = await Promise.all([
        payloads(pool, 'product_materials'),
        payloads(pool, 'product_material_revisions'),
        payloads(pool, 'product_boms'),
      ]);
      return Object.freeze({ materials, materialRevisions: revisions, boms });
    },
  });
}

function view(client) {
  return Object.freeze({
    getOrganisation: (id) => getPayload(client, 'organisations', 'id', id),
    getMembership: (organisationId, userId) => getPayloadBy(client, 'memberships', ['organisation_id', 'user_id'], [organisationId, userId]),
    getCollection: (id) => getPayload(client, 'collections', 'id', id),
    getStyle: (id) => getPayload(client, 'product_styles', 'id', id),

    getMaterial: (id) => getPayload(client, 'product_materials', 'id', id, true),
    getMaterialByCode: (brandId, code) => getPayloadBy(client, 'product_materials', ['brand_id', 'code'], [brandId, code]),
    insertMaterial: (value) => insert(
      client,
      'product_materials',
      ['id', 'brand_id', 'code', 'name', 'type', 'status', 'version', 'payload'],
      [value.id, value.brandId, value.code, value.name, value.type, value.status, value.version, value],
      'MATERIAL_ALREADY_EXISTS',
    ),

    getMaterialRevision: (id) => getPayload(client, 'product_material_revisions', 'id', id, true),
    listMaterialRevisions: async (materialId) => {
      const result = await client.query('SELECT payload FROM product_material_revisions WHERE material_id = $1 ORDER BY revision_number', [materialId]);
      return result.rows.map((row) => row.payload);
    },
    getDraftMaterialRevision: (materialId) => getPayloadBy(client, 'product_material_revisions', ['material_id', 'status'], [materialId, 'draft'], true),
    getApprovedMaterialRevision: (materialId) => getPayloadBy(client, 'product_material_revisions', ['material_id', 'status'], [materialId, 'approved'], true),
    insertMaterialRevision: async (value) => {
      try {
        await insert(
          client,
          'product_material_revisions',
          ['id', 'material_id', 'brand_id', 'revision_number', 'status', 'currency', 'uom', 'unit_cost_minor', 'version', 'payload'],
          [value.id, value.materialId, value.brandId, value.revisionNumber, value.status, value.specification.currency, value.specification.uom, value.specification.unitCostMinor, value.version, value],
          'MATERIAL_REVISION_ALREADY_EXISTS',
        );
      } catch (error) {
        if (error?.code === 'MATERIAL_REVISION_ALREADY_EXISTS' && error.details?.constraint === 'product_material_revisions_single_draft_idx') {
          invariant(false, 'MATERIAL_DRAFT_REVISION_EXISTS', 'Material already has a draft revision', { materialId: value.materialId });
        }
        throw error;
      }
    },
    saveMaterialRevision: (value, expectedVersion) => saveVersioned(
      client,
      'product_material_revisions',
      value,
      expectedVersion,
      ['status', 'currency', 'uom', 'unit_cost_minor'],
      [value.status, value.specification.currency, value.specification.uom, value.specification.unitCostMinor],
      'MATERIAL_REVISION_CONCURRENCY_CONFLICT',
    ),

    getBom: (id) => getPayload(client, 'product_boms', 'id', id, true),
    listBomsByStyle: async (styleId) => {
      const result = await client.query('SELECT payload FROM product_boms WHERE style_id = $1 ORDER BY revision_number', [styleId]);
      return result.rows.map((row) => row.payload);
    },
    getActiveBomByStyle: async (styleId) => {
      const result = await client.query("SELECT payload FROM product_boms WHERE style_id = $1 AND status IN ('draft', 'submitted') ORDER BY revision_number DESC LIMIT 1 FOR UPDATE", [styleId]);
      return result.rows[0]?.payload;
    },
    getApprovedBomByStyle: (styleId) => getPayloadBy(client, 'product_boms', ['style_id', 'status'], [styleId, 'approved'], true),
    insertBom: async (value) => {
      try {
        await insert(
          client,
          'product_boms',
          ['id', 'style_id', 'brand_id', 'collection_id', 'style_version', 'revision_number', 'status', 'currency', 'material_cost_minor', 'version', 'payload'],
          [value.id, value.styleId, value.brandId, value.collectionId, value.styleVersion, value.revisionNumber, value.status, value.currency, value.materialCostMinor, value.version, value],
          'BOM_ALREADY_EXISTS',
        );
      } catch (error) {
        if (error?.code === 'BOM_ALREADY_EXISTS' && error.details?.constraint === 'product_boms_single_active_revision_idx') {
          invariant(false, 'ACTIVE_BOM_REVISION_EXISTS', 'Style already has a draft or submitted BOM revision', { styleId: value.styleId });
        }
        throw error;
      }
    },
    saveBom: (value, expectedVersion) => saveVersioned(
      client,
      'product_boms',
      value,
      expectedVersion,
      ['status', 'material_cost_minor'],
      [value.status, value.materialCostMinor],
      'BOM_CONCURRENCY_CONFLICT',
    ),

    getCommand: async (id) => {
      const result = await client.query('SELECT id, fingerprint, actor_id, result, completed_at FROM commands WHERE id = $1', [id]);
      return commandFromRow(result.rows[0]);
    },
    insertCommand: async (value) => {
      try {
        await client.query(
          'INSERT INTO commands (id, fingerprint, actor_id, result, completed_at) VALUES ($1, $2, $3, $4::jsonb, $5)',
          [value.id, value.fingerprint, value.actorId, JSON.stringify(value.result), value.completedAt],
        );
      } catch (error) {
        if (error?.code === '23505') invariant(false, 'COMMAND_ALREADY_EXISTS', 'Command already exists', { commandId: value.id });
        throw error;
      }
    },
    appendOutbox: async (event) => {
      try {
        await client.query(
          `INSERT INTO outbox_events (id, event_type, aggregate_id, status, event, published_at)
           VALUES ($1, $2, $3, 'pending', $4::jsonb, NULL)`,
          [event.id, event.type, event.aggregateId, JSON.stringify(event)],
        );
      } catch (error) {
        if (error?.code === '23505') invariant(false, 'OUTBOX_EVENT_ALREADY_EXISTS', 'Outbox event already exists', { eventId: event.id });
        throw error;
      }
    },
  });
}

async function insert(client, table, columns, values, duplicateCode) {
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const serialized = values.map((value, index) => columns[index] === 'payload' ? JSON.stringify(value) : value);
  try {
    await client.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`, serialized);
  } catch (error) {
    if (error?.code === '23505') invariant(false, duplicateCode, 'Entity already exists', { table, constraint: error.constraint });
    throw error;
  }
}

async function saveVersioned(client, table, value, expectedVersion, columns, values, conflictCode) {
  invariant(value.version === expectedVersion + 1, 'VERSION_INCREMENT_INVALID', 'Version must increment exactly once');
  const assignments = columns.map((column, index) => `${column} = $${index + 1}`);
  assignments.push(`version = $${columns.length + 1}`);
  assignments.push(`payload = $${columns.length + 2}::jsonb`);
  const result = await client.query(
    `UPDATE ${table} SET ${assignments.join(', ')} WHERE id = $${columns.length + 3} AND version = $${columns.length + 4}`,
    [...values, value.version, JSON.stringify(value), value.id, expectedVersion],
  );
  invariant(result.rowCount === 1, conflictCode, 'Optimistic concurrency conflict', { id: value.id, expectedVersion });
}

async function getPayload(client, table, column, value, lock = false) {
  const result = await client.query(`SELECT payload FROM ${table} WHERE ${column} = $1${lock ? ' FOR UPDATE' : ''}`, [value]);
  return result.rows[0]?.payload;
}

async function getPayloadBy(client, table, columns, values, lock = false) {
  const where = columns.map((column, index) => `${column} = $${index + 1}`).join(' AND ');
  const result = await client.query(`SELECT payload FROM ${table} WHERE ${where}${lock ? ' FOR UPDATE' : ''}`, values);
  return result.rows[0]?.payload;
}

async function payloads(queryable, table) {
  const result = await queryable.query(`SELECT payload FROM ${table} ORDER BY id`);
  return result.rows.map((row) => row.payload);
}

function commandFromRow(row) {
  if (!row) return undefined;
  return Object.freeze({
    id: row.id,
    fingerprint: row.fingerprint,
    actorId: row.actor_id,
    result: row.result,
    completedAt: row.completed_at.toISOString?.() ?? row.completed_at,
  });
}
