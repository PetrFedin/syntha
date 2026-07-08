'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import VirtualTryOn from '@/components/product/try-on/VirtualTryOn';
import { products as allProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TryOnPage() {
  const params = useParams();
  const id = params.id as string;

  const product = useMemo(() => {
    return allProducts.find((p) => p.id === id) || allProducts[0];
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <header className="mb-12 flex items-center justify-between">
          <Link href={`/shop/product/${product.id}`}>
            <Button
              variant="ghost"
              className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> К товару
            </Button>
          </Link>
          <div className="text-right">
            <p className="mb-0.5 text-[10px] font-black uppercase text-slate-400">
              {product.brand}
            </p>
            <h2 className="text-base font-black uppercase leading-none tracking-tight text-slate-900">
              {product.name}
            </h2>
          </div>
        </header>

        <VirtualTryOn product={product} />
      </div>
    </div>
  );
}
