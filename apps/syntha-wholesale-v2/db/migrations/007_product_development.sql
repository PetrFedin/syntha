BEGIN;

ALTER TABLE collections
  ADD CONSTRAINT collections_id_brand_unique UNIQUE (id, brand_id);

CREATE TABLE IF NOT EXISTS product_size_grids (
  id text PRIMARY KEY,
  brand_id text NOT NULL REFERENCES organisations(id),
  code text NOT NULL CHECK (code ~ '^[A-Z0-9][A-Z0-9._-]{1,39}$'),
  status text NOT NULL CHECK (status IN ('draft', 'published')),
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  UNIQUE (brand_id, code),
  UNIQUE (id, brand_id)
);

CREATE TABLE IF NOT EXISTS product_styles (
  id text PRIMARY KEY,
  brand_id text NOT NULL REFERENCES organisations(id),
  collection_id text NOT NULL,
  style_code text NOT NULL CHECK (style_code ~ '^[A-Z0-9][A-Z0-9._-]{1,39}$'),
  size_grid_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'approved')),
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  UNIQUE (brand_id, style_code),
  FOREIGN KEY (collection_id, brand_id)
    REFERENCES collections(id, brand_id),
  FOREIGN KEY (size_grid_id, brand_id)
    REFERENCES product_size_grids(id, brand_id)
);

CREATE INDEX IF NOT EXISTS product_size_grids_brand_status_idx
  ON product_size_grids (brand_id, status, code);

CREATE INDEX IF NOT EXISTS product_styles_collection_status_idx
  ON product_styles (collection_id, status, style_code);

CREATE INDEX IF NOT EXISTS product_styles_size_grid_idx
  ON product_styles (size_grid_id);

COMMIT;
