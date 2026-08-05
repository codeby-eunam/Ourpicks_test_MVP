'use client';

import { useEffect, useMemo, useState } from 'react';
import { RestaurantLargeCard } from './RestaurantCard';
import { Region, Restaurant } from '@/lib/types';
import { getCopy } from '@/lib/copy';

interface TournamentProps {
  region: Region;
  restaurants: Restaurant[];
  onComplete: (winner: Restaurant) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Screen2 - 셔플된 후보들을 1:1 단일 엘리미네이션으로 붙여서 최종 1개를 뽑는다. */
export default function Tournament({ region, restaurants, onComplete }: TournamentProps) {
  const t = getCopy(region);
  const [participants, setParticipants] = useState<Restaurant[]>(() =>
    shuffle(restaurants)
  );
  const [matchIndex, setMatchIndex] = useState(0);
  const [winners, setWinners] = useState<Restaurant[]>([]);
  const [animKey, setAnimKey] = useState(0);

  // 참가자 목록을 2명씩 짝짓는다. 홀수면 마지막 한 명은 자동 부전승(bye).
  const pairs = useMemo(() => {
    const result: Restaurant[][] = [];
    for (let i = 0; i < participants.length; i += 2) {
      if (i + 1 < participants.length) {
        result.push([participants[i], participants[i + 1]]);
      } else {
        result.push([participants[i]]);
      }
    }
    return result;
  }, [participants]);

  // 부전승(단독 pair) 자동 처리 & 라운드 종료 시 다음 라운드로 전환
  useEffect(() => {
    if (participants.length === 1) {
      onComplete(participants[0]);
      return;
    }

    if (matchIndex >= pairs.length) {
      if (winners.length === 1) {
        onComplete(winners[0]);
      } else {
        setParticipants(winners);
        setMatchIndex(0);
        setWinners([]);
        setAnimKey((k) => k + 1);
      }
      return;
    }

    const currentPair = pairs[matchIndex];
    if (currentPair.length === 1) {
      // 부전승: 사용자 개입 없이 바로 다음 라운드로 진행
      setWinners((prev) => [...prev, currentPair[0]]);
      setMatchIndex((i) => i + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchIndex, pairs, participants, winners]);

  const currentPair = pairs[matchIndex];
  if (!currentPair || currentPair.length < 2) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-sm text-ink-muted">{t.tournament.preparing}</p>
      </div>
    );
  }

  function pick(winner: Restaurant) {
    setWinners((prev) => [...prev, winner]);
    setMatchIndex((i) => i + 1);
  }

  const totalMatchesThisRound = pairs.filter((p) => p.length === 2).length;
  const matchNumberThisRound =
    pairs.slice(0, matchIndex + 1).filter((p) => p.length === 2).length;

  return (
    <div className="flex flex-1 flex-col px-5 py-4">
      <div className="mb-4 flex flex-col items-center gap-1">
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          {t.tournament.roundLabel(participants.length)}
        </span>
        <p className="text-xs text-ink-muted">
          {t.tournament.matchProgress(matchNumberThisRound, totalMatchesThisRound)}
        </p>
      </div>

      <div key={`${animKey}-${matchIndex}`} className="flex flex-1 flex-col justify-center gap-3 animate-pop-in">
        <RestaurantLargeCard
          restaurant={currentPair[0]}
          onClick={() => pick(currentPair[0])}
        />
        <div className="flex items-center justify-center py-1">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-ink-muted shadow-sm">
            VS
          </span>
        </div>
        <RestaurantLargeCard
          restaurant={currentPair[1]}
          onClick={() => pick(currentPair[1])}
        />
      </div>

      <p className="mt-4 text-center text-xs text-ink-muted">{t.tournament.prompt}</p>
    </div>
  );
}
