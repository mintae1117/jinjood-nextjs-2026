-- =====================================================
-- 수정 이력 상한 (2026-09-18). Supabase SQL Editor에서 1회 실행. 재실행 안전.
-- 상품별 최근 30건만 남기고 그 이전 이력은 지운다. 이미지 파일은 브라우저가 저장 뒤 "현재 이미지 + 남은 이력이
-- 가리키는 파일" 만 남기고 정리한다(storageService.pruneProductImages). 즉 "최근 30번의 수정까지는 이미지 포함 되돌릴 수 있다".
-- 선행: admin_edit.sql (product_revisions·log_product_revision 트리거)
-- 유지 건수 30 은 web-react `src/utils/adminProduct.ts` 의 REVISION_RETENTION 과 함께 바꿀 것.
-- =====================================================

-- 1. 같은 트랜잭션 안의 이력은 changed_at(= 트랜잭션 시작 시각)이 같아 "오래된 것" 을 가를 수 없다 → 단조 증가 seq.
--    기존 행에는 임의 순서로 채워지지만 실사용(저장마다 별도 트랜잭션)에서는 changed_at 순과 같다.
ALTER TABLE product_revisions ADD COLUMN IF NOT EXISTS seq BIGSERIAL;
CREATE INDEX IF NOT EXISTS idx_product_revisions_record_seq
  ON product_revisions (table_name, record_id, seq DESC);

-- 2. 이력 트리거 교체: 1행 넣은 직후 그 상품의 31번째 이후(오래된 것)를 지운다.
--    SECURITY DEFINER(소유자 권한)라 RLS 를 넘어 DELETE 할 수 있다 — 브라우저 세션은 여전히 지울 수 없다.
CREATE OR REPLACE FUNCTION public.log_product_revision()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  retention CONSTANT int := 30;
BEGIN
  IF (to_jsonb(OLD) - 'updated_at') IS DISTINCT FROM (to_jsonb(NEW) - 'updated_at') THEN
    INSERT INTO product_revisions (table_name, record_id, changed_by, before, after)
    VALUES (TG_TABLE_NAME, OLD.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));

    DELETE FROM product_revisions r
    WHERE r.table_name = TG_TABLE_NAME
      AND r.record_id = OLD.id
      AND r.seq NOT IN (
        SELECT seq FROM product_revisions
        WHERE table_name = TG_TABLE_NAME AND record_id = OLD.id
        ORDER BY seq DESC
        LIMIT retention
      );
  END IF;
  RETURN NEW;
END;
$$;
-- 트리거(log_*_revision AFTER UPDATE 3개)는 admin_edit.sql 의 것을 그대로 쓴다 — 함수만 바뀌었다.

-- 3. (선택) 이미 30건을 넘는 상품이 있으면 한 번 정리. 다음 수정 때 트리거가 알아서 하므로 필수는 아니다.
DELETE FROM product_revisions r
WHERE r.seq NOT IN (
  SELECT seq FROM (
    SELECT seq, row_number() OVER (PARTITION BY table_name, record_id ORDER BY seq DESC) AS rn
    FROM product_revisions
  ) ranked WHERE rn <= 30
);

-- =====================================================
-- 롤백 (필요 시 주석 해제 후 실행): admin_edit.sql §5 의 원래 함수 정의를 다시 실행하면 상한이 사라진다.
-- seq 컬럼·인덱스는 무해하므로 두어도 된다.
-- =====================================================
