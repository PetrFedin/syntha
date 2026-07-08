import React from 'react';
import {
  format,
  isSameDay,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/lib/types/calendar';
import { layerColor, layerBorder } from '../constants';
import { Lock, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CalendarGridProps {
  view: string;
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onCellClick: (date: Date) => void;
  slimCore?: boolean;
}

export function CalendarGrid({
  view,
  currentDate,
  events,
  onEventClick,
  onCellClick,
  slimCore = false,
}: CalendarGridProps) {
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfMonth(monthEnd); // Simplified end date logic for grid

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    // Generate grid 6 weeks to be safe or until end of month
    // Just a simple loop for 35-42 days
    const totalDays = 42;

    for (let i = 0; i < totalDays; i++) {
      formattedDate = format(day, 'd');
      const cloneDay = day;

      const dayEvents = events.filter((e) => isSameDay(new Date(e.startAt), day));
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      const maxEvents = slimCore ? 2 : 4;

      days.push(
        <div
          key={day.toString()}
          className={cn(
            'group relative cursor-pointer border p-1 transition-colors hover:bg-muted/20',
            slimCore ? 'min-h-14 max-md:min-h-12' : 'min-h-[100px]',
            !isCurrentMonth && 'bg-muted/10 text-muted-foreground',
            isToday && 'bg-accent/5'
          )}
          onClick={() => onCellClick(cloneDay)}
        >
          <div
            className={cn(
              'p-1 text-right font-medium',
              slimCore ? 'text-[10px]' : 'text-xs',
              isToday && 'font-bold text-accent'
            )}
          >
            {formattedDate}
          </div>
          <div className="mt-0.5 space-y-0.5">
            {dayEvents.slice(0, maxEvents).map((ev) => (
              <div
                key={ev.id}
                {...(ev.targetChatId || ev.calendarId === 'workshop2-b2b'
                  ? { 'data-testid': `calendar-b2b-event-${ev.id}` }
                  : {})}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(ev);
                }}
                className={cn(
                  'mb-0.5 flex min-h-[28px] cursor-pointer flex-col justify-center gap-0.5 truncate rounded-md border-l-4 px-1.5 py-0.5 font-bold shadow-md transition-all hover:brightness-95 max-md:min-h-6 max-md:px-1 max-md:py-0',
                  slimCore ? 'text-[9px] max-md:text-[8px]' : 'text-[10px]',
                  layerColor(ev.layer),
                  layerBorder(ev.layer),
                  'text-white'
                )}
              >
                <div className="flex items-center gap-1">
                  {ev.isMystery && <EyeOff className="h-2 w-2 shrink-0 opacity-80" />}
                  {ev.importance === 'critical' && (
                    <AlertCircle className="h-2 w-2 shrink-0 animate-pulse text-white" />
                  )}
                  {ev.isSpam && <span className="font-black text-white/80">СПАМ:</span>}
                  <span className="truncate leading-tight">{ev.title}</span>
                </div>
                {!slimCore && ev.description && (
                  <span className="truncate text-[8px] font-medium leading-none text-white/90">
                    {ev.description}
                  </span>
                )}
              </div>
            ))}
            {dayEvents.length > maxEvents && (
              <div className="text-center text-[9px] font-medium text-muted-foreground max-md:text-[8px]">
                Еще {dayEvents.length - maxEvents}...
              </div>
            )}
          </div>
          {isToday && (
            <div className="absolute left-1 top-1 h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          )}
        </div>
      );
      day = addDays(day, 1);
    }

    // Chunk days into rows of 7
    const gridRows = [];
    for (let i = 0; i < days.length; i += 7) {
      gridRows.push(
        <div className="grid grid-cols-7" key={i}>
          {days.slice(i, i + 7)}
        </div>
      );
    }

    return (
      <div
        className="overflow-hidden rounded-lg border bg-white shadow-sm"
        data-testid={slimCore ? 'platform-core-calendar-month-grid' : undefined}
      >
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
            <div
              key={d}
              className={cn(
                'text-center font-bold uppercase tracking-wider text-muted-foreground',
                slimCore ? 'p-1 text-[9px] max-md:text-[8px]' : 'p-2 text-xs'
              )}
            >
              {d}
            </div>
          ))}
        </div>
        {gridRows}
      </div>
    );
  };

  const renderWeekView = () => {
    // Simplified week view
    return <div className="p-3 text-center text-muted-foreground">Недельный вид в разработке</div>;
  };

  const renderDayView = () => {
    // Simplified day view
    return <div className="p-3 text-center text-muted-foreground">Дневной вид в разработке</div>;
  };

  const renderListView = () => {
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );

    return (
      <div className="space-y-2" data-testid={slimCore ? 'platform-core-calendar-list' : undefined}>
        {sortedEvents.map((ev) => (
          <div
            key={ev.id}
            {...(ev.targetChatId || ev.calendarId === 'workshop2-b2b'
              ? { 'data-testid': `calendar-b2b-event-${ev.id}` }
              : {})}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 transition-colors hover:bg-muted/30',
              slimCore && 'min-h-11'
            )}
            onClick={() => onEventClick(ev)}
          >
            <div
              className={cn('h-10 w-1 rounded-full', layerColor(ev.layer).replace('bg-', 'bg-'))}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-bold">{ev.title}</h4>
                {ev.isMystery && (
                  <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                    Скрытое
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{ev.description}</p>
            </div>
            <div className="shrink-0 text-right text-xs text-muted-foreground">
              <div>{format(new Date(ev.startAt), 'd MMM', { locale: ru })}</div>
              <div>{format(new Date(ev.startAt), 'HH:mm')}</div>
            </div>
          </div>
        ))}
        {sortedEvents.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Нет событий для отображения
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1">
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
      {view === 'list' && renderListView()}
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
    >
      {children}
    </span>
  );
}
