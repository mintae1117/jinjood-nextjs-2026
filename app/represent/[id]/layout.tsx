import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("menu_items")
    .select("name, description, image_url, price")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!data) {
    return { title: "메뉴 상세 | 진주떡집" };
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
      url: `https://www.jinjood.com/represent/${id}`,
      images: [{ url: imageUrl, alt: data.name }],
    },
    alternates: {
      canonical: `https://www.jinjood.com/represent/${id}`,
    },
  };
}

export default function RepresentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
