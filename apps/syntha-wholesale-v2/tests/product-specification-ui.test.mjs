import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'public', 'modules', 'product-specification.js'), 'utf8');
const context = vm.createContext({ Intl, console });
new vm.Script(source, { filename: 'product-specification.js' }).runInContext(context);

function evaluate(expression) {
  return vm.runInContext(expression, context);
}

test('product specification UI converts currency decimals to exact minor units', () => {
  assert.equal(evaluate("parseMoneyMinor('12.34', 'EUR')"), 1234);
  assert.equal(evaluate("parseMoneyMinor('12,34', 'EUR')"), 1234);
  assert.equal(evaluate("parseMoneyMinor('1200', 'JPY')"), 1200);
  assert.equal(evaluate("minorMoneyString(1234, 'EUR')"), '12.34');
  assert.throws(() => evaluate("parseMoneyMinor('12.345', 'EUR')"), /at most 2 decimal places/);
});

test('product specification UI preserves six-decimal consumption and basis-point waste', () => {
  assert.equal(evaluate("parseScaledDecimal('1.500001', 6, 'Consumption')"), 1500001);
  assert.equal(evaluate("trimScaled(1500001, 6)"), '1.500001');
  assert.equal(evaluate("parseWasteBasisPoints('5.25')"), 525);
  assert.equal(evaluate("trimScaled(525, 2)"), '5.25');
  assert.throws(() => evaluate("parseScaledDecimal('1.0000001', 6, 'Consumption')"), /at most 6 decimal places/);
  assert.throws(() => evaluate("parseWasteBasisPoints('100.01')"), /between 0 and 100/);
});
