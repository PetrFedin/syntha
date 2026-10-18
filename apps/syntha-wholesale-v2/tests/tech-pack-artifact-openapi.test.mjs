import test from 'node:test';
import assert from 'node:assert/strict';
import { wholesaleV2OpenApi } from '../src/http/openapi-artifacts.mjs';
test('OpenAPI publishes binary Tech Pack artifact export',()=>{const operation=wholesaleV2OpenApi.paths['/plm/tech-packs/{techPackId}/artifacts/{format}']?.post;assert.ok(operation);assert.equal(wholesaleV2OpenApi.info.version,'0.14.0');assert.ok(operation.responses[200].content['application/zip']);assert.ok(operation.responses[200].content['text/html']);assert.ok(operation.parameters.some(item=>item.name==='Idempotency-Key'&&item.required));});
