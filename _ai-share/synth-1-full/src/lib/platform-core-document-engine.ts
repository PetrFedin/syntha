export type PlatformCoreDocumentType =
  | 'tech_pack'
  | 'bom'
  | 'material_sheet'
  | 'sample_photo'
  | 'sample_review'
  | 'linesheet'
  | 'collection_pdf'
  | 'shop_order'
  | 'supplier_po'
  | 'production_order'
  | 'qc_report'
  | 'packing_list'
  | 'asn'
  | 'invoice'
  | 'acceptance_report'
  | 'claim';

export type PlatformCoreDocumentOwnerType =
  | 'article'
  | 'sample'
  | 'collection'
  | 'order'
  | 'supplier_po'
  | 'production_order'
  | 'shipment'
  | 'claim';

export type PlatformCoreDocumentVisibility =
  | 'brand_internal'
  | 'brand_and_shop'
  | 'shop_visible_after_publish'
  | 'shop_visible_after_shipment';

export type PlatformCoreDocumentStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'issued'
  | 'superseded'
  | 'cancelled';

export type PlatformCoreDocument = {
  documentId: string;
  type: PlatformCoreDocumentType;
  ownerType: PlatformCoreDocumentOwnerType;
  ownerId: string;
  version: number;
  title: string;
  fileName?: string;
  storageKey?: string;
  mimeType?: string;
  status: PlatformCoreDocumentStatus;
  visibility: PlatformCoreDocumentVisibility;
  createdAt: string;
  createdByRole: 'brand' | 'shop';
  approvedAt?: string;
  approvedByRole?: 'brand' | 'shop';
  supersedesDocumentId?: string;
  metadata?: Readonly<Record<string, string | number | boolean>>;
};

export type PlatformCoreDocumentRequirement = {
  type: PlatformCoreDocumentType;
  ownerType: PlatformCoreDocumentOwnerType;
  requiredForStage:
    | 'article_ready'
    | 'sample_approved'
    | 'collection_publish'
    | 'order_confirm'
    | 'production_start'
    | 'shipment_ready'
    | 'delivery_acceptance'
    | 'claim_resolution';
  minimumStatus: Extract<PlatformCoreDocumentStatus, 'approved' | 'issued'>;
};

export const PLATFORM_CORE_DOCUMENT_REQUIREMENTS: readonly PlatformCoreDocumentRequirement[] = [
  { type: 'tech_pack', ownerType: 'article', requiredForStage: 'article_ready', minimumStatus: 'approved' },
  { type: 'bom', ownerType: 'article', requiredForStage: 'article_ready', minimumStatus: 'approved' },
  { type: 'sample_review', ownerType: 'sample', requiredForStage: 'sample_approved', minimumStatus: 'approved' },
  { type: 'linesheet', ownerType: 'collection', requiredForStage: 'collection_publish', minimumStatus: 'issued' },
  { type: 'shop_order', ownerType: 'order', requiredForStage: 'order_confirm', minimumStatus: 'issued' },
  { type: 'production_order', ownerType: 'production_order', requiredForStage: 'production_start', minimumStatus: 'issued' },
  { type: 'qc_report', ownerType: 'production_order', requiredForStage: 'shipment_ready', minimumStatus: 'approved' },
  { type: 'packing_list', ownerType: 'shipment', requiredForStage: 'shipment_ready', minimumStatus: 'issued' },
  { type: 'invoice', ownerType: 'shipment', requiredForStage: 'shipment_ready', minimumStatus: 'issued' },
  { type: 'acceptance_report', ownerType: 'shipment', requiredForStage: 'delivery_acceptance', minimumStatus: 'issued' },
  { type: 'claim', ownerType: 'claim', requiredForStage: 'claim_resolution', minimumStatus: 'issued' },
] as const;

export function createPlatformCoreDocument(args: Omit<PlatformCoreDocument, 'version' | 'status'> & {
  version?: number;
  status?: PlatformCoreDocumentStatus;
}): PlatformCoreDocument {
  if (!args.documentId.trim()) throw new Error('documentId is required');
  if (!args.ownerId.trim()) throw new Error('ownerId is required');
  if (!args.title.trim()) throw new Error('title is required');

  return {
    ...args,
    version: args.version ?? 1,
    status: args.status ?? 'draft',
  };
}

export function approvePlatformCoreDocument(
  document: PlatformCoreDocument,
  approvedByRole: 'brand' | 'shop',
  approvedAt: string
): PlatformCoreDocument {
  if (!['draft', 'under_review'].includes(document.status)) {
    throw new Error(`Document in status ${document.status} cannot be approved`);
  }

  return {
    ...document,
    status: 'approved',
    approvedByRole,
    approvedAt,
  };
}

export function issuePlatformCoreDocument(document: PlatformCoreDocument): PlatformCoreDocument {
  if (!['approved', 'draft'].includes(document.status)) {
    throw new Error(`Document in status ${document.status} cannot be issued`);
  }
  return { ...document, status: 'issued' };
}

export function supersedePlatformCoreDocument(args: {
  current: PlatformCoreDocument;
  replacementDocumentId: string;
  createdAt: string;
}): { superseded: PlatformCoreDocument; replacement: PlatformCoreDocument } {
  if (!args.replacementDocumentId.trim()) throw new Error('replacementDocumentId is required');

  const superseded: PlatformCoreDocument = {
    ...args.current,
    status: 'superseded',
  };

  const replacement: PlatformCoreDocument = {
    ...args.current,
    documentId: args.replacementDocumentId,
    version: args.current.version + 1,
    status: 'draft',
    createdAt: args.createdAt,
    approvedAt: undefined,
    approvedByRole: undefined,
    supersedesDocumentId: args.current.documentId,
  };

  return { superseded, replacement };
}

export function canPlatformCoreRoleSeeDocument(
  document: PlatformCoreDocument,
  role: 'brand' | 'shop',
  context: { collectionPublished?: boolean; shipmentCreated?: boolean } = {}
): boolean {
  if (role === 'brand') return true;
  if (document.visibility === 'brand_internal') return false;
  if (document.visibility === 'brand_and_shop') return true;
  if (document.visibility === 'shop_visible_after_publish') return Boolean(context.collectionPublished);
  if (document.visibility === 'shop_visible_after_shipment') return Boolean(context.shipmentCreated);
  return false;
}

export function getMissingPlatformCoreDocumentsForStage(args: {
  stage: PlatformCoreDocumentRequirement['requiredForStage'];
  ownerId: string;
  documents: readonly PlatformCoreDocument[];
}): PlatformCoreDocumentRequirement[] {
  const requirements = PLATFORM_CORE_DOCUMENT_REQUIREMENTS.filter(
    (requirement) => requirement.requiredForStage === args.stage
  );

  return requirements.filter((requirement) =>
    !args.documents.some((document) => {
      const statusSatisfied =
        requirement.minimumStatus === 'approved'
          ? ['approved', 'issued'].includes(document.status)
          : document.status === 'issued';

      return (
        document.ownerId === args.ownerId &&
        document.ownerType === requirement.ownerType &&
        document.type === requirement.type &&
        statusSatisfied
      );
    })
  );
}

export function canPlatformCoreAdvanceDocumentStage(args: {
  stage: PlatformCoreDocumentRequirement['requiredForStage'];
  ownerId: string;
  documents: readonly PlatformCoreDocument[];
}): boolean {
  return getMissingPlatformCoreDocumentsForStage(args).length === 0;
}
