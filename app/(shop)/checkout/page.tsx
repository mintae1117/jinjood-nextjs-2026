import { Metadata } from "next";
import PageHeader from "@/components/common/PageHeader";

export const metadata: Metadata = {
  title: "결제하기 | 진주떡집",
  description: "진주떡집 결제 페이지입니다.",
  // 검색 결과에 나올 이유가 없는 기능 페이지 — 색인하지 않는다(링크는 따라가도 됨)
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        title="결제하기"
        breadcrumbs={[
          { label: "홈", href: "/" },
          { label: "장바구니", href: "/cart" },
          { label: "결제하기" },
        ]}
      />
      <section
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "4rem 1rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            marginBottom: "1.5rem",
          }}
        >
          🔧
        </div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1e1e1e",
            marginBottom: "0.75rem",
          }}
        >
          결제 기능 개발중
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#666666",
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          결제 기능을 준비하고 있습니다.
          <br />
          빠른 시일 내에 온라인 주문이 가능하도록 하겠습니다.
        </p>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "#f35525",
            fontWeight: 600,
            marginBottom: "2.5rem",
          }}
        >
          전화 주문: 051-621-5108
        </p>
        <a
          href="/cart"
          style={{
            display: "inline-block",
            padding: "0.875rem 2rem",
            backgroundColor: "#f35525",
            color: "#ffffff",
            fontWeight: 600,
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          장바구니로 돌아가기
        </a>
      </section>

      <section
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "0 1rem 4rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#f8f8f8",
            borderRadius: "12px",
            padding: "1.5rem",
            border: "1px solid #eeeeee",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1e1e1e",
              marginBottom: "1rem",
            }}
          >
            환불/교환 정책 안내
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <li style={{ fontSize: "0.875rem", color: "#666666", lineHeight: 1.6 }}>
              • 떡류는 신선식품으로 단순 변심에 의한 반품이 불가합니다.
            </li>
            <li style={{ fontSize: "0.875rem", color: "#666666", lineHeight: 1.6 }}>
              • 상품 하자(파손, 변질) 또는 오배송의 경우에만 교환/환불이 가능합니다.
            </li>
            <li style={{ fontSize: "0.875rem", color: "#666666", lineHeight: 1.6 }}>
              • 수령 후 24시간 이내에 연락 바랍니다.
            </li>
            <li style={{ fontSize: "0.875rem", color: "#666666", lineHeight: 1.6 }}>
              • 상품 상태를 확인할 수 있는 사진이 필요합니다.
            </li>
          </ul>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#999999",
              marginTop: "1rem",
              lineHeight: 1.5,
            }}
          >
            자세한 내용은{" "}
            <a
              href="/terms"
              style={{ color: "#f35525", textDecoration: "underline" }}
            >
              이용약관 제11조
            </a>
            를 참고해 주세요.
          </p>
        </div>
      </section>
    </>
  );
}
