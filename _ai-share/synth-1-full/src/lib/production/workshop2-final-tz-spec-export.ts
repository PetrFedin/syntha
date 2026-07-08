import {
  getAttributeById,
  resolveAttributeIdsForLeaf,
  resolvePhase1AttributeRows,
  resolvePhase2OnlyAttributeRows,
  resolvePhase3OnlyAttributeRows,
  type ResolvedPhase1AttributeRow,
} from '@/lib/production/attribute-catalog';
import type { DossierSection } from '@/lib/production/dossier-readiness-engine';
import { buildMaterialBomHubModel } from '@/lib/production/workshop2-material-bom-check';
import {
  calculateWorkshopTzSectionCompletion,
  workshop2TzSectionRowsForCompletion,
} from '@/lib/production/workshop2-tz-section-readiness';
import {
  buildWorkshop2TzGateSnapshot,
  type Workshop2TzGateId,
} from '@/lib/production/workshop2-tz-gates';
import { phase1FieldSatisfiedForUi } from '@/lib/production/w2-dossier-field-presentation';
import {
  findHandbookLeafById,
  type HandbookCategoryLeaf,
} from '@/lib/production/category-handbook-leaves';
import {
  buildCompositionLabelConstructorFiberLines,
  compositionLabelCardMetadataLines,
} from '@/lib/production/workshop2-composition-label-constructor';
import {
  W2_COMPOSITION_LABEL_CARE_SYMBOL_CATALOG,
  W2_COMPOSITION_LABEL_ORIGIN_PRESETS,
  W2_COMPOSITION_LABEL_SIZE_PRESETS,
} from '@/lib/production/workshop2-composition-label-spec-constants';
import {
  WORKSHOP2_COMPOSITION_LABEL_PHYSICAL_RU,
  workshop2CompositionLabelSpecHasExportableContent,
} from '@/lib/production/workshop2-composition-label-spec-utils';
import { buildWorkshop2TechPackCanonicalPreviewBlockHtml } from '@/lib/production/workshop2-tech-pack-canonical-summary';
import type {
  Workshop2CompositionLabelSpec,
  Workshop2DossierPhase1,
  Workshop2DossierSectionSignoffs,
  Workshop2Phase1DimensionRangeCell,
  Workshop2TzSignoffSectionKey,
} from '@/lib/production/workshop2-dossier-phase1.types';
import {
  formatMaterialBomPlainText,
  type MaterialBomExportInput,
} from '@/lib/production/workshop2-material-bom-export';
import { parseMatRowsFromDossier } from '@/lib/production/workshop2-material-mat-rows';
import { partitionHandbookAndFree } from '@/lib/production/workshop2-phase1-attribute-partition';
import { resolvedHandbookDisplayLabel } from '@/lib/production/workshop2-resolved-handbook-display-label';
import { resolveWorkshop2TechPackHandoffChecklistRow } from '@/lib/production/workshop2-tech-pack-handoff-resolve';
import { normalizeSketchSheets } from '@/lib/production/workshop2-sketch-sheets';
import {
  canonicalSketchHuman,
  getVisualHandoffQuickSummary,
} from '@/lib/production/workshop2-visual-handoff-export';
import {
  TZ_PANEL_SECTION_LABELS,
  VISUAL_READINESS_LABELS,
  visualReadinessProgress,
} from '@/lib/production/workshop2-visual-excellence';
import { getWorkshopDimensionLabels } from '@/lib/production/workshop-size-handbook';
import { workshop2PolicySuppressesAttribute } from '@/lib/production/workshop2-attribute-policy';
import { ensureWorkshop2ProductionModel } from '@/lib/production/workshop2-production-model-from-dossier';
import { buildWorkshop2ProductionPreflightSnapshot } from '@/lib/production/workshop2-production-preflight';

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeFilePart(s: string): string {
  return s.replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]+/g, '-').slice(0, 48) || 'article';
}

function getBilingualHeader(ruText: string, lang?: 'ru' | 'ru_en' | 'ru_zh'): string {
  if (!lang || lang === 'ru') return escHtml(ruText);

  const dictEn: Record<string, string> = {
    Паспорт: 'Passport / General',
    Визуал: 'Visuals',
    Материалы: 'Materials / BOM',
    Конструкция: 'Construction',
    'Вложения tech pack': 'Tech Pack Attachments',
    'Подписи секций и передача': 'Signoffs & Handoff',
    'Комментарии для фабрики': 'Factory Comments',
    Бриф: 'Brief',
    'Поля каталога по секциям (заполнено / не заполнено)':
      'Catalog Fields by Section (Filled / Empty)',
    'Ключевые поля (порядок в досье, сокращённо)': 'Key Fields',
    'Визуал и Конструкция': 'Visuals & Construction',
    'Базовый размер и мерки': 'Base Size & Measurements',
  };

  const dictZh: Record<string, string> = {
    Паспорт: '护照 / 基本信息 (Passport)',
    Визуал: '视觉 / 图片 (Visuals)',
    Материалы: '材料 / 物料清单 (Materials)',
    Конструкция: '结构 (Construction)',
    'Вложения tech pack': '技术包附件 (Attachments)',
    'Подписи секций и передача': '签名与交接 (Signoffs)',
    'Комментарии для фабрики': '工厂备注 (Factory Comments)',
    Бриф: '简报 (Brief)',
    'Поля каталога по секциям (заполнено / не заполнено)': '按部分分类的目录字段 (Catalog Fields)',
    'Ключевые поля (порядок в досье, сокращённо)': '关键字段 (Key Fields)',
    'Визуал и Конструкция': '视觉与结构 (Visuals & Construction)',
    'Базовый размер и мерки': '基本尺寸和测量 (Measurements)',
  };

  if (lang === 'ru_en') {
    return dictEn[ruText]
      ? `${escHtml(ruText)} <span class="muted font-normal">/ ${escHtml(dictEn[ruText])}</span>`
      : escHtml(ruText);
  }
  if (lang === 'ru_zh') {
    return dictZh[ruText]
      ? `${escHtml(ruText)} <span class="muted font-normal">/ ${escHtml(dictZh[ruText])}</span>`
      : escHtml(ruText);
  }
  return escHtml(ruText);
}

const FINAL_TZ_SECTION_ORDER: {
  anchor: string;
  title: string;
  description: string;
}[] = [
  { anchor: 'sec-passport', title: 'Паспорт', description: 'SKU, бриф, ключевые поля карточки' },
  { anchor: 'sec-material', title: 'Материалы', description: 'Материал, состав, связки BOM' },
  {
    anchor: 'sec-construction',
    title: 'Конструкция',
    description: 'Референсы, скетч, CAD / ZIP, мерки при необходимости',
  },
  { anchor: 'sec-attachments', title: 'Вложения tech pack', description: 'Файлы пакета' },
  {
    anchor: 'sec-approvals',
    title: 'Подписи и передача',
    description: 'Секции ТЗ (бренд/технолог) и handoff одной таблицей',
  },
];

const SECTION_SIGNOFF_LABELS: Record<Workshop2TzSignoffSectionKey, string> = {
  general: 'Паспорт',
  visuals: 'Визуал',
  material: 'Материалы',
  construction: 'Конструкция',
  assignment: 'Задание',
  b2b_sales: 'B2B/Продажи',
};

const REDUNDANT_WHEN_MAT_COMPOSITION_LINKED = new Set([
  'fabricCompositionPresetOptions',
  'fabricCompositionDetailClassOptions',
]);

/** Подсекция «Бирка состава» для HTML «Итоговое ТЗ» (зеркало блока во вкладке «Материалы»). */
export function buildCompositionLabelSpecExportHtml(
  spec: Workshop2CompositionLabelSpec | undefined
): string {
  if (!workshop2CompositionLabelSpecHasExportableContent(spec)) return '';
  const s = spec!;
  const items: string[] = [];
  const w = s.labelWidthMm?.trim();
  const h = s.labelHeightMm?.trim();
  if (w || h) {
    items.push(
      `<li><strong>Размер бирки (мм):</strong> ${w ? escHtml(w) : '—'} × ${h ? escHtml(h) : '—'}</li>`
    );
  }
  const presetId = (s.labelSizePresetId ?? '').trim();
  if (presetId) {
    const pr = W2_COMPOSITION_LABEL_SIZE_PRESETS.find((p) => p.id === presetId);
    if (pr) {
      items.push(
        `<li><strong>Типовой пресет габаритов:</strong> ${escHtml(pr.label)} (${pr.widthMm}×${pr.heightMm} мм)</li>`
      );
    } else {
      items.push(`<li><strong>Типовой пресет габаритов:</strong> ${escHtml(presetId)}</li>`);
    }
  }
  const phys = (s.physicalMaterial ?? '').trim();
  if (phys) {
    items.push(
      `<li><strong>Материал бирки:</strong> ${escHtml(WORKSHOP2_COMPOSITION_LABEL_PHYSICAL_RU[phys] ?? phys)}</li>`
    );
  }
  const physNote = (s.physicalMaterialNote ?? '').trim();
  if (physNote) {
    items.push(`<li><strong>Полотно (свой текст):</strong> ${escHtml(physNote)}</li>`);
  }
  if ((s.compositionLabelLogoDataUrl ?? '').trim()) {
    items.push(
      '<li><strong>Логотип в спецификации:</strong> файл загружен в досье (data URL; в этот HTML не встраивается).</li>'
    );
  }
  if (s.includeFiberCompositionFromTz) {
    items.push('<li>Сырьевой состав на бирке: <strong>да</strong> (из ТЗ mat / composition).</li>');
  }
  if (s.includeCareSymbolsFromTz) {
    items.push('<li>Значки ухода на бирке: <strong>да</strong> (из полей ТЗ).</li>');
  }
  if (s.includeManufacturerFromTz) {
    items.push('<li>Производитель / составитель на бирке: <strong>да</strong> (из паспорта).</li>');
  }
  const extra = (s.extraLegalLines ?? '').trim();
  if (extra) {
    items.push(`<li><strong>Доп. обязательные строки:</strong> ${escHtml(extra)}</li>`);
  }
  const notes = (s.technologistNotes ?? '').trim();
  if (notes) {
    items.push(`<li><strong>Примечания технолога:</strong> ${escHtml(notes)}</li>`);
  }
  if (s.includeInFactoryAssignment) {
    items.push(
      '<li><strong>В задание цеха:</strong> да (составник отдельным пунктом пакета).</li>'
    );
  }
  if (s.showTrimBleedInDraft) {
    items.push('<li>В черновике UI: показывать контур припусков / габаритов печати.</li>');
  }
  if (s.printOnReverse) {
    items.push('<li>Печать на обороте бирки: <strong>да</strong>.</li>');
  }
  const sheet = (s.sheetLayout ?? '').trim();
  if (sheet) {
    const sheetRu =
      sheet === 'single'
        ? 'один сегмент'
        : sheet === 'two_sheets'
          ? 'два листа'
          : sheet === 'three_sheets'
            ? 'три листа'
            : sheet;
    items.push(`<li><strong>Раскладка по листам:</strong> ${escHtml(sheetRu)}</li>`);
  }
  const lay = (s.layoutPlacementNotes ?? '').trim();
  if (lay) {
    items.push(`<li><strong>Расположение блоков / сгиб:</strong> ${escHtml(lay)}</li>`);
  }
  const brandFace = (s.brandFaceLines ?? '').trim();
  if (brandFace) {
    items.push(`<li><strong>Текст бренда на лице:</strong> ${escHtml(brandFace)}</li>`);
  }
  const logoN = (s.brandLogoPlacementNote ?? '').trim();
  if (logoN) {
    items.push(`<li><strong>Логотип (позиция/размер):</strong> ${escHtml(logoN)}</li>`);
  }
  const fp = s.typographyFontPreset;
  if (fp) {
    items.push(`<li><strong>Гарнитура:</strong> ${escHtml(fp === 'custom' ? 'своя' : fp)}</li>`);
  }
  const cfn = (s.typographyCustomFontName ?? '').trim();
  if (cfn) {
    items.push(`<li><strong>Название шрифта (custom):</strong> ${escHtml(cfn)}</li>`);
  }
  const pt = (s.typographyBodyPt ?? '').trim();
  if (pt) {
    items.push(`<li><strong>Кегль основного текста:</strong> ${escHtml(pt)} pt</li>`);
  }
  if (s.typographyBoldFiberBlock) {
    items.push('<li>Блок состава: <strong>жирный</strong>.</li>');
  }
  if (s.typographyBoldCareBlock) {
    items.push('<li>Блок ухода: <strong>жирный</strong>.</li>');
  }
  const symIds = s.careSymbolIds ?? [];
  if (symIds.length) {
    const labels = symIds
      .map((id) => W2_COMPOSITION_LABEL_CARE_SYMBOL_CATALOG.find((c) => c.id === id)?.label ?? id)
      .join('; ');
    items.push(`<li><strong>Знаки ухода (явный выбор):</strong> ${escHtml(labels)}</li>`);
  }
  const careSup = (s.careInstructionsSupplement ?? '').trim();
  if (careSup) {
    items.push(`<li><strong>Доп. текст по уходу:</strong> ${escHtml(careSup)}</li>`);
  }
  const fiberCtor = buildCompositionLabelConstructorFiberLines(s);
  if (fiberCtor.length) {
    items.push(
      `<li><strong>Состав (конструктор волокна):</strong> ${escHtml(fiberCtor.join('; '))}</li>`
    );
  }
  const ctorLang = s.constructorDisplayLanguage;
  if (ctorLang && ctorLang !== 'ru') {
    items.push(`<li><strong>Язык конструктора:</strong> ${escHtml(ctorLang)}</li>`);
  }
  const originId = (s.labelOriginPresetId ?? '').trim();
  if (originId && originId !== 'unset') {
    const pr = W2_COMPOSITION_LABEL_ORIGIN_PRESETS.find((x) => x.id === originId);
    if (pr) items.push(`<li><strong>Страна изготовления:</strong> ${escHtml(pr.label)}</li>`);
  }
  const metaLines = compositionLabelCardMetadataLines(s);
  if (metaLines.length) {
    items.push(`<li><strong>Метаданные карточки:</strong> ${escHtml(metaLines.join('; '))}</li>`);
  }
  const rev = (s.reverseFaceLines ?? '').trim();
  if (rev) {
    items.push(`<li><strong>Текст оборота:</strong> ${escHtml(rev)}</li>`);
  }
  const draftManual = (s.draftTextManual ?? '').trim();
  if (draftManual) {
    const clipped = draftManual.length > 800 ? `${draftManual.slice(0, 800)}…` : draftManual;
    items.push(`<li><strong>Ручной текст черновика бирки:</strong> ${escHtml(clipped)}</li>`);
  }
  return `<h3 id="sec-composition-label">Бирка состава и ухода (составник)</h3><ul>${items.join('')}</ul>`;
}

export function resolveRowsForFinalTzExport(
  ctx: Workshop2FinalTzSpecExportContext
): ResolvedPhase1AttributeRow[] {
  const leafId = ctx.categoryLeafId;
  const leaf = findHandbookLeafById(leafId);
  const tz = ctx.tzPhase;
  const l1 = resolveAttributeIdsForLeaf(leafId, 1);
  const l2 = resolveAttributeIdsForLeaf(leafId, 2);
  const l3 = resolveAttributeIdsForLeaf(leafId, 3);
  const linked1 = l1.includes('mat') && l1.includes('composition');
  const linked2 = l2.includes('mat') && l2.includes('composition');
  const linked3 = l3.includes('mat') && l3.includes('composition');
  const filterRow = (attributeId: string, linked: boolean) => {
    if (
      workshop2PolicySuppressesAttribute(attributeId, {
        leafId,
        l1Name: leaf?.l1Name,
        l2Name: leaf?.l2Name,
        l3Name: leaf?.l3Name,
        phase: ctx.tzPhase === '1' ? 1 : ctx.tzPhase === '2' ? 2 : 3,
        source: 'export',
      })
    )
      return false;
    if (linked && attributeId === 'composition') return false;
    if (linked && REDUNDANT_WHEN_MAT_COMPOSITION_LINKED.has(attributeId)) return false;
    return true;
  };
  if (tz === '1') {
    return resolvePhase1AttributeRows(leafId).filter((r) =>
      filterRow(r.attribute.attributeId, linked1)
    );
  }
  if (tz === '2') {
    return resolvePhase2OnlyAttributeRows(leafId).filter((r) =>
      filterRow(r.attribute.attributeId, linked2)
    );
  }
  return resolvePhase3OnlyAttributeRows(leafId).filter((r) =>
    filterRow(r.attribute.attributeId, linked3)
  );
}

function matRequiredForExport(ctx: Workshop2FinalTzSpecExportContext): boolean {
  const mat = getAttributeById('mat');
  const phaseNum = ctx.tzPhase === '1' ? 1 : ctx.tzPhase === '2' ? 2 : 3;
  const leafIds = resolveAttributeIdsForLeaf(ctx.categoryLeafId, phaseNum);
  const matOnLeaf = leafIds.includes('mat');
  if (ctx.tzPhase === '1') return Boolean(matOnLeaf && mat?.requiredForPhase1);
  if (ctx.tzPhase === '2') return Boolean(matOnLeaf && mat?.requiredForPhase2);
  return false;
}

function matHandbookLineCount(dossier: Workshop2DossierPhase1): number {
  const matAssign = dossier.assignments.find(
    (x) => x.kind === 'canonical' && x.attributeId === 'mat'
  );
  return matAssign?.values.filter((v) => v.valueSource === 'handbook_parameter').length ?? 0;
}

function buildMaterialBomHubForExport(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext
) {
  const phaseRows = resolveRowsForFinalTzExport(ctx);
  const matCompletion = calculateWorkshopTzSectionCompletion('material', dossier, phaseRows, {
    tzPhase: ctx.tzPhase,
  });
  const phaseNum = ctx.tzPhase === '1' ? 1 : ctx.tzPhase === '2' ? 2 : 3;
  const leafIds = resolveAttributeIdsForLeaf(ctx.categoryLeafId, phaseNum);
  const linkedComposition = leafIds.includes('mat') && leafIds.includes('composition');
  const rows = parseMatRowsFromDossier(dossier, matParameterLabelMap());
  const compSum = linkedComposition ? rows.reduce((s, r) => s + r.pct, 0) : null;
  return buildMaterialBomHubModel({
    matRequired: matRequiredForExport(ctx),
    matHandbookLineCount: matHandbookLineCount(dossier),
    linkedMatComposition: linkedComposition,
    compositionPctSum: compSum,
    materialSectionPct: matCompletion.pct,
  });
}

function tzAttributeRequiredOnPhase(
  attr: ResolvedPhase1AttributeRow['attribute'],
  tzPhase: '1' | '2' | '3'
): boolean {
  if (tzPhase === '1') return Boolean(attr.requiredForPhase1);
  return Boolean(attr.requiredForPhase2);
}

function tzCatalogRowStatusLabel(
  dossier: Workshop2DossierPhase1,
  row: ResolvedPhase1AttributeRow,
  tzPhase: '1' | '2' | '3'
): 'заполнено' | 'не заполнено' | 'не применимо' {
  const a = row.attribute;
  const assignment = dossier.assignments.find((x) => x.attributeId === a.attributeId);
  if (phase1FieldSatisfiedForUi(a, assignment)) return 'заполнено';
  if (!tzAttributeRequiredOnPhase(a, tzPhase)) return 'не применимо';
  return 'не заполнено';
}

function exportNarrowSectionEmpty(
  section: DossierSection,
  rows: ResolvedPhase1AttributeRow[],
  tzPhase: '1' | '2' | '3'
): boolean {
  if (tzPhase === '1') return false;
  if (
    section === 'visuals' ||
    section === 'construction' ||
    section === 'assignment' ||
    section === 'material'
  ) {
    return false;
  }
  return rows.length === 0;
}

function buildCatalogFieldsSnapshotHtml(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext
): string {
  const phaseRows = resolveRowsForFinalTzExport(ctx);
  const sections: DossierSection[] = ['general', 'material', 'construction'];
  const maxPerSection = 14;
  const parts: string[] = [];
  parts.push(
    `<p class="muted">Этап ТЗ: ${escHtml(ctx.tzPhase)}. Колонка «Статус»: <strong>заполнено</strong> / <strong>не заполнено</strong> (обязательное на этапе) / <strong>не применимо</strong> (на этапе необязательно). Цифровые подписи секций и передача — <a href="#sec-approvals">раздел 6</a>.</p>`
  );
  for (const section of sections) {
    const rows = workshop2TzSectionRowsForCompletion(section, phaseRows);
    const secLabel =
      (TZ_PANEL_SECTION_LABELS as Record<string, string>)[section] ?? String(section);
    if (exportNarrowSectionEmpty(section, rows, ctx.tzPhase)) {
      parts.push(
        `<h4>${escHtml(secLabel)}</h4><p class="muted">Не применимо на этом этапе ТЗ (в каталоге для секции нет строк на шаге ${ctx.tzPhase}).</p>`
      );
      continue;
    }
    if (rows.length === 0) {
      parts.push(
        `<h4>${escHtml(secLabel)}</h4><p class="muted">Нет полей каталога в выборке для секции.</p>`
      );
      continue;
    }
    const slice = rows.slice(0, maxPerSection);
    const body = slice
      .map((r) => {
        const status = tzCatalogRowStatusLabel(dossier, r, ctx.tzPhase);
        const name = r.attribute.name ?? r.attribute.attributeId;
        return `<tr><td>${escHtml(name)}</td><td>${escHtml(r.attribute.attributeId)}</td><td>${escHtml(
          status
        )}</td></tr>`;
      })
      .join('');
    const more =
      rows.length > maxPerSection
        ? `<p class="muted">Показано ${maxPerSection} из ${rows.length}; остальные — в UI.</p>`
        : '';
    parts.push(
      `<h4>${escHtml(secLabel)}</h4><table><thead><tr><th>Поле</th><th>id</th><th>Статус</th></tr></thead><tbody>${body}</tbody></table>${more}`
    );
  }
  return parts.join('');
}

function buildVisualChecklistExcerptHtml(dossier: Workshop2DossierPhase1): string {
  const vr = visualReadinessProgress(dossier);
  const { checklist } = vr;
  const summary = `<p class="muted"><strong>Сводка (как счётчики на вкладке «Визуал»):</strong> чеклист готовности отмечен вручную <strong>${vr.done}/${vr.total}</strong> пунктов; ниже — те же строки с да/нет.</p>`;
  const lines = VISUAL_READINESS_LABELS.map((row) => {
    const ok = Boolean(checklist[row.key]);
    return `<li><strong>${escHtml(row.label)}</strong> — ${ok ? 'да' : 'нет'} <span class="muted">(${escHtml(
      row.hint
    )})</span></li>`;
  }).join('');
  return `${summary}<h3>Чеклист готовности визуала (как в UI)</h3><ol class="checklist">${lines}</ol>`;
}

function buildMaterialChecklistExcerptHtml(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext
): string {
  const phaseRows = resolveRowsForFinalTzExport(ctx);
  const matComp = calculateWorkshopTzSectionCompletion('material', dossier, phaseRows, {
    tzPhase: ctx.tzPhase,
  });
  const matSummary = `<p class="muted"><strong>Сводка по каталогу (как полоска вкладки «Материалы»):</strong> заполнено <strong>${matComp.done}/${matComp.total}</strong> строк каталога секции (${matComp.pct}%). Ниже — контрольные точки BOM/состава из того же хаба, что в UI.</p>`;
  const hub = buildMaterialBomHubForExport(dossier, ctx);
  const cp = hub.checkpoints
    .map(
      (c) =>
        `<li><strong>${escHtml(c.label)}</strong> — ${c.done ? 'выполнено' : 'не выполнено'}</li>`
    )
    .join('');
  const gates =
    hub.gateItems.length > 0
      ? `<h4>Замечания (гейт)</h4><ul>${hub.gateItems
          .map((g) => `<li>${escHtml(g.message)}</li>`)
          .join('')}</ul>`
      : '<p class="muted">Критичных замечаний по контуру материалов/BOM в экспорте не зафиксировано.</p>';
  return `${matSummary}<h3>Чеклист материалов / BOM (сводка)</h3><ul>${cp}</ul>${gates}`;
}

/** В печатном документе пары подписей по секциям и handoff — только в разделе 6, без второй таблицы здесь. */
const FINAL_TZ_DOC_GATE_SKIP_IDS: Workshop2TzGateId[] = ['section_signoffs', 'handoff_marks'];

function buildFinalTzGateCheckHtml(dossier: Workshop2DossierPhase1): string {
  const snap = buildWorkshop2TzGateSnapshot(dossier);
  const rows = snap.lines
    .filter((ln) => !FINAL_TZ_DOC_GATE_SKIP_IDS.includes(ln.id))
    .map(
      (ln) =>
        `<tr><td>${escHtml(ln.label)}</td><td>${
          ln.ok ? '<span class="gate-ok">OK</span>' : '<span class="gate-no">нет</span>'
        }</td><td class="muted">${escHtml(ln.detail)}</td></tr>`
    )
    .join('');
  const sectionErrs = (['general', 'material', 'construction'] as const).flatMap((section) =>
    (snap.sectionMinimumErrors[section] ?? []).map((detail) => ({ section, detail }))
  );
  const sectionErrorsHtml = sectionErrs.length
    ? `<h4>Ошибки минимального стандарта (machine-code)</h4><ul>${sectionErrs
        .map(({ section, detail }) => {
          const machine = detail.match(/\[(W2_[A-Z0-9_]+)\]/)?.[1] ?? 'W2_RULE';
          return `<li><strong>${escHtml(machine)}</strong> · ${escHtml(section)} — ${escHtml(detail)}</li>`;
        })
        .join('')}</ul>`
    : '<p class="muted">Ошибок минимального стандарта (machine-code) нет.</p>';
  return `<div class="gate-check"><h3>Ворота готовности (фрагмент чеклиста «Задание»)</h3><table><thead><tr><th>Ворота</th><th>В документе</th><th>Деталь</th></tr></thead><tbody>${rows}</tbody></table>${sectionErrorsHtml}<p class="muted">Строки «Секции ТЗ» и «Отметки передачи» намеренно не дублируются здесь: одна сводная таблица подписей по секциям и handoff — в <a href="#sec-approvals">разделе 6</a>. Выше — скетч, ZIP, бирка/маркировка (если включена в ворота) и критичные комментарии.</p></div>`;
}

function buildProductionModelExportHtml(dossier: Workshop2DossierPhase1): string {
  const model = ensureWorkshop2ProductionModel(dossier);
  const preflight = buildWorkshop2ProductionPreflightSnapshot(dossier);
  const nodesHtml = model.nodes
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((node) => {
      const materials = model.materialLines.filter((m) => m.nodeId === node.id);
      const trims = model.trimLines.filter((m) => m.nodeId === node.id);
      const operations = model.operations.filter((o) => o.nodeId === node.id);
      return `<tr>
        <td>${escHtml(node.label)}</td>
        <td>${escHtml(node.description || (node.notApplicable ? 'Нет в модели' : '—'))}</td>
        <td>${
          materials
            .map((m) =>
              escHtml(
                [
                  m.materialName,
                  m.compositionText,
                  m.percentage != null ? `${m.percentage}%` : '',
                  m.yieldPerUnit ? `расход: ${m.yieldPerUnit} ${m.yieldUnit || 'м'}` : '',
                ]
                  .filter(Boolean)
                  .join(' · ')
              )
            )
            .join('<br>') || '—'
        }</td>
        <td>${
          trims
            .map((t) =>
              escHtml(
                [t.name, t.size, t.quantity != null ? `${t.quantity} шт` : '', t.placement]
                  .filter(Boolean)
                  .join(' · ')
              )
            )
            .join('<br>') || '—'
        }</td>
        <td>${
          operations
            .map((o) =>
              escHtml(
                [o.operationType, o.seamType, o.processingMethod, o.comment]
                  .filter(Boolean)
                  .join(' · ')
              )
            )
            .join('<br>') || '—'
        }</td>
      </tr>`;
    })
    .join('');
  const issuesHtml = preflight.issues
    .map(
      (i) =>
        `<li><strong>${
          i.severity === 'blocker' ? 'Блокер' : i.severity === 'warning' ? 'Предупреждение' : 'Инфо'
        }:</strong> ${escHtml(i.label)} — ${escHtml(i.detail)}</li>`
    )
    .join('');
  return `<h3 id="sec-production-model">Производственная карта изделия</h3>
    <p><strong>Готовность:</strong> ${preflight.score}/100 · ${
      preflight.canSendToFactory ? 'готово к передаче' : 'есть блокеры'
    }</p>
    <table>
      <thead><tr><th>Узел</th><th>Конструкция</th><th>Материалы</th><th>Фурнитура</th><th>Операции</th></tr></thead>
      <tbody>${nodesHtml}</tbody>
    </table>
    ${
      issuesHtml
        ? `<h4>Диагностика перед передачей</h4><ul>${issuesHtml}</ul>`
        : '<p class="muted">Критичных замечаний нет.</p>'
    }`;
}

function buildSignoffAndHandoffMergedHtml(
  dossier: Workshop2DossierPhase1,
  sec: Workshop2DossierSectionSignoffs,
  handoff: ReturnType<typeof resolveWorkshop2TechPackHandoffChecklistRow>,
  ctx: Workshop2FinalTzSpecExportContext
): string {
  const signRows = (['general', 'material', 'construction', 'assignment'] as const).map(
    (section) => {
      const label = SECTION_SIGNOFF_LABELS[section];
      const b = formatSignoffCell(sec[section]?.brand);
      const t = formatSignoffCell(sec[section]?.tech);
      return `<tr><td>${escHtml(label)}</td><td>${escHtml(b)}</td><td>${escHtml(t)}</td></tr>`;
    }
  );
  const handRows = handoff
    ? `<tr><td colspan="3"><strong>Передача (tech pack)</strong></td></tr>
       <tr><td>Ревизия пакета</td><td colspan="2">${escHtml(handoff.packageRevisionLabel || '—')}</td></tr>
       <tr><td>Канал · статус</td><td colspan="2">${escHtml(handoff.channel)} · ${escHtml(
         handoff.status
       )}</td></tr>
       <tr><td>Бренд «передано»</td><td colspan="2">${handoff.brandDispatchedAt ? escHtml(handoff.brandDispatchedAt) : '—'}</td></tr>
       <tr><td>Цех «получено»</td><td colspan="2">${handoff.factoryReceivedAt ? escHtml(handoff.factoryReceivedAt) : '—'}</td></tr>`
    : `<tr><td colspan="3"><strong>Передача (tech pack)</strong> — <span class="muted">запись передачи ещё не создана или нет полной пары «бренд + цех».</span></td></tr>`;
  return `<h2 id="sec-approvals">5. ${getBilingualHeader('Подписи секций и передача в производство', ctx.exportLanguage)}</h2>
    <p class="muted">Одна таблица: цифровые подписи по разделам ТЗ и последняя актуальная строка handoff (по правилам чеклиста «Отправка»).</p>
    <table>
      <thead><tr><th>Секция ТЗ / тема</th><th>Бренд</th><th>Технолог</th></tr></thead>
      <tbody>${signRows.join('')}${handRows}</tbody>
    </table>`;
}

function formatSignoffCell(m?: { by: string; at: string; byOrganization?: string } | null): string {
  if (!m?.at) return '—';
  const org = m.byOrganization?.trim();
  const who = org ? `${m.by} · ${org}` : m.by;
  try {
    return `${who} · ${new Date(m.at).toLocaleString('ru-RU')}`;
  } catch {
    return `${who} · ${m.at}`;
  }
}

function matParameterLabelMap(): Map<string, string> {
  const mat = getAttributeById('mat');
  const m = new Map<string, string>();
  for (const p of mat?.parameters ?? []) m.set(p.parameterId, p.label);
  return m;
}

function buildFinalTzMaterialBomInput(
  dossier: Workshop2DossierPhase1,
  ctx: Pick<
    Workshop2FinalTzSpecExportContext,
    'articleSku' | 'articleName' | 'pathLabel' | 'l2Name' | 'tzPhase' | 'categoryLeafId'
  >
): MaterialBomExportInput {
  const phaseNum = ctx.tzPhase === '1' ? 1 : ctx.tzPhase === '2' ? 2 : 3;
  const leafIds = resolveAttributeIdsForLeaf(ctx.categoryLeafId, phaseNum);
  const linkedComposition = leafIds.includes('mat') && leafIds.includes('composition');
  const matAssign = dossier.assignments.find(
    (x) => x.kind === 'canonical' && x.attributeId === 'mat'
  );
  const matLines = (matAssign?.values ?? [])
    .filter((v) => v.valueSource === 'handbook_parameter')
    .map((v) => v.displayLabel.trim())
    .filter(Boolean);
  const rows = parseMatRowsFromDossier(dossier, matParameterLabelMap());
  return {
    sku: ctx.articleSku.trim() || '—',
    productName: ctx.articleName.trim() || ctx.pathLabel.trim() || '—',
    l2Name: ctx.l2Name,
    tzPhase: ctx.tzPhase,
    matLines,
    composition: rows.map((r) => ({ label: r.label, pct: r.pct })),
    linkedComposition,
  };
}

function stripMaterialBomPlainTextFooter(plain: string): string {
  const marker = '\n\nЭкспорт из Synth-1 Workshop2 ·';
  const i = plain.indexOf(marker);
  return (i === -1 ? plain : plain.slice(0, i)).trimEnd();
}

function dimHeaderLabel(dossier: Workshop2DossierPhase1, dimKey: string): string {
  const ov = dossier.sampleBaseDimensionLabelOverrides?.[dimKey]?.trim();
  if (ov) return ov;
  return dimKey;
}

function dimScalarValue(
  dossier: Workshop2DossierPhase1,
  pid: string,
  labelKey: string,
  rowIndex: number
): string {
  const v =
    dossier.sampleBasePerSizeDimensions?.[pid]?.[labelKey] ??
    (rowIndex === 0 ? dossier.sampleBaseDimensionOverrides?.[labelKey] : undefined) ??
    '';
  return String(v).trim();
}

function formatRangeCell(cell: Workshop2Phase1DimensionRangeCell | undefined): string {
  if (!cell) return '—';
  const min = cell.min.trim();
  const max = cell.max.trim();
  const nom = cell.nominal?.trim();
  if (min && max) {
    const base = `${min}–${max}`;
    return nom ? `${base} (ном.: ${nom})` : base;
  }
  return min || max || nom || '—';
}

/** Таблица POM / sample size для экспорта (итоговое ТЗ и factory pack лист 6). */
export function buildWorkshop2MeasurementsExportHtml(
  dossier: Workshop2DossierPhase1,
  leaf: HandbookCategoryLeaf
): string {
  const sampleAssign = dossier.assignments.find(
    (x) => x.kind === 'canonical' && x.attributeId === 'sampleBaseSize'
  );
  const { hbs, ft } = partitionHandbookAndFree(sampleAssign);
  const freeOnly = !hbs.length && (ft?.text?.trim() ?? '');
  if (freeOnly) {
    return `<p><strong>Свободный ввод:</strong> ${escHtml(freeOnly)}</p>`;
  }
  if (!hbs.length) {
    return '<p class="muted">Базовый размер не заполнен (нет строк шкалы).</p>';
  }

  const dimLabels = getWorkshopDimensionLabels(leaf);
  const hidden = new Set(dossier.sampleBaseHiddenDimensionKeys ?? []);
  const visibleDimLabels = dimLabels.filter((d) => !hidden.has(d));
  const extras = dossier.sampleBaseExtraDimensions ?? [];
  const colKeys = [...visibleDimLabels, ...extras.map((ex) => `__extra:${ex.id}`)];
  const colHeaders = [
    ...visibleDimLabels.map((k) => dimHeaderLabel(dossier, k)),
    ...extras.map((ex) => (ex.label.trim() ? ex.label.trim() : ex.id)),
  ];
  const rangeMode = !!dossier.sampleBaseDimensionRangeMode;
  const rangeKeys = new Set(dossier.sampleBaseDimensionRangeKeys ?? []);
  const rangeByPid = dossier.sampleBasePerSizeDimensionRanges ?? {};

  const thead = `<thead><tr><th>Размер</th>${colHeaders
    .map((h, i) => {
      const key = colKeys[i];
      const tol = key && dossier.sampleBaseDimensionTolerances?.[key];
      const tolStr =
        tol && (tol.plus || tol.minus)
          ? `<br/><span class="muted" style="font-size: 0.8em; font-weight: normal;">(±${tol.plus || 0}/${tol.minus || 0}см)</span>`
          : '';
      return `<th>${escHtml(h)}${tolStr}</th>`;
    })
    .join('')}<th>Кол-во, шт</th></tr></thead>`;

  const bodyRows = hbs.map((hb, rowIndex) => {
    const pid = hb.parameterId!;
    const sizeLabel = resolvedHandbookDisplayLabel('sampleBaseSize', pid, hb.displayLabel);
    const cells = colKeys.map((key) => {
      const isExtra = key.startsWith('__extra:');
      if (rangeMode && rangeKeys.has(key) && !isExtra) {
        const cell = rangeByPid[pid]?.[key];
        const t = formatRangeCell(cell);
        return t === '—' ? escHtml(dimScalarValue(dossier, pid, key, rowIndex) || '—') : escHtml(t);
      }
      if (isExtra) {
        const v = dossier.sampleBasePerSizeDimensions?.[pid]?.[key] ?? '';
        return escHtml(String(v).trim() || '—');
      }
      return escHtml(dimScalarValue(dossier, pid, key, rowIndex) || '—');
    });
    const qtyRaw = dossier.sampleBasePerSizePieceQty?.[pid];
    const qty =
      typeof qtyRaw === 'number' && Number.isFinite(qtyRaw) && qtyRaw > 0
        ? String(Math.floor(qtyRaw))
        : '—';
    return `<tr><td>${escHtml(sizeLabel)}</td>${cells.map((c) => `<td>${c}</td>`).join('')}<td>${escHtml(
      qty
    )}</td></tr>`;
  });

  const primaryTable = `<table class="measurements">${thead}<tbody>${bodyRows.join('')}</tbody></table>`;

  const hasRanges = Object.keys(rangeByPid).some((pid) =>
    colKeys.some((k) => {
      if (k.startsWith('__extra:')) return false;
      const c = rangeByPid[pid]?.[k];
      return c && (c.min.trim() || c.max.trim() || (c.nominal?.trim() ?? ''));
    })
  );

  if (!hasRanges) return primaryTable;

  const rangeHead = `<thead><tr><th>Размер</th>${colHeaders
    .map((h, i) => {
      const key = colKeys[i];
      const tol = key && dossier.sampleBaseDimensionTolerances?.[key];
      const tolStr =
        tol && (tol.plus || tol.minus)
          ? `<br/><span class="muted" style="font-size: 0.8em; font-weight: normal;">(±${tol.plus || 0}/${tol.minus || 0}см)</span>`
          : '';
      return `<th>${escHtml(h)} (диап.)${tolStr}</th>`;
    })
    .join('')}</tr></thead>`;
  const rangeBody = hbs.map((hb) => {
    const pid = hb.parameterId!;
    const sizeLabel = resolvedHandbookDisplayLabel('sampleBaseSize', pid, hb.displayLabel);
    const cells = colKeys.map((key) => {
      if (key.startsWith('__extra:')) return '<td>—</td>';
      const t = formatRangeCell(rangeByPid[pid]?.[key]);
      return `<td>${escHtml(t)}</td>`;
    });
    return `<tr><td>${escHtml(sizeLabel)}</td>${cells.join('')}</tr>`;
  });

  return `${primaryTable}<h4>Диапазоны (мин–макс)</h4><table class="measurements">${rangeHead}<tbody>${rangeBody.join(
    ''
  )}</tbody></table>`;
}

function assignmentLines(dossier: Workshop2DossierPhase1, maxRows: number): string[] {
  const rows: string[] = [];
  for (const a of dossier.assignments) {
    if (a.kind !== 'canonical' || !a.attributeId) continue;
    const attr = getAttributeById(a.attributeId);
    const name = attr?.name ?? a.attributeId;
    const parts = a.values
      .map((v) => v.displayLabel?.trim() || v.text || String(v.number ?? ''))
      .filter(Boolean);
    const line = `${name}: ${parts.length ? parts.join(', ') : '—'}`;
    rows.push(line);
    if (rows.length >= maxRows) break;
  }
  return rows;
}

export type Workshop2FinalTzSpecExportContext = {
  articleSku: string;
  articleName: string;
  pathLabel: string;
  l2Name: string;
  tzPhase: '1' | '2' | '3';
  categoryLeafId: string;
  /** Колонки мерок и шкала — из листа каталога; при null показывается заглушка. */
  measurementsLeaf: HandbookCategoryLeaf | null;
  preflightOk: boolean;
  preflightIssueCount: number;
  sectionSignoffsFull: number;
  gateLifecycleState: string;
  exportLanguage?: 'ru' | 'ru_en' | 'ru_zh';
};

/** Метаданные итогового ТЗ из PG-досье (без mock «Тестовое изделие» на factory portal). */
export function buildWorkshop2FinalTzExportContextFromDossier(
  dossier: Workshop2DossierPhase1,
  input?: { articleId?: string; exportLanguage?: 'ru' | 'ru_en' | 'ru_zh' }
): Workshop2FinalTzSpecExportContext {
  const lastExport = dossier.finalTzDocumentLastExport;
  const mirror = dossier.articleFormMirror;
  const categoryLeafId =
    mirror?.categoryLeafId?.trim() ||
    dossier.categorySketchAnnotations
      ?.find((a) => a.categoryLeafId?.trim())
      ?.categoryLeafId?.trim() ||
    'catalog-unassigned';
  const leaf = findHandbookLeafById(categoryLeafId);
  const pathLabel = lastExport?.pathLabelSnapshot?.trim() || leaf?.pathLabel || '—';
  const l2Name = leaf?.l2Name || '—';
  const articleSku =
    mirror?.sku?.trim() ||
    lastExport?.articleSkuSnapshot?.trim() ||
    input?.articleId?.trim() ||
    '—';
  const articleName =
    lastExport?.articleNameSnapshot?.trim() ||
    dossier.optionalNote?.trim()?.split('\n')[0] ||
    (input?.articleId ? `Артикул ${input.articleId}` : '—');
  const preflight = buildWorkshop2ProductionPreflightSnapshot(dossier);
  const gateSnapshot = buildWorkshop2TzGateSnapshot(dossier, {
    activeCategoryLeafId: categoryLeafId,
  });

  return {
    articleSku,
    articleName,
    pathLabel,
    l2Name,
    tzPhase: '1',
    categoryLeafId,
    measurementsLeaf: leaf ?? null,
    preflightOk: preflight.canSendToFactory,
    preflightIssueCount: preflight.issues.length,
    sectionSignoffsFull: gateSnapshot.sectionSignoffsFull,
    gateLifecycleState: gateSnapshot.state,
    exportLanguage: input?.exportLanguage ?? 'ru_en',
  };
}

/**
 * Единый HTML-документ «Итоговое ТЗ» по артикулу (оглавление + блоки по порядку).
 * Предназначен для превью, скачивания и печати в PDF через диалог браузера.
 */
export function buildWorkshop2FinalTzSpecDocumentHtml(
  dossier: Workshop2DossierPhase1,
  ctx: Workshop2FinalTzSpecExportContext
): string {
  const sku = ctx.articleSku.trim() || '—';
  const name = ctx.articleName.trim() || '—';
  const path = ctx.pathLabel.trim() || '—';
  const updated = dossier.updatedAt ? new Date(dossier.updatedAt).toLocaleString('ru-RU') : '—';
  const brief = dossier.passportProductionBrief;
  const visualQ = getVisualHandoffQuickSummary(dossier);
  const handoff = resolveWorkshop2TechPackHandoffChecklistRow(dossier.techPackFactoryHandoffs);
  const sheets = normalizeSketchSheets(dossier.sketchSheets);
  const attachments = dossier.techPackAttachments ?? [];
  const sec: Workshop2DossierSectionSignoffs = dossier.sectionSignoffs ?? {};
  const productionPreflight = buildWorkshop2ProductionPreflightSnapshot(dossier);
  const exportStatus = productionPreflight.canSendToFactory ? 'ready_for_factory' : 'draft';

  const TOC_ITEMS = [...FINAL_TZ_SECTION_ORDER];

  // Factory comments block
  let factoryCommentsHtml = '';
  if (dossier.attrComments) {
    const factoryComments: {
      attrId: string;
      label: string;
      text: string;
      by: string;
      at: string;
    }[] = [];
    for (const [attrId, comments] of Object.entries(dossier.attrComments)) {
      const fComments = comments.filter((c) => c.visibility === 'factory');
      if (fComments.length > 0) {
        const attr = getAttributeById(attrId);
        const label = attr ? attr.name : attrId;
        for (const c of fComments) {
          factoryComments.push({ attrId, label, text: c.text, by: c.by, at: c.at });
        }
      }
    }

    if (factoryComments.length > 0) {
      TOC_ITEMS.push({
        anchor: 'sec-comments',
        title: 'Комментарии для фабрики',
        description: 'Важные уточнения по атрибутам',
      });

      const cRows = factoryComments
        .map((c) => {
          return `<tr>
          <td>${escHtml(c.label)}</td>
          <td>${escHtml(c.text)}</td>
          <td class="muted">${escHtml(c.by)}<br>${new Date(c.at).toLocaleString('ru-RU')}</td>
        </tr>`;
        })
        .join('');

      factoryCommentsHtml = `
        <h2 id="sec-comments">${TOC_ITEMS.length}. ${getBilingualHeader('Комментарии для фабрики', ctx.exportLanguage)}</h2>
        <table>
          <thead><tr><th>Атрибут / Блок</th><th>Комментарий</th><th>Автор и дата</th></tr></thead>
          <tbody>${cRows}</tbody>
        </table>
      `;
    }
  }

  const toc = TOC_ITEMS.map(
    (s) =>
      `<li><a href="#${s.anchor}">${escHtml(s.title)}</a> — <span class="muted">${escHtml(
        s.description
      )}</span></li>`
  ).join('');

  const passportBriefLines: string[] = [];
  if (brief?.targetSampleOrPilotDate)
    passportBriefLines.push(`Целевая дата образца/пилота: ${brief.targetSampleOrPilotDate}`);
  if (brief?.plannedLaunchType) passportBriefLines.push(`Тип запуска: ${brief.plannedLaunchType}`);
  if (brief?.articleCardOwnerRole)
    passportBriefLines.push(`Владелец карточки: ${brief.articleCardOwnerRole}`);
  if (brief?.packagingAndLabelingNote)
    passportBriefLines.push(`Упаковка и маркировка: ${brief.packagingAndLabelingNote}`);
  if (brief?.weightAndDimensionsNote)
    passportBriefLines.push(`Весогабаритные характеристики: ${brief.weightAndDimensionsNote}`);
  const passportAssignments = assignmentLines(dossier, 24);
  const catalogSnapshotHtml = buildCatalogFieldsSnapshotHtml(dossier, ctx);
  const passportBlock = `
    <h2 id="sec-passport">1. ${getBilingualHeader('Паспорт', ctx.exportLanguage)}</h2>
    <p><strong>SKU:</strong> ${escHtml(sku)} · <strong>Изделие:</strong> ${escHtml(name)}</p>
    <p><strong>Ветка каталога:</strong> ${escHtml(path)}</p>
    <p class="muted">Версия данных (updatedAt): ${escHtml(updated)}</p>
    <h3>${getBilingualHeader('Бриф', ctx.exportLanguage)}</h3>
    ${
      passportBriefLines.length
        ? `<ul>${passportBriefLines.map((l) => `<li>${escHtml(l)}</li>`).join('')}</ul>`
        : '<p class="muted">Бриф не заполнен или сокращён в экспорте.</p>'
    }
    <h3>${getBilingualHeader('Поля каталога по секциям (заполнено / не заполнено)', ctx.exportLanguage)}</h3>
    ${catalogSnapshotHtml}
    <h3>${getBilingualHeader('Ключевые поля (порядок в досье, сокращённо)', ctx.exportLanguage)}</h3>
    <ul>${passportAssignments.map((l) => `<li>${escHtml(l)}</li>`).join('')}</ul>
  `;

  const matAlts = dossier.materialAlternativeDrafts?.length ?? 0;
  const bomDeltas = dossier.bomLineDeltaDrafts?.length ?? 0;
  const bomPlain = stripMaterialBomPlainTextFooter(
    formatMaterialBomPlainText(buildFinalTzMaterialBomInput(dossier, ctx))
  );
  const materialChecklistHtml = buildMaterialChecklistExcerptHtml(dossier, ctx);
  const compositionLabelExportHtml = buildCompositionLabelSpecExportHtml(
    dossier.compositionLabelSpec
  );
  const compositionBomCrossRef = workshop2CompositionLabelSpecHasExportableContent(
    dossier.compositionLabelSpec
  )
    ? '<p class="muted"><strong>Составник / бирка:</strong> параметры заданы — см. <a href="#sec-composition-label">подсекцию выше</a>.</p>'
    : '';
  const canonicalPackHtml = buildWorkshop2TechPackCanonicalPreviewBlockHtml(attachments);
  const materialBlock = `
    <h2 id="sec-material">2. ${getBilingualHeader('Материалы', ctx.exportLanguage)}</h2>
    ${materialChecklistHtml}
    ${compositionLabelExportHtml}
    ${buildProductionModelExportHtml(dossier)}
    <h3>BOM и состав (текст)</h3>
    <pre class="pre-bom">${escHtml(bomPlain)}</pre>
    ${compositionBomCrossRef}
    <ul>
      <li>Альтернативы материала (draft): ${matAlts}</li>
      <li>Дельты BOM (draft): ${bomDeltas}</li>
    </ul>
  `;

  const measurementsHtml = ctx.measurementsLeaf
    ? buildWorkshop2MeasurementsExportHtml(dossier, ctx.measurementsLeaf)
    : '<p class="muted">Мерки по листу каталога не переданы в контекст экспорта.</p>';

  const visualChecklistHtml = buildVisualChecklistExcerptHtml(dossier);
  const constructionBlock = `
    <h2 id="sec-construction">3. ${getBilingualHeader('Визуал и Конструкция', ctx.exportLanguage)}</h2>
    <ul>
      <li>Референсы: ${dossier.visualReferences?.length ?? 0} шт.</li>
      <li>Канон скетча: ${escHtml(canonicalSketchHuman(dossier))}</li>
      <li>Метки (все доски): ${visualQ.sketchPinTotal}</li>
      <li>Чеклист менеджера: ${visualQ.checklistDone}/${visualQ.checklistTotal}</li>
      <li>Листов скетча: ${sheets.length}</li>
      <li>Вложений tech pack: ${attachments.length}</li>
    </ul>
    ${visualChecklistHtml}
    <h3>${getBilingualHeader('Базовый размер и мерки', ctx.exportLanguage)}</h3>
    ${measurementsHtml}
    <p class="muted">Растровые подложки скетчей не встраиваются — см. выгрузки ZIP.</p>
  `;

  const attRows = attachments
    .map(
      (a) =>
        `<tr><td>${escHtml(a.fileName)}</td><td>${escHtml(a.sourceKind ?? '—')}</td><td>${escHtml(
          a.remoteSyncState ?? (a.previewDataUrl || a.byteStorage ? 'local' : '—')
        )}</td></tr>`
    )
    .join('');

  const attachmentsBlock = `
    <h2 id="sec-attachments">4. ${getBilingualHeader('Вложения tech pack', ctx.exportLanguage)}</h2>
    ${
      attachments.length
        ? `<table><thead><tr><th>Файл</th><th>Тип</th><th>Синхронизация</th></tr></thead><tbody>${attRows}</tbody></table>`
        : '<p class="muted">Вложений нет.</p>'
    }
  `;

  const approvalsBlock = buildSignoffAndHandoffMergedHtml(dossier, sec, handoff, ctx);

  const assignmentCompletion = calculateWorkshopTzSectionCompletion(
    'assignment',
    dossier,
    resolveRowsForFinalTzExport(ctx),
    { tzPhase: ctx.tzPhase }
  );
  const assignmentCheckStripHtml = `<p class="muted"><strong>Чеклист «Задание» (счётчики как в UI):</strong> выполнено <strong>${assignmentCompletion.done}/${assignmentCompletion.total}</strong> (${assignmentCompletion.pct}%). Подписи по трём секциям ТЗ и строка handoff — в <a href="#sec-approvals">разделе 5</a>; пошаговая детализация — в хабе «Задание».</p>`;

  const statusStrip = `
    <div class="status">
      <p><strong>Статус документа:</strong> ${
        exportStatus === 'ready_for_factory' ? 'Готово к передаче в производство' : 'Черновик'
      }</p>
      <p><strong>Контур готовности (сводка):</strong> Pre-flight — ${
        ctx.preflightOk ? 'OK' : `есть замечания (${ctx.preflightIssueCount})`
      };
      подписи секций: ${ctx.sectionSignoffsFull}/4;
      состояние ворот (жизненный цикл): ${escHtml(ctx.gateLifecycleState)}.</p>
      <p class="muted">Источник правды по блокерам — блок Pre-flight; ниже — полный текст спецификации для передачи «одним файлом». Таблица воротов печатает скетч, ZIP, бирку/маркировку (если не закрыта) и критичные комментарии; <strong>одна</strong> сводная таблица подписей по секциям и handoff — в <a href="#sec-approvals">разделе 5</a> (без повторения этих строк в таблице ворот).</p>
    </div>
  `;
  const gateCheckHtml = buildFinalTzGateCheckHtml(dossier);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>${escHtml(sku)} — Итоговое ТЗ</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; color: #111; line-height: 1.45; }
    h1 { font-size: 1.35rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.05rem; margin-top: 1.75rem; border-bottom: 1px solid #ddd; padding-bottom: 0.2rem; }
    h3 { font-size: 0.95rem; margin-top: 1rem; }
    .muted { color: #555; font-size: 0.88rem; }
    .status { background: #f6f7f9; border: 1px solid #e2e4ea; padding: 12px 14px; border-radius: 8px; margin: 16px 0; }
    table { border-collapse: collapse; width: 100%; font-size: 0.88rem; margin-top: 8px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #fafafa; }
    .gate-check { margin: 14px 0 18px; }
    .gate-check h3 { font-size: 0.95rem; margin-top: 0; border-bottom: none; }
    .gate-ok { color: #047857; font-weight: 600; }
    .gate-no { color: #b45309; font-weight: 600; }
    .canonical-pack { margin: 12px 0 16px; padding: 10px 12px; border-radius: 8px; border: 1px solid #c7d2fe; background: #eef2ff; font-size: 0.88rem; }
    .canonical-pack ul { margin: 6px 0 0; padding-left: 1.25rem; }
    pre.pre-bom {
      white-space: pre-wrap;
      font-size: 0.82rem;
      background: #f6f7f9;
      border: 1px solid #e2e4ea;
      padding: 10px 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0 12px;
    }
    table.measurements { font-size: 0.82rem; }
    h4 { font-size: 0.9rem; margin-top: 1.1rem; margin-bottom: 0.35rem; }
    ol.checklist { margin: 8px 0 0; padding-left: 1.25rem; font-size: 0.86rem; }
    ol.checklist li { margin: 4px 0; }
    a { color: #0b5fff; }
    @media print { body { margin: 12mm; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>Итоговое техническое задание</h1>
  <p><strong>${escHtml(sku)}</strong> — ${escHtml(name)}</p>
  ${canonicalPackHtml}
  ${statusStrip}
  ${gateCheckHtml}
  ${assignmentCheckStripHtml}
  <h2 class="no-print">Оглавление</h2>
  <ol class="no-print">${toc}</ol>
    ${passportBlock}
    ${materialBlock}
    ${constructionBlock}
    ${attachmentsBlock}
    ${factoryCommentsHtml}
    ${approvalsBlock}
    <hr />
  <p class="muted">Сформировано в Synth-1 Workshop2 · ${escHtml(new Date().toISOString())}</p>
</body>
</html>`;
}

export function downloadWorkshop2FinalTzSpecHtmlFile(html: string, articleSku: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tz-final-${sanitizeFilePart(articleSku)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Печать через браузер: «Сохранить как PDF» с корректной кириллицей. */
export function openWorkshop2FinalTzSpecPrintWindow(html: string): void {
  if (typeof window === 'undefined') return;
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  window.setTimeout(() => {
    try {
      w.focus();
      w.print();
    } catch {
      /* ignore */
    }
  }, 300);
}
