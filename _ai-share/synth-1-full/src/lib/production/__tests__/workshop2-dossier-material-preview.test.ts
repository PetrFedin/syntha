import {
  extractWorkshop2DossierMaterialPreviews,
  formatDossierMaterialPreviewLine,
  formatWorkshop2MaterialUnitRu,
} from '@/lib/production/workshop2-dossier-material-preview';
import { emptyWorkshop2DossierPhase1 } from '@/lib/production/workshop2-phase1-dossier-storage';

describe('workshop2-dossier-material-preview', () => {
  it('formatWorkshop2MaterialUnitRu maps UoM to RU labels', () => {
    expect(formatWorkshop2MaterialUnitRu('m')).toBe('м');
    expect(formatWorkshop2MaterialUnitRu('m2')).toBe('м²');
    expect(formatWorkshop2MaterialUnitRu('kg')).toBe('кг');
    expect(formatWorkshop2MaterialUnitRu('pcs')).toBe('шт');
    expect(formatWorkshop2MaterialUnitRu('set')).toBe('компл.');
    expect(formatWorkshop2MaterialUnitRu(undefined)).toBe('ед.');
  });

  it('extractWorkshop2DossierMaterialPreviews includes unit and consumption', () => {
    const dossier = {
      ...emptyWorkshop2DossierPhase1(),
      productionModel: {
        materialLines: [
          { materialName: 'Хлопок', unit: 'm', consumption: 2.5 },
          { materialName: 'Пуговицы', unit: 'pcs' },
        ],
      },
    } as ReturnType<typeof emptyWorkshop2DossierPhase1>;

    expect(extractWorkshop2DossierMaterialPreviews(dossier, 1)).toEqual([
      {
        name: 'Хлопок',
        unitLabelRu: 'м',
        consumptionLabel: '2.5 м/изд.',
      },
    ]);
    expect(
      formatDossierMaterialPreviewLine(extractWorkshop2DossierMaterialPreviews(dossier)[1])
    ).toBe('Пуговицы · шт');
  });
});
