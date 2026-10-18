import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'public', 'modules', 'measurement-development.js'), 'utf8');
const context = vm.createContext({ console, renderProductDevelopment: () => ({ append() {} }) });
new vm.Script(source, { filename: 'measurement-development.js' }).runInContext(context);
function evaluate(expression) { return vm.runInContext(expression, context); }

test('measurement UI parses manual size targets as exact integer millimetres', () => {
  assert.deepEqual(JSON.parse(evaluate("JSON.stringify(parseManualTargets('S=500, M=540', ['S','M','L']))")), { S: 500, M: 540 });
  assert.deepEqual(JSON.parse(evaluate("JSON.stringify(parseManualTargets('', ['S','M']))")), {});
  assert.throws(() => evaluate("parseManualTargets('XL=600', ['S','M','L'])"), /outside size grid/);
  assert.throws(() => evaluate("parseManualTargets('M=540.5', ['S','M','L'])"), /MANUAL_TARGET_FORMAT/);
  assert.throws(() => evaluate("parseManualTargets('M=5001', ['S','M','L'])"), /MANUAL_TARGET_RANGE/);
});
