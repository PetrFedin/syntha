import 'server-only';

/**
 * Platform Core → material RFQ requisitions (PG/memory).
 */
export {
  listWorkshop2MaterialRequisitions,
  type Workshop2MaterialRequisitionRecord,
} from '@/lib/server/workshop2-material-requisition-repository';
