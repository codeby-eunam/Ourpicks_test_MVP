import { Region } from './types';

/**
 * region별 UI 문구 사전. Seattle은 전부 영어, 영남대는 한국어로 노출한다.
 * (식당 이름/카테고리 등 데이터 자체는 lib/mockRestaurants.ts / Supabase 데이터를 그대로 쓴다.)
 */
const COPY = {
  yeongnam: {
    modeGuide: {
      select: '리스트에서 후보를 체크해보세요',
      swipe: '카드를 넘기며 후보를 골라보세요',
    },
    stepLabel: {
      browse: '후보 선별',
      tournament: '1:1 토너먼트',
      result: '결과 발표',
    },
    select: {
      subtitle: (n: number) => `토너먼트에 넣을 후보를 골라주세요 (${n}개 선택됨)`,
      cta: (n: number) => `선택한 ${n}개로 토너먼트 시작 (10초 소요)`,
    },
    swipe: {
      progress: (i: number, total: number) => `${i} / ${total}`,
      doneLabel: '모든 카드를 확인했어요',
      keptLabel: (n: number) => `후보 ${n}개 담김`,
      doneTitle: '카드를 다 봤어요!',
      doneSubtitle: (n: number) => `담은 후보 ${n}개로 토너먼트를 시작할 수 있어요.`,
      skipAria: '건너뛰기',
      keepAria: '후보 추가',
      ctaReady: (n: number) => `담은 ${n}개로 토너먼트 시작 (10초 소요)`,
      ctaNotReady: (min: number, n: number) => `${min}개 이상 담으면 시작할 수 있어요 (${n}/${min})`,
    },
    tournament: {
      roundLabel: (n: number) => (n <= 2 ? '결승' : n <= 4 ? '4강' : n <= 8 ? '8강' : `${n}강`),
      matchProgress: (cur: number, total: number) => `${cur} / ${total} 매치`,
      preparing: '다음 대결을 준비하는 중...',
      prompt: '마음에 드는 쪽을 눌러주세요',
    },
    result: {
      lead: '오늘 추천 점심은',
      durationLabel: '고민 해결까지 걸린 시간:',
      durationUnit: '초',
      restart: '처음부터 다시 하기',
    },
    survey: {
      title: '3초 퀵 설문에 답해주세요',
      q1: '이 서비스로 메뉴 선택이 더 쉬워졌나요?',
      q2Label: '평소 메뉴 고를 때 가장 짜증 나는 점은?',
      q2Placeholder: '예: 매번 같은 메뉴만 먹게 돼요',
      q3: '오늘 우승 가게 10% 할인 쿠폰을 준다면 바로 가시겠습니까?',
      yes: 'Yes',
      no: 'No',
      submit: '설문 제출하기',
      submitting: '제출 중...',
      thanksTitle: '설문 감사해요! 🎉',
      thanksSubtitle: '소중한 의견 덕분에 더 나은 서비스를 만들 수 있어요.',
    },
    loading: '맛집을 불러오는 중...',
  },
  seattle: {
    modeGuide: {
      select: 'Check off your candidates from the list',
      swipe: 'Swipe through cards to pick your candidates',
    },
    stepLabel: {
      browse: 'Pick Candidates',
      tournament: '1:1 Tournament',
      result: 'Result',
    },
    select: {
      subtitle: (n: number) => `Pick your tournament candidates (${n} selected)`,
      cta: (n: number) => `Start tournament with ${n} picks (~10 sec)`,
    },
    swipe: {
      progress: (i: number, total: number) => `${i} / ${total}`,
      doneLabel: "You've reviewed all the cards",
      keptLabel: (n: number) => `${n} candidates kept`,
      doneTitle: "You've gone through all the cards!",
      doneSubtitle: (n: number) => `You can start the tournament with your ${n} kept candidates.`,
      skipAria: 'Skip',
      keepAria: 'Keep',
      ctaReady: (n: number) => `Start tournament with ${n} picks (~10 sec)`,
      ctaNotReady: (min: number, n: number) => `Keep at least ${min} to start (${n}/${min})`,
    },
    tournament: {
      roundLabel: (n: number) =>
        n <= 2 ? 'Final' : n <= 4 ? 'Semifinal' : n <= 8 ? 'Quarterfinal' : `Round of ${n}`,
      matchProgress: (cur: number, total: number) => `Match ${cur} / ${total}`,
      preparing: 'Preparing the next match...',
      prompt: 'Tap the one you like better',
    },
    result: {
      lead: "Today's pick for lunch is",
      durationLabel: 'Time to decide:',
      durationUnit: 's',
      restart: 'Start Over',
    },
    survey: {
      title: 'Quick 3-second survey',
      q1: 'Did this make choosing a restaurant easier?',
      q2Label: "What's the most annoying part of picking where to eat?",
      q2Placeholder: 'e.g. I always end up at the same place',
      q3: "If we gave you a 10% coupon for today's winner, would you go?",
      yes: 'Yes',
      no: 'No',
      submit: 'Submit Survey',
      submitting: 'Submitting...',
      thanksTitle: 'Thanks for the feedback! 🎉',
      thanksSubtitle: 'Your input helps us build a better experience.',
    },
    loading: 'Loading restaurants...',
  },
} as const;

export function getCopy(region: Region) {
  return COPY[region];
}

export type Copy = ReturnType<typeof getCopy>;
