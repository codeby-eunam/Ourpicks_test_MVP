// Google Places API(시애틀) + Kakao 로컬 API(영남대) 로 지정된 특정 가게 목록의 데이터를 가져와
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
// 1) 영남대 상권 - 사용자가 지정한 16곳 (이름/카테고리는 그대로 사용)
//    Kakao 로컬 API(키워드 검색)는 "실제 존재하는 곳인지 확인" 용도로만 호출한다.
//    문서: https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword
//    주의: Kakao 로컬 API는 별점(rating)/사진을 제공하지 않으므로 placeholder로 채운다.
// ------------------------------------------------------------------
const YEONGNAM_CENTER = { lat: 35.8286, lng: 128.7519 }; // 영남대학교 정문 부근

const YEONGNAM_PLACES = [
  { name: '손시스시', category: '초밥, 롤' },
  { name: '청춘양식당', category: '양식' },
  { name: '초원댁', category: '한식' },
  { name: '오늘김해뒷고기 영남대점', category: '육류, 고기요리' },
  { name: '에이바이트키친 영남대점', category: '양식' },
  { name: '해쉬', category: '양식' },
  { name: '육회바른연어 영남대점', category: '요리주점' },
  { name: '롯데리아 영남대DT점', category: '햄버거' },
  { name: '듀얼몬스터 본점', category: '양식' },
  { name: '그리다빵 영남대본점', category: '베이커리' },
  { name: '88식당', category: '돈가스' },
  { name: 'KFC 영남대점', category: '햄버거' },
  { name: '써브웨이 경산영남대점', category: '샌드위치' },
  { name: '환도네 영남대점', category: '육류, 고기요리' },
  { name: '연화반점', category: '중식당' },
  { name: '비비비 경산영남대점', category: '양식' },
];

async function verifyKakaoPlace({ name }) {
  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
  url.searchParams.set('query', name);
  url.searchParams.set('x', String(YEONGNAM_CENTER.lng));
  url.searchParams.set('y', String(YEONGNAM_CENTER.lat));
  url.searchParams.set('radius', '3000'); // 영남대 반경 3km 내로 후보를 좁힘
  url.searchParams.set('size', '1');

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
  });
  if (!res.ok) {
    console.warn(`[kakao] "${name}" 요청 실패 (${res.status})`);
    return null;
  }
  const json = await res.json();
  return json.documents?.[0] ?? null;
}

async function buildYeongnamRow(place) {
  const matched = KAKAO_KEY ? await verifyKakaoPlace(place) : null;
  if (matched) {
    console.log(`  [kakao 확인됨] ${place.name} ≈ "${matched.place_name}" (${matched.road_address_name || matched.address_name})`);
  } else {
    console.warn(`  [kakao 매칭 실패] "${place.name}" - 이름/카테고리는 입력값 그대로 저장합니다.`);
  }

  return {
    region: 'yeongnam',
    name: place.name,
    category: place.category,
    // Kakao 로컬 API는 사진을 제공하지 않으므로 이름을 시드로 한 placeholder 이미지를 사용.
    image_url: `https://picsum.photos/seed/${encodeURIComponent(place.name)}/600/450`,
    rating: Number((4.0 + Math.random() * 0.6).toFixed(1)),
  };
}

// ------------------------------------------------------------------
// 2) 시애틀 다운타운 - 사용자가 준 구글맵 URL 16개에서 추출한 정확한 이름 + 좌표
//    Google Places "Find Place From Text" API를 좌표로 강하게 바이어스해서
//    URL에 있던 바로 그 가게를 정확히 매칭한다 (이름/평점/사진을 한 번에 받아옴).
//    문서: https://developers.google.com/maps/documentation/places/web-service/search-find-place
// ------------------------------------------------------------------
const SEATTLE_PLACES = [
  { name: "Ludi's Restaurant", category: 'Filipino', lat: 47.610944, lng: -122.3407198 },
  { name: 'Skalka', category: 'Georgian Bakery', lat: 47.6049225, lng: -122.3377708 },
  { name: "Von's 1000Spirits", category: 'American/Bar', lat: 47.6066052, lng: -122.3384085 },
  { name: 'The Crumpet Shop', category: 'Bakery/Cafe', lat: 47.6090398, lng: -122.3405168 },
  { name: 'Lonely Siren', category: 'Seafood/Oyster Bar', lat: 47.608559, lng: -122.3407461 },
  { name: 'Pike Place Chowder', category: 'Seafood', lat: 47.6094243, lng: -122.3412192 },
  { name: 'The Pink Door', category: 'Italian', lat: 47.6103652, lng: -122.3425604 },
  { name: 'Radiator Whiskey', category: 'American/Whiskey Bar', lat: 47.608994, lng: -122.3405592 },
  { name: "Vivienne's Bistro", category: 'French/Bistro', lat: 47.5877341, lng: -122.2380464 },
  { name: 'Shaker + Spear', category: 'Pacific Northwest/Seafood', lat: 47.6120663, lng: -122.3416672 },
  { name: 'FareStart Restaurant', category: 'American', lat: 47.615362, lng: -122.337398 },
  { name: 'Sushi Katsu-ya (Seattle)', category: 'Japanese/Sushi', lat: 47.6193103, lng: -122.3382151 },
  { name: 'Zig Zag Cafe', category: 'Cocktail Bar', lat: 47.6083333, lng: -122.3416667 },
  { name: '2120', category: 'New American', lat: 47.6156966, lng: -122.3402339 },
  { name: 'Charlotte Restaurant & Lounge', category: 'American/Lounge', lat: 47.6055078, lng: -122.3312475 },
  { name: 'The Capital Grille', category: 'Steakhouse', lat: 47.608256, lng: -122.335198 },
];

async function buildSeattleRow(place) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', place.name);
  url.searchParams.set('inputtype', 'textquery');
  // 반경 100m 원으로 좌표를 강하게 바이어스 -> URL에서 뽑은 그 지점의 가게로 정확히 매칭
  url.searchParams.set('locationbias', `circle:100@${place.lat},${place.lng}`);
  url.searchParams.set('fields', 'place_id,name,rating,photos');
  url.searchParams.set('key', GOOGLE_KEY);

  const res = await fetch(url);
  const json = await res.json();
  const candidate = json.candidates?.[0];

  if (json.status !== 'OK' || !candidate) {
    console.warn(`  [google 매칭 실패] "${place.name}" (status: ${json.status}) - placeholder로 대체합니다.`);
    return {
      region: 'seattle',
      name: place.name,
      category: place.category,
      image_url: `https://picsum.photos/seed/${encodeURIComponent(place.name)}/600/450`,
      rating: 4.0,
    };
  }

  console.log(`  [google 확인됨] ${place.name} → "${candidate.name}" (rating: ${candidate.rating ?? '없음'})`);

  // Google이 실제로 사진을 갖고 있으면 Place Photo API URL을 그대로 image_url로 저장한다.
  // (이 URL은 브라우저가 화면에 그릴 때마다 구글 Photo API를 직접 호출하는 방식 - 구글이 <img src>로
  //  바로 쓰라고 설계한 정상적인 사용법이다. 실서비스로 키울 땐 이 API 키에 HTTP 리퍼러 제한을
  //  걸어 우리 도메인에서만 쓰이게 해두는 걸 권장.)
  let imageUrl = `https://picsum.photos/seed/${encodeURIComponent(place.name)}/600/450`;
  const photoRef = candidate.photos?.[0]?.photo_reference;
  if (photoRef) {
    const photoUrl = new URL('https://maps.googleapis.com/maps/api/place/photo');
    photoUrl.searchParams.set('maxwidth', '800');
    photoUrl.searchParams.set('photo_reference', photoRef);
    photoUrl.searchParams.set('key', GOOGLE_KEY);
    imageUrl = photoUrl.toString();
  }

  return {
    region: 'seattle',
    name: candidate.name || place.name,
    category: place.category,
    image_url: imageUrl,
    rating: candidate.rating ?? 4.0,
  };
}

// ------------------------------------------------------------------
// 3) 실행: 두 지역 데이터를 모아서 region별로 갈아끼운다 (delete-then-insert)
// ------------------------------------------------------------------
async function main() {
  const rows = [];

  if (KAKAO_KEY) {
    console.log('--- 영남대 (Kakao) ---');
    for (const place of YEONGNAM_PLACES) {
      rows.push(await buildYeongnamRow(place));
    }
  } else {
    console.warn('KAKAO_REST_API_KEY 가 없어 영남대 데이터는 건너뜁니다.');
  }

  if (GOOGLE_KEY) {
    console.log('--- 시애틀 (Google) ---');
    for (const place of SEATTLE_PLACES) {
      rows.push(await buildSeattleRow(place));
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

  console.log(`\n완료! ${rows.length}개 식당을 저장했습니다.`);
  for (const r of rows) console.log(`  - [${r.region}] ${r.name} (${r.category}) ★${r.rating}`);
}

main();
