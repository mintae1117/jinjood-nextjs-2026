# Jinjood Next.js E-Commerce 개발 규칙 (Claude Code)

## 프로젝트 개요
진주떡집 전통 떡 전문점 이커머스 웹사이트.
- **Staging**: https://jinjood-nextjs.vercel.app
- **Production**: https://jinjood.com (도메인 연결 후)

---

## 기본 원칙
- 모든 대화와 코드 주석은 **한국어**로 작성
- TypeScript strict 모드 준수
- 모바일 우선 반응형 디자인
- Supabase 데이터베이스 연동

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router) | 16.1.1 |
| Language | TypeScript | 5.x |
| React | React | 19.2.3 |
| Styling | Styled Components + Tailwind | 6.2.0 + 4.x |
| Animation | Framer Motion | 12.24.12 |
| Database | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth + @supabase/ssr | Latest |
| State | Zustand | 5.x |
| UI | React Icons, Swiper | 5.5.0 + 12.0.3 |

---

## 개발 명령어

```bash
npm run dev     # 개발 서버 (포트 3001)
npm run build   # 프로덕션 빌드
npm run lint    # 린트
npm test        # 순수 로직 단위 테스트 (node:test, 의존성 없음)
# dev 서버가 이미 3001에 떠 있을 수 있다(사용자 터미널). lsof -nP -iTCP:3001 -sTCP:LISTEN 로 확인해 그대로 쓰고,
# 직접 띄웠다면 그 PID만 종료할 것(pkill -f 패턴은 사용자 서버까지 잡는다 — 2026-09-17 실제 사고)
```

---

## 프로젝트 구조

```
app/
├── page.tsx                    # 홈페이지
├── represent/                  # 대표 메뉴 (목록 + [id] 상세)
├── gifts/                      # 선물 세트 (목록 + [id] 상세)
├── reciprocate/                # 이바지/답례 (목록 + [id] 상세)
├── contact/                    # 오시는 길
├── cart/                       # 장바구니
├── (shop)/checkout/            # 결제 (현재 준비중 플레이스홀더)
├── mypage/                     # 마이페이지 (orders[빈 상태 UI], profile, settings) — wishlist 미구현
├── (auth)/                     # 로그인, 회원가입, 비밀번호 찾기
├── (legal)/                    # 이용약관, 개인정보처리방침
├── auth/callback/route.ts      # OAuth 콜백
middleware.ts                   # Supabase 세션 관리

src/
├── components/
│   ├── common/     # Header, Footer, SearchBar, PageHeader, Loading, JsonLd, KakaoMap
│   ├── home/       # HomeClient, HeroBanner, FeaturedMenu, GiftSets, VideoSection, SNSSection, LocationSection
│   ├── menu/       # MenuCard, MenuFilter
│   ├── product/    # ProductDetail (통합 상품 상세 - 모든 상품 타입 지원), ProductDetailShell
│   ├── cart/       # CartContent, CartItem, CartSummary, CartEmpty
│   ├── auth/       # LoginForm, RegisterForm, ForgotPasswordForm, UserDropdown
│   ├── admin/      # AdminEditButton(관리자 전용 수정 버튼), ProductEditModal(편집→확인 2단계 + 이력·되돌리기), ProductImageField(이미지 선택·미리보기)
│   └── legal/      # TermsContent, PrivacyContent
├── hooks/          # useAuth, useCart, useProducts(initial* 초기값 + refetch), useBanners, useHasMounted
├── stores/         # authStore (sessionStorage, selectIsAdmin·selectIsAuthReady), cartStore (localStorage)
├── services/       # auth, cart, products(+ products.server: 서버 컴포넌트용 cache() 조회), banners, settings,
│                   # admin(updateProduct·getRevisions), storage(상품 이미지 업로드·회수·정리)
├── utils/          # adminProduct(편집 화이트리스트·검증·diff·경로 빌더), imageOptimizer(업로드 전 최적화), merchantPolicy(배송비·배송일·환불 정책 값 + JSON-LD) — 순수 함수, *.test.ts 가 npm test 대상
├── types/          # 모든 타입 정의
├── styles/         # GlobalStyles, theme
├── data/           # sampleData (연락처, 사업자 정보)
└── lib/
    ├── supabase/   # client.ts (브라우저), server.ts (서버), middleware.ts, index.ts (supabase 싱글톤, getStorageUrl)
    ├── seo.ts      # BreadcrumbList·Product JSON-LD 빌더
    └── registry.tsx # Styled Components SSR 레지스트리

supabase/                        # SQL Editor 에서 손으로 실행하는 마이그레이션(CLI·migrations 폴더 없음). 실행 순서·검증은 README "관리자 상품 편집 (운영 절차)"
├── schema.sql, cart_items.sql, user_profiles.sql      # 기본 스키마
├── admin_edit.sql               # role·is_admin()·상품 RLS·컬럼 GRANT·price CHECK·product_revisions (2026-09-14)
├── storage_policies.sql         # Storage: avatars/ 본인만, products/ 관리자만 (2026-09-17)
├── admin_image.sql              # image_url GRANT + 외부 URL·'..' CHECK (2026-09-17)
├── admin_revision_retention.sql # 이력 상품별 30건 상한 + seq 컬럼 (2026-09-18)
├── admin_edit_verify.sql        # 옛 형식(자리표시자) 검증 — admin_edit.sql 대상
├── storage_policies_verify.sql  # 새 형식(전체 실행 → ✓/✗ 표) 검증 — 위 3개 SQL 대상
└── seed_data.sql, cleanup_and_reseed.sql, price_update_2026_07.sql   # 초기 스냅샷·1회성 데이터 변경. 실 데이터와 동기화 안 됨

docs/superpowers/{specs,plans}/  # 설계 스펙·구현 계획(2026-09-14 상품 편집, 2026-09-17 이미지 교체). 스펙 §10 이 수동 검증 체크리스트
```

---

## 환경변수

```bash
NEXT_PUBLIC_SUPABASE_URL=<Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
# (예정) 결제 - 토스페이먼츠
NEXT_PUBLIC_TOSS_CLIENT_KEY=<Toss Client Key>  # 브라우저 SDK용 → NEXT_PUBLIC_ 접두사 필수
TOSS_SECRET_KEY=<Toss Secret Key>              # 서버 전용 (NEXT_PUBLIC_ 절대 금지)
SUPABASE_SERVICE_ROLE_KEY=<Service Role Key>   # 서버 전용 - 주문 상태 변경/웹훅/대사 배치 (src/lib/supabase/admin.ts에서만 사용)
CRON_SECRET=<random string>                    # Vercel Cron 엔드포인트 보호용
```

---

## DB 스키마 (현재)

```sql
menu_items (id, name, price, description, image_url, category, tags[], is_popular, is_best, is_recommended, display_order, is_active)
gift_sets (id, name, price, description, image_url, category, items[], display_order, is_active)
reciprocate_items (id, name, price, description, image_url, category, display_order, is_active)
  -- image_url: Storage 상대 경로(레거시 menu/…, 관리자 업로드는 products/<table>/<상품id>/<uuid>.<ext>). CHECK 로 '://'·'..' 거부(admin_image.sql)
  -- 쓰기 권한: authenticated 는 UPDATE (price, description, is_active[, items], image_url) 컬럼만. INSERT/DELETE 는 REVOKE 상태(RLS 정책도 없음)
cart_items (id, user_id FK, product_id, product_type, quantity, options JSONB, created_at, updated_at)
  -- product_type: 'menu_item' | 'gift_set' | 'reciprocate_item'
  -- RLS: 본인 장바구니만 접근 가능
banners (id, title, subtitle, image_url, link, display_order, is_active)
site_settings (key, value JSONB)
user_profiles (id, user_id FK→auth.users UNIQUE, avatar_url, role 'user'|'admin', created_at, updated_at)
  -- role은 SQL Editor에서만 변경 가능(protect_user_profiles_role 트리거). 브라우저 세션은 변경 불가
product_revisions (id, table_name, record_id, changed_by FK→auth.users SET NULL, changed_at, before JSONB, after JSONB, seq BIGSERIAL)
  -- 상품 3테이블 AFTER UPDATE 트리거(log_product_revision)가 자동 적재 + 같은 상품의 31번째 이후를 삭제(admin_revision_retention.sql). 관리자만 SELECT, 사람이 INSERT/DELETE 불가
  -- 상한 판정은 seq(단조 증가) 기준 — 같은 트랜잭션의 이력은 changed_at 이 같아 가를 수 없다
```

> **미생성(결제 도입 시 필요)**: `orders`(fulfillment_method·desired_date·운송장 컬럼·waiting_for_deposit 상태 포함), `order_items`(가격+options 스냅샷), `payments`(raw_response·가상계좌 정보) — README.md 결제 가이드 §4 참고. 작성 시 `supabase/schema.sql`의 기존 패턴(uuid_generate_v4, updated_at 트리거)과 `cart_items.sql`의 RLS 패턴 준용, 주문번호는 DB에서 생성(§4-4 레이스 컨디션)
> ⚠️ 단, `orders.user_id`는 `cart_items`와 달리 **ON DELETE SET NULL** (탈퇴해도 법정 5년 보관, README §5.5-12). `user_profiles.role`은 2026-09-14 관리자 상품 편집에서 추가 완료 — Phase 4-D는 `public.is_admin()`을 재사용

---

## 핵심 타입 (src/types/index.ts)

- `MenuItem` - 메뉴 상품 (category: chapssaltteok | mepssaltteok | tteokguk | others)
- `GiftSet` - 선물세트 (category: gift_set | songpyeon_set | baekil_dol_set, items: string[])
- `ReciprocateItem` - 이바지/답례 (category: ibaji | daprye)
- `ProductType` - 'menu_item' | 'gift_set' | 'reciprocate_item'
- `User` - id, email, name?, phone?, avatar_url?, role? (`UserRole` = 'user' | 'admin', user_profiles.role — UI 힌트일 뿐, 권한은 RLS)
- `CartItem` - id, user_id, product_id, product_type, quantity, product? (조인된 상품 정보)
- `EditableProductPatch` - 관리자 편집 가능 5컬럼(image_url, price, description, is_active, items) — 늘릴 때 같이 움직이는 4곳은 아래 "다음 작업 메모"
- `ProductRevision` - product_revisions 행(before/after JSONB, changed_by null = 콘솔 수정)

---

## 테마 색상

```
primary: #f35525 (메인 오렌지)
primaryDark: #d94820
secondary: #1e1e1e (거의 검정)
textLight: #666666
textMuted: #999999
background: #ffffff
backgroundGray: #f8f8f8
border: #eeeeee
success: #22c55e
error: #ef4444
```

**폰트**: Noto Sans KR (300, 400, 500, 600, 700)
**스타일링**: Styled Components (primary) + Tailwind v4 (secondary)
**Styled Components props**: `$` 접두사 사용 (예: `$isPopular`)

---

## 주요 개발 패턴

### Supabase 클라이언트
- 브라우저: `src/lib/supabase/client.ts` → `createBrowserClient()`
- 서버: `src/lib/supabase/server.ts` → `createServerClient()` (cookies 사용)

### 이미지 처리
```tsx
import { getStorageUrl } from "@/lib/supabase";
// DB에 상대 경로 저장 (menu/menu001.avif)
// getStorageUrl()이 Supabase Storage URL로 변환
// null/undefined → placeholder.png 반환
<Image src={getStorageUrl(item.image_url)} alt={item.name} fill unoptimized />
// 외부 이미지는 반드시 unoptimized prop 필요! (Vercel 배포 기준)
// ⚠️ Netlify 이전(README §10 Phase B-0) 시 반전: unoptimized 제거 + remotePatterns에
//    Supabase 도메인 등록 → Netlify Image CDN 서빙 (Supabase 무료 egress ~5GB/월 초과 방지)
```

- **관리자 업로드 경로**: `products/<테이블명>/<상품id>/<uuid>.<ext>`(`buildProductImagePath`). 이름을 매번 새로 만들어 캐시 문제를 피하고 `cacheControl` 1년. 상품 id 폴더에 두는 이유는 저장 뒤 정리(`storageService.pruneProductImages`)가 그 폴더만 보기 때문 — 다른 상품·레거시 `menu/…` 는 건드리지 않는다.
- **업로드 전 최적화**: `src/utils/imageOptimizer.ts` 가 규칙의 단일 출처 — 입력 20MB, 긴 변 1600px, WebP 0.85→0.78→0.72(목표 300KB, 그 아래로는 안 내려감), Safari 는 JPEG 폴백, 이미 작은 압축 포맷은 그대로. 상수를 바꾸면 README 사용법도 함께.
- **Storage 정책**(`supabase/storage_policies.sql`): `avatars/<본인 uid>.*` 는 본인만, `products/` 는 `is_admin()` 만. 그 외 폴더(`menu/`·`banners/`…)는 브라우저에서 쓸 수 없다(대시보드 전용). 새 업로드 기능은 `products/` 아래에 두거나 정책을 함께 늘려야 한다.

### 상품 타입별 동작
| 상품 타입 | 장바구니 | 바로 구매 | 문의하기 |
|----------|---------|----------|---------|
| menu_item | ✅ | 준비중 | - |
| gift_set | ✅ | 준비중 | - |
| reciprocate_item | - | - | ✅ (전화 문의) |

> **결제 기능 현재 상태**: "바로 구매하기"/"주문하기" 버튼은 실제 `disabled`가 아니라 **회색 스타일 + alert 핸들러** 방식.
> 클릭 시 "결제 기능은 아직 준비중입니다" alert 표시. 무료배송 없음 (배송비 3,000원 — `src/utils/merchantPolicy.ts` 의 `DELIVERY_FEE` 가 장바구니·상품 JSON-LD 의 공통 출처, 결제 도입 시 서버 값으로 단일화).
> 📌 구현 현황 표·결제 도입 단계는 **README.md "결제 기능 도입 종합 가이드" §0(현재 구현 상태) / §5.5(실서비스 운영 리스크) / §10(구현 우선순위 로드맵)** 이 단일 출처. 결제 관련 변경 시 README를 먼저 갱신할 것.
> ⚠️ 결제 코드 작성 시 필수 준수: 서버 가격 재계산(§5.5-6), 승인/취소/웹훅 멱등성(§5.5-2/3), 상태 전이 순방향 강제, 날짜 판정은 Asia/Seoul 기준(§5.5-5), `orders.user_id`는 ON DELETE SET NULL(§5.5-12), 주문 상태 변경·운송장 입력은 서버 admin 검증 + Service Role로만(§5.5-13), 면세 상품은 `taxFreeAmount` 반영(§5.5-14).

### 서비스 레이어 패턴
```typescript
// src/services/products.ts
export const productService = {
  async getProducts(category?: string) {
    let query = supabase.from('menu_items').select('*').eq('is_active', true).order('display_order');
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};
```

### 훅 사용
```typescript
// 상품: useMenuItems(category?, initialItems?), useGiftSets(…), useReciprocateItems(…), usePopularItems(limit, initial?),
//       useMenuItem(id, initialItem?), useGiftSet(…), useReciprocateItem(…) → { items|item, isLoading, error, refetch }
//       (initial* 은 서버 렌더 초기값, refetch 는 관리자 저장 후 갱신용 — AdminEditButton 의 onSaved 에 넘긴다)
// 인증: useAuth() → { user, isAuthenticated, isAdmin, isInitialized, signIn, signUp, signInWithKakao, signInWithGoogle, signOut, resetPassword, updateProfile, … }
// 장바구니: useCart() → { items, totalItems, totalPrice, addToCart, updateQuantity, removeFromCart }
```

### 관리자 상품 편집
- DB(SQL Editor, 1회, 전부 idempotent, **코드 배포보다 먼저**): `admin_edit.sql` → `storage_policies.sql` → `admin_image.sql` → `admin_revision_retention.sql` 순서. 검증은 `admin_edit_verify.sql`(옛 형식, 첫 파일 대상) + `storage_policies_verify.sql`(뒤 3개를 한 번에). 새 변경은 **새 SQL 파일**로 만들고 이미 실행된 파일은 주석만 잇는다. 절차 상세는 README "관리자 상품 편집 (운영 절차)". 관리자 지정은 `INSERT … ON CONFLICT`(로그인만으로는 `user_profiles` 행이 안 생김), 지정·해제 뒤엔 **재로그인**해야 role 이 세션에 실린다.
- 판별: `useAuthStore(selectIsAdmin)` (`user.role === 'admin'`). 데이터 훅 안에서는 `useAuth()`를 부르지 않는다(초기화 부수효과). role 은 `src/services/auth.ts` 의 `buildUser`(user_profiles 조회, 행 없음·실패면 'user')가 싣는다 — **`User` 객체를 만드는 새 경로는 반드시 이 함수를 탄다**(아바타 업로드 경로에서 빠져 관리자 버튼이 사라진 전례). 화면 분기는 `selectIsAuthReady` 와 함께(하이드레이션, SEO 절 참고).
- 버튼: `src/components/admin/AdminEditButton.tsx` — 관리자가 아니면(또는 auth 초기화 전) `null` 반환. 목록 카드 3곳(`MenuCard`·`GiftsListClient`·`ReciprocateListClient`) + 홈 카드 2곳(`FeaturedMenu`·`GiftSets`) + `ProductDetail` 1곳(`variant="detail"`). `card` 변형은 `position: relative` 인 이미지 래퍼 안에 absolute 로 놓고, 카드가 `Link` 라 클릭에서 `preventDefault`+`stopPropagation`. `onSaved` 에는 그 화면 훅의 `refetch` 를 넘긴다(props 로 한 단계씩 내려온다). 모달은 `createPortal(document.body)` — 카드의 transform/overflow 영향을 피한다. 7번째 자리를 만들면 이 규칙을 그대로.
- 쓰기: `adminService.updateProduct(productType, id, patch)` — 브라우저에서 바로 UPDATE, **RLS가 유일한 보안 경계**. 화이트리스트 5컬럼(`image_url`, `price`, `description`, `is_active`, `items`)만 통과. 컬럼을 늘리면 `admin_image.sql` 처럼 `GRANT UPDATE (…)` 도 같이(안 그러면 42501). UPDATE 뒤 **`.select('id').single()` 을 붙여야** RLS 에 막힌 0행 갱신이 에러(PGRST116)로 잡힌다. 에러 → 사용자 메시지는 `toFriendlyError`: PGRST116/42501 = 권한, 23514 = CHECK 위반(제약 이름에 `image_url_path` 가 있으면 이미지, 아니면 가격) — **새 CHECK 를 추가하면 이 분기도 같이**.
- 폼·diff 규칙(`adminProduct.ts`): 검증은 **바뀐 필드에만**(`diffEditable` → `validatePatch`) — 전체를 검증하면 구성품이 빈 선물세트는 가격만 고쳐도 막힌다. 비교는 문자열 trim, null ≡ "", 배열은 JSON 비교, `is_active` 는 "false 가 아니면 켜짐"(DB NULL ≡ true — `toForm`·`formatFieldValue` 도 같은 규칙, 어기면 안 건드린 필드가 변경으로 잡힌다).
- 이미지: `ProductImageField`(선택·미리보기) → `optimizeImage` → 확인 단계 저장 시 `storageService.uploadProductImage` → 같은 `updateProduct`. **업로드는 확인 단계의 저장 시점에만**(편집 단계에서 올리면 취소한 파일이 고아로 남는다). UPDATE 실패 시 `removeProductImage` 로 방금 올린 파일 회수. 되돌리기는 고른 이미지를 버리고 이력 값으로. 버킷 `images` 는 public 이라 **표시 URL 은 정책과 무관하게 읽히고**, 정책은 list/upload/remove API 에만 걸린다. `removeProductImage`·`pruneProductImages` 는 `products/` 밖(레거시 `menu/…`)은 건드리지 않는다.
- **이력 상한 = 상품별 최근 30건**(`admin_revision_retention.sql` 의 `retention`, 클라이언트 `REVISION_RETENTION` — 둘을 함께 바꿀 것). DB 트리거가 31번째 이후를 지우고, 브라우저는 이미지 저장 뒤 그 상품 폴더에서 "현재 이미지 + 남은 이력이 가리키는 파일" 외를 지운다(best-effort, `pruneStaleImages`). 즉 **최근 30번의 수정까지는 이미지 포함 되돌릴 수 있고 그 이전은 사라진다**. 이력 순서는 `seq`(단조 증가) — 같은 트랜잭션의 이력은 `changed_at` 이 같다. `pruneStaleImages` 는 DB 상한 SQL 이 아직 안 걸린 환경도 대비해 이력을 `REVISION_RETENTION * 10` 건 받아 keep 집합을 만든다(참조 중인 파일을 지우지 않기 위해).
- 조회: 관리자는 `productService.get*(…, { includeInactive: true })`로 노출 off 상품도 본다(훅이 `selectIsAdmin` 으로 자동 결정). 서버 렌더 초기값은 anon 조회라 숨김 상품이 없다 → 관리자 훅은 초기값이 있어도 하이드레이션 직후 `{ silent: true }` 로 재조회한다.
- 이력: `product_revisions`는 DB 트리거가 적재, 조회는 `adminService.getRevisions(productType, id, limit)`(비관리자는 RLS 로 빈 배열). 되돌리기는 `before`의 5컬럼(image_url 포함)을 폼에 얹어 `updateProduct`를 다시 타는 것(별도 API 없음) — 되돌린 것도 이력에 남는다.
- 리포의 `seed_data.sql`/`cleanup_and_reseed.sql`은 초기 스냅샷 — 실 데이터와 동기화하지 않는다.
- **검증 SQL 형식**: `supabase/storage_policies_verify.sql` 처럼 자리표시자 없이 **전체를 한 번에 실행하면 ✓/✗ 결과 표**가 나오게 쓴다(관리자·일반 유저는 `auth.users`에서 자동 선택, 각 검사는 실행기 함수 안에서 `SET LOCAL ROLE authenticated` + `request.jwt.claims`로 실행 뒤 서브트랜잭션 강제 롤백). `<uuid>`를 손으로 채우는 옛 방식(`admin_edit_verify.sql`)은 SQL Editor에서 전체 실행 시 22P02·첫 기대 에러에서 끊긴다 — 새 검증 파일은 새 형식으로, 기회가 되면 `admin_edit_verify.sql`도 옮긴다. **SQL Editor 호환 규칙(2026-09-18 실제 실패에서 나온 것)**: ① 결과 표·함수는 temp 가 아닌 전용 스키마 `verify_tmp`(세션이 갈려도 동작, PostgREST 미노출), ② `DO` 본문 안에 `--` 주석을 두지 않고 주석에는 달러 태그(`$x$`)를 쓰지 않는다(에디터가 주석 안 태그를 문자열 시작으로 읽음), ③ 중첩 달러 인용은 바깥부터 이름 있는 태그, 닫는 태그 두 개를 한 줄에 붙이지 않는다(`$d$$q$` 는 `$$` 로 읽힘), ④ `format()` 템플릿 안의 `RAISE … %` 는 `%%`. 로컬 재현은 `@electric-sql/pglite`(Node 내장 Postgres)로 리포 SQL 을 순서대로 적용하면 된다.

### 다음 작업 메모 — 상품 추가·삭제·카테고리 (2026-09-18 조사·구현 기준)

이미지 교체 작업이 미리 마련해 둔 것과, 아직 막혀 있는 것.

- **지금 막혀 있는 지점(의도적)**: `admin_edit.sql` §3b가 상품 3테이블의 INSERT/DELETE 권한을 `anon, authenticated`에서 REVOKE 했고 INSERT/DELETE RLS 정책이 없다. 여는 방법은 정책(`FOR INSERT … WITH CHECK (public.is_admin())`, `FOR DELETE … USING (public.is_admin())`) + `GRANT INSERT (허용 컬럼…)`/`GRANT DELETE`. INSERT도 **컬럼 GRANT로 화이트리스트**를 걸 수 있다(UPDATE와 같은 원리). 새 SQL 파일로 만들고 `admin_edit.sql`은 주석만 잇는다(이미 실행된 마이그레이션은 고치지 않는 관례).
- **재사용할 것**: `storageService.uploadProductImage(table, blob, ext)` → INSERT → 실패 시 `removeProductImage(path)`(상품 추가), `removeProductImage`(삭제 시 파일 정리), `ProductImageField`(생성 모달에 그대로), `optimizeImage`. Storage 정책은 이미 `products/` 아래 관리자 INSERT·DELETE를 허용하므로 **Storage 쪽 변경 없음**.
- **편집 컬럼을 늘릴 때 같이 움직이는 4곳**: `EditableProductPatch`(types) · `editableFieldsFor`/`pickEditablePatch`/`validatePatch`/`FIELD_LABELS`/`formatFieldValue`(`adminProduct.ts`) · `GRANT UPDATE (…)`(SQL) · 모달 폼. 하나라도 빠지면 클라이언트는 통과하고 DB가 42501을 낸다. 상품 추가에는 `name`·`category`·`display_order`·`tags`/`is_popular`… 가 새로 들어온다 — `display_order`는 "맨 뒤에 추가"(MAX+1) 기본값이 필요하다.
- **삭제 정책은 먼저 결정할 것**: 권장은 기존 `is_active=false`(숨김)를 기본 삭제로. 실제 DELETE를 열려면 ① `cart_items.product_id`는 FK가 없어(`product_type`+`product_id` 쌍) 고아 행이 남고 `cartService.getProductByTypeAndId`가 null을 돌려준다 — `CartItem` 표시 처리 확인, ② `product_revisions`는 AFTER UPDATE 트리거만 있어 삭제가 기록되지 않는다(AFTER DELETE 트리거 추가 시 `after JSONB NOT NULL` 제약 — `'{}'::jsonb`로 넣거나 NULL 허용으로 바꿀지 결정), ③ 결제 도입 후 `order_items`는 가격·옵션 스냅샷이라 상품 삭제와 무관하게 설계돼 있다(README §4).
- **카테고리는 세 겹으로 하드코딩**: DB CHECK(`menu_items.category IN (...)` 등 테이블별) · TS 유니온(`MenuItem.category`, `MenuCategory`…) · 한글 라벨/필터 옵션 **6곳**(`app/represent/RepresentListClient.tsx`, `app/gifts/GiftsListClient.tsx`, `app/reciprocate/ReciprocateListClient.tsx`, `src/components/menu/MenuCard.tsx`, `src/components/common/SearchBar.tsx`, `src/components/product/ProductDetail.tsx`). **기존 카테고리 안에서 추가**는 셀렉트 하나로 끝난다. **새 카테고리**를 만들 가능성이 있으면 라벨·옵션을 한 파일(예: `src/data/categories.ts`)로 모으는 정리를 먼저 한다.
- **화면 반영**: 목록·홈은 요청마다 서버가 조회(`products.server.ts`의 `cache()`는 요청 단위, ISR 없음)하고 `sitemap.ts`도 요청 시 DB를 읽는다 → 추가·삭제 후 revalidate 없이 바로 반영된다. 클라이언트는 저장 후 각 훅의 `refetch()`.
- **이미지 파일 정리는 저장 시점에 자동**(위 이력 상한 항목). 2026-09-18 이전에 올라간 `products/<테이블>/<uuid>.webp`(상품 id 폴더 없음)는 정리 대상 밖이라 남아 있으면 대시보드에서 지운다. 상품 삭제를 열 때는 그 상품 폴더 전체를 `removeProductImage`/`pruneProductImages(빈 keep)` 로 비운다.

### 테스트 (`npm test`)

- Node 22 내장 `node:test` + `--experimental-strip-types`. 의존성 없음. 대상은 **순수 로직만**(`src/utils/*.test.ts`): 브라우저 API·Supabase 호출이 있는 모듈은 여기서 못 돈다.
- 테스트 파일은 `./x.ts` 처럼 **확장자를 붙여 import**(`tsconfig` `allowImportingTsExtensions`). 테스트 대상 모듈은 **런타임 `@/…` import가 없어야** 한다 — Node는 `@/` 별칭을 못 푼다. `import type … from "@/types"` 처럼 타입만 가져오는 것은 지워지므로 괜찠다(`adminProduct.ts`가 그 예). 런타임 의존이 필요하면 순수 부분을 분리한다(`imageOptimizer.ts`의 순수 함수/브라우저 파이프라인 분리가 그 예).
- 컴포넌트·Supabase 흐름은 `npm run build` + 브라우저 확인으로 본다. 관리자 계정이 필요한 시나리오는 스펙 §10 체크리스트를 사용자가 실행.

### SEO — 크롤러가 읽는 HTML
- **함정**: 데이터를 `useEffect`로 받는 페이지는 서버 렌더 HTML이 비어 있다. 예전엔 홈이 `isLoading`일 때 페이지 전체를 `<Loading />`으로 감싸 크롤러가 받는 본문이 헤더·푸터뿐(618자)이었다. 구글은 JS를 실행해주지만 네이버 Yeti는 거의 안 한다.
- **원칙**: 홈과 목록은 서버 컴포넌트가 데이터를 조회해 `initial*` prop으로 내려준다(`src/services/products.server.ts`). 훅은 그 값으로 시작하고 하이드레이션 직후 재조회는 `{ silent: true }`로 조용히 돈다 — 이미 그려진 화면을 스피너로 되돌리면 관리자에게 번쩍인다. SEO를 위해 화면에 새 섹션을 만들지 않는다.
- 서버 조회가 실패하면 `null`을 돌려 prop을 비운다. 빈 배열을 넘기면 훅이 "데이터 있음"으로 보고 재조회를 건너뛰어 화면이 '상품이 하나도 없는 가게'가 된다.
- **상세 페이지**: `[id]/page.tsx`는 서버 컴포넌트다. `src/services/products.server.ts`의 `cache()`된 조회로 상품을 받아 `initialItem`으로 클라이언트에 넘긴다(같은 요청의 `generateMetadata`와 DB 왕복이 합쳐진다). 훅은 `useMenuItem(id, initialItem)`처럼 초기값을 받는다.
- **h1은 페이지당 하나**: 홈은 `HeroBanner`의 **첫 슬라이드만** h1(나머지 슬라이드는 h2), 목록은 `PageHeader`, 상세는 `ProductDetail`의 `ProductName`.
- **구조화 데이터**: 전역(`Bakery`·`SiteNavigationElement`)은 `app/layout.tsx`, 페이지별(`BreadcrumbList`·`Product`)은 `src/lib/seo.ts` + `src/components/common/JsonLd.tsx`.
  - `Product.offers`(Offer·AggregateOffer 둘 다)에는 `shippingDetails`·`hasMerchantReturnPolicy` 를 항상 싣는다 — 구글 "판매자 목록"이 요구하는 필드(2026-09-21 Search Console 경고 대응). 값은 `src/utils/merchantPolicy.ts` 가 **이용약관 제10조(당일·익일 배송)·제11조(신선식품 단순변심 환불 불가 → `MerchantReturnNotPermitted`)** 와 맞춰 관리한다. 약관 문구나 배송비를 바꾸면 이 파일도 같이(검색 결과에 노출되는 값).
  - `review`·`aggregateRating` 경고는 **의도적으로 남겨 둔다** — 실제 리뷰 기능(Phase 6)이 생기기 전에 넣으면 허위 평점으로 구글 구조화 데이터 정책 위반. 구글도 '권장' 수준으로 분류.
- ⚠️ 서버에서도 렌더되므로 컴포넌트 **렌더 경로에서 `window`·`document`를 읽지 말 것**. 경로가 필요하면 `usePathname()`.
- ⚠️ **persist된 상태로 화면을 가르지 말 것**: `authStore.user`·`cartStore`는 sessionStorage/localStorage에 저장돼 클라이언트 첫 렌더엔 있지만 서버엔 없다. 그대로 쓰면 하이드레이션이 어긋난다. `selectIsAuthReady`(= `isInitialized`, persist 대상 아님)로 함께 막는다 — `Header.tsx`와 `AdminEditButton.tsx` 참고.
- framer-motion 등장 애니메이션(`initial={{ opacity: 0 }}`)은 SSR HTML에 그대로 나간다. 의도된 연출이라 유지한다. 대신 **하이드레이션 전까지 그 영역은 투명**하므로, 화면 전체를 덮는 요소에 쓰면 느린 회선에서 백지로 보인다는 점을 감안할 것.

---

## Git 커밋 규칙

```
<type>(<scope>): <subject>
# type: feat | fix | style | refactor | docs | chore
# scope: auth | cart | checkout | product | order | board | ui
# 예: feat(cart): 장바구니 기능 구현
```

---

## 현재 진행 상황 (Roadmap)

- [x] **Phase 1**: 홈페이지, 상품 목록/상세, 검색, 지도, 이용약관/개인정보처리방침
- [x] **Phase 2**: 인증 (이메일, 카카오, 구글), 장바구니
- [~] **Phase 3**: 마이페이지 (일부) — 프로필·설정 완료
  - ⚠️ 주문내역(`/mypage/orders`): **빈 상태 UI만** 존재. 실제 조회 로직·`orders` 테이블·`orderService` 없음 → Phase 4에서 연결
  - ❌ 위시리스트: **미구현** (코드/마이페이지 메뉴 링크 없음)
- [ ] **Phase 4**: 결제 (PG사 연동, 주문 관리) - **README.md §5.5/§10에 상세 기획·운영 리스크 문서 있음**. 코드 0% (checkout은 "준비중" 플레이스홀더, 구매 버튼은 alert 핸들러)
  - 세부: A 사전준비(정책 확정·PG 심사·과세/면세 확인, 개발과 병렬) → **B-0 호스팅 이전(Vercel → Netlify 무료, 결제 개발 전 필수 선행)** → B 기반(DB/타입/서비스/admin 클라이언트/관리자 권한) → C 결제 플로우(토스 테스트 키, 바로 구매 포함) → D 주문 관리 + **사장님 알림·최소 관리자 화면(운송장 입력 포함, 오픈 필수)** → E 안정화(웹훅·대사 배치·리허설) 후 오픈 전환(웹훅 URL 등록·백업 체계·라이브 키·Netlify 한도 확인)
  - 주문서에 **수령 방식(픽업/배송) + 희망 수령일** 포함 (떡 = 주문제작, README §5.5-5) / 발송 시 운송장 입력 → 고객 배송조회 (§5.5-11)
- [ ] **Phase 5**: 관리자 대시보드 (단, 주문 목록·상태 변경 최소 기능은 Phase 4-D로 앞당김)
  - [x] 관리자 상품 편집(인라인, 대시보드 없음): 가격·설명·구성품·노출·이미지 + 되돌리기(이력 30건) — 2026-09-14~18 완료, 규칙은 위 "관리자 상품 편집" 절
  - [ ] 상품 추가·삭제·카테고리 — 착수 메모는 위 "다음 작업 메모"
- [ ] **Phase 6**: 커뮤니티 (리뷰, 공지, Q&A)

---

## 배포

- **플랫폼**: Vercel (현재) → **결제 개발 착수 전 Netlify 무료로 이전 예정** (README §10 Phase B-0 — Vercel Hobby는 상업 사용 금지 약관, Netlify 무료는 상업 사용 허용으로 고정비 0원)
  - 이전 후: 대사 배치는 Vercel Cron이 아닌 **Netlify Scheduled Functions**(`netlify/functions/`), 환경변수는 Netlify 컨텍스트(테스트/프로덕션)로 분리, 사용량 한도(함수 12.5만 호출/월) 모니터링
  - **이미지 서빙 전환 필수**: 현재는 Supabase Storage 직접 서빙(`unoptimized`) → 무료 egress(월 ~5GB) 초과 위험. 이전 시 `unoptimized` 제거 + `next.config` `remotePatterns`에 Supabase 도메인 등록 → **Netlify Image CDN 경유**(트래픽이 Netlify 100GB 쪽으로 계산, 자동 리사이즈·캐싱, 비용 0원)
- **DB/Storage**: Supabase
- **OAuth Redirect URI**: `https://<project-ref>.supabase.co/auth/v1/callback`
- **도메인 이전 시**: Supabase Site URL 변경 필수 (localhost → 실 도메인) — 호스팅만 Netlify로 바꾸고 `jinjood.com` 도메인을 유지하면 Supabase/OAuth 설정 변경 불필요

---

## 법적 문서

- **이용약관**: `src/components/legal/TermsContent.tsx` (시행일: 2026-03-01)
- **개인정보처리방침**: `src/components/legal/PrivacyContent.tsx` (시행일: 2026-03-01)
- **개인정보 보호책임자**: 조장현 (051-621-5108, jea6922@naver.com)
- 결제 기능 추가 시 → 이용약관(결제수단, 환불정책) + 개인정보처리방침(PG사 위탁업체) 업데이트 필요
- 시행일 변경 시 7일 전 공지 필요

---

## 사업자 정보

- **상호**: 진주떡집 | **대표**: 정창구외 1명 | **사업자번호**: 452-23-00331
- **주소**: 부산광역시 수영구 황령대로 481번길 10-3
- **전화**: 051-621-5108 | **계좌**: 부산은행 112-2038-7604-08 (정은아)
