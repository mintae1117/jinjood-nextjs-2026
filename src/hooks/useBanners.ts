'use client';

import { useState, useEffect } from 'react';
import { bannerService } from '@/services';
import { Banner } from '@/types';

/**
 * 배너 목록 조회 훅
 */
export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
  }, []);

  return { banners, isLoading, error };
}
