import { supabase } from '@/lib/supabase';
import type { EditableProductPatch, ProductRevision, ProductType } from '@/types';
import { PRODUCT_TABLES, pickEditablePatch, validatePatch } from '@/utils/adminProduct';

/**
 * 관리자 상품 편집 API
 * 브라우저에서 Supabase로 바로 UPDATE 한다. 권한은 RLS(is_admin())가, 값 범위는 DB CHECK가 최종 판정.
 * 여기서 하는 검증은 사용자에게 빨리 알려주기 위한 것.
 */

// PostgREST/Postgres 에러를 사용자 메시지로
function toFriendlyError(error: { code?: string; message: string }): Error {
  switch (error.code) {
    case 'PGRST116': // .single()인데 0행 → RLS가 막았거나 상품이 없음
    case '42501':    // insufficient_privilege
      return new Error('수정 권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.');
    case '23514':    // check_violation — 제약 이름으로 가른다 (price_range / image_url_path)
      return error.message.includes('image_url_path')
        ? new Error('이미지 경로 형식이 잘못되었습니다.')
        : new Error('가격은 1원 이상 1,000,000원 이하여야 합니다.');
    default:
      return new Error(`상품 수정에 실패했습니다: ${error.message}`);
  }
}

export const adminService = {
  /**
   * 상품 수정. patch에서 편집 가능 컬럼(price, description, is_active, items[gift_set만])만 통과시킨다.
   */
  async updateProduct(
    productType: ProductType,
    id: string,
    patch: EditableProductPatch,
  ): Promise<void> {
    const safePatch = pickEditablePatch(productType, patch as Record<string, unknown>);

    const validationError = validatePatch(safePatch);
    if (validationError) throw new Error(validationError);

    if (Object.keys(safePatch).length === 0) {
      throw new Error('변경된 내용이 없습니다.');
    }

    // .select().single()을 붙여야 RLS에 막혀 0행 갱신됐을 때 에러로 감지된다
    const { error } = await supabase
      .from(PRODUCT_TABLES[productType])
      .update(safePatch)
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw toFriendlyError(error);
    }
  },

  /**
   * 최근 수정 이력 (최신순). 관리자가 아니면 RLS 때문에 빈 배열이 온다.
   */
  async getRevisions(
    productType: ProductType,
    id: string,
    limit: number = 10,
  ): Promise<ProductRevision[]> {
    const { data, error } = await supabase
      .from('product_revisions')
      .select('*')
      .eq('table_name', PRODUCT_TABLES[productType])
      .eq('record_id', id)
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching revisions:', error);
      throw new Error(`수정 이력을 불러오는데 실패했습니다: ${error.message}`);
    }

    return (data ?? []) as ProductRevision[];
  },
};
