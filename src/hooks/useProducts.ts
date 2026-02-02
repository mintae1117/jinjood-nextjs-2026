'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services';
import { MenuItem, GiftSet, ReciprocateItem } from '@/types';

/**
 * 메뉴 아이템 목록 조회 훅
 */
export function useMenuItems(category?: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getMenuItems(category);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}

/**
 * 단일 메뉴 아이템 조회 훅
 */
export function useMenuItem(id: string | null) {
  const [item, setItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }

    const fetchItem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.getMenuItem(id);
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  return { item, isLoading, error };
}

/**
 * 단일 선물세트 조회 훅
 */
export function useGiftSet(id: string | null) {
  const [item, setItem] = useState<GiftSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }

    const fetchItem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.getGiftSet(id);
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  return { item, isLoading, error };
}

/**
 * 선물세트 목록 조회 훅
 */
export function useGiftSets(category?: string) {
  const [items, setItems] = useState<GiftSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getGiftSets(category);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}

/**
 * 단일 이바지/답례 아이템 조회 훅
 */
export function useReciprocateItem(id: string | null) {
  const [item, setItem] = useState<ReciprocateItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setIsLoading(false);
      return;
    }

    const fetchItem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.getReciprocateItem(id);
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  return { item, isLoading, error };
}

/**
 * 이바지/답례 아이템 목록 조회 훅
 */
export function useReciprocateItems(category?: string) {
  const [items, setItems] = useState<ReciprocateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getReciprocateItems(category);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, isLoading, error, refetch: fetchItems };
}

/**
 * 인기 메뉴 조회 훅
 */
export function usePopularItems(limit: number = 9) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.getPopularItems(limit);
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [limit]);

  return { items, isLoading, error };
}
