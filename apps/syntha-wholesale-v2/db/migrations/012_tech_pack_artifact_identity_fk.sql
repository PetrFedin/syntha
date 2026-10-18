ALTER TABLE product_tech_packs
  ADD CONSTRAINT product_tech_packs_id_style_brand_unique UNIQUE (id, style_id, brand_id);

ALTER TABLE product_tech_pack_artifacts
  ADD CONSTRAINT product_tech_pack_artifacts_tech_pack_identity_fk
  FOREIGN KEY (tech_pack_id, style_id, brand_id)
  REFERENCES product_tech_packs(id, style_id, brand_id);
