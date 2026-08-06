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
      intro: '시작 안내',
      browse: '후보 선별',
      tournament: '1:1 토너먼트',
      result: '결과 발표',
    },
    intro: {
      modeLabel: {
        select: '리스트 선택 모드',
        swipe: '스와이프 선택 모드',
      },
      title: '오늘의 맛집을 골라볼까요?',
      description: {
        select: '마음에 드는 후보를 리스트에서 고른 뒤 토너먼트로 최종 맛집을 정해보세요.',
        swipe: '카드를 좌우로 넘겨 후보를 고른 뒤 토너먼트로 최종 맛집을 정해보세요.',
      },
      cta: '시작하기',
    },
    select: {
      subtitle: (n: number) => `토너먼트에 넣을 후보를 골라주세요 (${n}개 선택됨)`,
      cta: (n: number) => `선택한 ${n}개로 토너먼트 시작`,
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
      title: '서비스 개선을 위한 설문조사',
      q1: '메뉴/식당을 못 정해서 고민한 적, 최근 한 달에 몇 번쯤 있었나요?',
      q1Options: ['거의 매번', '가끔', '거의 없음'],
      q2: '지금까지는 주로 어떻게 정하셨나요?',
      q2Options: ['친구/동행인 추천', '리뷰 앱', '그냥 아무거나', 'SNS/유튜브 검색', '기타'],
      q3: '메뉴/식당을 고를 때 가장 스트레스받는 순간은?',
      q3Options: ['결정 어려움', '메뉴 반복', '동행인 의견 충돌', '기타'],
      q4: '오늘 추천 결과가 마음에 드셨나요?',
      q4Options: ['완전 만족!', '보통이에요', '별로예요'],
      q5: '친구/동료에게 추천할 의향이 있나요? (0~10점)',
      npsLow: '전혀 없음',
      npsHigh: '매우 높음',
      improvementLabel: '아쉬운 점이 있다면 알려주세요. (선택)',
      improvementPlaceholder: '서비스가 더 좋아지려면 무엇이 필요할까요?',
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
      intro: 'Get Started',
      browse: 'Pick Candidates',
      tournament: '1:1 Tournament',
      result: 'Result',
    },
    intro: {
      modeLabel: {
        select: 'List Selection',
        swipe: 'Swipe Selection',
      },
      title: 'Ready to pick a restaurant?',
      description: {
        select: 'Choose candidates from the list, then find your final pick in a quick tournament.',
        swipe: 'Swipe through the cards to keep candidates, then find your final pick in a quick tournament.',
      },
      cta: 'Get Started',
    },
    select: {
      subtitle: (n: number) => `Pick your tournament candidates (${n} selected)`,
      cta: (n: number) => `Start tournament with ${n} picks`,
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
      title: 'Survey to help us improve the service',
      q1: 'How often in the past month did you have trouble choosing a menu or restaurant?',
      q1Options: ['Almost every time', 'Sometimes', 'Rarely'],
      q2: 'How did you usually decide until now?',
      q2Options: ['Friend recommendation', 'Review app', 'Pick anything', 'Social media/YouTube', 'Other'],
      q3: 'What is the most stressful part of choosing a menu or restaurant?',
      q3Options: ['Difficulty deciding', 'Repeating meals', 'Conflicting opinions', 'Other'],
      q4: "Were you happy with today's recommendation?",
      q4Options: ['Very satisfied!', 'It was okay', 'Not satisfied'],
      q5: 'How likely are you to recommend this to a friend or colleague? (0–10)',
      npsLow: 'Not at all',
      npsHigh: 'Very likely',
      improvementLabel: 'What could be improved? (Optional)',
      improvementPlaceholder: 'Tell us what would make the service better',
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
