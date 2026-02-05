# Jinjood Next.js E-Commerce 개발 규칙 (Claude Code)

## 프로젝트 개요
진주당(Jinjood) 전통 떡 전문점 이커머스 웹사이트. 상품 판매, 주문, 결제 기능을 갖춘 풀스택 웹 애플리케이션.

**Live URL**: https://jinjood.vercel.app/ (예정)

---

## 기본 원칙
- 모든 대화와 코드 주석은 한국어로 작성
- TypeScript strict 모드 준수
- 컴포넌트 단위 개발 (재사용성 최우선)
- 모바일 우선 반응형 디자인
- Supabase 데이터베이스 연동

---

## 기술 스택

| 분류 | 기술 | 버전 | 상태 |
|------|------|------|------|
| Framework | **Next.js** (App Router) | 16.1.1 | ✅ |
| Language | TypeScript | 5.x | ✅ |
| React | React | 19.2.3 | ✅ |
| Styling | Styled Components + Tailwind | 6.2.0 + 4.x | ✅ |
| Animation | Framer Motion | 12.24.12 | ✅ |
| Database | **Supabase** (PostgreSQL) | Latest | ✅ |
| Auth | Supabase Auth + @supabase/ssr | Latest | ✅ |
| State | Zustand | 5.x | ✅ |
| Payment | Toss Payments / Stripe | - | 예정 |
| UI | React Icons, Swiper | 5.5.0 + 12.0.3 | ✅ |
| Map | Google Maps Embed | iframe | ✅ |

---

## 개발 명령어

```bash
# 개발 서버 실행 (포트 3001)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트
npm run lint
```

---

## 프로젝트 구조

```
/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # 루트 레이아웃
│   ├── page.tsx                   # 홈페이지
│   ├── globals.css                # 글로벌 스타일
│   │
│   ├── represent/                 # 대표 메뉴
│   │   ├── page.tsx               # 목록 페이지
│   │   └── [id]/page.tsx          # ✅ 상품 상세 페이지
│   ├── gifts/                     # 선물 세트
│   │   ├── page.tsx
│   │   └── [id]/page.tsx          # ✅ 상품 상세 페이지
│   ├── reciprocate/               # 이바지/답례
│   │   ├── page.tsx
│   │   └── [id]/page.tsx          # ✅ 상품 상세 페이지
│   ├── contact/                   # 오시는 길
│   │   └── page.tsx               # ✅ Google Maps embed
│   │
│   ├── mypage/                    # ✅ 마이페이지
│   │   ├── page.tsx               # 마이페이지 메인
│   │   ├── orders/page.tsx        # 주문 내역
│   │   ├── wishlist/page.tsx      # 위시리스트
│   │   ├── profile/page.tsx       # 프로필 설정
│   │   └── settings/page.tsx      # 알림/테마 설정
│   │
│   ├── (auth)/                    # ✅ 인증 그룹
│   │   ├── login/page.tsx         # 로그인 페이지
│   │   ├── register/page.tsx      # 회원가입 페이지
│   │   └── forgot-password/page.tsx # 비밀번호 찾기
│   │
│   ├── (legal)/                   # ✅ 법적 문서 그룹
│   │   ├── terms/page.tsx         # 이용약관
│   │   └── privacy/page.tsx       # 개인정보처리방침
│   │
│   ├── auth/                      # ✅ OAuth 콜백
│   │   └── callback/route.ts      # Supabase OAuth 콜백 핸들러
│   │
│   ├── cart/                      # ✅ 장바구니
│   │   └── page.tsx
│   │
│   ├── favicon.ico                # ✅ 파비콘
│   ├── apple-icon.png             # ✅ Apple 터치 아이콘
│   │
│   ├── (board)/                   # (예정) 게시판 그룹
│   │   ├── notice/page.tsx        # 공지사항
│   │   ├── review/page.tsx        # 상품 후기
│   │   └── qna/page.tsx           # Q&A
│   │
│   └── admin/                     # (예정) 관리자
│       ├── products/page.tsx
│       ├── orders/page.tsx
│       └── users/page.tsx
│
├── middleware.ts                  # ✅ Supabase 세션 관리 미들웨어
│
├── src/
│   ├── components/
│   │   ├── common/                # 공통 컴포넌트
│   │   │   ├── Header.tsx         # ✅ 로고 이미지 + 로그인/장바구니/검색 버튼 포함
│   │   │   ├── Footer.tsx         # ✅ 사업자정보/개발자정보 + 이용약관/개인정보처리방침 링크
│   │   │   ├── SearchBar.tsx      # ✅ 상품 검색 오버레이
│   │   │   ├── PageHeader.tsx
│   │   │   ├── Loading.tsx        # ✅ 로딩 스피너
│   │   │   ├── Button.tsx         # (예정)
│   │   │   ├── Input.tsx          # (예정)
│   │   │   └── Modal.tsx          # (예정)
│   │   ├── home/                  # 홈페이지 전용
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── FeaturedMenu.tsx
│   │   │   ├── GiftSets.tsx       # ✅ 장바구니 담기 버튼 포함
│   │   │   ├── VideoSection.tsx   # ✅ Supabase Storage 이미지 사용
│   │   │   ├── SNSSection.tsx
│   │   │   └── LocationSection.tsx # ✅ Google Maps embed + 연락처 정보
│   │   ├── menu/                  # 메뉴 관련
│   │   │   ├── MenuCard.tsx       # ✅ 장바구니 담기 버튼 포함
│   │   │   └── MenuFilter.tsx
│   │   ├── product/               # ✅ 상품 상세
│   │   │   └── ProductDetail.tsx  # 통합 상품 상세 컴포넌트 (모든 상품 타입 지원)
│   │   ├── cart/                  # ✅ 장바구니
│   │   │   ├── CartContent.tsx    # 메인 컨텐츠 (로그인 체크)
│   │   │   ├── CartItem.tsx       # 개별 아이템 카드
│   │   │   ├── CartSummary.tsx    # 요약 및 결제 버튼
│   │   │   └── CartEmpty.tsx      # 빈 장바구니 안내
│   │   ├── checkout/              # (예정) 결제
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── PaymentMethod.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── auth/                  # ✅ 인증
│   │   │   ├── LoginForm.tsx      # 이메일 + 카카오 + 구글 로그인
│   │   │   ├── RegisterForm.tsx   # 회원가입 폼
│   │   │   ├── ForgotPasswordForm.tsx # 비밀번호 찾기
│   │   │   └── UserDropdown.tsx   # 로그인 후 사용자 메뉴
│   │   ├── legal/                 # ✅ 법적 문서
│   │   │   ├── TermsContent.tsx   # 이용약관 내용
│   │   │   └── PrivacyContent.tsx # 개인정보처리방침 내용
│   │   └── board/                 # (예정) 게시판
│   │       ├── PostList.tsx
│   │       ├── PostDetail.tsx
│   │       └── CommentSection.tsx
│   │
│   ├── hooks/                     # 커스텀 훅
│   │   ├── index.ts               # 통합 export
│   │   ├── useAuth.ts             # ✅ 인증 상태 초기화, 세션 구독
│   │   ├── useCart.ts             # ✅ 장바구니 작업 래퍼
│   │   ├── useProducts.ts         # ✅ 상품 조회 훅 (목록 + 단일 조회)
│   │   ├── useBanners.ts          # 배너 조회 훅
│   │   └── useOrders.ts           # (예정) 주문 훅
│   │
│   ├── stores/                    # ✅ Zustand 스토어
│   │   ├── index.ts               # 통합 export
│   │   ├── authStore.ts           # 사용자 상태, 인증 상태
│   │   └── cartStore.ts           # 장바구니 아이템, 총액 계산
│   │
│   ├── services/                  # API 서비스
│   │   ├── index.ts               # 통합 export
│   │   ├── auth.ts                # ✅ 회원가입, 로그인, 로그아웃, 카카오/구글 OAuth
│   │   ├── cart.ts                # ✅ 장바구니 CRUD
│   │   ├── products.ts            # 상품 API
│   │   ├── banners.ts             # 배너 API
│   │   ├── settings.ts            # 사이트 설정 API
│   │   ├── orders.ts              # (예정) 주문 API
│   │   └── payments.ts            # (예정) 결제 API
│   │
│   ├── types/                     # TypeScript 타입
│   │   └── index.ts               # ✅ User, CartItem, AuthState 등 추가
│   │
│   ├── styles/
│   │   ├── GlobalStyles.ts
│   │   └── theme.ts
│   │
│   ├── data/                      # 샘플 데이터 (임시)
│   │   └── sampleData.ts
│   │
│   ├── lib/
│   │   ├── supabase/              # ✅ Supabase 클라이언트 (리팩토링)
│   │   │   ├── index.ts           # 통합 export + 싱글톤 supabase
│   │   │   ├── client.ts          # 브라우저용 클라이언트
│   │   │   ├── server.ts          # 서버 컴포넌트용 클라이언트
│   │   │   └── middleware.ts      # 미들웨어용 클라이언트
│   │   └── registry.tsx           # Styled Components 레지스트리
│   │
│   └── utils/                     # (예정) 유틸리티
│       ├── format.ts              # 포맷팅 (가격, 날짜)
│       ├── validation.ts          # 유효성 검사
│       └── storage.ts             # 로컬 스토리지
│
├── supabase/
│   ├── schema.sql                 # DB 스키마
│   └── cart_items.sql             # ✅ 장바구니 테이블 (Supabase에서 실행 필요)
│
└── public/
    ├── images/
    │   ├── logo.png               # ✅ 로고 이미지
    │   └── sns/                   # SNS 이미지 (banners, menu는 Supabase Storage로 이동)
    └── videos/
        └── jinjooad.mp4           # 홍보 영상
```

---

## 환경변수

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=<Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>

# (예정) 결제
TOSS_CLIENT_KEY=<Toss Client Key>
TOSS_SECRET_KEY=<Toss Secret Key>

# 카카오 OAuth는 Supabase Dashboard에서 설정
# Redirect URI: https://<project-ref>.supabase.co/auth/v1/callback
```

---

## Supabase 데이터베이스 스키마

### 현재 테이블
```sql
-- 상품 테이블
menu_items (id, name, price, category, tags[], is_popular, is_best, is_recommended, display_order, is_active)

-- 선물세트 테이블
gift_sets (id, name, price, category, items[], display_order, is_active)

-- 이바지/답례 테이블
reciprocate_items (id, name, price, category, display_order, is_active)

-- 배너 테이블
banners (id, title, subtitle, image_url, link, display_order, is_active)

-- 사이트 설정
site_settings (key, value:JSONB)

-- ✅ 장바구니 (신규)
cart_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID,
  product_type VARCHAR(50),  -- 'menu_item' | 'gift_set' | 'reciprocate_item'
  quantity INTEGER,
  options JSONB,
  created_at, updated_at
)
```

### 예정 테이블
```sql
-- 주문
orders (id, user_id, status, total_price, shipping_address, payment_method, created_at)

-- 주문 상품
order_items (id, order_id, product_id, quantity, price, options)

-- 결제
payments (id, order_id, method, amount, status, transaction_id, created_at)

-- 리뷰
reviews (id, user_id, product_id, rating, content, images[], created_at)

-- 게시판
posts (id, user_id, board_type, title, content, views, created_at)

-- 댓글
comments (id, post_id, user_id, content, parent_id, created_at)

-- 위시리스트
wishlist (id, user_id, product_id, created_at)
```

### cart_items 테이블 생성 SQL
> **중요**: 장바구니 기능을 사용하려면 Supabase SQL Editor에서 아래 SQL을 실행해야 합니다.
> 파일 위치: `supabase/cart_items.sql`

```sql
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('menu_item', 'gift_set', 'reciprocate_item')),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  options JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, product_id, product_type)
);

-- RLS 정책
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
```

---

## 핵심 타입 정의

```typescript
// src/types/index.ts

// 상품
interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url: string;
  category: MenuCategory;
  tags: string[];
  is_popular: boolean;
  is_recommended: boolean;
  is_best: boolean;
  display_order: number;
  is_active: boolean;
}

type MenuCategory = 'chapssaltteok' | 'mepssaltteok' | 'tteokguk' | 'others';

// ✅ 사용자
interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

// ✅ 인증 상태
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ✅ 장바구니 아이템
interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_type: ProductType;  // 'menu_item' | 'gift_set' | 'reciprocate_item'
  quantity: number;
  options: Record<string, unknown>;
  product?: MenuItem | GiftSet | ReciprocateItem;  // 조인된 상품 정보
}

// (예정) 주문
interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  status: OrderStatus;
  total_price: number;
  shipping_address: Address;
  payment: Payment;
  created_at: string;
}

type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

// (예정) 결제
interface Payment {
  method: 'card' | 'bank_transfer' | 'kakao_pay' | 'toss_pay';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
}
```

---

## 스타일링 가이드

### 테마 색상
```typescript
// src/styles/theme.ts
const theme = {
  colors: {
    primary: '#f35525',      // 메인 오렌지
    primaryDark: '#d94820',  // 진한 오렌지
    secondary: '#1e1e1e',    // 거의 검정
    text: '#1e1e1e',
    textLight: '#666666',
    textMuted: '#999999',
    background: '#ffffff',
    backgroundGray: '#f8f8f8',
    border: '#eeeeee',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  }
};
```

### 스타일링 방식
1. **Styled Components**: 컴포넌트 스코프 스타일 (primary)
2. **Tailwind CSS v4**: 유틸리티 클래스 (secondary)
3. **CSS Variables**: 테마 시스템 (globals.css)

### 폰트
```css
font-family: 'Noto Sans KR', sans-serif;
/* weights: 300, 400, 500, 600, 700 */
```

---

## 컴포넌트 패턴

### 페이지 컴포넌트
```tsx
// app/represent/page.tsx
import { PageHeader } from '@/components/common/PageHeader';
import { MenuFilter } from '@/components/menu/MenuFilter';
import { MenuCard } from '@/components/menu/MenuCard';

export default function RepresentPage() {
  return (
    <>
      <PageHeader title="대표 메뉴" />
      <MenuFilter categories={categories} />
      <MenuGrid>
        {items.map(item => (
          <MenuCard key={item.id} item={item} />
        ))}
      </MenuGrid>
    </>
  );
}
```

### 클라이언트 컴포넌트
```tsx
// src/components/menu/MenuFilter.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function MenuFilter({ categories, onFilter }: Props) {
  const [selected, setSelected] = useState('all');
  // ...
}
```

### Styled Components + TypeScript
```tsx
// src/components/menu/styles.ts
import styled from 'styled-components';

interface CardProps {
  $isPopular?: boolean;
}

export const Card = styled.div<CardProps>`
  border: ${({ $isPopular }) => $isPopular ? '2px solid #f35525' : '1px solid #eee'};
`;
```

---

## 인증 구현 가이드 ✅

### Supabase 클라이언트 구조
```typescript
// src/lib/supabase/client.ts - 브라우저용
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// src/lib/supabase/server.ts - 서버 컴포넌트용
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url, key, { cookies: { ... } });
}
```

### Auth 서비스
```typescript
// src/services/auth.ts
export const authService = {
  // 이메일/비밀번호 로그인
  async signIn(data: LoginFormData) { ... },

  // 카카오 OAuth 로그인 (비즈앱: 이메일 포함)
  async signInWithKakao() {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "profile_nickname profile_image account_email",
      }
    });
  },

  // 구글 OAuth 로그인
  async signInWithGoogle() {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      }
    });
  },

  // 로그아웃
  async signOut() { ... },

  // 현재 사용자 정보
  async getCurrentUser() { ... },

  // Auth 상태 변경 구독
  onAuthStateChange(callback) { ... },
};
```

### Auth 훅
```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const { user, isLoading, setUser } = useAuthStore();

  useEffect(() => {
    // 초기화 및 세션 구독
    const subscription = authService.onAuthStateChange(setUser);
    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInWithKakao,
    signInWithGoogle,  // ✅ 구글 로그인 추가
    signOut,
    resetPassword,
  };
}
```

### 카카오 OAuth 설정 (비즈앱 필요)
1. [Kakao Developers](https://developers.kakao.com/)에서 앱 생성
2. **비즈앱 전환** (이메일 수집을 위해 필수)
3. 카카오 로그인 > 동의항목 설정:
   - 닉네임: 필수 동의
   - 프로필 사진: 선택 동의
   - 카카오계정(이메일): 필수 동의
4. Redirect URI 설정: `https://<project-ref>.supabase.co/auth/v1/callback`
5. Supabase Dashboard > Authentication > Providers > Kakao 활성화
6. Client ID(REST API 키)/Client Secret 입력
7. Scopes: `profile_nickname,profile_image,account_email`

### 구글 OAuth 설정
1. [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트 생성
2. API 및 서비스 > OAuth 동의 화면 설정 (외부)
3. 사용자 인증 정보 > OAuth 클라이언트 ID 생성 (웹 애플리케이션)
4. 승인된 리디렉션 URI: `https://<project-ref>.supabase.co/auth/v1/callback`
5. Supabase Dashboard > Authentication > Providers > Google 활성화
6. Client ID/Client Secret 입력

---

## 장바구니 구현 가이드 ✅

### Zustand 스토어
```typescript
// src/stores/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeItem: (itemId: string) => void;
  clearItems: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({ ... }),
    { name: 'jinjood-cart' }
  )
);
```

### Cart 서비스
```typescript
// src/services/cart.ts
export const cartService = {
  // 장바구니 조회
  async getCartItems(userId: string) { ... },

  // 장바구니 추가
  async addToCart(userId: string, data: AddToCartData) { ... },

  // 수량 변경
  async updateQuantity(itemId: string, quantity: number) { ... },

  // 삭제
  async removeFromCart(itemId: string) { ... },

  // 비우기
  async clearCart(userId: string) { ... },
};
```

### Cart 훅
```typescript
// src/hooks/useCart.ts
export function useCart() {
  const { items, isLoading } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  // 로그인 시 장바구니 로드
  useEffect(() => {
    if (isAuthenticated && user?.id) loadCart();
  }, [isAuthenticated]);

  return {
    items,
    totalItems,
    totalPrice,
    addToCart,      // 로그인 필요
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
```

---

## 상품 검색 구현 가이드 ✅

### SearchBar 컴포넌트
헤더의 검색 아이콘 클릭 시 오버레이 형태로 열리는 검색 바입니다.

```typescript
// src/components/common/SearchBar.tsx
interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

// 주요 기능
// - 실시간 검색 (300ms 디바운스)
// - 3개 테이블 통합 검색 (menu_items, gift_sets, reciprocate_items)
// - 키보드 네비게이션 (위/아래 화살표, Enter, ESC)
// - 검색 결과에 상품 타입 라벨 표시
// - 클릭 또는 Enter로 상품 상세 페이지 이동
```

### 사용 방법
```tsx
// src/components/common/Header.tsx
const [isSearchOpen, setIsSearchOpen] = useState(false);

<SearchButton onClick={() => setIsSearchOpen(true)}>
  <FiSearch />
</SearchButton>
<SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
```

---

## Google Maps Embed 구현 가이드 ✅

### iframe 사용
API 키 없이 Google Maps embed iframe을 사용합니다.

```tsx
// src/components/home/LocationSection.tsx 또는 app/contact/page.tsx
const MapWrapper = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

<MapWrapper>
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3262.7008587104706!2d129.1074524!3d35.1391379!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3568ece455555555%3A0x51b13060777f1eba!2z7KeE7KO865ah7KeR!5e0!3m2!1sko!2skr!4v1770170342174!5m2!1sko!2skr"
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  />
</MapWrapper>
```

### embed 코드 생성 방법
1. [Google Maps](https://www.google.com/maps)에서 장소 검색
2. 공유 버튼 클릭 > "지도 퍼가기" 선택
3. iframe 코드 복사

### 외부 지도 연결
```tsx
// 네이버 지도
<a href={`https://map.naver.com/v5/search/${encodeURIComponent(address)}`}>
  네이버 지도
</a>

// 카카오맵
<a href={`https://map.kakao.com/link/search/${encodeURIComponent(address)}`}>
  카카오맵
</a>
```

---

## 상품 상세 페이지 구현 가이드 ✅

### ProductDetail 컴포넌트
통합 상품 상세 컴포넌트로 모든 상품 타입(MenuItem, GiftSet, ReciprocateItem)을 지원합니다.

```typescript
// src/components/product/ProductDetail.tsx
interface ProductDetailProps {
  product: MenuItem | GiftSet | ReciprocateItem;
  productType: ProductType;  // 'menu_item' | 'gift_set' | 'reciprocate_item'
  backLink: string;          // 목록 페이지 링크
  backLabel: string;         // 뒤로가기 라벨
}

// 주요 기능
// - 상품 이미지, 이름, 가격, 설명 표시
// - MenuItem: 인기/베스트/추천 태그 표시
// - GiftSet: 구성품 목록 표시
// - ReciprocateItem: 문의하기 버튼 (장바구니 X)
// - 수량 선택 (ReciprocateItem 제외)
// - 장바구니 추가 + 바로 구매 버튼
// - 로그인 필요 안내 (비로그인 시)
```

### 상품 조회 훅
```typescript
// src/hooks/useProducts.ts
// 목록 조회
useMenuItems(category?)     // 메뉴 목록
useGiftSets(category?)      // 선물세트 목록
useReciprocateItems(category?)  // 이바지/답례 목록
usePopularItems(limit?)     // 인기 메뉴

// 단일 조회
useMenuItem(id)         // 단일 메뉴 조회
useGiftSet(id)          // 단일 선물세트 조회
useReciprocateItem(id)  // 단일 이바지/답례 조회
```

### 동적 라우트 페이지
```typescript
// app/represent/[id]/page.tsx
export default function MenuItemDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { item, isLoading, error } = useMenuItem(id);

  if (isLoading) return <Loading />;
  if (error || !item) return <NotFound />;

  return (
    <ProductDetail
      product={item}
      productType="menu_item"
      backLink="/represent"
      backLabel="메뉴 목록"
    />
  );
}
```

### 상품 타입별 동작
| 상품 타입 | 장바구니 | 바로 구매 | 문의하기 |
|----------|---------|----------|---------|
| menu_item | ✅ | ✅ | - |
| gift_set | ✅ | ✅ | - |
| reciprocate_item | - | - | ✅ |

---

## 결제 구현 가이드 (예정)

### Toss Payments 연동
```typescript
// src/services/payments.ts
import { loadTossPayments } from '@tosspayments/payment-sdk';

export async function requestPayment(order: Order) {
  const tossPayments = await loadTossPayments(process.env.TOSS_CLIENT_KEY);

  await tossPayments.requestPayment('카드', {
    amount: order.total_price,
    orderId: order.id,
    orderName: `진주당 주문 ${order.id}`,
    successUrl: `${window.location.origin}/checkout/success`,
    failUrl: `${window.location.origin}/checkout/fail`,
  });
}
```

---

## API 서비스 패턴

```typescript
// src/services/products.ts
import { supabase } from '@/lib/supabase';

export const productService = {
  // 상품 목록 조회
  async getProducts(category?: string) {
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // 상품 상세 조회
  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};
```

---

## 체크리스트

### 새 페이지 추가 시
- [ ] app/ 디렉토리에 page.tsx 생성
- [ ] PageHeader 컴포넌트 사용
- [ ] 메타데이터 설정 (SEO)
- [ ] 반응형 레이아웃 적용

### 새 컴포넌트 추가 시
- [ ] src/components/ 적절한 폴더에 생성
- [ ] TypeScript 인터페이스 정의
- [ ] Styled Components로 스타일링
- [ ] 'use client' 필요 여부 확인
- [ ] Framer Motion 애니메이션 (필요시)

### 새 API 연동 시
- [ ] src/services/에 서비스 파일 생성
- [ ] Supabase 쿼리 작성
- [ ] 에러 핸들링
- [ ] 타입 정의 (src/types/)

### 새 상태 관리 추가 시
- [ ] src/stores/에 Zustand 스토어 생성
- [ ] persist 미들웨어 적용 (필요시)
- [ ] 타입 정의

### 배포 전
- [ ] `npm run build` 성공
- [ ] `npm run lint` 경고 없음
- [ ] 환경변수 확인
- [ ] Supabase RLS 정책 확인
- [ ] 이미지 최적화 (WebP/AVIF)

---

## Git 커밋 규칙

```
<type>(<scope>): <subject>

# type
- feat: 새 기능
- fix: 버그 수정
- style: 스타일 변경
- refactor: 리팩토링
- docs: 문서
- chore: 기타

# scope
- auth: 인증
- cart: 장바구니
- checkout: 결제
- product: 상품
- order: 주문
- board: 게시판
- ui: UI 컴포넌트

# 예시
feat(cart): 장바구니 기능 구현
feat(auth): 카카오 소셜 로그인 추가
fix(checkout): 결제 금액 계산 버그 수정
style(product): 상품 카드 반응형 개선
```

---

## 개발 우선순위 (Roadmap)

### Phase 1: 기본 기능 ✅
- [x] 홈페이지 레이아웃
- [x] 메뉴 목록 페이지
- [x] 오시는 길 페이지 (Google Maps embed)
- [x] Supabase 데이터 연동
- [x] 상품 상세 페이지 (메뉴/선물세트/이바지·답례)
- [x] 상품 검색 기능
- [x] 홈페이지 오시는 길 섹션
- [x] 로고 이미지 + 파비콘 ✅
- [x] 이용약관 페이지 (/terms) ✅
- [x] 개인정보처리방침 페이지 (/privacy) ✅

### Phase 2: 인증 & 장바구니 ✅
- [x] 로그인/회원가입 페이지
- [x] 이메일 로그인
- [x] 카카오 소셜 로그인 (비즈앱 전환 필요)
- [x] 구글 소셜 로그인 ✅
- [x] 장바구니 기능 (로그인 필수)
- [x] Header에 로그인/장바구니 UI
- [x] 메뉴/선물세트 카드에 장바구니 담기 버튼

### Phase 3: 마이페이지 ✅
- [x] 마이페이지 메인 (/mypage)
- [x] 주문 내역 (/mypage/orders)
- [x] 위시리스트 (/mypage/wishlist)
- [x] 프로필 설정 (/mypage/profile)
- [x] 알림/테마 설정 (/mypage/settings)

### Phase 4: 결제 (예정)
- [ ] 결제 페이지
- [ ] Toss Payments 연동
- [ ] 주문 완료 페이지
- [ ] 주문 상태 추적

### Phase 5: 관리자 (예정)
- [ ] 관리자 대시보드
- [ ] 상품 관리
- [ ] 주문 관리

### Phase 6: 커뮤니티 (예정)
- [ ] 상품 리뷰
- [ ] 공지사항
- [ ] Q&A 게시판

---

## 사이트 정보 (sampleData.ts)

### contactInfo 구조
```typescript
// src/data/sampleData.ts
export const contactInfo = {
  address: "부산광역시 수영구 황령대로 481번길 10-3",
  phone: {
    store: "051-621-5108",     // 매장 전화
    mobile: "010-6251-5108",   // 휴대폰
    admin: "010-4728-6922",    // 관리자
  },
  fax: "051-625-2720",
  email: "jea6922@naver.com",
  bank_account: "112-2038-7604-08",
  bank_name: "부산은행",
  account_holder: "정은아",
  business_hours: {
    weekday: "07시-19시",
    saturday: "07시-17시",
    sunday: "정기휴무",
  },
  call_hours: "매일 07시-21시 통화가능",
  map_coordinates: {
    lat: 35.1595454,
    lng: 129.1017891,
  },
  // 사업자 정보
  business_number: "452-23-00331",
  representative: "정창구외 1명",
  // 개발자/관리자 정보
  developer: {
    name: "김민태",
    github: "https://github.com/mintae1117",
  },
  site_admin: {
    name: "조장현",
    phone: "010-4728-6922",
  },
};

export const socialLinks = {
  instagram: "https://www.instagram.com/busan_jinjoods_rice_cake",
  kakao_channel: "https://pf.kakao.com/_zsKlb",
  naver_band: "https://band.us/band/77842984",
  naver_blog: "https://m.blog.naver.com/jinjoo_ricecake",
};
```

---

## 법적 문서 ✅

> **⚠️ 최우선 원칙: 법적 문제 방지**
>
> 이커머스 서비스 운영 시 법적 준수가 최우선입니다. 기능 개발보다 법적 요구사항을 먼저 충족해야 합니다.

### 필수 법적 준수 사항

#### 1. 전자상거래법 준수 (필수)
- **사업자 정보 표시**: Footer에 상호, 대표자명, 사업자등록번호, 주소, 연락처 필수 표시
- **통신판매업 신고**: 온라인 판매 시 통신판매업 신고 필요 (관할 구청)
- **청약철회 안내**: 식품의 경우 단순변심 청약철회 제한 사항 명시
- **결제 전 최종 확인**: 주문 전 상품정보, 가격, 배송비 등 최종 확인 단계 필수

#### 2. 개인정보보호법 준수 (필수)
- **개인정보처리방침 게시**: 사이트 내 상시 열람 가능하도록 링크 제공
- **수집 동의**: 회원가입 시 개인정보 수집·이용 동의 받기
- **제3자 제공 동의**: 배송, 결제 등 외부 업체에 정보 제공 시 별도 동의
- **마케팅 동의**: 광고성 정보 발송 시 별도 선택 동의 (필수X)
- **개인정보 보호책임자**: 지정 및 연락처 공개 필수

#### 3. 식품 관련 법규 준수 (필수)
- **식품위생법**: 식품 제조·판매 시 영업허가/신고
- **식품 표시 기준**: 원재료, 알레르기 유발물질, 유통기한 등 표시
- **반품/환불 정책**: 식품 특성상 단순변심 반품 불가 명시 (하자 시 교환/환불 가능)

#### 4. 결제 시스템 도입 시 추가 준수사항
- **PG사 계약**: 정식 계약 및 보안 인증 필요
- **카드정보 비저장**: PCI-DSS 준수, 카드번호 직접 저장 금지
- **현금영수증/세금계산서**: 발행 시스템 구축
- **전자결제 약관**: 결제 관련 이용약관 추가

#### 5. 마케팅/알림 기능 도입 시 추가 준수사항
- **광고성 정보 표시**: 제목에 (광고) 표기
- **수신 동의**: 사전 동의 받은 사용자에게만 발송
- **수신 거부**: 간편한 수신거부 방법 제공 필수
- **야간 발송 제한**: 21시~08시 광고성 정보 발송 금지

### 법적 문서 미비 시 위험
- 개인정보보호법 위반: 최대 5천만원 과태료, 형사처벌 가능
- 전자상거래법 위반: 최대 1억원 과태료
- 식품위생법 위반: 영업정지, 과태료
- 소비자 분쟁 시 불리한 판결

---

### 이용약관 (/terms)
- 파일: `app/(legal)/terms/page.tsx`, `src/components/legal/TermsContent.tsx`
- 내용: 목적, 정의, 약관 효력, 서비스 제공/중단, 회원가입/탈퇴, 구매신청, 결제방법, 배송, 환불/교환(떡류 특성 반영), 분쟁해결
- 시행일: 2026년 3월 1일

### 개인정보처리방침 (/privacy)
- 파일: `app/(legal)/privacy/page.tsx`, `src/components/legal/PrivacyContent.tsx`
- 내용: 수집 목적/항목(소셜 로그인 포함), 보유기간, 제3자 제공, 위탁업체(배송/결제), 이용자 권리, 안전성 확보 조치, 쿠키 사용, 권익침해 구제방법
- 개인정보 보호책임자: 조장현 (대표)
- 연락처: 051-621-5108, jea6922@naver.com
- 시행일: 2026년 3월 1일

### Footer 링크
- `src/components/common/Footer.tsx`에서 이용약관, 개인정보처리방침 링크 연결

### 법적 문서 업데이트 가이드
새로운 기능이 추가될 때 아래 항목들을 확인하고 법적 문서를 업데이트해야 합니다.

**이용약관 업데이트 필요 시:**
- 결제 기능 추가 시: 결제방법, 환불/취소 정책 조항 업데이트
- 배송 방식 변경 시: 배송 관련 조항 업데이트
- 회원 등급/포인트 시스템 추가 시: 관련 조항 추가
- 구독 서비스 추가 시: 구독 관련 조항 추가

**개인정보처리방침 업데이트 필요 시:**
- 새로운 소셜 로그인 추가 시: 수집 항목 테이블 업데이트
- 결제 기능 추가 시: 결제 관련 개인정보 수집 항목 추가, 위탁업체(PG사) 추가
- 푸시 알림 기능 추가 시: 알림 관련 정보 수집 항목 추가
- 위치 기반 서비스 추가 시: 위치정보 수집/이용 조항 추가
- 새로운 외부 서비스 연동 시: 제3자 제공 또는 위탁업체 목록 업데이트
- 마케팅/광고 기능 추가 시: 마케팅 목적 수집/이용 조항 업데이트

**업데이트 절차:**
1. `src/components/legal/TermsContent.tsx` 또는 `PrivacyContent.tsx` 수정
2. 시행일 변경 (변경사항 적용 7일 전 공지 필요)
3. CLAUDE.md의 법적 문서 섹션 업데이트
4. (선택) 변경 전 사용자에게 공지사항으로 알림

---

## 배포

- **플랫폼**: Vercel
- **Staging URL**: https://jinjood-nextjs.vercel.app/ (테스트용)
- **Production URL**: https://jinjood.com (도메인 연결 후)
- **CI/CD**: Git push 시 자동 배포
- **Database**: Supabase (별도 관리)
- **Storage**: Supabase Storage (이미지 호스팅)
- **Map**: Google Maps Embed (API 키 불필요)

---

## Supabase Storage 구조 ✅

### 버킷: `images`

```
images/
├── placeholder.png          # 공통 대체 이미지 (이미지 없는 상품용)
├── banners/                  # 배너 이미지
│   ├── banner001.jpeg
│   ├── banner002.jpeg
│   └── banner003.jpeg
├── menu/                     # 대표 메뉴 이미지
│   ├── menu001.avif
│   ├── menu002.avif
│   └── ...
├── giftset/                  # 선물세트 이미지
│   ├── giftset01.avif
│   ├── giftset02.avif
│   └── ...
├── daprae/                   # 이바지/답례 이미지
│   ├── daprae02_01.avif
│   ├── daprae03_01.avif
│   └── ...
└── sns/                      # SNS 섹션 이미지
```

### DB 이미지 경로 형식

DB에는 **Supabase Storage 상대 경로**로 저장:
```
menu/menu001.avif
giftset/giftset01.avif
banners/banner001.jpeg
```

### 이미지 URL 헬퍼 함수

```typescript
// src/lib/supabase/index.ts
import { getStorageUrl } from "@/lib/supabase";

// 사용 예시
<Image src={getStorageUrl(item.image_url)} alt={item.name} />

// 동작 방식:
// - null/undefined → placeholder.png 반환
// - "ready" 포함 경로 → placeholder.png 반환 (대체 이미지)
// - 상대 경로 → Supabase Storage URL로 변환
// - 전체 URL → 그대로 반환
```

### 이미지 컴포넌트 사용 시 주의사항

외부 이미지(Supabase Storage)는 `unoptimized` prop 필수:
```tsx
<Image
  src={getStorageUrl(item.image_url)}
  alt={item.name}
  fill
  unoptimized  // 필수!
/>
```

---

## Vercel 배포 가이드

### 1. GitHub에 푸시
```bash
git init
git add .
git commit -m "Initial commit: 진주떡집 Next.js"
git branch -M main
git remote add origin https://github.com/your-username/jinjood-nextjs.git
git push -u origin main
```

### 2. Vercel 배포
1. [vercel.com](https://vercel.com) 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 import
4. **Environment Variables 설정** (필수!)
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dtrkgewjilthseguqlgy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```
5. "Deploy" 클릭

### 3. 배포 후 테스트 체크리스트
- [ ] 메뉴/선물세트/이바지 상품 목록 로딩
- [ ] 상품 상세 페이지
- [ ] 회원가입/로그인 (이메일, 카카오, 구글)
- [ ] 장바구니 담기/조회
- [ ] 검색 기능
- [ ] 지도 표시 (Google Maps embed)
- [ ] 모바일 반응형
- [ ] 이용약관/개인정보처리방침 페이지
- [ ] 로고/파비콘 표시

---

## 도메인 이전 가이드 (jinjood.com)

### 1. 기존 HTML 사이트 DNS 설정 백업
- 현재 DNS 레코드 스크린샷 저장

### 2. Vercel에서 도메인 추가
- Project > Settings > Domains > Add
- `jinjood.com` 입력

### 3. DNS 레코드 변경
- 기존 호스팅의 DNS에서 A 레코드 또는 CNAME을 Vercel 값으로 변경
- Vercel이 안내하는 값으로 설정
- 예시:
  - A 레코드: `76.76.21.21`
  - CNAME: `cname.vercel-dns.com`

### 4. DNS 전파 대기
- 최대 48시간 (보통 몇 분~몇 시간)

### 5. Supabase 설정 업데이트 (OAuth 로그인)
- Supabase Dashboard > Authentication > URL Configuration
- Site URL: `https://jinjood.com` (배포 URL로 변경 필수!)
- Redirect URLs에 추가:
  - `https://jinjood.com/**`
  - `http://localhost:3000/**` (개발용 유지)
- **중요**: Site URL이 localhost로 되어있으면 배포 환경에서 로그인 후 localhost로 리다이렉트됨

### 6. 도메인 이전 전 체크리스트
- [ ] 기존 사이트의 중요 URL이 새 사이트에도 있는지 확인
- [ ] 없어진 URL은 리다이렉트 설정 고려 (SEO 영향)
  - 예: `/menu.html` → `/represent`
- [ ] Google Search Console 사이트 등록
- [ ] Naver Search Advisor 사이트 등록
- [ ] layout.tsx의 naver/google site verification 코드 추가
