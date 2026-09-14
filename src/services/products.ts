import { supabase } from '@/lib/supabase';
import { MenuItem, GiftSet, ReciprocateItem } from '@/types';

/** 상품 조회 옵션. includeInactive는 관리자만 true로 넘긴다(RLS가 관리자에게만 비활성 행을 허용) */
export interface ProductQueryOptions {
  includeInactive?: boolean;
}

/**
 * 상품 관련 API 서비스
 */
export const productService = {
  /**
   * 메뉴 아이템 목록 조회
   */
  async getMenuItems(category?: string, options: ProductQueryOptions = {}): Promise<MenuItem[]> {
    let query = supabase
      .from('menu_items')
      .select('*')
      .order('display_order');

    if (!options.includeInactive) {
      query = query.eq('is_active', true);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching menu items:', error);
      throw new Error(`메뉴를 불러오는데 실패했습니다: ${error.message}`);
    }

    return data as MenuItem[];
  },

  /**
   * 단일 메뉴 아이템 조회
   */
  async getMenuItem(id: string, options: ProductQueryOptions = {}): Promise<MenuItem | null> {
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('id', id);

    if (!options.includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching menu item:', error);
      return null;
    }

    return data as MenuItem;
  },

  /**
   * 단일 선물세트 조회
   */
  async getGiftSet(id: string, options: ProductQueryOptions = {}): Promise<GiftSet | null> {
    let query = supabase
      .from('gift_sets')
      .select('*')
      .eq('id', id);

    if (!options.includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching gift set:', error);
      return null;
    }

    return data as GiftSet;
  },

  /**
   * 선물세트 목록 조회
   */
  async getGiftSets(category?: string, options: ProductQueryOptions = {}): Promise<GiftSet[]> {
    let query = supabase
      .from('gift_sets')
      .select('*')
      .order('display_order');

    if (!options.includeInactive) {
      query = query.eq('is_active', true);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching gift sets:', error);
      throw new Error(`선물세트를 불러오는데 실패했습니다: ${error.message}`);
    }

    return data as GiftSet[];
  },

  /**
   * 단일 이바지/답례 아이템 조회
   */
  async getReciprocateItem(id: string, options: ProductQueryOptions = {}): Promise<ReciprocateItem | null> {
    let query = supabase
      .from('reciprocate_items')
      .select('*')
      .eq('id', id);

    if (!options.includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching reciprocate item:', error);
      return null;
    }

    return data as ReciprocateItem;
  },

  /**
   * 이바지/답례 아이템 목록 조회
   */
  async getReciprocateItems(category?: string, options: ProductQueryOptions = {}): Promise<ReciprocateItem[]> {
    let query = supabase
      .from('reciprocate_items')
      .select('*')
      .order('display_order');

    if (!options.includeInactive) {
      query = query.eq('is_active', true);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reciprocate items:', error);
      throw new Error(`이바지/답례 상품을 불러오는데 실패했습니다: ${error.message}`);
    }

    return data as ReciprocateItem[];
  },

  /**
   * 인기 메뉴 조회
   */
  async getPopularItems(limit: number = 9): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .or('is_popular.eq.true,is_recommended.eq.true,is_best.eq.true')
      .order('display_order')
      .limit(limit);

    if (error) {
      console.error('Error fetching popular items:', error);
      throw new Error(`인기 메뉴를 불러오는데 실패했습니다: ${error.message}`);
    }

    return data as MenuItem[];
  },
};
