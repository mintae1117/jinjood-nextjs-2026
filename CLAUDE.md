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
│   ├── common/     # Header, Footer, SearchBar, PageHeader, Loading
│   ├── home/       # HeroBanner, FeaturedMenu, GiftSets, VideoSection, SNSSection, LocationSection
│   ├── menu/       # MenuCard, MenuFilter
│   ├── product/    # ProductDetail (통합 상품 상세 - 모든 상품 타입 지원)
│   ├── cart/       # CartContent, CartItem, CartSummary, CartEmpty
│   ├── auth/       # LoginForm, RegisterForm, ForgotPasswordForm, UserDropdown
│   └── legal/      # TermsContent, PrivacyContent
├── hooks/          # useAuth, useCart, useProducts, useBanners
├── stores/         # authStore (sessionStorage), cartStore (localStorage)
├── services/       # auth, cart, products, banners, settings
├── types/          # 모든 타입 정의
├── styles/         # GlobalStyles, theme
├── data/           # sampleData (연락처, 사업자 정보)
└── lib/
    ├── supabase/   # client.ts (브라우저), server.ts (서버), middleware.ts, index.ts (getStorageUrl)
    └── registry.tsx # Styled Components SSR 레지스트리
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
cart_items (id, user_id FK, product_id, product_type, quantity, options JSONB, created_at, updated_at)
  -- product_type: 'menu_item' | 'gift_set' | 'reciprocate_item'
  -- RLS: 본인 장바구니만 접근 가능
banners (id, title, subtitle, image_url, link, display_order, is_active)
site_settings (key, value JSONB)
user_profiles (id, user_id FK→auth.users UNIQUE, avatar_url, role 'user'|'admin', created_at, updated_at)
  -- role은 SQL Editor에서만 변경 가능(protect_user_profiles_role 트리거). 브라우저 세션은 변경 불가
product_revisions (id, table_name, record_id, changed_by FK→auth.users SET NULL, changed_at, before JSONB, after JSONB)
  -- 상품 3테이블 AFTER UPDATE 트리거가 자동 적재. 관리자만 SELECT, 사람이 INSERT/DELETE 불가
```

> **미생성(결제 도입 시 필요)**: `orders`(fulfillment_method·desired_date·운송장 컬럼·waiting_for_deposit 상태 포함), `order_items`(가격+options 스냅샷), `payments`(raw_response·가상계좌 정보) — README.md 결제 가이드 §4 참고. 작성 시 `supabase/schema.sql`의 기존 패턴(uuid_generate_v4, updated_at 트리거)과 `cart_items.sql`의 RLS 패턴 준용, 주문번호는 DB에서 생성(§4-4 레이스 컨디션)
> ⚠️ 단, `orders.user_id`는 `cart_items`와 달리 **ON DELETE SET NULL** (탈퇴해도 법정 5년 보관, README §5.5-12). `user_profiles.role`은 2026-09-14 관리자 상품 편집에서 추가 완료 — Phase 4-D는 `public.is_admin()`을 재사용

---

## 핵심 타입 (src/types/index.ts)

- `MenuItem` - 메뉴 상품 (category: chapssaltteok | mepssaltteok | tteokguk | others)
- `GiftSet` - 선물세트 (category: gift_set | songpyeon_set | baekil_dol_set, items: string[])
- `ReciprocateItem` - 이바지/답례 (category: ibaji | daprye)
- `ProductType` - 'menu_item' | 'gift_set' | 'reciprocate_item'
- `User` - id, email, name?, phone?, avatar_url?
- `CartItem` - id, user_id, product_id, product_type, quantity, product? (조인된 상품 정보)

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

### 상품 타입별 동작
| 상품 타입 | 장바구니 | 바로 구매 | 문의하기 |
|----------|---------|----------|---------|
| menu_item | ✅ | 준비중 | - |
| gift_set | ✅ | 준비중 | - |
| reciprocate_item | - | - | ✅ (전화 문의) |

> **결제 기능 현재 상태**: "바로 구매하기"/"주문하기" 버튼은 실제 `disabled`가 아니라 **회색 스타일 + alert 핸들러** 방식.
> 클릭 시 "결제 기능은 아직 준비중입니다" alert 표시. 무료배송 없음 (배송비 3,000원 — `CartSummary.tsx`에 하드코딩, 결제 도입 시 서버 값으로 단일화).
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
// 상품: useMenuItems(), useGiftSets(), useReciprocateItems(), useMenuItem(id), useGiftSet(id)
// 인증: useAuth() → { user, isAuthenticated, signIn, signUp, signInWithKakao, signInWithGoogle, signOut }
// 장바구니: useCart() → { items, totalItems, totalPrice, addToCart, updateQuantity, removeFromCart }
```

### 관리자 상품 편집
- DB: `supabase/admin_edit.sql` (1회 실행, idempotent, **코드 배포보다 먼저**). 검증은 `supabase/admin_edit_verify.sql`. 관리자 지정은 `INSERT … ON CONFLICT`(README 참고 — 로그인만으로는 `user_profiles` 행이 안 생김).
- 판별: `useAuthStore(selectIsAdmin)` (`user.role === 'admin'`). 데이터 훅 안에서는 `useAuth()`를 부르지 않는다(초기화 부수효과).
- 버튼: `src/components/admin/AdminEditButton.tsx` — 관리자가 아니면 `null` 반환. 목록 카드 3곳 + 홈 카드 2곳(`FeaturedMenu`·`GiftSets`) + `ProductDetail` 1곳.
- 쓰기: `adminService.updateProduct(productType, id, patch)` — 브라우저에서 바로 UPDATE, **RLS가 유일한 보안 경계**. 화이트리스트 4컬럼(`price`, `description`, `is_active`, `items`)만 통과.
- 조회: 관리자는 `productService.get*(…, { includeInactive: true })`로 노출 off 상품도 본다.
- 이력: `product_revisions`는 DB 트리거가 적재. 되돌리기는 `before`의 4컬럼을 폼에 얹어 `updateProduct`를 다시 타는 것(별도 API 없음).
- 리포의 `seed_data.sql`/`cleanup_and_reseed.sql`은 초기 스냅샷 — 실 데이터와 동기화하지 않는다.

### SEO — 크롤러가 읽는 HTML
- **함정**: 데이터를 `useEffect`로 받는 페이지는 서버 렌더 HTML이 비어 있다. 예전엔 홈이 `isLoading`일 때 페이지 전체를 `<Loading />`으로 감싸 크롤러가 받는 본문이 헤더·푸터뿐(618자)이었다. 구글은 JS를 실행해주지만 네이버 Yeti는 거의 안 한다.
- **원칙**: 홈과 목록은 서버 컴포넌트가 데이터를 조회해 `initial*` prop으로 내려준다(`src/services/products.server.ts`). 훅은 그 값으로 시작하고 하이드레이션 직후 재조회는 `{ silent: true }`로 조용히 돈다 — 이미 그려진 화면을 스피너로 되돌리면 관리자에게 번쩍인다. SEO를 위해 화면에 새 섹션을 만들지 않는다.
- 서버 조회가 실패하면 `null`을 돌려 prop을 비운다. 빈 배열을 넘기면 훅이 "데이터 있음"으로 보고 재조회를 건너뛰어 화면이 '상품이 하나도 없는 가게'가 된다.
- **상세 페이지**: `[id]/page.tsx`는 서버 컴포넌트다. `src/services/products.server.ts`의 `cache()`된 조회로 상품을 받아 `initialItem`으로 클라이언트에 넘긴다(같은 요청의 `generateMetadata`와 DB 왕복이 합쳐진다). 훅은 `useMenuItem(id, initialItem)`처럼 초기값을 받는다.
- **h1은 페이지당 하나**: 홈은 `HeroBanner`의 **첫 슬라이드만** h1(나머지 슬라이드는 h2), 목록은 `PageHeader`, 상세는 `ProductDetail`의 `ProductName`.
- **구조화 데이터**: 전역(`Bakery`·`SiteNavigationElement`)은 `app/layout.tsx`, 페이지별(`BreadcrumbList`·`Product`)은 `src/lib/seo.ts` + `src/components/common/JsonLd.tsx`.
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
