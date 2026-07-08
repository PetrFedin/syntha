/**
 * Factory tech pack export — 6 print sheets (ole_globirds layout) поверх Workshop 2 dossier SoT.
 * Данные: sketch pins, measurements, composition label, BOM, colorways, qty bridge.
 */
import { partitionHandbookAndFree } from '@/lib/production/workshop2-phase1-attribute-partition';
import { resolvedHandbookDisplayLabel } from '@/lib/production/workshop2-resolved-handbook-display-label';
import { buildColorwayRowsFromDossier } from '@/lib/production/workshop2-colorway-palette';
import {
  buildCompositionLabelSpecExportHtml,
  buildWorkshop2MeasurementsExportHtml,
  type Workshop2FinalTzSpecExportContext,
} from '@/lib/production/workshop2-final-tz-spec-export';
import { parseMatRowsFromDossier } from '@/lib/production/workshop2-material-mat-rows';
import {
  SKETCH_SHEET_VIEW_LABELS,
  normalizeSketchSheets,
} from '@/lib/production/workshop2-sketch-sheets';
import type {
  Workshop2DossierPhase1,
  Workshop2Phase1CategorySketchAnnotation,
  Workshop2Phase1SketchSheet,
  Workshop2SketchSheetViewKind,
} from '@/lib/production/workshop2-dossier-phase1.types';
import { W2_COMPOSITION_LABEL_CARE_SYMBOL_CATALOG } from '@/lib/production/workshop2-composition-label-spec-constants';
import { workshop2CompositionLabelSpecHasExportableContent } from '@/lib/production/workshop2-composition-label-spec-utils';

export type Workshop2TechPackExportSheetId =
  | 'cover'
  | 'sketch-front'
  | 'sketch-back'
  | 'labels-trims'
  | 'colorways'
  | 'size-qty';

export type Workshop2TechPackExportSheetMeta = {
  id: Workshop2TechPackExportSheetId;
  sheetNo: number;
  titleRu: string;
  titleEn: string;
  summaryRu: string;
};

export const WORKSHOP2_TECHPACK_EXPORT_SHEETS: readonly Workshop2TechPackExportSheetMeta[] = [
  {
    id: 'cover',
    sheetNo: 1,
    titleRu: 'Обложка',
    titleEn: 'Cover / summary',
    summaryRu: 'Meta, front/back sketch, BOM, qty по размерам',
  },
  {
    id: 'sketch-front',
    sheetNo: 2,
    titleRu: 'Technical sketch · front',
    titleEn: 'Technical sketch · front',
    summaryRu: 'Анфас + callouts + construction notes',
  },
  {
    id: 'sketch-back',
    sheetNo: 3,
    titleRu: 'Technical sketch · back',
    titleEn: 'Technical sketch · back',
    summaryRu: 'Спина + callouts + construction notes',
  },
  {
    id: 'labels-trims',
    sheetNo: 4,
    titleRu: 'Labels & trims',
    titleEn: 'Labels & trims',
    summaryRu: 'Brand / size / care hotspots из составника',
  },
  {
    id: 'colorways',
    sheetNo: 5,
    titleRu: 'Colorways',
    titleEn: 'Colorways',
    summaryRu: 'Pantone + shell / lining / trim по colorway',
  },
  {
    id: 'size-qty',
    sheetNo: 6,
    titleRu: 'Size chart + qty',
    titleEn: 'Size chart + qty',
    summaryRu: 'POM A–E, sample size, qty color × size',
  },
] as const;

export type Workshop2TechPackConstructionNotePreset = {
  id: string;
  labelRu: string;
  labelEn: string;
  icon: string;
};

/** Библиотека construction presets (Additional notes на sketch-листах). */
export const W2_TECHPACK_CONSTRUCTION_NOTE_PRESETS: readonly Workshop2TechPackConstructionNotePreset[] =
  [
    { id: 'fully-lined', labelRu: 'На подкладке', labelEn: 'Fully lined', icon: '◧' },
    { id: 'shoulder-pads', labelRu: 'Плечевые', labelEn: 'Shoulder pads', icon: '▭' },
    { id: 'seam-1_5', labelRu: 'Припуск шва 1,5 см', labelEn: 'Seam allowance 1.5 cm', icon: '↔' },
    { id: 'topstitch-1', labelRu: 'Отстрочка 1 см', labelEn: 'Topstitch 1 cm', icon: '—' },
    {
      id: 'interfaced-collar',
      labelRu: 'Воротник на клеевом',
      labelEn: 'Interfaced collar',
      icon: '⌒',
    },
    { id: 'hidden-zip', labelRu: 'Молния потайная', labelEn: 'Hidden zip', icon: '⫸' },
  ] as const;

export type Workshop2TechPackQtyBridgeRow = {
  colorLabel: string;
  sizeLabel: string;
  qty: number;
};

export type Workshop2TechPackExportOptions = {
  /** Подсказка со ссылкой на B2B matrix / working order, если qty не в досье. */
  qtyBridgeNote?: string;
  /** Опциональные строки qty color×size (P1 bridge). */
  qtyByColorSize?: Workshop2TechPackQtyBridgeRow[];
  seasonLabel?: string;
};

export type Workshop2TechPackSheetReadiness = {
  id: Workshop2TechPackExportSheetId;
  ok: boolean;
  missingRu: string[];
};

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bilingual(
  ru: string,
  en: string,
  lang?: Workshop2FinalTzSpecExportContext['exportLanguage']
): string {
  if (lang === 'ru') return escHtml(ru);
  if (lang === 'ru_zh') return `${escHtml(ru)} / ${escHtml(en.replace(/[a-z]/gi, (c) => c))}`;
  return `${escHtml(ru)} <span class="muted-en">/ ${escHtml(en)}</span>`;
}

function findSketchSheetByView(
  dossier: Workshop2DossierPhase1,
  viewKind: Workshop2SketchSheetViewKind
): Workshop2Phase1SketchSheet | undefined {
  return normalizeSketchSheets(dossier.sketchSheets).find((s) => s.viewKind === viewKind);
}

function sampleSizeLabel(dossier: Workshop2DossierPhase1): string {
  const assign = dossier.assignments?.find(
    (a) => a.kind === 'canonical' && a.attributeId === 'sampleBaseSize'
  );
  const { hbs } = partitionHandbookAndFree(assign);
  const first = hbs[0];
  if (!first?.parameterId) return '—';
  return resolvedHandbookDisplayLabel('sampleBaseSize', first.parameterId, first.displayLabel);
}

function seasonFromDossier(dossier: Workshop2DossierPhase1, fallback?: string): string {
  const assign = dossier.assignments?.find(
    (a) => a.kind === 'canonical' && a.attributeId === 'season'
  );
  const val = assign?.values?.[0];
  const label = (val?.displayLabel ?? val?.text ?? '').trim();
  return label || fallback?.trim() || '—';
}

function matParameterLabelMap(): Map<string, string> {
  return new Map([
    ['shell', 'Shell / основа'],
    ['lining', 'Lining / подклад'],
    ['trim', 'Trim / отделка'],
    ['buttons', 'Buttons / пуговицы'],
    ['zipper', 'Zipper / молния'],
  ]);
}

function bomSummaryRows(dossier: Workshop2DossierPhase1): { role: string; detail: string }[] {
  const rows = parseMatRowsFromDossier(dossier, matParameterLabelMap());
  if (!rows.length) return [];
  return rows.slice(0, 8).map((r) => ({
    role: r.label?.trim() || r.parameterId || 'Material',
    detail: r.pct > 0 ? `${r.pct}%` : '—',
  }));
}

function pinCalloutLabelRu(pin: Workshop2Phase1CategorySketchAnnotation, index: number): string {
  const dim = [pin.dimensionLabel, pin.dimensionValueText].filter(Boolean).join(' ');
  return pin.text?.trim() || pin.linkedMaterialNote?.trim() || dim || `Точка ${index}`;
}

function pinCalloutLabelEn(pin: Workshop2Phase1CategorySketchAnnotation, index: number): string {
  const dim = [pin.dimensionLabel, pin.dimensionValueText].filter(Boolean).join(' ');
  const mat = pin.linkedMaterialNote?.trim();
  if (mat && !pin.text?.trim()) return mat;
  if (dim) return dim;
  return pin.text?.trim() || `Point ${index}`;
}

function pinCalloutRowsHtml(
  pins: Workshop2Phase1CategorySketchAnnotation[],
  lang?: Workshop2FinalTzSpecExportContext['exportLanguage']
): string {
  if (!pins.length) {
    return `<p class="muted">${bilingual('Метки не заданы', 'No callouts', lang)}</p>`;
  }
  const showBilingual = lang === 'ru_en' || lang === 'ru_zh';
  const body = pins
    .map((pin, i) => {
      const n = i + 1;
      const ru = pinCalloutLabelRu(pin, n);
      const en = pinCalloutLabelEn(pin, n);
      if (showBilingual) {
        return `<tr><td class="num">${n}</td><td>${escHtml(ru)}</td><td class="muted-en">${escHtml(
          en
        )}</td><td>${escHtml(
          pin.dimensionValueText?.trim() || pin.linkedMaterialNote?.trim() || '—'
        )}</td></tr>`;
      }
      return `<tr><td class="num">${n}</td><td colspan="2">${escHtml(ru)}</td><td>${escHtml(
        pin.dimensionValueText?.trim() || '—'
      )}</td></tr>`;
    })
    .join('');
  const head = showBilingual
    ? `<tr><th>#</th><th>${bilingual('Callout RU', 'Callout RU', lang)}</th><th>${bilingual(
        'Callout EN',
        'Callout EN',
        lang
      )}</th><th>${bilingual('Detail', 'Detail', lang)}</th></tr>`
    : `<tr><th>#</th><th colspan="2">${bilingual('Callout', 'Callout', lang)}</th><th>${bilingual(
        'Detail',
        'Detail',
        lang
      )}</th></tr>`;
  return `<table class="callouts"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

export function resolveWorkshop2TechPackConstructionNotes(
  dossier: Workshop2DossierPhase1
): Array<Workshop2TechPackConstructionNotePreset & { active: boolean }> {
  const explicit = dossier.techPackConstructionNotePresetIds;
  if (explicit != null) {
    const selected = new Set(explicit);
    return W2_TECHPACK_CONSTRUCTION_NOTE_PRESETS.map((p) => ({
      ...p,
      active: selected.has(p.id),
    }));
  }
  const hasLining = bomSummaryRows(dossier).some((r) => /подклад|lining/i.test(r.role + r.detail));
  return W2_TECHPACK_CONSTRUCTION_NOTE_PRESETS.map((p) => ({
    ...p,
    active: p.id === 'fully-lined' && hasLining,
  }));
}

function constructionNotesBlockHtml(
  dossier: Workshop2DossierPhase1,
  lang?: Workshop2FinalTzSpecExportContext['exportLanguage']
): string {
  const notes = resolveWorkshop2TechPackConstructionNotes(dossier).filter((n) => n.active);
  if (!notes.length) {
    return `<p class="muted">${bilingual('Additional notes не заданы', 'No additional notes', lang)}</p>`;
  }
  const items = notes
    .map(
      (n) =>
        `<li><span class="preset-icon">${escHtml(n.icon)}</span> ${bilingual(n.labelRu, n.labelEn, lang)}</li>`
    )
    .join('');
  return `<ul class="construction-notes">${items}</ul>`;
}

function sketchImageBlock(sheet: Workshop2Phase1SketchSheet | undefined, label: string): string {
  if (!sheet?.imageDataUrl) {
    return `<div class="sketch-placeholder"><p class="muted">${escHtml(label)} — ${escHtml(
      SKETCH_SHEET_VIEW_LABELS[sheet?.viewKind ?? 'other']
    )}</p><p class="muted">Подложка в HTML не встраивается — см. ZIP / канон S3.</p></div>`;
  }
  return `<figure class="sketch-figure"><img src="${sheet.imageDataUrl}" alt="${escHtml(
    label
  )}" /><figcaption>${escHtml(label)}</figcaption></figure>`;
}

function qtyTableFromDossier(dossier: Workshop2DossierPhase1): string {
  const assign = dossier.assignments?.find(
    (a) => a.kind === 'canonical' && a.attributeId === 'sampleBaseSize'
  );
  const { hbs } = partitionHandbookAndFree(assign);
  if (!hbs.length) return '';
  const rows = hbs
    .map((hb) => {
      const pid = hb.parameterId!;
      const size = resolvedHandbookDisplayLabel('sampleBaseSize', pid, hb.displayLabel);
      const qtyRaw = dossier.sampleBasePerSizePieceQty?.[pid];
      const qty =
        typeof qtyRaw === 'number' && Number.isFinite(qtyRaw) && qtyRaw > 0
          ? String(Math.floor(qtyRaw))
          : '—';
      return `<tr><td>${escHtml(size)}</td><td>${escHtml(qty)}</td></tr>`;
    })
    .join('');
  return `<table><thead><tr><th>Size</th><th>Qty</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function qtyColorSizeHtml(opts?: Workshop2TechPackExportOptions): string {
  const rows = opts?.qtyByColorSize ?? [];
  if (!rows.length) return '';
  const body = rows
    .map(
      (r) =>
        `<tr><td>${escHtml(r.colorLabel)}</td><td>${escHtml(r.sizeLabel)}</td><td>${r.qty}</td></tr>`
    )
    .join('');
  return `<h3>Qty · color × size</h3><table><thead><tr><th>Colorway</th><th>Size</th><th>Qty</th></tr></thead><tbody>${body}</tbody></table>`;
}

function labelsHotspotsHtml(
  dossier: Workshop2DossierPhase1,
  lang?: Workshop2FinalTzSpecExportContext['exportLanguage']
): string {
  const spec = dossier.compositionLabelSpec;
  if (!workshop2CompositionLabelSpecHasExportableContent(spec)) {
    return `<p class="muted">${bilingual(
      'Составник не заполнен — см. вкладку «Материалы»',
      'Composition label spec empty',
      lang
    )}</p>`;
  }
  const s = spec!;
  const w = s.labelWidthMm?.trim() || '—';
  const h = s.labelHeightMm?.trim() || '—';
  const careIds = (s.careSymbolIds ?? []).slice(0, 5);
  const careLabels = careIds
    .map((id) => W2_COMPOSITION_LABEL_CARE_SYMBOL_CATALOG.find((c) => c.id === id)?.label ?? id)
    .join(', ');
  const hotspots = [
    {
      zone: 'Brand label',
      ru: 'Бренд',
      detail: s.brandFaceLines?.trim() || s.brandLogoPlacementNote?.trim() || '—',
    },
    { zone: 'Size label', ru: 'Размер', detail: sampleSizeLabel(dossier) },
    { zone: 'Care label', ru: 'Уход', detail: careLabels || '—' },
    {
      zone: 'Composition',
      ru: 'Состав',
      detail: `${w}×${h} mm · ${s.physicalMaterial ?? '—'}`,
    },
  ];
  const rows = hotspots
    .map(
      (h) =>
        `<tr><td><strong>${escHtml(h.zone)}</strong><br/><span class="muted">${escHtml(
          h.ru
        )}</span></td><td>${escHtml(h.detail)}</td></tr>`
    )
    .join('');
  return `${buildCompositionLabelSpecExportHtml(spec)}<table class="hotspots"><thead><tr><th>${bilingual(
    'Hotspot',
    'Hotspot',
    lang
  )}</th><th>${bilingual('Spec', 'Spec', lang)}</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function assessWorkshop2TechPackSheetReadiness(
  sheetId: Workshop2TechPackExportSheetId,
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext
): Workshop2TechPackSheetReadiness {
  const missing: string[] = [];
  switch (sheetId) {
    case 'cover':
      if (!ctx.articleSku.trim() || ctx.articleSku === '—') missing.push('SKU / style #');
      if (sampleSizeLabel(dossier) === '—') missing.push('Sample size');
      break;
    case 'sketch-front':
      if (!findSketchSheetByView(dossier, 'front') && !dossier.categorySketchImageDataUrl) {
        missing.push('Front sketch');
      }
      break;
    case 'sketch-back':
      if (!findSketchSheetByView(dossier, 'back')) missing.push('Back sketch');
      break;
    case 'labels-trims':
      if (!workshop2CompositionLabelSpecHasExportableContent(dossier.compositionLabelSpec)) {
        missing.push('Composition label spec');
      }
      break;
    case 'colorways':
      if (buildColorwayRowsFromDossier(dossier).length < 1) missing.push('Colorway rows');
      break;
    case 'size-qty':
      if (!ctx.measurementsLeaf) missing.push('Size chart leaf');
      if (sampleSizeLabel(dossier) === '—') missing.push('Sample size');
      break;
    default:
      break;
  }
  return { id: sheetId, ok: missing.length === 0, missingRu: missing };
}

export function summarizeWorkshop2TechPackExportReadiness(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext
): { sheetsReady: number; sheetsTotal: number; rows: Workshop2TechPackSheetReadiness[] } {
  const rows = WORKSHOP2_TECHPACK_EXPORT_SHEETS.map((s) =>
    assessWorkshop2TechPackSheetReadiness(s.id, dossier, ctx)
  );
  return {
    sheetsReady: rows.filter((r) => r.ok).length,
    sheetsTotal: rows.length,
    rows,
  };
}

function sheetStyles(): string {
  return `
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 20px; color: #111; line-height: 1.4; }
    h1 { font-size: 1.2rem; margin: 0 0 4px; }
    h2 { font-size: 1rem; margin: 16px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    h3 { font-size: 0.92rem; margin: 12px 0 6px; }
    .sheet-meta { color: #555; font-size: 0.82rem; margin-bottom: 12px; }
    .muted { color: #666; font-size: 0.85rem; }
    .muted-en { color: #777; font-size: 0.82rem; }
    table { border-collapse: collapse; width: 100%; font-size: 0.84rem; margin: 8px 0; }
    th, td { border: 1px solid #ddd; padding: 5px 7px; text-align: left; vertical-align: top; }
    th { background: #f7f7f7; }
    .callouts td.num { width: 2rem; text-align: center; font-weight: 600; }
    .sketch-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .sketch-figure img { max-width: 100%; max-height: 280px; object-fit: contain; border: 1px solid #ddd; }
    .sketch-placeholder { border: 1px dashed #ccc; padding: 24px; text-align: center; min-height: 120px; }
    .construction-notes { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
    .construction-notes li { border: 1px solid #e2e4ea; border-radius: 6px; padding: 6px 10px; font-size: 0.84rem; }
    .preset-icon { margin-right: 4px; }
    .hotspots td:first-child { width: 28%; }
    @media print { .page-break { page-break-after: always; } }
  `;
}

function wrapSheetHtml(title: string, body: string, sheetNo: number): string {
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/><title>${escHtml(
    title
  )}</title><style>${sheetStyles()}</style></head><body><p class="sheet-meta">Factory pack · sheet ${sheetNo}/6</p>${body}<hr/><p class="muted">Synth-1 Workshop2 · ${escHtml(
    new Date().toISOString()
  )}</p></body></html>`;
}

function buildCoverSheetHtml(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext,
  opts?: Workshop2TechPackExportOptions
): string {
  const front = findSketchSheetByView(dossier, 'front');
  const back = findSketchSheetByView(dossier, 'back');
  const bom = bomSummaryRows(dossier);
  const bomHtml = bom.length
    ? `<table><thead><tr><th>BOM</th><th>Detail</th></tr></thead><tbody>${bom
        .map((r) => `<tr><td>${escHtml(r.role)}</td><td>${escHtml(r.detail || '—')}</td></tr>`)
        .join('')}</tbody></table>`
    : `<p class="muted">${bilingual('BOM не заполнен', 'BOM empty', ctx.exportLanguage)}</p>`;
  const qtyHtml =
    qtyTableFromDossier(dossier) || `<p class="muted">Qty по размерам — см. matrix / PO.</p>`;
  const body = `
    <h1>${bilingual('Tech pack · cover', 'Tech pack · cover', ctx.exportLanguage)}</h1>
    <p><strong>Style #:</strong> ${escHtml(ctx.articleSku)} · <strong>${bilingual('Season', 'Season', ctx.exportLanguage)}:</strong> ${escHtml(
      seasonFromDossier(dossier, opts?.seasonLabel)
    )}</p>
    <p><strong>${bilingual('Sample size', 'Sample size', ctx.exportLanguage)}:</strong> ${escHtml(
      sampleSizeLabel(dossier)
    )} · <strong>${bilingual('Product', 'Product', ctx.exportLanguage)}:</strong> ${escHtml(ctx.articleName)}</p>
    <div class="sketch-grid">
      ${sketchImageBlock(front, 'Front')}
      ${sketchImageBlock(back, 'Back')}
    </div>
    <h2>${bilingual('BOM summary', 'BOM summary', ctx.exportLanguage)}</h2>
    ${bomHtml}
    <h2>${bilingual('Quantity by size', 'Quantity by size', ctx.exportLanguage)}</h2>
    ${qtyHtml}
    ${opts?.qtyBridgeNote ? `<p class="muted">${escHtml(opts.qtyBridgeNote)}</p>` : ''}
  `;
  return wrapSheetHtml(`${ctx.articleSku} · Cover`, body, 1);
}

function buildSketchSheetHtml(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext,
  viewKind: Workshop2SketchSheetViewKind,
  sheetNo: number,
  title: string
): string {
  const sheet = findSketchSheetByView(dossier, viewKind);
  const pins = sheet?.annotations ?? [];
  const body = `
    <h1>${bilingual(title, title, ctx.exportLanguage)}</h1>
    ${sketchImageBlock(sheet, SKETCH_SHEET_VIEW_LABELS[viewKind])}
    <h2>${bilingual('Callouts', 'Callouts', ctx.exportLanguage)}</h2>
    ${pinCalloutRowsHtml(pins, ctx.exportLanguage)}
    <h2>${bilingual('Additional notes', 'Additional notes', ctx.exportLanguage)}</h2>
    ${constructionNotesBlockHtml(dossier, ctx.exportLanguage)}
    ${sheet?.workshopTaskNote?.trim() ? `<p><strong>Workshop note:</strong> ${escHtml(sheet.workshopTaskNote.trim())}</p>` : ''}
  `;
  return wrapSheetHtml(`${ctx.articleSku} · ${title}`, body, sheetNo);
}

function buildColorwaysSheetHtml(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext
): string {
  const rows = buildColorwayRowsFromDossier(dossier);
  const bom = bomSummaryRows(dossier);
  const shell = bom.find((r) => /shell|основ/i.test(r.role))?.detail ?? '—';
  const lining = bom.find((r) => /lining|подклад/i.test(r.role))?.detail ?? '—';
  const trim = bom.find((r) => /trim|фурн|button|пугов/i.test(r.role))?.detail ?? '—';
  const cards = rows.length
    ? rows
        .map(
          (cw) => `
        <div class="colorway-card" style="border:1px solid #ddd;border-radius:8px;padding:10px;margin:8px 0;">
          <p><strong>${escHtml(cw.label)}</strong> · ${escHtml(cw.paletteCode)}${
            cw.pantone ? ` · Pantone ${escHtml(cw.pantone)}` : ''
          }${cw.hex ? ` · <span style="display:inline-block;width:12px;height:12px;background:${escHtml(cw.hex)};border:1px solid #999;"></span>` : ''}</p>
          <ul style="margin:6px 0;padding-left:1.1rem;font-size:0.84rem;">
            <li>Shell: ${escHtml(shell)}</li>
            <li>Lining: ${escHtml(lining)}</li>
            <li>Trim: ${escHtml(trim)}</li>
          </ul>
        </div>`
        )
        .join('')
    : `<p class="muted">${bilingual('Colorways не заданы', 'No colorways', ctx.exportLanguage)}</p>`;
  const body = `
    <h1>${bilingual('Colorways', 'Colorways', ctx.exportLanguage)}</h1>
    ${cards}
  `;
  return wrapSheetHtml(`${ctx.articleSku} · Colorways`, body, 5);
}

function buildSizeQtySheetHtml(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext,
  opts?: Workshop2TechPackExportOptions
): string {
  const measurementsHtml = ctx.measurementsLeaf
    ? buildWorkshop2MeasurementsExportHtml(dossier, ctx.measurementsLeaf)
    : `<p class="muted">${bilingual(
        'Size chart leaf не передан',
        'Size chart leaf missing',
        ctx.exportLanguage
      )}</p>`;
  const body = `
    <h1>${bilingual('Size chart + qty', 'Size chart + qty', ctx.exportLanguage)}</h1>
    <p><strong>${bilingual('Sample size', 'Sample size', ctx.exportLanguage)}:</strong> ${escHtml(
      sampleSizeLabel(dossier)
    )}</p>
    <h2>POM</h2>
    ${measurementsHtml}
    <h2>${bilingual('Qty by size (dossier)', 'Qty by size (dossier)', ctx.exportLanguage)}</h2>
    ${qtyTableFromDossier(dossier) || `<p class="muted">—</p>`}
    ${qtyColorSizeHtml(opts)}
    ${opts?.qtyBridgeNote ? `<p class="muted">${escHtml(opts.qtyBridgeNote)}</p>` : ''}
  `;
  return wrapSheetHtml(`${ctx.articleSku} · Size + qty`, body, 6);
}

export function buildWorkshop2TechPackSheetHtml(
  sheetId: Workshop2TechPackExportSheetId,
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext,
  opts?: Workshop2TechPackExportOptions
): string {
  switch (sheetId) {
    case 'cover':
      return buildCoverSheetHtml(dossier, ctx, opts);
    case 'sketch-front':
      return buildSketchSheetHtml(dossier, ctx, 'front', 2, 'Technical sketch · front');
    case 'sketch-back':
      return buildSketchSheetHtml(dossier, ctx, 'back', 3, 'Technical sketch · back');
    case 'labels-trims': {
      const body = `
        <h1>${bilingual('Labels & trims', 'Labels & trims', ctx.exportLanguage)}</h1>
        ${labelsHotspotsHtml(dossier, ctx.exportLanguage)}
      `;
      return wrapSheetHtml(`${ctx.articleSku} · Labels`, body, 4);
    }
    case 'colorways':
      return buildColorwaysSheetHtml(dossier, ctx);
    case 'size-qty':
      return buildSizeQtySheetHtml(dossier, ctx, opts);
    default:
      return wrapSheetHtml('Unknown', '<p>—</p>', 0);
  }
}

/** Полный factory pack HTML (6 листов подряд, page-break между листами). */
export function buildWorkshop2TechPackFactoryDocumentHtml(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext,
  opts?: Workshop2TechPackExportOptions
): string {
  const sections = WORKSHOP2_TECHPACK_EXPORT_SHEETS.map((meta, idx) => {
    const inner = buildWorkshop2TechPackSheetHtml(meta.id, dossier, ctx, opts);
    const bodyMatch = inner.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const chunk = bodyMatch?.[1] ?? inner;
    const pageBreak = idx < WORKSHOP2_TECHPACK_EXPORT_SHEETS.length - 1 ? ' page-break' : '';
    return `<section class="factory-sheet${pageBreak}">${chunk}</section>`;
  }).join('\n');
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/><title>${escHtml(
    ctx.articleSku
  )} — Factory pack</title><style>${sheetStyles()}</style></head><body>${sections}</body></html>`;
}

export function downloadWorkshop2TechPackHtmlFile(html: string, articleSku: string): void {
  if (typeof document === 'undefined') return;
  const safe = articleSku.replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]+/g, '-').slice(0, 48) || 'article';
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `techpack-factory-${safe}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
