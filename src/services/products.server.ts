import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { GiftSet, MenuItem, ReciprocateItem } from "@/types";

/**
 * 서버 전용 상품 조회 (상세 페이지 SSR + generateMetadata)
 *
 * 왜 필요한가: 상세 페이지의 데이터는 useEffect로 받아오기 때문에 서버 렌더 HTML에
 * 상품명(h1)·설명·가격이 하나도 실리지 않았다. 크롤러가 받는 본문이 헤더·푸터뿐이라
 * 검색엔진이 순위를 매길 근거가 없다. 여기서 서버가 미리 조회해 첫 HTML에 실어 준다.
 *
 * react의 cache()로 감싼 이유: 같은 요청 안에서 layout(generateMetadata)과 page가
 * 각각 같은 상품을 조회하면 DB 왕복이 2회가 된다. cache()가 요청 단위로 합쳐 1회로 만든다.
 *
 * is_active = true로 거르는 것은 의도적이다. 숨긴 상품은 크롤러·일반 손님에게 보이면 안 된다.
 * 관리자가 숨긴 상품의 상세를 열면 여기서는 null이 오고, 클라이언트 훅이
 * includeInactive로 다시 조회해 찾아낸다.
 */

export const getMenuItemServer = cache(
  async (id: string): Promise<MenuItem | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();
    return (data as MenuItem) ?? null;
  }
);

export const getGiftSetServer = cache(
  async (id: string): Promise<GiftSet | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gift_sets")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();
    return (data as GiftSet) ?? null;
  }
);

export const getReciprocateItemServer = cache(
  async (id: string): Promise<ReciprocateItem | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reciprocate_items")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();
    return (data as ReciprocateItem) ?? null;
  }
);
