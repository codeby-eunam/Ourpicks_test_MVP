'use client';

import { ArrowRight, ListChecks, MoveHorizontal } from 'lucide-react';
import { getCopy } from '@/lib/copy';
import { InteractionMode, Region } from '@/lib/types';

interface StartScreenProps {
  region: Region;
  mode: InteractionMode;
  onStart: () => void;
}

/** 각 테스트 URL에 진입했을 때 사용자 동의로 실제 선택 흐름을 시작하는 화면 */
export default function StartScreen({ region, mode, onStart }: StartScreenProps) {
  const t = getCopy(region);
  const ModeIcon = mode === 'select' ? ListChecks : MoveHorizontal;

  return (
    <main className="flex flex-1 flex-col justify-between px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-10">
      <section className="flex flex-1 flex-col items-center justify-center gap-5 pb-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <ModeIcon size={30} strokeWidth={2.2} />
        </span>

        <div className="flex flex-col items-center gap-2">
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-muted">
            {t.intro.modeLabel[mode]}
          </p>
          <h1 className="text-2xl font-extrabold text-ink">{t.intro.title}</h1>
          <p className="max-w-sm text-sm leading-6 text-ink-muted">
            {t.intro.description[mode]}
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-card transition-transform active:scale-[0.98]"
      >
        {t.intro.cta}
        <ArrowRight size={19} />
      </button>
    </main>
  );
}
