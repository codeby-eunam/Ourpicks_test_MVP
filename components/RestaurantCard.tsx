'use client';

import { Star, Check } from 'lucide-react';
import { Restaurant } from '@/lib/types';
import ReliableImage from './ReliableImage';

interface CompactCardProps {
  restaurant: Restaurant;
  checked: boolean;
  onToggle: () => void;
}

/** Screen1 - select 모드 리스트에서 쓰는 가로형 카드 (사진 + 정보 + 체크박스) */
export function RestaurantCompactCard({
  restaurant,
  checked,
  onToggle,
}: CompactCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left shadow-card transition-all active:scale-[0.98] ${
        checked ? 'border-brand/60 ring-1 ring-brand/30' : 'border-slate-100'
      }`}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <ReliableImage
          src={restaurant.image_url}
          alt={restaurant.name}
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{restaurant.name}</p>
        <p className="truncate text-sm text-ink-muted">{restaurant.category}</p>
        <div className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
          <Star size={14} className="fill-amber-400 text-amber-400" />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          checked
            ? 'border-brand bg-brand text-white'
            : 'border-slate-200 bg-white'
        }`}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </div>
    </button>
  );
}

interface LargeCardProps {
  restaurant: Restaurant;
  className?: string;
  onClick?: () => void;
  badge?: string;
  /**
   * true면 카드가 부모의 남은 flex 공간을 그대로 채운다(이미지가 aspect-ratio 대신
   * flex-1로 늘어남). 토너먼트 화면처럼 화면 높이 안에 카드 2장을 동시에 맞춰야 할 때 사용.
   */
  fill?: boolean;
}

/** 스와이프/토너먼트 화면에서 쓰는 큰 세로형 카드 */
export function RestaurantLargeCard({
  restaurant,
  className = '',
  onClick,
  badge,
  fill = false,
}: LargeCardProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`relative flex w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white text-left shadow-card transition-transform ${
        onClick ? 'active:scale-[0.97]' : ''
      } ${fill ? 'min-h-0 flex-1' : ''} ${className}`}
    >
      <div
        className={`relative w-full bg-slate-100 ${
          fill ? 'min-h-0 flex-1' : 'aspect-[4/3]'
        }`}
      >
        <ReliableImage
          src={restaurant.image_url}
          alt={restaurant.name}
          sizes="480px"
          className="object-cover"
        />
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>
      <div className={`flex shrink-0 flex-col gap-0.5 ${fill ? 'p-2.5' : 'p-4'}`}>
        <p className={`font-bold text-ink ${fill ? 'text-sm' : 'text-lg'}`}>{restaurant.name}</p>
        <div className="flex items-center justify-between">
          <span className={`text-ink-muted ${fill ? 'text-xs' : 'text-sm'}`}>
            {restaurant.category}
          </span>
          <span className={`flex items-center gap-1 font-medium text-ink ${fill ? 'text-xs' : 'text-sm'}`}>
            <Star size={fill ? 12 : 14} className="fill-amber-400 text-amber-400" />
            {restaurant.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Comp>
  );
}
