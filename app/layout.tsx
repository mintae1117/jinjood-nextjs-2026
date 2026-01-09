import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import StyledComponentsRegistry from "@/lib/registry";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "진주떡집 | 1995년부터 이어온 부산 전통 떡집",
  description:
    "부산 수영구 남천동에 위치한 진주떡집입니다. 1995년부터 국내산 쌀과 엄선된 재료로 정성껏 만든 전통 떡을 제공합니다. 백설기, 인절미, 송편, 선물세트, 이바지떡 등 다양한 메뉴를 만나보세요.",
  keywords: [
    "진주떡집",
    "부산떡집",
    "남천동떡집",
    "전통떡",
    "백설기",
    "인절미",
    "송편",
    "선물세트",
    "이바지떡",
    "답례떡",
  ],
  authors: [{ name: "진주떡집" }],
  openGraph: {
    title: "진주떡집 | 1995년부터 이어온 부산 전통 떡집",
    description:
      "부산 수영구 남천동에 위치한 진주떡집입니다. 정성을 담아 만든 전통 떡을 만나보세요.",
    url: "https://jinjood.com",
    siteName: "진주떡집",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "진주떡집 | 1995년부터 이어온 부산 전통 떡집",
    description:
      "부산 수영구 남천동에 위치한 진주떡집입니다. 정성을 담아 만든 전통 떡을 만나보세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="naver-site-verification" content="" />
        <meta name="google-site-verification" content="" />
      </head>
      <body className={notoSansKR.variable}>
        <StyledComponentsRegistry>
          <Header />
          <main>{children}</main>
          <Footer />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
