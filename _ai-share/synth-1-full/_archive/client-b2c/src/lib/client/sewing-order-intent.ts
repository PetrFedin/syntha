/**
 * Клиентский сценарий «категория handbook + мерки» (made-to-measure ориентир) — граница с заказом/CRM.
 */
export type SewingOrderMeasureStrings = {
  bust: string;
  waist: string;
  hip: string;
  shoulder: string;
  height: string;
};

export function sameMeasureStrings(
  a: SewingOrderMeasureStrings,
  b: SewingOrderMeasureStrings
): boolean {
  return (
    a.bust === b.bust &&
    a.waist === b.waist &&
    a.hip === b.hip &&
    a.shoulder === b.shoulder &&
    a.height === b.height
  );
}

export type SewingOrderIntentServerRecordV1 = {
  v: 1;
  handbookLeafId: string;
  pathLabel: string;
  l1Name: string;
  l2Name: string;
  l3Name: string;
  isApparelSewing: boolean;
  measures: SewingOrderMeasureStrings;
  subject: { kind: 'device' | 'user'; id: string };
  updatedAt: string;
  categoryHandbook?: { schemaVersion: number; generatedAt: string };
  source: 'sewing-patterns';
};

export function sewingIntentSubjectKey(subject: { kind: 'device' | 'user'; id: string }): string {
  return `${subject.kind}:${subject.id}`;
}
