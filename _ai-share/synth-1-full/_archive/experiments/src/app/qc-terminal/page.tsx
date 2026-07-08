'use client';

import { useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getAqlPlan } from '@/lib/production/aql-standards';

type Step = 'select_batch' | 'aql_setup' | 'inspection';

export default function QcTerminalPage() {
  const searchParams = useSearchParams();
  const defaultBatchId = searchParams?.get('batchId') || '';

  const [step, setStep] = useState<Step>('select_batch');
  const [batchId, setBatchId] = useState(defaultBatchId);
  const [batchSize, setBatchSize] = useState<number | ''>('');

  // Inspection state
  const [inspectedCount, setInspectedCount] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // Fail form state
  const [showFailForm, setShowFailForm] = useState(false);
  const [defectComment, setDefectComment] = useState('');
  const [defectPhoto, setDefectPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aql = typeof batchSize === 'number' && batchSize > 0 ? getAqlPlan(batchSize, '2.5') : null;
  const targetSample = aql?.sampleSize || 0;

  const handleStartAql = () => {
    if (batchId) {
      setStep('aql_setup');
    }
  };

  const handleStartInspection = () => {
    if (typeof batchSize === 'number' && batchSize > 0) {
      setStep('inspection');
    }
  };

  const handlePass = () => {
    setPassedCount((p) => p + 1);
    setInspectedCount((p) => p + 1);
  };

  const handleFailClick = () => {
    setShowFailForm(true);
  };

  const handleConfirmFail = () => {
    setFailedCount((p) => p + 1);
    setInspectedCount((p) => p + 1);
    setShowFailForm(false);
    setDefectComment('');
    setDefectPhoto(null);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setDefectPhoto(url);
    }
  };

  const isComplete = targetSample > 0 && inspectedCount >= targetSample;

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-white shadow-xl">
      {/* Header */}
      <header className="border-border-default sticky top-0 z-10 flex items-center gap-3 border-b bg-slate-50 p-4">
        <div className="bg-accent-primary rounded-lg p-2 text-white">
          <LucideIcons.ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-text-primary text-sm font-bold">Терминал Инспектора</h1>
          <p className="text-text-secondary text-xs font-medium">
            {step === 'select_batch'
              ? 'Выбор партии'
              : step === 'aql_setup'
                ? 'Настройка AQL'
                : 'Инспекция'}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col overflow-y-auto p-4">
        {step === 'select_batch' && (
          <div className="flex flex-1 flex-col justify-center gap-6 pb-12">
            <div className="space-y-2 text-center">
              <LucideIcons.Package className="mx-auto h-12 w-12 text-slate-300" />
              <h2 className="text-text-primary text-xl font-bold">Сканирование партии</h2>
              <p className="text-text-secondary text-sm">
                Укажите ID партии или отсканируйте штрихкод
              </p>
            </div>

            <div className="space-y-4">
              <Input
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="Например, BATCH-001"
                className="h-14 text-center text-lg shadow-sm"
              />
              <Button
                onClick={handleStartAql}
                disabled={!batchId.trim()}
                className="h-14 w-full text-lg font-semibold"
              >
                Продолжить
              </Button>
            </div>
          </div>
        )}

        {step === 'aql_setup' && (
          <div className="flex flex-1 flex-col gap-6">
            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="space-y-1.5">
                <label className="text-text-secondary text-xs font-bold uppercase tracking-wider">
                  ID Партии
                </label>
                <div className="font-mono text-sm font-medium">{batchId}</div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-text-primary block text-sm font-bold">
                Укажите размер партии (шт)
              </label>
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                className="h-16 text-center text-2xl font-bold"
              />
            </div>

            {aql && (
              <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2">
                  <span className="text-sm font-medium text-emerald-800">Выборка к проверке</span>
                  <span className="text-xl font-bold text-emerald-900">{aql.sampleSize} шт</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-800/80">Допустимо брака (Ac)</span>
                  <span className="font-bold text-emerald-900">{aql.acceptLimit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-rose-600/80">Браковка партии (Re)</span>
                  <span className="font-bold text-rose-700">≥ {aql.rejectLimit}</span>
                </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              <Button
                onClick={handleStartInspection}
                disabled={!aql}
                className="h-14 w-full text-lg font-semibold"
              >
                Начать инспекцию
              </Button>
            </div>
          </div>
        )}

        {step === 'inspection' && !showFailForm && !isComplete && (
          <div className="flex flex-1 flex-col">
            {/* Progress */}
            <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 flex items-end justify-between">
                <div>
                  <div className="text-text-secondary mb-1 text-[10px] font-bold uppercase tracking-wider">
                    Прогресс выборки
                  </div>
                  <div className="text-text-primary text-2xl font-black">
                    {inspectedCount}{' '}
                    <span className="text-lg font-medium text-slate-400">/ {targetSample}</span>
                  </div>
                </div>
                <div className="flex gap-3 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase text-emerald-600">Pass</span>
                    <span className="text-lg font-bold text-emerald-700">{passedCount}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase text-rose-600">Fail</span>
                    <span className="text-lg font-bold text-rose-700">{failedCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(passedCount / targetSample) * 100}%` }}
                />
                <div
                  className="h-full bg-rose-500"
                  style={{ width: `${(failedCount / targetSample) * 100}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-1 flex-col justify-center gap-4 pb-6">
              <button
                type="button"
                onClick={handlePass}
                className="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-600 active:bg-emerald-700"
              >
                <LucideIcons.CheckCircle2 className="h-16 w-16" />
                <span className="text-3xl font-black tracking-wider">PASS</span>
              </button>

              <button
                type="button"
                onClick={handleFailClick}
                className="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-rose-500 text-white shadow-lg shadow-rose-500/20 transition-colors hover:bg-rose-600 active:bg-rose-700"
              >
                <LucideIcons.XCircle className="h-16 w-16" />
                <span className="text-3xl font-black tracking-wider">FAIL</span>
              </button>
            </div>
          </div>
        )}

        {step === 'inspection' && showFailForm && (
          <div className="flex flex-1 flex-col duration-200 animate-in slide-in-from-bottom-4">
            <div className="mb-6 flex items-center gap-2">
              <button
                onClick={() => setShowFailForm(false)}
                className="-ml-2 p-2 text-slate-400 hover:text-slate-600"
              >
                <LucideIcons.ArrowLeft className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-bold text-rose-600">Фиксация дефекта</h2>
            </div>

            <div className="flex-1 space-y-6">
              {/* Photo capture */}
              <div className="space-y-3">
                <label className="text-text-primary block text-sm font-bold">Фото дефекта</label>

                {defectPhoto ? (
                  <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={defectPhoto} alt="Дефект" className="h-full w-full object-contain" />
                    <button
                      onClick={() => setDefectPhoto(null)}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white backdrop-blur-md"
                    >
                      <LucideIcons.X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-100"
                  >
                    <LucideIcons.Camera className="h-10 w-10" />
                    <span className="text-sm font-medium">Сделать фото</span>
                  </button>
                )}

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoCapture}
                />
              </div>

              {/* Comment */}
              <div className="space-y-3">
                <label className="text-text-primary block text-sm font-bold">
                  Описание (опционально)
                </label>
                <Textarea
                  value={defectComment}
                  onChange={(e) => setDefectComment(e.target.value)}
                  placeholder="Опишите характер дефекта..."
                  className="min-h-[120px] border-slate-200 bg-slate-50 p-4 text-base"
                />
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Button
                onClick={handleConfirmFail}
                variant="destructive"
                className="h-14 w-full text-lg font-bold shadow-lg shadow-rose-500/20"
              >
                Сохранить брак
              </Button>
            </div>
          </div>
        )}

        {step === 'inspection' && isComplete && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center duration-300 animate-in zoom-in-95">
            <div
              className={cn(
                'mb-2 flex h-24 w-24 items-center justify-center rounded-full',
                failedCount >= (aql?.rejectLimit || 999)
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-emerald-100 text-emerald-600'
              )}
            >
              {failedCount >= (aql?.rejectLimit || 999) ? (
                <LucideIcons.XCircle className="h-12 w-12" />
              ) : (
                <LucideIcons.CheckCircle2 className="h-12 w-12" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-text-primary text-2xl font-black">Инспекция завершена</h2>
              <p className="text-text-secondary">
                Проверено {inspectedCount} из {targetSample} изделий
              </p>
            </div>

            <div className="w-full max-w-xs space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary font-semibold">Статус партии:</span>
                {failedCount >= (aql?.rejectLimit || 999) ? (
                  <span className="font-bold uppercase tracking-wide text-rose-600">Брак</span>
                ) : (
                  <span className="font-bold uppercase tracking-wide text-emerald-600">
                    Принято
                  </span>
                )}
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Прошло проверку</span>
                <span className="font-bold">{passedCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Браковано</span>
                <span className="font-bold">{failedCount}</span>
              </div>
            </div>

            <Button
              onClick={() => {
                setStep('select_batch');
                setBatchId('');
                setBatchSize('');
                setInspectedCount(0);
                setPassedCount(0);
                setFailedCount(0);
              }}
              variant="outline"
              className="mt-4 h-12 px-8"
            >
              Новая инспекция
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
