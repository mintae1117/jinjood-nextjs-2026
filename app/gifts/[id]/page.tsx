import JsonLd from "@/components/common/JsonLd";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { getActiveProductIdsServer, getGiftSetServer } from "@/services/products.server";
import { getStorageUrl } from "@/lib/supabase";
import GiftSetDetailClient from "./GiftSetDetailClient";

// 미리 만들어 두고 1시간마다 다시 만든다. 관리자 수정은 /api/revalidate 가 바로 반영한다.
export const revalidate = 3600;

// 활성 상품은 빌드 때 만들어 둔다. 목록에 없는 id(새 상품·없는 주소)는 첫 요청 때 만들어 캐시한다.
export function generateStaticParams() {
  return getActiveProductIdsServer("gift_sets");
}

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * 서버 컴포넌트다. 상품을 서버에서 미리 조회해 클라이언트 컴포넌트에 넘기고,
 * 구조화 데이터(빵부스러기·상품)를 첫 HTML에 실어 준다.
 * 조회는 같은 layout의 generateMetadata와 react cache()로 합쳐져 요청당 1회만 나간다.
 */
export default async function GiftSetDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await getGiftSetServer(id);

  return (
    <>
      {/* 없는 상품(soft 404)에 빵부스러기를 붙이면 존재하지 않는 URL이 목록 페이지인 척하게 된다 */}
      {item && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "선물 & 세트", path: "/gifts" },
            { name: item.name },
          ])}
        />
      )}
      {item && (
        <JsonLd
          data={productJsonLd({
            name: item.name,
            description: item.description,
            image: getStorageUrl(item.image_url),
            path: `/gifts/${id}`,
            price: item.price,
          })}
        />
      )}
      <GiftSetDetailClient id={id} initialItem={item} />
    </>
  );
}
