import test from 'node:test';
import assert from 'node:assert/strict';
import { DomainError } from '../src/core/errors.mjs';
import { normalizeHttpError } from '../src/http/api.mjs';

test('product specification lifecycle collisions are HTTP conflicts', () => {
  for (const code of ['MATERIAL_CODE_EXISTS', 'MATERIAL_DRAFT_REVISION_EXISTS', 'ACTIVE_BOM_REVISION_EXISTS']) {
    const normalized = normalizeHttpError(new DomainError(code, 'conflict'));
    assert.equal(normalized.status, 409, code);
  }
});
