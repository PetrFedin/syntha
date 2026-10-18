import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=await readFile(path.join(root,'public','modules','tech-pack-artifacts.js'),'utf8');
test('Tech Pack UI uses authenticated idempotent binary export with checksum verification',()=>{for(const fragment of ["method:'POST'",'authorization:`Bearer ${state.token}`',"'idempotency-key':crypto.randomUUID()",'x-content-sha256','URL.createObjectURL','new Blob([html]',"popup.location.replace(objectUrl)"])assert.ok(source.includes(fragment),fragment);assert.match(source,/\\u0421\\u043a\\u0430\\u0447\\u0430\\u0442\\u044c ZIP/);assert.match(source,/\\u041f\\u0435\\u0447\\u0430\\u0442\\u044c \/ PDF/);});
