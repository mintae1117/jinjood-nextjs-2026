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
    .from("reciprocate_items")
    .select("name, description, image_url, price")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!data) {
    return { title: "이바지·답례 상세 | 진주떡집" };
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
      url: `https://jinjood.com/reciprocate/${id}`,
      images: [{ url: imageUrl, alt: data.name }],
    },
    alternates: {
      canonical: `https://jinjood.com/reciprocate/${id}`,
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
