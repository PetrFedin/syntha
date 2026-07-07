'use client';

import { useState, useEffect } from 'react';
import { brands } from '@/lib/placeholder-data';
import type { Brand, Product } from '@/lib/types';

export function useBrandData(brandId: string) {
  const [brand, setBrand] = useState<Brand | null | undefined>(undefined);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const foundBrand = brands.find((b) => b.slug === brandId);
      setBrand(foundBrand);

      if (foundBrand) {
        try {
          const response = await fetch('/data/products.json');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const productsData = (await response.json()) as Product[];
          if (Array.isArray(productsData)) {
            setAllProducts(productsData);
            const foundProducts = productsData.filter((p) => p.brand === foundBrand.name);
            setBrandProducts(foundProducts);
          }
        } catch (error) {
          console.warn('Failed to fetch products for brand page:', error);
          setAllProducts([]);
          setBrandProducts([]);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [brandId]);

  return {
    brand,
    brandProducts,
    allProducts,
    loading,
  };
}
