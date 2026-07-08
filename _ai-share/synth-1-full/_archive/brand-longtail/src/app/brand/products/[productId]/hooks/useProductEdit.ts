'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productEditSchema, type ProductEditFormValues } from '../_lib/schema';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

export function useProductEdit(productId: string) {
  const { toast } = useToast();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<ProductEditFormValues>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      audience: 'Женский',
      category: '',
      season: 'круглогодичная',
      availableColors: [],
      composition: [],
      images: [],
      videoUrls: [],
      model3dUrls: [],
    } as any,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/data/products.json');
        const data = (await res.json()) as Product[];
        const found = data.find((p) => p.id === productId);
        setProduct(found);
        if (found) form.reset(found as unknown as ProductEditFormValues);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [productId, form]);

  const onSubmit = async (data: ProductEditFormValues) => {
    toast({ title: 'Сохранение...', description: 'Данные продукта обновляются.' });
    // Mock save
    setTimeout(() => toast({ title: 'Сохранено' }), 1000);
  };

  return { form, product, loading, onSubmit };
}
