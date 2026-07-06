export type SupplierMaterialCatalogStatus = 'active' | 'review' | 'archived';

export type SupplierMaterialCatalogListing = {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  materialType: string;
  origin: string;
  priceLabel: string;
  status: SupplierMaterialCatalogStatus;
  updatedAt: string;
};
