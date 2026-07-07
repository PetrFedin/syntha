'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface Color {
  name: string;
  hex: string;
}

export default function ColorsPage() {
  const [palette, setPalette] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await fetch('/data/colors.json');
        const data = (await response.json()) as Color[];
        setPalette(data);
      } catch (error) {
        console.error('Failed to fetch colors', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchColors();
  }, []);

  const handleAddColor = () => {
    if (
      newColor.name.trim() &&
      !palette.some((c) => c.hex.toLowerCase() === newColor.hex.toLowerCase())
    ) {
      setPalette((prev) => [...prev, newColor]);
    }
    setIsDialogOpen(false);
    setNewColor({ name: '', hex: '#000000' });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewColor((prev) => ({ ...prev, hex: e.target.value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewColor((prev) => ({ ...prev, name: e.target.value }));
  };

  return (
    <CabinetPageContent maxWidth="full" className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-base font-bold">Справочник цветов</h1>
          <p className="text-muted-foreground">
            Управление палитрой цветов, используемой на платформе.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setNewColor({ name: '', hex: '#000000' });
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить цвет
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый цвет</DialogTitle>
              <DialogDescription>Выберите цвет и дайте ему название.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="color-name">Название цвета</Label>
                  <Input
                    id="color-name"
                    value={newColor.name}
                    onChange={handleNameChange}
                    placeholder="Например, Глубокий синий"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Выберите цвет</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border p-0">
                      <Input
                        type="color"
                        value={newColor.hex}
                        onChange={handleColorChange}
                        className="absolute -left-2 -top-2 h-12 w-12 cursor-pointer border-none p-0"
                      />
                    </div>
                    <Input value={newColor.hex} onChange={handleColorChange} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddColor} disabled={!newColor.name.trim()}>
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Основная палитра</CardTitle>
          <CardDescription>Эти цвета доступны для выбора в карточке товара.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Образец</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>HEX</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {palette.map((color) => (
                  <TableRow key={color.hex}>
                    <TableCell>
                      <div
                        className="h-8 w-12 rounded-md border"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                    </TableCell>
                    <TableCell className="font-medium">{color.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{color.hex}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Редактировать</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              setPalette((prev) => prev.filter((c) => c.hex !== color.hex))
                            }
                          >
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
