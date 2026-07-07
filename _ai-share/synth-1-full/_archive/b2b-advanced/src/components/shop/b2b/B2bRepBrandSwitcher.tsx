'use client';

import { useCallback, useEffect, useState } from 'react';

type BrandEntry = {
  brandId: string;
  tenantId: string;
  labelRu: string;
};

/** Wave 52: select бренда для rep portal когда brands.length > 1. */
export function B2bRepBrandSwitcher({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (brandId: string) => void;
}) {
  const [brands, setBrands] = useState<BrandEntry[]>([]);
  const [selected, setSelected] = useState(value ?? '');

  const load = useCallback(async () => {
    const res = await fetch('/api/shop/b2b/brand-registry', { cache: 'no-store' });
    if (!res.ok) return;
    const json = (await res.json()) as { brands?: BrandEntry[] };
    const list = json.brands ?? [];
    setBrands(list);
    if (!selected && list[0]?.brandId) {
      setSelected(list[0].brandId);
      onChange?.(list[0].brandId);
    }
  }, [onChange, selected]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (value != null) setSelected(value);
  }, [value]);

  if (brands.length <= 1) return null;

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Бренд:</span>
      <select
        className="rounded-md border bg-background px-2 py-1"
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          onChange?.(e.target.value);
        }}
        aria-label="Переключатель бренда rep"
      >
        {brands.map((b) => (
          <option key={b.brandId} value={b.brandId}>
            {b.labelRu || b.brandId}
          </option>
        ))}
      </select>
    </label>
  );
}
