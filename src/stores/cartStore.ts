import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, MenuItem, GiftSet, ReciprocateItem } from "@/types";

interface CartStore {
  // 상태
  items: CartItem[];
  isLoading: boolean;

  // 액션
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeItem: (itemId: string) => void;
  clearItems: () => void;
  setLoading: (isLoading: boolean) => void;

  // 계산된 값
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// 상품 가격 가져오기 헬퍼
function getProductPrice(product: MenuItem | GiftSet | ReciprocateItem | undefined): number {
  if (!product) return 0;
  return product.price || 0;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.product_id === item.product_id && i.product_type === item.product_type
          );

          if (existingIndex >= 0) {
            // 이미 있으면 수량 증가
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + item.quantity,
            };
            return { items: newItems };
          }

          return { items: [...state.items, item] };
        }),

      updateItem: (itemId, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item
          ),
        })),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      clearItems: () => set({ items: [] }),

      setLoading: (isLoading) => set({ isLoading }),

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = getProductPrice(item.product);
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: "jinjood-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 로컬 스토리지에 저장할 상태 (로그인 전 임시 저장용)
        items: state.items,
      }),
    }
  )
);

// 파생 상태 셀렉터
export const selectCartItemCount = (state: CartStore) =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotal = (state: CartStore) =>
  state.items.reduce((total, item) => {
    const price = getProductPrice(item.product);
    return total + price * item.quantity;
  }, 0);
