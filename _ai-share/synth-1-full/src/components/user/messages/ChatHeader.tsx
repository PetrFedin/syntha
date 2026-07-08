import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles,
  Phone,
  Video,
  MoreVertical,
  Users,
  Archive,
  Settings,
  ExternalLink,
  Package,
  Factory,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { Chat as ChatConversation } from '@/lib/types';
import { ROUTES } from '@/lib/routes';
import { ID } from './types';

interface ChatHeaderProps {
  activeChat: ChatConversation | undefined;
  isSummarizing: boolean;
  onGenerateSummary: () => void;
  onOpenCallSetup: (type: 'audio' | 'video') => void;
  onOpenParticipants: () => void;
  onOpenArchive: () => void;
  onOpenSettings: () => void;
  slimCore?: boolean;
  showMobileBack?: boolean;
  onMobileBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChat,
  isSummarizing,
  onGenerateSummary,
  onOpenCallSetup,
  onOpenParticipants,
  onOpenArchive,
  onOpenSettings,
  slimCore = false,
  showMobileBack = false,
  onMobileBack,
}) => {
  if (!activeChat) return null;

  return (
    <header
      className={cn(
        'border-border-subtle sticky top-0 z-20 flex shrink-0 items-center justify-between border-b bg-white/90 shadow-sm backdrop-blur-md',
        slimCore ? 'px-3 py-2' : 'px-6 py-4'
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {showMobileBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 min-h-11 w-11 min-w-11 shrink-0 md:hidden"
            aria-label="К списку тредов"
            data-testid="platform-core-comms-chat-back"
            onClick={onMobileBack}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
        <Avatar
          className={cn(
            'ring-border-subtle border-2 border-white shadow-sm ring-1',
            slimCore ? 'size-7' : 'size-10 shadow-md'
          )}
        >
          <AvatarFallback className="bg-bg-surface2 text-text-muted text-xs font-bold uppercase">
            {activeChat.title[0]}
          </AvatarFallback>
          <AvatarImage
            src={typeof activeChat.avatar === 'string' ? activeChat.avatar : undefined}
          />
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                'text-text-primary truncate font-bold uppercase leading-none tracking-tight',
                slimCore ? 'text-[11px]' : 'text-base'
              )}
            >
              {activeChat.title}
            </h2>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {!slimCore ? (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-1.5 py-0.5">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600">
                  Active Thread
                </span>
              </div>
            ) : null}
            <span className="text-text-muted truncate text-[8px] font-bold uppercase tracking-widest opacity-60">
              {activeChat.subtitle}
            </span>
            {activeChat.linkOrderId && (
              <Link
                href={ROUTES.brand.b2bOrders}
                className="border-accent-primary/20 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/15 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest transition-colors"
              >
                <Package className="size-2.5" /> Заказ
              </Link>
            )}
            {activeChat.linkCollectionId && (
              <Link
                href={ROUTES.brand.production}
                className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-amber-600 transition-colors hover:bg-amber-100"
              >
                <Factory className="size-2.5" /> Production
              </Link>
            )}
            {activeChat.calendarHref && (
              <Link
                href={activeChat.calendarHref}
                className="border-accent-primary/20 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/15 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest transition-colors"
              >
                <Calendar className="size-2.5" /> Календарь
              </Link>
            )}
          </div>
        </div>
      </div>

      {!slimCore ? (
        <div className="flex items-center gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    'border-accent-primary/20 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary size-8 rounded-lg border shadow-sm transition-all hover:text-white',
                    isSummarizing && 'animate-pulse'
                  )}
                  onClick={onGenerateSummary}
                  disabled={isSummarizing}
                >
                  <Sparkles className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-text-primary border-none text-[9px] font-bold uppercase tracking-widest text-white">
                AI Summary
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="border-border-default text-text-muted hover:border-text-primary hover:bg-text-primary/90 size-8 rounded-lg border bg-white shadow-sm transition-all hover:text-white"
                  onClick={() => onOpenCallSetup('audio')}
                >
                  <Phone className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-text-primary border-none text-[9px] font-bold uppercase tracking-widest text-white">
                Audio Call
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="border-border-default text-text-muted hover:border-text-primary hover:bg-text-primary/90 size-8 rounded-lg border bg-white shadow-sm transition-all hover:text-white"
                  onClick={() => onOpenCallSetup('video')}
                >
                  <Video className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-text-primary border-none text-[9px] font-bold uppercase tracking-widest text-white">
                Video Meeting
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="border-border-default text-text-muted hover:border-text-primary hover:bg-text-primary/90 size-8 rounded-lg border bg-white shadow-sm transition-all hover:text-white"
              >
                <MoreVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-border-subtle min-w-[180px] rounded-xl p-1 shadow-xl"
            >
              <DropdownMenuItem
                className="cursor-pointer rounded-lg p-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
                onClick={onOpenParticipants}
              >
                <Users className="mr-2.5 size-3.5" /> Manage Participants
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg p-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
                onClick={onOpenArchive}
              >
                <Archive className="mr-2.5 size-3.5" /> Content Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg p-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
                onClick={onOpenSettings}
              >
                <Settings className="mr-2.5 size-3.5" /> Chat Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </header>
  );
};
