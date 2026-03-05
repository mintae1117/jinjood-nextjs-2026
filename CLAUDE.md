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
├── mypage/                     # 마이페이지 (orders, wishlist, profile, settings)
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
# (예정) 결제
TOSS_CLIENT_KEY=<Toss Client Key>
TOSS_SECRET_KEY=<Toss Secret Key>  # NEXT_PUBLIC_ 접두사 없이 (서버 전용)
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
```

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
// 외부 이미지는 반드시 unoptimized prop 필요!
```

### 상품 타입별 동작
| 상품 타입 | 장바구니 | 바로 구매 | 문의하기 |
|----------|---------|----------|---------|
| menu_item | ✅ | 준비중 | - |
| gift_set | ✅ | 준비중 | - |
| reciprocate_item | - | - | ✅ (전화 문의) |

> **결제 기능 현재 상태**: "바로 구매하기" 버튼과 장바구니 "주문하기" 버튼은 disable 처리.
> 클릭 시 "결제 기능은 아직 준비중입니다" alert 표시. 무료배송 없음 (배송비 3,000원 고정).

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
- [x] **Phase 3**: 마이페이지 (주문내역, 위시리스트, 프로필, 설정)
- [ ] **Phase 4**: 결제 (PG사 연동, 주문 관리) - **README.md에 상세 기획 문서 있음**
- [ ] **Phase 5**: 관리자 대시보드
- [ ] **Phase 6**: 커뮤니티 (리뷰, 공지, Q&A)

---

## 배포

- **플랫폼**: Vercel (Git push 시 자동 배포)
- **DB/Storage**: Supabase
- **OAuth Redirect URI**: `https://<project-ref>.supabase.co/auth/v1/callback`
- **도메인 이전 시**: Supabase Site URL 변경 필수 (localhost → 실 도메인)

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
