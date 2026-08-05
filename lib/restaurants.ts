import { supabase } from './supabaseClient';
import { Region, Restaurant } from './types';
import { getMockRestaurantsByRegion } from './mockRestaurants';

/**
 * region에 해당하는 식당 목록을 Supabase에서 불러온다.
 * 연결 실패/데이터 없음 등 어떤 이유로든 빈 결과가 오면 데모가 끊기지 않도록
 * mock 데이터로 자동 폴백한다.
 */
export async function fetchRestaurantsByRegion(
  region: Region
): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('region', region)
      .order('rating', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data as Restaurant[];

    return getMockRestaurantsByRegion(region);
  } catch (err) {
    console.warn('[restaurants] Supabase 조회 실패, mock 데이터로 대체합니다.', err);
    return getMockRestaurantsByRegion(region);
  }
}
