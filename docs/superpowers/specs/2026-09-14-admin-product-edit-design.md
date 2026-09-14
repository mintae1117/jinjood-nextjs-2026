# 관리자 상품 편집 (인라인 수정 버튼 + 모달) 설계

- 작성일: 2026-09-14
- 상태: 승인됨 (구현 계획 작성 전)
- 관련: CLAUDE.md Phase 5(관리자 대시보드) 일부를 앞당김. `user_profiles.role`은 Phase 4-D(주문 관리)에서 재사용.

## 1. 배경과 목표

진주떡집 사장님이 카톡으로 "요거 32,000원으로", "오색송편 8개, 1세트 22개입으로" 같은 가격·구성 수정 요청을 보내면, 개발자가 매번 Supabase 콘솔을 열어 40여 행 중 해당 행을 찾아 손으로 고치고 있다. 리포의 `seed_data.sql` / `cleanup_and_reseed.sql`도 함께 맞춰야 해서 3중 관리가 된다(`6457aea` 참고).

**목표**: 사장님이 관리자 계정으로 로그인하면 사이트를 평소처럼 보다가 상품 카드/상세에서 바로 "수정" 버튼을 눌러 가격·설명·구성·노출 여부를 고칠 수 있게 한다. 개발자는 이 루프에서 빠진다.

## 2. 범위

### 포함
- `menu_items`, `gift_sets`, `reciprocate_items` 세 테이블의 **기존 행 수정**만
- 편집 가능 컬럼: `price`, `description`, `is_active`, `items`(gift_sets만)
- 관리자 판별: `user_profiles.role = 'admin'` + RLS
- 수정 전 값 자동 이력 적재(`product_revisions`) + 모달 안 "최근 수정 이력"에서 되돌리기
- 저장 전 변경 전/후 대조 confirm

### 제외 (의도적으로 안 함)
- 상품 추가/삭제, 이미지 업로드, 진열순서(`display_order`), 태그(인기/추천/베스트), 카테고리·이름 변경
- 별도 `/admin` 페이지 — 기존 화면에 버튼을 꽂는 방식
- 개입 수량 컬럼 분리 — 수량은 지금처럼 `description` 문장 안에 유지(`(1되/40개입)`), 사장님이 textarea에서 문장을 직접 고침
- 테스트 러너 도입(현재 프로젝트에 없음)

## 3. 핵심 아키텍처 결정

**브라우저 → Supabase 직접 UPDATE, RLS가 유일한 보안 경계.**

전 화면이 `"use client"`이고 상품 조회가 브라우저 Supabase 클라이언트(`src/lib/supabase/index.ts`의 `supabase` 싱글톤)로 이뤄지므로, 쓰기도 같은 경로로 간다. Server Action / Service Role 키를 쓰지 않는다.

따라오는 원칙:
1. **RLS 정책이 정확해야 한다.** 관리자 SELECT(전체) + UPDATE 정책, INSERT/DELETE 정책 없음.
2. **값 검증은 DB CHECK 제약이 진짜 방어선.** 브라우저 검증은 UX용이다.
3. **이력은 DB 트리거로.** 클라이언트가 빼먹을 수 없고, 콘솔 직접 수정도 남는다.
4. Next.js 캐시 무효화 불필요 — 수정 후 기존 훅의 `refetch()`로 갱신.

## 4. DB 변경 — `supabase/admin_edit.sql` (신규, Supabase SQL Editor에서 1회 실행)

기존 파일 패턴(`uuid_generate_v4`, `TIMEZONE('utc', NOW())`, 정책 이름 영문 문장형) 준수.

### 4-1. role 컬럼
```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));
```

### 4-1b. role 권한 상승 방지 (필수)
기존 `user_profiles` 정책 "Users can insert/update own profile"은 **본인 행의 모든 컬럼**을 허용한다. 그대로 두면 일반 유저가 브라우저 콘솔에서 `upsert({ user_id, role: 'admin' })`를 쏴서 스스로 관리자가 될 수 있다. 트리거로 막는다.
```sql
CREATE OR REPLACE FUNCTION public.protect_user_profiles_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- SQL Editor/서비스 롤(auth.uid() IS NULL)은 통과. 브라우저 세션은 role 변경 불가.
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

CREATE TRIGGER protect_user_profiles_role
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_profiles_role();
```
기존 `saveDbAvatarUrl`의 upsert(`user_id, avatar_url, updated_at`)는 role을 안 보내므로 영향 없다.

### 4-2. 관리자 판별 함수
```sql
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
```
`SECURITY DEFINER`인 이유: RLS 정책 안에서 `user_profiles`를 직접 조회하면 그 테이블의 RLS("본인 행만")와 다시 엮여 평가가 꼬인다. 함수로 감싸 우회한다.

### 4-3. 상품 테이블 RLS — 세 테이블에 동일하게
```sql
CREATE POLICY "Admins can view all menu_items"
  ON menu_items FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update menu_items"
  ON menu_items FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
```
- SELECT 정책이 **필수**인 이유: 기존 정책이 `USING (is_active = true)`라서 노출 off한 상품이 관리자에게도 안 보여 다시 켤 수 없다. PostgreSQL은 여러 permissive 정책을 OR로 합치므로 기존 정책과 공존한다.
- INSERT/DELETE 정책은 만들지 않는다 → 추가/삭제 원천 차단.

### 4-4. 값 제약 — 세 테이블에 동일하게
```sql
ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_price_range CHECK (price > 0 AND price <= 1000000);
```
`description`은 NULL 허용 컬럼이라 길이 제약은 두지 않는다(빈 문자열 방지는 클라이언트에서).

### 4-5. 이력 테이블 + 트리거
```sql
CREATE TABLE IF NOT EXISTS product_revisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL CHECK (table_name IN ('menu_items','gift_sets','reciprocate_items')),
  record_id UUID NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  before JSONB NOT NULL,
  after JSONB NOT NULL
);
CREATE INDEX idx_product_revisions_record ON product_revisions(table_name, record_id, changed_at DESC);

ALTER TABLE product_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view product_revisions"
  ON product_revisions FOR SELECT TO authenticated USING (public.is_admin());
-- INSERT/UPDATE/DELETE 정책 없음: 트리거(SECURITY DEFINER)만 쓴다. 사람이 이력을 못 지운다.

CREATE OR REPLACE FUNCTION public.log_product_revision()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF to_jsonb(OLD) - 'updated_at' IS DISTINCT FROM to_jsonb(NEW) - 'updated_at' THEN
    INSERT INTO product_revisions (table_name, record_id, changed_by, before, after)
    VALUES (TG_TABLE_NAME, OLD.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_menu_items_revision
  AFTER UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION public.log_product_revision();
-- gift_sets, reciprocate_items 동일
```
- **AFTER UPDATE**인 이유: 기존 `update_*_updated_at`이 BEFORE 트리거라, AFTER 시점의 `NEW`에는 갱신된 `updated_at`이 들어 있다. `after` JSONB가 실제 저장 결과와 일치한다. 비교에서 `updated_at`을 빼는 건 "값이 안 바뀐 UPDATE"를 이력에서 제외하기 위함.
- `changed_by`: 콘솔 직접 수정 시 `auth.uid()`가 NULL → 누가 콘솔에서 고쳤는지 구분 가능.

### 4-6. 사장님 계정 지정 (운영 절차, 1회)
`user_profiles` 행은 로그인만으로는 생기지 않는다(프로필 이미지 업로드 시 `saveDbAvatarUrl`이 upsert). 그래서 UPDATE가 아니라 INSERT … ON CONFLICT로 지정한다. SQL Editor는 `auth.uid()`가 NULL이라 `protect_user_profiles_role` 트리거를 통과한다:
```sql
INSERT INTO user_profiles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = '<사장님 이메일>'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```
README에 절차를 남긴다. **마이그레이션(`admin_edit.sql`)은 코드 배포보다 먼저 실행해야 한다** — `auth.ts`가 `role` 컬럼을 조회하므로 컬럼 없는 DB에 코드가 먼저 가면 프로필 조회가 실패해 커스텀 아바타가 폴백된다.

## 5. 인증 — role을 `User`에 싣기

- `src/types/index.ts` `User`에 `role?: 'user' | 'admin'` 추가.
- `src/services/auth.ts`의 `getDbAvatarUrl(userId)`를 `getDbProfile(userId): { avatar_url, role }`로 확장(한 번의 `select("avatar_url, role")`). `mapSupabaseUser`가 `role`도 채운다.
- **`User`를 만드는 모든 지점**에서 프로필을 읽어야 한다: `getCurrentUser`, `signIn`, `signUp`, `onAuthStateChange` 콜백. 지금은 `getCurrentUser`만 DB를 읽어서, 로그인 직후 새로고침 전까지 `role`이 비는 문제가 생긴다. 이걸 막기 위해 프로필 조회를 `mapSupabaseUser` 호출부에 일원화한다.
- `useAuth()`가 `isAdmin: boolean` (`user?.role === 'admin'`)을 노출. `authStore`에 셀렉터 `selectIsAdmin` 추가.

## 6. 서비스 레이어

### 6-1. `src/services/admin.ts` (신규)
```ts
type EditableProductPatch = {
  price?: number;
  description?: string;
  is_active?: boolean;
  items?: string[];   // gift_sets만
};

export const adminService = {
  async updateProduct(productType: ProductType, id: string, patch: EditableProductPatch): Promise<void>,
  async getRevisions(productType: ProductType, id: string, limit = 10): Promise<ProductRevision[]>
};
```
- `ProductRevision` 타입(`src/types/index.ts`): `{ id, table_name, record_id, changed_by, changed_at, before, after }` — `before`/`after`는 `Record<string, unknown>`.
- `productType`→테이블명 매핑(`menu_item`→`menu_items` 등)은 `cart` 서비스에 이미 같은 매핑이 있으면 재사용, 없으면 여기서 정의.
- **화이트리스트**: `patch`에서 `price`, `description`, `is_active`, (gift_set일 때만) `items` 네 키만 뽑아 UPDATE 객체를 만든다. 그 외 키는 무시. `items`가 gift_set 아닌 타입에 오면 버린다.
- 클라이언트 검증(UX용): `price`는 정수·0 초과·1,000,000 이하, `description`은 trim 후 1자 이상, `items`는 각 항목 trim 후 빈 문자열 제거.
- `.update(patchObj).eq('id', id).select().single()`로 갱신된 행을 받아 RLS에 막혔을 때(0행 갱신)를 감지해 `"수정 권한이 없습니다"` 에러로 변환.
- 에러 메시지는 기존 `productService` 톤과 맞춘다(한국어, `console.error` + `throw new Error`).

### 6-2. `productService` 확장
- `getMenuItems(category?, opts?: { includeInactive?: boolean })` — `includeInactive`가 true면 `.eq('is_active', true)`를 건너뛴다. `getGiftSets`, `getReciprocateItems`, 단건 조회 3개도 동일.
- 훅(`useMenuItems` 등)은 `useAuthStore(selectIsAdmin)`로 읽어 `includeInactive`로 넘긴다. `useAuth()`는 초기화/구독 부수효과가 있어 데이터 훅 안에서 부르지 않는다. `isAdmin`이 바뀌면 `useCallback` 의존성으로 자연히 재조회된다. 비관리자 동작은 완전히 동일.

## 7. UI

### 7-1. 수정 버튼 (6곳)
| 위치 | 파일 | 비고 |
|---|---|---|
| 대표 메뉴 카드 | `src/components/menu/MenuCard.tsx` | 컴포넌트 |
| 선물세트 카드 | `app/gifts/page.tsx` 내 `GiftCard` | 인라인 카드 |
| 이바지·답례 카드 | `app/reciprocate/page.tsx` 내 `ReciprocateCard` | 인라인 카드 |
| 상세 (3타입 공통) | `src/components/product/ProductDetail.tsx` | `productType` prop 있음 |
| 홈 대표 메뉴 카드 | `src/components/home/FeaturedMenu.tsx` | props로 데이터 받음, `app/page.tsx`가 `refetch` 전달 |
| 홈 선물세트 카드 | `src/components/home/GiftSets.tsx` 내 `GiftSetCard` | `</Overlay>` 뒤 삽입, `onSaved` 한 단계 더 내림 |

> 홈 2곳은 처음 설계에서 의도적으로 제외(4곳)했으나 2026-09-15 사용자 요청으로 추가. `usePopularItems`도 다른 훅과 같이 `includeInactive` + `refetch`를 갖는다.

- `isAdmin`이 false면 버튼이 **렌더되지 않는다**(disabled가 아님).
- 카드에서는 `Link` 클릭과 겹치지 않게 `e.preventDefault(); e.stopPropagation()`.
- 노출 off 상품은 관리자 화면에서 카드에 "숨김" 배지를 얹어 구분.
- 스타일: Styled Components, `$` 접두사 props, 테마 `primary #f35525`. 카드 우상단 작은 아이콘 버튼(react-icons `FiEdit2` 등).

### 7-2. 공용 모달 `src/components/admin/ProductEditModal.tsx` (신규)
Props: `{ productType, product, onClose, onSaved }`.

필드:
- 가격 — `<input type="number">`, 천단위 미리보기
- 설명 — `<textarea>`; 개입 수량은 이 문장 안에 있음을 도움말로 표기(예: `(1되/40개입)` 형식 유지)
- 노출 — 토글
- 구성품목 — `gift_sets`일 때만. 항목별 input + 삭제, "항목 추가" 버튼

상태: 2단계. **편집 → 확인**.
1. 편집 단계에서 "저장" 클릭 → 클라이언트 검증 → 변경된 필드가 하나도 없으면 "변경된 내용이 없습니다"로 종료.
2. 확인 단계: 변경된 필드만 전/후 대조표.
   ```
   가격     35,000원  →  39,000원
   구성     3개 항목  →  4개 항목   (펼치면 항목 diff)
   노출     켜짐      →  꺼짐
   [취소]  [확인하고 수정]
   ```
3. "확인하고 수정" → `adminService.updateProduct` → 성공 시 `onSaved()`(호출부에서 `refetch()`) → 모달 닫힘. 실패 시 확인 단계에 에러 문구 표시, 모달 유지.

접근성/UX: ESC·배경 클릭으로 닫힘(단, 저장 중에는 잠금), 저장 버튼 로딩 상태, 모바일에서 풀시트.

### 7-3. 최근 수정 이력 + 되돌리기 (모달 하단, 접힘 영역)
- 모달이 열릴 때 `adminService.getRevisions(productType, id, 10)`로 최근 10건 조회.
- 각 줄: `2026-09-14 15:02 · 가격 35,000 → 39,000 · 노출 켜짐 → 꺼짐` 형태로, 편집 가능 4컬럼 중 바뀐 것만 요약. `changed_by`가 NULL이면 "(콘솔 수정)" 표기.
- 줄마다 "이 값으로 되돌리기" 버튼 → `before`에서 **편집 가능 4컬럼만** 꺼내 폼 값을 덮어쓰고 곧바로 **확인 단계**로 진입(현재 값 → 되돌릴 값 대조표). 별도 되돌리기 API는 없다 — `updateProduct`를 그대로 타므로 되돌린 것도 이력에 남고, 되돌리기를 되돌릴 수 있다.
- 이력이 없으면 영역 자체를 숨긴다.

### 7-4. 호출부 연결
각 목록 페이지/상세는 `editingProduct` 상태 하나를 들고 모달을 조건부 렌더. 저장 성공 시 해당 훅의 `refetch()`(단건 훅 `useMenuItem` 등에는 `refetch`가 없어 추가).

## 8. 에러 처리

| 상황 | 처리 |
|---|---|
| RLS 거부(비관리자가 API 직접 호출) | Supabase가 0행 갱신 → `"수정 권한이 없습니다"` |
| DB CHECK 위반(가격 0 등) | Postgres 23514 → `"가격은 1원 이상 1,000,000원 이하여야 합니다"` |
| 네트워크/기타 | 원본 메시지 포함한 일반 에러, 모달 유지 |
| 로그인 세션 만료 | 기존 `useAuth` 흐름대로 `user` null → 버튼 사라짐 |

## 9. 리포 SQL 파일 처리

`supabase/seed_data.sql`, `supabase/cleanup_and_reseed.sql`은 사장님이 편집을 시작하는 순간 stale이 된다. 더 이상 동기화하지 않는다.
- 두 파일 상단 주석에 "초기 구축용 스냅샷. 실 데이터의 단일 출처는 라이브 DB이며 변경 이력은 `product_revisions`" 명시.
- `price_update_2026_07.sql` 같은 1회성 패치 파일은 더 만들지 않는다.
- CLAUDE.md의 DB 스키마 섹션에 `user_profiles.role`, `product_revisions` 반영, README에 관리자 지정 절차(4-6) 추가.

## 10. 검증 계획

테스트 러너를 새로 들이지 않는다. 대신:

### 10-1. RLS 검증 (필수, SQL Editor)
`SET LOCAL`은 트랜잭션 안에서만 유효하므로 `BEGIN … ROLLBACK`으로 감싼다. 실 데이터는 건드리지 않는다.
```sql
-- (A) 비관리자 시뮬레이션
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<일반 유저 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET price = 99999 WHERE name = '모찌';              -- UPDATE 0
SELECT count(*) FROM menu_items WHERE is_active = false;             -- 0 (비활성 안 보임)
UPDATE user_profiles SET role = 'admin' WHERE user_id = auth.uid();  -- ERROR 42501 (4-1b)
ROLLBACK;

-- (B) 관리자 시뮬레이션
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET price = 99999 WHERE name = '모찌';              -- UPDATE 1
SELECT count(*) FROM menu_items WHERE is_active = false;             -- 실제 비활성 수 (보임)
INSERT INTO menu_items (name, price, category) VALUES ('x', 1000, 'others'); -- 거부 (INSERT 정책 없음)
DELETE FROM menu_items WHERE name = '모찌';                           -- DELETE 0 (DELETE 정책 없음)
UPDATE menu_items SET price = 0 WHERE name = '모찌';                  -- ERROR 23514 (CHECK)
SELECT changed_by, before->>'price', after->>'price'
  FROM product_revisions ORDER BY changed_at DESC LIMIT 1;           -- 관리자 uuid, 45000, 99999
UPDATE menu_items SET price = 99999 WHERE name = '모찌';              -- 값 동일 → 이력 추가 안 됨
ROLLBACK;
```
`<uuid>`는 `SELECT id, email FROM auth.users`로 확인해서 채운다.

### 10-2. 수동 시나리오 (브라우저)
1. 비관리자 로그인 → 6곳 어디에도 수정 버튼 없음, 노출 off 상품 안 보임
2. 관리자 로그인 → 버튼 보임, 숨김 배지 보임
3. 가격만 변경 → 확인 대조표에 가격 한 줄만 → 수정 → 카드 즉시 갱신
4. 선물세트 구성 항목 추가/삭제 → 대조표 → 수정 → 상세에서 반영 확인
5. 노출 off → 로그아웃 → 목록에서 사라짐 → 관리자 재로그인 → 숨김 배지로 보임 → 다시 on
6. 변경 없이 저장 → "변경된 내용이 없습니다"
7. 가격 0 입력 → 클라이언트에서 막힘; DevTools로 우회 시 DB 에러 메시지 표시
8. 로그인 직후(새로고침 없이) 버튼이 바로 보이는지 (5절 role 로딩 확인)
9. 가격을 두 번 바꾼 뒤 이력 영역에서 첫 번째 값으로 되돌리기 → 대조표 → 수정 → 이력에 3건
10. `npm run build`, `npm run lint` 통과

## 11. 후속 (이번 범위 밖)
- Phase 4-D 주문 관리에서 `is_admin()` 재사용
- `src/types/index.ts`의 유령 필드(`unit`, `seasonal`, `priceMax` — DB 컬럼 없음) 정리
