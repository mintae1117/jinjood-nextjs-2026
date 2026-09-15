import type { Metadata } from "next";
import { getReciprocateItemServer } from "@/services/products.server";
import { getStorageUrl } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // page.tsx와 같은 cache()된 조회를 써서 요청당 DB 왕복을 1회로 합친다
  const data = await getReciprocateItemServer(id);

  if (!data) {
    return {
      title: "이바지·답례 상세 | 진주떡집",
      // 없는(또는 숨긴) 상품 URL이 색인되지 않게 한다 — 페이지는 200을 반환하므로 soft 404가 된다
      robots: { index: false, follow: false },
    };
  }

  const title = `${data.name} | 진주떡집`;
  const description = data.description || `진주떡집 ${data.name} - ${data.price?.toLocaleString()}원`;
  const imageUrl = getStorageUrl(data.image_url);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.jinjood.com/reciprocate/${id}`,
      images: [{ url: imageUrl, alt: data.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://www.jinjood.com/reciprocate/${id}`,
    },
  };
}

export default function ReciprocateDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
