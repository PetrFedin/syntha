/**
 * Platform Core → manufacturer handoff / QC gate (client-safe href builders).
 */
export {
  buildManufacturerHandoffQueueSession,
  manufacturerHandoffFeatureHref,
  type ManufacturerHandoffQueueSession,
} from '@/lib/production/manufacturer-handoff-queue';

export {
  buildManufacturerQcGateSession,
  type ManufacturerQcGateSession,
} from '@/lib/production/manufacturer-qc-gate';
