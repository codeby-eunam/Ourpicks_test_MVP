'use client';

import { useMemo, useRef, useState } from 'react';
import { X, Heart } from 'lucide-react';
import { RestaurantLargeCard } from './RestaurantCard';
import { Restaurant } from '@/lib/types';

interface SwipeModeProps {
  restaurants: Restaurant[];
  onStart: (selected: Restaurant[]) => void;
}

const MIN_REQUIRED = 4;
const SWIPE_THRESHOLD = 100;

/** Screen1 - mode=swipe: 카드 1장씩 SKIP / KEEP (또는 좌우 스와이프)로 후보를 고르는 화면 */
export default function SwipeMode({ restaurants, onStart }: SwipeModeProps) {
  const [index, setIndex] = useState(0);
  const [kept, setKept] = useState<Restaurant[]>([]);
  const [drag, setDrag] = useState({ x: 0, active: false });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);

  const current = restaurants[index];
  const isDone = index >= restaurants.length;
  const canStart = kept.length >= MIN_REQUIRED;

  const rotation = useMemo(() => drag.x / 18, [drag.x]);

  function decide(keep: boolean) {
    if (!current) return;
    setExiting(keep ? 'right' : 'left');
    setTimeout(() => {
      if (keep) setKept((prev) => [...prev, current]);
      setIndex((i) => i + 1);
      setDrag({ x: 0, active: false });
      setExiting(null);
    }, 200);
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, active: true });
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragStart.current) return;
    setDrag({ x: e.clientX - dragStart.current.x, active: true });
  }
  function handlePointerUp() {
    if (!dragStart.current) return;
    const dx = drag.x;
    dragStart.current = null;
    if (dx > SWIPE_THRESHOLD) decide(true);
    else if (dx < -SWIPE_THRESHOLD) decide(false);
    else setDrag({ x: 0, active: false });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="text-sm text-ink-muted">
          {isDone ? '모든 카드를 확인했어요' : `${index + 1} / ${restaurants.length}`}
        </p>
        <p className="text-sm font-medium text-brand">후보 {kept.length}개 담김</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-4">
        {isDone || !current ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-lg font-semibold text-ink">카드를 다 봤어요!</p>
            <p className="text-sm text-ink-muted">
              담은 후보 {kept.length}개로 토너먼트를 시작할 수 있어요.
            </p>
          </div>
        ) : (
          <div className="relative w-full">
            {/* 다음 카드 미리보기 (살짝 뒤에 깔림) */}
            {restaurants[index + 1] && (
              <div className="absolute inset-0 scale-[0.96] opacity-60">
                <RestaurantLargeCard restaurant={restaurants[index + 1]} />
              </div>
            )}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{
                transform: exiting
                  ? `translateX(${exiting === 'right' ? 520 : -520}px) rotate(${
                      exiting === 'right' ? 20 : -20
                    }deg)`
                  : `translateX(${drag.x}px) rotate(${rotation}deg)`,
                transition: drag.active ? 'none' : 'transform 0.25s ease-out',
                touchAction: 'pan-y',
              }}
              className="relative z-10 cursor-grab active:cursor-grabbing"
            >
              <RestaurantLargeCard restaurant={current} />
              {drag.x > 30 && (
                <span className="absolute right-4 top-4 rotate-6 rounded-lg border-2 border-brand px-2 py-1 text-sm font-bold text-brand">
                  KEEP
                </span>
              )}
              {drag.x < -30 && (
                <span className="absolute left-4 top-4 -rotate-6 rounded-lg border-2 border-slate-400 px-2 py-1 text-sm font-bold text-slate-400">
                  SKIP
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {!isDone && current && (
        <div className="flex items-center justify-center gap-6 px-5 pb-4">
          <button
            type="button"
            onClick={() => decide(false)}
            aria-label="건너뛰기"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-card transition-transform active:scale-90"
          >
            <X size={26} />
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            aria-label="후보 추가"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-card transition-transform active:scale-90"
          >
            <Heart size={24} fill="white" />
          </button>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[480px] border-t border-slate-100 bg-white/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
        <button
          type="button"
          disabled={!canStart}
          onClick={() => onStart(kept)}
          className="w-full rounded-2xl bg-brand py-3.5 text-center font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {canStart
            ? `담은 ${kept.length}개로 토너먼트 시작 (10초 소요)`
            : `${MIN_REQUIRED}개 이상 담으면 시작할 수 있어요 (${kept.length}/${MIN_REQUIRED})`}
        </button>
      </div>
    </div>
  );
}
