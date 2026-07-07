'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List, PlusCircle, Loader2 } from 'lucide-react';
import { AttributeValuesDialog } from '@/components/admin/attribute-values-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

interface Attribute {
  id: string;
  name_ru: string;
  description: string;
  values: string[];
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/attribute-data.json');
        const data = (await response.json()) as Attribute[];
        setAttributes(data);
      } catch (error) {
        console.error('Failed to fetch attributes', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttributes();
  }, []);

  const handleOpenDialog = (attribute: Attribute) => {
    setSelectedAttribute(attribute);
    setIsDialogOpen(true);
  };

  const handleSaveChanges = (attributeId: string, newValues: string[]) => {
    setAttributes((prev) =>
      prev.map((attr) => (attr.id === attributeId ? { ...attr, values: newValues } : attr))
    );
  };

  return (
    <>
      <CabinetPageContent maxWidth="full" className="space-y-4">
        <header>
          <h1 className="font-headline text-base font-bold">Справочник атрибутов</h1>
          <p className="text-muted-foreground">
            Управление всеми возможными характеристиками товаров.
          </p>
        </header>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {attributes.map((attr) => (
              <Card key={attr.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{attr.name_ru}</CardTitle>
                  <CardDescription className="line-clamp-2 h-8 text-xs">
                    {attr.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(attr)}
                  >
                    <List className="mr-2 h-4 w-4" /> Список ({attr.values.length})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(attr)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CabinetPageContent>
      {selectedAttribute && (
        <AttributeValuesDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          attribute={selectedAttribute}
          onSave={handleSaveChanges}
        />
      )}
    </>
  );
}
