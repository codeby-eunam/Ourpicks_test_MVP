import { supabase } from './supabaseClient';
import { SurveyAnswers, TestResultInsert } from './types';

const STORAGE_KEY = 'picks.pending-test-results.v1';
const MAX_QUEUE_SIZE = 500;
const MAX_BACKOFF_MS = 60_000;

type InsertOperation = {
  queueId: string;
  type: 'insert';
  resultId: string;
  payload: TestResultInsert;
  attempts: number;
  nextAttemptAt: number;
};

type SurveyOperation = {
  queueId: string;
  type: 'survey';
  resultId: string;
  payload: SurveyAnswers;
  attempts: number;
  nextAttemptAt: number;
};

type PendingOperation = InsertOperation | SurveyOperation;

let isFlushing = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function readQueue(): PendingOperation[] {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as PendingOperation[]) : [];
  } catch (error) {
    console.warn('[testResults] 로컬 저장 큐를 읽지 못했습니다.', error);
    return [];
  }
}

function writeQueue(queue: PendingOperation[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (queue.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
    return true;
  } catch (error) {
    console.error('[testResults] 로컬 저장 큐를 기록하지 못했습니다.', error);
    return false;
  }
}

function enqueue(operation: PendingOperation): boolean {
  const queue = readQueue();
  if (queue.length >= MAX_QUEUE_SIZE) {
    console.error('[testResults] 로컬 저장 큐가 가득 찼습니다.');
    return false;
  }
  queue.push(operation);
  return writeQueue(queue);
}

function retryDelay(attempts: number): number {
  const ceiling = Math.min(MAX_BACKOFF_MS, 1_000 * 2 ** Math.min(attempts, 6));
  // Full-width jitter prevents many clients that received 429 together from
  // retrying in another synchronized burst.
  return Math.floor(ceiling / 2 + Math.random() * (ceiling / 2));
}

function isRetryable(error: unknown): boolean {
  if (!error || typeof error !== 'object') return true;

  const candidate = error as { code?: string; message?: string; status?: number };
  const code = candidate.code ?? '';
  const message = (candidate.message ?? '').toLowerCase();
  const status = candidate.status ?? 0;

  return (
    status === 429 ||
    status >= 500 ||
    code.startsWith('08') ||
    code.startsWith('40') ||
    code.startsWith('53') ||
    code === '57P01' ||
    code === 'PGRST003' ||
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('fetch')
  );
}

async function execute(operation: PendingOperation): Promise<unknown | null> {
  try {
    if (operation.type === 'insert') {
      const { error } = await supabase.from('test_results').insert({
        id: operation.resultId,
        region: operation.payload.region,
        interaction_mode: operation.payload.interaction_mode,
        selected_restaurant_id: operation.payload.selected_restaurant_id,
        duration_seconds: operation.payload.duration_seconds,
        is_completed: operation.payload.is_completed,
      });
      return error;
    }

    const { error } = await supabase
      .from('test_results')
      .update({
        survey_frequency: operation.payload.survey_frequency,
        survey_decision_method: operation.payload.survey_decision_method,
        survey_pain_point: operation.payload.survey_pain_point,
        survey_satisfaction: operation.payload.survey_satisfaction,
        survey_nps_score: operation.payload.survey_nps_score,
        survey_improvement_feedback: operation.payload.survey_improvement_feedback,
      })
      .eq('id', operation.resultId);

    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      const { error: fallbackError } = await supabase
        .from('test_results')
        .update({ survey_q2_painpoint: JSON.stringify(operation.payload) })
        .eq('id', operation.resultId);
      return fallbackError;
    }

    return error;
  } catch (error) {
    return error;
  }
}

function scheduleNextFlush(queue: PendingOperation[]) {
  if (typeof window === 'undefined' || queue.length === 0) return;
  if (flushTimer) clearTimeout(flushTimer);

  const insertRetryAt = new Map(
    queue
      .filter((item): item is InsertOperation => item.type === 'insert')
      .map((item) => [item.resultId, item.nextAttemptAt])
  );
  const earliest = Math.min(
    ...queue.map((item) =>
      item.type === 'survey' && insertRetryAt.has(item.resultId)
        ? Math.max(item.nextAttemptAt, insertRetryAt.get(item.resultId)!)
        : item.nextAttemptAt
    )
  );
  const delay = Math.max(250, earliest - Date.now());
  flushTimer = setTimeout(() => void flushPendingTestResults(), delay);
}

/**
 * 저장 대기 작업을 순차 처리한다. 같은 결과의 insert가 남아 있는 동안에는
 * survey update를 보내지 않아, 혼잡 상황에서도 저장 순서가 뒤집히지 않는다.
 */
export async function flushPendingTestResults(): Promise<void> {
  if (typeof window === 'undefined' || isFlushing || !navigator.onLine) return;

  isFlushing = true;
  try {
    let queue = readQueue();

    for (const operation of [...queue]) {
      if (operation.nextAttemptAt > Date.now()) continue;

      const waitingForInsert =
        operation.type === 'survey' &&
        queue.some(
          (item) => item.type === 'insert' && item.resultId === operation.resultId
        );
      if (waitingForInsert) continue;

      const error = await execute(operation);
      queue = readQueue();
      const currentIndex = queue.findIndex(
        (item) => item.queueId === operation.queueId
      );
      if (currentIndex === -1) continue;

      const duplicateInsert =
        operation.type === 'insert' &&
        typeof error === 'object' &&
        error !== null &&
        (error as { code?: string }).code === '23505';

      // A timed-out insert may have reached the database even when its response
      // was lost. The client-generated primary key makes that retry idempotent.
      if (!error || duplicateInsert) {
        queue.splice(currentIndex, 1);
      } else if (isRetryable(error)) {
        const attempts = queue[currentIndex].attempts + 1;
        queue[currentIndex] = {
          ...queue[currentIndex],
          attempts,
          nextAttemptAt: Date.now() + retryDelay(attempts),
        };
        console.warn('[testResults] 일시적 저장 실패로 재시도합니다.', error);
      } else {
        queue.splice(currentIndex, 1);
        console.error('[testResults] 재시도할 수 없는 저장 오류입니다.', error);
      }

      writeQueue(queue);
    }

    scheduleNextFlush(readQueue());
  } finally {
    isFlushing = false;
  }
}

/**
 * 결과를 먼저 로컬 큐에 영속화하고 즉시 id를 반환한다. 실제 Supabase 저장은
 * 백그라운드에서 처리되므로 429나 네트워크 지연이 화면 진행을 막지 않는다.
 */
export function createTestResult(payload: TestResultInsert): string {
  const resultId = crypto.randomUUID();
  const operation: InsertOperation = {
    queueId: crypto.randomUUID(),
    type: 'insert',
    resultId,
    payload,
    attempts: 0,
    nextAttemptAt: Date.now(),
  };
  const queued = enqueue(operation);

  if (queued) {
    void flushPendingTestResults();
  } else {
    console.error('[testResults] 결과를 저장 큐에 추가하지 못했습니다.');
    void execute(operation);
  }
  return resultId;
}

/** 설문도 로컬 큐에 먼저 저장하고 백그라운드에서 전송한다. */
export async function submitSurvey(
  resultId: string,
  answers: SurveyAnswers
): Promise<boolean> {
  const operation: SurveyOperation = {
    queueId: crypto.randomUUID(),
    type: 'survey',
    resultId,
    payload: answers,
    attempts: 0,
    nextAttemptAt: Date.now(),
  };
  const queued = enqueue(operation);

  if (queued) {
    void flushPendingTestResults();
  } else {
    void execute(operation);
  }
  return queued;
}
