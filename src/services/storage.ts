import { supabase } from "@/lib/supabase";
import { PRODUCT_IMAGE_PREFIX, buildProductImagePath, type ProductTable } from "@/utils/adminProduct";

/**
 * 관리자 상품 이미지 Storage API.
 * 모달 밖에 두는 이유: 후속 "상품 추가"(INSERT 전 업로드, 실패 시 회수)와 "삭제"(파일 정리)가 같은 함수를 쓴다.
 * 권한은 Storage 정책(storage_policies.sql: products/ 아래는 is_admin() 만)이 최종 판정.
 */

const BUCKET = "images";

// storage-js 의 StorageApiError 는 status(number)·statusCode(string) 를 갖지만 타입이 느슨하다
function toFriendlyStorageError(error: { message: string; status?: number; statusCode?: string | number }): Error {
  const status = String(error.status ?? error.statusCode ?? "");
  if (status === "403" || /row-level security|unauthorized|not allowed/i.test(error.message)) {
    return new Error("이미지 업로드 권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.");
  }
  return new Error(`이미지 업로드에 실패했습니다: ${error.message}`);
}

export const storageService = {
  /** products/<table>/<uuid>.<ext> 에 올리고 DB 에 저장할 상대 경로를 돌려준다 */
  async uploadProductImage(table: ProductTable, blob: Blob, ext: string): Promise<string> {
    const path = buildProductImagePath(table, ext);
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type || undefined,
      // 이름이 매번 고유하므로 오래 캐시해도 안전하고, 덮어쓰기가 필요 없다
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      console.error("Error uploading product image:", error);
      throw toFriendlyStorageError(error);
    }
    return path;
  },

  /**
   * 업로드 뒤 UPDATE 가 실패했을 때 방금 올린 파일을 회수한다(후속 상품 삭제 흐름도 재사용).
   * best-effort — 실패해도 던지지 않는다. products/ 밖(레거시 menu/…)은 건드리지 않는다.
   */
  async removeProductImage(path: string): Promise<void> {
    if (!path.startsWith(`${PRODUCT_IMAGE_PREFIX}/`)) return;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) console.error("Error removing product image:", error);
  },
};
