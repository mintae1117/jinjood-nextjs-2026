import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대표 메뉴 | 진주떡집",
  description:
    "진주떡집의 대표 메뉴를 만나보세요. 찹쌀떡, 멥쌀떡, 떡국떡 등 국내산 쌀로 정성껏 만든 전통 떡을 확인하실 수 있습니다.",
  openGraph: {
    title: "대표 메뉴 | 진주떡집",
    description:
      "진주떡집의 대표 메뉴를 만나보세요. 찹쌀떡, 멥쌀떡, 떡국떡 등 국내산 쌀로 정성껏 만든 전통 떡을 확인하실 수 있습니다.",
    url: "https://www.jinjood.com/represent",
  },
  alternates: {
    canonical: "https://www.jinjood.com/represent",
  },
};

export default function RepresentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
