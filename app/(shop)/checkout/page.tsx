import { Metadata } from "next";
import PageHeader from "@/components/common/PageHeader";

export const metadata: Metadata = {
  title: "결제하기 | 진주떡집",
  description: "진주떡집 결제 페이지입니다.",
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
    </>
  );
}
