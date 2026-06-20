import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "선물세트 | 진주떡집",
  description:
    "진주떡집의 선물세트를 만나보세요. 명절 선물, 송편 세트, 백일·돌 세트 등 특별한 날을 위한 정성스러운 떡 선물을 준비했습니다.",
  openGraph: {
    title: "선물세트 | 진주떡집",
    description:
      "진주떡집의 선물세트를 만나보세요. 명절 선물, 송편 세트, 백일·돌 세트 등 특별한 날을 위한 정성스러운 떡 선물을 준비했습니다.",
    url: "https://www.jinjood.com/gifts",
  },
  alternates: {
    canonical: "https://www.jinjood.com/gifts",
  },
};

export default function GiftsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
