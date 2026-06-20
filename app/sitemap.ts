import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.jinjood.com";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/represent`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gifts`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reciprocate`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 동적 상품 페이지
  const dynamicPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();

    // 메뉴 아이템
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id")
      .eq("is_active", true);

    if (menuItems) {
      menuItems.forEach((item) => {
        dynamicPages.push({
          url: `${baseUrl}/represent/${item.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      });
    }

    // 선물세트
    const { data: giftSets } = await supabase
      .from("gift_sets")
      .select("id")
      .eq("is_active", true);

    if (giftSets) {
      giftSets.forEach((item) => {
        dynamicPages.push({
          url: `${baseUrl}/gifts/${item.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      });
    }

    // 이바지/답례
    const { data: reciprocateItems } = await supabase
      .from("reciprocate_items")
      .select("id")
      .eq("is_active", true);

    if (reciprocateItems) {
      reciprocateItems.forEach((item) => {
        dynamicPages.push({
          url: `${baseUrl}/reciprocate/${item.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error("Sitemap: 상품 데이터 조회 실패", error);
  }

  return [...staticPages, ...dynamicPages];
}
