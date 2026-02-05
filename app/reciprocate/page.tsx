"use client";

import { useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/common/PageHeader";
import MenuFilter from "@/components/menu/MenuFilter";
import { useReciprocateItems } from "@/hooks";
import { ReciprocateCategory } from "@/types";
import { getStorageUrl } from "@/lib/supabase";

const Section = styled.section`
  padding: 4rem 0;
  background-color: #ffffff;

  @media (max-width: 768px) {
    padding: 2.5rem 0;
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const InfoBanner = styled.div`
  background: linear-gradient(135deg, #f35525 0%, #ff8c42 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  color: #ffffff;
  text-align: center;

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }

  p {
    font-size: 1rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 0.875rem;
    }
  }
`;

const ReciprocateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ReciprocateCard = styled(motion.div)`
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;

  img {
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  ${ReciprocateCard}:hover & img {
    transform: scale(1.08);
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0) 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem;

  ${ReciprocateCard}:hover & {
    opacity: 1;
  }
`;

const ViewButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  background-color: #ffffff;
  color: #1e1e1e;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f35525;
    color: #ffffff;
  }
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.375rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #f35525;
  border-radius: 20px;
  z-index: 10;
`;

const CardContent = styled.div`
  padding: 1.25rem;
`;

const ReciprocateName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e1e1e;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ReciprocateDescription = styled.p`
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.625rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const Price = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
  color: #f35525;
`;

const InquiryButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #f35525;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #d94820;
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #666666;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1e1e1e;
  }

  p {
    font-size: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #666666;
  font-size: 1rem;
`;

const ErrorContainer = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #ef4444;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    color: #666666;
  }
`;

const filterOptions = [
  { value: "all", label: "모든 메뉴" },
  { value: "ibaji", label: "이바지" },
  { value: "daprye", label: "답례" },
];

const categoryLabels: Record<string, string> = {
  ibaji: "이바지",
  daprye: "답례",
};

export default function ReciprocatePage() {
  const [activeFilter, setActiveFilter] = useState<ReciprocateCategory>("all");
  const { items, isLoading, error } = useReciprocateItems(activeFilter === "all" ? undefined : activeFilter);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <>
      <PageHeader
        title="이바지 & 답례"
        description="특별한 날을 더욱 의미있게 만드는 전통 이바지떡과 답례떡을 준비했습니다."
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "이바지 & 답례" }]}
      />

      <Section>
        <Container>
          <InfoBanner>
            <h3>맞춤 주문 안내</h3>
            <p>
              이바지떡과 답례떡은 행사 규모와 예산에 맞춰 맞춤 구성이
              가능합니다. 자세한 상담은 전화(051-621-5108)로 문의해 주세요.
            </p>
          </InfoBanner>

          <MenuFilter
            filters={filterOptions}
            activeFilter={activeFilter}
            onFilterChange={(filter) =>
              setActiveFilter(filter as ReciprocateCategory)
            }
          />

          {isLoading ? (
            <LoadingContainer>상품을 불러오는 중...</LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <h3>오류가 발생했습니다</h3>
              <p>{error.message}</p>
            </ErrorContainer>
          ) : (
            <ReciprocateGrid>
              <AnimatePresence mode="wait">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <ReciprocateCard
                      key={item.id}
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: "-50px" }}
                      custom={index}
                    >
                      <ImageWrapper>
                        <Image
                          src={getStorageUrl(item.image_url)}
                          alt={item.name}
                          fill
                          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized
                        />
                        <CategoryBadge>
                          {categoryLabels[item.category]}
                        </CategoryBadge>
                        <Overlay>
                          <ViewButton href={`/reciprocate/${item.id}`}>
                            자세히 보기
                          </ViewButton>
                        </Overlay>
                      </ImageWrapper>
                      <CardContent>
                        <ReciprocateName>{item.name}</ReciprocateName>
                        <ReciprocateDescription>
                          {item.description}
                        </ReciprocateDescription>
                        <PriceRow>
                          <Price>{formatPrice(item.price)}원~</Price>
                        </PriceRow>
                        <InquiryButton href="/contact">
                          문의하기
                        </InquiryButton>
                      </CardContent>
                    </ReciprocateCard>
                  ))
                ) : (
                  <EmptyState>
                    <h3>상품이 없습니다</h3>
                    <p>선택한 카테고리에 해당하는 상품이 없습니다.</p>
                  </EmptyState>
                )}
              </AnimatePresence>
            </ReciprocateGrid>
          )}
        </Container>
      </Section>
    </>
  );
}
