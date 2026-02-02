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

| 분류 | 기술 | 버전 |
|------|------|------|
| Framework | **Next.js** (App Router) | 16.1.1 |
| Language | TypeScript | 5.x |
| React | React | 19.2.3 |
| Styling | Styled Components + Tailwind | 6.2.0 + 4.x |
| Animation | Framer Motion | 12.24.12 |
| Database | **Supabase** (PostgreSQL) | Latest |
| Auth | Supabase Auth | (예정) |
| Payment | Toss Payments / Stripe | (예정) |
| State | Zustand | (예정) |
| UI | React Icons, Swiper | 5.5.0 + 12.0.3 |

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
│   │   └── [id]/page.tsx          # (예정) 상품 상세
│   ├── gifts/                     # 선물 세트
│   │   ├── page.tsx
│   │   └── [id]/page.tsx          # (예정)
│   ├── reciprocate/               # 이바지/답례
│   │   ├── page.tsx
│   │   └── [id]/page.tsx          # (예정)
│   ├── contact/                   # 오시는 길
│   │   └── page.tsx
│   │
│   ├── (auth)/                    # (예정) 인증 그룹
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── (shop)/                    # (예정) 쇼핑 그룹
│   │   ├── cart/page.tsx          # 장바구니
│   │   ├── checkout/page.tsx      # 결제
│   │   └── orders/page.tsx        # 주문 내역
│   │
│   ├── (board)/                   # (예정) 게시판 그룹
│   │   ├── notice/page.tsx        # 공지사항
│   │   ├── review/page.tsx        # 상품 후기
│   │   └── qna/page.tsx           # Q&A
│   │
│   ├── (dashboard)/               # (예정) 마이페이지
│   │   ├── profile/page.tsx
│   │   ├── orders/page.tsx
│   │   └── wishlist/page.tsx
│   │
│   └── admin/                     # (예정) 관리자
│       ├── products/page.tsx
│       ├── orders/page.tsx
│       └── users/page.tsx
│
├── src/
│   ├── components/
│   │   ├── common/                # 공통 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── Button.tsx         # (예정)
│   │   │   ├── Input.tsx          # (예정)
│   │   │   ├── Modal.tsx          # (예정)
│   │   │   └── Loading.tsx        # (예정)
│   │   ├── home/                  # 홈페이지 전용
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── FeaturedMenu.tsx
│   │   │   ├── GiftSets.tsx
│   │   │   ├── VideoSection.tsx
│   │   │   └── SNSSection.tsx
│   │   ├── menu/                  # 메뉴 관련
│   │   │   ├── MenuCard.tsx
│   │   │   └── MenuFilter.tsx
│   │   ├── product/               # (예정) 상품 상세
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductOptions.tsx
│   │   │   └── ProductReviews.tsx
│   │   ├── cart/                  # (예정) 장바구니
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartEmpty.tsx
│   │   ├── checkout/              # (예정) 결제
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── PaymentMethod.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── auth/                  # (예정) 인증
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── SocialLogin.tsx
│   │   └── board/                 # (예정) 게시판
│   │       ├── PostList.tsx
│   │       ├── PostDetail.tsx
│   │       └── CommentSection.tsx
│   │
│   ├── hooks/                     # 커스텀 훅
│   │   ├── useAuth.ts             # (예정) 인증 훅
│   │   ├── useCart.ts             # (예정) 장바구니 훅
│   │   ├── useProducts.ts         # (예정) 상품 조회 훅
│   │   └── useOrders.ts           # (예정) 주문 훅
│   │
│   ├── stores/                    # (예정) Zustand 스토어
│   │   ├── authStore.ts           # 인증 상태
│   │   ├── cartStore.ts           # 장바구니 상태
│   │   └── uiStore.ts             # UI 상태 (모달, 토스트)
│   │
│   ├── services/                  # (예정) API 서비스
│   │   ├── auth.ts                # 인증 API
│   │   ├── products.ts            # 상품 API
│   │   ├── orders.ts              # 주문 API
│   │   ├── payments.ts            # 결제 API
│   │   └── board.ts               # 게시판 API
│   │
│   ├── types/                     # TypeScript 타입
│   │   └── index.ts
│   │
│   ├── styles/
│   │   ├── GlobalStyles.ts
│   │   └── theme.ts
│   │
│   ├── data/                      # 샘플 데이터 (임시)
│   │   └── sampleData.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts            # Supabase 클라이언트
│   │   └── registry.tsx           # Styled Components 레지스트리
│   │
│   └── utils/                     # (예정) 유틸리티
│       ├── format.ts              # 포맷팅 (가격, 날짜)
│       ├── validation.ts          # 유효성 검사
│       └── storage.ts             # 로컬 스토리지
│
├── supabase/
│   └── schema.sql                 # DB 스키마
│
└── public/
    ├── images/
    │   ├── banners/
    │   ├── menu/
    │   └── sns/
    └── videos/
```

---

## 환경변수

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=<Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<Google Maps API Key>

# (예정) 결제
TOSS_CLIENT_KEY=<Toss Client Key>
TOSS_SECRET_KEY=<Toss Secret Key>

# (예정) 소셜 로그인
KAKAO_CLIENT_ID=<Kakao Client ID>
GOOGLE_CLIENT_ID=<Google Client ID>
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
```

### 예정 테이블
```sql
-- 사용자 (Supabase Auth 연동)
users (id, email, name, phone, address, role, created_at)

-- 주문
orders (id, user_id, status, total_price, shipping_address, payment_method, created_at)

-- 주문 상품
order_items (id, order_id, product_id, quantity, price, options)

-- 장바구니
cart_items (id, user_id, product_id, quantity, options, created_at)

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

// (예정) 사용자
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
  role: 'customer' | 'admin';
  created_at: string;
}

// (예정) 장바구니 아이템
interface CartItem {
  id: string;
  product: MenuItem;
  quantity: number;
  options?: ProductOption[];
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
    success: '#22c55e',      // (예정)
    error: '#ef4444',        // (예정)
    warning: '#f59e0b',      // (예정)
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

## 인증 구현 가이드 (예정)

### Supabase Auth 설정
```typescript
// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// 로그인
await supabase.auth.signInWithPassword({ email, password });

// 소셜 로그인
await supabase.auth.signInWithOAuth({ provider: 'kakao' });

// 로그아웃
await supabase.auth.signOut();
```

### Auth 훅
```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 체크 및 구독
  }, []);

  return { user, loading, signIn, signOut };
}
```

---

## 장바구니 구현 가이드 (예정)

### Zustand 스토어
```typescript
// src/stores/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      // ...
    }),
    { name: 'jinjood-cart' }
  )
);
```

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

## API 서비스 패턴 (예정)

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

### Phase 1: 기본 기능 (현재)
- [x] 홈페이지 레이아웃
- [x] 메뉴 목록 페이지
- [x] 오시는 길 페이지
- [ ] Supabase 데이터 연동
- [ ] 상품 상세 페이지

### Phase 2: 쇼핑 기능
- [ ] 장바구니 기능
- [ ] 결제 페이지
- [ ] 주문 완료 페이지

### Phase 3: 인증 & 회원
- [ ] 로그인/회원가입
- [ ] 소셜 로그인 (카카오, 구글)
- [ ] 마이페이지

### Phase 4: 주문 관리
- [ ] 주문 내역 조회
- [ ] 주문 상태 추적
- [ ] 관리자 대시보드

### Phase 5: 커뮤니티
- [ ] 상품 리뷰
- [ ] 공지사항
- [ ] Q&A 게시판

---

## 배포

- **플랫폼**: Vercel
- **URL**: https://jinjood.vercel.app/ (예정)
- **CI/CD**: Git push 시 자동 배포
- **Database**: Supabase (별도 관리)
