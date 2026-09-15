import {
  getBannersServer,
  getGiftSetsServer,
  getPopularItemsServer,
} from "@/services/products.server";
import HomeClient from "@/components/home/HomeClient";

/**
 * 서버 컴포넌트. 배너·대표메뉴·선물세트를 서버에서 조회해 넘긴다.
 *
 * 이게 없으면 서버 렌더 시점에 세 훅이 모두 로딩 상태라 페이지 전체가 스피너로 대체되고,
 * 크롤러가 받는 홈에는 h1도 상품명도 남지 않는다(예전 618자 문제).
 * 보이는 화면은 로딩이 끝난 뒤와 같다 — 로딩 분기가 서버에서 false가 될 뿐이다.
 */
export default async function HomePage() {
  const [banners, menuItems, giftSets] = await Promise.all([
    getBannersServer(),
    getPopularItemsServer(9),
    getGiftSetsServer(),
  ]);

  return (
    <HomeClient
      initialBanners={banners}
      initialMenuItems={menuItems}
      initialGiftSets={giftSets}
    />
  );
}
