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
SET search_path = public
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
SET search_path = public
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

DROP POLICY IF EXISTS "Admins can view product_revisions" ON product_revisions;
CREATE POLICY "Admins can view product_revisions"
  ON product_revisions FOR SELECT TO authenticated
  USING (public.is_admin());

-- AFTER UPDATE인 이유: 기존 update_*_updated_at이 BEFORE 트리거라 AFTER 시점의 NEW에는
-- 갱신된 updated_at이 들어 있다. 비교에서 updated_at을 빼는 건 "값이 안 바뀐 UPDATE"를 제외하기 위함.
CREATE OR REPLACE FUNCTION public.log_product_revision()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
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
--  사장님이 사이트에서 로그인을 한 번 하면 user_profiles 행이 생긴다. 그 뒤:
--   UPDATE user_profiles SET role = 'admin'
--   WHERE user_id = (SELECT id FROM auth.users WHERE email = '<사장님 이메일>');
--  행이 아직 없으면:
--   INSERT INTO user_profiles (user_id, role)
--   VALUES ((SELECT id FROM auth.users WHERE email = '<사장님 이메일>'), 'admin');
-- -----------------------------------------------------
