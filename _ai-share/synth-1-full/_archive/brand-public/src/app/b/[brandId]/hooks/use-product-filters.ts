'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { type AudienceFilter } from '../_fixtures/mock-data';

export function useProductFilters(brandProducts: Product[]) {
  const [activeAudience, setActiveAudience] = useState<AudienceFilter[]>([
    'Взрослые - Женщины',
    'Взрослые - Мужчины',
    'Взрослые - Унисекс',
    'Дети - Девочки',
    'Дети - Мальчики',
    'Дети - Унисекс',
  ]);
  const [filterOutlet, setFilterOutlet] = useState<string[]>(['marketplace']);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterColor, setFilterColor] = useState<string[]>([]);
  const [filterSizes, setFilterSizes] = useState<string[]>([]);
  const [filterAttributes, setFilterAttributes] = useState<Record<string, string[]>>({});
  const [filterAvailability, setFilterAvailability] = useState<string[]>(['in_stock', 'pre_order']);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);
  const [selectedSizeRow, setSelectedSizeRow] = useState<any | null>(null);
  const [activeSizeChart, setActiveSizeChart] = useState<any[]>([]);
  const [filterSizeSystem, setFilterSizeSystem] = useState<string>('RU');

  const [categoriesData, setCategoriesData] = useState<any>(null);
  const [colorsData, setColorsData] = useState<any[]>([]);
  const [attributesData, setAttributesData] = useState<any[]>([]);

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [catRes, colRes, attrRes] = await Promise.all([
          fetch('/data/categories.json'),
          fetch('/data/colors.json'),
          fetch('/data/attribute-data.json'),
        ]);
        setCategoriesData((await catRes.json()) as unknown);
        setColorsData((await colRes.json()) as any[]);
        setAttributesData((await attrRes.json()) as any[]);
      } catch (e) {
        console.error('Failed to load reference data', e);
      }
    }
    loadReferenceData();
  }, []);

  const filteredProducts = useMemo(() => {
    return brandProducts.filter((p) => {
      // 1. Audience / Gender Filter
      if (!activeAudience.includes('Все')) {
        let matchesAudience = false;
        if (
          activeAudience.includes('Взрослые - Женщины') &&
          (p.audience === 'Женский' || p.audience === 'Унисекс')
        )
          matchesAudience = true;
        if (
          activeAudience.includes('Взрослые - Мужчины') &&
          (p.audience === 'Мужской' || p.audience === 'Унисекс')
        )
          matchesAudience = true;
        if (activeAudience.includes('Взрослые - Унисекс') && p.audience === 'Унисекс')
          matchesAudience = true;
        if (
          activeAudience.includes('Дети - Девочки') &&
          (p.audience === 'Девочки' || p.audience === 'Детский' || p.audience === 'Унисекс')
        )
          matchesAudience = true;
        if (
          activeAudience.includes('Дети - Мальчики') &&
          (p.audience === 'Мальчики' || p.audience === 'Детский' || p.audience === 'Унисекс')
        )
          matchesAudience = true;
        if (
          activeAudience.includes('Дети - Унисекс') &&
          (p.audience === 'Детский' || p.audience === 'Унисекс')
        )
          matchesAudience = true;
        if (!matchesAudience) return false;
      }

      // 2. Outlet / Marketplace Filter
      if (filterOutlet.length > 0) {
        const isOutlet = p.isOutlet || p.discountPrice;
        if (filterOutlet.includes('outlet') && !filterOutlet.includes('marketplace') && !isOutlet)
          return false;
        if (filterOutlet.includes('marketplace') && !filterOutlet.includes('outlet') && isOutlet)
          return false;
      }

      // 3. Category
      if (filterCategory.length > 0) {
        const isMatch =
          filterCategory.includes(p.category) ||
          filterCategory.includes(p.subcategory || '') ||
          filterCategory.includes(p.subcategory2 || '') ||
          filterCategory.includes(p.category_group || '');
        if (!isMatch) return false;
      }

      // 4. Color
      if (filterColor.length > 0 && !filterColor.includes(p.color)) return false;

      // 5. Size
      if (selectedSizeRow) {
        const productSizes = p.sizes?.map((s) => s.name) || ['One Size'];
        const rowValues = Object.values(selectedSizeRow).map((v) => String(v));
        if (!productSizes.some((ps) => rowValues.includes(ps))) return false;
      }

      // 6. Availability
      if (filterAvailability.length > 0) {
        if (!filterAvailability.includes(p.availability || 'in_stock')) return false;
      }

      // 7. Attributes
      for (const [attrId, selectedValues] of Object.entries(filterAttributes)) {
        if (!selectedValues || selectedValues.length === 0) continue;
        const productAttrValue = (p.attributes as any)?.[attrId];
        if (!selectedValues.includes(productAttrValue)) return false;
      }

      return true;
    });
  }, [
    brandProducts,
    activeAudience,
    filterOutlet,
    filterCategory,
    filterColor,
    filterAttributes,
    selectedSizeRow,
    filterAvailability,
  ]);

  return {
    activeAudience,
    setActiveAudience,
    filterOutlet,
    setFilterOutlet,
    filterCategory,
    setFilterCategory,
    filterColor,
    setFilterColor,
    filterSizes,
    setFilterSizes,
    filterAttributes,
    setFilterAttributes,
    filterAvailability,
    setFilterAvailability,
    isFilterSidebarOpen,
    setIsFilterSidebarOpen,
    filteredProducts,
    categoriesData,
    colorsData,
    attributesData,
    activeSizeChart,
    setActiveSizeChart,
    selectedSizeRow,
    setSelectedSizeRow,
    filterSizeSystem,
    setFilterSizeSystem,
  };
}
