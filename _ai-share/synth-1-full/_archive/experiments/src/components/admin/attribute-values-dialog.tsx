'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttributeValuesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  attribute: {
    id: string;
    name_ru: string;
    description: string;
    values: string[];
  };
  onSave: (attributeId: string, newValues: string[]) => void;
}

export function AttributeValuesDialog({
  isOpen,
  onOpenChange,
  attribute,
  onSave,
}: AttributeValuesDialogProps) {
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setValues(attribute.values);
    }
  }, [isOpen, attribute.values]);

  const handleAddValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      setValues((prev) => [...prev, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    setValues((prev) => prev.filter((v) => v !== valueToRemove));
  };

  const handleSaveChanges = () => {
    onSave(attribute.id, values);
    toast({
      title: 'Изменения сохранены',
      description: `Список значений для атрибута "${attribute.name_ru}" обновлен.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[70vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Значения атрибута: {attribute.name_ru}</DialogTitle>
          <DialogDescription>{attribute.description}</DialogDescription>
        </DialogHeader>
        <div className="-mx-6 flex-1 overflow-y-hidden">
          <ScrollArea className="h-full px-6">
            <div className="space-y-2">
              {values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={value}
                    onChange={(e) => {
                      const newValues = [...values];
                      newValues[index] = e.target.value;
                      setValues(newValues);
                    }}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveValue(value)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="flex gap-2 border-t pt-4">
          <Input
            placeholder="Новое значение..."
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
          />
          <Button onClick={handleAddValue}>
            <PlusCircle className="mr-2 h-4 w-4" /> Добавить
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSaveChanges}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
