import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DELIVERY_FEE, DELIVERY_DAYS, TERMS_PATH, offerPolicyJsonLd } from "./merchantPolicy.ts";

const SITE = "https://www.jinjood.com";

describe("offerPolicyJsonLd — 구글 판매자 목록이 offers 에 요구하는 두 필드", () => {
  const policy = offerPolicyJsonLd(SITE);

  it("shippingDetails: 배송비·목적지·소요일이 전부 있고 장바구니 배송비와 같은 값", () => {
    const s = policy.shippingDetails;
    assert.equal(s["@type"], "OfferShippingDetails");
    assert.equal(s.shippingRate["@type"], "MonetaryAmount");
    assert.equal(s.shippingRate.value, DELIVERY_FEE);
    assert.equal(s.shippingRate.currency, "KRW");
    assert.equal(s.shippingDestination["@type"], "DefinedRegion");
    assert.equal(s.shippingDestination.addressCountry, "KR");

    const t = s.deliveryTime;
    assert.equal(t["@type"], "ShippingDeliveryTime");
    for (const q of [t.handlingTime, t.transitTime]) {
      assert.equal(q["@type"], "QuantitativeValue");
      assert.equal(q.unitCode, "DAY");
      assert.ok(Number.isInteger(q.minValue) && Number.isInteger(q.maxValue));
      assert.ok(q.minValue >= 0 && q.minValue <= q.maxValue);
    }
    // 약관 제10조 "당일 또는 익일 배송" — 준비+운송 합계 상한이 이틀을 넘지 않는다
    assert.ok(t.handlingTime.maxValue + t.transitTime.maxValue <= 2);
    assert.deepEqual(
      { h: t.handlingTime.maxValue, t: t.transitTime.maxValue },
      { h: DELIVERY_DAYS.handling.max, t: DELIVERY_DAYS.transit.max },
    );
  });

  it("hasMerchantReturnPolicy: 신선식품 단순변심 환불 불가(약관 제11조) + 약관 링크", () => {
    const r = policy.hasMerchantReturnPolicy;
    assert.equal(r["@type"], "MerchantReturnPolicy");
    assert.equal(r.applicableCountry, "KR");
    assert.equal(r.returnPolicyCategory, "https://schema.org/MerchantReturnNotPermitted");
    assert.equal(r.merchantReturnLink, `${SITE}${TERMS_PATH}`);
  });

  it("siteUrl 끝의 슬래시는 정리한다", () => {
    assert.equal(offerPolicyJsonLd(`${SITE}/`).hasMerchantReturnPolicy.merchantReturnLink, `${SITE}${TERMS_PATH}`);
  });
});
