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
    "남천동 진주떡집",
    "남천 진주떡집",
    "남천동 떡집",
    "부산 전통떡",
    "전통떡",
    "백설기",
    "인절미",
    "송편",
    "선물세트",
    "이바지떡",
    "답례떡",
    "떡케이크",
    "찹쌀떡",
    "쑥떡",
    "호박인절미",
    "꿀떡",
    "떡함지",
    "약밥",
    "백일떡",
    "영양찰떡",
    "가래떡",
    "영양떡",
    "바람떡",
    "떡국떡",
    "수영구 떡집",
  ],
  authors: [{ name: "진주떡집" }],
  openGraph: {
    title: "진주떡집 | 1995년부터 이어온 부산 전통 떡집",
    description:
      "부산 수영구 남천동에 위치한 진주떡집입니다. 1995년부터 국내산 쌀과 엄선된 재료로 정성껏 만든 전통 떡을 제공합니다.",
    url: "https://jinjood.com",
    siteName: "진주떡집",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://dtrkgewjilthseguqlgy.supabase.co/storage/v1/object/public/images/banners/banner003.jpeg",
        width: 1200,
        height: 630,
        alt: "진주떡집 - 부산 전통 떡집",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "진주떡집 | 1995년부터 이어온 부산 전통 떡집",
    description:
      "부산 수영구 남천동에 위치한 진주떡집입니다. 1995년부터 국내산 쌀과 엄선된 재료로 정성껏 만든 전통 떡을 제공합니다.",
    images: ["https://dtrkgewjilthseguqlgy.supabase.co/storage/v1/object/public/images/banners/banner003.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://jinjood.com",
  },
  verification: {
    google: "_1LFsG0f0fXdal6iPcDWCngHlqQhN1HnSlxBfsRppEw",
    other: {
      "naver-site-verification": ["980e4196684350ce4e98bd0294decd6d57cc1295"],
    },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Bakery",
              name: "진주떡집",
              image: "https://dtrkgewjilthseguqlgy.supabase.co/storage/v1/object/public/images/banners/banner003.jpeg",
              url: "https://jinjood.com",
              telephone: "051-621-5108",
              address: {
                "@type": "PostalAddress",
                streetAddress: "황령대로 481번길 10-3",
                addressLocality: "수영구",
                addressRegion: "부산광역시",
                addressCountry: "KR",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 35.1391379,
                longitude: 129.1074524,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                  ],
                  opens: "07:00",
                  closes: "19:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Saturday",
                  opens: "07:00",
                  closes: "17:00",
                },
              ],
              sameAs: [
                "https://www.instagram.com/busan_jinjoods_rice_cake",
                "https://m.blog.naver.com/jinjoo_ricecake",
                "https://pf.kakao.com/_zsKlb",
              ],
              priceRange: "$$",
              servesCuisine: "한국 전통 떡",
              description:
                "1995년부터 이어온 부산 수영구 남천동의 전통 떡집. 국내산 쌀과 엄선된 재료로 정성껏 만든 백설기, 인절미, 송편, 선물세트, 이바지떡을 제공합니다.",
              foundingDate: "1995",
            }),
          }}
        />
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
