export type CommercialOperationsPermission =
  | "read"
  | "operate"
  | "worker"
  | "schedule"
  | "scheduler";

export interface CommercialOperationsAccessRequest {
  readonly permission: CommercialOperationsPermission;
  readonly organizationId?: string;
}

export interface CommercialOperationsAuthorizer {
  authorize(request: Request): Promise<boolean>;
  authorizeAccess(
    request: Request,
    access: CommercialOperationsAccessRequest,
  ): Promise<boolean>;
}
