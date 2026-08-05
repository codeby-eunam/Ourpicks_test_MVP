'use client';

import Image from 'next/image';
import { Clock, Star } from 'lucide-react';
import { Restaurant } from '@/lib/types';
import SurveyForm from './SurveyForm';

interface ResultScreenProps {
  winner: Restaurant;
  durationSeconds: number;
  resultId: string | null;
  onRestart: () => void;
}

/** Screen3 - 최종 우승 식당 발표 + 소요 시간 + 퀵 설문 */
export default function ResultScreen({
  winner,
  durationSeconds,
  resultId,
  onRestart,
}: ResultScreenProps) {
  return (
    <div className="flex flex-col gap-5 px-5 pb-10 pt-2">
      <div className="animate-pop-in flex flex-col items-center gap-3 rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-card">
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src={winner.image_url}
            alt={winner.name}
            fill
            sizes="440px"
            className="object-cover"
            priority
          />
        </div>

        <p className="text-sm font-medium text-brand">오늘 추천 점심은</p>
        <h1 className="text-2xl font-extrabold text-ink">{winner.name}!</h1>
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span>{winner.category}</span>
          <span className="flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {winner.rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm text-ink-muted">
          <Clock size={14} />
          고민 해결까지 걸린 시간: <span className="font-semibold text-ink">{durationSeconds}초</span>
        </div>
      </div>

      <SurveyForm resultId={resultId} />

      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-ink-muted transition-all active:scale-[0.98]"
      >
        처음부터 다시 하기
      </button>
    </div>
  );
}
