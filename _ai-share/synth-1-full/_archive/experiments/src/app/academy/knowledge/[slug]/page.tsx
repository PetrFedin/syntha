'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getArticleBySlug } from '@/lib/education-data';
import { ROUTES } from '@/lib/routes';
import { nuOrderDeskShell } from '@/lib/ui/nuorder-desk-shell';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GlossaryText } from '../../glossary-text';

export default function ClientAcademyKnowledgeArticlePage() {
  const params = useParams();
  const slug = String(params?.slug ?? '');
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className={nuOrderDeskShell.canvas}>
        <p className="text-[13px] text-[#5b6675]">Статья не найдена.</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href={ROUTES.academyPlatform}>К академии</Link>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={nuOrderDeskShell.canvas}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px] font-semibold"
            asChild
          >
            <Link href={ROUTES.academyPlatform}>
              <ArrowLeft className="size-3.5" aria-hidden />
              Академия
            </Link>
          </Button>
          <span className="text-[#bcc3ce]" aria-hidden>
            /
          </span>
          <span className="text-[11px] font-medium text-[#6b7788]">База знаний</span>
        </div>

        <div className="rounded-sm border border-[#c5ccd6] bg-white p-4 shadow-none sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <Badge
              variant="secondary"
              className="rounded-sm border-none bg-[#dde1e8] px-2 py-0.5 text-[11px] font-medium text-[#1a2433]"
            >
              {article.category}
            </Badge>
            <time className="text-[11px] text-[#6b7788]" dateTime={article.updatedAt}>
              Обновлено {format(new Date(article.updatedAt), 'd MMMM yyyy', { locale: ru })}
            </time>
          </div>

          <h1 className="mb-4 text-[16px] font-semibold leading-snug text-[#1a2433]">
            <GlossaryText text={article.title} />
          </h1>

          <p className="mb-6 text-[13px] leading-relaxed text-[#5b6675]">
            <GlossaryText text={article.excerpt} />
          </p>

          <div className="border-t border-[#e6e9ef] pt-4">
            <p className="text-[13px] leading-relaxed text-[#1a2433]">
              <GlossaryText text={article.content} />
            </p>
          </div>

          {article.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm bg-[#e8f1fb] px-2 py-0.5 text-[11px] font-medium text-[#0b63ce]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <p className="mt-6 text-[11px] text-[#6b7788]">
            Автор: <span className="font-medium text-[#1a2433]">{article.authorName}</span>
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
