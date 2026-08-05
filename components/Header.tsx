import { UtensilsCrossed } from 'lucide-react';
import { InteractionMode, Region } from '@/lib/types';

const REGION_LABEL: Record<Region, string> = {
  yeongnam: '영남대 맛집',
  seattle: 'Seattle Downtown',
};

const MODE_GUIDE: Record<InteractionMode, string> = {
  select: '리스트에서 후보를 체크해보세요',
  swipe: '카드를 넘기며 후보를 골라보세요',
};

interface HeaderProps {
  region: Region;
  mode: InteractionMode;
  step: 'browse' | 'tournament' | 'result';
}

export default function Header({ region, mode, step }: HeaderProps) {
  const stepLabel =
    step === 'browse'
      ? '후보 선별'
      : step === 'tournament'
      ? '1:1 토너먼트'
      : '결과 발표';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-surface/90 px-5 pb-3 pt-5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
          <UtensilsCrossed size={16} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">[{REGION_LABEL[region]}]</p>
          <p className="text-xs text-ink-muted">
            {step === 'browse' ? MODE_GUIDE[mode] : stepLabel}
          </p>
        </div>
      </div>
    </header>
  );
}
