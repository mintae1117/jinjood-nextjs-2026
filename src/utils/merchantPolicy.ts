/**
 * 배송·환불 정책의 단일 출처 — 값과 그 schema.org 표현을 함께 둔다.
 *
 * 쓰는 곳: 장바구니 요약(DELIVERY_FEE), 상품 JSON-LD(offerPolicyJsonLd → offers.shippingDetails / hasMerchantReturnPolicy).
 * 값의 근거는 이용약관 제10조(배송: 당일 또는 익일)·제11조(환불: 신선식품 단순변심 불가, 하자·오배송은 24시간 내 처리)다.
 * 약관 문구를 고치면 여기도 같이 고친다 — 검색 결과에 노출되는 값이라 약관과 어긋나면 안 된다.
 *
 * 2026-09 Search Console "판매자 목록 구조화된 데이터" 경고(offers 에 shippingDetails·hasMerchantReturnPolicy 누락)에 대응해 만들었다.
 * review·aggregateRating 경고는 실제 리뷰 데이터가 생기기 전까지 의도적으로 두는 것(허위 평점은 구글 정책 위반).
 *
 * 순수 모듈(런타임 import 없음) — node:test 로 검증한다.
 */

/** 배송비(원). 결제 도입 시 서버 값으로 단일화 예정 — 그때까지 장바구니와 JSON-LD 가 이 값을 함께 쓴다 */
export const DELIVERY_FEE = 3000;

/** 배송 소요일(영업일). 약관 제10조 "당일 또는 익일 배송" — 준비(주문제작) 0~1일 + 운송 0~1일 */
export const DELIVERY_DAYS = {
  handling: { min: 0, max: 1 },
  transit: { min: 0, max: 1 },
} as const;

/** 환불·교환 조항(제11조)이 있는 약관 페이지 경로 */
export const TERMS_PATH = "/terms";

interface Days {
  readonly min: number;
  readonly max: number;
}

function quantitativeDays(days: Days) {
  return {
    "@type": "QuantitativeValue",
    minValue: days.min,
    maxValue: days.max,
    unitCode: "DAY",
  } as const;
}

/**
 * Offer/AggregateOffer 에 spread 하는 두 필드.
 * - shippingDetails: 국내 전역 고정 배송비 + 소요일
 * - hasMerchantReturnPolicy: 단순변심 반품 불가(신선식품). 하자·오배송 처리는 법정 의무라 별도 카테고리 없이 약관 링크로 안내
 */
export function offerPolicyJsonLd(siteUrl: string) {
  const base = siteUrl.replace(/\/+$/, "");
  return {
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: DELIVERY_FEE,
        currency: "KRW",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "KR",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: quantitativeDays(DELIVERY_DAYS.handling),
        transitTime: quantitativeDays(DELIVERY_DAYS.transit),
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "KR",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      merchantReturnLink: `${base}${TERMS_PATH}`,
    },
  } as const;
}
