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

export default function HomePage() {
  const { banners, isLoading: bannersLoading, error: bannersError } = useBanners();
  const { items: menuItems, isLoading: menuLoading, error: menuError } = usePopularItems(9);
  const { items: allGiftSets, isLoading: giftsLoading, error: giftsError } = useGiftSets();

  // 홈페이지에는 선물세트 1호, 4호, 송편세트 1호, 2호만 표시
  const featuredGiftNames = ["선물세트 1호", "선물세트 4호", "송편세트 1호", "송편세트 2호"];
  const giftSets = allGiftSets.filter(gift => featuredGiftNames.includes(gift.name));

  const isLoading = bannersLoading || menuLoading || giftsLoading;
  const error = bannersError || menuError || giftsError;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return (
      <ErrorContainer>
        <h2>데이터를 불러오는데 실패했습니다</h2>
        <p>{error.message}</p>
      </ErrorContainer>
    );
  }

  return (
    <>
      <HeroBanner banners={banners} />
      <FeaturedMenu menuItems={menuItems} />
      <GiftSets giftSets={giftSets} />
      <VideoSection />
      <SNSSection />
      <LocationSection />
    </>
  );
}
