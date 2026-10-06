import { Metadata } from "next";
import CartContent from "@/components/cart/CartContent";

export const metadata: Metadata = {
  title: "장바구니 | 진주떡집",
  description: "진주떡집 장바구니 페이지입니다.",
  // 검색 결과에 나올 이유가 없는 기능 페이지 — 색인하지 않는다(링크는 따라가도 됨)
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartContent />;
}
