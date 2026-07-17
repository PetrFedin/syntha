import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(import.meta.dirname, '..');
const requiredMajor = Number(readFileSync(resolve(root, '.nvmrc'), 'utf8').trim());
const actualMajor = Number(process.versions.node.split('.')[0]);

if (actualMajor < requiredMajor) {
  console.error(`Node ${requiredMajor}+ is required; current