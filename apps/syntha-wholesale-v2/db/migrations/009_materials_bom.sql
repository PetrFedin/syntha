BEGIN;

CREATE TABLE product_materials (
  id text PRIMARY KEY,
  brand_id text NOT NULL REFERENCES organisations(id),
  code text NOT NULL CHECK (code ~ '^[A-Z0-9][A-Z0-9._-]{1,39}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  type text NOT NULL CHECK (type IN ('fabric', 'trim', 'label', 'packaging', 'artwork', 'other')),
  status text NOT NULL CHECK (status = 'active'),
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  UNIQUE (brand_id, code),
  UNIQUE (id, brand_id)
);

CREATE TABLE product_material_revisions (
  id text PRIMARY KEY,
  material_id text NOT NULL,
  brand_id text NOT NULL,
  revision_number integer NOT NULL CHECK (revision_number > 0),
  status text NOT NULL CHECK (status IN ('draft', 'approved', 'superseded')),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  uom text NOT NULL CHECK (uom IN ('m', 'kg', 'pcs', 'pair', 'set')),
  unit_cost_minor bigint NOT NULL CHECK (unit_cost_minor >= 0),
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  UNIQUE (material_id, revision_number),
  UNIQUE (id, brand_id),
  FOREIGN KEY (material_id, brand_id)
    REFERENCES product_materials(id, brand_id)
);

CREATE UNIQUE INDEX product_material_revisions_single_draft_idx
  ON product_material_revisions (material_id)
  WHERE status = 'draft';

CREATE UNIQUE INDEX product_material_revisions_single_approved_idx
  ON product_material_revisions (material_id)
  WHERE status = 'approved';

CREATE INDEX product_material_revisions_brand_status_idx
  ON product_material_revisions (brand_id, status, material_id, revision_number DESC);

CREATE TABLE product_boms (
  id text PRIMARY KEY,
  style_id text NOT NULL,
  brand_id text NOT NULL,
  collection_id text NOT NULL,
  style_version integer NOT NULL CHECK (style_version > 0),
  revision_number integer NOT NULL CHECK (revision_number > 0),
  status text NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'superseded')),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  material_cost_minor bigint NOT NULL CHECK (material_cost_minor >= 0),
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  UNIQUE (style_id, revision_number),
  FOREIGN KEY (style_id, brand_id)
    REFERENCES product_styles(id, brand_id),
  FOREIGN KEY (collection_id, brand_id)
    REFERENCES collections(id, brand_id)
);

CREATE UNIQUE INDEX product_boms_single_active_revision_idx
  ON product_boms (style_id)
  WHERE status IN ('draft', 'submitted');

CREATE UNIQUE INDEX product_boms_single_approved_revision_idx
  ON product_boms (style_id)
  WHERE status = 'approved';

CREATE INDEX product_boms_brand_status_idx
  ON product_boms (brand_id, status, style_id, revision_number DESC);

COMMIT;
