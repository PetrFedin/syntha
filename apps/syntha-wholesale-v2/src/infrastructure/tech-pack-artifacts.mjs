import { createHash } from 'node:crypto';
import { invariant } from '../core/errors.mjs';

const FORMATS = Object.freeze(['html', 'zip']);
const MAX_ARTIFACT_BYTES = 10 * 1024 * 1024;

export function renderTechPackArtifacts(techPack) {
  invariant(techPack?.id && techPack.status === 'generated' && techPack.manifest, 'GENERATED_TECH_PACK_REQUIRED', 'Generated Tech Pack is required');
  const document = techPackDocument(techPack);
  const json = Buffer.from(`${stableJson(document)}\n`, 'utf8');
  const html = Buffer.from(renderPrintableHtml(document), 'utf8');
  const zip = createStoredZip([{ name: 'manifest.json', data: json }, { name: 'tech-pack.html', data: html }], techPack.generatedAt);
  return Object.freeze([
    artifact('html', 'text/html; charset=utf-8', `${safeName(techPack.styleCode)}-tech-pack-r${techPack.revisionNumber}.html`, html, techPack.generatedAt),
    artifact('zip', 'application/zip', `${safeName(techPack.styleCode)}-tech-pack-r${techPack.revisionNumber}.zip`, zip, techPack.generatedAt),
  ]);
}

export function assertTechPackArtifactFormat(format) {
  const normalized = String(format ?? '').trim().toLowerCase();
  invariant(FORMATS.includes(normalized), 'TECH_PACK_ARTIFACT_FORMAT_INVALID', 'Tech Pack artifact format is invalid', { format });
  return normalized;
}

export function verifyTechPackArtifact(artifactValue) {
  const content = Buffer.isBuffer(artifactValue?.content) ? artifactValue.content : Buffer.from(artifactValue?.content ?? []);
  const sha256 = digest(content);
  invariant(artifactValue?.sizeBytes === content.length && artifactValue?.sha256 === sha256, 'TECH_PACK_ARTIFACT_INTEGRITY_FAILED', 'Tech Pack artifact content does not match persisted metadata', { expectedSizeBytes: artifactValue?.sizeBytes, actualSizeBytes: content.length, expectedSha256: artifactValue?.sha256, actualSha256: sha256 });
  return Object.freeze({ ...artifactValue, content });
}

function techPackDocument(techPack) {
  return Object.freeze({ schemaVersion: 1, techPackId: techPack.id, revisionNumber: techPack.revisionNumber, styleId: techPack.styleId, styleCode: techPack.styleCode, generatedAt: techPack.generatedAt, generatedBy: techPack.generatedBy, sourceFingerprint: techPack.sourceFingerprint, sources: techPack.sources, manifest: techPack.manifest });
}
function artifact(format, contentType, filename, content, createdAt) {
  invariant(content.length <= MAX_ARTIFACT_BYTES, 'TECH_PACK_ARTIFACT_TOO_LARGE', 'Generated Tech Pack artifact exceeds size limit', { format, maxBytes: MAX_ARTIFACT_BYTES, actualBytes: content.length });
  return Object.freeze({ format, contentType, filename, sizeBytes: content.length, sha256: digest(content), createdAt, content });
}
function renderPrintableHtml(document) {
  const style = document.manifest.style; const bom = document.manifest.billOfMaterials; const chart = document.manifest.measurementChart; const fit = document.manifest.fitApproval;
  const bomRows = bom.lines.map((line) => `<tr><td>${e(line.componentKey)}</td><td>${e(line.componentRole)}</td><td>${e(line.material?.materialCode)}</td><td>${e(line.material?.materialName)}</td><td>${formatMicrounits(line.consumptionMicrounits)} ${e(line.material?.uom)}</td><td>${formatBasisPoints(line.wasteBasisPoints)}</td><td>${formatMoneyMinor(line.lineCostMinor, bom.currency)}</td></tr>`).join('');
  const sizeHeaders = style.sizeGrid.sizes.map((size) => `<th>${e(size)}</th>`).join('');
  const measurementRows = chart.points.map((point) => `<tr><td>${e(point.code)}</td><td>${e(point.description)}</td><td>-${point.toleranceMinusMm}/+${point.tolerancePlusMm} mm</td>${style.sizeGrid.sizes.map((size) => `<td>${point.targetsMm[size]} mm</td>`).join('')}</tr>`).join('');
  const fitRows = fit.measurements.map((item) => `<tr><td>${e(item.pointCode)}</td><td>${e(item.description)}</td><td>${item.targetMm} mm</td><td>${item.actualMm} mm</td><td>${item.deviationMm} mm</td><td>${item.withinTolerance ? 'PASS' : 'FAIL'}</td></tr>`).join('');
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(style.code)} Tech Pack r${document.revisionNumber}</title><style>${printCss()}</style></head><body><header><div class="brand">SYNTHA / TECH PACK</div><h1>${e(style.code)} — ${e(style.name)}</h1><div class="meta">Revision ${document.revisionNumber} · Generated ${e(document.generatedAt)} · Source ${e(document.sourceFingerprint)}</div></header><main><section><h2>Product</h2><dl><dt>Category</dt><dd>${e(style.category)}</dd><dt>Gender</dt><dd>${e(style.gender)}</dd><dt>Size grid</dt><dd>${e(style.sizeGrid.code)} (${style.sizeGrid.sizes.map(e).join(' / ')})</dd><dt>Style version</dt><dd>${style.version}</dd></dl></section><section><h2>Bill of Materials · r${bom.revisionNumber}</h2><div class="total">Material cost: ${formatMoneyMinor(bom.materialCostMinor, bom.currency)}</div><table><thead><tr><th>Key</th><th>Role</th><th>Material</th><th>Name</th><th>Consumption</th><th>Waste</th><th>Cost</th></tr></thead><tbody>${bomRows}</tbody></table></section><section><h2>Measurement Chart · r${chart.revisionNumber}</h2><table><thead><tr><th>POM</th><th>Description</th><th>Tolerance</th>${sizeHeaders}</tr></thead><tbody>${measurementRows}</tbody></table></section><section><h2>Fit Approval · ${e(fit.sampleType.toUpperCase())} ${fit.sampleNumber} · ${e(fit.size)}</h2><div class="total">Verdict: ${e(fit.result.verdict.toUpperCase())} · Pass ${fit.result.passCount} / Fail ${fit.result.failCount} · Approved ${e(fit.approvedAt)}</div><table><thead><tr><th>POM</th><th>Description</th><th>Target</th><th>Actual</th><th>Delta</th><th>Result</th></tr></thead><tbody>${fitRows}</tbody></table></section></main><footer>Immutable source fingerprint: ${e(document.sourceFingerprint)}<br>Use the browser Print command to save this exact revision as PDF.</footer></body></html>`;
}
function printCss() { return `:root{font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff}*{box-sizing:border-box}body{margin:0;padding:32px;font-size:12px}header{border-bottom:3px solid #111;padding-bottom:16px;margin-bottom:24px}.brand{font-size:11px;letter-spacing:.16em;font-weight:700}h1{font-size:28px;margin:8px 0}h2{font-size:18px;margin:0 0 10px}section{break-inside:avoid;margin:0 0 28px}.meta,footer{color:#555;font-size:10px}.total{font-weight:700;margin:0 0 8px}dl{display:grid;grid-template-columns:140px 1fr;gap:5px 12px}dt{font-weight:700}dd{margin:0}table{border-collapse:collapse;width:100%;font-size:10px}th,td{border:1px solid #bbb;padding:6px;vertical-align:top;text-align:left}th{background:#eee}footer{border-top:1px solid #bbb;padding-top:12px}@media print{body{padding:0}@page{size:A4 landscape;margin:12mm}}`; }
function createStoredZip(files, timestamp) {
  const date = zipDate(timestamp); const locals = []; const centrals = []; let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, 'utf8'); const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data); const crc = crc32(data); const local = Buffer.alloc(30 + name.length); let p = 0;
    p = u32(local,p,0x04034b50); p=u16(local,p,20); p=u16(local,p,0x0800); p=u16(local,p,0); p=u16(local,p,date.time); p=u16(local,p,date.date); p=u32(local,p,crc); p=u32(local,p,data.length); p=u32(local,p,data.length); p=u16(local,p,name.length); p=u16(local,p,0); name.copy(local,p); locals.push(local,data);
    const central=Buffer.alloc(46+name.length); p=0; p=u32(central,p,0x02014b50); p=u16(central,p,20); p=u16(central,p,20); p=u16(central,p,0x0800); p=u16(central,p,0); p=u16(central,p,date.time); p=u16(central,p,date.date); p=u32(central,p,crc); p=u32(central,p,data.length); p=u32(central,p,data.length); p=u16(central,p,name.length); p=u16(central,p,0); p=u16(central,p,0); p=u16(central,p,0); p=u16(central,p,0); p=u32(central,p,0); p=u32(central,p,offset); name.copy(central,p); centrals.push(central); offset+=local.length+data.length;
  }
  const centralDirectory=Buffer.concat(centrals); const end=Buffer.alloc(22); let p=0; p=u32(end,p,0x06054b50); p=u16(end,p,0); p=u16(end,p,0); p=u16(end,p,files.length); p=u16(end,p,files.length); p=u32(end,p,centralDirectory.length); p=u32(end,p,offset); u16(end,p,0); return Buffer.concat([...locals,centralDirectory,end]);
}
function zipDate(value) { const date=new Date(value); invariant(Number.isFinite(date.valueOf()),'TECH_PACK_ARTIFACT_TIMESTAMP_INVALID','Tech Pack generatedAt must be a valid timestamp'); const year=Math.max(1980,Math.min(2107,date.getUTCFullYear())); return { time:(date.getUTCHours()<<11)|(date.getUTCMinutes()<<5)|Math.floor(date.getUTCSeconds()/2), date:((year-1980)<<9)|((date.getUTCMonth()+1)<<5)|date.getUTCDate() }; }
function crc32(buffer) { let crc=0xffffffff; for(const byte of buffer){crc^=byte;for(let i=0;i<8;i+=1)crc=(crc>>>1)^(0xedb88320&-(crc&1));} return (crc^0xffffffff)>>>0; }
function u16(buffer,offset,value){buffer.writeUInt16LE(value&0xffff,offset);return offset+2;} function u32(buffer,offset,value){buffer.writeUInt32LE(value>>>0,offset);return offset+4;}
function digest(content){return createHash('sha256').update(content).digest('hex');} function stableJson(value){return JSON.stringify(sort(value),null,2);} function sort(value){if(Array.isArray(value))return value.map(sort);if(!value||typeof value!=='object')return value;return Object.fromEntries(Object.keys(value).sort().map((key)=>[key,sort(value[key])]));}
function safeName(value){const safe=String(value??'').trim().replace(/[^A-Za-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');return safe||'style';} function e(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function formatMicrounits(value){return(Number(value||0)/1_000_000).toLocaleString('en-US',{maximumFractionDigits:6});} function formatBasisPoints(value){return`${(Number(value||0)/100).toLocaleString('en-US',{maximumFractionDigits:2})}%`;} function formatMoneyMinor(value,currency){return`${(Number(value||0)/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} ${e(currency)}`;}
