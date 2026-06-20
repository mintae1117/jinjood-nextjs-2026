import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오시는 길 | 진주떡집",
  description:
    "부산 수영구 남천동 진주떡집 위치 안내입니다. 황령대로 481번길 10-3, 전화 051-621-5108. 평일 07:00~19:00, 토요일 07:00~17:00 영업합니다.",
  openGraph: {
    title: "오시는 길 | 진주떡집",
    description:
      "부산 수영구 남천동 진주떡집 위치 안내입니다. 황령대로 481번길 10-3, 전화 051-621-5108.",
    url: "https://www.jinjood.com/contact",
  },
  alternates: {
    canonical: "https://www.jinjood.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
