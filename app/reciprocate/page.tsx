import JsonLd from "@/components/common/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getReciprocateItemsServer } from "@/services/products.server";
import ReciprocateListClient from "./ReciprocateListClient";

/**
 * 서버 컴포넌트. 목록을 서버에서 조회해 첫 HTML에 상품명·가격·상세 링크를 싣는다.
 * 이게 없으면 크롤러가 받는 것은 "불러오는 중..." 한 줄뿐이고,
 * 목록에서 상세로 이어지는 크롤 경로가 통째로 사라진다.
 */
export default async function ReciprocateListPage() {
  const items = await getReciprocateItemsServer();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "이바지 & 답례" }])} />
      <ReciprocateListClient initialItems={items} />
    </>
  );
}
