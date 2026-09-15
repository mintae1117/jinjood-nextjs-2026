"use client";

import styled from "styled-components";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedMenu from "@/components/home/FeaturedMenu";
import GiftSets from "@/components/home/GiftSets";
import VideoSection from "@/components/home/VideoSection";
import SNSSection from "@/components/home/SNSSection";
import LocationSection from "@/components/home/LocationSection";
import { Loading } from "@/components/common/Loading";
import { useBanners, usePopularItems, useGiftSets } from "@/hooks";
import type { Banner, GiftSet, MenuItem } from "@/types";

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e1e1e;
    margin-bottom: 1rem;
  }

  p {
    color: #666666;
    font-size: 1rem;
  }
`;

interface HomeClientProps {
  /** 서버가 미리 조회한 값들. 첫 렌더에 배너 헤드라인(h1)과 상품이 실리게 하는 용도 */
  initialBanners: Banner[];
  initialMenuItems: MenuItem[];
  initialGiftSets: GiftSet[];
}

export default function HomeClient({
  initialBanners,
  initialMenuItems,
  initialGiftSets,
}: HomeClientProps) {
  const { banners, isLoading: bannersLoading, error: bannersError } = useBanners(initialBanners);
  const { items: menuItems, isLoading: menuLoading, error: menuError, refetch: refetchMenu } = usePopularItems(9, initialMenuItems);
  const { items: allGiftSets, isLoading: giftsLoading, error: giftsError, refetch: refetchGifts } = useGiftSets(undefined, initialGiftSets);

  // 홈페이지에는 선물세트 1호, 4호, 송편세트 1호, 2호만 표시
  const featuredGiftNames = ["선물세트 1호", "선물세트 4호", "송편세트 1호", "송편세트 2호"];
  const giftSets = allGiftSets.filter(gift => featuredGiftNames.includes(gift.name));

  const isLoading = bannersLoading || menuLoading || giftsLoading;
  const error = bannersError || menuError || giftsError;

  // 배너·메뉴·선물세트만 데이터에 의존한다. 나머지 섹션은 로딩/에러와 무관하게 항상 렌더해
  // 서버 렌더 HTML에 본문이 남게 한다(useEffect는 서버에서 돌지 않으므로, 예전처럼 페이지
  // 전체를 로딩으로 감싸면 크롤러가 받는 HTML이 헤더·푸터만 남는다).
  return (
    <>
      {isLoading ? (
        <Loading fullScreen />
      ) : error ? (
        <ErrorContainer>
          <h2>데이터를 불러오는데 실패했습니다</h2>
          <p>{error.message}</p>
        </ErrorContainer>
      ) : (
        <>
          <HeroBanner banners={banners} />
          <FeaturedMenu menuItems={menuItems} onSaved={refetchMenu} />
          <GiftSets giftSets={giftSets} onSaved={refetchGifts} />
        </>
      )}
      <VideoSection />
      <SNSSection />
      <LocationSection />
    </>
  );
}
