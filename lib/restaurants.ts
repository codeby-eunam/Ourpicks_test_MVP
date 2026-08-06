import { supabase } from './supabaseClient';
import { Region, Restaurant } from './types';
import { getMockRestaurantsByRegion } from './mockRestaurants';

const useRemoteRestaurants =
  process.env.NEXT_PUBLIC_USE_REMOTE_RESTAURANTS === 'true';

/**
 * region에 해당하는 식당 목록을 반환한다.
 * 기본값은 API 비용이 없는 번들 데이터이며, 원격 목록을 활성화한 경우에만
 * Supabase를 조회한다. 연결 실패나 빈 결과에는 번들 데이터로 폴백한다.
 */
export async function fetchRestaurantsByRegion(
  region: Region
): Promise<Restaurant[]> {
  // The restaurant catalog is small and changes infrequently. Serve the copy
  // bundled with the app by default so opening the test does not create a
  // Supabase request for every visitor. Set NEXT_PUBLIC_USE_REMOTE_RESTAURANTS
  // to "true" only when the catalog needs to be managed from Supabase.
  if (!useRemoteRestaurants) {
    return getMockRestaurantsByRegion(region);
  }

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
