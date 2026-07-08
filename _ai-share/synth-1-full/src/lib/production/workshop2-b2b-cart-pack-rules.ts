/**
 * Pack / case-pack violations for B2B cart checkout.
 */
import type { Workshop2B2bCartSession } from '@/lib/production/workshop2-b2b-wave23-parity';

export function collectWorkshop2B2bCartPackViolations(input: {
  session: Pick<Workshop2B2bCartSession, 'lines'>;
  casePackByArticleKey: ReadonlyMap<string, number>;
}): string[] {
  const qtyByArticle = new Map<string, { articleId: string; qty: number }>();
  for (const line of input.session.lines) {
    if (line.qty <= 0) continue;
    const key = `${line.collectionId}:${line.articleId}`;
    const prev = qtyByArticle.get(key);
    qtyByArticle.set(key, {
      articleId: line.articleId,
      qty: (prev?.qty ?? 0) + line.qty,
    });
  }

  const violations: string[] = [];
  for (const [key, row] of qtyByArticle) {
    const pack = input.casePackByArticleKey.get(key);
    if (!pack || pack <= 1) continue;
    if (row.qty % pack !== 0) {
      violations.push(`${row.articleId}: кратно ${pack} шт. (pack rule), указано ${row.qty}`);
    }
  }
  return violations;
}
