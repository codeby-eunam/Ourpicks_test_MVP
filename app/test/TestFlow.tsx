'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import SelectMode from '@/components/SelectMode';
import SwipeMode from '@/components/SwipeMode';
import Tournament from '@/components/Tournament';
import ResultScreen from '@/components/ResultScreen';
import { fetchRestaurantsByRegion } from '@/lib/restaurants';
import {
  createTestResult,
  flushPendingTestResults,
} from '@/lib/testResults';
import { FlowStep, InteractionMode, Region, Restaurant } from '@/lib/types';
import { getCopy } from '@/lib/copy';

function parseRegion(value: string | null): Region {
  return value === 'seattle' ? 'seattle' : 'yeongnam';
}
function parseMode(value: string | null): InteractionMode {
  return value === 'swipe' ? 'swipe' : 'select';
}

export default function TestFlow() {
  const searchParams = useSearchParams();
  const region = parseRegion(searchParams.get('region'));
  const mode = parseMode(searchParams.get('mode'));

  const [step, setStep] = useState<FlowStep>('loading');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [candidates, setCandidates] = useState<Restaurant[]>([]);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [resultId, setResultId] = useState<string | null>(null);

  const loadRestaurants = useCallback(async () => {
    setStep('loading');
    const data = await fetchRestaurantsByRegion(region);
    setRestaurants(data);
    setStep('browse');
  }, [region]);

  useEffect(() => {
    loadRestaurants();
    // region이 바뀌면(쿼리 파라미터 변경) 전체 플로우를 리셋한다.
  }, [loadRestaurants]);

  useEffect(() => {
    const flush = () => void flushPendingTestResults();
    const flushWhenVisible = () => {
      if (document.visibilityState === 'visible') flush();
    };

    flush();
    window.addEventListener('online', flush);
    document.addEventListener('visibilitychange', flushWhenVisible);
    return () => {
      window.removeEventListener('online', flush);
      document.removeEventListener('visibilitychange', flushWhenVisible);
    };
  }, []);

  function handleStartTournament(selected: Restaurant[]) {
    setCandidates(selected);
    setStartedAt(Date.now());
    setStep('tournament');
  }

  function handleTournamentComplete(finalWinner: Restaurant) {
    const elapsed = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 0;
    setWinner(finalWinner);
    setDurationSeconds(elapsed);
    setStep('result');

    const id = createTestResult({
      region,
      interaction_mode: mode,
      selected_restaurant_id: finalWinner.id,
      duration_seconds: elapsed,
      is_completed: true,
    });
    setResultId(id);
  }

  function handleRestart() {
    setCandidates([]);
    setWinner(null);
    setStartedAt(null);
    setDurationSeconds(0);
    setResultId(null);
    setStep('browse');
  }

  if (step === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
        <p className="text-sm text-ink-muted">{getCopy(region).loading}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        region={region}
        mode={mode}
        step={step === 'browse' ? 'browse' : step === 'tournament' ? 'tournament' : 'result'}
      />

      {step === 'browse' &&
        (mode === 'swipe' ? (
          <SwipeMode region={region} restaurants={restaurants} onStart={handleStartTournament} />
        ) : (
          <SelectMode region={region} restaurants={restaurants} onStart={handleStartTournament} />
        ))}

      {step === 'tournament' && (
        <Tournament region={region} restaurants={candidates} onComplete={handleTournamentComplete} />
      )}

      {step === 'result' && winner && (
        <ResultScreen
          region={region}
          winner={winner}
          durationSeconds={durationSeconds}
          resultId={resultId}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
