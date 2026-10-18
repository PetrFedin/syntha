import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const requiredMajor = Number(readFileSync(resolve(root, '.nvmrc'), 'utf8').trim());
const actualMajor = Number(process.versions.node.split('.')[0]);

if (!Number.isInteger(requiredMajor) || requiredMajor < 1) {
  console.error('Invalid .nvmrc: expected a positive Node major version.');
  process.exit(1);
}

if (actualMajor < requiredMajor) {
  console.error(`Node ${requiredMajor}+ is required; current version is ${process.versions.node}.`);
  process.exit(1);
}

for (const name of Object.keys(process.env)) {
  if (/SECRET|TOKEN|PASSWORD|PRIVATE_KEY/i.test(name) && /^NEXT_PUBLIC_/i.test(name)) {
    console.error(`Sensitive environment variable must not be public: ${name}`);
    process.exit(1);
  }
}

console.log(`Foundation preflight passed on Node ${process.versions.node}.`);
