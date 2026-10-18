CREATE TABLE product_tech_pack_artifacts (
  id text PRIMARY KEY,
  tech_pack_id text NOT NULL REFERENCES product_tech_packs(id),
  brand_id text NOT NULL REFERENCES organisations(id),
  style_id text NOT NULL,
  format text NOT NULL CHECK (format IN ('html', 'zip')),
  content_type text NOT NULL,
  filename text NOT NULL CHECK (length(filename) BETWEEN 1 AND 180),
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760),
  sha256 char(64) NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL,
  content bytea NOT NULL,
  UNIQUE (tech_pack_id, format),
  FOREIGN KEY (style_id, brand_id) REFERENCES product_styles(id, brand_id),
  CHECK (octet_length(content) = size_bytes),
  CHECK (
    (format = 'html' AND content_type = 'text/html; charset=utf-8') OR
    (format = 'zip' AND content_type = 'application/zip')
  )
);
CREATE INDEX product_tech_pack_artifacts_style_idx ON product_tech_pack_artifacts(brand_id, style_id, tech_pack_id);
