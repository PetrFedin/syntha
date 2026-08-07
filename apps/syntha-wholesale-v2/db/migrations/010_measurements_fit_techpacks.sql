CREATE TABLE product_measurement_charts (
  id text PRIMARY KEY,
  style_id text NOT NULL,
  brand_id text NOT NULL,
  revision_number integer NOT NULL CHECK (revision_number > 0),
  status text NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'superseded')),
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  UNIQUE (style_id, revision_number),
  UNIQUE (id, style_id, brand_id),
  FOREIGN KEY (style_id, brand_id) REFERENCES product_styles(id, brand_id),
  FOREIGN KEY (brand_id) REFERENCES organisations(id)
);
CREATE UNIQUE INDEX product_measurement_charts_single_active_revision_idx
  ON product_measurement_charts(style_id) WHERE status IN ('draft', 'submitted');
CREATE UNIQUE INDEX product_measurement_charts_single_approved_revision_idx
  ON product_measurement_charts(style_id) WHERE status = 'approved';
CREATE INDEX product_measurement_charts_brand_status_idx ON product_measurement_charts(brand_id, status);

CREATE TABLE product_fit_samples (
  id text PRIMARY KEY,
  style_id text NOT NULL,
  brand_id text NOT NULL,
  chart_id text NOT NULL REFERENCES product_measurement_charts(id),
  sample_type text NOT NULL CHECK (sample_type IN ('proto', 'fit', 'size-set', 'pps')),
  sample_number integer NOT NULL CHECK (sample_number > 0),
  size_label text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'evaluated', 'approved', 'rejected')),
  verdict text NOT NULL CHECK (verdict IN ('pending', 'pass', 'fail')),
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  UNIQUE (chart_id, sample_type, sample_number),
  FOREIGN KEY (chart_id, style_id, brand_id) REFERENCES product_measurement_charts(id, style_id, brand_id),
  FOREIGN KEY (style_id, brand_id) REFERENCES product_styles(id, brand_id),
  FOREIGN KEY (brand_id) REFERENCES organisations(id)
);
CREATE INDEX product_fit_samples_style_status_idx ON product_fit_samples(style_id, status);
CREATE INDEX product_fit_samples_chart_status_idx ON product_fit_samples(chart_id, status);

CREATE TABLE product_tech_packs (
  id text PRIMARY KEY,
  style_id text NOT NULL,
  brand_id text NOT NULL,
  revision_number integer NOT NULL CHECK (revision_number > 0),
  source_fingerprint text NOT NULL,
  status text NOT NULL CHECK (status IN ('generated')),
  generated_at timestamptz NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  payload jsonb NOT NULL,
  UNIQUE (style_id, revision_number),
  UNIQUE (style_id, source_fingerprint),
  FOREIGN KEY (style_id, brand_id) REFERENCES product_styles(id, brand_id),
  FOREIGN KEY (brand_id) REFERENCES organisations(id)
);
CREATE INDEX product_tech_packs_brand_style_idx ON product_tech_packs(brand_id, style_id, revision_number DESC);
