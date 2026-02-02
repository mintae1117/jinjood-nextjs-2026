import { supabase } from '@/lib/supabase';
import { Banner } from '@/types';

/**
 * 배너 관련 API 서비스
 */
export const bannerService = {
  /**
   * 활성화된 배너 목록 조회
   */
  async getBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching banners:', error);
      throw new Error(`배너를 불러오는데 실패했습니다: ${error.message}`);
    }

    return data as Banner[];
  },

  /**
   * 단일 배너 조회
   */
  async getBanner(id: string): Promise<Banner | null> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching banner:', error);
      return null;
    }

    return data as Banner;
  },
};
