-- ============================================================
-- Picks Test MVP - Supabase Schema
-- Supabase SQL Editor에서 그대로 실행하면 됩니다.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 1. restaurants
-- ---------------------------------------------------------
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  region text not null check (region in ('yeongnam', 'seattle')),
  name text not null,
  category text not null,
  image_url text not null,
  rating numeric(2, 1) not null default 4.0,
  created_at timestamptz not null default now()
);

alter table public.restaurants enable row level security;

-- 데모용 공개 앱이므로 누구나(anon) 읽기만 허용
create policy "restaurants are viewable by everyone"
  on public.restaurants for select
  using (true);

-- ---------------------------------------------------------
-- 2. test_results
-- ---------------------------------------------------------
create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  region text not null check (region in ('yeongnam', 'seattle')),
  interaction_mode text not null check (interaction_mode in ('select', 'swipe')),
  selected_restaurant_id uuid, -- 의도적으로 FK 미설정: mock 데이터로도 테스트 가능하도록 유연하게 둠
  duration_seconds int not null default 0,
  is_completed boolean not null default false,
  survey_q1_help boolean,
  survey_q2_painpoint text,
  survey_q3_coupon boolean,
  survey_frequency text,
  survey_decision_method text,
  survey_pain_point text,
  survey_satisfaction text,
  survey_nps_score smallint check (survey_nps_score between 0 and 10),
  survey_improvement_feedback text,
  created_at timestamptz not null default now()
);

-- 기존 프로젝트에도 새 설문 컬럼을 안전하게 추가한다.
alter table public.test_results add column if not exists survey_frequency text;
alter table public.test_results add column if not exists survey_decision_method text;
alter table public.test_results add column if not exists survey_pain_point text;
alter table public.test_results add column if not exists survey_satisfaction text;
alter table public.test_results add column if not exists survey_nps_score smallint check (survey_nps_score between 0 and 10);
alter table public.test_results add column if not exists survey_improvement_feedback text;

alter table public.test_results enable row level security;

-- 익명 사용자가 토너먼트 결과를 기록할 수 있도록 insert 허용
create policy "anyone can insert test results"
  on public.test_results for insert
  with check (true);

-- 익명 사용자가 본인이 방금 만든 row에 설문 답변을 update 할 수 있도록 허용
-- (MVP 단계이므로 row 소유권 검증 없이 전체 허용 - 운영 전환 시 auth 붙여서 강화 필요)
create policy "anyone can update test results"
  on public.test_results for update
  using (true)
  with check (true);

create policy "anyone can read test results"
  on public.test_results for select
  using (true);

-- ---------------------------------------------------------
-- 3. Seed data (lib/mockRestaurants.ts 와 동일한 id로 맞춰둠)
-- ---------------------------------------------------------
insert into public.restaurants (id, region, name, category, image_url, rating) values
  ('11111111-1111-4111-8111-111111111101', 'yeongnam', '영남곱창', '곱창/막창', 'https://picsum.photos/seed/yeongnam-gopchang/600/450', 4.5),
  ('11111111-1111-4111-8111-111111111102', 'yeongnam', '경산 국밥집', '한식/국밥', 'https://picsum.photos/seed/yeongnam-gukbap/600/450', 4.3),
  ('11111111-1111-4111-8111-111111111103', 'yeongnam', '대학로 돈까스', '일식/돈까스', 'https://picsum.photos/seed/yeongnam-donkatsu/600/450', 4.2),
  ('11111111-1111-4111-8111-111111111104', 'yeongnam', '청춘 마라탕', '중식/마라탕', 'https://picsum.photos/seed/yeongnam-malatang/600/450', 4.4),
  ('11111111-1111-4111-8111-111111111105', 'yeongnam', '학교앞 김밥천국', '분식', 'https://picsum.photos/seed/yeongnam-kimbap/600/450', 4.0),
  ('11111111-1111-4111-8111-111111111106', 'yeongnam', '영남 파스타', '양식/파스타', 'https://picsum.photos/seed/yeongnam-pasta/600/450', 4.1),
  ('11111111-1111-4111-8111-111111111107', 'yeongnam', '불타는 닭갈비', '한식/닭갈비', 'https://picsum.photos/seed/yeongnam-dakgalbi/600/450', 4.6),
  ('11111111-1111-4111-8111-111111111108', 'yeongnam', '샐러디 프레시', '샐러드/건강식', 'https://picsum.photos/seed/yeongnam-salad/600/450', 4.0),
  ('11111111-1111-4111-8111-111111111109', 'yeongnam', '정문 초밥', '일식/초밥', 'https://picsum.photos/seed/yeongnam-sushi/600/450', 4.3),
  ('22222222-2222-4222-8222-222222222201', 'seattle', 'Pike Place Chowder', 'Seafood', 'https://picsum.photos/seed/seattle-chowder/600/450', 4.7),
  ('22222222-2222-4222-8222-222222222202', 'seattle', 'Din Tai Fung', 'Taiwanese', 'https://picsum.photos/seed/seattle-dintaifung/600/450', 4.6),
  ('22222222-2222-4222-8222-222222222203', 'seattle', 'Biscuit Bitch', 'Brunch', 'https://picsum.photos/seed/seattle-biscuit/600/450', 4.4),
  ('22222222-2222-4222-8222-222222222204', 'seattle', 'Momiji', 'Japanese/Sushi', 'https://picsum.photos/seed/seattle-momiji/600/450', 4.5),
  ('22222222-2222-4222-8222-222222222205', 'seattle', 'Salumi Artisan Cured Meats', 'Deli/Sandwich', 'https://picsum.photos/seed/seattle-salumi/600/450', 4.5),
  ('22222222-2222-4222-8222-222222222206', 'seattle', 'Taylor Shellfish Oyster Bar', 'Seafood/Oyster', 'https://picsum.photos/seed/seattle-oyster/600/450', 4.6),
  ('22222222-2222-4222-8222-222222222207', 'seattle', 'Shawarma King', 'Middle Eastern', 'https://picsum.photos/seed/seattle-shawarma/600/450', 4.3),
  ('22222222-2222-4222-8222-222222222208', 'seattle', 'Ivar''s Fish Bar', 'Seafood/Fish&Chips', 'https://picsum.photos/seed/seattle-ivars/600/450', 4.2),
  ('22222222-2222-4222-8222-222222222209', 'seattle', 'Cactus Restaurant', 'Southwest/Mexican', 'https://picsum.photos/seed/seattle-cactus/600/450', 4.4)
on conflict (id) do nothing;
