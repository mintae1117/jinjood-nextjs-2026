import { supabase } from '@/lib/supabase';

export interface SiteSettings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  kakaoChannel?: string;
}

export interface BusinessInfo {
  companyName: string;
  representative: string;
  businessNumber: string;
  address: string;
}

/**
 * 사이트 설정 관련 API 서비스
 */
export const settingsService = {
  /**
   * 특정 설정 조회
   */
  async getSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error(`Error fetching setting "${key}":`, error);
      return null;
    }

    return data?.value as T;
  },

  /**
   * 연락처 정보 조회
   */
  async getContactInfo(): Promise<ContactInfo | null> {
    return this.getSetting<ContactInfo>('contact_info');
  },

  /**
   * 사업자 정보 조회
   */
  async getBusinessInfo(): Promise<BusinessInfo | null> {
    return this.getSetting<BusinessInfo>('business_info');
  },

  /**
   * 모든 설정 조회
   */
  async getAllSettings(): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      console.error('Error fetching all settings:', error);
      throw new Error(`설정을 불러오는데 실패했습니다: ${error.message}`);
    }

    return data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, unknown>);
  },
};
