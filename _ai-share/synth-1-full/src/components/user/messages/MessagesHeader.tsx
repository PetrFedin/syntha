import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ClipboardList,
  Settings,
  Search,
  Users,
  Shield,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import { ROLE_LABELS, USER_STATUSES } from './constants';
import { ROUTES } from '@/lib/routes';

interface MessagesHeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  userStatus: string;
  setUserStatus: (status: string) => void;
  riskLevel: number;
  onOpenTeam: () => void;
  onOpenRiskDetails: () => void;
  onOpenTasksHub: () => void;
  onOpenSettings: () => void;
  onOpenCreateChat: () => void;
  slimCore?: boolean;
}

export const MessagesHeader: React.FC<MessagesHeaderProps> = ({
  currentRole,
  setCurrentRole,
  userStatus,
  setUserStatus,
  riskLevel,
  onOpenTeam,
  onOpenRiskDetails,
  onOpenTasksHub,
  onOpenSettings,
  onOpenCreateChat,
  slimCore = false,
}) => {
  return (
    <div
      className={cn(
        'border-border-subtle flex flex-col items-start justify-between border-b lg:flex-row',
        slimCore ? 'gap-1 pb-2' : 'gap-3 pb-4'
      )}
    >
      <div className="space-y-0.5">
        <div className="mb-1 flex items-center gap-2">
          <h1
            className={cn(
              'text-text-primary font-headline font-bold uppercase leading-none tracking-tighter',
              slimCore ? 'text-xs' : 'text-base'
            )}
          >
            {slimCore ? 'Сообщения' : 'Intelligence OS'}
          </h1>
          {!slimCore && (
            <Badge
              variant="outline"
              className="bg-bg-surface2 text-text-muted border-border-subtle h-4 px-1.5 text-[8px] font-bold uppercase tracking-[0.2em] shadow-sm"
            >
              v2.0 AI-CORE
            </Badge>
          )}
        </div>
        <div className={cn('flex flex-wrap items-center gap-2', slimCore && 'hidden')}>
          {!slimCore && (
            <div className="h-6.5 bg-accent-primary/10 border-accent-primary/20 group/engine flex shrink-0 cursor-default items-center gap-1.5 rounded-lg border px-2">
              <div className="bg-accent-primary h-1.5 w-1.5 shrink-0 animate-pulse rounded-full" />
              <span className="text-accent-primary whitespace-nowrap text-[9px] font-bold uppercase tracking-widest">
                ENGINE: ACTIVE
              </span>
            </div>
          )}

          {!slimCore && (
            <div className="bg-bg-surface2 border-border-default h-6.5 flex items-center rounded-lg border px-1 shadow-inner">
              <select
                className="text-text-secondary hover:text-accent-primary cursor-pointer bg-transparent px-1.5 text-[9px] font-bold uppercase tracking-widest outline-none transition-colors"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              >
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <option key={role} value={role}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!slimCore ? (
            <div className="h-6.5 bg-text-primary border-text-primary/30 flex items-center gap-1 rounded-lg border px-2 shadow-md">
              <Shield className="text-accent-primary h-2.5 w-2.5" />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white">
                SCOPED
              </span>
            </div>
          ) : null}

          {!slimCore ? (
            <div className="border-border-default h-6.5 group/status hover:border-accent-primary/30 flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-2 shadow-sm transition-all">
              <div
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  USER_STATUSES.find((s) => s.id === userStatus)?.color || 'bg-border-default'
                )}
              />
              <select
                className="text-text-secondary hover:text-accent-primary cursor-pointer bg-transparent text-[9px] font-bold uppercase tracking-widest outline-none transition-colors"
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value)}
              >
                {USER_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {!slimCore ? (
            <div
              className="h-6.5 bg-bg-surface2 border-border-default hover:border-accent-primary/30 group/risk hidden cursor-pointer items-center gap-3 rounded-lg border px-3 transition-all hover:bg-white sm:flex"
              onClick={onOpenTeam}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-text-muted group-hover:text-accent-primary text-[9px] font-bold uppercase tracking-widest transition-colors">
                  TEAM: 12
                </span>
              </div>
              <div className="bg-border-subtle h-3 w-px" />
              <div
                className="flex items-center gap-2"
                title="Supply Chain Risk Index"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRiskDetails();
                }}
              >
                <AlertTriangle
                  className={cn(
                    'h-3 w-3 transition-transform group-hover/risk:scale-110',
                    riskLevel > 50 ? 'text-rose-500' : 'text-amber-500'
                  )}
                />
                <div className="bg-border-subtle h-1 w-12 overflow-hidden rounded-full shadow-inner">
                  <div
                    className={cn(
                      'h-full transition-all',
                      riskLevel > 50 ? 'bg-rose-500' : 'bg-amber-500'
                    )}
                    style={{ width: `${riskLevel}%` }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={cn('flex items-center gap-1.5', slimCore && 'hidden')}>
        <Button
          variant="ghost"
          size="icon"
          className="border-border-default hover:bg-text-primary/90 hover:border-text-primary h-8 w-8 rounded-lg border bg-white shadow-sm transition-all hover:text-white"
          asChild
          title="Календарь"
        >
          <Link href={ROUTES.brand.calendar}>
            <Calendar className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="border-border-default hover:bg-text-primary/90 hover:border-text-primary h-8 w-8 rounded-lg border bg-white shadow-sm transition-all hover:text-white"
          onClick={onOpenTasksHub}
          title="Задачи из чатов"
        >
          <ClipboardList className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="border-border-default hover:bg-text-primary/90 hover:border-text-primary h-8 w-8 rounded-lg border bg-white shadow-sm transition-all hover:text-white"
          onClick={onOpenSettings}
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-text-primary border-text-primary hover:bg-accent-primary hover:border-accent-primary h-8 w-8 rounded-lg border text-white shadow-lg transition-all"
          onClick={onOpenCreateChat}
        >
          <Search className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
