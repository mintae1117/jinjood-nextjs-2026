import { createBrowserClient } from "@/lib/supabase";
import type { CartItem, AddToCartData, MenuItem, GiftSet, ReciprocateItem } from "@/types";

export const cartService = {
  // 장바구니 아이템 목록 조회
  async getCartItems(userId: string): Promise<CartItem[]> {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 상품 정보 조인
    const itemsWithProducts = await Promise.all(
      (data || []).map(async (item) => {
        const product = await this.getProductByTypeAndId(item.product_type, item.product_id);
        return { ...item, product };
      })
    );

    return itemsWithProducts;
  },

  // 장바구니에 아이템 추가
  async addToCart(userId: string, data: AddToCartData): Promise<CartItem> {
    const supabase = createBrowserClient();

    // 이미 장바구니에 있는지 확인
    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", data.product_id)
      .eq("product_type", data.product_type)
      .single();

    if (existing) {
      // 이미 있으면 수량 증가
      return this.updateQuantity(existing.id, existing.quantity + data.quantity);
    }

    // 새로 추가
    const { data: newItem, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: userId,
        product_id: data.product_id,
        product_type: data.product_type,
        quantity: data.quantity,
        options: data.options || {},
      })
      .select()
      .single();

    if (error) throw error;

    // 상품 정보 조인
    const product = await this.getProductByTypeAndId(newItem.product_type, newItem.product_id);

    return { ...newItem, product };
  },

  // 장바구니 아이템 수량 변경
  async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
    const supabase = createBrowserClient();

    if (quantity <= 0) {
      await this.removeFromCart(itemId);
      throw new Error("Item removed from cart");
    }

    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw error;

    // 상품 정보 조인
    const product = await this.getProductByTypeAndId(data.product_type, data.product_id);

    return { ...data, product };
  },

  // 장바구니에서 아이템 삭제
  async removeFromCart(itemId: string): Promise<void> {
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
  },

  // 장바구니 비우기
  async clearCart(userId: string): Promise<void> {
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  },

  // 상품 타입과 ID로 상품 정보 조회
  async getProductByTypeAndId(
    productType: string,
    productId: string
  ): Promise<MenuItem | GiftSet | ReciprocateItem | undefined> {
    const supabase = createBrowserClient();

    let tableName: string;
    switch (productType) {
      case "menu_item":
        tableName = "menu_items";
        break;
      case "gift_set":
        tableName = "gift_sets";
        break;
      case "reciprocate_item":
        tableName = "reciprocate_items";
        break;
      default:
        return undefined;
    }

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", productId)
      .single();

    if (error) return undefined;

    return data;
  },

  // 장바구니 아이템 수 조회
  async getCartItemCount(userId: string): Promise<number> {
    const supabase = createBrowserClient();

    const { count, error } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) throw error;

    return count || 0;
  },
};
