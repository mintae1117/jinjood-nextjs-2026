-- =====================================================
-- 관리자 상품 이미지 교체 마이그레이션 (2026-09-17). Supabase SQL Editor에서 1회 실행. 재실행 안전.
-- 설계: docs/superpowers/specs/2026-09-17-admin-product-image-design.md §4-2
-- 선행: admin_edit.sql (RLS·is_admin·컬럼 GRANT 4개), storage_policies.sql (products/ 업로드 권한)
-- =====================================================

-- -----------------------------------------------------
-- 1. 편집 가능 컬럼에 image_url 추가 (admin_edit.sql §3b 컬럼 GRANT 확장). RLS UPDATE 정책은 이미 관리자 한정.
-- -----------------------------------------------------
GRANT UPDATE (image_url) ON menu_items        TO authenticated;
GRANT UPDATE (image_url) ON gift_sets         TO authenticated;
GRANT UPDATE (image_url) ON reciprocate_items TO authenticated;

-- -----------------------------------------------------
-- 2. 사전 확인 — 아래 CHECK 를 위반하는 기존 행. 정상 데이터(menu/…, /images/…)는 전부 0.
--    0이 아니면 그 행의 image_url 을 먼저 고친 뒤 3을 실행한다.
-- -----------------------------------------------------
SELECT 'menu_items' AS t, count(*) FROM menu_items        WHERE image_url LIKE '%://%' OR image_url LIKE '%..%'
UNION ALL SELECT 'gift_sets', count(*) FROM gift_sets     WHERE image_url LIKE '%://%' OR image_url LIKE '%..%'
UNION ALL SELECT 'reciprocate_items', count(*) FROM reciprocate_items WHERE image_url LIKE '%://%' OR image_url LIKE '%..%';

-- -----------------------------------------------------
-- 3. 외부 URL·경로 탈출 차단 — 관리자 세션이 탈취돼도 DB 가 거부한다.
--    상대 경로(menu/…, products/…, 레거시 /images/…)는 전부 통과하는 느슨한 규칙이라 기존 행을 막지 않는다.
--    클라이언트(validateImagePath)도 같은 규칙.
-- -----------------------------------------------------
ALTER TABLE menu_items        DROP CONSTRAINT IF EXISTS menu_items_image_url_path;
ALTER TABLE menu_items        ADD  CONSTRAINT menu_items_image_url_path
  CHECK (image_url IS NULL OR (image_url NOT LIKE '%://%' AND image_url NOT LIKE '%..%'));

ALTER TABLE gift_sets         DROP CONSTRAINT IF EXISTS gift_sets_image_url_path;
ALTER TABLE gift_sets         ADD  CONSTRAINT gift_sets_image_url_path
  CHECK (image_url IS NULL OR (image_url NOT LIKE '%://%' AND image_url NOT LIKE '%..%'));

ALTER TABLE reciprocate_items DROP CONSTRAINT IF EXISTS reciprocate_items_image_url_path;
ALTER TABLE reciprocate_items ADD  CONSTRAINT reciprocate_items_image_url_path
  CHECK (image_url IS NULL OR (image_url NOT LIKE '%://%' AND image_url NOT LIKE '%..%'));

-- 이력: admin_edit.sql 의 log_product_revision 트리거가 행 전체를 JSONB 로 남기므로 image_url 변경도 자동 기록. 추가 작업 없음.

-- =====================================================
-- 롤백 (필요 시 주석 해제 후 실행). 올라간 products/ 파일과 image_url 값은 데이터라 건드리지 않는다.
-- =====================================================
-- REVOKE UPDATE (image_url) ON menu_items, gift_sets, reciprocate_items FROM authenticated;
-- ALTER TABLE menu_items        DROP CONSTRAINT IF EXISTS menu_items_image_url_path;
-- ALTER TABLE gift_sets         DROP CONSTRAINT IF EXISTS gift_sets_image_url_path;
-- ALTER TABLE reciprocate_items DROP CONSTRAINT IF EXISTS reciprocate_items_image_url_path;
