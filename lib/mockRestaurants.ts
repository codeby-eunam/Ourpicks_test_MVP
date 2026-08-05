import { Restaurant } from './types';

/**
 * Supabase에 아직 데이터가 없거나 연결이 실패했을 때 사용하는 데모용 fallback 데이터.
 * 여기 있는 id들은 supabase/schema.sql의 seed INSERT 구문과 동일하게 맞춰져 있으므로,
 * 실제 DB를 이 스키마로 세팅하면 동일한 id로 자연스럽게 이어진다.
 */
export const MOCK_RESTAURANTS: Restaurant[] = [
  // ---------- yeongnam ----------
  {
    id: '11111111-1111-4111-8111-111111111101',
    region: 'yeongnam',
    name: '영남곱창',
    category: '곱창/막창',
    image_url: 'https://picsum.photos/seed/yeongnam-gopchang/600/450',
    rating: 4.5,
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    region: 'yeongnam',
    name: '경산 국밥집',
    category: '한식/국밥',
    image_url: 'https://picsum.photos/seed/yeongnam-gukbap/600/450',
    rating: 4.3,
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    region: 'yeongnam',
    name: '대학로 돈까스',
    category: '일식/돈까스',
    image_url: 'https://picsum.photos/seed/yeongnam-donkatsu/600/450',
    rating: 4.2,
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    region: 'yeongnam',
    name: '청춘 마라탕',
    category: '중식/마라탕',
    image_url: 'https://picsum.photos/seed/yeongnam-malatang/600/450',
    rating: 4.4,
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    region: 'yeongnam',
    name: '학교앞 김밥천국',
    category: '분식',
    image_url: 'https://picsum.photos/seed/yeongnam-kimbap/600/450',
    rating: 4.0,
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    region: 'yeongnam',
    name: '영남 파스타',
    category: '양식/파스타',
    image_url: 'https://picsum.photos/seed/yeongnam-pasta/600/450',
    rating: 4.1,
  },
  {
    id: '11111111-1111-4111-8111-111111111107',
    region: 'yeongnam',
    name: '불타는 닭갈비',
    category: '한식/닭갈비',
    image_url: 'https://picsum.photos/seed/yeongnam-dakgalbi/600/450',
    rating: 4.6,
  },
  {
    id: '11111111-1111-4111-8111-111111111108',
    region: 'yeongnam',
    name: '샐러디 프레시',
    category: '샐러드/건강식',
    image_url: 'https://picsum.photos/seed/yeongnam-salad/600/450',
    rating: 4.0,
  },
  {
    id: '11111111-1111-4111-8111-111111111109',
    region: 'yeongnam',
    name: '정문 초밥',
    category: '일식/초밥',
    image_url: 'https://picsum.photos/seed/yeongnam-sushi/600/450',
    rating: 4.3,
  },
  // ---------- seattle ----------
  {
    id: '22222222-2222-4222-8222-222222222201',
    region: 'seattle',
    name: 'Pike Place Chowder',
    category: 'Seafood',
    image_url: 'https://picsum.photos/seed/seattle-chowder/600/450',
    rating: 4.7,
  },
  {
    id: '22222222-2222-4222-8222-222222222202',
    region: 'seattle',
    name: 'Din Tai Fung',
    category: 'Taiwanese',
    image_url: 'https://picsum.photos/seed/seattle-dintaifung/600/450',
    rating: 4.6,
  },
  {
    id: '22222222-2222-4222-8222-222222222203',
    region: 'seattle',
    name: 'Biscuit Bitch',
    category: 'Brunch',
    image_url: 'https://picsum.photos/seed/seattle-biscuit/600/450',
    rating: 4.4,
  },
  {
    id: '22222222-2222-4222-8222-222222222204',
    region: 'seattle',
    name: 'Momiji',
    category: 'Japanese/Sushi',
    image_url: 'https://picsum.photos/seed/seattle-momiji/600/450',
    rating: 4.5,
  },
  {
    id: '22222222-2222-4222-8222-222222222205',
    region: 'seattle',
    name: "Salumi Artisan Cured Meats",
    category: 'Deli/Sandwich',
    image_url: 'https://picsum.photos/seed/seattle-salumi/600/450',
    rating: 4.5,
  },
  {
    id: '22222222-2222-4222-8222-222222222206',
    region: 'seattle',
    name: 'Taylor Shellfish Oyster Bar',
    category: 'Seafood/Oyster',
    image_url: 'https://picsum.photos/seed/seattle-oyster/600/450',
    rating: 4.6,
  },
  {
    id: '22222222-2222-4222-8222-222222222207',
    region: 'seattle',
    name: 'Shawarma King',
    category: 'Middle Eastern',
    image_url: 'https://picsum.photos/seed/seattle-shawarma/600/450',
    rating: 4.3,
  },
  {
    id: '22222222-2222-4222-8222-222222222208',
    region: 'seattle',
    name: 'Ivar\'s Fish Bar',
    category: 'Seafood/Fish&Chips',
    image_url: 'https://picsum.photos/seed/seattle-ivars/600/450',
    rating: 4.2,
  },
  {
    id: '22222222-2222-4222-8222-222222222209',
    region: 'seattle',
    name: 'Cactus Restaurant',
    category: 'Southwest/Mexican',
    image_url: 'https://picsum.photos/seed/seattle-cactus/600/450',
    rating: 4.4,
  },
];

export function getMockRestaurantsByRegion(region: string): Restaurant[] {
  return MOCK_RESTAURANTS.filter((r) => r.region === region);
}
