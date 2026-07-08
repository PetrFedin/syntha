'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ImagePlus, Upload } from 'lucide-react';
import { CUSTOMIZATION_OPTIONS, type CustomizationOption } from '@/lib/ux/product-customization';

interface ProductCustomizationBlockProps {
  /** ID позиции заказа */
  lineItemId?: string;
  /** Название позиции */
  productName?: string;
  onCustomizationChange?: (optionId: string, file?: File) => void;
}

export function ProductCustomizationBlock({
  lineItemId = 'default',
  productName,
  onCustomizationChange,
}: ProductCustomizationBlockProps) {
  const [selected, setSelected] = useState<Record<string, File | null>>({});

  const handleFileChange = (opt: CustomizationOption, file: File | null) => {
    setSelected((s) => ({ ...s, [opt.id]: file }));
    onCustomizationChange?.(opt.id, file ?? undefined);
  };

  return (
    <Card className="border-amber-100 bg-amber-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ImagePlus className="h-4 w-4" />
          Product Customization
        </CardTitle>
        <CardDescription>RepSpark: логотипы, мокапы при оформлении заказа</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {productName && <p className="text-text-secondary text-xs font-medium">{productName}</p>}
        {CUSTOMIZATION_OPTIONS.map((opt) => (
          <div key={opt.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{opt.label}</Label>
              {opt.price != null && (
                <Badge variant="secondary" className="text-[10px]">
                  +{opt.price} ₽
                </Badge>
              )}
            </div>
            {opt.requiresUpload ? (
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept={opt.acceptedFormats?.map((f) => `.${f}`).join(',')}
                  className="text-xs"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    handleFileChange(opt, f ?? null);
                  }}
                />
                {selected[opt.id] && (
                  <span className="text-text-secondary max-w-[120px] self-center truncate text-xs">
                    {selected[opt.id]?.name}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
