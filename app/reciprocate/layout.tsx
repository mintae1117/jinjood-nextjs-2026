import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이바지·답례 | 진주떡집",
  description:
    "진주떡집의 이바지떡과 답례떡을 만나보세요. 결혼, 감사의 마음을 전하는 정성스러운 전통 떡을 준비했습니다.",
  openGraph: {
    title: "이바지·답례 | 진주떡집",
    description:
      "진주떡집의 이바지떡과 답례떡을 만나보세요. 결혼, 감사의 마음을 전하는 정성스러운 전통 떡을 준비했습니다.",
    url: "https://jinjood.com/reciprocate",
  },
  alternates: {
    canonical: "https://jinjood.com/reciprocate",
  },
};

export default function ReciprocateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
