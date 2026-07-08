'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FilePlus,
  Users,
  LayoutGrid,
  Send,
  Eye,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Settings2,
  Lock,
  ArrowRight,
  Share2,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { cn } from '@/lib/cn';

export function LinesheetCreator() {
  const { viewRole } = useUIState();
  const { customLinesheets, addLinesheet } = useB2BState();
  const [isCreating, setIsCreating] = useState(false);
  const [newSheet, setNewSheet] = useState({
    title: '',
    retailerId: '',
    products: [] as string[],
  });

  const retailers = [
    { id: 'ret-1', name: 'Premium Store HQ', location: 'Moscow' },
    { id: 'ret-2', name: 'Urban Elite', location: 'Dubai' },
    { id: 'ret-3', name: 'Minimalist Boutique', location: 'Москва' },
  ];

  const handleCreate = () => {
    if (!newSheet.title || !newSheet.retailerId) return;
    addLinesheet({
      id: Math.random().toString(36).substr(2, 9),
      brandId: 'brand-1',
      retailerId: newSheet.retailerId,
      title: newSheet.title,
      products: ['1', '2'], // Mock products
      customPrices: {},
      status: 'sent',
      viewCount: 0,
      createdAt: new Date().toISOString(),
    });
    setIsCreating(false);
    setNewSheet({ title: '', retailerId: '', products: [] });
  };

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
              <Share2 className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-indigo-100 text-[9px] font-black uppercase tracking-widest text-indigo-600"
            >
              Sales_Hub_v2.0
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Custom Linesheets
          </h2>
          <p className="max-w-md text-xs font-medium text-slate-400">
            Create personalized collection subsets for specific retailers with custom pricing and
            private access.
          </p>
        </div>

        <Button
          onClick={() => setIsCreating(true)}
          className="h-10 gap-2 rounded-[1.5rem] bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-slate-200 transition-all hover:scale-105"
        >
          <FilePlus className="h-5 w-5" /> New Linesheet
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Active Linesheets */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
              Sent & Active
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Sort by:</span>
              <select className="border-none bg-transparent text-[10px] font-black uppercase text-slate-900 focus:ring-0">
                <option>Latest Created</option>
                <option>Highest Views</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {customLinesheets.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-slate-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Clock className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  No custom linesheets yet
                </p>
              </div>
            ) : (
              customLinesheets.map((sheet) => (
                <Card
                  key={sheet.id}
                  className="group overflow-hidden rounded-xl border-none shadow-xl shadow-slate-200/50 transition-all hover:scale-[1.01]"
                >
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50">
                        <LayoutGrid className="h-8 w-8 text-indigo-200" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                            {sheet.title}
                          </h4>
                          <Badge
                            className={cn(
                              'px-2 py-0.5 text-[8px] font-black uppercase',
                              sheet.status === 'sent'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-emerald-100 text-emerald-600'
                            )}
                          >
                            {sheet.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Users className="h-3 w-3" />
                            <span className="text-[9px] font-bold uppercase">
                              {retailers.find((r) => r.id === sheet.retailerId)?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span className="text-[9px] font-bold uppercase">
                              {new Date(sheet.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 border-r border-slate-100 pr-4">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-slate-300" />
                          <span className="text-base font-black text-slate-900">
                            {sheet.viewCount}
                          </span>
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                          Total Views
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pl-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl hover:bg-slate-50"
                        >
                          <Settings2 className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Button className="h-12 w-12 rounded-xl bg-slate-900 p-0 text-white shadow-lg shadow-slate-200 transition-colors group-hover:bg-indigo-600">
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Analytics & Stats Sidebar */}
        <div className="space-y-4">
          <Card className="space-y-6 rounded-xl border-none bg-white p-4 shadow-2xl shadow-slate-200/50">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Conversion Intelligence
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-indigo-600">
                    Avg. View-to-Order
                  </p>
                  <p className="text-sm font-black text-slate-900">64%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[8px] font-black uppercase text-slate-400">Top Retailer</p>
                  <p className="mt-1 text-sm font-black text-slate-900">TSUM HQ</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[8px] font-black uppercase text-slate-400">Open Rate</p>
                  <p className="mt-1 text-sm font-black text-slate-900">92.4%</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="h-12 w-full gap-2 rounded-xl border-slate-100 text-[9px] font-black uppercase tracking-widest"
            >
              View Detailed Sales Report
            </Button>
          </Card>

          <Card className="space-y-6 rounded-xl border-none bg-slate-900 p-4 text-white shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight">
                Private Access Control
              </h4>
            </div>
            <p className="text-[10px] font-medium leading-relaxed text-white/60">
              Enable "Invite Only" mode for premium drops. Linesheets will be accessible only via
              encrypted personal links.
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[9px] font-black uppercase tracking-widest">
                Master Key Status
              </span>
              <Badge className="border-none bg-emerald-500 text-[8px] font-black text-white">
                ACTIVE
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Create Modal Overlay */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl"
            >
              <div className="space-y-4 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                    Create New Hub
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCreating(false)}
                    className="rounded-full"
                  >
                    <Trash2 className="h-5 w-5 text-slate-400" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Internal Title
                    </label>
                    <Input
                      placeholder="Напр.: VIP-превью FW26 — ТЦ «Афимолл»"
                      className="h-10 rounded-2xl border-none bg-slate-50 focus-visible:ring-indigo-500"
                      value={newSheet.title}
                      onChange={(e) => setNewSheet({ ...newSheet, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Target Retailer
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {retailers.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setNewSheet({ ...newSheet, retailerId: r.id })}
                          className={cn(
                            'flex items-center justify-between rounded-2xl border p-4 transition-all',
                            newSheet.retailerId === r.id
                              ? 'border-indigo-200 bg-indigo-50'
                              : 'border-transparent bg-slate-50 hover:bg-slate-100'
                          )}
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase text-slate-900">
                              {r.name}
                            </span>
                            <span className="text-[8px] font-bold uppercase text-slate-400">
                              {r.location}
                            </span>
                          </div>
                          {newSheet.retailerId === r.id && (
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    className="h-10 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!newSheet.title || !newSheet.retailerId}
                    className="h-10 flex-1 gap-2 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200"
                  >
                    Generate & Send <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
