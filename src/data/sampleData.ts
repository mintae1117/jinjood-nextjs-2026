/**
 * 정적 데이터 (Supabase에 저장하지 않는 데이터)
 *
 * 상품 데이터(menu_items, gift_sets, reciprocate_items)는
 * Supabase 데이터베이스에서 관리됩니다.
 */

// Contact Info - 사이트 전역에서 사용
export const contactInfo = {
  address: "부산광역시 수영구 황령대로 481번길 10-3",
  phone: {
    store: "051-621-5108",
    mobile: "010-6251-5108",
    admin: "010-4728-6922",
  },
  fax: "051-625-2720",
  email: "jea6922@naver.com",
  bank_account: "112-2038-7604-08",
  bank_name: "부산은행",
  account_holder: "정은아",
  business_hours: {
    weekday: "07시-19시",
    saturday: "07시-17시",
    sunday: "정기휴무",
  },
  call_hours: "매일 07시-21시 통화가능",
  map_coordinates: {
    lat: 35.1595454,
    lng: 129.1017891,
  },
  // 사업자 정보
  business_number: "452-23-00331",
  representative: "정창구외 1명",
  // 사이트 관리자 정보
  developer: {
    name: "김민태",
    github: "https://github.com/mintae1117",
  },
  site_admin: {
    name: "조장현",
    phone: "010-4728-6922",
  },
};

// Social Links - SNS 링크
export const socialLinks = {
  instagram: "https://www.instagram.com/busan_jinjoods_rice_cake",
  kakao_channel: "https://pf.kakao.com/_zsKlb",
  naver_band: "https://band.us/band/77842984",
  naver_blog: "https://m.blog.naver.com/jinjoo_ricecake",
};
