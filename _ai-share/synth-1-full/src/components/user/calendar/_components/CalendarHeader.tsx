import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Calendar as CalendarIcon,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ZapOff,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Layer } from '@/lib/types/calendar';
import { CalendarState, CalendarActions, LAYERS, layerColor, ROLE_VISIBILITY } from '../constants';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  state: CalendarState;
  actions: CalendarActions;
  user: any;
  createEventsEnabled?: boolean;
  slimCore?: boolean;
  calendarSearchTestId?: string;
}

export function CalendarHeader({
  state,
  actions,
  user,
  createEventsEnabled = true,
  slimCore = false,
  calendarSearchTestId,
}: CalendarHeaderProps) {
  const {
    currentRole,
    view,
    currentDate,
    search,
    mysteryEnabled,
    aiAutomationEnabled,
    isInvestorMode,
    spamFilterEnabled,
    layerFilter,
  } = state;

  const {
    setCurrentRole,
    setView,
    setCurrentDate,
    setSearch,
    setMysteryEnabled,
    setAiAutomationEnabled,
    setIsInvestorMode,
    setSpamFilterEnabled,
    setLayerFilter,
    handleOpenCreateModal,
  } = actions;

  return (
    <div className={cn('flex flex-col gap-3', slimCore && 'mb-0 md:mb-6')}>
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div
          className={cn(
            'flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3',
            slimCore && 'max-md:gap-2'
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg bg-muted/50 p-1',
              slimCore &&
                'max-md:w-full max-md:overflow-x-auto max-md:overscroll-x-contain max-md:[-webkit-overflow-scrolling:touch] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden'
            )}
          >
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className={cn('text-xs', slimCore && 'min-h-11 shrink-0 max-md:min-h-11')}
            >
              Месяц
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className={cn('text-xs', slimCore && 'min-h-11 shrink-0 max-md:hidden')}
            >
              Неделя
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className={cn('text-xs', slimCore && 'min-h-11 shrink-0 max-md:hidden')}
            >
              День
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className={cn('text-xs', slimCore && 'min-h-11 shrink-0 max-md:min-h-11')}
            >
              Список
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(slimCore && 'min-h-11 min-w-11')}
              onClick={() =>
                setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'min-w-[140px] font-bold',
                    slimCore && 'max-md:min-h-11 max-md:text-xs'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(currentDate, slimCore ? 'LLL yyyy' : 'LLLL yyyy', { locale: ru })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              className={cn(slimCore && 'min-h-11 min-w-11')}
              onClick={() =>
                setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative min-w-0 flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск событий..."
              className={cn('pl-9', slimCore && 'min-h-11')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid={calendarSearchTestId}
              aria-label="Поиск событий"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  spamFilterEnabled && 'border-red-500 text-red-500',
                  slimCore && 'min-h-11 min-w-11 shrink-0'
                )}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none">Фильтры слоев</h4>
                  <Badge variant="outline" className="text-[10px]">
                    {Object.values(layerFilter).filter(Boolean).length} активных
                  </Badge>
                </div>
                <div className="grid gap-2">
                  {ROLE_VISIBILITY[currentRole]?.map((layer) => (
                    <div key={layer} className="flex items-center space-x-2">
                      <Switch
                        id={`filter-${layer}`}
                        checked={layerFilter[layer]}
                        onCheckedChange={(checked) =>
                          setLayerFilter((prev: Record<Layer, boolean>) => ({
                            ...prev,
                            [layer]: checked,
                          }))
                        }
                      />
                      <label
                        htmlFor={`filter-${layer}`}
                        className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <div className={cn('h-2 w-2 rounded-full', layerColor(layer))} />
                        {layer.charAt(0).toUpperCase() + layer.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Спам-фильтр</span>
                    <Switch checked={spamFilterEnabled} onCheckedChange={setSpamFilterEnabled} />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {createEventsEnabled ? (
            <Button
              onClick={() => handleOpenCreateModal()}
              data-testid="calendar-create-event-btn"
              className={cn(slimCore && 'min-h-11 shrink-0')}
            >
              <Plus className={cn('h-4 w-4', !slimCore && 'mr-2')} />
              <span className={cn(slimCore && 'max-md:sr-only')}>Событие</span>
            </Button>
          ) : null}
        </div>
      </div>

      {!slimCore ? (
        <div className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-2 rounded-xl border p-2">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {user?.roles && user.roles.length > 1 && (
              <Select value={currentRole} onValueChange={(v: any) => setCurrentRole(v)}>
                <SelectTrigger className="h-8 w-[140px] bg-white text-xs">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  {user.roles.map((role: string) => (
                    <SelectItem key={role} value={role} className="text-xs font-bold uppercase">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="bg-border-subtle mx-1 h-6 w-px" />

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 gap-1.5 text-xs',
                mysteryEnabled ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-secondary'
              )}
              onClick={() => setMysteryEnabled(!mysteryEnabled)}
            >
              {mysteryEnabled ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              Mystery Mode
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 gap-1.5 text-xs',
                aiAutomationEnabled ? 'bg-emerald-100 text-emerald-700' : 'text-text-secondary'
              )}
              onClick={() => setAiAutomationEnabled(!aiAutomationEnabled)}
            >
              {aiAutomationEnabled ? (
                <Zap className="h-3.5 w-3.5" />
              ) : (
                <ZapOff className="h-3.5 w-3.5" />
              )}
              AI Auto
            </Button>

            {currentRole === 'brand' && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 gap-1.5 text-xs',
                  isInvestorMode ? 'bg-amber-100 text-amber-700' : 'text-text-secondary'
                )}
                onClick={() => setIsInvestorMode(!isInvestorMode)}
              >
                {isInvestorMode ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5" />
                )}
                Investor View
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="text-text-muted h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
