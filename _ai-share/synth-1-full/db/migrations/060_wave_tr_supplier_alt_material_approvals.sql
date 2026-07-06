-- Wave TR: supplier alt-material approval PG store (collection + article + primary → alternative).

CREATE TABLE IF NOT EXISTS supplier_alt_material_approvals (
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  collection_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  primary_material TEXT NOT NULL,
  alternative_material TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  PRIMARY KEY (
    organization_id,
    collection_id,
    article_id,
    primary_material,
    alternative_material
  )
);

CREATE INDEX IF NOT EXISTS idx_supplier_alt_material_approvals_article
  ON supplier_alt_material_approvals (organization_id, collection_id, article_id);
