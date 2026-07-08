'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuiz } from './hooks/useQuiz';
import { BRAND_QUIZ_QUESTIONS } from './_lib/quiz-questions';
import type { StyleArchetype } from './_lib/types';

const STYLE_RU: Record<StyleArchetype, string> = {
  street: 'Street / дропы',
  sport: 'Sport lifestyle',
  techwear: 'Techwear / urban tech',
  contemporary: 'Contemporary',
  heritage: 'Heritage',
  luxury: 'Luxury-сигнал',
  none: 'Смешанный / без явного ядра',
};

export default function QuizPage() {
  const { step, updateParam, nextStep, prevStep, calculateResult, resetQuiz, result } = useQuiz();
  const questions = BRAND_QUIZ_QUESTIONS;
  const total = questions.length;

  if (result) {
    return (
      <div className="container max-w-4xl space-y-4 py-10">
        <Card className="rounded-3xl border-none bg-white p-4 shadow-2xl">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-black uppercase">
                Индекс бренда (BPI): {result.bpi}%
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-bold">
                {result.segment.code}
              </Badge>
            </div>
            <CardDescription className="text-base font-semibold text-slate-800">
              {result.segment.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-slate-600">{result.segment.description}</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Стилистический акцент (по ответам)
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {STYLE_RU[result.style] ?? result.style}
              </p>
            </div>
            {result.upgradeTarget && (
              <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">
                  Вектор роста
                </p>
                <p className="mt-1 font-semibold text-violet-900">{result.upgradeTarget.name}</p>
                <p className="mt-1 text-sm text-violet-800/90">
                  {result.upgradeTarget.description}
                </p>
              </div>
            )}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
                Рекомендации
              </h4>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                {result.upgradeTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
            <Button
              type="button"
              onClick={resetQuiz}
              className="h-10 w-full rounded-2xl bg-black font-black uppercase text-white"
            >
              Пройти заново
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[step];

  return (
    <div className="container max-w-2xl space-y-6 py-10">
      <div className="space-y-2 px-1">
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
          Квиз для брендов
        </h1>
        <p className="text-sm text-slate-600">
          {total} вопросов по позиционированию: цена, материалы, дистрибуция, digital и др. Ответы
          заполняют профиль и считают BPI — индекс близости к премиальному полю и один из 20
          сегментов лестницы.
        </p>
      </div>

      <Card className="overflow-hidden rounded-xl border-none bg-white shadow-2xl">
        <div className="h-2 bg-slate-100">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        <CardHeader className="p-4 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Вопрос {step + 1} из {total}
          </span>
          <CardTitle className="mt-2 text-sm font-black uppercase leading-snug">
            {currentQ.label}
          </CardTitle>
          {currentQ.hint ? (
            <CardDescription className="text-xs text-slate-500">{currentQ.hint}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {currentQ.options.map((opt, i) => (
            <Button
              key={opt.label}
              type="button"
              variant="outline"
              className="h-auto min-h-12 w-full justify-start whitespace-normal rounded-2xl px-4 py-3 text-left text-sm font-bold leading-snug transition-all hover:bg-black hover:text-white"
              onClick={() => {
                updateParam(currentQ.key, opt.value);
                if (step < total - 1) nextStep();
                else calculateResult();
              }}
            >
              {opt.label}
            </Button>
          ))}
          <div className="flex gap-3 pt-4">
            {step > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                className="text-xs font-bold uppercase"
              >
                Назад
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
