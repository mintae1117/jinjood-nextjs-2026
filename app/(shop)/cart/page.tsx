import { Metadata } from "next";
import CartContent from "@/components/cart/CartContent";

export const metadata: Metadata = {
  title: "장바구니 | 진주떡집",
  description: "진주떡집 장바구니 페이지입니다.",
};

export default function CartPage() {
  return <CartContent />;
}
