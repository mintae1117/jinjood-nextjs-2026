# 관리자 상품 편집 (인라인 수정 버튼 + 모달) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자(`user_profiles.role = 'admin'`)로 로그인하면 상품 카드/상세에 "수정" 버튼이 보이고, 모달에서 가격·설명·구성품·노출 on/off를 고친 뒤 전/후 대조 confirm을 거쳐 브라우저에서 Supabase로 바로 UPDATE 한다.

**Architecture:** 전 화면이 클라이언트 렌더이고 상품 조회가 브라우저 Supabase 클라이언트로 이뤄지므로 쓰기도 같은 경로로 간다. **RLS가 유일한 보안 경계**(관리자 SELECT 전체 + UPDATE, INSERT/DELETE 정책 없음), 값 검증은 DB CHECK가 최종 방어선, 이력은 DB 트리거(`product_revisions`)가 자동 적재한다. Server Action / Service Role 키는 쓰지 않는다.

**Tech Stack:** Next.js 16.1.1 (App Router, 전부 `"use client"`), React 19.2.3, TypeScript strict, Styled Components 6 (`$` 접두사 props), Zustand 5 (`persist` → sessionStorage), `@supabase/ssr` 브라우저 클라이언트, react-icons `Fi*`.

**Spec:** `docs/superpowers/specs/2026-09-14-admin-product-edit-design.md`

## Global Constraints

- 모든 코드 주석·UI 문구·커밋 메시지는 **한국어** (CLAUDE.md).
- 편집 가능 컬럼은 **`price`, `description`, `is_active`, `items`(gift_sets만)** 네 개뿐. `name`·`category`·`image_url`·`display_order`·태그는 폼에도, 서비스 화이트리스트에도 넣지 않는다.
- 상품 INSERT/DELETE RLS 정책을 **만들지 않는다**. Service Role 키를 **쓰지 않는다**.
- 가격 범위: `price > 0 AND price <= 1000000` (DB CHECK + 클라이언트 동일 규칙).
- 개입 수량은 컬럼 분리 없이 `description` 문장 안에 유지(`(1되/40개입)`).
- 테스트 러너를 새로 들이지 않는다. 각 태스크 검증은 `npx tsc --noEmit` + `npm run lint`, DB는 SQL Editor 검증 스크립트, UI는 `npm run dev`(포트 3001) 수동 시나리오.
- 커밋 규칙: `<type>(<scope>): <subject>` (type: feat|fix|style|refactor|docs|chore, scope: auth|cart|checkout|product|order|board|ui). 커밋 메시지 끝에 현재 세션의 attribution 라인을 붙인다. 각 태스크 커밋 예시에는 이 문서 작성 시점 기준인 `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>` 이 들어 있으니, 실행 세션의 지시가 다르면 그쪽을 따른다.
- 기존 파일 패턴 준수: 서비스는 `console.error` + `throw new Error('한국어 메시지')`, 훅은 `useState`/`useCallback`/`useEffect` + `refetch`, 색상은 `#f35525`/`#d94820`/`#1e1e1e`/`#666666`/`#eeeeee`/`#f8f8f8` 하드코딩(기존 카드와 동일).
- Supabase SQL은 `uuid_generate_v4()`, `TIMEZONE('utc', NOW())`, 정책명 영문 문장형("Admins can update menu_items") 패턴.

## 파일 구조

| 구분 | 경로 | 책임 |
|---|---|---|
| 생성 | `supabase/admin_edit.sql` | role 컬럼·권한상승 방지 트리거·`is_admin()`·상품 RLS·CHECK·`product_revisions`+트리거 |
| 생성 | `supabase/admin_edit_verify.sql` | RLS/CHECK/트리거 검증 스크립트 (BEGIN…ROLLBACK) |
| 수정 | `supabase/seed_data.sql`, `supabase/cleanup_and_reseed.sql` | 상단 "초기 스냅샷" 주석 |
| 수정 | `CLAUDE.md`, `README.md` | 스키마 반영, 관리자 지정 절차 |
| 수정 | `src/types/index.ts` | `UserRole`, `User.role`, `EditableProductPatch`, `ProductRevision` |
| 수정 | `src/services/auth.ts` | `getDbProfile`, `buildUser`, 모든 User 생성 지점에서 role 로딩 |
| 수정 | `src/stores/authStore.ts`, `src/stores/index.ts` | `selectIsAdmin` |
| 수정 | `src/hooks/useAuth.ts` | `isAdmin` 노출 |
| 생성 | `src/utils/adminProduct.ts` | 테이블 매핑, 화이트리스트, 검증, diff, 표시 포맷 (순수 함수) |
| 수정 | `src/services/products.ts` | `includeInactive` 옵션 |
| 수정 | `src/hooks/useProducts.ts` | 관리자면 `includeInactive`, 단건 훅에 `refetch` |
| 생성 | `src/services/admin.ts` | `adminService.updateProduct` / `getRevisions` |
| 수정 | `src/services/index.ts` | `adminService` export |
| 생성 | `src/components/admin/ProductEditModal.tsx` | 2단계(편집→확인) 모달 + 이력/되돌리기, 포털 |
| 생성 | `src/components/admin/AdminEditButton.tsx` | 관리자만 렌더되는 버튼 + 숨김 배지 + 모달 소유 |
| 수정 | `src/components/menu/MenuCard.tsx`, `app/represent/page.tsx` | 카드 버튼 + refetch 연결 |
| 수정 | `app/gifts/page.tsx`, `app/reciprocate/page.tsx` | 카드 버튼 + refetch 연결 |
| 수정 | `src/components/product/ProductDetail.tsx`, `app/{represent,gifts,reciprocate}/[id]/page.tsx` | 상세 버튼 + refetch 연결 |

---

### Task 1: DB 마이그레이션 + 검증 스크립트 + 문서

**Files:**
- Create: `supabase/admin_edit.sql`
- Create: `supabase/admin_edit_verify.sql`
- Modify: `supabase/seed_data.sql:1-7`, `supabase/cleanup_and_reseed.sql:1-5` (상단 주석)
- Modify: `CLAUDE.md` ("## DB 스키마 (현재)" 블록), `README.md` (끝에 섹션 추가)

**Interfaces:**
- Produces (DB): `user_profiles.role TEXT`, `public.is_admin() → boolean`, 테이블 `product_revisions(id, table_name, record_id, changed_by, changed_at, before, after)`, 상품 3테이블에 관리자 SELECT/UPDATE 정책, `*_price_range` CHECK, `log_*_revision` AFTER UPDATE 트리거.
- 이후 Task 4의 `adminService.getRevisions`가 `product_revisions`를 `table_name`, `record_id`, `changed_at desc`로 조회한다.

- [ ] **Step 1: `supabase/admin_edit.sql` 작성**

```sql
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
```

- [ ] **Step 2: `supabase/admin_edit_verify.sql` 작성**

```sql
-- =====================================================
-- admin_edit.sql 검증 스크립트 — Supabase SQL Editor에서 실행
-- 전부 BEGIN … ROLLBACK 이라 실 데이터는 바뀌지 않는다.
-- <일반 유저 uuid>, <관리자 uuid>는 SELECT id, email FROM auth.users; 로 확인해 채운다.
-- 기대 결과는 각 줄 주석에 적어두었다. 하나라도 다르면 admin_edit.sql을 다시 확인한다.
-- =====================================================

-- (A) 비관리자 시뮬레이션
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<일반 유저 uuid>","role":"authenticated"}', true);

SELECT public.is_admin();                                              -- false
UPDATE menu_items SET price = 99999 WHERE name = '모찌';               -- UPDATE 0
SELECT count(*) FROM menu_items WHERE is_active = false;              -- 0 (비활성 안 보임)
SELECT count(*) FROM product_revisions;                               -- 0 (이력 안 보임)
UPDATE user_profiles SET role = 'admin' WHERE user_id = auth.uid();   -- ERROR 42501 "role은 변경할 수 없습니다"
ROLLBACK;

-- (B) 관리자 시뮬레이션 — 실행 전 관리자 uuid에 role='admin'이 이미 지정돼 있어야 한다
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);

SELECT public.is_admin();                                              -- true
UPDATE menu_items SET price = 99999 WHERE name = '모찌';               -- UPDATE 1
SELECT changed_by, before->>'price', after->>'price'
  FROM product_revisions ORDER BY changed_at DESC LIMIT 1;            -- <관리자 uuid>, 45000, 99999
UPDATE menu_items SET price = 99999 WHERE name = '모찌';               -- UPDATE 1 이지만 아래 count 그대로 (값 동일 → 이력 없음)
SELECT count(*) FROM product_revisions WHERE table_name = 'menu_items'
   AND record_id = (SELECT id FROM menu_items WHERE name = '모찌');    -- 1
SELECT count(*) FROM menu_items;                                      -- 전체 행 수 (비활성 포함)
INSERT INTO menu_items (name, price, category) VALUES ('검증용', 1000, 'others'); -- ERROR 42501 (INSERT 정책 없음)
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
DELETE FROM menu_items WHERE name = '모찌';                            -- DELETE 0 (DELETE 정책 없음)
UPDATE menu_items SET price = 0 WHERE name = '모찌';                   -- ERROR 23514 (menu_items_price_range)
ROLLBACK;

-- (C) SQL Editor(auth.uid() IS NULL) 직접 수정도 이력에 남는지
BEGIN;
UPDATE gift_sets SET price = price + 1 WHERE name = '떡국세트 1호';
SELECT changed_by, table_name FROM product_revisions ORDER BY changed_at DESC LIMIT 1; -- NULL, gift_sets
ROLLBACK;
```

- [ ] **Step 3: Supabase SQL Editor에서 `admin_edit.sql` 실행**

Supabase 대시보드 → SQL Editor → `supabase/admin_edit.sql` 전체 붙여넣기 → Run.
기대: 에러 없이 완료. (가격 CHECK에서 실패하면 4번 주석의 SELECT로 위반 행을 확인해 값을 먼저 고친 뒤 재실행.)

- [ ] **Step 4: 개발용 관리자 계정 지정 후 `admin_edit_verify.sql` 실행**

본인(개발자) 계정으로 사이트에 한 번 로그인해 `user_profiles` 행을 만든 뒤 SQL Editor에서:
```sql
UPDATE user_profiles SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = '<개발자 이메일>');
```
그다음 `admin_edit_verify.sql`의 `<uuid>` 두 곳을 채워 (A)(B)(C) 블록을 각각 실행.
기대: 각 줄 주석의 결과와 일치. 특히 (A)의 `UPDATE user_profiles … role` 이 **42501로 실패**해야 한다 — 이게 실패하지 않으면 권한 상승 구멍이 열린 것이니 멈추고 1b 트리거를 확인한다.

- [ ] **Step 5: 리포 SQL 파일 상단 주석 갱신**

`supabase/seed_data.sql` 1~7행의 헤더 주석을 다음으로 교체:
```sql
-- =====================================================
-- Jinjood 상품 데이터 Seed SQL (초기 구축용 스냅샷)
--
-- ⚠️ 2026-09-14 이후 이 파일은 실 데이터와 동기화하지 않는다.
--    실 데이터의 단일 출처는 라이브 DB이며(관리자가 사이트에서 직접 수정),
--    변경 이력은 product_revisions 테이블에 자동 적재된다.
--    새 환경 초기 구축에만 사용할 것.
--
-- 이미지 URL은 Supabase Storage에 업로드 후 수정 필요
-- 현재는 placeholder로 /images/... 경로 사용
-- =====================================================
```
`supabase/cleanup_and_reseed.sql` 1~4행을 다음으로 교체:
```sql
-- =====================================================
-- 중복 데이터 정리 및 재삽입 SQL (초기 구축용 스냅샷)
-- Supabase SQL Editor에서 실행하세요
--
-- ⚠️ 2026-09-14 이후 이 파일은 실 데이터와 동기화하지 않는다.
--    실 데이터의 단일 출처는 라이브 DB이며(관리자가 사이트에서 직접 수정),
--    변경 이력은 product_revisions 테이블에 자동 적재된다.
--    이 파일을 실행하면 관리자가 수정한 내용이 전부 사라진다. 새 환경 초기 구축에만 쓸 것.
-- =====================================================
```

- [ ] **Step 6: CLAUDE.md DB 스키마 블록 갱신**

`## DB 스키마 (현재)` 코드블록에서:
- `user_profiles (id, user_id FK→auth.users UNIQUE, avatar_url, created_at, updated_at)` →
  `user_profiles (id, user_id FK→auth.users UNIQUE, avatar_url, role 'user'|'admin', created_at, updated_at)`
  다음 줄에 `  -- role은 SQL Editor에서만 변경 가능(protect_user_profiles_role 트리거). 브라우저 세션은 변경 불가`
- 블록 끝에 추가:
  `product_revisions (id, table_name, record_id, changed_by FK→auth.users SET NULL, changed_at, before JSONB, after JSONB)`
  `  -- 상품 3테이블 AFTER UPDATE 트리거가 자동 적재. 관리자만 SELECT, 사람이 INSERT/DELETE 불가`
- 블록 아래 `> **미생성(결제 도입 시 필요)**` 문단의 `user_profiles`에는 `role` 컬럼 추가 예정(관리자 판별, §5.5-13)` 문구를 `user_profiles.role`은 2026-09-14 관리자 상품 편집에서 추가 완료 — Phase 4-D는 `public.is_admin()`을 재사용` 로 교체.
- `## 주요 개발 패턴` 끝에 소절 추가:

```markdown
### 관리자 상품 편집
- 판별: `useAuthStore(selectIsAdmin)` (`user.role === 'admin'`). 데이터 훅 안에서는 `useAuth()`를 부르지 않는다(초기화 부수효과).
- 버튼: `src/components/admin/AdminEditButton.tsx` — 관리자가 아니면 `null` 반환. 카드 3곳 + `ProductDetail` 1곳.
- 쓰기: `adminService.updateProduct(productType, id, patch)` — 브라우저에서 바로 UPDATE, **RLS가 유일한 보안 경계**. 화이트리스트 4컬럼(`price`, `description`, `is_active`, `items`)만 통과.
- 조회: 관리자는 `productService.get*(…, { includeInactive: true })`로 노출 off 상품도 본다.
- 이력: `product_revisions`는 DB 트리거가 적재. 되돌리기는 `before`의 4컬럼을 폼에 얹어 `updateProduct`를 다시 타는 것(별도 API 없음).
- 리포의 `seed_data.sql`/`cleanup_and_reseed.sql`은 초기 스냅샷 — 실 데이터와 동기화하지 않는다.
```

- [ ] **Step 7: README.md 끝에 운영 절차 추가**

```markdown

---

## 관리자 상품 편집 (운영 절차)

사장님이 사이트에서 직접 가격·설명·구성품·노출 여부를 고칠 수 있다. 설계: `docs/superpowers/specs/2026-09-14-admin-product-edit-design.md`

### 관리자 지정 (1회)
1. 사장님이 사이트에서 로그인(카카오/구글/이메일)을 한 번 한다 → `user_profiles` 행이 생긴다.
2. Supabase 대시보드 → SQL Editor:
   ```sql
   UPDATE user_profiles SET role = 'admin'
   WHERE user_id = (SELECT id FROM auth.users WHERE email = '<사장님 이메일>');
   ```
   행이 없다고 나오면(이메일 가입 직후 등):
   ```sql
   INSERT INTO user_profiles (user_id, role)
   VALUES ((SELECT id FROM auth.users WHERE email = '<사장님 이메일>'), 'admin');
   ```
3. 사장님이 사이트를 새로고침하면 상품 카드 우상단과 상세 페이지에 "수정" 버튼이 보인다.

> role은 SQL Editor에서만 바꿀 수 있다(브라우저 세션은 트리거가 차단). 관리자 해제는 `role = 'user'`로 UPDATE.

### 사용법
- 카드/상세의 수정 버튼 → 가격·설명·(선물세트) 구성품·노출 토글 → **저장** → 전/후 대조표 확인 → **확인하고 수정**.
- 개입 수량은 설명 문장 안의 `(1되/40개입)` 표기를 직접 고친다.
- 노출을 끈 상품은 일반 방문자에게 안 보이고, 관리자에게는 "숨김" 배지로 보인다.
- 모달 하단 "최근 수정 이력"에서 이전 값으로 되돌릴 수 있다(되돌린 것도 이력에 남음).

### 복구
- 잘못 고쳤으면 모달의 수정 이력에서 되돌리기. 이력은 `product_revisions` 테이블(관리자만 조회, 삭제 불가).
- `supabase/seed_data.sql`은 초기 스냅샷이며 실 데이터와 동기화되지 않는다 — 복구용으로 쓰지 말 것.
```

- [ ] **Step 8: 커밋**

```bash
git add supabase/admin_edit.sql supabase/admin_edit_verify.sql supabase/seed_data.sql supabase/cleanup_and_reseed.sql CLAUDE.md README.md
git commit -m "$(cat <<'EOF'
chore(supabase): 관리자 상품 편집용 role·RLS·CHECK·product_revisions 마이그레이션

- user_profiles.role + 브라우저 세션 role 변경 차단 트리거(권한 상승 방지)
- is_admin() SECURITY DEFINER, 상품 3테이블 관리자 SELECT/UPDATE 정책(INSERT/DELETE 없음)
- price 범위 CHECK, product_revisions AFTER UPDATE 자동 이력
- 검증 스크립트 admin_edit_verify.sql, seed SQL은 초기 스냅샷으로 명시, CLAUDE.md/README 반영

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: 타입 + 인증에 role 싣기

**Files:**
- Modify: `src/types/index.ts:118-126` (User), 파일 끝에 타입 추가
- Modify: `src/services/auth.ts` (전체 — `mapSupabaseUser`, `getDbAvatarUrl`→`getDbProfile`, `buildUser`, 6개 호출 지점)
- Modify: `src/stores/authStore.ts:48-50`, `src/stores/index.ts:1`
- Modify: `src/hooks/useAuth.ts:9-12, 229-243`

**Interfaces:**
- Produces:
  - `type UserRole = "user" | "admin"`, `User.role?: UserRole`
  - `type EditableProductPatch = { price?: number; description?: string; is_active?: boolean; items?: string[] }`
  - `interface ProductRevision { id: string; table_name: "menu_items" | "gift_sets" | "reciprocate_items"; record_id: string; changed_by: string | null; changed_at: string; before: Record<string, unknown>; after: Record<string, unknown> }`
  - `selectIsAdmin(state: AuthStore): boolean` (stores/index.ts에서 export)
  - `useAuth()` 반환에 `isAdmin: boolean`

- [ ] **Step 1: `src/types/index.ts` — User에 role, 새 타입 2개**

`export interface User` 를 다음으로 교체:
```ts
// 사용자 권한 (user_profiles.role)
export type UserRole = "user" | "admin";

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  role?: UserRole; // user_profiles.role — UI 힌트일 뿐, 실제 권한은 RLS가 결정
  created_at?: string;
  updated_at?: string;
}
```

파일 끝에 추가:
```ts

// ==================== Admin Types ====================

// 관리자가 수정할 수 있는 상품 컬럼 (이 네 개가 전부. items는 gift_sets만)
export type EditableProductPatch = {
  price?: number;
  description?: string;
  is_active?: boolean;
  items?: string[];
};

// product_revisions 행 (DB 트리거가 적재)
export interface ProductRevision {
  id: string;
  table_name: "menu_items" | "gift_sets" | "reciprocate_items";
  record_id: string;
  changed_by: string | null; // NULL = SQL Editor 등 세션 없는 수정
  changed_at: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}
```

- [ ] **Step 2: `src/services/auth.ts` — 프로필(avatar_url + role) 조회 일원화**

`import type { LoginFormData, RegisterFormData, User } from "@/types";` → `import type { LoginFormData, RegisterFormData, User, UserRole } from "@/types";`

`mapSupabaseUser` (5~31행)를 교체:
```ts
// user_profiles에서 읽어오는 값
type DbProfile = { avatar_url: string | null; role: UserRole | null };

// Supabase Auth 사용자를 앱 User 타입으로 변환
function mapSupabaseUser(
  supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  profile?: DbProfile | null,
): User {
  const metadata = supabaseUser.user_metadata || {};

  // 이름: name > full_name > nickname (카카오) 순으로 확인
  const name = (metadata.name as string) ||
               (metadata.full_name as string) ||
               (metadata.nickname as string) ||
               "";

  // 프로필 이미지: DB 저장 값 > auth metadata > OAuth 제공자 순으로 확인
  const avatar_url = profile?.avatar_url ||
                     (metadata.avatar_url as string) ||
                     (metadata.picture as string) ||
                     (metadata.profile_image as string) ||
                     "";

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name,
    phone: (metadata.phone as string) || "",
    avatar_url,
    // role은 DB 값만 신뢰. 행이 없거나 조회 실패면 'user'
    role: profile?.role === "admin" ? "admin" : "user",
  };
}

// user_profiles 테이블에서 avatar_url + role 조회 (행이 없으면 null)
async function getDbProfile(userId: string): Promise<DbProfile | null> {
  try {
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from("user_profiles")
      .select("avatar_url, role")
      .eq("user_id", userId)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

// Supabase Auth 사용자 + DB 프로필 → 앱 User. User를 만드는 모든 지점은 이 함수를 탄다
// (안 그러면 프로필 이미지 업로드 같은 경로에서 role이 빠져 관리자 버튼이 사라진다)
async function buildUser(
  supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
): Promise<User> {
  const profile = await getDbProfile(supabaseUser.id);
  return mapSupabaseUser(supabaseUser, profile);
}
```
기존 `getDbAvatarUrl` 함수(33~46행)는 **삭제**한다. `saveDbAvatarUrl`은 그대로 둔다.

호출 지점 6곳 교체:
- `signUp` 81행: `return authData.user ? mapSupabaseUser(authData.user) : null;` → `return authData.user ? await buildUser(authData.user) : null;`
- `signIn` 95행: 동일하게 `await buildUser(authData.user)`
- `getCurrentUser` 151~154행:
  ```ts
    return buildUser(user);
  ```
  (주석 `// DB에서 커스텀 avatar_url 조회 (OAuth 덮어쓰기 방지)` 와 `dbAvatarUrl` 줄 삭제)
- `updateProfile` 200행: `return user ? mapSupabaseUser(user) : null;` → `return user ? await buildUser(user) : null;`
- `uploadAvatar` 245행: `return user ? mapSupabaseUser(user, avatarUrl) : null;` →
  ```ts
    // 방금 저장한 avatarUrl을 우선 적용(DB 저장이 실패했어도 화면엔 새 이미지), role은 DB에서
    const profile = await getDbProfile(userId);
    return user ? mapSupabaseUser(user, { avatar_url: avatarUrl, role: profile?.role ?? null }) : null;
  ```
- `onAuthStateChange` 252~260행:
  ```ts
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          callback(null);
          return;
        }
        const supabaseUser = session.user;
        // supabase-js 잠금 회피: 콜백 안에서 Supabase 호출을 직접 await 하지 않고 다음 틱에서 프로필 조회
        setTimeout(() => {
          buildUser(supabaseUser).then(callback);
        }, 0);
      }
    );
  ```

- [ ] **Step 3: `src/stores/authStore.ts`, `src/stores/index.ts` — `selectIsAdmin`**

`authStore.ts` 끝에:
```ts
export const selectIsAdmin = (state: AuthStore) => state.user?.role === "admin";
```
`stores/index.ts` 1행:
```ts
export { useAuthStore, selectIsAuthenticated, selectUserName, selectIsAdmin } from "./authStore";
```

- [ ] **Step 4: `src/hooks/useAuth.ts` — `isAdmin` 노출**

5행 import: `import { useAuthStore, selectIsAuthenticated } from "@/stores";` → `import { useAuthStore, selectIsAuthenticated, selectIsAdmin } from "@/stores";`
12행 아래 추가: `const isAdmin = useAuthStore(selectIsAdmin);`
반환 객체(229행~)의 `isAuthenticated,` 다음 줄에 `isAdmin,` 추가.

- [ ] **Step 5: 타입체크 + 린트**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 0. (`getDbAvatarUrl` 참조가 남아 있으면 tsc가 잡는다.)

- [ ] **Step 6: 브라우저 확인**

Run: `npm run dev` → http://localhost:3001 → Task 1에서 admin으로 지정한 계정으로 로그인 → DevTools → Application → Session Storage → `jinjood-auth` → `user.role`이 `"admin"`. 로그아웃 후 일반 계정으로 로그인 → `"user"`.
로그인 **직후 새로고침 없이** role이 들어가는지도 확인(onAuthStateChange 경로).

- [ ] **Step 7: 커밋**

```bash
git add src/types/index.ts src/services/auth.ts src/stores/authStore.ts src/stores/index.ts src/hooks/useAuth.ts
git commit -m "$(cat <<'EOF'
feat(auth): user_profiles.role을 User에 싣고 isAdmin 셀렉터 추가

- getDbProfile로 avatar_url+role 한 번에 조회, buildUser로 User 생성 지점 일원화
- onAuthStateChange는 다음 틱에서 프로필 조회(supabase-js 잠금 회피)
- EditableProductPatch, ProductRevision 타입 추가

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: 관리자용 순수 유틸 `src/utils/adminProduct.ts`

**Files:**
- Create: `src/utils/adminProduct.ts`

**Interfaces:**
- Produces (모두 순수 함수, Task 4·5가 사용):
  - `type EditableProduct = MenuItem | GiftSet | ReciprocateItem`
  - `type EditableField = keyof EditableProductPatch`
  - `type ProductTable = "menu_items" | "gift_sets" | "reciprocate_items"`
  - `const PRODUCT_TABLES: Record<ProductType, ProductTable>`
  - `const PRICE_MIN = 1`, `const PRICE_MAX = 1_000_000`
  - `const FIELD_LABELS: Record<EditableField, string>`
  - `editableFieldsFor(productType: ProductType): EditableField[]`
  - `pickEditablePatch(productType: ProductType, raw: Record<string, unknown>): EditableProductPatch`
  - `validatePatch(patch: EditableProductPatch): string | null`
  - `interface FieldChange { field: EditableField; label: string; before: unknown; after: unknown }`
  - `diffEditable(productType: ProductType, before: Record<string, unknown>, after: Record<string, unknown>): FieldChange[]`
  - `formatFieldValue(field: EditableField, value: unknown): string`

- [ ] **Step 1: 파일 작성**

```ts
import type {
  EditableProductPatch,
  GiftSet,
  MenuItem,
  ProductType,
  ReciprocateItem,
} from "@/types";

/**
 * 관리자 상품 편집 공통 유틸 (순수 함수)
 * - 서비스(adminService)와 모달(ProductEditModal)이 같은 규칙을 쓰도록 한 곳에 둔다
 * - 여기 규칙은 UX용이다. 최종 방어선은 DB(RLS + CHECK)
 */

export type EditableProduct = MenuItem | GiftSet | ReciprocateItem;
export type EditableField = keyof EditableProductPatch;
export type ProductTable = "menu_items" | "gift_sets" | "reciprocate_items";

export const PRODUCT_TABLES: Record<ProductType, ProductTable> = {
  menu_item: "menu_items",
  gift_set: "gift_sets",
  reciprocate_item: "reciprocate_items",
};

// DB CHECK (price > 0 AND price <= 1000000) 와 동일
export const PRICE_MIN = 1;
export const PRICE_MAX = 1_000_000;

export const FIELD_LABELS: Record<EditableField, string> = {
  price: "가격",
  description: "설명",
  is_active: "노출",
  items: "구성품",
};

/** 상품 타입별 편집 가능 필드. items는 선물세트만 */
export function editableFieldsFor(productType: ProductType): EditableField[] {
  return productType === "gift_set"
    ? ["price", "description", "is_active", "items"]
    : ["price", "description", "is_active"];
}

/**
 * 화이트리스트: 편집 가능 키만 골라 패치를 만든다. 그 외 키(name, image_url…)는 버린다.
 * items는 항목별 trim 후 빈 문자열 제거.
 */
export function pickEditablePatch(
  productType: ProductType,
  raw: Record<string, unknown>,
): EditableProductPatch {
  const patch: EditableProductPatch = {};

  for (const field of editableFieldsFor(productType)) {
    if (!(field in raw)) continue;
    const value = raw[field];

    switch (field) {
      case "price":
        if (typeof value === "number") patch.price = value;
        break;
      case "description":
        if (typeof value === "string") patch.description = value.trim();
        break;
      case "is_active":
        if (typeof value === "boolean") patch.is_active = value;
        break;
      case "items":
        if (Array.isArray(value)) {
          patch.items = value.map((v) => String(v).trim()).filter((v) => v.length > 0);
        }
        break;
    }
  }

  return patch;
}

/** 클라이언트 검증. 통과하면 null, 아니면 사용자에게 보여줄 에러 메시지 */
export function validatePatch(patch: EditableProductPatch): string | null {
  if ("price" in patch) {
    const price = patch.price;
    if (price === undefined || !Number.isInteger(price)) {
      return "가격은 정수로 입력해주세요.";
    }
    if (price < PRICE_MIN || price > PRICE_MAX) {
      return `가격은 ${PRICE_MIN.toLocaleString("ko-KR")}원 이상 ${PRICE_MAX.toLocaleString("ko-KR")}원 이하여야 합니다.`;
    }
  }
  if ("description" in patch && (patch.description ?? "").length === 0) {
    return "설명을 입력해주세요.";
  }
  if ("items" in patch && (patch.items ?? []).length === 0) {
    return "구성품을 1개 이상 입력해주세요.";
  }
  return null;
}

export interface FieldChange {
  field: EditableField;
  label: string;
  before: unknown;
  after: unknown;
}

// null/undefined와 빈 문자열은 같은 값으로 본다(description이 NULL인 행 편집 시 가짜 변경 방지)
function normalize(value: unknown): unknown {
  return value === null || value === undefined ? "" : value;
}

function isSameValue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
  }
  return normalize(a) === normalize(b);
}

/** 편집 가능 필드 중 값이 달라진 것만 반환. 확인 대조표와 이력 요약이 같이 쓴다 */
export function diffEditable(
  productType: ProductType,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): FieldChange[] {
  return editableFieldsFor(productType)
    .filter((field) => !isSameValue(before[field], after[field]))
    .map((field) => ({
      field,
      label: FIELD_LABELS[field],
      before: before[field],
      after: after[field],
    }));
}

/** 대조표/이력에 보여줄 값 포맷 */
export function formatFieldValue(field: EditableField, value: unknown): string {
  switch (field) {
    case "price":
      return typeof value === "number" ? `${value.toLocaleString("ko-KR")}원` : "-";
    case "is_active":
      return value === false ? "꺼짐" : "켜짐";
    case "items":
      return Array.isArray(value) ? `${value.length}개 항목` : "-";
    case "description": {
      const text = typeof value === "string" ? value : "";
      if (text.length === 0) return "(비어 있음)";
      return text.length > 40 ? `${text.slice(0, 40)}…` : text;
    }
    default:
      return String(value ?? "");
  }
}
```

- [ ] **Step 2: 타입체크 + 린트**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 0.

- [ ] **Step 3: 동작 스팟체크 (Node REPL 대체 — 브라우저 콘솔에서 확인은 Task 5에서 함께)**

아래 표를 보고 코드 리딩으로 확인한다(테스트 러너 없음). 어긋나는 게 있으면 고친다.

| 입력 | 기대 |
|---|---|
| `pickEditablePatch("menu_item", { price: 1000, name: "x", items: ["a"] })` | `{ price: 1000 }` (name·items 버림) |
| `pickEditablePatch("gift_set", { items: [" a ", "", "b"] })` | `{ items: ["a", "b"] }` |
| `validatePatch({ price: NaN })` | `"가격은 정수로 입력해주세요."` |
| `validatePatch({ price: 0 })` | 범위 에러 메시지 |
| `validatePatch({ price: 35000, description: "ok" })` | `null` |
| `diffEditable("menu_item", { description: null, price: 1 }, { description: "", price: 1 })` | `[]` (null≡"") |
| `diffEditable("gift_set", { items: ["a"] }, { items: ["a", "b"] })` | items 1건 |
| `formatFieldValue("price", 35000)` | `"35,000원"` |

- [ ] **Step 4: 커밋**

```bash
git add src/utils/adminProduct.ts
git commit -m "$(cat <<'EOF'
feat(product): 관리자 상품 편집 공통 유틸(화이트리스트·검증·diff·포맷)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 데이터 레이어 — `includeInactive` + `adminService` + 훅 `refetch`

**Files:**
- Modify: `src/services/products.ts` (6개 메서드에 옵션)
- Create: `src/services/admin.ts`
- Modify: `src/services/index.ts:8`
- Modify: `src/hooks/useProducts.ts` (전체)

**Interfaces:**
- Consumes: Task 2 `selectIsAdmin`, `EditableProductPatch`, `ProductRevision`; Task 3 `PRODUCT_TABLES`, `pickEditablePatch`, `validatePatch`.
- Produces:
  - `interface ProductQueryOptions { includeInactive?: boolean }` (products.ts에서 export)
  - `productService.getMenuItems(category?, options?)`, `getGiftSets(category?, options?)`, `getReciprocateItems(category?, options?)`, `getMenuItem(id, options?)`, `getGiftSet(id, options?)`, `getReciprocateItem(id, options?)`
  - `adminService.updateProduct(productType: ProductType, id: string, patch: EditableProductPatch): Promise<void>`
  - `adminService.getRevisions(productType: ProductType, id: string, limit?: number): Promise<ProductRevision[]>`
  - 훅: `useMenuItem/useGiftSet/useReciprocateItem(id)` 반환에 `refetch: () => Promise<void>` 추가. 목록 훅 3개는 기존 `refetch` 유지.

- [ ] **Step 1: `src/services/products.ts` — `includeInactive` 옵션**

파일 상단 import 아래에 추가:
```ts
/** 상품 조회 옵션. includeInactive는 관리자만 true로 넘긴다(RLS가 관리자에게만 비활성 행을 허용) */
export interface ProductQueryOptions {
  includeInactive?: boolean;
}
```

6개 메서드 시그니처와 쿼리를 교체. 패턴은 동일하다 — `.eq('is_active', true)`를 옵션 뒤로 옮긴다:

```ts
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
    // 이하 기존 그대로
```

```ts
  async getMenuItem(id: string, options: ProductQueryOptions = {}): Promise<MenuItem | null> {
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('id', id);

    if (!options.includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.single();
    // 이하 기존 그대로
```

`getGiftSet`, `getGiftSets`, `getReciprocateItem`, `getReciprocateItems`도 같은 방식(테이블명·타입만 다름). `getPopularItems`는 건드리지 않는다.

- [ ] **Step 2: `src/services/admin.ts` 작성**

```ts
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
    case '23514':    // check_violation (price_range)
      return new Error('가격은 1원 이상 1,000,000원 이하여야 합니다.');
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
```

`src/services/index.ts` 8행 아래에 추가:
```ts
export { adminService } from './admin';
```

- [ ] **Step 3: `src/hooks/useProducts.ts` — 관리자면 비활성 포함, 단건 훅에 `refetch`**

파일 전체를 교체한다:

```ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services';
import { useAuthStore, selectIsAdmin } from '@/stores';
import { MenuItem, GiftSet, ReciprocateItem } from '@/types';

// 관리자는 노출 off 상품도 본다. useAuth()는 초기화 부수효과가 있어 훅 안에서는 store 셀렉터로 읽는다.
function useIncludeInactive() {
  return useAuthStore(selectIsAdmin);
}

/**
 * 메뉴 아이템 목록 조회 훅
 */
export function useMenuItems(category?: string) {
  const includeInactive = useIncludeInactive();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getMenuItems(category, { includeInactive });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [category, includeInactive]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}

/**
 * 단일 메뉴 아이템 조회 훅
 */
export function useMenuItem(id: string | null) {
  const includeInactive = useIncludeInactive();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getMenuItem(id, { includeInactive });
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [id, includeInactive]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return { item, isLoading, error, refetch: fetchItem };
}

/**
 * 단일 선물세트 조회 훅
 */
export function useGiftSet(id: string | null) {
  const includeInactive = useIncludeInactive();
  const [item, setItem] = useState<GiftSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getGiftSet(id, { includeInactive });
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [id, includeInactive]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return { item, isLoading, error, refetch: fetchItem };
}

/**
 * 선물세트 목록 조회 훅
 */
export function useGiftSets(category?: string) {
  const includeInactive = useIncludeInactive();
  const [items, setItems] = useState<GiftSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getGiftSets(category, { includeInactive });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [category, includeInactive]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}

/**
 * 단일 이바지/답례 아이템 조회 훅
 */
export function useReciprocateItem(id: string | null) {
  const includeInactive = useIncludeInactive();
  const [item, setItem] = useState<ReciprocateItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getReciprocateItem(id, { includeInactive });
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [id, includeInactive]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return { item, isLoading, error, refetch: fetchItem };
}

/**
 * 이바지/답례 아이템 목록 조회 훅
 */
export function useReciprocateItems(category?: string) {
  const includeInactive = useIncludeInactive();
  const [items, setItems] = useState<ReciprocateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getReciprocateItems(category, { includeInactive });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [category, includeInactive]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}

/**
 * 인기 메뉴 조회 훅 (홈 — 관리자 편집 범위 밖, 기존 그대로)
 */
export function usePopularItems(limit: number = 9) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.getPopularItems(limit);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [limit]);

  return { items, isLoading, error };
}
```

- [ ] **Step 4: 타입체크 + 린트**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 0. 특히 `react-hooks/exhaustive-deps` 경고가 없어야 한다(`includeInactive`를 deps에 넣었는지).

- [ ] **Step 5: 브라우저 확인 — 비관리자 동작 불변, 관리자는 비활성 표시**

1. SQL Editor에서 임시로 상품 하나를 숨김: `UPDATE menu_items SET is_active = false WHERE name = '백설기';`
2. `npm run dev` → 로그아웃 상태로 `/represent` → **백설기가 안 보임**. `/represent/<백설기 id>` 직접 진입 → "상품을 찾을 수 없습니다".
3. 관리자로 로그인 → `/represent` → **백설기가 보임** (아직 배지는 없음, Task 6에서 추가). 상세도 열림.
4. 브라우저 콘솔에서 서비스 직접 호출로 RLS 확인 — Network 탭에서 `menu_items?...` 요청 URL에 `is_active=eq.true`가 **없는지**(관리자) / **있는지**(비관리자).
5. 확인 끝나면 되돌림: `UPDATE menu_items SET is_active = true WHERE name = '백설기';` (이력에 2건 남는 게 정상)

- [ ] **Step 6: 커밋**

```bash
git add src/services/products.ts src/services/admin.ts src/services/index.ts src/hooks/useProducts.ts
git commit -m "$(cat <<'EOF'
feat(product): adminService(updateProduct/getRevisions) + 관리자 비활성 상품 조회

- productService 6개 조회에 includeInactive 옵션, 훅은 selectIsAdmin으로 자동 전달
- 단건 훅(useMenuItem/useGiftSet/useReciprocateItem)에 refetch 추가
- updateProduct는 화이트리스트 4컬럼만, RLS 0행 갱신은 PGRST116으로 감지

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `ProductEditModal` + `AdminEditButton`

**Files:**
- Create: `src/components/admin/ProductEditModal.tsx`
- Create: `src/components/admin/AdminEditButton.tsx`

**Interfaces:**
- Consumes: Task 2 `selectIsAdmin`, `ProductRevision`, `EditableProductPatch`; Task 3 유틸 전부; Task 4 `adminService`.
- Produces:
  - `ProductEditModal({ productType: ProductType; product: EditableProduct; onClose: () => void; onSaved: () => void })`
  - `AdminEditButton({ productType: ProductType; product: EditableProduct; onSaved: () => void; variant?: "card" | "detail" })` — 관리자가 아니면 `null`. `variant="card"`는 부모가 `position: relative`인 이미지 래퍼 안에 놓는 우상단 absolute 아이콘 버튼(+ 숨김 배지), `variant="detail"`은 인라인 텍스트 버튼(+ 숨김 칩).

- [ ] **Step 1: `src/components/admin/ProductEditModal.tsx` 작성**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { FiX, FiPlus, FiTrash2, FiRotateCcw, FiChevronDown, FiChevronUp } from "react-icons/fi";
import type { EditableProductPatch, ProductRevision, ProductType } from "@/types";
import { adminService } from "@/services";
import {
  type EditableProduct,
  type FieldChange,
  diffEditable,
  formatFieldValue,
  pickEditablePatch,
  validatePatch,
  PRICE_MAX,
  PRICE_MIN,
} from "@/utils/adminProduct";

/**
 * 관리자 상품 편집 모달
 * 2단계: 편집 → 확인(전/후 대조표) → adminService.updateProduct
 * 하단 "최근 수정 이력"에서 이전 값으로 되돌리기(같은 확인 단계를 탄다)
 * body 직속으로 포털 렌더 — 카드의 transform/overflow 영향을 받지 않게
 */

interface ProductEditModalProps {
  productType: ProductType;
  product: EditableProduct;
  onClose: () => void;
  onSaved: () => void;
}

type Step = "edit" | "confirm";

// 입력 폼 상태. price는 input 편의상 문자열
type FormState = {
  price: string;
  description: string;
  is_active: boolean;
  items: string[];
};

// 상품 행(또는 이력의 before) → 폼
function toForm(source: Record<string, unknown>): FormState {
  return {
    price: source.price == null ? "" : String(source.price),
    description: typeof source.description === "string" ? source.description : "",
    is_active: source.is_active !== false,
    items: Array.isArray(source.items) ? source.items.map(String) : [],
  };
}

// 폼 → 패치 원료 (pickEditablePatch가 타입별로 걸러낸다)
function fromForm(form: FormState): Record<string, unknown> {
  return {
    price: form.price.trim() === "" ? NaN : Number(form.price),
    description: form.description,
    is_active: form.is_active,
    items: form.items,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

// ---------- styles ----------

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.5);

  @media (max-width: 640px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const Sheet = styled.div`
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  @media (max-width: 640px) {
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
  }
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #eeeeee;
  z-index: 1;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e1e1e;

  span {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.8125rem;
    font-weight: 400;
    color: #999999;
  }
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background-color: transparent;
  color: #666666;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #f8f8f8;
    color: #1e1e1e;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Body = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  > span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e1e1e;
  }

  small {
    font-size: 0.75rem;
    color: #999999;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #1e1e1e;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  outline: none;

  &:focus {
    border-color: #f35525;
  }
`;

const Textarea = styled.textarea`
  min-height: 120px;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #1e1e1e;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  resize: vertical;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #f35525;
  }
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #f8f8f8;
  border-radius: 8px;

  > span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e1e1e;
  }
`;

const Toggle = styled.button<{ $on: boolean }>`
  position: relative;
  width: 48px;
  height: 28px;
  border: none;
  border-radius: 14px;
  background-color: ${({ $on }) => ($on ? "#22c55e" : "#cccccc")};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${({ $on }) => ($on ? "23px" : "3px")};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: left 0.2s ease;
  }
`;

const ItemsEditor = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ItemRow = styled.div`
  display: flex;
  gap: 0.5rem;

  ${Input} {
    flex: 1;
  }
`;

const SmallButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #1e1e1e;
  background-color: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: #f35525;
    color: #f35525;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-top: 1px solid #eeeeee;
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 0.875rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e1e1e;
  background-color: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 10px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #f8f8f8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 0.875rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #f35525;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #d94820;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const DiffTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;

  th,
  td {
    padding: 0.75rem 0.5rem;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid #eeeeee;
    word-break: keep-all;
  }

  th {
    width: 4.5rem;
    font-weight: 600;
    color: #666666;
  }

  td.before {
    color: #999999;
    text-decoration: line-through;
  }

  td.arrow {
    width: 1.5rem;
    color: #999999;
    text-align: center;
  }

  td.after {
    font-weight: 600;
    color: #f35525;
  }
`;

const ItemsDiff = styled.ul`
  margin-top: 0.375rem;
  padding-left: 1rem;
  font-size: 0.8125rem;
  color: #666666;
  text-decoration: none;

  li {
    list-style: disc;
  }
`;

const DiffNote = styled.p`
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #666666;
  line-height: 1.5;
  white-space: pre-line;
`;

const Section = styled.section`
  border-top: 1px solid #eeeeee;
  padding-top: 1rem;
`;

const SectionToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e1e1e;
  background: none;
  border: none;
  cursor: pointer;
`;

const RevisionList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const RevisionItem = styled.li`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  font-size: 0.8125rem;
  background-color: #f8f8f8;
  border-radius: 8px;

  time {
    display: block;
    margin-bottom: 0.25rem;
    color: #999999;
  }

  p {
    color: #1e1e1e;
    line-height: 1.5;
  }
`;

// ---------- component ----------

export default function ProductEditModal({
  productType,
  product,
  onClose,
  onSaved,
}: ProductEditModalProps) {
  const productRecord = product as unknown as Record<string, unknown>;
  const isGiftSet = productType === "gift_set";

  const [step, setStep] = useState<Step>("edit");
  const [form, setForm] = useState<FormState>(() => toForm(productRecord));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [pendingPatch, setPendingPatch] = useState<EditableProductPatch | null>(null);
  const [changes, setChanges] = useState<FieldChange[]>([]);

  const [revisions, setRevisions] = useState<ProductRevision[]>([]);
  const [revisionsOpen, setRevisionsOpen] = useState(false);

  // 최근 수정 이력 로드 (실패해도 모달은 동작해야 하므로 조용히 빈 배열)
  useEffect(() => {
    adminService
      .getRevisions(productType, product.id, 10)
      .then(setRevisions)
      .catch(() => setRevisions([]));
  }, [productType, product.id]);

  // ESC로 닫기 (저장 중에는 잠금) + 배경 스크롤 잠금
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isSaving, onClose]);

  // 편집 → 확인 단계. 검증하고 바뀐 필드만 골라 대조표를 만든다
  const prepareConfirm = useCallback(
    (nextForm: FormState) => {
      setError(null);

      const patch = pickEditablePatch(productType, fromForm(nextForm));
      const validationError = validatePatch(patch);
      if (validationError) {
        setError(validationError);
        return;
      }

      const fieldChanges = diffEditable(productType, productRecord, { ...productRecord, ...patch });
      if (fieldChanges.length === 0) {
        setError("변경된 내용이 없습니다.");
        return;
      }

      // 바뀐 필드만 전송 — 값이 같은 컬럼을 굳이 UPDATE에 싣지 않는다
      const changedPatch: EditableProductPatch = {};
      for (const change of fieldChanges) {
        (changedPatch as Record<string, unknown>)[change.field] = patch[change.field];
      }

      setPendingPatch(changedPatch);
      setChanges(fieldChanges);
      setStep("confirm");
    },
    [productType, productRecord],
  );

  const handleConfirm = async () => {
    if (!pendingPatch) return;
    setIsSaving(true);
    setError(null);
    try {
      await adminService.updateProduct(productType, product.id, pendingPatch);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 이력의 before 값을 폼에 얹고 바로 확인 단계로 (되돌리기도 updateProduct를 그대로 탄다)
  const handleRevert = (revision: ProductRevision) => {
    const restored = toForm({ ...productRecord, ...revision.before });
    setForm(restored);
    prepareConfirm(restored);
  };

  const updateItem = (index: number, value: string) => {
    setForm((prev) => ({ ...prev, items: prev.items.map((it, i) => (i === index ? value : it)) }));
  };
  const removeItem = (index: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };
  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, ""] }));
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <Overlay
      onClick={() => {
        if (!isSaving) onClose();
      }}
      role="presentation"
    >
      <Sheet role="dialog" aria-modal="true" aria-labelledby="product-edit-title" onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title id="product-edit-title">
            {step === "edit" ? "상품 수정" : "변경 내용 확인"}
            <span>{product.name}</span>
          </Title>
          <IconButton onClick={onClose} disabled={isSaving} aria-label="닫기">
            <FiX size={20} />
          </IconButton>
        </Header>

        {step === "edit" ? (
          <>
            <Body>
              <Field>
                <span>가격 (원)</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={100}
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
                <small>
                  {form.price.trim() !== "" && !Number.isNaN(Number(form.price))
                    ? `${Number(form.price).toLocaleString("ko-KR")}원`
                    : "숫자만 입력"}
                </small>
              </Field>

              <Field>
                <span>설명</span>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
                <small>개입 수량은 이 문장 안에서 고칩니다. 예: (1되/40개입), (16개입)</small>
              </Field>

              {isGiftSet && (
                <Field>
                  <span>구성품</span>
                  <ItemsEditor>
                    {form.items.map((item, index) => (
                      <ItemRow key={index}>
                        <Input
                          type="text"
                          value={item}
                          placeholder="예: 오색손송편 1kg"
                          onChange={(e) => updateItem(index, e.target.value)}
                        />
                        <IconButton type="button" onClick={() => removeItem(index)} aria-label="구성품 삭제">
                          <FiTrash2 size={16} />
                        </IconButton>
                      </ItemRow>
                    ))}
                    <SmallButton type="button" onClick={addItem}>
                      <FiPlus size={14} />
                      항목 추가
                    </SmallButton>
                  </ItemsEditor>
                </Field>
              )}

              <ToggleRow>
                <span>사이트에 노출</span>
                <Toggle
                  type="button"
                  $on={form.is_active}
                  onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  aria-pressed={form.is_active}
                  aria-label="노출 여부"
                />
              </ToggleRow>

              {error && <ErrorText>{error}</ErrorText>}

              {revisions.length > 0 && (
                <Section>
                  <SectionToggle type="button" onClick={() => setRevisionsOpen((v) => !v)}>
                    최근 수정 이력 ({revisions.length})
                    {revisionsOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </SectionToggle>
                  {revisionsOpen && (
                    <RevisionList>
                      {revisions.map((revision) => {
                        const summary = diffEditable(productType, revision.before, revision.after)
                          .map((c) => `${c.label} ${formatFieldValue(c.field, c.before)} → ${formatFieldValue(c.field, c.after)}`)
                          .join(" · ");
                        return (
                          <RevisionItem key={revision.id}>
                            <div>
                              <time dateTime={revision.changed_at}>
                                {formatDate(revision.changed_at)}
                                {revision.changed_by === null && " (콘솔 수정)"}
                              </time>
                              <p>{summary || "(편집 항목 외 변경)"}</p>
                            </div>
                            <SmallButton type="button" onClick={() => handleRevert(revision)}>
                              <FiRotateCcw size={14} />
                              이 값으로
                            </SmallButton>
                          </RevisionItem>
                        );
                      })}
                    </RevisionList>
                  )}
                </Section>
              )}
            </Body>

            <Footer>
              <SecondaryButton type="button" onClick={onClose}>
                취소
              </SecondaryButton>
              <PrimaryButton type="button" onClick={() => prepareConfirm(form)}>
                저장
              </PrimaryButton>
            </Footer>
          </>
        ) : (
          <>
            <Body>
              <DiffTable>
                <tbody>
                  {changes.map((change) => (
                    <tr key={change.field}>
                      <th>{change.label}</th>
                      <td className="before">{formatFieldValue(change.field, change.before)}</td>
                      <td className="arrow">→</td>
                      <td className="after">
                        {formatFieldValue(change.field, change.after)}
                        {change.field === "items" && Array.isArray(change.after) && (
                          <ItemsDiff>
                            {(change.after as string[]).map((it, i) => (
                              <li key={i}>{it}</li>
                            ))}
                          </ItemsDiff>
                        )}
                        {change.field === "description" && typeof change.after === "string" && (
                          <DiffNote>{change.after}</DiffNote>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DiffTable>

              {error && <ErrorText>{error}</ErrorText>}
            </Body>

            <Footer>
              <SecondaryButton type="button" onClick={() => setStep("edit")} disabled={isSaving}>
                돌아가기
              </SecondaryButton>
              <PrimaryButton type="button" onClick={handleConfirm} disabled={isSaving}>
                {isSaving ? "수정 중..." : "확인하고 수정"}
              </PrimaryButton>
            </Footer>
          </>
        )}
      </Sheet>
    </Overlay>,
    document.body,
  );
}
```

- [ ] **Step 2: `src/components/admin/AdminEditButton.tsx` 작성**

```tsx
"use client";

import { useState, type MouseEvent } from "react";
import styled from "styled-components";
import { FiEdit2 } from "react-icons/fi";
import type { ProductType } from "@/types";
import { useAuthStore, selectIsAdmin } from "@/stores";
import type { EditableProduct } from "@/utils/adminProduct";
import ProductEditModal from "./ProductEditModal";

/**
 * 관리자에게만 보이는 "수정" 버튼. 모달을 소유한다.
 * - card: 부모가 position: relative인 이미지 래퍼 안에서 우상단 absolute (+ 숨김 배지)
 * - detail: 인라인 텍스트 버튼 (+ 숨김 칩)
 * 관리자가 아니면 아무것도 렌더하지 않는다(disabled 아님).
 */

interface AdminEditButtonProps {
  productType: ProductType;
  product: EditableProduct;
  onSaved: () => void;
  variant?: "card" | "detail";
}

const CardWrapper = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HiddenBadge = styled.span`
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #666666;
  border-radius: 20px;
`;

const CardButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #ffffff;
  background-color: rgba(30, 30, 30, 0.75);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f35525;
  }
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const DetailButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e1e1e;
  background-color: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f35525;
    border-color: #f35525;
    color: #ffffff;
  }
`;

export default function AdminEditButton({
  productType,
  product,
  onSaved,
  variant = "card",
}: AdminEditButtonProps) {
  const isAdmin = useAuthStore(selectIsAdmin);
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  const isHidden = product.is_active === false;

  // 카드 전체가 Link/hover 영역이라 버블링·기본동작을 끊는다
  const handleOpen = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const modal = open ? (
    <ProductEditModal
      productType={productType}
      product={product}
      onClose={() => setOpen(false)}
      onSaved={onSaved}
    />
  ) : null;

  if (variant === "detail") {
    return (
      <>
        <DetailRow>
          <DetailButton type="button" onClick={handleOpen}>
            <FiEdit2 size={14} />
            상품 수정
          </DetailButton>
          {isHidden && <HiddenBadge>숨김 상태</HiddenBadge>}
        </DetailRow>
        {modal}
      </>
    );
  }

  return (
    <>
      <CardWrapper>
        {isHidden && <HiddenBadge>숨김</HiddenBadge>}
        <CardButton type="button" onClick={handleOpen} aria-label={`${product.name} 수정`}>
          <FiEdit2 size={16} />
        </CardButton>
      </CardWrapper>
      {modal}
    </>
  );
}
```

- [ ] **Step 3: 타입체크 + 린트**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 0. 특히 `react-hooks/exhaustive-deps` 경고가 없어야 한다. styled-components의 폴리모픽 `as` prop은 타입 마찰이 있어 쓰지 않았다 — 새 요소가 필요하면 `DiffNote`처럼 styled 컴포넌트를 하나 더 만든다.

- [ ] **Step 4: 임시 마운트로 모달 단독 확인 (Task 6 전이라 아직 어디에도 안 붙어 있음)**

`app/represent/page.tsx`의 `<MenuCard key={item.id} item={item} index={index} />` 를 **임시로** 아래처럼 감싸 확인한다(커밋하지 않음):
```tsx
<div key={item.id} style={{ position: "relative" }}>
  <AdminEditButton productType="menu_item" product={item} onSaved={refetch} />
  <MenuCard item={item} index={index} />
</div>
```
(`import AdminEditButton from "@/components/admin/AdminEditButton";`, `const { items, isLoading, error, refetch } = useMenuItems(...)`)

`npm run dev` → 관리자 로그인 → `/represent`:
1. 카드마다 우상단 연필 버튼. 로그아웃하면 사라짐.
2. 클릭 → 모달. 가격 `35000`→`39000` → 저장 → 대조표 `가격 35,000원 → 39,000원` 한 줄 → 확인하고 수정 → 모달 닫힘, 카드 가격 즉시 갱신.
3. 다시 열면 "최근 수정 이력 (1)" → 펼치면 `가격 35,000원 → 39,000원` → "이 값으로" → 대조표 `39,000원 → 35,000원` → 확인 → 이력 2건.
4. 값 안 바꾸고 저장 → "변경된 내용이 없습니다."
5. 가격 `0` → 저장 → "가격은 1원 이상 …" (클라이언트). DevTools 콘솔에서 우회 시도:
   ```js
   (await import("/src/services/admin.ts")).adminService  // 경로가 안 잡히면 Network 탭에서 PATCH 요청을 Copy as fetch → price를 0으로 바꿔 재전송
   ```
   → 응답 400, 모달과 무관하게 DB CHECK가 거부하는 것을 확인.
6. ESC, 배경 클릭으로 닫힘. 모바일 폭(≤640)에서 하단 시트.
7. 노출 토글 off → 확인 → 카드에 아직 배지 없음(정상, 임시 마운트는 `product.is_active`를 받지만 refetch 후 `item`이 갈아끼워지면 "숨김" 배지 보임). 다시 on으로.

확인 후 임시 코드를 **되돌린다** (`git checkout app/represent/page.tsx`).

- [ ] **Step 5: 커밋**

```bash
git add src/components/admin/ProductEditModal.tsx src/components/admin/AdminEditButton.tsx
git commit -m "$(cat <<'EOF'
feat(product): 관리자 상품 편집 모달 + 관리자 전용 수정 버튼

- 편집→확인 2단계, 바뀐 필드만 전/후 대조표로 confirm 후 updateProduct
- 선물세트 구성품 항목 추가/삭제, 노출 토글
- 최근 수정 이력 10건 + "이 값으로" 되돌리기(같은 확인 단계 경유)
- body 포털, ESC/배경 클릭 닫기(저장 중 잠금), 모바일 하단 시트

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: 목록 카드 3곳에 버튼 연결

**Files:**
- Modify: `src/components/menu/MenuCard.tsx:10-12, 177-182, 225-238`
- Modify: `app/represent/page.tsx` (`useMenuItems` 구조분해, `<MenuCard>`)
- Modify: `app/gifts/page.tsx:8-12, 217, 259-270`
- Modify: `app/reciprocate/page.tsx:8-12, 274, 339-355`

**Interfaces:**
- Consumes: Task 5 `AdminEditButton`; Task 4 목록 훅의 `refetch`.
- Produces: `MenuCard` prop `onSaved?: () => void` 추가.

- [ ] **Step 1: `MenuCard.tsx`**

import 추가(12행 아래):
```tsx
import AdminEditButton from "@/components/admin/AdminEditButton";
```
Props 교체(177~180행):
```tsx
interface MenuCardProps {
  item: MenuItem;
  index?: number;
  onSaved?: () => void; // 관리자 수정 후 목록 갱신 (부모 훅의 refetch)
}

export default function MenuCard({ item, index = 0, onSaved }: MenuCardProps) {
```
`<TagsWrapper>…</TagsWrapper>` 닫는 태그(237행) 바로 아래, `</ImageWrapper>` 위에:
```tsx
        <AdminEditButton productType="menu_item" product={item} onSaved={onSaved ?? (() => {})} />
```

- [ ] **Step 2: `app/represent/page.tsx`**

`const { items, isLoading, error } = useMenuItems(...)` → `const { items, isLoading, error, refetch } = useMenuItems(...)`
`<MenuCard key={item.id} item={item} index={index} />` → `<MenuCard key={item.id} item={item} index={index} onSaved={refetch} />`

- [ ] **Step 3: `app/gifts/page.tsx`**

import 추가(12행 아래):
```tsx
import AdminEditButton from "@/components/admin/AdminEditButton";
```
217행: `const { items, isLoading, error } = useGiftSets(...)` → `const { items, isLoading, error, refetch } = useGiftSets(...)`
`<CategoryBadge>…</CategoryBadge>` 닫는 태그(269행) 바로 아래, `</ImageWrapper>` 위에:
```tsx
                        <AdminEditButton productType="gift_set" product={item} onSaved={refetch} />
```

- [ ] **Step 4: `app/reciprocate/page.tsx`**

import 추가(12행 아래):
```tsx
import AdminEditButton from "@/components/admin/AdminEditButton";
```
274행: `const { items, isLoading, error } = useReciprocateItems(...)` → `const { items, isLoading, error, refetch } = useReciprocateItems(...)`
`</Overlay>`(354행) 바로 아래, `</ImageWrapper>` 위에 (Overlay가 hover 시 이미지 전체를 덮으므로 **Overlay 뒤에** 놓아야 버튼이 위에 온다):
```tsx
                        <AdminEditButton productType="reciprocate_item" product={item} onSaved={refetch} />
```

- [ ] **Step 5: 타입체크 + 린트**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 0.

- [ ] **Step 6: 브라우저 확인**

`npm run dev` → 관리자 로그인:
1. `/represent`, `/gifts`, `/reciprocate` 각각 카드 우상단에 연필 버튼. 이바지·답례는 hover 오버레이가 떠도 버튼이 클릭됨.
2. 선물세트 하나 열어 구성품 항목 추가(`오색송편 8개`) + 설명 문장의 개입 수 수정 → 대조표에 `구성 3개 항목 → 4개 항목`(펼침 목록) + `설명 … → …` 두 줄 → 확인 → 카드의 "구성품" 문단과 설명 즉시 갱신.
3. 답례품 하나 노출 off → 카드에 "숨김" 배지. 로그아웃 → `/reciprocate`에서 사라짐. 관리자 재로그인 → 배지 달린 채 보임 → 다시 on.
4. 카드의 "자세히 보기"/"장바구니 담기"는 연필 버튼과 무관하게 정상 동작(버블링 차단 확인).
5. 로그아웃 상태 3페이지 → 버튼·배지 전무.

- [ ] **Step 7: 커밋**

```bash
git add src/components/menu/MenuCard.tsx app/represent/page.tsx app/gifts/page.tsx app/reciprocate/page.tsx
git commit -m "$(cat <<'EOF'
feat(product): 대표메뉴·선물세트·이바지답례 카드에 관리자 수정 버튼 연결

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: 상세 페이지에 버튼 연결

**Files:**
- Modify: `src/components/product/ProductDetail.tsx:10-21, 403-408, 480-481`
- Modify: `app/represent/[id]/page.tsx:62, 88-93`, `app/gifts/[id]/page.tsx:62, 88-93`, `app/reciprocate/[id]/page.tsx:62, 88-93`

**Interfaces:**
- Consumes: Task 5 `AdminEditButton` (`variant="detail"`); Task 4 단건 훅의 `refetch`.
- Produces: `ProductDetail` prop `onSaved?: () => void` 추가.

- [ ] **Step 1: `ProductDetail.tsx`**

import 추가(12행 아래):
```tsx
import AdminEditButton from "@/components/admin/AdminEditButton";
```
Props(16~21행):
```tsx
interface ProductDetailProps {
  product: ProductItem;
  productType: ProductType;
  backLink: string;
  backLabel: string;
  onSaved?: () => void; // 관리자 수정 후 상세 재조회 (부모 훅의 refetch)
}
```
함수 시그니처(403~408행)에 `onSaved,` 추가.
`<ProductName>{product.name}</ProductName>`(481행) 바로 아래:
```tsx
          <AdminEditButton
            productType={productType}
            product={product}
            onSaved={onSaved ?? (() => {})}
            variant="detail"
          />
```

- [ ] **Step 2: 상세 페이지 3개**

각 파일 62행: `const { item, isLoading, error } = useMenuItem(id);` → `const { item, isLoading, error, refetch } = useMenuItem(id);` (gifts는 `useGiftSet`, reciprocate는 `useReciprocateItem`)
`<ProductDetail … />`에 prop 추가: `onSaved={refetch}`

- [ ] **Step 3: 타입체크 + 린트**

Run: `npx tsc --noEmit && npm run lint`
Expected: 에러 0.

- [ ] **Step 4: 브라우저 확인**

관리자 로그인:
1. `/represent/<id>`, `/gifts/<id>`, `/reciprocate/<id>` 상품명 아래 "상품 수정" 버튼.
2. 선물세트 상세에서 구성품 항목 삭제 → 확인 → 상세의 구성품 태그 즉시 갱신(refetch).
3. 노출 off → 버튼 옆 "숨김 상태" 칩. 로그아웃 → 같은 URL → "상품을 찾을 수 없습니다". 관리자 재로그인 → 열림 → 다시 on.
4. 로그아웃 상태 → 버튼 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/components/product/ProductDetail.tsx "app/represent/[id]/page.tsx" "app/gifts/[id]/page.tsx" "app/reciprocate/[id]/page.tsx"
git commit -m "$(cat <<'EOF'
feat(product): 상품 상세에 관리자 수정 버튼 연결

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: 통합 검증 (빌드 + 수동 시나리오 전체)

**Files:** 없음 (검증만). 문제가 나오면 해당 태스크 파일을 고치고 `fix(product): …`로 커밋.

- [ ] **Step 1: 프로덕션 빌드**

Run: `npm run build`
Expected: 성공. `app/represent`, `/gifts`, `/reciprocate`, `[id]` 페이지가 클라이언트 번들로 빌드됨. `createPortal` 관련 SSR 에러 없음(`typeof document === "undefined"` 가드).

- [ ] **Step 2: 린트**

Run: `npm run lint`
Expected: 에러/경고 0.

- [ ] **Step 3: RLS 검증 재실행**

`supabase/admin_edit_verify.sql` (A)(B)(C) 블록을 다시 실행해 기대값과 일치하는지 확인 — Task 1 이후 스키마를 건드린 게 없으므로 결과가 같아야 한다.

- [ ] **Step 4: 수동 시나리오 체크리스트 (spec §10-2)**

`npm run dev` 상태에서 순서대로:

| # | 시나리오 | 기대 |
|---|---|---|
| 1 | 비관리자 로그인 → 카드 3페이지 + 상세 | 수정 버튼 없음, 노출 off 상품 안 보임 |
| 2 | 관리자 로그인 | 버튼 보임, 숨김 상품에 배지 |
| 3 | 가격만 변경 → 저장 | 대조표 가격 한 줄 → 확인 → 카드 즉시 갱신 |
| 4 | 선물세트 구성품 추가/삭제 → 확인 | 상세·카드 모두 반영 |
| 5 | 노출 off → 로그아웃 → 목록/상세 | 사라짐 → 관리자 재로그인 → 배지로 보임 → 다시 on |
| 6 | 변경 없이 저장 | "변경된 내용이 없습니다." |
| 7 | 가격 0 → 저장 | 클라이언트 차단. Network에서 PATCH 재전송(price 0) → 400, DB CHECK 메시지 |
| 8 | 로그인 직후(새로고침 없이) | 버튼이 바로 보임 (onAuthStateChange → buildUser) |
| 9 | 가격 두 번 변경 → 이력에서 첫 값으로 되돌리기 | 대조표 → 확인 → 이력 3건 |
| 10 | 프로필 이미지 업로드(마이페이지) 후 상품 페이지 | 버튼 **여전히** 보임 (uploadAvatar가 role 유지) |
| 11 | 모바일 폭(≤640) | 모달이 하단 시트, 입력 가능, 스크롤 잠김 |

전부 통과하면 완료. 실패 항목은 원인 태스크로 돌아가 수정 후 `fix(product): …` 커밋.

- [ ] **Step 5: 마무리 보고**

사용자에게 보고할 것:
- 커밋 목록(`git log --oneline main..HEAD` 또는 이번 세션 커밋 해시)
- **아직 안 된 운영 작업**: 사장님 계정을 admin으로 지정하는 SQL(README 절차)은 사장님이 사이트에 한 번 로그인한 뒤 사용자가 직접 실행해야 함
- push는 하지 않았음(사용자 판단)
