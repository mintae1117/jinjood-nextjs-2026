# 관리자 상품 이미지 교체 (브라우저 최적화 + Storage 정책 정비) 설계

- 작성: 2026-09-17
- 선행: `docs/superpowers/specs/2026-09-14-admin-product-edit-design.md` (관리자 상품 편집). 이 문서는 그 구조 위에 `image_url` 편집을 얹는다.
- 후속 예정: 상품 추가·삭제(카테고리별). §11에 이번 작업이 미리 마련해 두는 지점을 적었다.

## 1. 배경과 목표

관리자(사장님)가 상품 카드·상세의 "수정" 모달에서 가격·설명·구성품·노출만 고칠 수 있고 이미지는 바꿀 수 없다. 이미지는 Supabase 대시보드에 파일을 올리고 `image_url`을 SQL로 고쳐야 한다.

목표:
1. 모달에서 새 이미지를 골라 상품 대표 이미지를 교체한다.
2. 휴대폰 원본(수 MB, 4000px)이 들어와도 **브라우저에서** 화질이 깨지지 않는 선까지 줄여 Storage에 올린다 — Supabase 무료 플랜의 Storage 1GB·egress 월 ~5GB를 지키기 위함.
3. 조사에서 드러난 Storage 정책 결함을 함께 고친다: `Authenticated users can manage images`(FOR ALL, `bucket_id = 'images'`)가 로그인한 모든 사용자에게 버킷 전체 쓰기·삭제를 허용하고 있다.

## 2. 범위

### 포함
- 상품 3테이블(`menu_items`·`gift_sets`·`reciprocate_items`)의 `image_url` 교체. 상품당 이미지 1장(현 스키마 그대로).
- 브라우저 이미지 최적화(리사이즈·재인코딩·메타데이터 제거).
- Storage 정책 분리(아바타는 본인 파일만, 상품 폴더는 관리자만).
- 이력·되돌리기가 이미지에도 동작(기존 트리거 + 이전 파일 보존).

### 제외 (의도적으로 안 함)
- 자르기·회전·필터 같은 이미지 편집. 상품당 여러 장. 배너·SNS 이미지 편집.
- 상품 추가·삭제(상품 테이블 INSERT/DELETE 정책은 열지 않는다). §11 참고.
- 서버 함수·Service Role. 기존 `menu/`·`banners/` 파일 정리(대시보드로 계속 관리).
- Supabase Image Transformations(Pro 전용), AVIF 인코딩(브라우저 지원 불균일).

## 3. 핵심 아키텍처 결정

| 결정 | 이유 |
|---|---|
| 최적화는 브라우저(canvas)에서, 업로드는 Supabase Storage로 직접 | 현 구조(브라우저 → Supabase, RLS가 경계)와 같고 서버 계층이 없다. Netlify 이전 계획에 영향 없음 |
| 파일명은 `products/<테이블명>/<uuid>.<ext>`로 매번 새로 | 같은 이름을 덮어쓰면 CDN·브라우저 캐시가 옛 그림을 보여준다. 고유 이름이면 `cacheControl` 1년을 줄 수 있다 |
| 이전 파일은 수정 이력이 가리키는 동안만 남긴다(2026-09-18 변경) | 수정 이력 "되돌리기"가 `before.image_url`을 다시 쓰므로 파일이 남아 있어야 한다. 처음엔 전부 남겼으나 이력을 **상품별 최근 30건**으로 자르면서(`admin_revision_retention.sql`) 파일도 같은 기준으로 정리 — 행과 파일의 기준이 같아야 "이력은 보이는데 되돌릴 수 없는 항목" 이 안 생긴다. 경로에 상품 id 폴더를 넣어(`products/<table>/<상품id>/`) 저장 뒤 그 폴더에서 현재 이미지·남은 이력 밖 파일을 best-effort 로 지운다 |
| 정책은 `products/` 접두사에만 관리자 쓰기 | 기존 폴더(`menu/…`)는 손대지 않아 대시보드 운영과 충돌하지 않고, 정책 조건이 단순하다 |
| `image_url` CHECK는 `://`·`..` 차단만 | 관리자 세션 탈취 시 외부 URL·경로 탈출을 DB가 거부한다. 기존 데이터(`menu/menu001.avif`, 일부 `/images/…`)는 전부 통과하는 느슨한 규칙 |
| 업로드는 확인 단계의 저장 시점에 | 편집 단계에서 올리면 취소한 파일이 고아로 남는다. 저장 시 업로드 → UPDATE, UPDATE 실패 시 방금 올린 파일 best-effort 삭제 |
| WebP 0.85, 긴 변 1600px, 목표 300KB | 카드 ~400px·상세 ~800px의 레티나 2배가 1600px. 0.85는 사진에서 육안 손실이 거의 없는 구간. 넘치면 0.78·0.72 두 단계만 낮추고 그 아래로는 화질을 지킨다 |

## 4. DB·Storage 변경

### 4-1. `supabase/storage_policies.sql` (신규, SQL Editor 1회, 재실행 안전)

```sql
-- 기존: 로그인 사용자 전체에게 버킷 전체 ALL. 조사(2026-09-17)에서 확인.
DROP POLICY IF EXISTS "Authenticated users can manage images" ON storage.objects;

-- 아바타: 본인 파일(avatars/<uid>.<ext>)만. 기존 uploadAvatar 의 list → remove → upload 가 그대로 동작한다.
DROP POLICY IF EXISTS "Users manage own avatar" ON storage.objects;
CREATE POLICY "Users manage own avatar" ON storage.objects
  FOR ALL TO authenticated
  USING      (bucket_id = 'images' AND name LIKE 'avatars/' || auth.uid()::text || '.%')
  WITH CHECK (bucket_id = 'images' AND name LIKE 'avatars/' || auth.uid()::text || '.%');

-- 상품 이미지: products/ 아래는 관리자만 (조회·업로드·덮어쓰기·삭제).
-- 삭제까지 여는 이유: UPDATE 실패 시 방금 올린 파일 회수 + 후속 상품 추가/삭제 흐름이 그대로 쓴다.
DROP POLICY IF EXISTS "Admins manage product images" ON storage.objects;
CREATE POLICY "Admins manage product images" ON storage.objects
  FOR ALL TO authenticated
  USING      (bucket_id = 'images' AND name LIKE 'products/%' AND public.is_admin())
  WITH CHECK (bucket_id = 'images' AND name LIKE 'products/%' AND public.is_admin());
```

- 버킷은 public이라 표시용 URL(`/storage/v1/object/public/...`)은 정책과 무관하게 읽힌다. 정책은 API(list·upload·remove)에만 걸린다.
- 결과: 일반 사용자는 자기 아바타만, 관리자는 그 위에 `products/`만. 기존 `menu/`·`banners/`·`sns/`·`videos/`는 브라우저에서 아무도 쓸 수 없다(대시보드 전용).
- 롤백: 세 정책을 DROP하고 원래 정책을 다시 만드는 블록을 파일 끝에 주석으로 둔다.

### 4-2. `supabase/admin_image.sql` (신규, SQL Editor 1회, 재실행 안전)

```sql
-- 편집 가능 컬럼에 image_url 추가 (admin_edit.sql §3b 의 컬럼 GRANT 확장). RLS UPDATE 정책은 이미 관리자 한정.
GRANT UPDATE (image_url) ON menu_items        TO authenticated;
GRANT UPDATE (image_url) ON gift_sets         TO authenticated;
GRANT UPDATE (image_url) ON reciprocate_items TO authenticated;

-- 사전 확인: 아래 CHECK 를 위반하는 기존 행이 있으면 0이 아니다 → 먼저 값을 고칠 것 (정상 데이터는 0)
SELECT 'menu_items' t, count(*) FROM menu_items        WHERE image_url LIKE '%://%' OR image_url LIKE '%..%'
UNION ALL SELECT 'gift_sets', count(*) FROM gift_sets   WHERE image_url LIKE '%://%' OR image_url LIKE '%..%'
UNION ALL SELECT 'reciprocate_items', count(*) FROM reciprocate_items WHERE image_url LIKE '%://%' OR image_url LIKE '%..%';

-- 외부 URL·경로 탈출 차단. 상대 경로(menu/…, products/…, 레거시 /images/…)는 전부 통과.
ALTER TABLE menu_items        DROP CONSTRAINT IF EXISTS menu_items_image_url_path;
ALTER TABLE menu_items        ADD  CONSTRAINT menu_items_image_url_path
  CHECK (image_url IS NULL OR (image_url NOT LIKE '%://%' AND image_url NOT LIKE '%..%'));
-- gift_sets, reciprocate_items 동일
```

- `admin_edit.sql`은 고치지 않는다(이미 실행된 마이그레이션). 대신 그 파일 §3b 주석에 "image_url 은 admin_image.sql 에서 추가"를 한 줄 적어 두 파일을 잇는다.
- 이력: `log_product_revision` 트리거가 행 전체를 JSONB로 남기므로 `image_url` 변경도 자동으로 기록된다. 추가 작업 없음.
- 롤백 블록: `REVOKE UPDATE (image_url) …`, CHECK DROP.

### 4-3. `supabase/storage_policies_verify.sql` (신규, 전부 BEGIN … ROLLBACK)

파일 전체를 한 번에 실행하면 결과 표(✓/✗)가 나온다. 관리자(`user_profiles.role='admin'`)·일반 유저는 `auth.users`에서 자동으로 고르고, 각 검사는 `pg_temp` 함수 안에서 `SET LOCAL ROLE authenticated` + `request.jwt.claims` 로 실행한 뒤 서브트랜잭션을 강제로 되돌려 데이터가 남지 않는다(2026-09-18: 자리표시자를 손으로 채우다 22P02 로 멈춘 뒤 이 형식으로 바꿈). `storage.objects`에 직접 INSERT를 시도해 정책을 확인한다.

- (A) 일반 유저: `products/menu_items/x.webp` INSERT → **ERROR 42501**. `avatars/<타인 uid>.png` INSERT → **42501**. `avatars/<본인 uid>.png` INSERT → 성공. `menu_items.image_url` UPDATE → **UPDATE 0**(RLS).
- (B) 관리자: `products/menu_items/x.webp` INSERT·DELETE → 성공. `menu/x.webp` INSERT → **42501**(기존 폴더는 닫힘). `menu_items.image_url = 'products/menu_items/x.webp'` UPDATE → **UPDATE 1** + `product_revisions` 1건. `image_url = 'https://evil/x'` → **ERROR 23514**. `image_url = '../x'` → **23514**. `name` UPDATE → **42501**(컬럼 GRANT 밖, 회귀 확인).

## 5. 이미지 최적화 규칙 — `src/utils/imageOptimizer.ts` (신규)

브라우저 전용 순수 유틸. 모달이 아니라 이 파일이 "무엇을 얼마로 줄이는지"의 단일 출처다.

```ts
export const IMAGE_LIMITS = {
  maxInputBytes: 20 * 1024 * 1024, // 이보다 큰 원본은 받지 않는다
  maxEdge: 1600,                   // 긴 변 상한(px)
  targetBytes: 300 * 1024,         // 이 아래면 만족
  qualities: [0.85, 0.78, 0.72],   // 목표를 넘을 때만 다음 단계. 그 아래로는 내려가지 않는다
} as const;

export interface OptimizedImage {
  blob: Blob;                 // 올릴 파일
  ext: "webp" | "jpg" | string; // blob.type 에서 도출. 원본 그대로면 원본 확장자
  width: number; height: number;
  originalBytes: number; bytes: number;
  action: "kept" | "resized" | "reencoded" | "resized+reencoded"; // 결과 안내용
}

export async function optimizeImage(file: File, limits = IMAGE_LIMITS): Promise<OptimizedImage>;
```

절차:
1. `file.type`이 `image/`로 시작하지 않으면 거부. 크기가 `maxInputBytes`를 넘으면 거부(메시지 §8).
2. `createImageBitmap(file)`로 디코드. 실패(브라우저가 못 읽는 HEIC 등)하면 거부. 모던 브라우저는 여기서 EXIF 회전을 반영한다(`imageOrientation: "from-image"` 기본).
3. **그대로 두는 경우**: 긴 변 ≤ `maxEdge` 이고 크기 ≤ `targetBytes` 이고 타입이 `image/webp|jpeg|avif` → 원본 그대로(`action: "kept"`). PNG는 사진이면 크기가 커서 이 조건에 잘 안 걸리고, 작은 PNG는 그대로 통과한다.
4. 축소: `scale = min(1, maxEdge / max(w, h))`. `scale < 0.5`면 절반씩 여러 번 줄인다(한 번에 줄이면 계단 현상). 각 단계 `imageSmoothingQuality = "high"`. `OffscreenCanvas`가 있으면 쓰고 없으면 `<canvas>`.
5. 인코딩: `canvas.toBlob("image/webp", q)`를 `qualities` 순서로 시도해 `targetBytes` 이하가 나오면 멈춘다. 결과 `blob.type`이 `image/webp`가 아니면(Safari 등 WebP 인코더 없음) `image/jpeg`로 같은 사다리를 탄다.
6. 마지막 단계까지 목표를 넘어도 그 결과를 쓴다(화질 우선). 단, 결과가 원본보다 크고 원본이 `maxEdge` 이하면 원본을 쓴다.
7. 반환값의 `action`으로 모달이 "4.8MB → 236KB · 1600×1067"과 "이미 작아서 그대로 올립니다"를 구분해 보여준다.

메타데이터(EXIF·GPS)는 canvas를 거치며 사라진다 — 의도한 부수효과(개인정보). `action: "kept"`인 원본은 메타데이터가 남는다. 사장님 상품 사진에는 문제 없고, 문서에 적어 둔다.

## 6. 서비스 레이어

### 6-1. `src/services/storage.ts` (신규)

```ts
export const PRODUCT_IMAGE_PREFIX = "products";

export const storageService = {
  /** products/<table>/<uuid>.<ext> 에 올리고 DB 에 저장할 상대 경로를 돌려준다 */
  async uploadProductImage(table: ProductTable, blob: Blob, ext: string): Promise<string>;
  /** 업로드 후 UPDATE 가 실패했을 때, 그리고 후속 상품 삭제 흐름에서 쓴다. 실패해도 던지지 않는다(best-effort) */
  async removeProductImage(path: string): Promise<void>;
};
```

- `supabase.storage.from("images").upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false })`. 이름이 매번 고유하니 upsert 불필요.
- `uuid`는 `crypto.randomUUID()`. `ext`는 `blob.type`에서 도출(`image/webp` → `webp`, `image/jpeg` → `jpg`, 원본 유지 시 원본 확장자 소문자).
- 경로는 `getStorageUrl()`이 이미 처리하는 상대 경로 형식이라 표시 코드 변경 없음.
- 모달 밖에 두는 이유: 후속 "상품 추가"(INSERT 전 업로드, 실패 시 회수)와 "삭제"(파일 정리)가 같은 함수를 쓴다.

### 6-2. `src/utils/adminProduct.ts` 확장

- `EditableField`에 `image_url`. `editableFieldsFor`: 세 타입 모두 포함.
- `pickEditablePatch`: 문자열이면 `trim` 후 통과.
- `validatePatch`: 비어 있으면 "이미지 경로가 없습니다", `://` 또는 `..` 포함이면 "이미지 경로 형식이 잘못되었습니다"(DB CHECK와 같은 규칙 — 되돌리기로 레거시 `menu/…`를 다시 쓰는 경로도 통과해야 하므로 접두사 강제는 하지 않는다).
- `FIELD_LABELS.image_url = "이미지"`. `formatFieldValue("image_url", v)`는 파일명만(`products/menu_items/3f2a….webp` → `3f2a….webp`). `diffEditable`은 문자열 비교로 그대로 동작.
- `src/types/index.ts` `EditableProductPatch`에 `image_url?: string`. 주석 "네 개가 전부"를 다섯 개로 정정.

### 6-3. `adminService.updateProduct`

변경 없음. `image_url`은 화이트리스트를 통과해 같은 UPDATE로 간다. 에러 매핑에 `23514`가 이미 "가격" 문구라 CHECK 이름으로 갈라 이미지 위반이면 "이미지 경로 형식이 잘못되었습니다"를 낸다(`error.message`에 제약 이름 `_image_url_path`가 들어온다).

## 7. UI

### 7-1. `src/components/admin/ProductImageField.tsx` (신규)

독립 컴포넌트. 생성 모드 모달(후속)이 그대로 재사용한다.

- props: `currentPath: string | null`, `pending: PendingImage | null`, `onPick(file)`, `onClear()`, `disabled`.
- 표시: 현재 이미지 썸네일(`getStorageUrl(currentPath)`, 160px 정도) → 파일을 고르면 새 이미지 미리보기(object URL)로 바뀌고 아래에 "4.8MB → 236KB · 1600×1067 · WebP" 한 줄. 최적화 중에는 "이미지 최적화 중…" + 버튼 비활성.
- 버튼: "이미지 변경"(숨김 `<input type="file" accept="image/*">` 트리거), 고른 뒤에는 "선택 취소".
- object URL은 `useEffect` 정리에서 `revokeObjectURL`.

### 7-2. 모달 흐름 (`ProductEditModal.tsx`)

- `FormState`에 `image_url: string`을 추가하고, 파일 선택 상태 `pendingImage: { optimized: OptimizedImage; previewUrl: string } | null`을 둔다. 편집 단계 맨 위에 `ProductImageField`.
- 파일 선택 → `optimizeImage` → 실패 시 필드 아래 에러 문구(§8), 성공 시 `pendingImage`. 이 시점에 업로드하지 않는다.
- 저장(편집 → 확인): 파일은 아직 올리지 않았으므로 `pendingImage`는 패치(`pendingPatch`) 밖에 따로 들고 간다. `diffEditable`의 결과에 `pendingImage`가 있으면 "이미지" 행을 모달이 직접 덧붙이고(before는 `getStorageUrl(product.image_url)`, after는 `previewUrl` 썸네일), "변경된 내용이 없습니다" 판정도 `pendingPatch`가 비었더라도 `pendingImage`가 있으면 변경으로 본다.
- 확인하고 수정: `pendingImage`가 있으면 ① `storageService.uploadProductImage` → 경로, ② `pendingPatch`에 `image_url` 을 넣어 `adminService.updateProduct`, ③ ②가 실패하면 `removeProductImage(경로)` 후 에러 표시. 성공 시 `onSaved()`(기존 `refetch`가 새 경로로 다시 그린다). 업로드 중에도 `isSaving` 으로 버튼을 잠근다.
- 되돌리기: 이력의 `before.image_url`을 폼에 얹는 기존 흐름 그대로. 파일을 지우지 않으므로 옛 경로가 살아 있다. 대조표에서는 두 경로 모두 `getStorageUrl`로 썸네일.
- `pendingImage`가 없으면 기존과 완전히 같은 동작.

### 7-3. 버튼 6곳·호출부

변경 없음. 목록·홈·상세의 `refetch`가 이미 저장 후 다시 그린다.

## 8. 에러 처리

| 상황 | 사용자에게 |
|---|---|
| `image/`가 아닌 파일 | "이미지 파일만 올릴 수 있습니다" |
| 20MB 초과 | "20MB 이하 이미지만 올릴 수 있습니다" |
| 디코드 실패(HEIC 등) | "이 브라우저에서 읽을 수 없는 이미지입니다. JPG·PNG·WebP로 저장해 다시 올려주세요" |
| 업로드 403(정책) | "이미지 업로드 권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요" |
| 업로드 그 외 | "이미지 업로드에 실패했습니다: <message>" |
| UPDATE 실패 후 파일 회수 | 조용히 시도, 실패해도 사용자 메시지는 UPDATE 에러만 |
| CHECK 위반(23514, `_image_url_path`) | "이미지 경로 형식이 잘못되었습니다" |

## 9. 리포 파일·문서

- 신규: `supabase/storage_policies.sql`, `supabase/storage_policies_verify.sql`, `supabase/admin_image.sql`, `src/utils/imageOptimizer.ts`, `src/services/storage.ts`, `src/components/admin/ProductImageField.tsx`.
- 수정: `src/utils/adminProduct.ts`, `src/types/index.ts`, `src/services/admin.ts`(에러 매핑), `src/services/index.ts`(export), `src/components/admin/ProductEditModal.tsx`, `supabase/admin_edit.sql`(§3b 주석 한 줄), `README.md`(운영 절차 §0에 두 SQL 추가, 사용법에 이미지·용량 규칙), `CLAUDE.md`(스키마·관리자 편집·이미지 처리 절에 반영, Storage 정책 설명).

## 10. 검증 계획

- SQL: §4-3 verify 스크립트 (A)(B) 기대값 대조. 실 데이터 변경 없음.
- 코드: `npm run lint`, `npm run build`.
- 브라우저(로컬 dev, 관리자 계정):
  1. 8MB·4000px JPEG → 안내 문구에 300KB 이하·1600px, 저장 후 카드·상세·홈 카드에 새 이미지, Storage에 `products/menu_items/<uuid>.webp` 1개.
  2. 200KB·1200px WebP → "그대로 올립니다", 파일이 재인코딩되지 않음(크기 동일).
  3. PNG 원본(투명 없음) → WebP로 변환.
  4. 세로로 찍은 사진(EXIF 회전) → 미리보기·결과가 바로 선다.
  5. 이력에서 이미지 되돌리기 → 옛 경로로 복원, 옛 파일 살아 있음.
  6. 저장 중 네트워크 차단으로 UPDATE 실패 → 올라간 파일이 회수됐는지 Storage에서 확인.
  7. 일반 계정 → 모달 없음. 브라우저 콘솔에서 `products/`에 직접 upload 호출 → 403.
  8. 기존 사용자 프로필 사진 업로드/교체가 그대로 동작(정책 분리 회귀 확인).
  9. Safari(가능하면) → JPEG 폴백으로 저장.

## 11. 후속 (이번 범위 밖)과 이번에 마련해 두는 지점

- **상품 추가**: `storageService.uploadProductImage` → INSERT → 실패 시 `removeProductImage`. `ProductImageField`를 생성 모달에 그대로 놓는다. Storage 정책은 이미 `products/` INSERT를 허용하므로 변경 없음. 필요한 것은 상품 테이블 INSERT 정책·컬럼 GRANT와 `display_order` 편집.
- **상품 삭제**: 권장은 `is_active=false`(이미 있음). 실제 삭제를 열 때 `removeProductImage`로 파일 정리, AFTER DELETE 이력 트리거, 장바구니 고아 행 처리가 함께 필요하다.
- **새 카테고리**: 테이블 CHECK와 라벨 맵 6곳을 한 곳으로 모으는 정리가 먼저다(이번 범위 밖).
- 기존 `menu/…` 파일은 그대로 두었다. 언젠가 정리하려면 `product_revisions`의 `before.image_url`에 없는 파일만 지운다.

## 12. 배포 순서와 롤백

1. SQL Editor에서 `storage_policies.sql` → `admin_image.sql` 실행(둘 다 기존 코드에 안전: 아바타 흐름은 새 정책으로도 동작하고, 컬럼 GRANT 추가는 기존 화이트리스트에 영향 없음).
2. `storage_policies_verify.sql` (A)(B) 확인.
3. 코드 머지 → Vercel 자동 배포.
- 롤백: 코드는 `git revert`. DB는 각 SQL 파일 끝의 주석 블록. 올라간 `products/` 파일과 `image_url` 값은 데이터라 지우지 않는다(되돌리기는 이력으로).
