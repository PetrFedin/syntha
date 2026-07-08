import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Paperclip,
  Mic,
  Send,
  Sparkles,
  Factory,
  CreditCard,
  ShieldAlert,
  BellRing,
  Languages,
  Handshake,
  MicOff,
  X,
  Eye,
  EyeOff,
  Package,
  ListTodo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chat as ChatConversation } from '@/lib/types';

interface ComposerProps {
  activeChat: ChatConversation | undefined;
  composerText: string;
  setComposerText: (t: string) => void;
  isPrivate: boolean;
  setIsPrivate: (v: boolean) => void;
  onSendMessage: () => void;
  onSmartReply: (type: string) => void;
  onOpenNegotiation: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  recording: boolean;
  isAiProcessing: boolean;
  onProcessAiCorrection: () => void;
  onFileClick: () => void;
  onUnarchiveChat: () => void;
  onOpenCreateTask?: () => void;
  onAttachProduct?: () => void;
  slimCore?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  activeChat,
  composerText,
  setComposerText,
  isPrivate,
  setIsPrivate,
  onSendMessage,
  onSmartReply,
  onOpenNegotiation,
  onStartRecording,
  onStopRecording,
  recording,
  isAiProcessing,
  onProcessAiCorrection,
  onFileClick,
  onUnarchiveChat,
  onOpenCreateTask,
  onAttachProduct,
  slimCore = false,
}) => {
  if (activeChat?.isArchived) {
    return (
      <div className="relative z-10 mx-auto w-full max-w-5xl border-t border-slate-100 bg-white p-4 transition-all">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4">
          <div className="mb-2 rounded-full bg-slate-100 p-2.5">
            <Paperclip className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
            Этот чат находится в архиве
          </p>
          <p className="mt-0.5 text-[9px] font-bold uppercase text-slate-400">
            Вы можете просматривать историю, но отправка сообщений ограничена
          </p>
          <Button
            variant="outline"
            className="mt-3 h-8 rounded-xl border-slate-200 text-[8px] font-black uppercase tracking-widest hover:bg-white"
            onClick={onUnarchiveChat}
          >
            РАЗАРХИВИРОВАТЬ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative z-10 mx-auto w-full max-w-4xl border-t border-slate-100 bg-white p-3 transition-all',
        slimCore &&
          'max-md:pb-safe max-md:sticky max-md:bottom-0 max-md:z-20 max-md:bg-white/95 max-md:backdrop-blur-sm'
      )}
    >
      {!slimCore && (
        <div className="scrollbar-hide mb-2.5 flex gap-1.5 overflow-x-auto py-0.5">
          <Button
            variant="outline"
            className="h-6.5 rounded-lg border-indigo-100 bg-indigo-50/30 px-2.5 text-[8px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white"
            onClick={() => onSmartReply('status')}
          >
            <Factory className="mr-1.5 h-3 w-3" /> Status
          </Button>
          <Button
            variant="outline"
            className="h-6.5 rounded-lg border-emerald-100 bg-emerald-50/30 px-2.5 text-[8px] font-bold uppercase tracking-widest text-emerald-600 shadow-sm transition-all hover:bg-emerald-600 hover:text-white"
            onClick={() => onSmartReply('invoice')}
          >
            <CreditCard className="mr-1.5 h-3 w-3" /> Invoice
          </Button>
          <Button
            variant="outline"
            className="h-6.5 rounded-lg border-amber-100 bg-amber-50/30 px-2.5 text-[8px] font-bold uppercase tracking-widest text-amber-600 shadow-sm transition-all hover:bg-amber-600 hover:text-white"
            onClick={() => onSmartReply('qc')}
          >
            <ShieldAlert className="mr-1.5 h-3 w-3" /> QC Report
          </Button>
          <Button
            variant="outline"
            className="h-6.5 rounded-lg border-indigo-100 bg-indigo-50/30 px-2.5 text-[8px] font-bold uppercase tracking-widest text-indigo-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white"
            onClick={() => onSmartReply('reminder')}
          >
            <BellRing className="mr-1.5 h-3 w-3" /> Reminder
          </Button>
          <Button
            variant="outline"
            className="h-6.5 rounded-lg border-slate-200 bg-white px-2.5 text-[8px] font-bold uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:bg-slate-900 hover:text-white"
            onClick={() => onSmartReply('translate')}
          >
            <Languages className="mr-1.5 h-3 w-3" /> Translate
          </Button>
          {onOpenCreateTask && (
            <Button
              variant="outline"
              className="h-6.5 rounded-lg border-violet-100 bg-violet-50/30 px-2.5 text-[8px] font-bold uppercase tracking-widest text-violet-600 shadow-sm transition-all hover:bg-violet-600 hover:text-white"
              onClick={onOpenCreateTask}
            >
              <ListTodo className="mr-1.5 h-3 w-3" /> Задача
            </Button>
          )}
          {onAttachProduct && (
            <Button
              variant="outline"
              className="h-6.5 rounded-lg border-amber-100 bg-amber-50/30 px-2.5 text-[8px] font-bold uppercase tracking-widest text-amber-600 shadow-sm transition-all hover:bg-amber-600 hover:text-white"
              onClick={onAttachProduct}
            >
              <Package className="mr-1.5 h-3 w-3" /> Товар
            </Button>
          )}
        </div>
      )}

      <div className="group/composer relative">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-1 shadow-inner transition-all duration-300 hover:shadow-md">
          <Textarea
            placeholder="Сообщение или команда…"
            className="scrollbar-hide max-h-[200px] min-h-[80px] resize-none border-none bg-transparent px-4 py-3 text-sm font-medium shadow-none placeholder:italic placeholder:text-slate-400 focus-visible:ring-0"
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
          />

          <div className="flex items-center justify-between rounded-b-xl border-t border-slate-200/50 bg-white/50 px-3 py-1.5 backdrop-blur-md">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 transition-all hover:bg-white hover:text-indigo-600"
                onClick={onFileClick}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              {!slimCore && (
                <>
                  <div className="mx-1 h-4 w-px bg-slate-200" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'relative h-8 w-8 overflow-hidden rounded-lg transition-all',
                      recording
                        ? 'bg-rose-50 text-rose-600 shadow-inner'
                        : 'text-slate-400 hover:bg-white hover:text-indigo-600'
                    )}
                    onClick={recording ? onStopRecording : onStartRecording}
                  >
                    {recording ? (
                      <>
                        <MicOff className="relative z-10 h-4 w-4" />
                        <span className="absolute inset-0 animate-ping bg-rose-200/50 opacity-20" />
                      </>
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 rounded-lg transition-all hover:bg-white',
                      isAiProcessing
                        ? 'animate-pulse text-indigo-600'
                        : 'text-slate-400 hover:text-indigo-600'
                    )}
                    onClick={onProcessAiCorrection}
                    disabled={isAiProcessing || !composerText}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </>
              )}
              <div className="mx-1 h-4 w-px bg-slate-200" />
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 gap-1.5 rounded-lg px-2.5 transition-all',
                  isPrivate
                    ? 'border border-rose-100 bg-rose-50 text-rose-600'
                    : 'text-slate-400 hover:bg-white hover:text-indigo-600'
                )}
                onClick={() => setIsPrivate(!isPrivate)}
              >
                {isPrivate ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span className="text-[8px] font-bold uppercase tracking-widest">
                  {isPrivate ? 'Private' : 'Shared'}
                </span>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tabular-nums tracking-widest transition-all',
                  composerText.length > 500 ? 'text-rose-500' : 'text-slate-300'
                )}
              >
                {composerText.length} / 1000
              </span>
              <Button
                disabled={!composerText.trim() && !recording}
                className={cn(
                  'h-8 rounded-lg px-6 text-[9px] font-bold uppercase tracking-widest shadow-lg transition-all',
                  composerText.trim()
                    ? 'border border-slate-900 bg-slate-900 text-white hover:scale-105 hover:bg-indigo-600'
                    : 'cursor-not-allowed border-none bg-slate-100 text-slate-300'
                )}
                onClick={onSendMessage}
              >
                SEND
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
