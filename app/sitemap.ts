import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

/**
 * 사이트맵은 공개 상품 목록(is_active = true)만 필요하고 로그인 세션과 무관하다.
 * cookies()를 쓰는 서버 클라이언트를 쓰면 정적 생성이 불가능해져 매 요청 DB를 때리고,
 * 빌드 로그에도 Dynamic server usage 경고가 남았다. anon 키 클라이언트로 충분하다.
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 한 시간마다 재생성. 정적으로 굳혀 버리면 상품을 추가해도 다음 배포까지 반영되지 않는다.
export const revalidate = 3600;

const baseUrl = "https://www.jinjood.com";

type ProductRow = { id: string; updated_at: string | null };

/** 활성 상품의 id·수정 시각. 실패하면 null — 빈 배열과 구분해야 "상품이 없는 가게"로 오해하지 않는다. */
async function fetchActive(
  table: "menu_items" | "gift_sets" | "reciprocate_items",
  label: string
): Promise<ProductRow[] | null> {
  const { data, error } = await supabase
    .from(table)
    .select("id, updated_at")
    .eq("is_active", true);

  // 실패를 삼키면 상품 URL이 조용히 전부 빠진 사이트맵이 최대 1시간 캐시된다
  if (error) console.error(`Sitemap: ${label} 조회 실패`, error);
  return data ?? null;
}

/**
 * 목록 페이지의 lastmod = 그 목록에 보이는 상품 중 가장 최근 수정 시각.
 * 아는 날짜가 없으면 undefined 를 돌려 <lastmod> 자체를 생략한다.
 * 매 요청 new Date() 를 넣으면 모든 URL 이 늘 "방금 수정됨"이 되고, 구글은 그런 lastmod 를 사이트 단위로 무시한다.
 */
function latestUpdate(...groups: (ProductRow[] | null)[]): Date | undefined {
  let max: number | undefined;
  for (const rows of groups) {
    for (const row of rows ?? []) {
      if (!row.updated_at) continue;
      const t = new Date(row.updated_at).getTime();
      if (!Number.isNaN(t) && (max === undefined || t > max)) max = t;
    }
  }
  return max === undefined ? undefined : new Date(max);
}

function productPages(
  rows: ProductRow[] | null,
  segment: "represent" | "gifts" | "reciprocate"
): MetadataRoute.Sitemap {
  return (rows ?? []).map((item) => ({
    url: `${baseUrl}/${segment}/${item.id}`,
    // 실제 수정 시각을 쓴다 — 모르면 생략. 현재 시각으로 메우면 위 latestUpdate 주석과 같은 문제
    lastModified: item.updated_at ? new Date(item.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let menuItems: ProductRow[] | null = null;
  let giftSets: ProductRow[] | null = null;
  let reciprocateItems: ProductRow[] | null = null;

  try {
    [menuItems, giftSets, reciprocateItems] = await Promise.all([
      fetchActive("menu_items", "메뉴"),
      fetchActive("gift_sets", "선물세트"),
      fetchActive("reciprocate_items", "이바지/답례"),
    ]);
  } catch (error) {
    console.error("Sitemap: 상품 데이터 조회 실패", error);
  }

  // 정적 페이지 — 홈은 대표 메뉴·선물세트 카드를 보여주므로 두 테이블 기준. 약관류·오시는 길은 lastmod 를 알 수 없어 생략
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: latestUpdate(menuItems, giftSets),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/represent`,
      lastModified: latestUpdate(menuItems),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gifts`,
      lastModified: latestUpdate(giftSets),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reciprocate`,
      lastModified: latestUpdate(reciprocateItems),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [
    ...staticPages,
    ...productPages(menuItems, "represent"),
    ...productPages(giftSets, "gifts"),
    ...productPages(reciprocateItems, "reciprocate"),
  ];
}
