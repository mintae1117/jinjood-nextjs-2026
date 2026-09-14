-- =====================================================
-- admin_edit.sql 검증 스크립트 — Supabase SQL Editor에서 실행
-- 전부 BEGIN … ROLLBACK 이라 실 데이터는 바뀌지 않는다.
-- <일반 유저 uuid>, <관리자 uuid>는 SELECT id, email FROM auth.users; 로 확인해 채운다.
-- 기대 결과는 각 줄 주석에 적어두었다. 하나라도 다르면 admin_edit.sql을 다시 확인한다.
-- =====================================================

-- (A) 비관리자 시뮬레이션
BEGIN;
-- 픽스처: 일반 유저의 user_profiles 행이 없으면 아래 role 변경 검사가 WHERE 0행으로 공회전한다
-- (트리거가 아예 안 돌아 에러 없이 UPDATE 0 → 권한 상승 방어를 검증하지 못함)
INSERT INTO user_profiles (user_id, role)
VALUES ('<일반 유저 uuid>', 'user')
ON CONFLICT (user_id) DO NOTHING;

-- 픽스처: 비활성 행이 0개면 아래 "비활성 안 보임" 검사가 공회전한다(정책이 깨져도 0이 나옴)
UPDATE menu_items SET is_active = false WHERE name = '백설기';
SELECT count(*) FROM menu_items WHERE name = '백설기' AND is_active = false;              -- 1 (기본 역할, RLS 우회)

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<일반 유저 uuid>","role":"authenticated"}', true);

SELECT public.is_admin();                                              -- false
UPDATE menu_items SET price = 99999 WHERE name = '모찌';               -- UPDATE 0
SELECT count(*) FROM menu_items WHERE name = '백설기' AND is_active = false;              -- 0  ← 관리자 SELECT 정책이 비관리자에게 새면 1이 나온다
SELECT count(*) FROM product_revisions;                               -- 0 (이력 안 보임)
UPDATE user_profiles SET role = 'admin' WHERE user_id = auth.uid();   -- ERROR 42501 "role은 변경할 수 없습니다"  ← "UPDATE 0"이 나오면 픽스처 실패, 검사 무효
ROLLBACK;

-- (B) 관리자 시뮬레이션 — 실행 전 관리자 uuid에 role='admin'이 이미 지정돼 있어야 한다
BEGIN;
-- 픽스처: 관리자가 비활성 상품도 보는지 검사하려면 실제 비활성 행이 있어야 한다
UPDATE menu_items SET is_active = false WHERE name = '백설기';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);

SELECT public.is_admin();                                              -- true
UPDATE menu_items SET price = 99999 WHERE name = '모찌';               -- UPDATE 1
SELECT changed_by, before->>'price', after->>'price'
  FROM product_revisions WHERE table_name = 'menu_items'
    AND record_id = (SELECT id FROM menu_items WHERE name = '모찌')
  ORDER BY changed_at DESC LIMIT 1;                                   -- <관리자 uuid>, 45000, 99999
UPDATE menu_items SET price = 99999 WHERE name = '모찌';               -- UPDATE 1 이지만 아래 count 그대로 (값 동일 → 이력 없음)
SELECT count(*) FROM product_revisions WHERE table_name = 'menu_items'
   AND record_id = (SELECT id FROM menu_items WHERE name = '모찌');    -- 1
SELECT count(*) FROM menu_items WHERE name = '백설기' AND is_active = false;              -- 1 (관리자는 비활성도 보임)
INSERT INTO menu_items (name, price, category) VALUES ('검증용', 1000, 'others'); -- ERROR 42501 (INSERT 정책 없음)
ROLLBACK;

-- 아래 세 검사는 각각 독립된 BEGIN…ROLLBACK이다: 한 트랜잭션 안에서 에러가 나면
-- 이후 모든 명령이 실제 에러 대신 "current transaction is aborted"로만 실패해
-- 각 에러 코드를 단독으로 확인할 수 없다(3b 회수 이후 DELETE도 즉시 에러가 되어 해당).
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
DELETE FROM menu_items WHERE name = '모찌';                            -- ERROR 42501 (DELETE 권한 없음, 3b에서 회수)
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET price = 0 WHERE name = '모찌';                   -- ERROR 23514 (menu_items_price_range)
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET name = '이름변경시도' WHERE name = '모찌';       -- ERROR 42501 (name 컬럼 GRANT 없음)
ROLLBACK;

-- (C) SQL Editor(auth.uid() IS NULL) 직접 수정도 이력에 남는지
BEGIN;
UPDATE gift_sets SET price = price + 1 WHERE name = '떡국세트 1호';
SELECT changed_by, table_name FROM product_revisions
 WHERE table_name = 'gift_sets' AND record_id = (SELECT id FROM gift_sets WHERE name = '떡국세트 1호')
 ORDER BY changed_at DESC LIMIT 1;                                    -- NULL, gift_sets
ROLLBACK;
