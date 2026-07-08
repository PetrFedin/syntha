import React from 'react';
import Image from 'next/image';
import { X, Instagram, Send, Youtube, ThumbsUp, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface SocialDialogProps {
  post: any;
  onClose: () => void;
}

export function SocialDialog({ post, onClose }: SocialDialogProps) {
  return (
    <Dialog open={!!post} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-xl border-none bg-background p-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Публикация в {post?.platform}</DialogTitle>
        </VisuallyHidden>
        <div className="relative aspect-video">
          <Image src={post?.imageUrl} alt="Social" fill className="object-cover" />
          <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/20 text-white shadow-lg backdrop-blur-md">
            {post?.platform === 'instagram' && <Instagram className="h-5 w-5" />}
            {post?.platform === 'telegram' && <Send className="h-5 w-5" />}
            {post?.platform === 'youtube' && <Youtube className="h-5 w-5" />}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-6 p-4">
          <div className="flex items-center justify-between">
            <Badge className="border-none bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
              {post?.platform}
            </Badge>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {post?.date}
            </span>
          </div>
          <h3 className="text-sm font-black uppercase leading-tight tracking-tighter">
            {post?.title || 'Публикация в соцсетях'}
          </h3>
          <p className="text-base font-medium leading-relaxed text-foreground/80">{post?.text}</p>
          <div className="flex items-center justify-between border-t border-muted/10 pt-4">
            <div className="flex items-center gap-3">
              {post?.likes && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-black">{post.likes}</span>
                </div>
              )}
              {post?.views && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-black">{post.views}</span>
                </div>
              )}
            </div>
            <Button className="h-11 rounded-xl bg-black px-8 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-accent">
              Перейти к посту
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
