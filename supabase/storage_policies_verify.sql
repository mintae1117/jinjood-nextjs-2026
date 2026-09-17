-- =====================================================
-- storage_policies.sql 검증 — Supabase SQL Editor에서 실행. 전부 BEGIN … ROLLBACK 이라 실 데이터는 바뀌지 않는다.
-- <일반 유저 uuid>, <관리자 uuid>는 SELECT id, email FROM auth.users; 로 확인해 채운다.
-- storage.objects 에 직접 행을 넣어 정책만 확인한다(실제 파일은 만들지 않는다). 기대값은 각 줄 주석.
-- 에러가 나는 검사는 각각 독립 트랜잭션이다 — 한 트랜잭션 안에서 에러가 나면 이후 명령이 전부
-- "current transaction is aborted" 로만 실패해 에러 코드를 구분할 수 없다.
-- =====================================================

-- (A) 일반 유저: 상품 폴더 업로드 불가
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<일반 유저 uuid>","role":"authenticated"}', true);
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'products/menu_items/verify.webp');  -- ERROR 42501 (RLS)
ROLLBACK;

-- (A-2) 일반 유저: 타인 아바타 불가
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<일반 유저 uuid>","role":"authenticated"}', true);
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/<관리자 uuid>.png');        -- ERROR 42501
ROLLBACK;

-- (A-3) 일반 유저: 본인 아바타는 가능, 상품 image_url 은 RLS 로 0행
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<일반 유저 uuid>","role":"authenticated"}', true);
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/<일반 유저 uuid>.png');      -- INSERT 0 1
SELECT count(*) FROM storage.objects WHERE name = 'avatars/<일반 유저 uuid>.png';                    -- 1 (본인 파일은 보임)
UPDATE menu_items SET image_url = 'products/menu_items/verify.webp' WHERE name = '모찌';           -- UPDATE 0
ROLLBACK;

-- (B) 관리자: products/ 업로드·삭제 가능, 기존 폴더는 불가 — 실행 전 관리자 uuid 에 role='admin' 이 있어야 한다
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
SELECT public.is_admin();                                                                          -- true
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'products/menu_items/verify.webp');  -- INSERT 0 1
DELETE FROM storage.objects WHERE name = 'products/menu_items/verify.webp';                        -- DELETE 1
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'menu/verify.webp');                -- ERROR 42501 (기존 폴더는 닫힘)
ROLLBACK;

-- (C) 관리자: image_url UPDATE + CHECK — admin_image.sql 실행 후에만 의미 있음
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET image_url = 'products/menu_items/verify.webp' WHERE name = '모찌';           -- UPDATE 1
SELECT before->>'image_url', after->>'image_url' FROM product_revisions
  WHERE table_name = 'menu_items' AND record_id = (SELECT id FROM menu_items WHERE name = '모찌')
  ORDER BY changed_at DESC LIMIT 1;                                                                -- menu/…, products/menu_items/verify.webp
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET image_url = 'https://evil.example/x.png' WHERE name = '모찌';               -- ERROR 23514 (menu_items_image_url_path)
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET image_url = '../x.png' WHERE name = '모찌';                                   -- ERROR 23514
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"<관리자 uuid>","role":"authenticated"}', true);
UPDATE menu_items SET name = '검증' WHERE name = '모찌';                                            -- ERROR 42501 (컬럼 GRANT 밖, 회귀 확인)
ROLLBACK;
