-- =====================================================
-- storage_policies.sql + admin_image.sql + admin_revision_retention.sql 검증.
-- Supabase SQL Editor 에서 파일 전체를 붙여 넣고(전체 선택 후) Run. 마지막에 결과 표(result 열 ✓/✗)가 나온다.
-- 채워 넣을 값 없음: 관리자(user_profiles.role = admin)와 일반 유저(그 외 계정)를 auth.users 에서 자동으로 고른다.
--
-- 실 데이터는 바뀌지 않는다: 각 검사는 서브트랜잭션 안에서 실행한 뒤 강제로 되돌린다(성공했어도 롤백).
-- 결과 표와 실행기 함수는 verify_tmp 스키마에 만든다(PostgREST 에 노출되지 않는 스키마, 재실행 시 자동 재생성).
-- 다 보고 지우려면:  DROP SCHEMA verify_tmp CASCADE;
-- 전제: admin_edit.sql, storage_policies.sql, admin_image.sql, admin_revision_retention.sql 을 먼저 실행했을 것.
-- 주의: 이 파일의 주석에는 달러 태그를 쓰지 않는다(SQL Editor 가 주석 안의 태그를 문자열 시작으로 읽을 수 있다).
-- =====================================================

DROP SCHEMA IF EXISTS verify_tmp CASCADE;
CREATE SCHEMA verify_tmp;

CREATE TABLE verify_tmp.results (
  seq        serial,
  check_name text,
  expected   text,
  actual     text,
  ok         boolean
);

CREATE FUNCTION verify_tmp.run(check_name text, uid uuid, stmt text, expect text)
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
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'verify_rollback:' || n;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE 'verify_rollback:%' THEN
      actual := 'rows ' || split_part(SQLERRM, ':', 2);
    ELSE
      actual := 'ERROR ' || SQLSTATE;
    END IF;
  END;
  INSERT INTO verify_tmp.results (check_name, expected, actual, ok)
  VALUES (check_name, expect, actual, actual = expect);
END;
$fn$;

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

  INSERT INTO verify_tmp.results (check_name, expected, actual, ok) VALUES
    ('픽스처: 관리자 계정', 'role=admin 1명 이상', COALESCE(admin_email, '(없음: README 관리자 지정 먼저)'), admin_id IS NOT NULL),
    ('픽스처: 일반 유저 계정', '관리자 아닌 계정 1명 이상', COALESCE(user_email, '(없음: 일반 계정으로 한 번 가입)'), user_id IS NOT NULL),
    ('픽스처: 상품 행', 'menu_items 1행 이상', COALESCE(item, '(없음)'), item IS NOT NULL);
  IF admin_id IS NULL OR user_id IS NULL OR item IS NULL THEN
    RETURN;
  END IF;

  PERFORM verify_tmp.run('(A) 일반 유저: products/ 업로드 차단', user_id,
    $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'products/menu_items/verify.webp')$q$, 'ERROR 42501');
  PERFORM verify_tmp.run('(A) 일반 유저: 타인 아바타 업로드 차단', user_id,
    format($q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/%s.png')$q$, admin_id), 'ERROR 42501');
  PERFORM verify_tmp.run('(A) 일반 유저: 본인 아바타 업로드 허용', user_id,
    format($q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/%s.png')$q$, user_id), 'rows 1');
  PERFORM verify_tmp.run('(A) 일반 유저: 기존 폴더(menu/) 업로드 차단', user_id,
    $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'menu/verify.webp')$q$, 'ERROR 42501');
  PERFORM verify_tmp.run('(A) 일반 유저: 상품 image_url UPDATE 0행(RLS)', user_id,
    format($q$UPDATE menu_items SET image_url = 'products/menu_items/verify.webp' WHERE name = %L$q$, item), 'rows 0');

  PERFORM verify_tmp.run('(B) 관리자: is_admin() = true', admin_id,
    $q$SELECT 1 WHERE public.is_admin()$q$, 'rows 1');
  PERFORM verify_tmp.run('(B) 관리자: products/ 업로드 허용', admin_id,
    $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'products/menu_items/verify.webp')$q$, 'rows 1');
  PERFORM verify_tmp.run('(B) 관리자: 기존 폴더(menu/) 업로드 차단', admin_id,
    $q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'menu/verify.webp')$q$, 'ERROR 42501');
  PERFORM verify_tmp.run('(B) 관리자: 타인 아바타 업로드 차단', admin_id,
    format($q$INSERT INTO storage.objects (bucket_id, name) VALUES ('images', 'avatars/%s.png')$q$, user_id), 'ERROR 42501');

  PERFORM verify_tmp.run('(C) 관리자: image_url UPDATE 허용', admin_id,
    format($q$UPDATE menu_items SET image_url = 'products/menu_items/verify.webp' WHERE name = %L$q$, item), 'rows 1');
  PERFORM verify_tmp.run('(C) 관리자: 외부 URL 거부(CHECK)', admin_id,
    format($q$UPDATE menu_items SET image_url = 'https://evil.example/x.png' WHERE name = %L$q$, item), 'ERROR 23514');
  PERFORM verify_tmp.run('(C) 관리자: 경로 탈출(..) 거부(CHECK)', admin_id,
    format($q$UPDATE menu_items SET image_url = '../x.png' WHERE name = %L$q$, item), 'ERROR 23514');
  PERFORM verify_tmp.run('(C) 관리자: name 수정 차단(컬럼 GRANT 밖, 회귀)', admin_id,
    format($q$UPDATE menu_items SET name = '검증' WHERE name = %L$q$, item), 'ERROR 42501');
  PERFORM verify_tmp.run('(C) 관리자: 상품 INSERT 차단(정책 없음, 회귀)', admin_id,
    $q$INSERT INTO menu_items (name, price, category) VALUES ('검증용', 1000, 'others')$q$, 'ERROR 42501');

  PERFORM verify_tmp.run('(D) 이력 상한: 31번 수정 뒤 상품별 30건만 남는다 (P0002 면 retention SQL 미적용)', admin_id,
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

SELECT seq, check_name, expected, actual, CASE WHEN ok THEN '✓' ELSE '✗' END AS result
FROM verify_tmp.results
ORDER BY seq;
