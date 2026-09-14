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
