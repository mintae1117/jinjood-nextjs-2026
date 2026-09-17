-- =====================================================
-- 관리자 상품 편집 마이그레이션 (2026-09-14)
-- Supabase SQL Editor에서 1회 실행. 재실행 안전(IF NOT EXISTS / DROP IF EXISTS).
-- 설계: docs/superpowers/specs/2026-09-14-admin-product-edit-design.md
-- =====================================================

-- -----------------------------------------------------
-- 1. user_profiles.role
-- -----------------------------------------------------
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('user', 'admin'));

-- -----------------------------------------------------
-- 1b. role 권한 상승 방지
--  기존 정책 "Users can insert/update own profile"이 본인 행의 모든 컬럼을 허용하므로,
--  브라우저 세션(auth.uid() IS NOT NULL)에서는 role을 바꿀 수 없게 트리거로 막는다.
--  SQL Editor / 서비스 롤(auth.uid() IS NULL)은 통과 → 관리자 지정은 SQL Editor에서만.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_user_profiles_role()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'user';
    ELSIF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'role은 변경할 수 없습니다' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_profiles_role ON user_profiles;
CREATE TRIGGER protect_user_profiles_role
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_profiles_role();

-- -----------------------------------------------------
-- 2. 관리자 판별 함수
--  RLS 정책 안에서 user_profiles를 직접 조회하면 그 테이블의 RLS("본인 행만")와 엮여
--  평가가 꼬이므로 SECURITY DEFINER 함수로 감싼다.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- -----------------------------------------------------
-- 3. 상품 테이블 RLS — 관리자 전체 조회 + 수정
--  SELECT 정책이 필수인 이유: 기존 정책이 USING (is_active = true)라서
--  노출 off한 상품이 관리자에게도 안 보여 다시 켤 수 없다. permissive 정책은 OR로 합쳐진다.
--  INSERT/DELETE 정책은 만들지 않는다 → 추가/삭제 원천 차단.
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all menu_items" ON menu_items;
CREATE POLICY "Admins can view all menu_items"
  ON menu_items FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update menu_items" ON menu_items;
CREATE POLICY "Admins can update menu_items"
  ON menu_items FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all gift_sets" ON gift_sets;
CREATE POLICY "Admins can view all gift_sets"
  ON gift_sets FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update gift_sets" ON gift_sets;
CREATE POLICY "Admins can update gift_sets"
  ON gift_sets FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all reciprocate_items" ON reciprocate_items;
CREATE POLICY "Admins can view all reciprocate_items"
  ON reciprocate_items FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update reciprocate_items" ON reciprocate_items;
CREATE POLICY "Admins can update reciprocate_items"
  ON reciprocate_items FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- -----------------------------------------------------
-- 3b. 컬럼 단위 쓰기 권한 — 정책은 "누가"만 보고 "어느 컬럼"은 안 본다
--  RLS 정책은 관리자 여부만 판정하므로, 관리자 세션으로 요청을 편집하면
--  name·category·image_url 같은 편집 대상 아닌 컬럼까지 바꿀 수 있다.
--  Postgres 컬럼 GRANT로 편집 가능 4컬럼 밖을 DB가 직접 거부하게 만든다.
--  (브라우저에서 바로 UPDATE 하는 구조라 클라이언트 화이트리스트만으로는 부족)
--  참고: 상품 추가/삭제는 정책 부재로 이미 막히지만, 권한도 함께 회수해 의도를 명시한다.
--  참고: image_url 은 admin_image.sql(2026-09-17)에서 GRANT UPDATE 를 추가했다 — 편집 가능 컬럼은 총 5개.
-- -----------------------------------------------------
REVOKE INSERT, UPDATE, DELETE ON menu_items         FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON gift_sets          FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON reciprocate_items  FROM anon, authenticated;

GRANT UPDATE (price, description, is_active)        ON menu_items        TO authenticated;
GRANT UPDATE (price, description, is_active, items) ON gift_sets         TO authenticated;
GRANT UPDATE (price, description, is_active)        ON reciprocate_items TO authenticated;

-- -----------------------------------------------------
-- 4. 가격 범위 CHECK — 브라우저 검증이 우회돼도 DB가 거부
--  (실패하면 SELECT name, price FROM <table> WHERE price <= 0 OR price > 1000000 로 위반 행 확인)
-- -----------------------------------------------------
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_price_range;
ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_price_range CHECK (price > 0 AND price <= 1000000);

ALTER TABLE gift_sets DROP CONSTRAINT IF EXISTS gift_sets_price_range;
ALTER TABLE gift_sets
  ADD CONSTRAINT gift_sets_price_range CHECK (price > 0 AND price <= 1000000);

ALTER TABLE reciprocate_items DROP CONSTRAINT IF EXISTS reciprocate_items_price_range;
ALTER TABLE reciprocate_items
  ADD CONSTRAINT reciprocate_items_price_range CHECK (price > 0 AND price <= 1000000);

-- -----------------------------------------------------
-- 5. 변경 이력 테이블 + 자동 적재 트리거
--  트리거라서 클라이언트가 빼먹을 수 없고, SQL Editor에서 직접 고쳐도 남는다(changed_by NULL).
--  RLS: 관리자만 SELECT. INSERT/UPDATE/DELETE 정책 없음 → 트리거(SECURITY DEFINER)만 쓴다.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS product_revisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL CHECK (table_name IN ('menu_items', 'gift_sets', 'reciprocate_items')),
  record_id UUID NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  before JSONB NOT NULL,
  after JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_revisions_record
  ON product_revisions(table_name, record_id, changed_at DESC);

ALTER TABLE product_revisions ENABLE ROW LEVEL SECURITY;

-- 이력 테이블은 SECURITY DEFINER 트리거만 쓴다(소유자 권한으로 실행되므로 영향 없음). 3b 참고.
REVOKE INSERT, UPDATE, DELETE ON product_revisions FROM anon, authenticated;

DROP POLICY IF EXISTS "Admins can view product_revisions" ON product_revisions;
CREATE POLICY "Admins can view product_revisions"
  ON product_revisions FOR SELECT TO authenticated
  USING (public.is_admin());

-- AFTER UPDATE인 이유: 기존 update_*_updated_at이 BEFORE 트리거라 AFTER 시점의 NEW에는
-- 갱신된 updated_at이 들어 있다. 비교에서 updated_at을 빼는 건 "값이 안 바뀐 UPDATE"를 제외하기 위함.
CREATE OR REPLACE FUNCTION public.log_product_revision()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (to_jsonb(OLD) - 'updated_at') IS DISTINCT FROM (to_jsonb(NEW) - 'updated_at') THEN
    INSERT INTO product_revisions (table_name, record_id, changed_by, before, after)
    VALUES (TG_TABLE_NAME, OLD.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_menu_items_revision ON menu_items;
CREATE TRIGGER log_menu_items_revision
  AFTER UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION public.log_product_revision();

DROP TRIGGER IF EXISTS log_gift_sets_revision ON gift_sets;
CREATE TRIGGER log_gift_sets_revision
  AFTER UPDATE ON gift_sets
  FOR EACH ROW EXECUTE FUNCTION public.log_product_revision();

DROP TRIGGER IF EXISTS log_reciprocate_items_revision ON reciprocate_items;
CREATE TRIGGER log_reciprocate_items_revision
  AFTER UPDATE ON reciprocate_items
  FOR EACH ROW EXECUTE FUNCTION public.log_product_revision();

-- -----------------------------------------------------
-- 6. (운영 절차, 1회) 사장님 계정을 관리자로 지정 — README "관리자 상품 편집" 참고
--  user_profiles 행은 로그인만으로는 생기지 않는다(프로필 이미지 업로드 시 saveDbAvatarUrl이 upsert).
--  그래서 UPDATE가 아니라 INSERT … ON CONFLICT로 지정한다(행이 있든 없든 한 번에 됨).
--  SQL Editor는 auth.uid()가 NULL이라 protect_user_profiles_role 트리거를 통과한다.
--
--   INSERT INTO user_profiles (user_id, role)
--   SELECT id, 'admin' FROM auth.users WHERE email = '<사장님 이메일>'
--   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
-- -----------------------------------------------------

-- =====================================================
-- 롤백 (필요 시 주석 해제 후 실행). 코드는 git revert, DB는 이 블록.
-- role 컬럼과 product_revisions 테이블은 데이터가 있으므로 DROP하지 않는다.
-- =====================================================
-- DROP TRIGGER IF EXISTS log_menu_items_revision ON menu_items;
-- DROP TRIGGER IF EXISTS log_gift_sets_revision ON gift_sets;
-- DROP TRIGGER IF EXISTS log_reciprocate_items_revision ON reciprocate_items;
-- DROP FUNCTION IF EXISTS public.log_product_revision();
--
-- DROP POLICY IF EXISTS "Admins can view product_revisions" ON product_revisions;
-- DROP POLICY IF EXISTS "Admins can view all menu_items" ON menu_items;
-- DROP POLICY IF EXISTS "Admins can update menu_items" ON menu_items;
-- DROP POLICY IF EXISTS "Admins can view all gift_sets" ON gift_sets;
-- DROP POLICY IF EXISTS "Admins can update gift_sets" ON gift_sets;
-- DROP POLICY IF EXISTS "Admins can view all reciprocate_items" ON reciprocate_items;
-- DROP POLICY IF EXISTS "Admins can update reciprocate_items" ON reciprocate_items;
--
-- ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_price_range;
-- ALTER TABLE gift_sets DROP CONSTRAINT IF EXISTS gift_sets_price_range;
-- ALTER TABLE reciprocate_items DROP CONSTRAINT IF EXISTS reciprocate_items_price_range;
--
-- -- 컬럼 GRANT 되돌리기: 마이그레이션 전 상태(테이블 전체 권한)로 복원
-- GRANT INSERT, UPDATE, DELETE ON menu_items, gift_sets, reciprocate_items TO anon, authenticated;
--
-- DROP FUNCTION IF EXISTS public.is_admin();
-- DROP TRIGGER IF EXISTS protect_user_profiles_role ON user_profiles;
-- DROP FUNCTION IF EXISTS public.protect_user_profiles_role();
-- -- (role 컬럼, product_revisions 테이블은 유지)
