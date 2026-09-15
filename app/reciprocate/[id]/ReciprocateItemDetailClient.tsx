"use client";

import { useReciprocateItem } from "@/hooks";
import type { ReciprocateItem } from "@/types";
import ProductDetailShell from "@/components/product/ProductDetailShell";

interface ReciprocateItemDetailClientProps {
  id: string;
  /** 서버가 미리 조회한 상품. 첫 렌더에 본문이 실리게 하는 용도 */
  initialItem: ReciprocateItem | null;
}

export default function ReciprocateItemDetailClient({ id, initialItem }: ReciprocateItemDetailClientProps) {
  // error는 일부러 받지 않는다 — 서버가 준 상품이 있는데 재조회가 실패했다고
  // 멀쩡한 화면을 에러로 갈아엎으면 안 된다. 화면 분기는 item 유무로만 한다.
  const { item, isLoading, refetch } = useReciprocateItem(id, initialItem);

  return (
    <ProductDetailShell
      item={item}
      isLoading={isLoading}
      onSaved={refetch}
      productType="reciprocate_item"
      backLink="/reciprocate"
      backLabel="이바지/답례 목록"
      notFoundMessage="요청하신 이바지/답례 상품이 존재하지 않거나 현재 판매 중이 아닙니다."
      notFoundLinkLabel="이바지/답례 목록으로 돌아가기"
    />
  );
}
