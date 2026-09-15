import JsonLd from "@/components/common/JsonLd";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { getGiftSetServer } from "@/services/products.server";
import { getStorageUrl } from "@/lib/supabase";
import GiftSetDetailClient from "./GiftSetDetailClient";

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
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "선물 & 세트", path: "/gifts" },
          ...(item ? [{ name: item.name }] : []),
        ])}
      />
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
