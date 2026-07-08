import React from 'react';
import { FileText, Palette, Camera, BookText, Users, Download, Mail } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface PressKitDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
}

export function PressKitDialog({ isOpen, onOpenChange, displayName }: PressKitDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-xl border-none bg-background p-0 shadow-2xl">
        <div className="bg-text-primary relative overflow-hidden p-3 text-white">
          <div className="absolute right-0 top-0 rotate-12 p-4 opacity-10">
            <FileText className="h-64 w-64 text-white" />
          </div>
          <div className="relative z-10">
            <Badge className="mb-4 border-none bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
              Press Resources
            </Badge>
            <h2 className="mb-2 text-sm font-black uppercase leading-none tracking-tighter">
              Press Kit <br />
              <span className="text-accent">{displayName}</span>
            </h2>
            <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white/60">
              Официальные материалы для СМИ, блогеров и партнеров. Всегда актуальные версии.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                title: 'Brand Identity',
                desc: 'Логотипы, шрифты, гайдлайны',
                size: '45 MB',
                icon: <Palette className="h-5 w-5" />,
              },
              {
                title: 'Lookbook SS24',
                desc: 'Студийные фото коллекции',
                size: '128 MB',
                icon: <Camera className="h-5 w-5" />,
              },
              {
                title: 'Brand Story',
                desc: 'История и манифест (PDF)',
                size: '12 MB',
                icon: <BookText className="h-5 w-5" />,
              },
              {
                title: 'PR Photos',
                desc: 'Портреты команды и основателей',
                size: '85 MB',
                icon: <Users className="h-5 w-5" />,
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="group cursor-pointer rounded-2xl border border-muted/20 bg-muted/5 p-3 transition-all duration-500 hover:border-accent/20 hover:bg-white hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all group-hover:bg-accent group-hover:text-white">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="truncate text-sm font-black uppercase tracking-tight">
                      {item.title}
                    </h5>
                    <p className="truncate text-[10px] font-medium text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="mb-1 text-[8px] font-black uppercase text-muted-foreground/40">
                      {item.size}
                    </p>
                    <Download className="h-3.5 w-3.5 text-accent" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-accent/10 bg-accent/5 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight text-accent">
                PR-отдел бренда
              </p>
              <p className="mt-0.5 text-[10px] font-bold leading-snug text-muted-foreground">
                По вопросам интервью и специальных проектов:{' '}
                <span className="font-black text-foreground">press@syntha-lab.ai</span>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
