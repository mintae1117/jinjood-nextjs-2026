// Menu Item Type
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: "chapssaltteok" | "mepssaltteok" | "tteokguk" | "others";
  tags: string[];
  is_popular: boolean;
  is_recommended: boolean;
  is_best: boolean;
  unit?: string; // 예: "1되/40개입", "2.2kg"
  seasonal?: boolean; // 계절 메뉴 여부
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Gift Set Type
export interface GiftSet {
  id: string;
  name: string;
  price: number;
  priceMax?: number; // 가격 범위가 있는 경우 (예: 떡케이크)
  description: string;
  image_url: string;
  category: "gift_set" | "songpyeon_set" | "baekil_dol_set";
  items: string[];
  unit?: string; // 예: "1세트/30개입"
  is_popular?: boolean;
  is_recommended?: boolean;
  is_best?: boolean;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Reciprocation Item Type
export interface ReciprocateItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: "ibaji" | "daprye";
  unit?: string; // 예: "2구", "1세트"
  is_popular?: boolean;
  is_recommended?: boolean;
  is_best?: boolean;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Banner Type
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Contact Info Type
export interface ContactInfo {
  address: string;
  phone: string[];
  email: string;
  bank_account: string;
  bank_name: string;
  account_holder: string;
  business_hours: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  call_hours: string;
  map_coordinates: {
    lat: number;
    lng: number;
  };
}

// Social Links Type
export interface SocialLinks {
  instagram: string;
  kakao_channel: string;
  naver_band: string;
  naver_blog: string;
}

// Category Filter Type
export type MenuCategory =
  | "all"
  | "chapssaltteok"
  | "mepssaltteok"
  | "tteokguk"
  | "others";
export type GiftCategory =
  | "all"
  | "gift_set"
  | "songpyeon_set"
  | "baekil_dol_set";
export type ReciprocateCategory = "all" | "ibaji" | "daprye";

// ==================== Auth Types ====================

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// 인증 상태 타입
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 로그인 폼 데이터
export interface LoginFormData {
  email: string;
  password: string;
}

// 회원가입 폼 데이터
export interface RegisterFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  phone?: string;
}

// 비밀번호 재설정 폼 데이터
export interface ForgotPasswordFormData {
  email: string;
}

// ==================== Cart Types ====================

// 상품 타입 (menu_item, gift_set, reciprocate_item)
export type ProductType = "menu_item" | "gift_set" | "reciprocate_item";

// 장바구니 아이템 타입
export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_type: ProductType;
  quantity: number;
  options: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  // 조인된 상품 정보 (클라이언트 사이드)
  product?: MenuItem | GiftSet | ReciprocateItem;
}

// 장바구니 상태 타입
export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
}

// 장바구니 추가 요청 데이터
export interface AddToCartData {
  product_id: string;
  product_type: ProductType;
  quantity: number;
  options?: Record<string, unknown>;
}
