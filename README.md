# 오늘 뭐 먹지? — Picks Test MVP

체크박스/스와이프로 식당 후보를 고르고, 1:1 토너먼트로 최종 한 곳을 정한 뒤 3초 퀵 설문까지 받는 모바일 최적화 단일 페이지 MVP.

## 기술 스택
- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS
- lucide-react (아이콘)
- Supabase JS Client (`@supabase/supabase-js`)

## 시작하기

```bash
npm install
cp .env.local.example .env.local
```

`.env.local`에 Supabase 프로젝트의 URL / anon key를 채워주세요.

```bash
npm run dev
```

`http://localhost:3000` 접속 시 데모 진입 링크가 보이고, 실제 플로우는 `/test` 경로에서 동작합니다.

### URL 파라미터

```
/test?region=yeongnam&mode=select
/test?region=yeongnam&mode=swipe
/test?region=seattle&mode=select
/test?region=seattle&mode=swipe
```

- `region`: `yeongnam`(기본값) | `seattle`
- `mode`: `select`(기본값) | `swipe`

## Supabase 설정

`supabase/schema.sql`을 Supabase SQL Editor에 그대로 붙여넣고 실행하면
- `restaurants`, `test_results` 테이블 생성
- RLS 정책 (익명 read/insert/update 허용 — MVP 데모용)
- `lib/mockRestaurants.ts`와 동일한 id로 맞춘 시드 데이터 18건 삽입

이 한 번에 끝납니다. Supabase 연결이 안 되어 있거나 데이터가 비어 있어도
`lib/restaurants.ts`가 자동으로 mock 데이터로 폴백하므로 로컬 데모는 항상 동작합니다.

## 폴더 구조

```
app/
  page.tsx            데모 진입 랜딩 페이지
  test/
    page.tsx           /test 라우트 (Suspense 래퍼)
    TestFlow.tsx        화면 전환 상태 머신 (browse → tournament → result)
components/
  Header.tsx
  SelectMode.tsx        Screen1 - 체크박스 리스트 모드
  SwipeMode.tsx         Screen1 - 스와이프 모드
  Tournament.tsx        Screen2 - 1:1 토너먼트 브라켓
  ResultScreen.tsx       Screen3 - 결과 발표
  SurveyForm.tsx         Screen3 - 3초 퀵 설문
  RestaurantCard.tsx     카드 UI (compact/large)
lib/
  types.ts
  supabaseClient.ts
  restaurants.ts         restaurants 조회 (+ mock 폴백)
  testResults.ts         test_results insert/update
  mockRestaurants.ts      데모/폴백용 시드 데이터
supabase/
  schema.sql             테이블 + RLS + 시드 데이터
```

## 배포 (Vercel)

1. GitHub 레포에 push
2. Vercel에서 Import → 이 레포 선택
3. 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등록
4. Deploy
