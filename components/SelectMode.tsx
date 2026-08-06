'use client';

import { useState } from 'react';
import { RestaurantCompactCard } from './RestaurantCard';
import { Region, Restaurant } from '@/lib/types';
import { getCopy } from '@/lib/copy';

interface SelectModeProps {
  region: Region;
  restaurants: Restaurant[];
  onStart: (selected: Restaurant[]) => void;
}

/** Screen1 - mode=select: 체크박스 리스트로 토너먼트 후보를 고르는 화면 */
export default function SelectMode({ region, restaurants, onStart }: SelectModeProps) {
  const t = getCopy(region);

  // 사용자가 리스트에서 후보를 직접 선택하도록 초기에는 아무것도 선택하지 않는다.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const canStart = selectedCount >= 2;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="text-sm text-ink-muted">{t.select.subtitle(selectedCount)}</p>
      </div>

      <ul className="flex flex-col gap-2.5 px-5 py-4 pb-28">
        {restaurants.map((r, i) => (
          <li
            key={r.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <RestaurantCompactCard
              restaurant={r}
              checked={selectedIds.has(r.id)}
              onToggle={() => toggle(r.id)}
            />
          </li>
        ))}
      </ul>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[480px] border-t border-slate-100 bg-white/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
        <button
          type="button"
          disabled={!canStart}
          onClick={() =>
            onStart(restaurants.filter((r) => selectedIds.has(r.id)))
          }
          className="w-full rounded-2xl bg-brand py-3.5 text-center font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {t.select.cta(selectedCount)}
        </button>
      </div>
    </div>
  );
}
