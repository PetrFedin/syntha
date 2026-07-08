/**
 * @jest-environment node
 */
import type { WorkingOrderRow } from '@/lib/b2b/working-order-version.types';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  buildTechPackQtyFromDossier,
  buildWorkshop2TechPackQtyBridge,
  parseCartLinesToTechPackQty,
  parseWorkingOrderRowsToTechPackQty,
} from '@/lib/production/workshop2-techpack-qty-bridge';
import { buildWorkshop2TechPackExportOptions } from '@/lib/production/workshop2-techpack-export-options';

function emptyDossier(): Workshop2DossierPhase1 {
  return { schemaVersion: 1, assignments: [] };
}

describe('workshop2-techpack-qty-bridge', () => {
  it('parses working order rows to color x size qty', () => {
    const rows: WorkingOrderRow[] = [
      {
        SKU: 'SKU-1',
        Color: 'Navy',
        'Qty S': '10',
        'Qty M': '20',
      },
    ];
    const parsed = parseWorkingOrderRowsToTechPackQty(rows, { articleSku: 'SKU-1' });
    expect(parsed).toEqual([
      { colorLabel: 'Navy', sizeLabel: 'S', qty: 10 },
      { colorLabel: 'Navy', sizeLabel: 'M', qty: 20 },
    ]);
  });

  it('parses cart lines from shop matrix', () => {
    const parsed = parseCartLinesToTechPackQty(
      [
        {
          collectionId: 'SS27',
          articleId: 'art-1',
          colorCode: 'Navy',
          size: 'M',
          qty: 6,
        },
      ],
      { articleId: 'art-1', collectionId: 'SS27' }
    );
    expect(parsed).toEqual([{ colorLabel: 'Navy', sizeLabel: 'M', qty: 6 }]);
  });

  it('prefers working order over dossier fallback', () => {
    const bridge = buildWorkshop2TechPackQtyBridge({
      dossier: emptyDossier(),
      workingOrderRows: [{ SKU: 'A', Color: 'Black', 'Qty M': '5' }],
      articleSku: 'A',
    });
    expect(bridge.source).toBe('working_order');
    expect(bridge.rows).toHaveLength(1);
  });

  it('falls back to dossier size qty when no working order', () => {
    const dossier: Workshop2DossierPhase1 = {
      ...emptyDossier(),
      assignments: [
        {
          kind: 'canonical',
          attributeId: 'sampleBaseSize',
          values: [
            {
              valueSource: 'handbook_parameter',
              parameterId: 'size_m',
              displayLabel: 'M',
            },
          ],
        },
      ],
      sampleBasePerSizePieceQty: { size_m: 12 },
    };
    const bridge = buildTechPackQtyFromDossier(dossier);
    expect(bridge.source).toBe('dossier_size_only');
    expect(bridge.rows[0]?.qty).toBe(12);
  });

  it('builds export options with qty bridge note', () => {
    const opts = buildWorkshop2TechPackExportOptions({
      dossier: emptyDossier(),
      articleSku: 'X',
    });
    expect(opts.qtyBridgeNote).toContain('Qty');
  });
});
