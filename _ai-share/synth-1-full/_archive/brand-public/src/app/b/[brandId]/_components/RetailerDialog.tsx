'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, Mail, Instagram, Send, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';

interface RetailerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  brandName: string;
}

export function RetailerDialog({ isOpen, onOpenChange, brandName }: RetailerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-xl border-none bg-background p-0 shadow-2xl">
        <Tabs defaultValue="info" className="w-full">
          <DialogHeader className="bg-muted/5 p-4 pb-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-black uppercase tracking-tighter">
                    Шоурум бренда
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium">{brandName}</DialogDescription>
                </div>
              </div>
              {/* cabinetSurface v1 */}
              <TabsList className={cn(cabinetSurface.tabsList, 'w-fit flex-wrap bg-muted/50')}>
                <TabsTrigger value="info" className={cn(cabinetSurface.tabsTrigger, 'h-8 px-3')}>
                  Инфо
                </TabsTrigger>
                <TabsTrigger value="map" className={cn(cabinetSurface.tabsTrigger, 'h-8 px-3')}>
                  Карта
                </TabsTrigger>
              </TabsList>
            </div>
          </DialogHeader>

          <div className="p-4 pt-2">
            <TabsContent value="info" className="m-0 space-y-6 duration-500 animate-in fade-in">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Card className="rounded-3xl border-muted/20 bg-muted/5 p-4">
                  <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-accent">
                    Социальные сети
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-muted/20 bg-white p-2 shadow-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="mb-0.5 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                          Адрес
                        </p>
                        <p className="text-sm font-black">
                          г. Москва, ул. Петровка, 2 (ЦУМ, 3 этаж)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-muted/20 bg-white p-2 shadow-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="mb-0.5 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                          Телефон
                        </p>
                        <p className="text-sm font-black">+7 (495) 933-73-00 (доб. 124)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border border-muted/20 bg-white p-2 shadow-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="mb-0.5 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                          Email
                        </p>
                        <p className="text-sm font-black">showroom@syntha-lab.ai</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <div className="cursor-pointer rounded-lg border border-muted/20 bg-white p-2 shadow-sm transition-colors hover:text-accent">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <div className="cursor-pointer rounded-lg border border-muted/20 bg-white p-2 shadow-sm transition-colors hover:text-accent">
                        <Send className="h-4 w-4" />
                      </div>
                      <div className="cursor-pointer rounded-lg border border-muted/20 bg-white p-2 shadow-sm transition-colors hover:text-accent">
                        <Youtube className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-3xl border-muted/20 bg-muted/5 p-4">
                  <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-accent">
                    Время работы
                  </h4>
                  <div className="space-y-3">
                    {[
                      { day: 'Пн – Пт', time: '10:00 – 22:00', active: true },
                      { day: 'Сб – Вс', time: '11:00 – 21:00', active: true },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-muted/20 py-2 last:border-0"
                      >
                        <span className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">
                          {item.day}
                        </span>
                        <span className="text-sm font-black text-foreground">{item.time}</span>
                      </div>
                    ))}
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-3">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-[10px] font-black uppercase text-green-700">
                        Сейчас открыто
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="rounded-2xl border border-accent/10 bg-accent/5 p-4">
                <p className="text-center text-xs font-bold italic leading-relaxed text-muted-foreground">
                  «В нашем шоуруме вы можете не только примерить все изделия, но и воспользоваться
                  услугой индивидуального снятия мерок для AI-гардероба.»
                </p>
              </div>
            </TabsContent>

            <TabsContent
              value="map"
              className="m-0 duration-500 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border-2 border-muted/20 bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.025123456789!2d37.6176!3d55.7602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a5c12345678%3A0x1234567890abcdef!2z0KbQo9Cc!5e0!3m2!1sru!2sru!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale transition-all duration-700 hover:grayscale-0"
                />
                <div className="absolute bottom-4 right-4 rounded-2xl border border-muted/20 bg-white/90 p-3 shadow-xl backdrop-blur-md">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">
                    Адрес для навигатора
                  </p>
                  <p className="mt-1 text-xs font-bold">Москва, Петровка, 2</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
