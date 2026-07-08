/** MES-этапы выпуска производственной серии (согласованы с PG mes_release_stage). */

export type FactoryMesReleaseStage = 'queued' | 'cut' | 'sew' | 'qc' | 'released';

export const FACTORY_MES_RELEASE_STAGE_ORDER: readonly FactoryMesReleaseStage[] = [
  'queued',
  'cut',
  'sew',
  'qc',
  'released',
] as const;

export const FACTORY_MES_RELEASE_STAGE_LABEL_RU: Record<FactoryMesReleaseStage, string> = {
  queued: 'Очередь',
  cut: 'Раскрой',
  sew: 'Пошив',
  qc: 'ОТК',
  released: 'Выпуск',
};

export function resolveFactoryMesReleaseStage(
  raw: string | null | undefined
): FactoryMesReleaseStage {
  const v = String(raw ?? '').trim() as FactoryMesReleaseStage;
  return (FACTORY_MES_RELEASE_STAGE_ORDER as readonly string[]).includes(v) ? v : 'queued';
}

export function factoryMesReleaseStageLabelRu(stage: string): string {
  const key = resolveFactoryMesReleaseStage(stage);
  return FACTORY_MES_RELEASE_STAGE_LABEL_RU[key];
}

export function getNextFactoryMesReleaseStage(current: string): FactoryMesReleaseStage | null {
  const stage = resolveFactoryMesReleaseStage(current);
  const idx = FACTORY_MES_RELEASE_STAGE_ORDER.indexOf(stage);
  if (idx < 0 || idx >= FACTORY_MES_RELEASE_STAGE_ORDER.length - 1) return null;
  return FACTORY_MES_RELEASE_STAGE_ORDER[idx + 1]!;
}

export function canAdvanceFactoryMesReleaseStage(poStatus: string, current: string): boolean {
  const stage = resolveFactoryMesReleaseStage(current);
  if (stage === 'released') return false;
  if (poStatus !== 'synced') return false;
  return getNextFactoryMesReleaseStage(stage) != null;
}

export function factoryMesReleaseStageProgressIndex(stage: string): number {
  const s = resolveFactoryMesReleaseStage(stage);
  return FACTORY_MES_RELEASE_STAGE_ORDER.indexOf(s);
}
