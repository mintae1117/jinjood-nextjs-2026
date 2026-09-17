-- =====================================================
-- Storage 정책 정비 (2026-09-17). Supabase SQL Editor에서 1회 실행. 재실행 안전(DROP IF EXISTS).
-- 설계: docs/superpowers/specs/2026-09-17-admin-product-image-design.md §4-1
--
-- 배경: 기존 정책 "Authenticated users can manage images"(FOR ALL, bucket_id = 'images')가
-- 로그인한 모든 사용자에게 버킷 전체 조회·업로드·덮어쓰기·삭제를 허용했다(상품 이미지·배너·타인 아바타 포함).
-- 버킷은 public 이라 표시용 URL(/storage/v1/object/public/…)은 정책과 무관하게 읽힌다.
-- 정책은 API(list·upload·remove)에만 걸린다.
--
-- 사전 확인(선택): 현재 정책 목록
--   SELECT policyname, cmd, roles, qual FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can manage images" ON storage.objects;

-- 아바타: 본인 파일(avatars/<uid>.<ext>)만. 기존 authService.uploadAvatar 의 list → remove → upload 가 그대로 동작한다.
DROP POLICY IF EXISTS "Users manage own avatar" ON storage.objects;
CREATE POLICY "Users manage own avatar" ON storage.objects
  FOR ALL TO authenticated
  USING      (bucket_id = 'images' AND name LIKE 'avatars/' || auth.uid()::text || '.%')
  WITH CHECK (bucket_id = 'images' AND name LIKE 'avatars/' || auth.uid()::text || '.%');

-- 상품 이미지: products/ 아래는 관리자만(조회·업로드·덮어쓰기·삭제).
-- 삭제까지 여는 이유: UPDATE 실패 시 방금 올린 파일 회수 + 후속 상품 추가/삭제 흐름이 그대로 쓴다.
-- 기존 menu/·banners/·sns/·videos/ 는 이제 브라우저에서 아무도 쓸 수 없다(대시보드 전용).
DROP POLICY IF EXISTS "Admins manage product images" ON storage.objects;
CREATE POLICY "Admins manage product images" ON storage.objects
  FOR ALL TO authenticated
  USING      (bucket_id = 'images' AND name LIKE 'products/%' AND public.is_admin())
  WITH CHECK (bucket_id = 'images' AND name LIKE 'products/%' AND public.is_admin());

-- =====================================================
-- 롤백 (필요 시 주석 해제 후 실행) — 마이그레이션 전의 넓은 정책으로 복원
-- =====================================================
-- DROP POLICY IF EXISTS "Users manage own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins manage product images" ON storage.objects;
-- CREATE POLICY "Authenticated users can manage images" ON storage.objects
--   FOR ALL TO authenticated
--   USING (bucket_id = 'images') WITH CHECK (bucket_id = 'images');
