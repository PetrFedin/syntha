export type CommercialAuditStream = "operations" | "reconciliation";

export interface CommercialAuditChainFields {
  readonly sequence?: number;
  readonly previousHash?: string;
  readonly recordHash?: string;
}

export type CommercialAuditIntegrityStatus =
  | "valid"
  | "partially_sealed"
  | "invalid";

export interface CommercialAuditIntegrityReport {
  readonly status: CommercialAuditIntegrityStatus;
  readonly sealedRecords: number;
  readonly legacyRecords: number;
  readonly latestSequence: number;
  readonly latestHash?: string;
  readonly firstInvalidSequence?: number;
  readonly reason?: string;
}
