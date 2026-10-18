BEGIN;

ALTER TABLE product_styles
  ADD CONSTRAINT product_styles_id_brand_unique UNIQUE (id, brand_id);

ALTER TABLE catalog_skus
  ADD COLUMN style_id text NULL,
  ADD COLUMN style_version integer NULL CHECK (style_version > 0),
  ADD COLUMN size_grid_id text NULL,
  ADD COLUMN size_grid_version integer NULL CHECK (size_grid_version > 0),
  ADD COLUMN size_label text NULL CHECK (char_length(size_label) BETWEEN 1 AND 16),
  ADD COLUMN color_code text NULL CHECK (color_code ~ '^[A-Z0-9][A-Z0-9._-]{0,39}$');

ALTER TABLE catalog_skus
  ADD CONSTRAINT catalog_skus_product_identity_complete CHECK (
    (
      style_id IS NULL AND style_version IS NULL AND
      size_grid_id IS NULL AND size_grid_version IS NULL AND
      size_label IS NULL AND color_code IS NULL
    ) OR (
      style_id IS NOT NULL AND style_version IS NOT NULL AND
      size_grid_id IS NOT NULL AND size_grid_version IS NOT NULL AND
      size_label IS NOT NULL AND color_code IS NOT NULL
    )
  ),
  ADD CONSTRAINT catalog_skus_style_brand_fk
    FOREIGN KEY (style_id, brand_id) REFERENCES product_styles(id, brand_id),
  ADD CONSTRAINT catalog_skus_size_grid_brand_fk
    FOREIGN KEY (size_grid_id, brand_id) REFERENCES product_size_grids(id, brand_id),
  ADD CONSTRAINT catalog_skus_style_variant_unique
    UNIQUE (style_id, color_code, size_label);

CREATE INDEX catalog_skus_style_variant_idx
  ON catalog_skus (style_id, color_code, size_label, status);

COMMIT;
