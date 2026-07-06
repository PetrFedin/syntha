-- Wave SG: shop dev bridge buyer assortment wishlist (read-only insight, не редактирование ТЗ).

CREATE TABLE IF NOT EXISTS shop_buyer_assortment_wishlist (
  buyer_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  note TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (buyer_id, collection_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_buyer_assortment_wishlist_collection
  ON shop_buyer_assortment_wishlist (collection_id, added_at DESC);
