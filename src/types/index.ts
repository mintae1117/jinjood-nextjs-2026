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
  created_at?: string;
}

// Gift Set Type
export interface GiftSet {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: "gift_set" | "songpyeon_set" | "baekil_dol_set";
  items: string[];
  created_at?: string;
}

// Reciprocation Item Type
export interface ReciprocateItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: "ibaji" | "daprye";
  created_at?: string;
}

// Banner Type
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link?: string;
  order: number;
  is_active: boolean;
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
