'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services';
import { useAuthStore, selectIsAdmin } from '@/stores';
import { MenuItem, GiftSet, ReciprocateItem } from '@/types';

// 관리자는 노출 off 상품도 본다. useAuth()는 초기화 부수효과가 있어 훅 안에서는 store 셀렉터로 읽는다.
function useIncludeInactive() {
  return useAuthStore(selectIsAdmin);
}

/**
 * 메뉴 아이템 목록 조회 훅
 */
export function useMenuItems(category?: string) {
  const includeInactive = useIncludeInactive();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getMenuItems(category, { includeInactive });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [category, includeInactive]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}

/**
 * 단일 메뉴 아이템 조회 훅
 */
export function useMenuItem(id: string | null, initialItem?: MenuItem | null) {
  const includeInactive = useIncludeInactive();
  // 서버가 미리 조회해 넘겨준 값으로 시작한다 — 첫 HTML에 상품 내용이 실리게 하려는 것.
  const [item, setItem] = useState<MenuItem | null>(initialItem ?? null);
  const [isLoading, setIsLoading] = useState(!initialItem);
  const [error, setError] = useState<Error | null>(null);

  // fetchItem 안에서 setIsLoading(true)를 하지 않는다. 서버 값으로 이미 그려 둔 화면을
  // 로딩 스피너로 되돌리면 깜빡이고, 관리자 수정 후 refetch에서도 마찬가지다.
  const fetchItem = useCallback(async () => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await productService.getMenuItem(id, { includeInactive });
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [id, includeInactive]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return { item, isLoading, error, refetch: fetchItem };
}

/**
 * 단일 선물세트 조회 훅
 */
export function useGiftSet(id: string | null, initialItem?: GiftSet | null) {
  const includeInactive = useIncludeInactive();
  // 서버가 미리 조회해 넘겨준 값으로 시작한다 — 첫 HTML에 상품 내용이 실리게 하려는 것.
  const [item, setItem] = useState<GiftSet | null>(initialItem ?? null);
  const [isLoading, setIsLoading] = useState(!initialItem);
  const [error, setError] = useState<Error | null>(null);

  // fetchItem 안에서 setIsLoading(true)를 하지 않는다. 서버 값으로 이미 그려 둔 화면을
  // 로딩 스피너로 되돌리면 깜빡이고, 관리자 수정 후 refetch에서도 마찬가지다.
  const fetchItem = useCallback(async () => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await productService.getGiftSet(id, { includeInactive });
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [id, includeInactive]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return { item, isLoading, error, refetch: fetchItem };
}

/**
 * 선물세트 목록 조회 훅
 */
export function useGiftSets(category?: string) {
  const includeInactive = useIncludeInactive();
  const [items, setItems] = useState<GiftSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getGiftSets(category, { includeInactive });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [category, includeInactive]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}

/**
 * 단일 이바지/답례 아이템 조회 훅
 */
export function useReciprocateItem(id: string | null, initialItem?: ReciprocateItem | null) {
  const includeInactive = useIncludeInactive();
  // 서버가 미리 조회해 넘겨준 값으로 시작한다 — 첫 HTML에 상품 내용이 실리게 하려는 것.
  const [item, setItem] = useState<ReciprocateItem | null>(initialItem ?? null);
  const [isLoading, setIsLoading] = useState(!initialItem);
  const [error, setError] = useState<Error | null>(null);

  // fetchItem 안에서 setIsLoading(true)를 하지 않는다. 서버 값으로 이미 그려 둔 화면을
  // 로딩 스피너로 되돌리면 깜빡이고, 관리자 수정 후 refetch에서도 마찬가지다.
  const fetchItem = useCallback(async () => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await productService.getReciprocateItem(id, { includeInactive });
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [id, includeInactive]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return { item, isLoading, error, refetch: fetchItem };
}

/**
 * 이바지/답례 아이템 목록 조회 훅
 */
export function useReciprocateItems(category?: string) {
  const includeInactive = useIncludeInactive();
  const [items, setItems] = useState<ReciprocateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getReciprocateItems(category, { includeInactive });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [category, includeInactive]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}

/**
 * 인기 메뉴 조회 훅 (홈)
 */
export function usePopularItems(limit: number = 9) {
  const includeInactive = useIncludeInactive();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getPopularItems(limit, { includeInactive });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [limit, includeInactive]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}
