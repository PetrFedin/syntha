'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';
import {
  STYLE_QUIZ_DEFAULTS,
  clearStyleQuizProfile,
  loadStyleQuizProfile,
  saveStyleQuizProfile,
} from '@/lib/fashion/style-quiz-store';
import type { StyleQuizProfileV1 } from '@/lib/fashion/types';
import { useToast } from '@/hooks/use-toast';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

type Mood = StyleQuizProfileV1['mood'];
type Sil = StyleQuizProfileV1['silhouette'];
type Pal = StyleQuizProfileV1['palette'];

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border text-muted-foreground hover:border-primary/40'
      }`}
    >
      {children}
    </button>
  );
}

export default function StyleQuizPage() {
  const { toast } = useToast();
  const [mood, setMood] = useState<Mood>('classic');
  const [silhouette, setSilhouette] = useState<Sil>('relaxed');
  const [palette, setPalette] = useState<Pal>('neutral');

  useEffect(() => {
    const saved = loadStyleQuizProfile();
    if (saved) {
      setMood(saved.mood);
      setSilhouette(saved.silhouette);
      setPalette(saved.palette);
    } else {
      setMood(STYLE_QUIZ_DEFAULTS.mood);
      setSilhouette(STYLE_QUIZ_DEFAULTS.silhouette);
      setPalette(STYLE_QUIZ_DEFAULTS.palette);
    }
  }, []);

  const persist = () => {
    saveStyleQuizProfile({ mood, silhouette, palette });
    toast({
      title: 'Профиль сохранён',
      description: 'Откройте «Для вас» в локальном режиме — порядок ленты обновится.',
    });
  };

  return (
    <CabinetPageContent maxWidth="lg">
      <ClientCabinetSectionHeader />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Настроения и силуэт</CardTitle>
          <CardDescription>
            Три оси — эвристика по названию, категории и цвету <AcronymWithTooltip abbr="SKU" />.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Настроение</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={mood === 'minimal'} onClick={() => setMood('minimal')}>
                Минимализм
              </Chip>
              <Chip active={mood === 'classic'} onClick={() => setMood('classic')}>
                Классика
              </Chip>
              <Chip active={mood === 'bold'} onClick={() => setMood('bold')}>
                Ярко / принты
              </Chip>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Посадка</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={silhouette === 'fitted'} onClick={() => setSilhouette('fitted')}>
                Облегающий
              </Chip>
              <Chip active={silhouette === 'relaxed'} onClick={() => setSilhouette('relaxed')}>
                Свободный / oversize
              </Chip>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Палитра</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={palette === 'neutral'} onClick={() => setPalette('neutral')}>
                Нейтральная
              </Chip>
              <Chip active={palette === 'bright'} onClick={() => setPalette('bright')}>
                Яркая
              </Chip>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" onClick={persist}>
              Сохранить
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearStyleQuizProfile();
                setMood(STYLE_QUIZ_DEFAULTS.mood);
                setSilhouette(STYLE_QUIZ_DEFAULTS.silhouette);
                setPalette(STYLE_QUIZ_DEFAULTS.palette);
                toast({ title: 'Профиль сброшен' });
              }}
            >
              Сбросить
            </Button>
            <Button variant="secondary" asChild>
              <Link href={ROUTES.client.forYou}>К ленте «Для вас»</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
