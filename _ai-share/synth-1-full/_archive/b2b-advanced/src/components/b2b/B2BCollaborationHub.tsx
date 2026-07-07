'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  CheckSquare,
  Calendar as CalendarIcon,
  MessageCircle,
  Plus,
  Clock,
  AlertCircle,
  ChevronRight,
  Filter,
  Search,
  User,
  Paperclip,
  Send,
  MoreVertical,
  Activity,
  Archive,
  Flag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';

export function B2BCollaborationHub() {
  const { viewRole } = useUIState();
  const { b2bTasks, updateB2bTask, b2bEvents, b2bMessages, sendB2bMessage } = useB2BState();
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'messages'>('tasks');
  const [messageInput, setMessageMessageInput] = useState('');

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'critical':
        return 'bg-rose-100 text-rose-600';
      case 'high':
        return 'bg-amber-100 text-amber-600';
      case 'medium':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-900"
            >
              WORKSPACE_v5.0
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Collaboration Hub
          </h2>
          <p className="max-w-md text-left text-xs font-medium text-slate-400">
            Unified workspace for task management, internal & partner communication, and global
            scheduling across the supply chain.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {[
            { id: 'tasks', label: 'Tasks & Projects', icon: CheckSquare },
            { id: 'calendar', label: 'B2B Calendar', icon: CalendarIcon },
            { id: 'messages', label: 'Messaging Center', icon: MessageCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xl'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-3 lg:grid-cols-12"
            >
              {/* Task Groups / Boards */}
              <div className="space-y-6 lg:col-span-8">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                      Active Workflow
                    </h3>
                    <Badge className="bg-slate-900 px-2 py-0.5 text-[8px] font-black uppercase text-white">
                      12 TOTAL
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 gap-2 rounded-xl border-slate-200 bg-white text-[9px] font-black uppercase"
                  >
                    <Plus className="h-3.5 w-3.5" /> New Task
                  </Button>
                </div>

                <div className="space-y-4">
                  {b2bTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="group overflow-hidden rounded-xl border-none bg-white shadow-xl shadow-slate-200/50 transition-all hover:scale-[1.01]"
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-start gap-3">
                          <div
                            onClick={() =>
                              updateB2bTask(task.id, {
                                status: task.status === 'done' ? 'todo' : 'done',
                              })
                            }
                            className={cn(
                              'flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border-2 transition-all',
                              task.status === 'done'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                : 'border-slate-100 bg-slate-50 text-slate-200 hover:border-indigo-200'
                            )}
                          >
                            <CheckSquare className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4
                                className={cn(
                                  'text-base font-black uppercase tracking-tight',
                                  task.status === 'done'
                                    ? 'text-slate-300 line-through'
                                    : 'text-slate-900'
                                )}
                              >
                                {task.title}
                              </h4>
                              <Badge
                                className={cn(
                                  'border-none px-2 py-0.5 text-[8px] font-black uppercase',
                                  getPriorityColor(task.priority)
                                )}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="max-w-md text-xs font-medium text-slate-400">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="h-3 w-3" />
                                <span className="text-[9px] font-bold uppercase">
                                  Due {task.dueDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <User className="h-3 w-3" />
                                <span className="text-[9px] font-bold uppercase">
                                  {task.assigneeId}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-xl text-slate-200 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* CRM / Activity Log Side */}
              <div className="space-y-4 lg:col-span-4">
                <Card className="space-y-6 rounded-xl border-none bg-slate-900 p-4 text-white shadow-2xl shadow-slate-200/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-tight">Daily Progress</h3>
                    <Badge className="border-none bg-emerald-500 px-2 py-0.5 text-[8px] font-black text-white">
                      84% READY
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '84%' }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      />
                    </div>
                    <p className="text-[10px] font-medium uppercase leading-relaxed text-white/50">
                      You have completed 5 of 6 mission-critical tasks for this delivery window.
                    </p>
                  </div>
                </Card>

                <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-2xl shadow-slate-200/50">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    Task Analytics
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Avg. Response Time', val: '2.4h', trend: '-12%', icon: Clock },
                      { label: 'Project Velocity', val: '92%', trend: '+5%', icon: Activity },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                            <s.icon className="h-4 w-4 text-indigo-600" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-400">
                            {s.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{s.val}</p>
                          <p className="text-[8px] font-bold text-emerald-600">{s.trend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 gap-3 lg:grid-cols-12"
            >
              <div className="lg:col-span-9">
                <Card className="overflow-hidden rounded-xl border-none bg-white p-3 shadow-2xl shadow-slate-200/50">
                  <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-black uppercase tracking-tighter text-slate-900">
                        February 2026
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-xl border-slate-100"
                        >
                          <ChevronRight className="h-4 w-4 rotate-180" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-xl border-slate-100"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button className="h-12 gap-2 rounded-2xl bg-slate-900 px-6 text-[10px] font-black uppercase tracking-widest text-white">
                      <Plus className="h-4 w-4" /> Новое событие
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-px overflow-hidden rounded-3xl border border-slate-100 bg-slate-100">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                      <div
                        key={d}
                        className="border-b border-slate-100 bg-slate-50 p-4 text-center text-[9px] font-black uppercase tracking-widest text-slate-400"
                      >
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i - 2;
                      const hasEvent = b2bEvents.find((e) => new Date(e.start).getDate() === day);
                      return (
                        <div
                          key={i}
                          className="group relative min-h-[140px] bg-white p-4 transition-colors hover:bg-slate-50"
                        >
                          <span
                            className={cn(
                              'text-xs font-black',
                              day === 10
                                ? 'flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600'
                                : 'text-slate-300'
                            )}
                          >
                            {day > 0 && day <= 28 ? day : ''}
                          </span>

                          {day > 0 && day <= 28 && hasEvent && (
                            <div className="mt-2 space-y-1 rounded-xl bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-200">
                              <p className="truncate text-[8px] font-black uppercase">
                                {hasEvent.title}
                              </p>
                              <p className="text-[7px] font-medium opacity-70">10:00 - 18:00</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              <div className="space-y-6 lg:col-span-3">
                <h3 className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Upcoming Events
                </h3>
                {b2bEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="rounded-xl border-l-4 border-none border-indigo-500 bg-white p-4 shadow-xl"
                  >
                    <Badge
                      variant="outline"
                      className="mb-3 border-indigo-100 px-1.5 text-[7px] font-black uppercase text-indigo-600"
                    >
                      {event.type}
                    </Badge>
                    <h4 className="mb-1 text-sm font-black uppercase tracking-tight text-slate-900">
                      {event.title}
                    </h4>
                    <p className="text-[10px] font-medium leading-relaxed text-slate-400">
                      {event.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-[9px] font-bold uppercase">March 1, 2026</span>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid h-[700px] grid-cols-1 gap-3 lg:grid-cols-12"
            >
              {/* Contact List */}
              <Card className="flex flex-col overflow-hidden rounded-xl border-none bg-white shadow-2xl shadow-slate-200/50 lg:col-span-4">
                <div className="border-b border-slate-50 p-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Поиск в сообщениях..."
                      className="h-12 rounded-2xl border-none bg-slate-50 pl-12"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                  {[
                    {
                      name: 'Премиум-стор (штаб)',
                      last: 'До встречи на неделе в Москве!',
                      time: '2 мин назад',
                      unread: 2,
                    },
                    {
                      name: 'Концепт-стор Москва',
                      last: 'PO #8821 подтверждён.',
                      time: '1 ч назад',
                      unread: 0,
                    },
                    {
                      name: 'Селектив Москва',
                      last: 'Отправили новые спецификации.',
                      time: 'Вчера',
                      unread: 0,
                    },
                  ].map((c, i) => (
                    <button
                      key={i}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl p-4 transition-all',
                        i === 0
                          ? 'bg-slate-900 text-white shadow-xl'
                          : 'text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border-2 border-white/10 bg-indigo-500">
                        <img
                          src={`https://i.pravatar.cc/100?img=${i + 30}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="mb-0.5 flex items-center justify-between">
                          <h4 className="truncate text-xs font-black uppercase">{c.name}</h4>
                          <span
                            className={cn(
                              'text-[8px] font-bold uppercase',
                              i === 0 ? 'text-white/40' : 'text-slate-400'
                            )}
                          >
                            {c.time}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'truncate text-[10px]',
                            i === 0 ? 'text-white/60' : 'text-slate-400'
                          )}
                        >
                          {c.last}
                        </p>
                      </div>
                      {c.unread > 0 && (
                        <Badge className="flex h-5 w-5 items-center justify-center rounded-full border-none bg-rose-500 p-0 text-[10px] text-white">
                          {c.unread}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Chat Area */}
              <Card className="flex flex-col overflow-hidden rounded-xl border-none bg-white shadow-2xl shadow-slate-200/50 lg:col-span-8">
                <div className="flex items-center justify-between border-b border-slate-50 bg-white/50 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-2xl border-2 border-slate-100 bg-indigo-500">
                      <img
                        src="https://i.pravatar.cc/100?img=30"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                        Премиум-стор (штаб)
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                          Активный узел ритейлера
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl border-slate-100"
                    >
                      <Activity className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-xl border-slate-100"
                    >
                      <Archive className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/30 p-3">
                  <div className="flex justify-center">
                    <Badge className="border-none bg-slate-100 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                      СЕГОДНЯ
                    </Badge>
                  </div>

                  <div className="ml-auto flex max-w-[70%] flex-col items-end gap-1">
                    <div className="rounded-xl rounded-tr-md bg-slate-900 p-4 text-xs font-medium leading-relaxed text-white shadow-xl">
                      Здравствуйте! Посмотрели ли последний логистический манифест на августскую
                      поставку?
                    </div>
                    <span className="px-2 text-[8px] font-black uppercase tracking-widest text-slate-300">
                      ОТПРАВЛЕНО 10:42
                    </span>
                  </div>

                  <div className="mr-auto flex max-w-[70%] flex-col items-start gap-1">
                    <div className="rounded-xl rounded-tl-md border border-slate-100 bg-white p-4 text-xs font-medium leading-relaxed text-slate-900 shadow-sm">
                      Да, проверили. Всё ок, кроме HS-кодов по графеновым тканям — можем сверить?
                    </div>
                    <span className="px-2 text-[8px] font-black uppercase tracking-widest text-slate-300">
                      ПРЕМИУМ-СТОР • 10:45
                    </span>
                  </div>

                  <div className="ml-auto flex max-w-[70%] flex-col items-end gap-1">
                    <div className="rounded-xl rounded-tr-md bg-slate-900 p-4 text-xs font-medium leading-relaxed text-white shadow-xl">
                      Конечно, сейчас отправлю техспеки в таможенный шлюз. До встречи на неделе в
                      Москве!
                    </div>
                    <span className="px-2 text-[8px] font-black uppercase tracking-widest text-slate-300">
                      ОТПРАВЛЕНО 11:02
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-50 bg-white p-4">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2 shadow-inner">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 shrink-0 rounded-2xl text-slate-400 transition-all hover:bg-white hover:text-indigo-600"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Защищённое сообщение…"
                      className="flex-1 border-none bg-transparent text-xs font-medium shadow-none focus-visible:ring-0"
                      value={messageInput}
                      onChange={(e) => setMessageMessageInput(e.target.value)}
                    />
                    <Button
                      className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-600 p-0 text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700"
                      onClick={() => setMessageMessageInput('')}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
