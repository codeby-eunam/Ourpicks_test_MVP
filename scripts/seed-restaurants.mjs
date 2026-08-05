// Google Places API(시애틀) + Kakao 로컬 API(영남대) 로 실제 맛집 데이터를 가져와
// Supabase restaurants 테이블에 채워 넣는 1회성 시드 스크립트.
//
// 실행 방법:
//   node scripts/seed-restaurants.mjs
//
// 필요한 환경변수 (.env.local 에 추가):
//   NEXT_PUBLIC_SUPABASE_URL       - Supabase 프로젝트 URL
//   SUPABASE_SERVICE_ROLE_KEY      - Supabase 프로젝트 설정 > API > service_role 키 (RLS 우회, 절대 클라이언트에 노출 금지)
//   GOOGLE_PLACES_API_KEY          - Google Cloud Console에서 발급한 Places API 키
//   KAKAO_REST_API_KEY             - Kakao Developers에서 발급한 REST API 키
//
// 이 스크립트는 서버(로컬/CI) 환경에서만 실행하세요. service_role 키는 절대 프론트엔드 코드나
// NEXT_PUBLIC_* 변수로 넣지 마세요.

import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// --- .env.local 을 수동으로 로드 (Next.js 앱 밖에서 실행되는 순수 Node 스크립트라 자동 로드가 안 됨) ---
function loadEnvLocal() {
  const path = new URL('../.env.local', import.meta.url);
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local에 필요합니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ------------------------------------------------------------------
// 1) 영남대 상권 - Kakao 로컬 API (키워드로 장소 검색)
//    문서: https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword
//    주의: Kakao 로컬 API는 별점(rating)/사진을 제공하지 않으므로 placeholder로 채운다.
// ------------------------------------------------------------------
const YEONGNAM_QUERIES = [
  { category: '한식', query: '영남대 한식 맛집' },
  { category: '분식', query: '영남대 분식' },
  { category: '고기/구이', query: '영남대 고기집' },
  { category: '카페/디저트', query: '영남대 카페' },
  { category: '일식', query: '영남대 돈까스' },
  { category: '중식', query: '영남대 마라탕' },
  { category: '양식', query: '영남대 파스타' },
  { category: '치킨', query: '영남대 치킨' },
];

async function fetchKakaoPlace({ category, query }) {
  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
  url.searchParams.set('query', query);
  url.searchParams.set('category_group_code', 'FD6'); // 음식점
  url.searchParams.set('size', '1');

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
  });
  if (!res.ok) {
    console.warn(`[kakao] "${query}" 요청 실패 (${res.status})`);
    return null;
  }
  const json = await res.json();
  const place = json.documents?.[0];
  if (!place) {
    console.warn(`[kakao] "${query}" 결과 없음`);
    return null;
  }

  return {
    region: 'yeongnam',
    name: place.place_name,
    category,
    // Kakao 로컬 API는 이미지가 없으므로 이름을 시드로 한 placeholder 이미지를 사용.
    // 실제 서비스에서는 카카오맵 장소 상세 페이지(place.place_url)를 참고해 관리자가 직접 사진을 등록하는 걸 권장.
    image_url: `https://picsum.photos/seed/${encodeURIComponent(place.place_name)}/600/450`,
    rating: Number((4.0 + Math.random() * 0.6).toFixed(1)),
  };
}

// ------------------------------------------------------------------
// 2) 시애틀 다운타운 - Google Places API (Text Search + Photo)
//    문서: https://developers.google.com/maps/documentation/places/web-service/search-text
// ------------------------------------------------------------------
const SEATTLE_QUERIES = [
  { category: 'Seafood', query: 'seafood restaurant in Seattle downtown' },
  { category: 'Japanese', query: 'sushi restaurant in Seattle downtown' },
  { category: 'Brunch', query: 'brunch restaurant in Seattle downtown' },
  { category: 'Deli/Sandwich', query: 'deli sandwich shop in Seattle downtown' },
  { category: 'Mexican', query: 'mexican restaurant in Seattle downtown' },
  { category: 'Middle Eastern', query: 'middle eastern restaurant in Seattle downtown' },
  { category: 'Taiwanese', query: 'taiwanese restaurant in Seattle downtown' },
  { category: 'Fish & Chips', query: 'fish and chips in Seattle downtown' },
];

async function fetchGooglePlace({ category, query }) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query);
  url.searchParams.set('key', GOOGLE_KEY);

  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== 'OK' || !json.results?.length) {
    console.warn(`[google] "${query}" 결과 없음 (status: ${json.status})`);
    return null;
  }
  const place = json.results[0];

  let imageUrl = `https://picsum.photos/seed/${encodeURIComponent(place.name)}/600/450`;
  const photoRef = place.photos?.[0]?.photo_reference;
  if (photoRef) {
    const photoUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
    photoUrl.searchParams.set('maxwidth', '600');
    photoUrl.searchParams.set('photo_reference', photoRef);
    photoUrl.searchParams.set('key', GOOGLE_KEY);
    imageUrl = photoUrl.toString();
  }

  return {
    region: 'seattle',
    name: place.name,
    category,
    image_url: imageUrl,
    rating: place.rating ?? 4.0,
  };
}

// ------------------------------------------------------------------
// 3) 실행: 두 지역 데이터를 모아서 region별로 갈아끼운다 (delete-then-insert)
// ------------------------------------------------------------------
async function main() {
  const rows = [];

  if (KAKAO_KEY) {
    for (const q of YEONGNAM_QUERIES) {
      const row = await fetchKakaoPlace(q);
      if (row) rows.push(row);
    }
  } else {
    console.warn('KAKAO_REST_API_KEY 가 없어 영남대 데이터는 건너뜁니다.');
  }

  if (GOOGLE_KEY) {
    for (const q of SEATTLE_QUERIES) {
      const row = await fetchGooglePlace(q);
      if (row) rows.push(row);
    }
  } else {
    console.warn('GOOGLE_PLACES_API_KEY 가 없어 시애틀 데이터는 건너뜁니다.');
  }

  if (rows.length === 0) {
    console.error('수집된 데이터가 없어 종료합니다.');
    process.exit(1);
  }

  const regionsToReplace = [...new Set(rows.map((r) => r.region))];
  for (const region of regionsToReplace) {
    const { error: deleteError } = await supabase
      .from('restaurants')
      .delete()
      .eq('region', region);
    if (deleteError) {
      console.error(`[supabase] ${region} 기존 데이터 삭제 실패:`, deleteError.message);
      process.exit(1);
    }
  }

  const { error: insertError } = await supabase.from('restaurants').insert(rows);
  if (insertError) {
    console.error('[supabase] insert 실패:', insertError.message);
    process.exit(1);
  }

  console.log(`완료! ${rows.length}개 식당을 저장했습니다.`);
  for (const r of rows) console.log(`  - [${r.region}] ${r.name} (${r.category})`);
}

main();
