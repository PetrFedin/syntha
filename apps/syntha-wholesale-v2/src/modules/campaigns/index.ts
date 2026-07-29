export {
  CampaignDomainError,
  campaignId,
  createCampaign,
  reviseCampaign,
  type Campaign,
  type CampaignId,
  type CampaignStatus,
} from './domain/campaign';
export type {
  CampaignRepository,
  LifecycleAuditAction,
  LifecycleAuditRecord,
  LifecycleEntityType,
} from './application/campaign-repository';
export {
  CampaignAlreadyExists,
  CampaignNotFound,
  CampaignVersionConflict,
  createCampaignUseCase,
  getCampaign,
  listCampaigns,
  updateCampaignUseCase,
  type CampaignClock,
  type CampaignIdGenerator,
} from './application/campaign-workflows';
export {
  campaignLifecycleMigrations,
  runCampaignLifecycleMigrations,
} from './infrastructure/campaign-lifecycle-migrations';
export {
  getCampaignLifecyclePool,
  getCampaignRepository,
  resetCampaignRuntime,
} from './infrastructure/campaign-runtime';
export { PostgresCampaignRepository } from './infrastructure/postgres-campaign-repository';
