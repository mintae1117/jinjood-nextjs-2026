-- =====================================================
-- storage_policies.sql + admin_image.sql 검증 — Supabase SQL Editor에서 **파일 전체를 한 번에 실행**한다.
-- 결과 표(result 열 ✓/✗)가 마지막에 나온다. 채워 넣을 값 없음: 관리자(user_profiles.role='admin')와
-- 일반 유저(그 외 계정)를 auth.users 에서 자동으로 고른다.
--
-- 실 데이터는 바뀌지 않는다: 각 검사는 서브트랜잭션 안에서 실행한 뒤 강제로 되돌린다(성공했어도 롤백).
-- 그래서 storage.objects·menu_items·product_revisions 에 아무것도 남지 않는다.
-- 전제: admin_edit.sql(is_admin, 관리자 지정) → storage_policies.sql → admin_image.sql → admin_revision_retention.sql 을 먼저 실행했을 것.
-- =====================================================

DROP TABLE IF EXISTS verify_results;
CREATE TEMP TABLE verify_results (
  seq        serial,
  check_name text,
  expected   text,
  actual     text,
  ok         boolean
);

-- 검사 실행기: 주어진 uid 의 로그인 세션(authenticated + JWT claims)으로 stmt 를 실행하고
-- 결과(영향 행 수 또는 에러 코드)를 기록한 뒤 서브트랜잭션을 되돌린다. 세션 전용(pg_temp) 함수라 DB 에 남지 않는다.
CREATE OR REPLACE FUNCTION pg_temp.verify(check_name text, uid uuid, stmt text, expect text)
RETURNS void
LANGUAGE plpgsql
AS $fn$
DECLARE
  n      int;
  actual text;
BEGIN
  BEGIN
    PERFORM set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    EXECUTE stmt;
    GET DIAGNOSTICS n = ROW_COUNT;
    -- 성공했으면 결과만 들고 서브트랜잭션을 되돌린다(SET LOCAL ROLE·claims 도 함께 원복)
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'verify_rollback:' || n;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE 'verify_rollback:%' THEN
      actual := 'rows ' || split_part(SQLERRM, ':', 2);
    ELSE
      actual := 'ERROR ' || SQLSTATE;
    END IF;
  END;
  INSERT INTO verify_results (check_name, expected, actual, ok)
  VALUES (check_name, expect, actual, actual = expect);
END;
$fn$;

-- 바깥 블록은 이름 있는 태그($verify$)로 감싼다 — 안쪽 문장의 $q$·$d$ 태그가 붙어 이어지면 무명 달러 인용
-- 두 개가 만들어져 바깥 블록이 거기서 끊긴다(2026-09-18 실제 42601).
DO $verify$
DECLARE
  admin_id    uuid;
  admin_email text;
  user_id     uuid;
  user_email  text;
  item        text;
BEGIN
  SELECT p.user_id, u.email INTO admin_id, admin_email
    FROM user_profiles p JOIN auth.users u ON u.id = p.user_id
    WHERE p.role = 'admin' ORDER BY u.created_at LIMIT 1;
  SELECT u.id, u.email INTO user_id, user_email
    FROM auth.users u LEFT JOIN user_profiles p ON p.user_id = u.id
    WHERE COALESCE(p.role, 'user') <> 'admin' ORDER BY u.created_at LIMIT 1;
  SELECT name INTO item FROM menu_items ORDER BY display_order LIMIT 1;

  INSERT INTO verify_results (check_name, expected, actual, ok) VALUES
    ('픽스처: 관리자 계정', 'role=admin 1명 이상', COALESCE(admin_email, '(없음 — README "관리자 지정" 먼저)'), admin_id IS NOT NULL),
    ('픽스처: 일반 유저 계정', '관리자 아닌 계정 1명 이상', COALESCE(user_email, '(없음 — 일반 계정으로 한 번 가입)'), user_id IS NOT NULL),
    ('픽스처: 상품 행', 'menu_items 1행 이상', COALESCE(item, '(없음)'), item IS NOT NULL);
  IF admin_id IS NULL OR user_id IS NULL OR item IS NULL THEN
    RETURN;
  END IF;

  -- (A) 일반 유저 — Storage 정책
  PERFORM pg_temp.verify('(A) 일반 유저: products/ 업로드 차단', user_id,
    $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'products/menu_items/verify.webp')$q$, 'ERROR 42501');
  PERFORM pg_temp.verify('(A) 일반 유저: 타인 아바타 업로드 차단', user_id,
    format($q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/%s.png')$q$, admin_id), 'ERROR 42501');
  PERFORM pg_temp.verify('(A) 일반 유저: 본인 아바타 업로드 허용', user_id,
    format($q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/%s.png')$q$, user_id), 'rows 1');
  PERFORM pg_temp.verify('(A) 일반 유저: 기존 폴더(menu/) 업로드 차단', user_id,
    $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'menu/verify.webp')$q$, 'ERROR 42501');
  -- (A) 일반 유저 — 상품 테이블
  PERFORM pg_temp.verify('(A) 일반 유저: 상품 image_url UPDATE 0행(RLS)', user_id,
    format($q$UPDATE menu_items SET image_url = 'products/menu_items/verify.webp' WHERE name = %L$q$, item), 'rows 0');

  -- (B) 관리자 — Storage 정책
  PERFORM pg_temp.verify('(B) 관리자: is_admin() = true', admin_id,
    $q$SELECT 1 WHERE public.is_admin()$q$, 'rows 1');
  PERFORM pg_temp.verify('(B) 관리자: products/ 업로드 허용', admin_id,
    $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'products/menu_items/verify.webp')$q$, 'rows 1');
  PERFORM pg_temp.verify('(B) 관리자: 기존 폴더(menu/) 업로드 차단', admin_id,
    $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'menu/verify.webp')$q$, 'ERROR 42501');
  PERFORM pg_temp.verify('(B) 관리자: 타인 아바타 업로드 차단', admin_id,
    format($q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/%s.png')$q$, user_id), 'ERROR 42501');

  -- (C) 관리자 — image_url 컬럼 GRANT + CHECK (admin_image.sql)
  PERFORM pg_temp.verify('(C) 관리자: image_url UPDATE 허용', admin_id,
    format($q$UPDATE menu_items SET image_url = 'products/menu_items/verify.webp' WHERE name = %L$q$, item), 'rows 1');
  PERFORM pg_temp.verify('(C) 관리자: 외부 URL 거부(CHECK)', admin_id,
    format($q$UPDATE menu_items SET image_url = 'https://evil.example/x.png' WHERE name = %L$q$, item), 'ERROR 23514');
  PERFORM pg_temp.verify('(C) 관리자: 경로 탈출(..) 거부(CHECK)', admin_id,
    format($q$UPDATE menu_items SET image_url = '../x.png' WHERE name = %L$q$, item), 'ERROR 23514');
  PERFORM pg_temp.verify('(C) 관리자: name 수정 차단(컬럼 GRANT 밖, 회귀)', admin_id,
    format($q$UPDATE menu_items SET name = '검증' WHERE name = %L$q$, item), 'ERROR 42501');
  PERFORM pg_temp.verify('(C) 관리자: 상품 INSERT 차단(정책 없음, 회귀)', admin_id,
    $q$INSERT INTO menu_items (name, price, category) VALUES ('검증용', 1000, 'others')$q$, 'ERROR 42501');

  -- (D) 이력 상한 (admin_revision_retention.sql) — 31번 고친 뒤 이 상품의 이력이 정확히 30건인지. 에러 없음(rows 0)이 통과.
  --     실패하면 'ERROR P0002'(건수가 30이 아님 — admin_revision_retention.sql 을 아직 안 돌린 경우 그렇다).
  PERFORM pg_temp.verify('(D) 이력 상한: 31번 수정 뒤 상품별 30건만 남는다', admin_id,
    format($q$DO $d$
      DECLARE rid uuid; c int; i int;
      BEGIN
        SELECT id INTO rid FROM menu_items WHERE name = %L;
        FOR i IN 1..31 LOOP
          UPDATE menu_items SET description = 'verify ' || i WHERE id = rid;
        END LOOP;
        SELECT count(*) INTO c FROM product_revisions WHERE table_name = 'menu_items' AND record_id = rid;
        IF c <> 30 THEN RAISE EXCEPTION 'retention: %% rows', c USING ERRCODE = 'P0002'; END IF;
      END $d$
    $q$, item), 'rows 0');
END;
$verify$;

-- 결과 표. ✗ 가 있으면 actual 을 보고 해당 SQL(storage_policies / admin_image / admin_edit)을 다시 확인한다.
-- 'ERROR 42501' = 권한 없음(RLS/GRANT), 'ERROR 23514' = CHECK 위반, 'rows N' = 정상 실행 후 되돌림.
SELECT seq, check_name, expected, actual, CASE WHEN ok THEN '✓' ELSE '✗' END AS result
FROM verify_results
ORDER BY seq;
