/**
 * Collection linesheet PDF из опубликованных артикулов W2 (jsPDF, RU).
 */
import { jsPDF } from 'jspdf';
import type { Workshop2PublishedShowroomArticle } from '@/lib/server/workshop2-showroom-repository';
import { formatWorkshop2RubCurrency } from '@/lib/production/workshop2-rub-currency';

const PAGE_BOTTOM_MM = 280;
const MARGIN_MM = 14;
const THUMB_W_MM = 22;
const THUMB_H_MM = 28;
const THUMB_X_MM = 210 - MARGIN_MM - THUMB_W_MM;

function imageFormatFromDataUrl(dataUrl: string): 'PNG' | 'JPEG' | null {
  const lower = dataUrl.toLowerCase();
  if (lower.includes('image/jpeg') || lower.includes('image/jpg')) return 'JPEG';
  if (lower.includes('image/png')) return 'PNG';
  return null;
}

async function fetchHttpImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4_000) });
    if (!res.ok) return null;
    const contentType = (res.headers.get('content-type') ?? '').toLowerCase();
    if (!contentType.startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const b64 = buf.toString('base64');
    const mime = contentType.split(';')[0]?.trim() || 'image/jpeg';
    return `data:${mime};base64,${b64}`;
  } catch {
    return null;
  }
}

async function resolveLinesheetHeroEmbed(
  heroUrl: string | undefined
): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' } | null> {
  const raw = heroUrl?.trim();
  if (!raw) return null;

  let dataUrl = raw;
  if (/^https?:\/\//i.test(raw)) {
    const fetched = await fetchHttpImageAsDataUrl(raw);
    if (!fetched) return null;
    dataUrl = fetched;
  }

  if (!dataUrl.startsWith('data:image')) return null;
  const format = imageFormatFromDataUrl(dataUrl);
  if (!format) return null;
  return { dataUrl, format };
}

export async function buildWorkshop2CollectionLinesheetPdfBytes(input: {
  collectionId: string;
  articles: Workshop2PublishedShowroomArticle[];
  generatedAt?: string;
}): Promise<ArrayBuffer> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  let y = MARGIN_MM;
  const at = input.generatedAt ?? new Date().toISOString();

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > PAGE_BOTTOM_MM) {
      doc.addPage();
      y = MARGIN_MM;
    }
  };

  const line = (text: string, size = 10, x = MARGIN_MM) => {
    ensureSpace(size * 0.45 + 2);
    doc.setFontSize(size);
    doc.text(text.slice(0, 96), x, y);
    y += size * 0.45 + 2;
  };

  line(`Linesheet · ${input.collectionId}`, 14);
  if (input.articles.length === 0) {
    line('Нет опубликованных артикулов — PDF пуст.', 11);
    line('Опубликуйте витрину в W2 или откройте коллекцию SS27.', 9);
    return doc.output('arraybuffer') as ArrayBuffer;
  }
  line(`Коллекция · ${input.articles.length} артикул(ов) · ${at.slice(0, 10)} · ₽`, 9);
  y += 2;

  for (const article of input.articles.slice(0, 40)) {
    const blockStartY = y;
    let textY = y;

    const writeTextLine = (text: string, size = 10) => {
      ensureSpace(size * 0.45 + 2);
      doc.setFontSize(size);
      doc.text(text.slice(0, 72), MARGIN_MM, textY);
      textY += size * 0.45 + 2;
    };

    writeTextLine(`· ${article.name}`, 10);
    writeTextLine(
      `  ${article.articleId}${article.sku && article.sku !== article.articleId ? ` · SKU ${article.sku}` : ''}`,
      8
    );
    if (article.wholesalePriceRub > 0) {
      writeTextLine(`  Опт: ${formatWorkshop2RubCurrency(article.wholesalePriceRub)}`, 9);
    }
    if (article.moq != null) writeTextLine(`  MOQ: ${article.moq} шт`, 8);

    const heroUrl = article.heroImageUrl?.trim();
    let embedded = false;
    if (heroUrl) {
      const embed = await resolveLinesheetHeroEmbed(heroUrl);
      if (embed) {
        try {
          ensureSpace(THUMB_H_MM + 2);
          doc.addImage(
            embed.dataUrl,
            embed.format,
            THUMB_X_MM,
            blockStartY,
            THUMB_W_MM,
            THUMB_H_MM
          );
          embedded = true;
        } catch {
          embedded = false;
        }
      }
      if (!embedded) {
        writeTextLine(`  Превью: ${heroUrl.slice(0, 72)}`, 7);
      }
    }

    y = Math.max(textY, blockStartY + (embedded ? THUMB_H_MM : 0)) + 2;
  }

  line('Источник: W2 published-articles (PG).', 8);
  return doc.output('arraybuffer') as ArrayBuffer;
}
