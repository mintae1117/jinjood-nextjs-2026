'use client';

import { useState, useEffect } from 'react';
import { bannerService } from '@/services';
import { Banner } from '@/types';

/**
 * 배너 목록 조회 훅
 */
export function useBanners(initialBanners?: Banner[]) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners ?? []);
  const [isLoading, setIsLoading] = useState(!initialBanners);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 서버가 이미 넘겨준 배너가 있으면 같은 걸 또 조회하지 않는다
    if (initialBanners) return;

    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await bannerService.getBanners();
        setBanners(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('배너를 불러오는데 실패했습니다'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [initialBanners]);

  return { banners, isLoading, error };
}
