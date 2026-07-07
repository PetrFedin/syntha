'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  FileText,
  Download,
  Share2,
  Search,
  Plus,
  MoreVertical,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Upload,
  ExternalLink,
  Eye,
  Filter,
  FileCheck,
  Archive,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import type { B2BDocument } from '@/lib/types/b2b';
import { cn } from '@/lib/cn';

export function DocumentManagementSystem() {
  const { b2bDocuments, uploadB2bDocument } = useB2BState();
  const [selectedDoc, setSelectedDoc] = useState<B2BDocument | null>(null);

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <ShieldCheck className="h-6 w-6 text-emerald-500" />;
      case 'invoice':
        return <FileCheck className="h-6 w-6 text-indigo-500" />;
      default:
        return <FileText className="h-6 w-6 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen space-y-4 bg-slate-50 p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
            <Badge
              variant="outline"
              className="border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-900"
            >
              DMS_VAULT_v3.1
            </Badge>
          </div>
          <h2 className="text-sm font-black uppercase leading-none tracking-tighter text-slate-900 md:text-sm">
            Secure Document
            <br />
            Repository
          </h2>
          <p className="max-w-md text-left text-xs font-medium text-slate-400">
            Legally-binding storage for contracts, invoices, and technical specifications. Share
            securely with global partners and logistics providers.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-2xl border-slate-200 bg-white px-6 text-[10px] font-black uppercase tracking-widest"
          >
            <Archive className="h-4 w-4" /> Архив
          </Button>
          <Button className="h-10 gap-2 rounded-2xl bg-slate-900 px-8 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-200">
            <Upload className="h-4 w-4" /> Загрузить документ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Document Browser */}
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Поиск по документам…"
                className="h-12 rounded-xl border-none bg-slate-50 pl-12 shadow-none"
              />
            </div>
            <div className="flex items-center gap-2 px-4">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="mx-2 h-6 w-[1px] bg-slate-100" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Sort: Recent
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {b2bDocuments.map((doc) => (
              <Card
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={cn(
                  'group cursor-pointer rounded-xl border-none p-4 shadow-xl shadow-slate-200/50 transition-all',
                  selectedDoc?.id === doc.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white hover:bg-slate-50'
                )}
              >
                <div className="mb-6 flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-2xl transition-colors',
                      selectedDoc?.id === doc.id ? 'bg-white/10' : 'bg-slate-50'
                    )}
                  >
                    {getDocIcon(doc.type)}
                  </div>
                  <Badge
                    className={cn(
                      'border-none px-2 py-0.5 text-[8px] font-black uppercase',
                      doc.status === 'final'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-amber-100 text-amber-600'
                    )}
                  >
                    {doc.status}
                  </Badge>
                </div>

                <div className="mb-6 space-y-1">
                  <h4 className="truncate text-sm font-black uppercase tracking-tight">
                    {doc.title}
                  </h4>
                  <p
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-widest',
                      selectedDoc?.id === doc.id ? 'text-white/40' : 'text-slate-400'
                    )}
                  >
                    {doc.type} • {doc.size}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Document Inspector / Meta Side */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {selectedDoc ? (
              <motion.div
                key={selectedDoc.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Card className="space-y-4 rounded-xl border-none bg-white p-3 shadow-2xl shadow-slate-200/50">
                  <div className="space-y-4">
                    <div className="group relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                      <FileText className="h-20 w-20 text-slate-200" />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button className="gap-2 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-900">
                          <Eye className="h-4 w-4" /> Full Preview
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1 text-center">
                      <h3 className="text-base font-black uppercase text-slate-900">
                        {selectedDoc.title}
                      </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        ID: {selectedDoc.id}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Access Control
                    </h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Admin Node', role: 'Owner', access: 'Full' },
                        { name: 'Premium Store', role: 'Retailer', access: 'View Only' },
                        { name: 'Logistics Hub', role: 'Forwarder', access: 'Download' },
                      ].map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-black">
                              {p.name[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase leading-none text-slate-900">
                                {p.name}
                              </span>
                              <span className="mt-1 text-[8px] font-bold uppercase text-slate-400">
                                {p.role}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-slate-200 text-[7px] font-black"
                          >
                            {p.access}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button className="h-10 w-full gap-2 rounded-2xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700">
                      <Share2 className="h-4 w-4" /> Grant Secure Access
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 w-full gap-2 rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" /> Revoke All Access
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-6 rounded-xl border border-dashed border-slate-200 bg-white p-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                  <FolderOpen className="h-10 w-10 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black uppercase tracking-tight text-slate-400">
                    Vault Preview node
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Select a document to manage permissions and sharing
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
