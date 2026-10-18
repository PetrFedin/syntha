import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('Tech Pack artifact identity is enforced against the same Tech Pack style and brand at DB level',async()=>{const sql=await readFile(path.join(root,'db','migrations','012_tech_pack_artifact_identity_fk.sql'),'utf8');assert.match(sql,/UNIQUE \(id, style_id, brand_id\)/);assert.match(sql,/FOREIGN KEY \(tech_pack_id, style_id, brand_id\)/);assert.match(sql,/REFERENCES product_tech_packs\(id, style_id, brand_id\)/);});
