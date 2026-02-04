"use client";

import { useEffect, useCallback } from "react";
import { useCartStore, selectCartItemCount, selectCartTotal } from "@/stores";
import { useAuthStore, selectIsAuthenticated } from "@/stores";
import { cartService } from "@/services";
import type { AddToCartData } from "@/types";

export function useCart() {
  const { items, isLoading, setItems, addItem, updateItem, removeItem, clearItems, setLoading, setCartLoaded, isCartLoaded } =
    useCartStore();
  const totalItems = useCartStore(selectCartItemCount);
  const totalPrice = useCartStore(selectCartTotal);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);

  // 로그인 시 장바구니 로드
  useEffect(() => {
    if (isAuthInitialized && isAuthenticated && user?.id) {
      loadCart();
    } else if (isAuthInitialized && !isAuthenticated) {
      // 로그아웃 시 장바구니 초기화
      setItems([]);
      setCartLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthInitialized, isAuthenticated, user?.id]);

  // 장바구니 로드
  const loadCart = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const cartItems = await cartService.getCartItems(user.id);
      setItems(cartItems);
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string; details?: string };
      console.error("Load cart error:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        error,
      });
      // 테이블이 없는 경우 빈 배열로 설정
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, setItems, setLoading]);

  // 장바구니에 추가
  const addToCart = useCallback(
    async (data: AddToCartData) => {
      if (!isAuthenticated || !user?.id) {
        return {
          success: false,
          error: "로그인이 필요합니다.",
          requireLogin: true,
        };
      }

      setLoading(true);
      try {
        const newItem = await cartService.addToCart(user.id, data);
        addItem(newItem);
        return { success: true, item: newItem };
      } catch (error: unknown) {
        const err = error as { message?: string; code?: string; details?: string };
        console.error("Add to cart error:", {
          message: err?.message,
          code: err?.code,
          details: err?.details,
          error,
        });
        return {
          success: false,
          error: err?.message || "장바구니 추가에 실패했습니다. cart_items 테이블이 생성되어 있는지 확인하세요.",
        };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user?.id, addItem, setLoading]
  );

  // 수량 변경
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        return removeFromCart(itemId);
      }

      setLoading(true);
      try {
        const updatedItem = await cartService.updateQuantity(itemId, quantity);
        updateItem(itemId, updatedItem);
        return { success: true, item: updatedItem };
      } catch (error) {
        console.error("Update quantity error:", error);
        // 아이템이 삭제된 경우
        if (error instanceof Error && error.message === "Item removed from cart") {
          removeItem(itemId);
          return { success: true, removed: true };
        }
        return {
          success: false,
          error: error instanceof Error ? error.message : "수량 변경에 실패했습니다.",
        };
      } finally {
        setLoading(false);
      }
    },
    [updateItem, removeItem, setLoading]
  );

  // 장바구니에서 제거
  const removeFromCart = useCallback(
    async (itemId: string) => {
      setLoading(true);
      try {
        await cartService.removeFromCart(itemId);
        removeItem(itemId);
        return { success: true };
      } catch (error) {
        console.error("Remove from cart error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "삭제에 실패했습니다.",
        };
      } finally {
        setLoading(false);
      }
    },
    [removeItem, setLoading]
  );

  // 장바구니 비우기
  const clearCart = useCallback(async () => {
    if (!user?.id) return { success: false, error: "로그인이 필요합니다." };

    setLoading(true);
    try {
      await cartService.clearCart(user.id);
      clearItems();
      return { success: true };
    } catch (error) {
      console.error("Clear cart error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "장바구니 비우기에 실패했습니다.",
      };
    } finally {
      setLoading(false);
    }
  }, [user?.id, clearItems, setLoading]);

  return {
    items,
    isLoading,
    isCartLoaded,
    totalItems,
    totalPrice,
    isAuthenticated,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
