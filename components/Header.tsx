import { UtensilsCrossed } from 'lucide-react';
import { InteractionMode, Region } from '@/lib/types';
import { getCopy } from '@/lib/copy';

const REGION_LABEL: Record<Region, string> = {
  yeongnam: '영남대 맛집',
  seattle: 'Seattle Downtown',
};

interface HeaderProps {
  region: Region;
  mode: InteractionMode;
  step: 'intro' | 'browse' | 'tournament' | 'result';
}

export default function Header({ region, mode, step }: HeaderProps) {
  const t = getCopy(region);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-surface/90 px-5 pb-3 pt-5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
          <UtensilsCrossed size={16} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">[{REGION_LABEL[region]}]</p>
          <p className="text-xs text-ink-muted">
            {step === 'browse' ? t.modeGuide[mode] : t.stepLabel[step]}
          </p>
        </div>
      </div>
    </header>
  );
}
