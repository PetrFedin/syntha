import React from 'react';
import Image from 'next/image';
import { X, Video, PlayCircle, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface VideoDialogProps {
  video: any;
  onClose: () => void;
}

export function VideoDialog({ video, onClose }: VideoDialogProps) {
  return (
    <Dialog open={!!video} onOpenChange={onClose}>
      <DialogContent className="aspect-video max-w-5xl overflow-hidden rounded-xl border-none bg-black p-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Видео: {video?.title}</DialogTitle>
        </VisuallyHidden>
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="absolute left-6 top-4 z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase leading-none tracking-tight text-white">
                {video?.title}
              </h3>
              <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                {video?.type} • {video?.duration}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-6 top-4 z-10 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="bg-text-primary group relative flex h-full w-full items-center justify-center">
            <Image
              src={video?.imageUrl}
              alt="Video Poster"
              fill
              className="object-cover opacity-40"
            />
            <div className="relative z-10 flex h-20 w-20 scale-110 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-2xl transition-all group-hover:scale-125">
              <PlayCircle className="h-10 w-10 fill-current" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-1/3 rounded-full bg-accent" />
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                <span>04:20 / {video?.duration}</span>
                <div className="flex gap-3">
                  <span className="cursor-pointer hover:text-white">HD</span>
                  <span className="cursor-pointer hover:text-white">Subtitles</span>
                  <Maximize2 className="h-4 w-4 cursor-pointer hover:text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
