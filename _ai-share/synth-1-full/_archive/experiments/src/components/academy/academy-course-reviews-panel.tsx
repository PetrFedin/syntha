'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ACADEMY_CTA_PRIMARY } from '@/lib/ui/academy-cta';
import {
  addCourseReview,
  getCourseRatingSummary,
  getCourseReviews,
  type CourseReviewEntry,
} from '@/lib/academy/academy-course-reviews';

function StarsRow({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex items-center gap-0.5" role={onChange ? 'group' : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className="rounded p-0.5 text-amber-500 transition-opacity hover:opacity-90 disabled:cursor-default"
          aria-label={`${n} из 5`}
        >
          <Star
            className={`size-4 ${n <= value ? 'fill-amber-400' : 'fill-transparent'} text-amber-500`}
          />
        </button>
      ))}
    </div>
  );
}

export function AcademyCourseReviewsPanel({
  courseId,
  catalogRating,
  embedded,
}: {
  courseId: string;
  /** Рейтинг из карточки курса (мок каталога) — показываем рядом с отзывами */
  catalogRating?: number;
  /** Без верхней границы — внутри Card в кабинете бренда */
  embedded?: boolean;
}) {
  const [reviews, setReviews] = React.useState<CourseReviewEntry[]>(() =>
    getCourseReviews(courseId)
  );
  const [summary, setSummary] = React.useState(() => getCourseRatingSummary(courseId));
  const [name, setName] = React.useState('');
  const [text, setText] = React.useState('');
  const [rating, setRating] = React.useState(5);

  const refresh = React.useCallback(() => {
    setReviews(getCourseReviews(courseId));
    setSummary(getCourseRatingSummary(courseId));
  }, [courseId]);

  React.useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener('syntha-academy-reviews-changed', onChange);
    return () => window.removeEventListener('syntha-academy-reviews-changed', onChange);
  }, [refresh]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addCourseReview(courseId, name, rating, text);
    setText('');
    setName('');
    setRating(5);
    refresh();
  };

  const displayAvg = summary.count > 0 ? summary.average : (catalogRating ?? 0);

  return (
    <div className={cn(!embedded && 'border-t border-[#e6e9ef] pt-4', embedded && 'pt-0')}>
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6b7788]">
        Отзывы и оценка
      </h2>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-[13px] text-[#1a2433]">
        <span className="inline-flex items-center gap-1 font-semibold">
          <Star className="size-4 fill-amber-400 text-amber-500" aria-hidden />
          {displayAvg ? displayAvg.toFixed(1).replace('.', ',') : '—'}
        </span>
        <span className="text-[#6b7788]">
          {summary.count > 0
            ? `${summary.count} ${summary.count === 1 ? 'отзыв' : summary.count < 5 ? 'отзыва' : 'отзывов'}`
            : catalogRating != null
              ? 'Пока нет текстовых отзывов — оценка из каталога'
              : 'Пока нет отзывов'}
        </span>
      </div>

      <ul className="mb-6 space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-sm border border-[#e6e9ef] bg-[#f7f8fa] px-3 py-2.5">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-[#1a2433]">{r.authorName}</span>
              <StarsRow value={r.rating} />
            </div>
            <p className="text-[13px] leading-relaxed text-[#5b6675]">{r.text}</p>
            <p className="mt-1 text-[10px] text-[#8b95a3]">
              {new Date(r.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </li>
        ))}
      </ul>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-sm border border-dashed border-[#c5ccd6] bg-white p-3"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7788]">
          Оставить отзыв
        </p>
        <Input
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 border-[#c5ccd6] text-[13px]"
        />
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#6b7788]">Оценка</span>
          <StarsRow value={rating} onChange={setRating} />
        </div>
        <Textarea
          placeholder="Комментарий к курсу"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="resize-none border-[#c5ccd6] text-[13px]"
        />
        <Button type="submit" size="sm" className={ACADEMY_CTA_PRIMARY}>
          Отправить
        </Button>
      </form>
    </div>
  );
}
