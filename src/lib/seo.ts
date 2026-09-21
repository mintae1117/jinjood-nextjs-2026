/**
 * SEO 공통 유틸 (서버·클라이언트 양쪽에서 쓰는 순수 함수)
 *
 * 구조화 데이터(JSON-LD)를 만드는 곳을 한 군데로 모은다. 루트 layout의 Bakery 스키마처럼
 * 사이트 전역에 하나만 있는 것은 그대로 두고, 페이지마다 달라지는 것(빵부스러기, 상품)을
 * 여기서 만든다.
 */

import { offerPolicyJsonLd } from "@/utils/merchantPolicy";

export const SITE_URL = "https://www.jinjood.com";

export interface BreadcrumbEntry {
  /** 검색 결과 경로에 표시될 이름 */
  name: string;
  /** SITE_URL 기준 경로. 마지막 항목(현재 페이지)은 생략 가능 */
  path?: string;
}

/**
 * BreadcrumbList 스키마.
 * 구글이 네비게이션에서 멋대로 추론한 경로 대신 의도한 계층을 보여주게 한다.
 * "홈"은 항상 첫 항목으로 자동 추가한다.
 */
export function breadcrumbJsonLd(trail: BreadcrumbEntry[]) {
  const entries: BreadcrumbEntry[] = [{ name: "홈", path: "/" }, ...trail];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      // 마지막(현재 페이지)에는 item을 넣지 않는 것이 schema.org 권장 형태
      ...(entry.path ? { item: `${SITE_URL}${entry.path}` } : {}),
    })),
  };
}

export interface ProductJsonLdInput {
  name: string;
  description?: string | null;
  image: string;
  /** SITE_URL 기준 경로 (예: /represent/<id>) */
  path: string;
  price: number;
  /** 이바지·답례처럼 화면에 "45,000원 ~"로 표시되는 맞춤 주문 상품 */
  priceFrom?: boolean;
}

/**
 * Product + Offer 스키마.
 * 검색 결과에 가격이 노출될 수 있고, 상품 페이지라는 것을 명시적으로 알린다.
 *
 * offers 에는 배송(shippingDetails)·환불(hasMerchantReturnPolicy) 정책을 항상 싣는다 — 구글 "판매자 목록"이
 * 요구하는 필드(2026-09 Search Console 경고). 값은 merchantPolicy.ts 가 약관 제10·11조와 맞춰 관리한다.
 * review·aggregateRating 은 실제 리뷰가 생기기 전까지 넣지 않는다(허위 평점은 구글 정책 위반, 경고는 '권장' 수준).
 */
export function productJsonLd({
  name,
  description,
  image,
  path,
  price,
  priceFrom = false,
}: ProductJsonLdInput) {
  const policy = offerPolicyJsonLd(SITE_URL);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description ? { description } : {}),
    image,
    url: `${SITE_URL}${path}`,
    brand: {
      "@type": "Brand",
      name: "진주떡집",
    },
    // 화면이 "45,000원 ~"로 시작가를 보여주는 상품에 Offer로 확정가를 단언하면
    // 검색 결과에 뜨는 가격이 페이지와 달라진다. AggregateOffer의 lowPrice가 맞다.
    offers: priceFrom
      ? {
          "@type": "AggregateOffer",
          url: `${SITE_URL}${path}`,
          priceCurrency: "KRW",
          lowPrice: String(price),
          offerCount: 1,
          availability: "https://schema.org/InStock",
          seller: { "@type": "Bakery", name: "진주떡집" },
          ...policy,
        }
      : {
          "@type": "Offer",
          url: `${SITE_URL}${path}`,
          priceCurrency: "KRW",
          price: String(price),
          availability: "https://schema.org/InStock",
          seller: { "@type": "Bakery", name: "진주떡집" },
          ...policy,
        },
  };
}
