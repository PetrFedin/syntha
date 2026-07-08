import React from 'react';
import { Building, MapPin, Clock, Phone, Map } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RetailerListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  retailStores: any[];
  displayName: string;
}

export function RetailerListDialog({
  isOpen,
  onOpenChange,
  retailStores = [],
  displayName,
}: RetailerListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden rounded-xl border-none bg-background p-0 shadow-2xl">
        <DialogHeader className="shrink-0 border-b border-muted/10 bg-muted/5 p-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-base font-black uppercase leading-none tracking-tighter">
                Точки продаж
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm font-medium">
                Где купить {displayName} в вашем городе
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-3 pt-6">
          <div className="space-y-10">
            {['Москва', 'Санкт-Петербург', 'Другие города'].map((city) => {
              const stores = (retailStores || []).filter((s) =>
                city === 'Другие города'
                  ? s.city !== 'Москва' && s.city !== 'Санкт-Петербург'
                  : s.city === city
              );
              if (stores.length === 0) return null;

              return (
                <div key={city} className="space-y-6">
                  <h4 className="ml-2 border-b border-accent/10 pb-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                    {city}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {stores.map((store, i) => (
                      <Card
                        key={i}
                        className="group rounded-3xl border border-muted/20 bg-muted/5 p-4 transition-all duration-500 hover:border-accent/20 hover:bg-white hover:shadow-xl"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-3">
                            <h5 className="text-sm font-black uppercase tracking-tight transition-colors group-hover:text-accent">
                              {store.name}
                            </h5>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold">{store.address}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold">{store.hours}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                <span className="text-xs font-bold">{store.phone}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl border border-muted/10 bg-white shadow-sm transition-all group-hover:bg-accent group-hover:text-white"
                          >
                            <Map className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex shrink-0 justify-center border-t border-muted/10 bg-muted/5 p-4">
          <p className="text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Бренд также представлен в более чем 50 мультибрендовых бутиках по всей России
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
